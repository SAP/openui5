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
		'jquery.sap.global',
		'sap/ui/model/BindingMode', 'sap/ui/model/Context', 'sap/ui/model/Model',
		'sap/ui/model/odata/v2/ODataAnnotations', 'sap/ui/model/odata/ODataUtils', 'sap/ui/model/odata/CountMode', 'sap/ui/model/odata/UpdateMethod', 'sap/ui/model/odata/OperationMode',
		'./ODataContextBinding', './ODataListBinding', 'sap/ui/model/odata/ODataMetadata', 'sap/ui/model/odata/ODataPropertyBinding', './ODataTreeBinding', 'sap/ui/model/odata/ODataMetaModel', 'sap/ui/core/message/MessageParser', 'sap/ui/model/odata/ODataMessageParser', 'sap/ui/thirdparty/datajs'
	], function(
		jQuery,
		BindingMode, Context, Model,
		ODataAnnotations, ODataUtils, CountMode, UpdateMethod, OperationMode,
		ODataContextBinding, ODataListBinding, ODataMetadata, ODataPropertyBinding, ODataTreeBinding, ODataMetaModel, MessageParser, ODataMessageParser, OData) {

	"use strict";


	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {string} [sServiceUrl] base uri of the service to request data from; additional URL parameters appended here will be appended to every request
	 * 								can be passed with the mParameters object as well: [mParameters.serviceUrl] A serviceURl is required!
	 * @param {object} [mParameters] (optional) a map which contains the following parameter properties:
	 * @param {boolean} [mParameters.json] if set true request payloads will be JSON, XML for false (default = true),
	 * @param {string} [mParameters.user] user for the service,
	 * @param {string} [mParameters.password] password for service,
	 * @param {map} [mParameters.headers] a map of custom headers like {"myHeader":"myHeaderValue",...},
	 * @param {boolean} [mParameters.tokenHandling] enable/disable XCSRF-Token handling (default = true),
	 * @param {boolean} [mParameters.withCredentials] experimental - true when user credentials are to be included in a cross-origin request. Please note that this works only if all requests are asynchronous.
	 * @param [mParameters.maxDataServiceVersion] (default = '2.0') please use the following string format e.g. '2.0' or '3.0'.
	 * 									OData version supported by the ODataModel: '2.0',
	 * @param {boolean} [mParameters.useBatch] when true all requests will be sent in batch requests (default = true),
	 * @param {boolean} [mParameters.refreshAfterChange] enable/disable automatic refresh after change operations: default = true,
	 * @param  {string|string[]} [mParameters.annotationURI] The URL (or an array of URLs) from which the annotation metadata should be loaded,
	 * @param {boolean} [mParameters.loadAnnotationsJoined] Whether or not to fire the metadataLoaded-event only after annotations have been loaded as well,
	 * @param {map} [mParameters.serviceUrlParams] map of URL parameters - these parameters will be attached to all requests,
	 * @param {map} [mParameters.metadataUrlParams] map of URL parameters for metadata requests - only attached to $metadata request.
	 * @param {string} [mParameters.defaultBindingMode] sets the default binding mode for the model. If not set, sap.ui.model.BindingMode.OneWay is used.
	 * @param {string} [mParameters.defaultCountMode] sets the default count mode for the model. If not set, sap.ui.model.odata.CountMode.Request is used.
	 * @param {string} [mParameters.defaultOperationMode] sets the default operation mode for the model. If not set, sap.ui.model.odata.OperationMode.Server is used.
	 * @param {string} [mParameters.defaultUpdateMethod] sets the default update method which is used for all update requests. If not set, sap.ui.model.odata.UpdateMethod.Merge is used.
	 * @param {map} [mParameters.metadataNamespaces] a map of namespaces (name => URI) used for parsing the service metadata.
	 * @param {boolean} [mParameters.skipMetadataAnnotationParsing] Whether to skip the automated loading of annotations from the metadata document. Loading annotations from metadata does not have any effects (except the lost performance by invoking the parser) if there are not annotations inside the metadata document
	 * @param {boolean} [mParameters.disableHeadRequestForToken=false] Set this flag to true if your service does not support HEAD requests for fetching the service document (and thus the CSRF-token) to avoid sending a HEAD-request before falling back to GET
	 * @param {boolean} [mParameters.sequentializeRequests=false] Whether to sequentialize all requests, needed in case the service cannot handle parallel requests
	 * @param {boolean} [mParameters.disableSoftStateHeader=false] Set this flag to true if don´t want to start a new soft state session with context id (SID) through header mechanism. This useful if you want to share a SID between different browser windows.
	 	 *
	 * @class
	 * Model implementation for oData format
	 *
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataModel
	 * @extends sap.ui.model.Model
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v2.ODataModel", /** @lends sap.ui.model.odata.v2.ODataModel.prototype */ {

		constructor : function(sServiceUrl, mParameters) {
			Model.apply(this, arguments);

			var sUser, sPassword,
			mHeaders, bTokenHandling,
			bWithCredentials, sMaxDataServiceVersion,
			bUseBatch, bRefreshAfterChange, sAnnotationURI, bLoadAnnotationsJoined,
			sDefaultCountMode, sDefaultBindingMode, sDefaultOperationMode, mMetadataNamespaces,
			mServiceUrlParams, mMetadataUrlParams, aMetadataUrlParams, bJSON, oMessageParser,
			bSkipMetadataAnnotationParsing, sDefaultUpdateMethod, bDisableHeadRequestForToken,
			bSequentializeRequests, bDisableSoftStateHeader, that = this;

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
			}
			this.mSupportedBindingModes = {"OneWay": true, "OneTime": true, "TwoWay":true};
			this.sDefaultBindingMode = sDefaultBindingMode || BindingMode.OneWay;

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
			this.sDefaultOperationMode = sDefaultOperationMode || OperationMode.Server;
			this.sMetadataLoadEvent = null;
			this.oMetadataFailedEvent = null;
			this.sRefreshGroupId = undefined;
			this.bIncludeInCurrentBatch = false;
			this.bSkipMetadataAnnotationParsing = !!bSkipMetadataAnnotationParsing;
			this.bDisableHeadRequestForToken = !!bDisableHeadRequestForToken;
			this.bSequentializeRequests = !!bSequentializeRequests;
			this.bDisableSoftStateHeader = !!bDisableSoftStateHeader;

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
			// Get/create service specific data container
			aMetadataUrlParams = ODataUtils._createUrlParamsArray(mMetadataUrlParams);
			var sMetadataUrl = this._createRequestUrl("/$metadata", undefined, aMetadataUrlParams);
			this.oServiceData = ODataModel.mServiceData[sMetadataUrl];
			if (!this.oServiceData) {
				ODataModel.mServiceData[sMetadataUrl] = {};
				this.oServiceData = ODataModel.mServiceData[sMetadataUrl];
			}

			if (!this.oServiceData.oMetadata || this.oServiceData.oMetadata.bFailed) {
				//create Metadata object
				this.oMetadata = new ODataMetadata(sMetadataUrl,{
					async: true,
					user: this.sUser,
					password: this.sPassword,
					headers: this.mCustomHeaders,
					namespaces: mMetadataNamespaces,
					withCredentials: this.bWithCredentials
				});
				this.oServiceData.oMetadata = this.oMetadata;
			} else {
				this.oMetadata = this.oServiceData.oMetadata;
			}

			this.oAnnotations = new ODataAnnotations(this.oMetadata, {
				source: this.sAnnotationURI,
				skipMetadata: this.bSkipMetadataAnnotationParsing,
				headers: this.mCustomHeaders,
				combineEvents: true
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

			this.oMetadata.loaded().then(this._initializeMetadata.bind(this));
			if (!this.oMetadata.isLoaded()) {
				this.oMetadata.attachFailed(this.onMetadataFailed);
			}


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

			// Get CSRF token, if already available
			if (this.bTokenHandling && this.oServiceData.securityToken) {
				this.oHeaders["x-csrf-token"] = this.oServiceData.securityToken;
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
			                 "hasPendingChanges", "refresh", "refreshMetadata", "resetChanges", "setDefaultCountMode",
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
	 * The 'metadataLoaded' event is fired, when the metadata document was successfully loaded.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#metadataLoaded
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {string} oControlEvent.getParameters.metadata The parsed metadata
	 * @public
	 */

	/**
	 * The 'metadataFailed' event is fired, when the metadata document has failed to load.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#metadataFailed
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {string} oControlEvent.getParameters.metadata The parsed metadata
	 * @param {string} oControlEvent.getParameters.message A text that describes the failure.
	 * @param {string} oControlEvent.getParameters.statusCode HTTP status code returned by the request (if available)
	 * @param {string} oControlEvent.getParameters.statusText The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} oControlEvent.getParameters.responseText Response that has been received for the request, as a text string
	 * @param {object} oControlEvent.getParameters.response The response object - empty object if no response
	 * @public
	 */

	/**
	 * The 'annotationsLoaded' event is fired, when the annotations document was successfully loaded.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#annotationsLoaded
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {sap.ui.model.odata.v2.ODataAnnotations~Source[]} oControlEvent.getParameters.result One or several annotation source(s)
	 * @public
	 */

	/**
	 * The 'annotationsFailed' event is fired, when the annotations document was successfully loaded.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#annotationsFailed
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {Error[]} oControlEvent.getParameters.result An array of Errors
	 * @public
	 */

	// document event again, as parameters differ from sap.ui.model.Model#event:requestFailed
	/**
	 * The 'requestFailed' event is fired, when data retrieval from a backend failed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#requestFailed
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {string} oControlEvent.getParameters.ID The request ID
	 * @param {string} oControlEvent.getParameters.url The url which is sent to the backend
	 * @param {string} oControlEvent.getParameters.method The HTTP method
	 * @param {map} oControlEvent.getParameters.headers The request headers
	 * @param {boolean} oControlEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} oControlEvent.getParameters.success Request was successful or not
	 * @param {object} oControlEvent.getParameters.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @public
	 */

	// document event again, as parameters differ from sap.ui.model.Model#event:requestSent
	/**
	 * The 'requestSent' event is fired, after a request has been sent to a backend.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#requestSent
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.ID The request ID
	 * @param {string} oControlEvent.getParameters.url The url which is sent to the backend
	 * @param {string} oControlEvent.getParameters.method The HTTP method
	 * @param {map} oControlEvent.getParameters.headers The request headers
	 * @param {boolean} oControlEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 *
	 * @public
	 */

	// document event again, as parameters differ from sap.ui.model.Model#event:requestCompleted
	/**
	 * The 'requestCompleted' event is fired, after a request has been completed (includes receiving a response),
	 * no matter whether the request succeeded or not.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#requestCompleted
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.ID The request ID
	 * @param {string} oControlEvent.getParameters.url The url which is sent to the backend
	 * @param {string} oControlEvent.getParameters.method The HTTP method
	 * @param {map} oControlEvent.getParameters.headers The request headers
	 * @param {boolean} oControlEvent.getParameters.success Request was successful or not
	 * @param {boolean} oControlEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {object} oControlEvent.getParameters.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @public
	 */


	/**
	 * The 'batchRequestFailed' event is fired, when a batch request failed.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#batchRequestFailed
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters

	 * @param {string} oControlEvent.getParameters.ID The request ID
	 * @param {string} oControlEvent.getParameters.url The url which is sent to the backend
	 * @param {string} oControlEvent.getParameters.method The HTTP method
	 * @param {map} oControlEvent.getParameters.headers The request headers
	 * @param {boolean} oControlEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} oControlEvent.getParameters.success Request was successful or not
	 * @param {object} oControlEvent.getParameters.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @param {array} oControlEvent.getParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @public
	 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'batchRequestFailed' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.<br/>
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, this Model is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachBatchRequestFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("batchRequestFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'batchRequestFailed' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.<br/>
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachBatchRequestFailed = function(fnFunction, oListener) {
		this.detachEvent("batchRequestFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event batchRequestFailed to attached listeners.
	 *
	 * @param {object} mArguments the arguments to pass along with the event.
	 * @param {string} mArguments.ID The request ID
	 * @param {string} mArguments.url The url which is sent to the backend
	 * @param {string} mArguments.method The HTTP method
	 * @param {map} mArguments.headers The request headers
	 * @param {boolean} mArguments.async If the request is synchronous or asynchronous (if available)
	 * @param {boolean} mArguments.success Request was successful or not
	 * @param {object} mArguments.response The response object - empty object if no response
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @param {array} mArguments.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireBatchRequestFailed = function(mArguments) {
		this.fireEvent("batchRequestFailed", mArguments);
		return this;
	};


	/**
	 * The 'batchRequestSent' event is fired, after a request has been sent to a backend.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#batchRequestSent
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.url The url which is sent to the backend
	 * @param {string} [oControlEvent.getParameters.type] The type of the request (if available)
	 * @param {boolean} [oControlEvent.getParameters.async] If the request is synchronous or asynchronous (if available)
	 * @param {array} oControlEvent.getParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers
	 * @public
	 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'requestSent' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachBatchRequestSent = function(oData, fnFunction, oListener) {
		this.attachEvent("batchRequestSent", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'batchRequestSent' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachBatchRequestSent = function(fnFunction, oListener) {
		this.detachEvent("batchRequestSent", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event batchRequestSent to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {string} [mArguments.url] The url which is sent to the backend.
	 * @param {string} [mArguments.type] The type of the request (if available)
	 * @param {boolean} [mArguments.async] If the request is synchronous or asynchronous (if available)
	 * @param {array} mArguments.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireBatchRequestSent = function(mArguments) {
		this.fireEvent("batchRequestSent", mArguments);
		return this;
	};

	/**
	 * The 'batchRequestCompleted' event is fired, after a request has been completed (includes receiving a response),
	 * no matter whether the request succeeded or not.
	 *
	 * @name sap.ui.model.odata.v2.ODataModel#batchRequestCompleted
	 * @event
	 * @param {sap.ui.base.Event} oControlEvent
	 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
	 * @param {object} oControlEvent.getParameters
	 * @param {string} oControlEvent.getParameters.ID The request ID
	 * @param {string} oControlEvent.getParameters.url The url which is sent to the backend
	 * @param {string} oControlEvent.getParameters.method The HTTP method
	 * @param {map} oControlEvent.getParameters.headers The request headers
	 * @param {boolean} oControlEvent.getParameters.success Request was successful or not
	 * @param {boolean} oControlEvent.getParameters.async If the request is synchronous or asynchronous (if available)
	 * @param {array} oControlEvent.getParameters.requests Array of embedded requests ($batch)
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @param {object} oControlEvent.getParameters.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 * @public
	 */

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'batchRequestCompleted' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachBatchRequestCompleted = function(oData, fnFunction, oListener) {
		this.attachEvent("batchRequestCompleted", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'batchRequestCompleted' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachBatchRequestCompleted = function(fnFunction, oListener) {
		this.detachEvent("batchRequestCompleted", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event batchRequestCompleted to attached listeners.
	 *
	 * @param {object} mArguments parameters to add to the fired event
	 * @param {string} mArguments.ID The request ID
	 * @param {string} mArguments.url The url which is sent to the backend
	 * @param {string} mArguments.method The HTTP method
	 * @param {map} mArguments.headers The request headers
	 * @param {boolean} mArguments.success Request was successful or not
	 * @param {boolean} mArguments.async If the request is synchronous or asynchronous (if available)
	 * @param {array} mArguments.requests Array of embedded requests ($batch) - empty array for non batch requests.
	 * Each request object within the array contains the following properties: url, method, headers, response object
	 * @param {object} mArguments.response The response object - empty object if no response:
	 * The response object contains the following properties: message, success, headers, statusCode, statusText, responseText
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireBatchRequestCompleted = function(mArguments) {
		this.fireEvent("batchRequestCompleted", mArguments);
		return this;
	};

	// Keep a map of service specific data, which can be shared across different model instances
	// on the same OData service
	ODataModel.mServiceData = {
	};

	/**
	 * @param {boolean} bDelayEvent metadataLoaded event will be fired asynchronous
	 * @private
	 */
	ODataModel.prototype._initializeMetadata = function() {
		if (this.bDestroyed) {
			// Don't fire any events for resolving promises on Models that have already been destroyed
			return;
		}

		var fnFire = function() {
			this.fireMetadataLoaded({
				metadata: this.oMetadata
			});
			jQuery.sap.log.debug(this + " - metadataloaded fired");
		}.bind(this);


		this.initialize();
		if (this.bLoadAnnotationsJoined) {
			this.oAnnotations.loaded().then(fnFire, this.fireMetadataFailed.bind(this));
		} else {
			fnFire();
		}
	};



	/**
	 * Refreshes the metadata for model, e.g. in case the request for metadata has failed.
	 * Returns a new promise which can be resolved or rejected depending on the metadata loading state.
	 *
	 * @returns {Promise} returns a promise on metadata loaded state or null if metadata is not initialized or currently refreshed.
	 *
	 * @public
	 */
	ODataModel.prototype.refreshMetadata = function(){
		if (this.oMetadata && this.oMetadata.refresh){
			return this.oMetadata.refresh();
		}
	};


	/**
	 * Fire event annotationsLoaded to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {sap.ui.model.odata.v2.ODataAnnotations} [mArguments.annotations]  the annotations object.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireAnnotationsLoaded = function(mArguments) {
		this.fireEvent("annotationsLoaded", mArguments);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'annotationsLoaded' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 * @experimental The API is NOT stable yet. Use at your own risk.
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachAnnotationsLoaded = function(oData, fnFunction, oListener) {
		this.attachEvent("annotationsLoaded", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'annotationsLoaded' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 * @experimental The API is NOT stable yet. Use at your own risk.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachAnnotationsLoaded = function(fnFunction, oListener) {
		this.detachEvent("annotationsLoaded", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event annotationsFailed to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {string} [mArguments.message]  A text that describes the failure.
	 * @param {string} [mArguments.statusCode]  HTTP status code returned by the request (if available)
	 * @param {string} [mArguments.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [mArguments.responseText] Response that has been received for the request ,as a text string
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireAnnotationsFailed = function(mArguments) {
		this.fireEvent("annotationsFailed", mArguments);
		jQuery.sap.log.debug(this + " - annotationsfailed fired");
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'annotationsFailed' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachAnnotationsFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("annotationsFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'annotationsFailed' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachAnnotationsFailed = function(fnFunction, oListener) {
		this.detachEvent("annotationsFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event metadataLoaded to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {sap.ui.model.odata.ODataMetadata} [mArguments.metadata]  the metadata object.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireMetadataLoaded = function(mArguments) {
		this.fireEvent("metadataLoaded", mArguments);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'metadataLoaded' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachMetadataLoaded = function(oData, fnFunction, oListener) {
		this.attachEvent("metadataLoaded", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'metadataLoaded' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachMetadataLoaded = function(fnFunction, oListener) {
		this.detachEvent("metadataLoaded", fnFunction, oListener);
		return this;
	};

	/**
	 * Fire event metadataFailed to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {string} [mArguments.message]  A text that describes the failure.
	 * @param {string} [mArguments.statusCode]  HTTP status code returned by the request (if available)
	 * @param {string} [mArguments.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [mArguments.responseText] Response that has been received for the request ,as a text string
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataModel.prototype.fireMetadataFailed = function(mArguments) {
		this.fireEvent("metadataFailed", mArguments);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'metadataFailed' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.attachMetadataFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("metadataFailed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'metadataFailed' event of this <code>sap.ui.model.odata.v2.ODataModel</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.v2.ODataModel} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataModel.prototype.detachMetadataFailed = function(fnFunction, oListener) {
		this.detachEvent("metadataFailed", fnFunction, oListener);
		return this;
	};

	/**
	 * creates the EventInfo Object for request sent/completed/failed
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
				if (jQuery.isArray(aBatchRequests[i])) {
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
	 * create a request ID
	 *
	 * @returns {string} sRequestID A request ID
	 * @private
	 */
	ODataModel.prototype._createRequestID = function () {
		var sRequestID;

		sRequestID = jQuery.sap.uid();
		return sRequestID;
	};

	/**
	 * creates a request url
	 * @param {string} sPath binding path
	 * @param {object} [oContext] bindingContext
	 * @param {array} [aUrlParams] url parameters
	 * @param {boolean} [bBatch] for requests nested in a batch relative uri will be created
	 * @returns {string} sUrl request url
	 * @private
	 */
	ODataModel.prototype._createRequestUrl = function(sPath, oContext, aUrlParams, bBatch) {

		// create the url for the service
		var sNormalizedPath,
			aAllUrlParameters = [],
			sUrl = "";

		sNormalizedPath = this._normalizePath(sPath, oContext);

		if (!bBatch) {
			sUrl = this.sServiceUrl + sNormalizedPath;
		} else {
			sUrl = sNormalizedPath.substr(sNormalizedPath.indexOf('/') + 1);
		}

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
	 * Imports the data to the internal storage.
	 * Nested entries are processed recursively, moved to the canonic location and referenced from the parent entry.
	 * keys are collected in a map for updating bindings
	 *
	 * @param {object} oData data that should be imported
	 * @param {map} mChangedEntities map of changed entities
	 * @return {map} mChangedEntities
	 * @private
	 */
	ODataModel.prototype._importData = function(oData, mChangedEntities) {
		var that = this,
		aList, sKey, oResult, oEntry;
		if (oData.results) {
			aList = [];
			jQuery.each(oData.results, function(i, entry) {
				var sKey = that._importData(entry, mChangedEntities);
				if (sKey) {
					aList.push(sKey);
				}
			});
			return aList;
		} else {
			sKey = this._getKey(oData);
			if (!sKey) {
				return sKey;
			}
			oEntry = this._getEntity(sKey);
			if (!oEntry) {
				oEntry = oData;
				this._addEntity(oEntry);
			}
			jQuery.each(oData, function(sName, oProperty) {
				if (oProperty && (oProperty.__metadata && oProperty.__metadata.uri || oProperty.results) && !oProperty.__deferred) {
					oResult = that._importData(oProperty, mChangedEntities);
					if (jQuery.isArray(oResult)) {
						oEntry[sName] = { __list: oResult };
					} else {
						oEntry[sName] = { __ref: oResult };
					}
				} else if (!oProperty || !oProperty.__deferred) { //do not store deferred navprops
					oEntry[sName] = oProperty;
				}
			});
			// if we got new data we have to update changed entities
			var oMap = {};
			oMap[sKey] = oEntry;
			this._updateChangedEntities(oMap);
			mChangedEntities[sKey] = true;
			return sKey;
		}
	};

	/**
	 * Remove references of navigation properties created in importData function
	 *
	 * @param {object} oData entry that contains references
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
			jQuery.each(oData.results, function(i, entry) {
				aList.push(that._removeReferences(entry));
			});
			return aList;
		} else {
			jQuery.each(oData, function(sPropName, oCurrentEntry) {
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
	 * Restore reference entries of navigation properties created in importData function
	 * @param {object} oData entry which references should be restored
	 * @param {object} [mVisitedEntries] map of entries which already have been visited and included
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
				jQuery.sap.assert(oChildEntry, "ODataModel inconsistent: " + sKey + " not found!");
				if (oChildEntry) {
					oChildEntry = jQuery.sap.extend(true, {}, oChildEntry);
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

		jQuery.each(oData, function(sPropName, oCurrentEntry) {
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
					jQuery.each(oCurrentEntry.__list, function(i, sKey) {
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
	 * removes all existing data from the model
	 * @private
	 */
	ODataModel.prototype.removeData = function(){
		this.oData = {};
	};

	/**
	 * Initialize the model.
	 * This will call initialize on all bindings. This is done if metadata is loaded asynchronously.
	 *
	 * @private
	 */
	ODataModel.prototype.initialize = function() {
		// Call initialize on all bindings in case metadata was not available when they were created
		var aBindings = this.aBindings.slice(0);
		jQuery.each(aBindings, function(iIndex, oBinding) {
			oBinding.initialize();
		});
	};

	/**
	 * Refresh the model.
	 * This will check all bindings for updated data and update the controls if data has been changed.
	 *
	 * @param {boolean} [bForceUpdate=false] Force update of controls
	 * @param {boolean} [bRemoveData=false] If set to true then the model data will be removed/cleared.
	 * 					Please note that the data might not be there when calling e.g. getProperty too early before the refresh call returned.
	 * @param {string} [sGroupId] The groupId. Requests belonging to the same groupId will be bundled in one batch request.
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
	 * @param {boolean} [bForceUpdate=false] Force update of controls
	 * @param {string} [sGroupId] The groupId. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {map} mChangedEntities map of changed entities
	 * @param {map} mEntityTypes map of changed entityTypes
	 * @private
	 */
	ODataModel.prototype._refresh = function(bForceUpdate, sGroupId, mChangedEntities, mEntityTypes) {
		// Call refresh on all bindings instead of checkUpdate to properly reset cached data in bindings
		var aBindings = this.aBindings.slice(0);
		//the refresh calls read synchronous; we use this.sRefreshGroupId in this case
		this.sRefreshGroupId = sGroupId;
		jQuery.each(aBindings, function(iIndex, oBinding) {
			oBinding._refresh(bForceUpdate, mChangedEntities, mEntityTypes);
		});
		this.sRefreshGroupId = undefined;
	};

	/**
	 * Private method iterating the registered bindings of this model instance and initiating their check for update
	 *
	 * @param {boolean} bForceUpdate force update of controls
	 * @param {boolean} bAsync asynchronous execution
	 * @param {map} mChangedEntities Map of changed entities
	 * @param {boolean} bMetaModelOnly update metamodel bindings only
	 * @private
	 */
	ODataModel.prototype.checkUpdate = function(bForceUpdate, bAsync, mChangedEntities, bMetaModelOnly) {
		if (bAsync) {
			if (!this.sUpdateTimer) {
				this.sUpdateTimer = jQuery.sap.delayedCall(0, this, function() {
					this.checkUpdate(bForceUpdate, false, mChangedEntities);
				});
			}
			return;
		}
		if (this.sUpdateTimer) {
			jQuery.sap.clearDelayedCall(this.sUpdateTimer);
			this.sUpdateTimer = null;
		}
		var aBindings = this.aBindings.slice(0);
		jQuery.each(aBindings, function(iIndex, oBinding) {
			if (!bMetaModelOnly || this.isMetaModelPath(oBinding.getPath())) {
				oBinding.checkUpdate(bForceUpdate, mChangedEntities);
			}
		}.bind(this));

		this._processAfterUpdate();
	};

	/**
	 * Private method iterating the registered bindings of this model instance and calls their check dataState method
	 *
	 * @param {boolean} bForceUpdate force update of controls
	 * @private
	 */
	ODataModel.prototype.checkDataState = function(mLaunderingState) {
		var aBindings = this.aBindings.slice(0);
		jQuery.each(aBindings, function(iIndex, oBinding) {
			if (oBinding.checkDataState) {
				oBinding.checkDataState(mLaunderingState);
			}
		});
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 * @param {string} sPath binding path
	 * @param {object} [oContext] bindingContext
	 * @param {map} [mParameters] map of parameters
	 * @returns {object} oBinding new bindingObject
	 * @private
	 */
	ODataModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new ODataPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindList
	 * @see sap.ui.model.Model.prototype.bindProperty
	 * @param {string} sPath binding path
	 * @param {object} [oContext] bindingContext
	 * @param {array} aSorters array of sap.ui.model.Sorter
	 * @param {array} aFilters array of sap.ui.model.Filter
	 * @param {map} [mParameters] map of parameters
	 * @returns {object} oBinding new bindingObject
	 * @private
	 */
	ODataModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new ODataListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindTree
	 * @param {string} sPath binding path
	 * @param {object} [oContext] bindingContext
	 * @param {array} aFilters array of sap.ui.model.Filter
	 * @param {map} [mParameters] map of parameters
	 * @param {array} aSorters array of sap.ui.model.Sorter
	 * @returns {object} oBinding new bindingObject
	 * @private
	 */
	ODataModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters, aSorters) {
		var oBinding = new ODataTreeBinding(this, sPath, oContext, aFilters, mParameters, aSorters);
		return oBinding;
	};

	/**
	 * Creates a binding context for the given path
	 * If the data of the context is not yet available, it can not be created, but first the
	 * entity needs to be fetched from the server asynchronously. In case no callback function
	 * is provided, the request will not be triggered.
	 *
	 * @see sap.ui.model.Model.prototype.createBindingContext
	 * @param {string} sPath binding path
	 * @param {object} [oContext] bindingContext
	 * @param {map} [mParameters] a map which contains additional parameters for the binding
	 * @param {string} [mParameters.expand] Standing for OData <code>$expand</code> query option which should be included in the request
	 * @param {string} [mParameters.select] Standing for OData <code>$select</code> query option parameter which should be included in the request
	 * @param {map} [mParameters.custom] an optional map of custom query parameters. Custom parameters must not start with <code>$</code>.
	 * @param {function} [fnCallBack] function called when context is created
	 * @param {boolean} [bReload] reload of data
	 * @return sap.ui.model.Context
	 * @public
	 */
	ODataModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack, bReload) {
		var sResolvedPath = this.resolve(sPath, oContext),
			sCanonicalPath,
			oNewContext,
			sGroupId,
			that = this;

		// optional parameter handling
		if (typeof oContext == "function") {
			bReload = mParameters;
			fnCallBack = oContext;
			mParameters = undefined;
			oContext = undefined;
		}
		if (typeof mParameters == "function") {
			bReload = fnCallBack;
			fnCallBack = mParameters;
			mParameters = undefined;
		}

		// if path cannot be resolved, call the callback function and return null
		if (!sResolvedPath) {
			if (fnCallBack) {
				fnCallBack(null);
			}
			return null;
		}

		// try to resolve path, send a request to the server if data is not available yet
		// if we have set reload=true in mParameters we send the request even if the data is available
		// if reload has explicitely been set to either true or false, we do not need to check again
		if (bReload === undefined) {
			bReload = this._isReloadNeeded(sResolvedPath, mParameters);
		}

		if (!bReload) {
			sCanonicalPath = this.resolve(sPath, oContext, true);
			oNewContext = this.getContext(sCanonicalPath);
			if (fnCallBack) {
				fnCallBack(oNewContext);
			}
			return oNewContext;
		}

		if (fnCallBack) {
			var bIsRelative = !jQuery.sap.startsWith(sPath, "/");
			if (sResolvedPath) {
				var aParams = [],
				sCustomParams = this.createCustomParams(mParameters);
				if (sCustomParams) {
					aParams.push(sCustomParams);
				}
				if (mParameters && (mParameters.batchGroupId || mParameters.groupId)) {
					sGroupId = mParameters.groupId || mParameters.batchGroupId;
				}
				var handleSuccess = function(oData) {
					var sKey = oData ? that._getKey(oData) : null,
						oRef = null,
						sContextPath, oEntity;

					oNewContext = null;

					if (sKey) {
						oNewContext = that.getContext('/' + sKey);
						oRef = {__ref: sKey};
					}
					if (oContext && bIsRelative) {
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
				};
				var handleError = function(oError) {
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
				};
				this.read(sResolvedPath, {groupId: sGroupId, urlParameters: aParams, success: handleSuccess, error: handleError});
			} else {
				fnCallBack(null); // error - notify to recreate contexts
			}
		}
	};

	/**
	 * checks if data based on select, expand parameters is already loaded or not.
	 * In case it couldn't be found we should reload the data so we return true.
	 *
	 * @param {string} sPath the entity path
	 * @param {map} [mParameters] map of parameters
	 * @returns {boolean} bReload reload needed
	 * @private
	 */
	ODataModel.prototype._isReloadNeeded = function(sPath, mParameters) {

		var that = this,
			oMetadata = this.oMetadata,
			oEntityType = this.oMetadata._getEntityTypeByPath(sPath),
			oEntity = this.getObject(sPath),
			aExpand = [], aSelect = [];

		function filterOwn(aEntries) {
			return aEntries.map(function(sEntry) {
				var iSlash = sEntry.indexOf("/");
				return iSlash === -1 ? sEntry : sEntry.substr(0, iSlash);
			}).filter(function(sValue, iIndex, aEntries) {
				return aEntries.indexOf(sValue) === iIndex;
			});
		}

		function filterNav(aEntries, sExpand) {
			var sNavPath = sExpand + "/";
			return aEntries.filter(function(sEntry) {
				return sEntry.indexOf(sNavPath) === 0;
			}).map(function(sEntry) {
				return sEntry.substr(sNavPath.length);
			});
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

			// check select properties
			aOwnSelect = filterOwn(aSelect);
			if (aOwnSelect.length === 0 || aOwnSelect.indexOf("*") >= 0) {
				// If no select options are defined or the star is contained,
				// check all existing properties
				aOwnSelect = oEntityType.property.map(function(oProperty) {
					return oProperty.name;
				});
			}
			for (var i = 0; i < aOwnSelect.length; i++) {
				sSelect = aOwnSelect[i];
				if (!oEntity.hasOwnProperty(sSelect)) {
					return true;
				}
			}

			// check expanded entities
			aOwnExpand = filterOwn(aExpand);
			for (var i = 0; i < aOwnExpand.length; i++) {
				var sExpand = aOwnExpand[i];
				if (!oEntity.hasOwnProperty(sExpand)) {
					return true;
				}
				vNavData = oEntity[sExpand];

				// if nav property is null, no further checks are required
				if (!vNavData) {
					continue;
				}

				// if nav property is deferred, it needs to be loaded
				if (vNavData.__deferred) {
					return true;
				}

				// get entity type and filter expand/select for this expanded entity
				oNavEntityType = oMetadata._getEntityTypeByNavProperty(oEntityType, sExpand);
				aNavSelect = filterNav(aSelect, sExpand);
				aNavExpand = filterNav(aExpand, sExpand);

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
				aSelect = mParameters.select.replace(/\s/g, "").split(',');
			}
			if (mParameters.expand) {
				aExpand = mParameters.expand.replace(/\s/g, "").split(',');
			}
		}

		return checkReloadNeeded(oEntityType, oEntity, aSelect, aExpand);

	};

	/**
	 * Create URL parameters from custom parameters
	 *
	 * @param {map} mParameters map of custom parameters
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
				aCustomParams.push("$" + sName + "=" + jQuery.sap.encodeURL(mParameters[sName]));
			}
			if (sName === "custom") {
				mCustomQueryOptions = mParameters[sName];
				for (sName in mCustomQueryOptions) {
					if (sName.indexOf("$") === 0) {
						jQuery.sap.log.warning(this + " - Trying to set OData parameter '" + sName + "' as custom query option!");
					} else if (typeof mCustomQueryOptions[sName] === 'string') {
						aCustomParams.push(sName + "=" + jQuery.sap.encodeURL(mCustomQueryOptions[sName]));
					} else {
						aCustomParams.push(sName);
					}
				}
			}
		}
		return aCustomParams.join("&");
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindContext
	 * @param {string} sPath resolved path
	 * @param {object} oContext context object
	 * @param {map} [mParameters] map of parameters
	 * @returns {object} oBinding contextBinding object
	 * @private
	 */
	ODataModel.prototype.bindContext = function(sPath, oContext, mParameters) {
		var oBinding = new ODataContextBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * Sets the default way to retrieve the count of collections in this model.
	 * Count can be determined either by sending a separate $count request, including
	 * $inlinecount=allpages in data requests, both of them or not at all.
	 *
	 * @param {sap.ui.model.odata.CountMode} sCountMode sets default count mode
	 * @since 1.20
	 * @public
	 */
	ODataModel.prototype.setDefaultCountMode = function(sCountMode) {
		this.sDefaultCountMode = sCountMode;
	};

	/**
	 * Returns the default count mode for retrieving the count of collections
	 *
	 * @returns {sap.ui.model.odata.CountMode} sCountMode returns defaultCountMode
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
	 * @private
	 */
	ODataModel.prototype._addEntity = function(oEntity) {
		var sKey = this._getKey(oEntity);
		this.oData[sKey] = oEntity;
	};

	/**
	 * Removes an entity from the internal cache, also removes related changed entity and context
	 *
	 * @param {string} sKey The entity key
	 * @private
	 */
	ODataModel.prototype._removeEntity = function(sKey) {
		sKey = sKey && this._normalizeKey(sKey);
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
		sKey = sKey && this._normalizeKey(sKey);
		return this.oData[sKey];
	};

	/**
	 * Returns the key part from the entry URI or the given context or object
	 *
	 * @param {string|object|sap.ui.model.Context} vValue A string representation of an URI, the context or entry object
	 * @returns {string} [sKey] key of the entry
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
			vValue = vValue.split("?")[0];
			sKey = vValue.substr(vValue.lastIndexOf("/") + 1);
		}
		return sKey && this._normalizeKey(sKey);
	};

	/**
	 * Returns the key part from the entry URI or the given context or object
	 *
	 * @param {string|object|sap.ui.model.Context} vValue A string representation of an URI, the context or entry object
	 * @returns {string} [sKey] key of the entry
	 * @public
	 */
	ODataModel.prototype.getKey = function(vValue) {
		return this._getKey(vValue);
	};

	/**
	 * Creates the key from the given collection name and property map. Please make sure that the metadata document is loaded before using this function.
	 *
	 * @param {string} sCollection The name of the collection
	 * @param {object} oKeyProperties The object containing at least all the key properties of the entity type
	 * @returns {string} [sKey] key of the entry
	 * @public
	 */
	ODataModel.prototype.createKey = function(sCollection, oKeyProperties) {
		var oEntityType = this.oMetadata._getEntityTypeByPath(sCollection),
		sKey = sCollection,
		that = this,
		//aKeys,
		sName,
		oProperty;
		jQuery.sap.assert(oEntityType, "Could not find entity type of collection \"" + sCollection + "\" in service metadata!");
		sKey += "(";
		if (oEntityType.key.propertyRef.length === 1) {
			sName = oEntityType.key.propertyRef[0].name;
			jQuery.sap.assert(sName in oKeyProperties, "Key property \"" + sName + "\" is missing in object!");
			oProperty = this.oMetadata._getPropertyMetadata(oEntityType, sName);
			sKey += encodeURIComponent(ODataUtils.formatValue(oKeyProperties[sName], oProperty.type));
		} else {
			jQuery.each(oEntityType.key.propertyRef, function(i, oPropertyRef) {
				if (i > 0) {
					sKey += ",";
				}
				sName = oPropertyRef.name;
				jQuery.sap.assert(sName in oKeyProperties, "Key property \"" + sName + "\" is missing in object!");
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
	 * Normalizes the given canonical key.
	 *
	 * Although keys contained in OData response must be canonical, there are
	 * minor differences (like capitalization of suffixes for Decimal, Double,
	 * Float) which can differ and cause equality checks to fail.
	 *
	 * @param {string} sKey The canonical key of an entity
	 * @returns {string} Normalized key of the entry
	 * @private
	 */
		// Define regular expression and function outside function to avoid instatiation on every call
	var rNormalizeString = /([(=,])('.*?')([,)])/g,
		rNormalizeCase = /[MLDF](?=[,)](?:[^']*'[^']*')*[^']*$)/g,
		fnNormalizeString = function(value, p1, p2, p3) {
			return p1 + encodeURIComponent(decodeURIComponent(p2)) + p3;
		},
		fnNormalizeCase = function(value) {
			return value.toLowerCase();
		};
	ODataModel.prototype._normalizeKey = function(sKey) {
		return sKey.replace(rNormalizeString, fnNormalizeString).replace(rNormalizeCase, fnNormalizeCase);
	};

	/**
	 * Returns the value for the property with the given <code>sPath</code>.
	 * If the path points to a navigation property which has been loaded via $expand then the <code>bIncludeExpandEntries</code>
	 * parameter determines if the navigation property should be included in the returned value or not.
	 * Please note that this currently works for 1..1 navigation properties only.
	 *
	 * @param {string} sPath the path/name of the property
	 * @param {object} [oContext] the context if available to access the property value
	 * @param {boolean} [bIncludeExpandEntries=null] This parameter should be set when a URI or custom parameter
	 * with a $expand System Query Option was used to retrieve associated entries embedded/inline.
	 * If true then the getProperty function returns a desired property value/entry and includes the associated expand entries (if any).
	 * If false the associated/expanded entry properties are removed and not included in the
	 * desired entry as properties at all. This is useful for performing updates on the base entry only. Note: A copy and not a reference of the entry will be returned.
	 * @returns {any} vValue the value of the property
	 * @public
	 */
	ODataModel.prototype.getProperty = function(sPath, oContext, bIncludeExpandEntries) {
		var oValue = this._getObject(sPath, oContext);

		// same behavior as before
		if (!bIncludeExpandEntries) {
			return oValue;
		}

		// if value is a plain value and not an object we return directly
		if (!jQuery.isPlainObject(oValue)) {
			return oValue;
		}

		// do a value copy or the changes to that value will be modified in the model as well (reference)
		oValue = jQuery.sap.extend(true, {}, oValue);

		if (bIncludeExpandEntries === true) {
			// include expand entries
			return this._restoreReferences(oValue);
		} else {
			// remove expanded references
			return this._removeReferences(oValue);
		}
	};

	/**
	 * @param {string} sPath binding path
	 * @param {object} [oContext] binding context
	 * @param {boolean} [bOriginalValue] returns the original value read from the server even if changes where made
	 * @returns {any} vValue the value for the given path/context
	 * @private
	 */
	ODataModel.prototype._getObject = function(sPath, oContext, bOriginalValue) {
		var oNode = this.isLegacySyntax() ? this.oData : null, oChangedNode, oOrigNode,
			sResolvedPath = this.resolve(sPath, oContext),
			iSeparator, sDataPath, sMetaPath, oMetaContext, sKey, oMetaModel;

		//check for metadata path
		if (this.oMetadata && this.oMetadata.isLoaded() && sResolvedPath && sResolvedPath.indexOf('/#') > -1)  {
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
		} else {
			if (!sResolvedPath) {
				return oNode;
			}
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
		//if we have a changed Entity/complext type we need to extend it with the backend data
		if (jQuery.isPlainObject(oChangedNode)) {
			oNode =  bOriginalValue ? oOrigNode : jQuery.sap.extend(true, {}, oOrigNode, oChangedNode);
		}
		return oNode;
	};

	/**
	 * Update the security token, if token handling is enabled and token is not available yet
	 * @private
	 */
	ODataModel.prototype.updateSecurityToken = function() {
		if (this.bTokenHandling) {
			if (!this.oServiceData.securityToken) {
				this.refreshSecurityToken();
			}
			// Update header every time, in case security token was changed by other model
			// Check bTokenHandling again, as updateSecurityToken() might disable token handling
			if (this.bTokenHandling) {
				this.oHeaders["x-csrf-token"] = this.oServiceData.securityToken;
			}
		}
	};

	/**
	 * Clears the security token, as well from the service data as from the headers object
	 * @private
	 */
	ODataModel.prototype.resetSecurityToken = function() {
		delete this.oServiceData.securityToken;
		delete this.oHeaders["x-csrf-token"];
		delete this.pSecurityToken;
	};

	/**
	 * Returns the current security token. If the token has not been requested from the server it will be requested first.
	 *
	 * @returns {string} the CSRF security token
	 *
	 * @public
	 */
	ODataModel.prototype.getSecurityToken = function() {
		var sToken = this.oServiceData.securityToken;
		if (!sToken) {
			this.refreshSecurityToken();
			sToken = this.oServiceData.securityToken;
		}
		return sToken;
	};

	/**
	 * Returns a promise, which will resolve with the security token as soon as it is available
	 *
	 * @returns {Promise} the CSRF security token
	 *
	 * @public
	 */
	ODataModel.prototype.securityTokenAvailable = function() {
		if (!this.pSecurityToken) {
			if (this.oServiceData.securityToken) {
				this.pSecurityToken = Promise.resolve(this.oServiceData.securityToken);
			} else {
				this.pSecurityToken = new Promise(function(resolve, reject) {
					this.refreshSecurityToken(function() {
						resolve(this.oServiceData.securityToken);
					}.bind(this),function(){
						reject();
					}, true);
				}.bind(this));
			}
		}
		return this.pSecurityToken;
	};

	/**
	 * refresh XSRF token by performing a GET request against the service root URL.
	 *
	 * @param {function} [fnSuccess] a callback function which is called when the data has
	 *            					 been successfully retrieved.
	 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
	 *  additional error information.
	 *
	 * @returns {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.refreshSecurityToken = function(fnSuccess, fnError, bAsync) {
		var sToken;
		var that = this;
		var sUrl = this._createRequestUrl("/");

		var mTokenRequest = {
			abort: function() {
				this.request.abort();
			}
		};


		function _handleSuccess(oData, oResponse) {
			if (oResponse) {
				sToken = that._getHeader("x-csrf-token", oResponse.headers);
				that._setSessionContextIdHeader(that._getHeader("sap-contextid", oResponse.headers));
				if (sToken) {
					that.oServiceData.securityToken = sToken;
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

		function _handleGetError(oError) {
			// Disable token handling, if token request returns an error
			that.resetSecurityToken();
			that.bTokenHandling = false;
			that._handleError(oError);

			if (fnError) {
				fnError(oError);
			}
		}

		function _handleHeadError(oError) {
			// Disable token handling, if token request returns an error
			mTokenRequest.request = requestToken("GET", _handleGetError);
		}

		function requestToken(sRequestType, fnError) {
			// trigger a read to the service url to fetch the token
			var oRequest = that._createRequest(sUrl, sRequestType, that._getHeaders(), null, null, !!bAsync);
			oRequest.headers["x-csrf-token"] = "Fetch";
			return that._request(oRequest, _handleSuccess, fnError, undefined, undefined, that.getServiceMetadata());
		}


		// Initially try method "HEAD", error handler falls back to "GET" unless the flag forbids HEAD request
		if (this.bDisableHeadRequestForToken) {
			mTokenRequest.request = requestToken("GET", _handleGetError);
		} else {
			mTokenRequest.request = requestToken("HEAD", _handleHeadError);
		}
		return mTokenRequest;

	};

	/**
	 * submit changes from the requestQueue (queue can currently have only one request)
	 * @param {object} oRequest The request object
	 * @param {function} [fnSuccess] Success callback function
	 * @param {function} [fnError] Error callback function
	 * @returns {object} oHandler request handle
	 * @private
	 */
	ODataModel.prototype._submitRequest = function(oRequest, fnSuccess, fnError){
		var that = this, oHandler, oRequestHandle, bAborted, pRequestCompleted, fnResolveCompleted;

		//Create promise to track when this request is completed
		pRequestCompleted = new Promise(function(resolve, reject) {
			fnResolveCompleted = resolve;
		});

		function _handleSuccess(oData, oResponse) {
			//if batch the responses are handled by the batch success handler
			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
			fnResolveCompleted();
		}

		function _handleError(oError) {

			// If error is a 403 with XSRF token "Required" reset the token and retry sending request
			if (that.bTokenHandling && oError.response) {
				var sToken = that._getHeader("x-csrf-token", oError.response.headers);
				if (!oRequest.bTokenReset && oError.response.statusCode == '403' && sToken && sToken.toLowerCase() === "required") {
					that.resetSecurityToken();
					oRequest.bTokenReset = true;
					_submitWithToken();
					return;
				}
			}

			if (fnError) {
				fnError(oError);
			}
			fnResolveCompleted();
		}

		function _readyForRequest(oRequest) {
			if (that.bTokenHandling && oRequest.method !== "GET") {
				that.pReadyForRequest = that.securityTokenAvailable();
			}
			return that.pReadyForRequest;
		}

		function _submitWithToken() {
			// request token only if we have change operations or batch requests
			// token needs to be set directly on request headers, as request is already created
			_readyForRequest(oRequest).then(function(sToken) {
				// Check bTokenHandling again, as updating the token might disable token handling
				if (that.bTokenHandling && oRequest.method !== "GET") {
					oRequest.headers["x-csrf-token"] = sToken;
				}
				_submit();
			}, function() {
				_submit();
			});
		}

		var fireEvent = function(sType, oRequest, oError) {
			var oEventInfo,
				aRequests = oRequest.eventInfo.requests;
			if (aRequests) {
				jQuery.each(aRequests, function(i, oRequest) {
					if (jQuery.isArray(oRequest)) {
						jQuery.each(oRequest, function(i, oRequest) {
							oEventInfo = that._createEventInfo(oRequest.request, oError);
							that["fireRequest" + sType](oEventInfo);
						});
					} else {
						oEventInfo = that._createEventInfo(oRequest.request, oError);
						that["fireRequest" + sType](oEventInfo);
					}
				});

				oEventInfo = that._createEventInfo(oRequest, oError, aRequests);
				that["fireBatchRequest" + sType](oEventInfo);
			} else {
				oEventInfo = that._createEventInfo(oRequest, oError, aRequests);
				that["fireRequest" + sType](oEventInfo);
			}
		};

		function _submit() {
			if (that.sSessionContextId) {
				oRequest.headers["sap-contextid"] = that.sSessionContextId;
			}
			oRequestHandle = that._request(oRequest, _handleSuccess, _handleError, oHandler, undefined, that.getServiceMetadata());
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
				_submitWithToken();
			});
			this.pSequentialRequestCompleted = pRequestCompleted;
		} else {
			_submitWithToken();
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
	 * Sets the new context session id (SID). This SID will be send in the header of every following OData request in order to reuse the same OData Service session.
	 *
	 * @param {string} new session context id
	 * @private
	 */
	ODataModel.prototype._setSessionContextIdHeader = function(sSessionContextId) {
		if (sSessionContextId){
			this.sSessionContextId = sSessionContextId;
		}
	};
	/**
	 * submit of a single request
	 *
	 * @param {object} oRequest The request object
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Error callback function
	 * @returns {object} oHandler request handle
	 * @private
	 */
	ODataModel.prototype._submitSingleRequest = function(oRequest, fnSuccess, fnError) {
		var that = this,
			oRequestHandle,
			mChangeEntities = {},
			mGetEntities = {},
			mEntityTypes = {};

		var handleSuccess = function(oData, oResponse) {
			// If there is a 200 response which does not contain valid data, this should be treated as an error.
			// This may happen in case of SAML session expiration.
			if (oData === undefined && oResponse.statusCode === 200) {
				handleError({
					message: "Response did not contain a valid OData result",
					response: oResponse
				});
				return;
			}

			var fnSingleSuccess = function(oData, oResponse) {
				if (fnSuccess) {
					fnSuccess(oData, oResponse);
				}
				if (oRequest.requestUri.indexOf("$count") === -1) {
					that.checkUpdate(false, false, mGetEntities);
					if (that._isRefreshNeeded(oRequest, oResponse)){
						that._refresh(false, undefined, mChangeEntities, mEntityTypes);
					}
				}
			};
			that._processSuccess(oRequest, oResponse, fnSingleSuccess, mGetEntities, mChangeEntities, mEntityTypes);
			that._setSessionContextIdHeader(that._getHeader("sap-contextid", oResponse.headers));
		};
		var handleError = function(oError) {
			if (oError.message == "Request aborted") {
				that._processAborted(oRequest, oError, fnError);
			} else {
				that._processError(oRequest, oError, fnError);
			}
			that._processAfterUpdate();
		};
		oRequest.eventInfo = {};
		oRequestHandle =  this._submitRequest(oRequest, handleSuccess, handleError);

		return oRequestHandle;
	};

	/**
	 * submit of a batch request
	 *
	 * @param {object} oBatchRequest The batch request object
	 * @param {array} aRequests array of request; represents the order of requests in the batch
	 * @param {function} fnSuccess Success callback function
	 * @param {fnError} fnError Error callback function
	 * @returns {object} orequestHandle requestHandle
	 * @private
	 */
	ODataModel.prototype._submitBatchRequest = function(oBatchRequest, aRequests, fnSuccess, fnError) {
		var that = this;

		var handleSuccess = function(oData, oBatchResponse) {
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
				aBatchResponses = oData.__batchResponses,
				oEventInfo,
				mChangeEntities = {},
				mGetEntities = {},
				mEntityTypes = {};

			if (aBatchResponses) {
				var i,j;
				for (i = 0; i < aBatchResponses.length; i++) {
					oResponse = aBatchResponses[i];

					if (jQuery.isArray(aRequests[i])) {
						//changeSet failed
						if (oResponse.message) {
							for (j = 0; j < aRequests[i].length; j++) {
								oRequestObject = aRequests[i][j];

								if (oRequestObject.request._aborted) {
									that._processAborted(oRequestObject.request, oResponse, oRequestObject.fnError);
								} else {
									that._processError(oRequestObject.request, oResponse, oRequestObject.fnError);
								}
								oRequestObject.response = oResponse;
							}
						} else {
							aChangeResponses = oResponse.__changeResponses;
							for (j = 0; j < aChangeResponses.length; j++) {
								var oChangeResponse = aChangeResponses[j];
								oRequestObject = aRequests[i][j];
								//check for error
								if (oRequestObject.request._aborted) {
									that._processAborted(oRequestObject.request, oChangeResponse, oRequestObject.fnError);
								} else if (oChangeResponse.message) {
									that._processError(oRequestObject.request, oChangeResponse, oRequestObject.fnError);
								} else {
									that._processSuccess(oRequestObject.request, oChangeResponse, oRequestObject.fnSuccess, mGetEntities, mChangeEntities, mEntityTypes);
								}
								oRequestObject.response = oChangeResponse;
							}
						}
					} else {
						oRequestObject = aRequests[i];
						if (oRequestObject.request._aborted) {
							that._processAborted(oRequestObject.request, oResponse, oRequestObject.fnError);
						} else if (oResponse.message) {
							that._processError(oRequestObject.request, oResponse, oRequestObject.fnError);
						} else {
							that._processSuccess(oRequestObject.request, oResponse, oRequestObject.fnSuccess, mGetEntities, mChangeEntities, mEntityTypes);
						}
						oRequestObject.response = oResponse;
					}
				}
				that.checkUpdate(false, false, mGetEntities);
			}
			if (fnSuccess) {
				fnSuccess(oData);
			}
			oEventInfo = that._createEventInfo(oBatchRequest, oBatchResponse, aRequests);
			that._setSessionContextIdHeader(that._getHeader("sap-contextid", oBatchResponse.headers));
			that.fireBatchRequestCompleted(oEventInfo);
		};

		var handleError = function(oError) {
			var oEventInfo,
				bAborted = oRequestHandle && oRequestHandle.bAborted;
			// Call procesError for all contained requests first
			jQuery.each(aRequests, function(i, oRequest) {
				if (jQuery.isArray(oRequest)) {
					jQuery.each(oRequest, function(i, oRequest) {
						if (bAborted) {
							that._processAborted(oRequest.request, oError, oRequest.fnError);
						} else {
							that._processError(oRequest.request, oError, oRequest.fnError);
						}
					});
				} else {
					if (bAborted) {
						that._processAborted(oRequest.request, oError, oRequest.fnError);
					} else {
						that._processError(oRequest.request, oError, oRequest.fnError);
					}
				}
			});

			that._processAfterUpdate();

			// Call callback and fire events for the batch request
			if (fnError) {
				fnError(oError);
			}
			oEventInfo = that._createEventInfo(oBatchRequest, oError, aRequests);
			that.fireBatchRequestCompleted(oEventInfo);
			// Don't fire RequestFailed for intentionally aborted requests; fire event if we have no (OData.read fails before handle creation)
			if (!bAborted) {
				that.fireBatchRequestFailed(oEventInfo);
			}
		};

		oBatchRequest.eventInfo = {
				requests: aRequests,
				batch: true
		};
		var oRequestHandle = this._submitRequest(oBatchRequest, handleSuccess, handleError);

		return oRequestHandle;
	};

	/**
	 * Create a Batch request
	 *
	 * @param {array} aBatchRequests array of request objects
	 * @returns {object} oBatchRequest The batch request
	 * @private
	 */
	ODataModel.prototype._createBatchRequest = function(aBatchRequests) {
		var sUrl, oRequest,
		oChangeHeader = {},
		oPayload = {};

		oPayload.__batchRequests = aBatchRequests;

		sUrl = this.sServiceUrl	+ "/$batch";


		if (this.aUrlParams.length > 0) {
			sUrl += "?" + this.aUrlParams.join("&");
		}

		jQuery.extend(oChangeHeader, this.mCustomHeaders, this.oHeaders);

		// Set Accept header for $batch requests
		oChangeHeader["Accept"] = "multipart/mixed";

		// reset
		delete oChangeHeader["Content-Type"];

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
	 * Abort internal requests such as created via TwoWay changes or created entries
	 * @private
	 */
	ODataModel.prototype.abortInternalRequest = function(sKey, sGroupId) {
		var mRequests = this.mRequests;

		if (sGroupId in this.mDeferredGroups) {
			mRequests = this.mDeferredRequests;
		}

		var oRequestGroup = mRequests[sGroupId];

		if (oRequestGroup && sKey in oRequestGroup.map) {
			this.mChangeHandles[sKey].abort();
			delete this.mChangeHandles[sKey];
		}
	};

	/**
	 * push request to internal request queue
	 *
	 * @param {map} mRequests Request queue
	 * @param {string} sGroupId The group Id. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {string} [sChangeSetId] The changeSet Id
	 * @param {oRequest} oRequest The request
	 * @param {function} fnSuccess The success callback function
	 * @param {function} fnError The error callback function
	 * @private
	 */
	ODataModel.prototype._pushToRequestQueue = function(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError) {
		var oChangeGroup, oRequestGroup = mRequests[sGroupId];

		if (!oRequestGroup) {
			oRequestGroup = {};
			oRequestGroup.map = {};
			oRequestGroup.requests = [];
			mRequests[sGroupId] = oRequestGroup;
		}
		if (oRequest.method !== "GET" || oRequest.key) {
			if (!oRequestGroup.changes) {
				oRequestGroup.changes = {};
			}
			if (oRequest.key && oRequestGroup.map && oRequest.key in oRequestGroup.map) {
				var oChangeRequest = oRequestGroup.map[oRequest.key];
				oChangeRequest.method = oRequest.method;
				oChangeRequest.headers = oRequest.headers;
				if (oRequest.method === "PUT") {
					// if stored request was a MERGE before (created by setProperty) but is now sent via PUT
					// (by submitChanges) the merge header must be removed
					delete oChangeRequest.headers["x-http-method"];
				}

				// if change is aborted (resetChanges) and a change happens before submit we should delete
				// the aborted flag
				if (oChangeRequest._aborted) {
					delete oChangeRequest._aborted;
					var oRequestHandle = {
							abort: function() {
								oChangeRequest._aborted = true;
							}
					};
					this.mChangeHandles[oRequest.key] = oRequestHandle;
				}

				if (oRequest.method !== "GET") {
					oChangeRequest.data = oRequest.data;
					// for POST function imports we also need to replace the URI
					oChangeRequest.requestUri = oRequest.requestUri;
				} else {
					// used for GET function imports which have no payload
					// replace uri with new function import parameters
					oChangeRequest.requestUri = oRequest.requestUri;
					delete oChangeRequest.data;
				}

			} else {
				if (oRequest.method !== "GET") {
					oChangeGroup = oRequestGroup.changes[sChangeSetId];
					if (!oChangeGroup) {
						oChangeGroup = [];
						oRequestGroup.changes[sChangeSetId] = oChangeGroup;
					}
					oRequest._changeSetId = sChangeSetId;
					oChangeGroup.push({
						request:	oRequest,
						fnSuccess:	fnSuccess,
						fnError:	fnError,
						changeSetId: sChangeSetId
					});
				} else {
					oRequestGroup.requests.push({
						request:	oRequest,
						fnSuccess:	fnSuccess,
						fnError:	fnError
					});
				}
				if (oRequest.key) {
					oRequestGroup.map[oRequest.key] = oRequest;
				}
			}
		} else {
			oRequestGroup.requests.push({
				request:	oRequest,
				fnSuccess:	fnSuccess,
				fnError:	fnError
			});
		}
	};

	/**
	 * Request queue processing
	 *
	 * @param {object} oGroup The batchGroup
	 * @param {map} mChangedEntities A map containing the changed entities of the bacthGroup
	 * @param {map} mEntityTypes Aa map containing the changed EntityTypes
	 *
	 * @private
	 */
	ODataModel.prototype._collectChangedEntities = function(oGroup, mChangedEntities, mEntityTypes) {
		var that = this;

		if (oGroup.changes) {
			jQuery.each(oGroup.changes, function(sChangeSetId, aChangeSet){
				for (var i = 0; i < aChangeSet.length; i++) {
					var oRequest = aChangeSet[i].request,
						sKey = that._getKey(oRequest.requestUri);
					if (oRequest.method === "POST" || oRequest.method === "DELETE") {
						var oEntityMetadata = that.oMetadata._getEntityTypeByPath("/" + sKey);
						if (oEntityMetadata) {
							mEntityTypes[oEntityMetadata.entityType] = true;
						}
					} else {
						mChangedEntities[sKey] = true;
					}
				}
			});
		}
	};

	/**
	 * Request queue processing
	 *
	 * @param {map} mRequests Request queue
	 * @param {string} sGroupId The groupId. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Erro callback function
	 * @returns {object|array} oRequestHandle The request handle: array if multiple request will be sent
	 * @private
	 */
	ODataModel.prototype._processRequestQueue = function(mRequests, sGroupId, fnSuccess, fnError){
		var that = this, sPath,
			oRequestHandle = [];

		if (this.bUseBatch) {
			//auto refresh for batch / for single requests we refresh after the request was successful
			if (that.bRefreshAfterChange) {
				jQuery.each(mRequests, function(sRequestGroupId, oRequestGroup) {
					if (sRequestGroupId === sGroupId || !sGroupId) {
						var mChangedEntities = {},
							mEntityTypes = {};
						that._collectChangedEntities(oRequestGroup, mChangedEntities, mEntityTypes);
						that.bIncludeInCurrentBatch = true;
						that._refresh(false, sRequestGroupId, mChangedEntities, mEntityTypes);
						that.bIncludeInCurrentBatch = false;
					}
				});
			}
			jQuery.each(mRequests, function(sRequestGroupId, oRequestGroup) {
				if (sRequestGroupId === sGroupId || !sGroupId) {
					var aReadRequests = [], aBatchGroup = [], /* aChangeRequests, */ oChangeSet, aChanges;

					if (oRequestGroup.changes) {
						jQuery.each(oRequestGroup.changes, function(sChangeSetId, aChangeSet){
							oChangeSet = {__changeRequests:[]};
							aChanges = [];
							for (var i = 0; i < aChangeSet.length; i++) {
								//increase laundering
								sPath = '/' + that.getKey(aChangeSet[i].request.data);
								that.increaseLaundering(sPath, aChangeSet[i].request.data);
								if (aChangeSet[i].request._aborted) {
									that._processAborted(aChangeSet[i].request, null, aChangeSet[i].fnError);
								} else {
									//clear metadata.create
									if (aChangeSet[i].request.data && aChangeSet[i].request.data.__metadata) {
										delete aChangeSet[i].request.data.__metadata.created;
									}
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
							if (aRequests[i].request._aborted) {
								that._processAborted(aRequests[i].request, null, aRequests[i].fnError);
							} else {
								aReadRequests.push(aRequests[i].request);
								aBatchGroup.push(aRequests[i]);
							}
						}
					}
					if (aReadRequests.length > 0) {
						var oBatchRequest = that._createBatchRequest(aReadRequests, true);
						oRequestHandle.push(that._submitBatchRequest(oBatchRequest, aBatchGroup, fnSuccess, fnError));
					}
					delete mRequests[sRequestGroupId];
				}
			});
		} else  {
			jQuery.each(mRequests, function(sRequestGroupId, oRequestGroup) {
				if (sRequestGroupId === sGroupId || !sGroupId) {
					if (oRequestGroup.changes) {
						jQuery.each(oRequestGroup.changes, function(sChangeSetId, aChangeSet){
							for (var i = 0; i < aChangeSet.length; i++) {
								//increase laundering
								sPath = '/' + that.getKey(aChangeSet[i].request.data);
								that.increaseLaundering(sPath, aChangeSet[i].request.data);
								// store last request Handle. If no batch there will be only 1 and we cpould return it?
								if (aChangeSet[i].request._aborted) {
									that._processAborted(aChangeSet[i].request, null, aChangeSet[i].fnError);
								} else {
									aChangeSet[i].request._handle = that._submitSingleRequest(aChangeSet[i].request, aChangeSet[i].fnSuccess, aChangeSet[i].fnError);
									oRequestHandle.push(aChangeSet[i].request._handle);
								}
							}
						});
					}
					if (oRequestGroup.requests) {
						var aRequests = oRequestGroup.requests;
						for (var i = 0; i < aRequests.length; i++) {
							// store last request Handle. If no batch there will be only 1 and we cpould return it?
							if (aRequests[i].request._aborted) {
								that._processAborted(aRequests[i].request, null, aRequests[i].fnError);
							} else {
								aRequests[i].request._handle = that._submitSingleRequest(aRequests[i].request, aRequests[i].fnSuccess, aRequests[i].fnError);
								oRequestHandle.push(aRequests[i].request._handle);
							}
						}
					}
					delete mRequests[sRequestGroupId];
				}
			});
		}
		this.checkDataState(this.mLaunderingState);
		return oRequestHandle.length == 1 ? oRequestHandle[0] : oRequestHandle;
	};

	/**
	 * Process request queue asynchronously
	 *
	 * @param {map} mRequestQueue The request queue to process
	 * @private
	 */
	ODataModel.prototype._processRequestQueueAsync = function(mRequestQueue) {
		var that = this;
		if (!this.pCallAsnyc) {
			this.pCallAsnyc = Promise.resolve();
			this.pCallAsnyc.then(function() {
				that._processRequestQueue(mRequestQueue);
				that.pCallAsnyc = undefined;
			});
		}
	};

	/**
	 * process request response for successful requests
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {function} fnSuccess The success callback function
	 * @param {map} mGetEntities map of read entities
	 * @param {map} mChangeEntities map of changed entities
	 * @param {map} mEntityTypes map of changed entityTypes
	 * @returns {boolean} bSuccess Processed successfully
	 * @private
	 */
	ODataModel.prototype._processSuccess = function(oRequest, oResponse, fnSuccess, mGetEntities, mChangeEntities, mEntityTypes) {
		var oResultData = oResponse.data, oImportData, bContent, sUri, sPath, aParts, oEntity,
		oEntityMetadata, mLocalGetEntities = {}, mLocalChangeEntities = {}, that = this;

		bContent = !(oResponse.statusCode === 204 || oResponse.statusCode === '204');

		sUri = oRequest.requestUri;
		sPath = sUri.replace(this.sServiceUrl,"");
		//in batch requests all paths are relative
		if (!jQuery.sap.startsWith(sPath,'/')) {
			sPath = '/' + sPath;
		}
		sPath = this._normalizePath(sPath);
		// decrease laundering
		this.decreaseLaundering(sPath, oRequest.data);

		// no data available
		if (bContent && oResultData === undefined && oResponse) {
			// Parse error messages from the back-end
			this._parseResponse(oResponse, oRequest);

			jQuery.sap.log.fatal(this + " - No data was retrieved by service: '" + oResponse.requestUri + "'");
			that.fireRequestCompleted({url : oResponse.requestUri, type : "GET", async : oResponse.async,
				info: "Accept headers:" + this.oHeaders["Accept"], infoObject : {acceptHeaders: this.oHeaders["Accept"]},  success: false});
			return false;
		}

		// broken implementations need this
		if (oResultData && oResultData.results && !jQuery.isArray(oResultData.results)) {
			oResultData = oResultData.results;
		}

		// adding the result data to the data object
		if (oResultData && (jQuery.isArray(oResultData) || typeof oResultData == 'object')) {
			//need a deep data copy for import
			oImportData = jQuery.sap.extend(true, {}, oResultData);
			that._importData(oImportData, mLocalGetEntities);
		}

		oEntity = this._getEntity(oRequest.key);
		if (mLocalGetEntities && oEntity && oEntity.__metadata.created && oEntity.__metadata.created.functionImport) {
			var aResults = [];
			var oResult = oEntity["$result"];
			if (oResult && oResult.__list) {
				jQuery.each(mLocalGetEntities, function(sKey) {
					aResults.push(sKey);
				});
				oResult.__list = aResults;
			} else if (oResult && oResult.__ref){
				//there should be only 1 entity in mLocalGetEntities
				jQuery.each(mLocalGetEntities, function(sKey) {
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
			// for createEntry entities change context path to new one
			if (oRequest.key) {
				var sKey = this._getKey(oResultData);
				// rewrite context for new path
				var oContext = this.getContext("/" + oRequest.key);
				oContext.sPath = '/' + sKey;
				this.mContexts[sKey] = oContext;
				// remove old entity
				this._removeEntity(oRequest.key);
				//delete created flag after successful creation
				oEntity = this._getEntity(sKey);
				if (oEntity) {
					delete oEntity.__metadata.created;
				}
			}
		}

		// Parse messages from the back-end
		this._parseResponse(oResponse, oRequest, mLocalGetEntities, mLocalChangeEntities);

		// Add the Get and Change entities from this request to the main ones (which differ in case of batch requests)
		jQuery.extend(mGetEntities, mLocalGetEntities);
		jQuery.extend(mChangeEntities, mLocalChangeEntities);

		this._updateETag(oRequest, oResponse);

		if (fnSuccess) {
			fnSuccess(oResultData, oResponse);
		}

		var oEventInfo = this._createEventInfo(oRequest, oResponse);
		this.fireRequestCompleted(oEventInfo);

		return true;
	};

	/**
	 * process request response for failed requests
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {function} fnError The error callback function
	 * @private
	 */
	ODataModel.prototype._processError = function(oRequest, oResponse, fnError) {
		var sPath, oError = this._handleError(oResponse, oRequest);
		// decrease laundering
		sPath = '/' + this.getKey(oRequest.data);
		this.decreaseLaundering(sPath, oRequest.data);

		if (fnError) {
			fnError(oError);
		}

		var oEventInfo = this._createEventInfo(oRequest, oError);
		this.fireRequestCompleted(oEventInfo);
		this.fireRequestFailed(oEventInfo);

	};

	/**
	 * process request response for aborted requests
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {function} fnError The error callback function
	 * @private
	 */
	ODataModel.prototype._processAborted = function(oRequest, oResponse, fnError) {
		var sPath;
		var oError = {
			message: "Request aborted",
			statusCode: 0,
			statusText: "abort",
			headers: {},
			responseText: ""
		};
		// decrease laundering
		sPath = '/' + this.getKey(oRequest.data);
		this.decreaseLaundering(sPath, oRequest.data);
		if (fnError) {
			fnError(oError);
		}

		// If no response is contained, request was never sent and completes event can be omitted
		if (oResponse) {
			var oEventInfo = this._createEventInfo(oRequest, oError);
			oEventInfo.success = false;
			this.fireRequestCompleted(oEventInfo);
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
	 * process a 'TwoWay' change
	 *
	 * @param {string} sKey Key of the entity to change
	 * @param {object} oData The entry data
	 * @param {boolean} [sUpdateMethod] Sets MERGE/PUT method
	 * @returns {object} oRequest The request object
	 * @private
	 */
	ODataModel.prototype._processChange = function(sKey, oData, sUpdateMethod) {
		var oPayload, oEntityType, mParams, sMethod, sETag, sUrl, mHeaders, aUrlParams, oRequest, oUnModifiedEntry, that = this;

		// delete expand properties = navigation properties
		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);

		//default to MERGE
		if (!sUpdateMethod) {
			sUpdateMethod = "MERGE";
		}

		// do a copy of the payload or the changes will be deleted in the model as well (reference)
		oPayload = jQuery.sap.extend(true, {}, this._getObject('/' + sKey, true), oData);

		if (oData.__metadata && oData.__metadata.created){
			sMethod = oData.__metadata.created.method ? oData.__metadata.created.method : "POST";
			sKey = oData.__metadata.created.key;
			mParams = oData.__metadata.created;
			if (oData.__metadata.created.functionImport){
				// update request url params with changed data from payload
				mParams.urlParameters = this._createFunctionImportParameters(oData.__metadata.created.key, sMethod, oPayload );
				// clear data
				oPayload = undefined;
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
			jQuery.each(aNavProps, function(iIndex, sNavPropName) {
				delete oPayload[sNavPropName];
			});
		}

		if (sMethod === "MERGE" && oEntityType && oUnModifiedEntry) {
			jQuery.each(oPayload, function(sPropName, oPropValue) {
				if (sPropName !== '__metadata') {
					// remove unmodified properties and keep only modified properties for delta MERGE
					if (jQuery.sap.equal(oUnModifiedEntry[sPropName], oPropValue) && !that.isLaundering('/' + sKey + '/' + sPropName)) {
						delete oPayload[sPropName];
					}
				}
			});
			// check if we have unit properties which were changed and if yes sent the associated unit prop also.
			var sPath = "/" + sKey, sUnitNameProp;
			jQuery.each(oPayload, function(sPropName, oPropValue) {
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
		mHeaders = mParams && mParams.headers ? this._getHeaders(mParams.headers) : this._getHeaders();
		sETag = mParams && mParams.eTag ? mParams.eTag : this.getETag(oPayload);

		sUrl = this._createRequestUrl('/' + sKey, null, aUrlParams, this.bUseBatch);

		oRequest = this._createRequest(sUrl, sMethod, mHeaders, oPayload, sETag);

		if (this.bUseBatch) {
			oRequest.requestUri = oRequest.requestUri.replace(this.sServiceUrl + '/','');
		}

		return oRequest;
	};

	/**
	 * Resolves batchGroup settings for an Entity
	 *
	 * @param {string} sKey Key of the entity
	 * @returns {object} oGroupInfo BatchGroup info
	 * @private
	 * @param {string} skey Path to the Entity
	 * @function
	 */
	ODataModel.prototype._resolveGroup = function(sKey) {
		var oChangeGroup, oEntityType, mParams, sGroupId, sChangeSetId, oData;

		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);
		oData = this._getObject('/' + sKey);
		if (oData) {
			mParams = oData.__metadata.created;
			//for created entries the group information is retrieved from the params
			if (mParams) {
				return { groupId: mParams.groupId, changeSetId: mParams.changeSetId };
			}
		}
		//resolve groupId/changeSetId
		if (this.mChangeGroups[oEntityType.name]) {
			oChangeGroup = this.mChangeGroups[oEntityType.name];
			sGroupId = oChangeGroup.groupId;
			sChangeSetId = oChangeGroup.single ? jQuery.sap.uid() : oChangeGroup.changeSetId;
		} else if (this.mChangeGroups['*']) {
			oChangeGroup = this.mChangeGroups['*'];
			sGroupId = oChangeGroup.groupId;
			sChangeSetId = oChangeGroup.single ? jQuery.sap.uid() : oChangeGroup.changeSetId;
		}

		return {groupId: sGroupId, changeSetId: sChangeSetId};
	};

	/**
	 * handle ETag
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @private
	 */
	ODataModel.prototype._updateETag = function(oRequest, oResponse) {
		var sUrl, oEntry, sETag;

		// refresh ETag from response directly. We can not wait for the refresh.
		sUrl = oRequest.requestUri.replace(this.sServiceUrl + '/', '');
		if (!jQuery.sap.startsWith(sUrl , "/")) {
			sUrl = "/" + sUrl;
		}
		oEntry = this._getObject(sUrl.split("?")[0]);
		sETag = this._getHeader("etag", oResponse.headers);
		if (oEntry && oEntry.__metadata && sETag){
			oEntry.__metadata.etag = sETag;
		}
	};

	/**
	 * error handling for requests
	 *
	 * @param {object} oError The error object
	 * @returns {map} mParameters A map of error information
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
		jQuery.sap.log.fatal(sErrorMsg);

		return mParameters;
	};

	/**
	 * Return requested data as object if the data has already been loaded and stored in the model.
	 *
	 * @param {string} sPath A string containing the path to the data object that should be returned.
	 * @param {object} [oContext] the optional context which is used with the sPath to retrieve the requested data.
	 * @param {boolean} [bIncludeExpandEntries=null] This parameter should be set when a URI or custom parameter
	 * with a $expand System Query Option was used to retrieve associated entries embedded/inline.
	 * If true then the getProperty function returns a desired property value/entry and includes the associated expand entries (if any).
	 * If false the associated/expanded entry properties are removed and not included in the
	 * desired entry as properties at all. This is useful for performing updates on the base entry only. Note: A copy and not a reference of the entry will be returned.
	 *
	 * @return {object} oData Object containing the requested data if the path is valid.
	 * @public
	 * @deprecated please use {@link #getProperty} instead
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
	 * Returns the ETag for a given binding path/context or data object
	 *
	 * @param {string} [sPath] The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @param {object} [oEntity] The entity data
	 *
	 * @returns {string} The found ETag (or null if none could be found)
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
	 * Returns the ETag for a given url, binding path/context or data object
	 *
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @param {object} [oData] The entry data
	 *
	 * @returns {string} The found ETag (or null if none could be found)
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
	 * ETag handling must be active so the force update will work.
	 * @param {string} sKey The key to an Entity e.g.: Customer(4711)
	 * @public
	 */
	 ODataModel.prototype.forceEntityUpdate = function(sKey) {
		 var oData = this.mChangedEntities[sKey];
		 if (oData && oData.__metadata) {
			 oData.__metadata.etag = '*';
		 } else {
			 jQuery.sap.log.error(this + " - Entity with key " + sKey + " does not exist or has no change");
		 }
	 };

	/**
	 * creation of a request object
	 *
	 * @param {string} sUrl The request Url
	 * @param {string} sMethod The request method
	 * @param {map} [mHeaders] A map of headers
	 * @param {object} [oData] The Data for this request
	 * @param {string} [sETag] The eTag
	 * @param {boolean} [bAsync] Async request
	 * @return {object} request object
	 * @private
	 */
	ODataModel.prototype._createRequest = function(sUrl, sMethod, mHeaders, oData, sETag, bAsync) {
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


		var oRequest = {
				headers : mHeaders,
				requestUri : sUrl,
				method : sMethod,
				user: this.sUser,
				password: this.sPassword,
				async: bAsync
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
	 * Checks if a model refresh is needed, either because the the data provided by the sPath and oContext is stored
	 * in the model or new data is added (POST). For batch requests all embedded requests are checked separately.
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @return {boolean} bRefresh Refresh needed
	 * @private
	 */
	ODataModel.prototype._isRefreshNeeded = function(oRequest, oResponse) {
		var bRefreshNeeded = false;

		if (this.bRefreshAfterChange) {
			bRefreshNeeded = true;
		}
		return bRefreshNeeded;
	};

	/**
	 * Executes the passed process request method when the metadata is available and takes care
	 * of properly wrapping the response handler and allow request abortion
	 *
	 * @param {function} [fnProcessRequest] the method to prepare the request and add it to the request queue
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 */
	ODataModel.prototype._processRequest = function(fnProcessRequest) {
		var oRequestHandle, oRequest,
			bAborted = false,
			that = this;

		this.oMetadata.loaded().then(function() {
			oRequest = fnProcessRequest();

			that._processRequestQueueAsync(that.mRequests);

			if (bAborted) {
				oRequestHandle.abort();
			}
		});

		oRequestHandle = {
			abort: function() {
				bAborted = true;
				if (oRequest) {
					oRequest._aborted = true;
					if (oRequest._handle) {
						oRequest._handle.abort();
					}
				}
			}
		};

		return oRequestHandle;
	};

	/**
	 * Trigger a PUT/MERGE request to the odata service that was specified in the model constructor.
	 * The update method used is defined by the global <code>defaultUpdateMethod</code> parameter which is sap.ui.model.odata.UpdateMethod.Merge by default.
	 * Please note that deep updates are not supported and may not work. These should be done seperate on the entry directly.
	 *
	 * @param {string} sPath A string containing the path to the data that should be updated.
	 * 		The path is concatenated to the sServiceUrl which was specified
	 * 		in the model constructor.
	 * @param {object} oData data of the entry that should be updated.
	 * @param {map} [mParameters] Optional, can contain the following attributes:
	 * @param {object} [mParameters.context] If specified the sPath has to be is relative to the path given with the context.
	 * @param {function} [mParameters.success] a callback function which is called when the data has been successfully updated.
	 * @param {function} [mParameters.error] a callback function which is called when the request failed.
	 * 		The handler can have the parameter <code>oError</code> which contains additional error information.
	 * @param {string} [mParameters.eTag] If specified, the If-Match-Header will be set to this Etag.
	 * 		Please be advised that this feature is officially unsupported as using asynchronous
	 * 		requests can lead to data inconsistencies if the application does not make sure that
	 * 		the request was completed before continuing to work with the data.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] groupId for this request. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.update = function(sPath, oData, mParameters) {
		var fnSuccess, fnError, oRequest, sUrl, oContext, sETag,
			aUrlParams, sGroupId, sChangeSetId,
			mUrlParams, mHeaders, sMethod, mRequests,
			that = this;

		if (mParameters) {
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
			// ensure merge paramater backwards compatibility
			if (mParameters.merge !== undefined) {
				sMethod =  mParameters.merge ? "MERGE" : "PUT";
			}
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = sMethod ? sMethod : this.sDefaultUpdateMethod;
		sETag = sETag || this._getETag(sPath, oContext, oData);

		return this._processRequest(function() {
			sUrl = that._createRequestUrl(sPath, oContext, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sMethod, mHeaders, oData, sETag);

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError);

			return oRequest;
		});

	};

	/**
	 * Trigger a POST request to the odata service that was specified in the model constructor. Please note that deep creates are not supported
	 * and may not work.
	 *
	 * @param {string} sPath A string containing the path to the collection where an entry
	 *		should be created. The path is concatenated to the sServiceUrl
	 *		which was specified in the model constructor.
	 * @param {object} oData data of the entry that should be created.
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified the sPath has to be relative to the path given with the context.
	 * @param {function} [mParameters.success] a callback function which is called when the data has
	 *		been successfully retrieved. The handler can have the
	 *		following parameters: oData and response.
	 * @param {function} [mParameters.error] a callback function which is called when the request failed.
	 *		The handler can have the parameter <code>oError</code> which contains additional error information.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] groupId for this request. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.create = function(sPath, oData, mParameters) {
		var oRequest, sUrl, oEntityMetadata,
		oContext, fnSuccess, fnError, mUrlParams, mRequests,
		mHeaders, aUrlParams, sEtag, sGroupId, sMethod, sChangeSetId,
		that = this;

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
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = "POST";

		return this._processRequest(function() {
			sUrl = that._createRequestUrl(sPath, oContext, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sMethod, mHeaders, oData, sEtag);

			sPath = that._normalizePath(sPath, oContext);
			oEntityMetadata = that.oMetadata._getEntityTypeByPath(sPath);
			oRequest.entityTypes = {};
			if (oEntityMetadata) {
				oRequest.entityTypes[oEntityMetadata.entityType] = true;
			}

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError);

			return oRequest;
		});
	};

	/**
	 * Trigger a DELETE request to the odata service that was specified in the model constructor.
	 *
	 * @param {string} sPath A string containing the path to the data that should be removed.
	 *		The path is concatenated to the sServiceUrl which was specified in the model constructor.
	 * @param {object} [mParameters] Optional, can contain the following attributes:
	 * @param {object} [mParameters.context] If specified the sPath has to be relative to the path given with the context.
	 * @param {function} [mParameters.success]  a callback function which is called when the data has been successfully retrieved.
	 *		The handler can have the following parameters: <code>oData<code> and <code>response</code>.
	 * @param {function} [mParameters.error] a callback function which is called when the request failed.
	 *		The handler can have the parameter: <code>oError</code> which contains additional error information.
	 * @param {string} [mParameters.eTag] If specified, the If-Match-Header will be set to this Etag.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] groupId for this request. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.remove = function(sPath, mParameters) {
		var oContext, sKey, fnSuccess, fnError, oRequest, sUrl, sGroupId,
		sChangeSetId, sETag, handleSuccess,
		mUrlParams, mHeaders, aUrlParams, sMethod, mRequests,
		that = this;

		if (mParameters) {
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = "DELETE";
		sETag = sETag || this._getETag(sPath, oContext);

		handleSuccess = function(oData, oResponse) {
			sKey = sUrl.substr(sUrl.lastIndexOf('/') + 1);
			//remove query params if any
			if (sKey.indexOf('?') !== -1) {
				sKey = sKey.substr(0, sKey.indexOf('?'));
			}
			that._removeEntity(sKey);

			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
		};

		return this._processRequest(function() {
			sUrl = that._createRequestUrl(sPath, oContext, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sMethod, mHeaders, undefined, sETag);

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}

			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, handleSuccess, fnError);

			return oRequest;
		});
	};

	/**
	 * Trigger a request to the function import odata service that was specified in the model constructor.
	 *
	 * If the ReturnType of the function import is either an EntityType or a collection of EntityType the
	 * changes are reflected in the model, otherwise they are ignored, and the <code>response</code> can
	 * be processed in the successHandler.
	 *
	 * @param {string} sFunctionName A string containing the name of the function to call. The name is concatenated to the sServiceUrl which was
	 *        specified in the model constructor.
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {string} [mParameters.method] A string containing the type of method to call this function with
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {function} [mParameters.success] a callback function which is called when the data has been successfully retrieved. The handler can have
	 *        the following parameters: <code>oData<code> and <code>response</code>.
	 * @param {function} [mParameters.error] a callback function which is called when the request failed.
	 *		The handler can have the parameter: <code>oError</code> which contains additional error information.
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] groupId for this request. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {string} [mParameters.eTag] If the functionImport changes an entity, the eTag for this entity could be passed with this parameter
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 *
	 * @return {object} oRequestHandle An object which has an <code>abort</code> function to abort the current request.
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
			aUrlParams,
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
			oData = {};

		if (mParameters) {
			sGroupId 		= mParameters.groupId || mParameters.batchGroupId;
			sChangeSetId 	= mParameters.changeSetId;
			sMethod			= mParameters.method ? mParameters.method : sMethod;
			mUrlParams		= jQuery.extend({},mParameters.urlParameters);
			sETag			= mParameters.eTag;
			fnSuccess		= mParameters.success;
			fnError			= mParameters.error;
			mHeaders		= mParameters.headers;
		}

		if (!jQuery.sap.startsWith(sFunctionName, "/")) {
			jQuery.sap.log.fatal(this + " callFunction: path '" + sFunctionName + "' must be absolute!");
			return;
		}

		mHeaders = this._getHeaders(mHeaders);

		pContextCreated = new Promise(function(resolve, reject) {
				fnResolve = resolve;
				fnReject = reject;
		});

		oRequestHandle = this._processRequest(function() {
			oFunctionMetadata = that.oMetadata._getFunctionImportMetadata(sFunctionName, sMethod);
			jQuery.sap.assert(oFunctionMetadata, that + ": Function " + sFunctionName + " not found in the metadata !");
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
				jQuery.each(oFunctionMetadata.parameter, function (iIndex, oParam) {
					oData[oParam.name] = that._createPropertyValue(oParam.type);
					if (mUrlParams && mUrlParams[oParam.name] !== undefined) {
						oData[oParam.name] = mUrlParams[oParam.name];
						mUrlParams[oParam.name] = ODataUtils.formatValue(mUrlParams[oParam.name], oParam.type);
					} else {
						jQuery.sap.log.warning(that + " - No value for parameter '" + oParam.name + "' found!'");
					}
				});
			}
			// add entry to model data
			// remove starting / for key only
			sKey = sFunctionName.substring(1) + "('" + jQuery.sap.uid() + "')";
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

			that._addEntity(oData);
			oContext = that.getContext("/" + sKey);
			fnResolve(oContext);

			aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

			sUrl = that._createRequestUrl(sFunctionName, null, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sMethod, mHeaders, undefined, sETag);
			oRequest.key = sKey;

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError);

			return oRequest;
		});

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
		jQuery.sap.assert(oFunctionMetadata, this + ": Function " + sFunctionName + " not found in the metadata !");
		if (!oFunctionMetadata) {
			return;
		}

		if (oFunctionMetadata.parameter != null) {
			jQuery.each(oFunctionMetadata.parameter, function (iIndex, oParam) {
				if (mUrlParams[oParam.name]) {
					mUrlParams[oParam.name] = ODataUtils.formatValue(mUrlParams[oParam.name], oParam.type);
				}
			});
		}
		return mUrlParams;
	};

	/**
	 * Trigger a GET request to the odata service that was specified in the model constructor.
	 * The data will be stored in the model. The requested data is returned with the response.
	 *
	 * @param {string} sPath A string containing the path to the data which should
	 *		be retrieved. The path is concatenated to the sServiceUrl
	 *		which was specified in the model constructor.
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified the sPath has to be is relative to the path
	 * 		given with the context.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {array} [mParameters.filters] an array of sap.ui.model.Filter to be included in the request URL
	 * @param {array} [mParameters.sorters] an array of sap.ui.model.Sorter to be included in the request URL
	 * @param {function} [mParameters.success] a callback function which is called when the data has
	 *		been successfully retrieved. The handler can have the
	 *		following parameters: oData and response.
	 * @param {function} [mParameters.error] a callback function which is called when the request
	 * 		failed. The handler can have the parameter: oError which contains additional error information.
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] groupId for this request. Requests belonging to the same groupId will be bundled in one batch request.
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.read = function(sPath, mParameters) {
		var oRequest, sUrl,
		oContext, mUrlParams, fnSuccess, fnError,
		aFilters, aSorters, sFilterParams, sSorterParams,
		oEntityType, sNormalizedPath,
		aUrlParams, mHeaders, sMethod,
		sGroupId, sETag,
		mRequests,
		that = this;

		// The object parameter syntax has been used.
		if (mParameters) {
			oContext	= mParameters.context;
			mUrlParams	= mParameters.urlParameters;
			fnSuccess	= mParameters.success;
			fnError		= mParameters.error;
			aFilters	= mParameters.filters;
			aSorters	= mParameters.sorters;
			sGroupId 	= mParameters.groupId || mParameters.batchGroupId;
			mHeaders 	= mParameters.headers;
		}
		//if the read is triggered via a refresh we should use the refreshGroupId instead
		if (this.sRefreshGroupId) {
			sGroupId = this.sRefreshGroupId;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);
		sMethod = "GET";
		sETag = this._getETag(sPath, oContext);

		function createReadRequest() {
			// Add filter/sorter to URL parameters
			sSorterParams = ODataUtils.createSortParams(aSorters);
			if (sSorterParams) {
				aUrlParams.push(sSorterParams);
			}

			var sTempPath = sPath;
			var iIndex = sPath.indexOf("$count");
			// check if we have a manual count request with filters. Then we have to manually adjust the path.
			if (iIndex !== -1) {
				sTempPath = sPath.substring(0, iIndex - 1);
			}

			sNormalizedPath = that._normalizePath(sTempPath, oContext);
			oEntityType = that.oMetadata._getEntityTypeByPath(sNormalizedPath);
			sFilterParams = ODataUtils.createFilterParams(aFilters, that.oMetadata, oEntityType);
			if (sFilterParams) {
				aUrlParams.push(sFilterParams);
			}

			sUrl = that._createRequestUrl(sPath, oContext, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sMethod, mHeaders, null, sETag);

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}
			that._pushToRequestQueue(mRequests, sGroupId, null, oRequest, fnSuccess, fnError);

			return oRequest;
		}

		// In case we are in batch mode and are processing refreshes before sending changes to the server,
		// the request must be processed synchronously to be contained in the same batch as the changes
		if (this.bUseBatch && this.bIncludeInCurrentBatch) {
			oRequest = createReadRequest();
			return {
				abort: function() {
					if (oRequest) {
						oRequest._aborted = true;
					}
				}
			};
		} else {
			return this._processRequest(createReadRequest);
		}
	};

	/**
	 * Return the parsed XML metadata as a Javascript object. Please note that the metadata is loaded asynchronously and this function might return undefined because the
	 * metadata has not been loaded yet.
	 * In this case attach to the <code>metadataLoaded</code> event to get notified when the metadata is available and then call this function.
	 *
	 * @return {Object} metdata object
	 * @public
	 */
	ODataModel.prototype.getServiceMetadata = function() {
		if (this.oMetadata && this.oMetadata.isLoaded()) {
			return this.oMetadata.getServiceMetadata();
		}
	};

	/**
	 * Returns a promise for the loaded state of the metadata. The promise won't get rejected in case the metadata loading failed but
	 * is only resolved if the metadata is loaded successfully.
	 * If <code>refreshMetadata</code> function is called after this promise is already resolved you should rely on the promise returned by
	 * <code>refreshMetadata</code> to get information about the refreshed metadata loaded state.
	 *
	 * @public
	 * @returns {Promise} returns a promise on metadata loaded state
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
	 * Checks whether metadata loading has failed in the past.
	 *
	 * @public
	 * @returns {boolean} returns whether metadata request has failed
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
	 * @return {Object} metdata object
	 * @public
	 * @experimental This feature has not been tested due to the lack of OData testing infrastructure. The API is NOT stable yet. Use at your own risk.
	 */
	ODataModel.prototype.getServiceAnnotations = function() {
		var mAnnotations = this.oAnnotations.getData();
		return jQuery.isEmptyObject(mAnnotations) ? null : mAnnotations;
	};

	ODataModel.prototype.onAnnotationsFailed = function(oEvent) {
		this.fireAnnotationsFailed(oEvent.getParameters());
	};

	ODataModel.prototype.onAnnotationsLoaded = function(oEvent) {
		this.fireAnnotationsLoaded(oEvent.getParameters());
	};

	/**
	 * Adds (a) new URL(s) to the be parsed for OData annotations, which are then merged into the annotations object
	 * which can be retrieved by calling the getServiceAnnotations()-method. If a $metadata url is passed the data will
	 * also be merged into the metadata object, which can be reached by calling the getServiceMetadata() method.
	 *
	 * @param {string|sting[]} vUrl - Either one URL as string or an array or URL strings
	 * @return {Promise} The Promise to load the given URL(s), resolved if all URLs have been loaded, rejected if at least one fails to load.
	 * 					 If this promise resolves it returns the following parameters:
	 * 					 annotations: The annotation object
	 * 					 entitySets: An array of EntitySet objects containing the newly merged EntitySets from a $metadata requests.
	 * 								 the structure is the same as in the metadata object reached by the getServiceMetadata() method.
	 * 								 For non $metadata requests the array will be empty.
	 *
	 * @protected
	 */
	ODataModel.prototype.addAnnotationUrl = function(vUrl) {
		var aUrls = [].concat(vUrl),
			aMetadataUrls = [],
			aAnnotationUrls = [],
			aEntitySets = [],
			that = this;

		jQuery.each(aUrls, function(i, sUrl) {
			var iIndex = sUrl.indexOf("$metadata");
			if (iIndex >= 0) {
				//add serviceUrl for relative metadata urls
				if (iIndex == 0) {
					sUrl = that.sServiceUrl + '/' + sUrl;
				}
				aMetadataUrls.push(sUrl);
			} else {
				aAnnotationUrls.push(sUrl);
			}
		});

		return this.oMetadata._addUrl(aMetadataUrls).then(function(aParams) {
			return Promise.all(jQuery.map(aParams, function(oParam) {
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
	 * Adds new xml content to be parsed for OData annotations, which are then merged into the annotations object which
	 * can be retrieved by calling the getServiceAnnotations()-method.
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
	 * Submits the collected changes which were collected by the setProperty method. The update method is defined by the global <code>defaultUpdateMethod</code>
	 * parameter which is sap.ui.model.odata.UpdateMethod.Merge by default. In case of a sap.ui.model.odata.UpdateMethod.Merge request only the changed properties will be updated.
	 * If a URI with a $expand System Query Option was used then the expand entries will be removed from the collected changes.
	 * Changes to this entries should be done on the entry itself. So no deep updates are supported.
	 *
	 * Important: The success/error handler will only be called if batch support is enabled. If multiple batchGroups are submitted the handlers will be called for every batchGroup.
	 *
	 * @param {object} [mParameters] a map which contains the following parameter properties:
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] defines the group that should be submitted. If not specified all deferred groups will be submitted. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {function} [mParameters.success] a callback function which is called when the data has been successfully updated. The handler can have the following parameters: <code>oData</code>. <code>oData</code> contains the
	 * parsed response data as a Javascript object. The batch response is in the <code>__batchResponses</code> property which may contain further <code>__changeResponses</code> in an array depending on the amount of changes
	 * and changesets of the actual batch request which was sent to the backend.
	 * The changeResponses contain the actual response of that changeset in the <code>response</code> property.
	 * For each changeset there is also a <code>__changeResponse</code> property.
	 * @param {function} [mParameters.error] a callback function which is called when the request failed. The handler can have the parameter: <code>oError</code> which contains additional error information
	 * @param {string} [mParameters.eTag] an ETag which can be used for concurrency control. If it is specified, it will be used in an If-Match-Header in the request to the server for this entry
	 * @return {object} an object which has an <code>abort</code> function to abort the current request or requests
	 *
	 * @public
	 */
	ODataModel.prototype.submitChanges = function(mParameters) {
		var oRequest, sGroupId, oGroupInfo, fnSuccess, fnError,
			oRequestHandle, vRequestHandleInternal,
			bAborted = false, sMethod, mChangedEntities,
			mParams,
			that = this;

		if (mParameters) {
			sGroupId = mParameters.groupId || mParameters.batchGroupId;
			fnSuccess =	mParameters.success;
			fnError = mParameters.error;
			// ensure merge paramater backwards compatibility
			if (mParameters.merge !== undefined) {
				sMethod =  mParameters.merge ? "MERGE" : "PUT";
			}
		}

		if (sGroupId && !this.mDeferredGroups[sGroupId]) {
			jQuery.sap.log.fatal(this + " submitChanges: \"" + sGroupId + "\" is not a deferred group!");
		}

		mChangedEntities = jQuery.sap.extend(true, {}, that.mChangedEntities);

		this.oMetadata.loaded().then(function() {
			jQuery.each(mChangedEntities, function(sKey, oData) {
				oGroupInfo = that._resolveGroup(sKey);
				if (oGroupInfo.groupId === sGroupId || !sGroupId) {
					oRequest = that._processChange(sKey, oData, sMethod || that.sDefaultUpdateMethod);
					oRequest.key = sKey;
					//get params for created entries: could contain success/error handler
					mParams = oData.__metadata && oData.__metadata.created ? oData.__metadata.created : {};
					if (oGroupInfo.groupId in that.mDeferredGroups) {
						that._pushToRequestQueue(that.mDeferredRequests, oGroupInfo.groupId, oGroupInfo.changeSetId, oRequest, mParams.success, mParams.error);
					}
				}
			});

			vRequestHandleInternal = that._processRequestQueue(that.mDeferredRequests, sGroupId, fnSuccess, fnError);
			if (bAborted) {
				oRequestHandle.abort();
			}
		});

		oRequestHandle = {
			abort: function() {
				if (vRequestHandleInternal) {
					if (jQuery.isArray(vRequestHandleInternal)) {
						jQuery.each(vRequestHandleInternal, function(i, oRequestHandle) {
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
		var that = this, sRootPath;
		function updateChangedEntities(oOriginalObject, oChangedObject) {
			jQuery.each(oChangedObject,function(sKey) {
				var sActPath = sRootPath + '/' + sKey;
				if (jQuery.isPlainObject(oChangedObject[sKey]) && jQuery.isPlainObject(oOriginalObject[sKey])) {
					updateChangedEntities(oOriginalObject[sKey], oChangedObject[sKey]);
					if (jQuery.isEmptyObject(oChangedObject[sKey])) {
						delete oChangedObject[sKey];
					}
				} else if (jQuery.sap.equal(oChangedObject[sKey], oOriginalObject[sKey]) && !that.isLaundering(sActPath)) {
					delete oChangedObject[sKey];
				}
			});
		}

		jQuery.each(mChangedEntities, function(sKey, oData) {
			if (sKey in that.mChangedEntities) {
				var oEntry = that._getObject('/' + sKey, null, true);
				var oChangedEntry = that._getObject('/' + sKey);

				jQuery.sap.extend(true, oEntry, oData);

				sRootPath = '/' + sKey;
				updateChangedEntities(oEntry, oChangedEntry);

				if (jQuery.isEmptyObject(oChangedEntry)) {
					delete that.mChangedEntities[sKey];
					that.abortInternalRequest(sKey, that._resolveGroup(sKey).groupId);
				} else {
					that.mChangedEntities[sKey] = oChangedEntry;
					oChangedEntry.__metadata = {};
					jQuery.extend(oChangedEntry.__metadata, oEntry.__metadata);
				}
			}
		});
	};

	/**
	 *
	 * Resets the collected changes by the setProperty method.
	 *
	 * @param {array} [aPath] 	Array of paths that should be resetted.
	 * 							If no array is passed all changes will be resetted.
	 *
	 * @public
	 */
	ODataModel.prototype.resetChanges = function(aPath) {
		var that = this, aParts, oEntityInfo = {}, oChangeObject, oEntityMetadata;

		if (aPath) {
			jQuery.each(aPath, function(iIndex, sPath) {
				that.getEntityByPath(sPath, null, oEntityInfo);
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
					if (jQuery.isEmptyObject(that.mChangedEntities[sKey]) || !oEntityInfo.propertyPath) {
						that.oMetadata.loaded().then(function() {
							that.abortInternalRequest(sKey, that._resolveGroup(sKey).groupId);
						});
						delete that.mChangedEntities[sKey];
					} else {
						that.mChangedEntities[sKey].__metadata = oEntityMetadata;
					}
				} else {
					jQuery.sap.log.warning(that + " - resetChanges: " + sPath + " is not changed");
				}
			});
		} else {
			jQuery.each(this.mChangedEntities, function(sKey, oObject) {
				that.oMetadata.loaded().then(function() {
					that.abortInternalRequest(sKey, that._resolveGroup(sKey).groupId);
				});
				delete that.mChangedEntities[sKey];
			});
		}
		this.checkUpdate(true);
	};

	/**
	 * Sets a new value for the given property <code>sPropertyName</code> in the model.
	 *
	 * If the changeBatchGroup for the changed EntityType is set to deferred changes could be submitted
	 * with submitChanges. Otherwise the change will be submitted directly.
	 *
	 * @param {string}  sPath path of the property to set
	 * @param {any}     oValue value to set the property to
	 * @param {object} [oContext=null] the context which will be used to set the property
	 * @param {boolean} [bAsyncUpdate] whether to update other bindings dependent on this property asynchronously
	 * @return {boolean} true if the value was set correctly and false if errors occurred like the entry was not found or another entry was already updated.
	 * @public
	 */
	ODataModel.prototype.setProperty = function(sPath, oValue, oContext, bAsyncUpdate) {

		var oOriginalValue, sPropertyPath, mRequests, oRequest, oOriginalEntry, oEntry = { },
			sResolvedPath, aParts,	sKey, oGroupInfo, oRequestHandle, oEntityMetadata,
			mChangedEntities = {}, oEntityInfo = {}, mParams, oChangeObject,
			bFunction = false, that = this, bCreated;

		function updateChangedEntities(oOriginalObject, oChangedObject) {
			jQuery.each(oChangedObject,function(sKey) {
				if (jQuery.isPlainObject(oChangedObject[sKey]) && jQuery.isPlainObject(oOriginalObject[sKey])) {
					updateChangedEntities(oOriginalObject[sKey], oChangedObject[sKey]);
					if (jQuery.isEmptyObject(oChangedObject[sKey])) {
						delete oChangedObject[sKey];
					}
				} else if (jQuery.sap.equal(oChangedObject[sKey], oOriginalObject[sKey])) {
					delete oChangedObject[sKey];
				}
			});
		}

		sResolvedPath = this.resolve(sPath, oContext, true);

		var oEntry = this.getEntityByPath(sResolvedPath, null, oEntityInfo);
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
			oEntry.__metadata = jQuery.extend({},oEntityMetadata);
			this.mChangedEntities[sKey] = oEntry;
		}

		var oChangeObject = this.mChangedEntities[sKey];

		// if property is not available check if it is a complex type and update it
		aParts = oEntityInfo.propertyPath.split("/");
		for (var i = 0; i < aParts.length - 1; i++) {
			if (!oChangeObject.hasOwnProperty(aParts[i])) {
				oChangeObject[aParts[i]] = {};
			}
			oChangeObject = oChangeObject[aParts[i]];
		}

		bFunction = oOriginalEntry.__metadata.created && oOriginalEntry.__metadata.created.functionImport;

		oChangeObject[sPropertyPath] = oValue;

		//reset clone if oValue equals the original value
		if (jQuery.sap.equal(oValue, oOriginalValue) && !this.isLaundering('/' + sKey) && !bFunction) {
			//delete metadata to check if object has changes
			oEntityMetadata = this.mChangedEntities[sKey].__metadata;
			bCreated = oEntityMetadata && oEntityMetadata.created;
			delete this.mChangedEntities[sKey].__metadata;
			// check for 'empty' complex types objects and delete it - not for created entities
			if (!bCreated) {
				updateChangedEntities(oOriginalEntry, this.mChangedEntities[sKey]);
			}
			if (jQuery.isEmptyObject(this.mChangedEntities[sKey])) {
				delete this.mChangedEntities[sKey];
				mChangedEntities[sKey] = true;
				this.checkUpdate(false, bAsyncUpdate, mChangedEntities);
				that.oMetadata.loaded().then(function() {
					//setProperty with no change does not create a request the first time so no handle exists
					that.abortInternalRequest(sKey, that._resolveGroup(sKey).groupId);
				});
				return true;
			}
			this.mChangedEntities[sKey].__metadata = oEntityMetadata;
		}

		oGroupInfo = this._resolveGroup(sKey);

		mRequests = this.mRequests;

		if (oGroupInfo.groupId in this.mDeferredGroups) {
			mRequests = this.mDeferredRequests;
			oRequest = this._processChange(sKey, {__metadata : oEntry.__metadata});
		} else {
			oRequest = this._processChange(sKey, this._getObject('/' + sKey));
		}
		oRequest.key = sKey;
		//get params for created entries: could contain success/error handler
		mParams = oChangeObject.__metadata && oChangeObject.__metadata.created ? oChangeObject.__metadata.created : {};

		this.oMetadata.loaded().then(function() {
			oRequestHandle = {
					abort: function() {
						oRequest._aborted = true;
					}
			};
			if (that.mChangeHandles[sKey]) {
				that.abortInternalRequest(sKey, that._resolveGroup(sKey).groupId);
			}
			that.mChangeHandles[sKey] = oRequestHandle;
			that._pushToRequestQueue(mRequests, oGroupInfo.groupId, oGroupInfo.changeSetId, oRequest, mParams.success, mParams.error);
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
		return false;
	};

	/**
	 * Set custom headers which are provided in a key/value map. These headers are used for requests against the OData backend.
	 * Private headers which are set in the ODataModel cannot be modified.
	 * These private headers are: accept, accept-language, x-csrf-token, MaxDataServiceVersion, DataServiceVersion.
	 *
	 * To remove these headers simply set the mCustomHeaders parameter to null. Please also note that when calling this method again all previous custom headers
	 * are removed unless they are specified again in the mCustomHeaders parameter.
	 *
	 * @param {object} mHeaders the header name/value map.
	 * @public
	 */
	ODataModel.prototype.setHeaders = function(mHeaders) {
		var mCheckedHeaders = {},
		that = this;
		this.mCustomHeaders = {};

		if (mHeaders) {
			jQuery.each(mHeaders, function(sHeaderName, sHeaderValue){
				// case sensitive check needed to make sure private headers cannot be overridden by difference in the upper/lower case (e.g. accept and Accept).
				if (that._isHeaderPrivate(sHeaderName)){
					jQuery.sap.log.warning(this + " - modifying private header: '" + sHeaderName + "' not allowed!");
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

	ODataModel.prototype._getHeaders = function(mHeaders) {
		var mCheckedHeaders = {},
		that = this;
		if (mHeaders) {
			jQuery.each(mHeaders, function(sHeaderName, sHeaderValue){
				// case sensitive check needed to make sure private headers cannot be overridden by difference in the upper/lower case (e.g. accept and Accept).
				if (that._isHeaderPrivate(sHeaderName)){
					jQuery.sap.log.warning(this + " - modifying private header: '" + sHeaderName + "' not allowed!");
				} else {
					mCheckedHeaders[sHeaderName] = sHeaderValue;
				}
			});
		}
		return jQuery.extend({}, this.mCustomHeaders, mCheckedHeaders, this.oHeaders);
	};

	/**
	 * Returns all headers and custom headers which are stored in the OData model.
	 * @return {object} the header map
	 * @public
	 */
	ODataModel.prototype.getHeaders = function() {
		return jQuery.extend({}, this.mCustomHeaders, this.oHeaders);
	};

	/**
	 * Searches the specified headers map for the specified header name and returns the found header value
	 * @param {string} sHeader The header
	 * @param {map} mHeaders The map of headers
	 * @returns {string} sHeaderValue The value of the header
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
	 * Checks if there exist pending changes in the model created by the setProperty method.
	 * @return {boolean} true/false
	 * @public
	 */
	ODataModel.prototype.hasPendingChanges = function() {
		return !jQuery.isEmptyObject(this.mChangedEntities);
	};

	/**
	 * Checks if there are pending requests, either ongoing or sequential
	 * @return {boolean} true/false
	 * @public
	 */
	ODataModel.prototype.hasPendingRequests = function() {
		return this.aPendingRequestHandles.length > 0;
	};

	ODataModel.prototype.getPendingChanges = function() {
		return jQuery.sap.extend(true, {}, this.mChangedEntities);
	};
	/**
	 * update all bindings
	 * @param {boolean} [bForceUpdate=false] If set to false an update  will only be done when the value of a binding changed.
	 * @public
	 */
	ODataModel.prototype.updateBindings = function(bForceUpdate) {
		this.checkUpdate(bForceUpdate);
	};

	/**
	 * Enable/Disable XCSRF-Token handling
	 * @param {boolean} [bTokenHandling=true] whether to use token handling or not
	 * @public
	 */
	ODataModel.prototype.setTokenHandlingEnabled  = function(bTokenHandling) {
		this.bTokenHandling = bTokenHandling;
	};

	/**
	 * @param {boolean} [bUseBatch=false] whether the requests should be encapsulated in a batch request
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
	 * @param {any} vValue the value to format
	 * @param {string} sType the EDM type (e.g. Edm.Decimal)
	 * @return {string} the formatted value
	 */
	ODataModel.prototype.formatValue = function(vValue, sType) {
		return ODataUtils.formatValue(vValue, sType);
	};

	/**
	 * Deletes a created entry from the request queue and the model.
	 * @param {sap.ui.model.Context} oContext The context object pointing to the created entry
	 * @public
	 */
	ODataModel.prototype.deleteCreatedEntry = function(oContext) {
		var that = this, sKey, sGroupId;
		if (oContext) {
			var sKey = oContext.getPath().substr(1);
			sGroupId = this._resolveGroup(sKey).groupId;
			that.oMetadata.loaded().then(function() {
				that.abortInternalRequest(sKey, sGroupId);
			});
			that._removeEntity(sKey);
		}
	};

	/**
	 * Creates a new entry object which is described by the metadata of the entity type of the
	 * specified sPath Name. A context object is returned which can be used to bind
	 * against the newly created object.
	 *
	 * For each created entry a request is created and stored in a request queue.
	 * The request queue can be submitted by calling submitChanges. To delete a created
	 * entry from the request queue call deleteCreateEntry.
	 *
	 * The optional properties parameter can be used as follows:
	 *
	 *   - properties could be an array containing the property names which should be included
	 *     in the new entry. Other properties defined in the entity type are not included.
	 *   - properties could be an object which includes the desired properties and the values
	 *     which should be used for the created entry.
	 *
	 * If properties is not specified, all properties in the entity type will be included in the
	 * created entry.
	 *
	 * If there are no values specified the properties will have undefined values.
	 *
	 * Please note that deep creates (including data defined by navigationproperties) are not supported
	 *
	 * @param {String} sPath Name of the path to the EntitySet
	 * @param {map} mParameters A map of the following parameters:
	 * @param {array|object} [mParameters.properties] An array that specifies a set of properties or the entry
	 * @param {string} [mParameters.batchGroupId] Deprecated - use groupId instead
	 * @param {string} [mParameters.groupId] The groupId. Requests belonging to the same groupId will be bundled in one batch request.
	 * @param {string} [mParameters.changeSetId] The changeSetId
	 * @param {sap.ui.model.Context} [mParameters.context] The binding context
	 * @param {function} [mParameters.success] The success callback function
	 * @param {function} [mParameters.error] The error callback function
	 * @param {map} [mParameters.headers] A map of headers
	 * @param {map} [mParameters.urlParameters] A map of url parameters
	 *
	 * @return {sap.ui.model.Context} oContext A Context object that point to the new created entry.
	 * @public
	 */
	ODataModel.prototype.createEntry = function(sPath, mParameters) {
		var fnSuccess, fnError, oRequest, sUrl, sETag, oContext,
			sKey, aUrlParams, sGroupId, sChangeSetId, oRequestHandle,
			mUrlParams, mHeaders, mRequests, vProperties, oEntity = {},
			fnCreated,
			sMethod = "POST",
			that = this;

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
		}

		sGroupId = sGroupId ? sGroupId : this.sDefaultChangeGroup;
		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);
		mHeaders = this._getHeaders(mHeaders);

		function create() {
			var oCreatedContext;
			if (!jQuery.sap.startsWith(sPath, "/")) {
				sPath = "/" + sPath;
			}
			var oEntityMetadata = that.oMetadata._getEntityTypeByPath(sPath);
			if (!oEntityMetadata) {

				jQuery.sap.assert(oEntityMetadata, "No Metadata for collection " + sPath + " found");
				return undefined;
			}
			if (typeof vProperties === "object" && !jQuery.isArray(vProperties)) {
				oEntity = vProperties;
			} else {
				for (var i = 0; i < oEntityMetadata.property.length; i++) {
					var oPropertyMetadata = oEntityMetadata.property[i];

					var bPropertyInArray = jQuery.inArray(oPropertyMetadata.name,vProperties) > -1;
					if (!vProperties || bPropertyInArray)  {
						oEntity[oPropertyMetadata.name] = that._createPropertyValue(oPropertyMetadata.type);
						if (bPropertyInArray) {
							vProperties.splice(vProperties.indexOf(oPropertyMetadata.name),1);
						}
					}
				}
				if (vProperties) {
					jQuery.sap.assert(vProperties.length === 0, "No metadata for the following properties found: " + vProperties.join(","));
				}
			}
			//get EntitySet metadata for data storage
			var oEntitySetMetadata = that.oMetadata._getEntitySetByType(oEntityMetadata);
			sKey = oEntitySetMetadata.name + "('" + jQuery.sap.uid() + "')";

			oEntity.__metadata = {type: "" + oEntityMetadata.entityType, uri: that.sServiceUrl + '/' + sKey, created: {
				//store path for later POST
				key: sPath.substring(1),
				success: fnSuccess,
				error: fnError,
				headers: mHeaders,
				urlParameters: mUrlParams,
				groupId: sGroupId,
				changeSetId: sChangeSetId,
				eTag: sETag}};

			that._addEntity(jQuery.sap.extend(true, {}, oEntity));
			that.mChangedEntities[sKey] = oEntity;

			sUrl = that._createRequestUrl(sPath, oContext, aUrlParams, that.bUseBatch);
			oRequest = that._createRequest(sUrl, sMethod, mHeaders, oEntity, sETag);

			oCreatedContext = that.getContext("/" + sKey); // context wants a path
			oRequest.key = sKey;

			mRequests = that.mRequests;
			if (sGroupId in that.mDeferredGroups) {
				mRequests = that.mDeferredRequests;
			}

			that.oMetadata.loaded().then(function() {
				that._pushToRequestQueue(mRequests, sGroupId, sChangeSetId, oRequest, fnSuccess, fnError, mParameters);

				oRequestHandle = {
						abort: function() {
							oRequest._aborted = true;
						}
				};

				that.mChangeHandles[sKey] = oRequestHandle;

				that._processRequestQueueAsync(that.mRequests);
			});
			return oCreatedContext;
		}

		// If no callback function is provided context must be returned sychnronously
		if (fnCreated) {
			this.oMetadata.loaded().then(function() {
				fnCreated(create());
			});
		} else if (this.oMetadata.isLoaded()) {
			return create();
		} else {
			jQuery.sap.log.error("Tried to use createEntry without created-callback, before metadata is available!");
		}
	};

	/**
	 * Return value for a property. This can also be a ComplexType property
	 * @param {string} full qualified Type name
	 * @returns {any} vValue The property value
	 * @private
	 */
	ODataModel.prototype._createPropertyValue = function(sType) {
		var aTypeName = this.oMetadata._splitName(sType); // name, namespace
		var sNamespace = aTypeName[1];
		var sTypeName = aTypeName[0];
		if (sNamespace.toUpperCase() !== 'EDM') {
			var oComplexType = {};
			var oComplexTypeMetadata = this.oMetadata._getObjectMetadata("complexType",sTypeName,sNamespace);
			jQuery.sap.assert(oComplexTypeMetadata, "Complex type " + sType + " not found in the metadata !");
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
	 * Returns the default value for a property
	 * @param {string} sType The property type
	 * @param {string} sNamespace The property Namespaace
	 * @returns {string} sDefault Returns undefined
	 * @private
	 */
	ODataModel.prototype._getDefaultPropertyValue = function(sType, sNamespace) {
		return undefined;
	};

	/**
	 * remove url params from path and make path absolute if not already
	 *
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @returns {string} sPath The resolved path
	 * @private
	 */
	ODataModel.prototype._normalizePath = function(sPath, oContext) {
		// remove query params from path if any
		if (sPath && sPath.indexOf('?') !== -1 ) {
			sPath = sPath.substr(0, sPath.indexOf('?'));
		}
		if (!oContext && !jQuery.sap.startsWith(sPath,"/")) {
			jQuery.sap.log.fatal(this + " path " + sPath + " must be absolute if no Context is set");
		}
		return this.resolve(sPath, oContext);
	};

	/**
	 * Enable/Disable automatic updates of all Bindings after change operations
	 * @param {boolean} bRefreshAfterChange Refresh after change
	 * @public
	 * @since 1.16.3
	 */
	ODataModel.prototype.setRefreshAfterChange = function(bRefreshAfterChange) {
		this.bRefreshAfterChange = bRefreshAfterChange;
	};

	/**
	 * Checks if Path points to a list or a single entry
	 * @param {string} sPath The binding path
	 * @param {sap.ui.model.Context} [oContext] The binding context
	 * @returns {boolean} bList Is List
	 * @private
	 */
	ODataModel.prototype.isList = function(sPath, oContext) {
		sPath = this.resolve(sPath, oContext);
		return sPath && sPath.substr(sPath.lastIndexOf("/")).indexOf("(") === -1;
	};

	/**
	 * Checks if path points to a metamodel property
	 * @param {string} sPath The binding path
	 * @returns {boolean}
	 * @private
	 */
	ODataModel.prototype.isMetaModelPath = function(sPath) {
		return sPath.indexOf("##") == 0 || sPath.indexOf("/##") > -1;
	};

	/**
	 * Wraps the OData.request method and keeps track of pending requests
	 *
	 * @param {object} oRequest The request object
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Error callback function
	 * @param {object} oHandler The request handler object
	 * @param {object} oHttpClient The HttpClient object
	 * @param {object} oMetadata The metadata object
	 * @returns {object} oRequestHandle The request handle
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
				var iIndex = jQuery.inArray(oRequestHandle, that.aPendingRequestHandles);
				if (iIndex > -1) {
					that.aPendingRequestHandles.splice(iIndex, 1);
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
			jQuery.sap.clearDelayedCall(this.sMetadataLoadEvent);
		}
		if (this.oMetadataFailedEvent) {
			jQuery.sap.clearDelayedCall(this.oMetadataFailedEvent);
		}

		if (this.oMetadata) {
			this.oMetadata.detachFailed(this.onMetadataFailed);
			// Only destroy metadata, if request is still running and no other models
			// are registered to it
			if (!this.oMetadata.isLoaded() && !this.oMetadata.hasListeners("loaded")) {
				this.oMetadata.destroy();
				delete this.oServiceData.oMetadata;
			}
			delete this.oMetadata;
		}


		if (this.oAnnotations) {
			this.oAnnotations.detachSomeLoaded(this.onAnnotationsLoaded);
			this.oAnnotations.detachAllFailed(this.onAnnotationsFailed);

			this.oAnnotations.destroy();
			delete this.oAnnotations;
		}

	};

	/**
	 * Setting batch groups as deferred. Requests that belongs to a deferred batch group will be sent manually
	 * via a submitChanges call.
	 *
	 * @param {array} aGroupIds Array of batchGroupIds that should be set as deferred
	 * @deprecated Since 1.32 use setDeferredGroups instead
	 * @public
	 */
	ODataModel.prototype.setDeferredBatchGroups = function(aGroupIds) {
		this.setDeferredGroups(aGroupIds);
	};

	/**
	 * Setting request groups as deferred. Requests that belongs to a deferred group will be sent manually
	 * via a submitChanges call.
	 *
	 * @param {array} aGroupIds Array of GroupIds that should be set as deferred
	 * @public
	 */
	ODataModel.prototype.setDeferredGroups = function(aGroupIds) {
		var that = this;
		this.mDeferredGroups = {};
		jQuery.each(aGroupIds, function(iIndex,sGroupId){
			that.mDeferredGroups[sGroupId] = sGroupId;
		});
	};

	/**
	 * Returns the array of batchGroupIds that are set as deferred
	 *
	 * @returns {array} aGroupIds The array of deferred batchGroupIds
	 * @deprecated Since 1.32 use getDeferredGroups instead
	 * @public
	 */
	ODataModel.prototype.getDeferredBatchGroups = function() {
		return this.getDeferredGroups();
	};

		/**
	 * Returns the array of GroupIds that are set as deferred
	 *
	 * @returns {array} aGroupIds The array of deferred GroupIds
	 * @public
	 */
	ODataModel.prototype.getDeferredGroups = function() {
		var aGroupIds = [], i = 0;
		jQuery.each(this.mDeferredGroups, function(sKey, sGroupId){
			aGroupIds[i] = sGroupId;
			i++;
		});
		return aGroupIds;
	};

	/**
	 * Definition of batchGroups per EntityType for "TwoWay" changes
	 *
	 * @param {map} mGroups A map containing the definition of bacthGroups for TwoWay changes. The Map has the
	 * following format:
	 * {
	 * 		"EntityTypeName": {
	 * 			batchGroupId: "ID",
	 * 			[changeSetId: "ID",]
	 * 			[single: true/false,]
	 * 		}
	 * }
	 * bacthGroupId: Defines the bacthGroup for changes of the defined EntityTypeName
	 * changeSetId: Defines a changeSetId wich bundles the changes for the EntityType.
	 * single: Defines if every change will get an own changeSet (true)
	 * @deprecated Since 1.32 use setChangesGroups instead
	 * @public
	 */
	ODataModel.prototype.setChangeBatchGroups = function(mGroups) {
		jQuery.each(mGroups, function(sEntityName, oGroup) {
			oGroup.groupId = oGroup.batchGroupId;
		});
		this.setChangeGroups(mGroups);
	};

	/**
	 * Definition of groups per EntityType for "TwoWay" changes
	 *
	 * @param {map} mGroups A map containing the definition of bacthGroups for TwoWay changes. The Map has the
	 * following format:
	 * {
	 * 		"EntityTypeName": {
	 * 			groupId: "ID",
	 * 			[changeSetId: "ID",]
	 * 			[single: true/false,]
	 * 		}
	 * }
	 * GroupId: Defines the Group for changes of the defined EntityTypeName
	 * changeSetId: Defines a changeSetId wich bundles the changes for the EntityType.
	 * single: Defines if every change will get an own changeSet (true)
	 * @public
	 */
	ODataModel.prototype.setChangeGroups = function(mGroups) {
		this.mChangeGroups = mGroups;
	};

	/**
	 * Returns the definition of batchGroups per EntityType for TwoWay changes
	 * @returns {map} mChangeBatchGroups Definition of bactchGRoups for "TwoWay" changes
	 * @deprecated Since 1.36 use getChangeGroups instead
	 * @public
	 */
	ODataModel.prototype.getChangeBatchGroups = function() {
		return this.getChangeGroups();
	};

	/**
	 * Returns the definition of groups per EntityType for TwoWay changes
	 * @returns {map} mChangeGroups Definition of Groups for "TwoWay" changes
	 * @public
	 */
	ODataModel.prototype.getChangeGroups = function() {
		return this.mChangeGroups;
	};

	/**
	 * Sets the MessageParser that is invoked upon every back-end request. This message parser
	 * analyzes the response and notifies the MessageManager about added and deleted messages.
	 *
	 * @param {object|null} [oParser] The MessageParser instance that parses the responses and adds messages to the MessageManager
	 * @return {ODataModel} Model instance for method chaining
	 */
	ODataModel.prototype.setMessageParser = function(oParser) {
		if (!(oParser instanceof MessageParser)) {
			jQuery.sap.log.error("Given MessageParser is not of type sap.ui.core.message.MessageParser");
			return;
		}
		oParser.setProcessor(this);
		this.oMessageParser = oParser;
		return this;
	};

	/**
	 * Gives the back-end response to the MessageParser in case there is one attached
	 *
	 * @return {void}
	 * @private
	 */
	ODataModel.prototype._parseResponse = function(oResponse, oRequest, mGetEntities, mChangeEntities) {
		try {
			if (!this.oMessageParser) {
				this.oMessageParser = new ODataMessageParser(this.sServiceUrl, this.oMetadata);
				this.oMessageParser.setProcessor(this);
			}
			// Parse response and delegate messages to the set message parser
			return this.oMessageParser.parse(oResponse, oRequest, mGetEntities, mChangeEntities);
		} catch (ex) {
			jQuery.sap.log.error("Error parsing OData messages: " + ex);
		}
	};

	/**
	 * REgister function calls that should be called after an update (e.g. calling dataReceived event of a binding)
	 * @param {function} oFunction The callback function
	 * @private
	 */
	ODataModel.prototype.callAfterUpdate = function(oFunction) {
		this.aCallAfterUpdate.push(oFunction);
	};

	/**
	 * Returns an instance of an OData meta model which offers a unified access to both OData V2
	 * meta data and V4 annotations. It uses the existing {@link sap.ui.model.odata.ODataMetadata}
	 * as a foundation and merges V4 annotations from the existing
	 * {@link sap.ui.model.odata.v2.ODataAnnotations} directly into the corresponding model element.
	 *
	 * <b>BEWARE:</b> Access to this OData meta model will fail before the promise returned by
	 * {@link sap.ui.model.odata.ODataMetaModel#loaded loaded} has been resolved!
	 *
	 * @public
	 * @returns {sap.ui.model.odata.ODataMetaModel} The meta model for this ODataModel
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
				jQuery.sap.log.error("error in ODataMetaModel.loaded(): " + sMessage, sDetails,
					"sap.ui.model.odata.v2.ODataModel");
			});
		}
		return this.oMetaModel;
	};

	/**
	 * Returns the original value for the property with the given path and context.
	 * The original value is the value that was last responded by the server.
	 *
	 * @param {string} sPath the path/name of the property
	 * @param {object} [oContext] the context if available to access the property value
	 * @returns {any} vValue the value of the property
	 * @public
	 */
	ODataModel.prototype.getOriginalProperty = function(sPath, oContext) {
		return this._getObject(sPath, oContext, true);
	};

	/**
	 * Returns the nearest entity of a path relative to the given context.
	 * Additional entity information will be passed back to the given <code>oEntityInfo</code> object if
	 * a nearest entity exists.
	 *
	 * @param {string} sPath path to an entity
	 * @param {sap.ui.core.Context} [oContext] context to resolve a relative path against
	 * @param {object} [oEntityInfo.key] The key of the entity.
	 *                 [oEntityInfo.propertyPath] The propertyPath within the entity.
	 * @param {sap.ui.core.Context} [oContext] context to resolve a relative path against
	 * @return {object} the nearest entity object or null if no entity can be resolved.
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
			if (jQuery.isPlainObject(oObject)) {
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
	 * Resolve the path relative to the given context.
	 * In addition to {@link sap.ui.model.Model#resolve resolve} a
	 * canonical path can be resolved that will not contain navigation properties.
	 *
	 * @param {string} sPath path to resolve
	 * @param {sap.ui.core.Context} [oContext] context to resolve a relative path against
	 * @param {boolean} [bCanonical] if true the canonical path is returned
	 * @return {string} resolved path, canonical path or undefined
	 */
	ODataModel.prototype.resolve = function(sPath, oContext, bCanonical) {
		var sResolvedPath = Model.prototype.resolve.call(this,sPath, oContext);
		if (bCanonical) {
			var oEntityInfo = {},
				oEntity = this.getEntityByPath(sPath, oContext, oEntityInfo);
			if (oEntity) {
				if (oEntityInfo.propertyPath) {
					return "/" + oEntityInfo.key + "/" + oEntityInfo.propertyPath;
				} else {
					return "/" + oEntityInfo.key;
				}
			} else {
				return undefined;
			}
		}
		return sResolvedPath;
	};

	/**
	 * Returns whether a given path relative to the given contexts is in laundering state.
	 * If data is send to the server the data state becomes laundering until the
	 * data was accepted or rejected
	 *
	 * @param {string} sPath path to resolve
	 * @param {sap.ui.core.Context} [oContext] context to resolve a relative path against
	 * @returns {boolean} true if the data in this path is laundering
	 */
	ODataModel.prototype.isLaundering = function(sPath, oContext) {
		var sResolvedPath = this.resolve(sPath, oContext);
		return (sResolvedPath in this.mLaunderingState) && this.mLaunderingState[sResolvedPath] > 0;
	};

	/**
	 * Increases laundering state for a canonical path
	 * @param {string} sPath the canonical path
	 * @param {object} oChangedEntity the changed entity
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
			if (jQuery.isPlainObject(oObject)) {
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
	 * Decrease one laundering state for the given canonical path
	 * @param {string} sPath the canonical path
	 * @param {object} oChangedEntity the changed entity
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
			if (jQuery.isPlainObject(oObject)) {
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

	return ODataModel;
});
