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
sap.ui.define(['jquery.sap.global', 'sap/ui/model/Model', 'sap/ui/model/odata/ODataUtils', 'sap/ui/model/odata/CountMode', 'sap/ui/model/odata/OperationMode', './ODataContextBinding', './ODataListBinding', 'sap/ui/model/odata/ODataMetadata', 'sap/ui/model/odata/ODataPropertyBinding', 'sap/ui/model/odata/v2/ODataTreeBinding', 'sap/ui/model/odata/ODataMetaModel', 'sap/ui/thirdparty/URI', 'sap/ui/thirdparty/datajs'],
		function(jQuery, Model, ODataUtils, CountMode, OperationMode, ODataContextBinding, ODataListBinding, ODataMetadata, ODataPropertyBinding, ODataTreeBinding, ODataMetaModel, URI1, datajs) {
	"use strict";


	/*global OData *///declare unusual global vars for JSLint/SAPUI5 validation

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
	 * @param {string} [mParameters.defaultOperationMode] sets the default operation mode for the model. If not set, sap.ui.model.odata.OperationModel.Server is used.
	 * @param {map} [mParameters.metadataNamespaces] a map of namespaces (name => URI) used for parsing the service metadata.
	 *
	 * @class
	 * Model implementation for oData format
	 *
	 * @extends sap.ui.model.Model
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataModel
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v2.ODataModel", /** @lends sap.ui.model.odata.v2.ODataModel.prototype */ {

		constructor : function(sServiceUrl, mParameters) {
			Model.apply(this, arguments);

			var sUser, sPassword,
			mHeaders, bTokenHandling,
			bWithCredentials, sMaxDataServiceVersion,
			bUseBatch, bRefreshAfterChange, sAnnotationURI, bLoadAnnotationsJoined,
			sDefaultCountMode, sDefaultBindingMode, sDefaultOperationMode, mMetadataNamespaces,
			mServiceUrlParams, mMetadataUrlParams, aMetadataUrlParams, bJSON, that = this;

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
			}
			this.mSupportedBindingModes = {"OneWay": true, "OneTime": true, "TwoWay":true};
			this.sDefaultBindingMode = sDefaultBindingMode || sap.ui.model.BindingMode.OneWay;

			this.bJSON = bJSON !== false;
			this.aPendingRequestHandles = [];
			this.aCallAfterUpdate = [];
			this.mRequests = {};
			this.mDeferredRequests = {};
			this.mChangedEntities = {};
			this.mChangeHandles = {};
			this.mDeferredBatchGroups = {};
			this.mChangeBatchGroups = {'*' : {batchGroupId:undefined, single: true}};

			this.bTokenHandling = bTokenHandling !== false;
			this.bWithCredentials = bWithCredentials === true;
			this.bUseBatch = bUseBatch !== false;
			this.bRefreshAfterChange = bRefreshAfterChange !== false;
			this.sMaxDataServiceVersion = sMaxDataServiceVersion;
			this.bLoadMetadataAsync = true;
			this.bLoadAnnotationsJoined = bLoadAnnotationsJoined !== false;
			this.sAnnotationURI = sAnnotationURI;
			this.sDefaultCountMode = sDefaultCountMode || CountMode.Request;
			this.sDefaultOperationMode = sDefaultOperationMode || OperationMode.Server;
			this.oMetadataLoadEvent = null;
			this.oMetadataFailedEvent = null;
			this.sRefreshBatchGroupId = undefined;

			//collect internal changes in a deferred batchgroup as default
			this.sDefaultChangeBatchGroup = "changes";
			this.setDeferredBatchGroups([this.sDefaultChangeBatchGroup]);
			this.setChangeBatchGroups({"*":{batchGroupId: this.sDefaultChangeBatchGroup}});

			// Load annotations support on demand
			if (this.sAnnotationURI) {
				jQuery.sap.require("sap.ui.model.odata.ODataAnnotations");
			}

			this.oData = {};
			this.oMetadata = null;
			this.oAnnotations = null;
			this.aUrlParams = [];

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

			// Get/create service specific data container
			this.oServiceData = ODataModel.mServiceData[this.sServiceUrl];
			if (!this.oServiceData) {
				ODataModel.mServiceData[this.sServiceUrl] = {};
				this.oServiceData = ODataModel.mServiceData[this.sServiceUrl];
			}

			if (!this.oServiceData.oMetadata) {
				aMetadataUrlParams = ODataUtils._createUrlParamsArray(mMetadataUrlParams);
				//create Metadata object
				this.oMetadata = new sap.ui.model.odata.ODataMetadata(this._createRequestUrl("/$metadata", undefined, aMetadataUrlParams),
						{ async: this.bLoadMetadataAsync, user: this.sUser, password: this.sPassword, headers: this.mCustomHeaders, namespaces: mMetadataNamespaces, withCredentials: this.bWithCredentials});
				this.oServiceData.oMetadata = this.oMetadata;
			} else {
				this.oMetadata = this.oServiceData.oMetadata;
			}

			if (mServiceUrlParams) {
				// new URL params used -> add to ones from sServiceUrl
				// do this after the Metadata request is created to not put the serviceUrlParams on this one
				this.aUrlParams = this.aUrlParams.concat(ODataUtils._createUrlParamsArray(mServiceUrlParams));
			}

			if (!this.oMetadata.isLoaded()) {
				this.oMetadata.attachLoaded(function(oEvent){
					that._initializeMetadata();
				}, this);
				this.oMetadata.attachFailed(function(oEvent) {
					that.fireMetadataFailed(oEvent.getParameters());
				});
			}

			if (this.oMetadata.isFailed()){
				this.refreshMetadata();
			}

			if (this.sAnnotationURI) {
				this.oAnnotations = new sap.ui.model.odata.ODataAnnotations(this.sAnnotationURI, this.oMetadata, { async: this.bLoadMetadataAsync });
				this.oAnnotations.attachFailed(function(oEvent) {
					that.fireAnnotationsFailed(oEvent.getParameters());
				});
				this.oAnnotations.attachLoaded(function(oEvent) {
					that.fireAnnotationsLoaded(oEvent.getParameters());
				});
			}

			if (this.oMetadata.isLoaded()) {
				this._initializeMetadata(true);
			}

			// prepare variables for request headers, data and metadata
			this.oHeaders = {};
			this.setHeaders(mHeaders);

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
			this.oHeaders["Accept-Language"] = sap.ui.getCore().getConfiguration().getLanguage();

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
			publicMethods : ["read", "create", "update", "remove", "submitChanges", "getServiceMetadata",
			                 "hasPendingChanges", "refresh", "refreshMetadata", "resetChanges", "setDefaultCountMode",
			                 "setDefaultBindingMode", "getDefaultBindingMode", "getDefaultCountMode",
			                 "setProperty", "getSecurityToken", "refreshSecurityToken", "setHeaders",
			                 "getHeaders", "setUseBatch", "setDeferredBatchGroups", "getDeferredBatchGroups",
			                 "setChangeBatchGroups", "getChangeBatchGroups"]
		}
	});

	//
	ODataModel.M_EVENTS = {
			RejectChange: "rejectChange",
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
	 * The 'requestFailed' event is fired, when data retrieval from a backend failed.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#requestFailed
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

	 /**
	 * The 'requestSent' event is fired, after a request has been sent to a backend.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#requestSent
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

	 /**
	 * The 'requestCompleted' event is fired, after a request has been completed (includes receiving a response),
	 * no matter whether the request succeeded or not.
	 *
	 * Note: Subclasses might add additional parameters to the event object. Optional parameters can be omitted.
	 *
	 * @name sap.ui.model.Model#requestCompleted
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

	ODataModel.prototype.fireRejectChange = function(mArguments) {
		this.fireEvent("rejectChange", mArguments);
		return this;
	};

	ODataModel.prototype.attachRejectChange = function(oData, fnFunction, oListener) {
		this.attachEvent("rejectChange", oData, fnFunction, oListener);
		return this;
	};

	ODataModel.prototype.detachRejectChange = function(fnFunction, oListener) {
		this.detachEvent("rejectChange", fnFunction, oListener);
		return this;
	};

	/**
	 * @param {boolean} bDelayEvent metadataLoaded event will be fired asynchronous
	 * @private
	 */
	ODataModel.prototype._initializeMetadata = function(bDelayEvent) {
		var that = this;
		this.bUseBatch = this.bUseBatch || this.oMetadata.getUseBatch();
		var doFire = function(bInitialize, bDelay){
			if (bDelay) {
				that.metadataLoadEvent = jQuery.sap.delayedCall(0, that, doFire, [that.bLoadMetadataAsync]);
			} else {
				if (bInitialize) {
					that.initialize();
				}
				that.fireMetadataLoaded({metadata: that.oMetadata});
				jQuery.sap.log.debug(that + " - metadataloaded fired");
			}
		};

		if (this.bLoadMetadataAsync && this.sAnnotationURI && this.bLoadAnnotationsJoined) {
			// In case of joined loading, wait for the annotations before firing the event
			// This is also tested in the fireMetadataLoaded-method and no event is fired in case
			// of joined loading.
			if (this.oAnnotations && this.oAnnotations.bInitialized) {
				doFire(true);
			} else {
				this.oAnnotations.attachLoaded(function() {
					// Now metadata was loaded and the annotations have been parsed
					doFire(true);
				}, this);
			}
		} else {
			// In case of synchronous or asynchronous non-joined loading, or if no annotations are
			// loaded at all, the events are fired individually
			doFire(this.bLoadMetadataAsync, bDelayEvent);
		}
	};

	/**
	 * refreshes the metadata for model, e.g. in case the first request for metadata has failed
	 *
	 * @public
	 */
	ODataModel.prototype.refreshMetadata = function(){
		if (this.oMetadata && this.oMetadata.refresh){
			this.oMetadata.refresh();
		}
	};


	/**
	 * Fire event annotationsLoaded to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {sap.ui.model.odata.ODataAnnotations} [mArguments.annotations]  the annotations object.
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
	ODataModel.prototype._createEventInfo = function(oRequest, vResponse, aBatchRequests) {
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
						oBatchRequest.url = oRequest.requestUri;
						oBatchRequest.method = oRequest.method;
						oBatchRequest.headers = oRequest.headers;
						if (oInnerResponse) {
							oBatchRequest.response = {};
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
					oEventInfo.requests.push(oBatchRequest);
				}
			}
		}
		if (vResponse) {
			oEventInfo.response = {};
			oEventInfo.success = true;
			if (vResponse.message) {
				oEventInfo.response.message = vResponse.message;
				oEventInfo.success = false;
			}
			if (vResponse.response) {
				// vResponse is response object
				vResponse = vResponse.response;
			}
			//in case of aborted requests there is no further info
			if (vResponse && vResponse.statusCode) {
				oEventInfo.response.headers = vResponse.headers;
				oEventInfo.response.statusCode = vResponse.statusCode;
				oEventInfo.response.statusText = vResponse.statusText;
				oEventInfo.response.responseText = vResponse.body !== undefined ? vResponse.body : vResponse.responseText;
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
			oEntry = this.oData[sKey];
			if (!oEntry) {
				oEntry = oData;
				this.oData[sKey] = oEntry;
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
	 * @returns {object} oData entry
	 * @private
	 */
	ODataModel.prototype._restoreReferences = function(oData){
		var that = this,
		aList,
		aResults = [];
		if (oData.results) {
			aList = [];
			jQuery.each(oData.results, function(i, entry) {
				aList.push(that._restoreReferences(entry));
			});
			return aList;
		} else {
			jQuery.each(oData, function(sPropName, oCurrentEntry) {
				if (oCurrentEntry && oCurrentEntry["__ref"]) {
					var oChildEntry = that._getObject("/" + oCurrentEntry["__ref"]);
					jQuery.sap.assert(oChildEntry, "ODataModel inconsistent: " + oCurrentEntry["__ref"] + " not found!");
					if (oChildEntry) {
						delete oCurrentEntry["__ref"];
						oData[sPropName] = oChildEntry;
						// check recursively for found child entries
						that._restoreReferences(oChildEntry);
					}
				} else if (oCurrentEntry && oCurrentEntry["__list"]) {
					jQuery.each(oCurrentEntry["__list"], function(j, sEntry) {
						var oChildEntry = that._getObject("/" + oCurrentEntry["__list"][j]);
						jQuery.sap.assert(oChildEntry, "ODataModel inconsistent: " +  oCurrentEntry["__list"][j] + " not found!");
						if (oChildEntry) {
							aResults.push(oChildEntry);
							// check recursively for found child entries
							that._restoreReferences(oChildEntry);
						}
					});
					delete oCurrentEntry["__list"];
					oCurrentEntry.results = aResults;
					aResults = [];
				}
			});
			return oData;
		}
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
	 * @param {string} [sBatchGroupId] The batchGroupId
	 * @param {boolean} [bRemoveData=false] If set to true then the model data will be removed/cleared.
	 * 					Please note that the data might not be there when calling e.g. getProperty too early before the refresh call returned.
	 *
	 * @public
	 */
	ODataModel.prototype.refresh = function(bForceUpdate, bRemoveData, sBatchGroupId) {
		// Call refresh on all bindings instead of checkUpdate to properly reset cached data in bindings
		if (bRemoveData) {
			this.removeData();
		}
		this._refresh(bForceUpdate, sBatchGroupId);
	};

	/**
	 * @param {boolean} [bForceUpdate=false] Force update of controls
	 * @param {string} [sBatchGroupId] The batchGroupId
	 * @param {map} mChangedEntities map of changed entities
	 * @param {map} mEntityTypes map of changed entityTypes
	 * @private
	 */
	ODataModel.prototype._refresh = function(bForceUpdate, sBatchGroupId, mChangedEntities, mEntityTypes) {
		// Call refresh on all bindings instead of checkUpdate to properly reset cached data in bindings
		var aBindings = this.aBindings.slice(0);
		//the refresh calls read synchronous; we use this.sRefreshBatchGroupId in this case
		this.sRefreshBatchGroupId = sBatchGroupId;
		jQuery.each(aBindings, function(iIndex, oBinding) {
			oBinding.refresh(bForceUpdate, mChangedEntities, mEntityTypes);
		});
		this.sRefreshBatchGroupId = undefined;
	};

	/**
	 * Private method iterating the registered bindings of this model instance and initiating their check for update
	 *
	 * @param {boolean} bForceUpdate force update of controls
	 * @param {boolean} bAsync asynchronous execution
	 * @param {map} mChangedEntities Map of changed entities
	 * @private
	 */
	ODataModel.prototype.checkUpdate = function(bForceUpdate, bAsync, mChangedEntities) {
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
			oBinding.checkUpdate(bForceUpdate, mChangedEntities);
		});
		//handle calls after update
		for (var i = 0; i < this.aCallAfterUpdate.length; i++) {
			this.aCallAfterUpdate[i]();
		}
		this.aCallAfterUpdate = [];
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
	 * @returns {object} oBinding new bindingObject
	 * @private
	 */
	ODataModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters) {
		var oBinding = new ODataTreeBinding(this, sPath, oContext, aFilters, mParameters);
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
	 * @param {map} [mParameters] map of parameters
	 * @param {function} [fnCallBack] function called when context is created
	 * @param {boolean} [bReload] reload of data
	 * @return sap.ui.model.Context
	 * @public
	 */
	ODataModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack, bReload) {
		var sFullPath = this.resolve(sPath, oContext);

		bReload = !!bReload;

		// optional parameter handling
		if (typeof oContext == "function") {
			fnCallBack = oContext;
			oContext = null;
		}
		if (typeof mParameters == "function") {
			fnCallBack = mParameters;
			mParameters = null;
		}
		// try to resolve path, send a request to the server if data is not available yet
		// if we have set forceUpdate in mParameters we send the request even if the data is available
		var oData = this._getObject(sPath, oContext),
		sKey,
		oNewContext,
		that = this;

		if (!bReload) {
			bReload = this._isReloadNeeded(sFullPath, oData, mParameters);
		}

		if (!bReload) {
			sKey = this._getKey(oData);
			oNewContext = this.getContext('/' + sKey);
			if (fnCallBack) {
				fnCallBack(oNewContext);
			}
			return oNewContext;
		}

		if (fnCallBack) {
			var bIsRelative = !jQuery.sap.startsWith(sPath, "/");
			if (sFullPath) {
				var aParams = [],
				sCustomParams = this.createCustomParams(mParameters);
				if (sCustomParams) {
					aParams.push(sCustomParams);
				}

				var handleSuccess = function(oData) {
					sKey = oData ? that._getKey(oData) : undefined;
					if (sKey && oContext && bIsRelative) {
						var sContextPath = oContext.getPath();
						// remove starting slash
						sContextPath = sContextPath.substr(1);
						// when model is refreshed, parent entity might not be available yet
						if (that.oData[sContextPath]) {
							that.oData[sContextPath][sPath] = {__ref: sKey};
						}
					}
					oNewContext = that.getContext('/' + sKey);
					fnCallBack(oNewContext);
				};
				var handleError = function(oError) {
					if (oError.statusCode == '404' && oContext && bIsRelative) {
						var sContextPath = oContext.getPath();
						// remove starting slash
						sContextPath = sContextPath.substr(1);
						// when model is refreshed, parent entity might not be available yet
						if (that.oData[sContextPath]) {
							that.oData[sContextPath][sPath] = {__ref: null};
						}
					}
					fnCallBack(null); // error - notify to recreate contexts
				};
				this.read(sFullPath, {urlParameters: aParams,success: handleSuccess, error: handleError});
			} else {
				fnCallBack(null); // error - notify to recreate contexts
			}
		}
	};

	/**
	 * checks if data based on select, expand parameters is already loaded or not.
	 * In case it couldn't be found we should reload the data so we return true.
	 *
	 * @param {string} sFullPath resolved path
	 * @param {object} oData entry object
	 * @param {map} [mParameters] map of parameters
	 * @returns {boolean} bReload reload needed
	 * @private
	 */
	ODataModel.prototype._isReloadNeeded = function(sFullPath, oData, mParameters) {
		var sNavProps, aNavProps = [], //aChainedNavProp,
		sSelectProps, aSelectProps = [], i;

		// no data --> reload needed
		if (!oData) {
			return true;
		}

		//Split the Navigation-Properties (or multi-level chains) which should be expanded
		if (mParameters && mParameters["expand"]) {
			sNavProps = mParameters["expand"].replace(/\s/g, "");
			aNavProps = sNavProps.split(',');
		}

		//Split the Navigation properties again, if there are multi-level properties chained together by "/"
		//The resulting aNavProps array will look like this: ["a", ["b", "c/d/e"], ["f", "g/h"], "i"]
		if (aNavProps) {
			for (i = 0; i < aNavProps.length; i++) {
				var chainedPropIndex = aNavProps[i].indexOf("/");
				if (chainedPropIndex !== -1) {
					//cut of the first nav property of the chain
					var chainedPropFirst = aNavProps[i].slice(0, chainedPropIndex);
					var chainedPropRest = aNavProps[i].slice(chainedPropIndex + 1);
					//keep track of the newly splitted nav prop chain
					aNavProps[i] = [chainedPropFirst, chainedPropRest];
				}
			}
		}

		//Iterate all nav props and follow the given expand-chain
		for (i = 0; i < aNavProps.length; i++) {
			var navProp = aNavProps[i];

			//check if the navProp was split into multiple parts (meaning it's an array), e.g. ["Orders", "Products/Suppliers"]
			if (jQuery.isArray(navProp)) {

				var oFirstNavProp = oData[navProp[0]];
				var sNavPropRest = navProp[1];

				//first nav prop in the chain is either undefined or deferred -> reload needed
				if (!oFirstNavProp || (oFirstNavProp && oFirstNavProp.__deferred)) {
					return true;
				} else {
					//the first nav prop exists on the Data-Object
					if (oFirstNavProp) {
						var sPropKey, oDataObject, bReloadNeeded;
						//the first nav prop contains a __list of entry-keys (and the __list is not empty)
						if (oFirstNavProp.__list && oFirstNavProp.__list.length > 0) {
							//Follow all keys in the __list collection by recursively calling
							//this function to check if all linked properties are loaded.
							//This is basically a depth-first search.
							for (var iNavIndex = 0; iNavIndex < oFirstNavProp.__list.length; iNavIndex++) {
								sPropKey = "/" + oFirstNavProp.__list[iNavIndex];
								oDataObject = this.getObject(sPropKey);
								bReloadNeeded = this._isReloadNeeded(sPropKey, oDataObject, {expand: sNavPropRest});
								if (bReloadNeeded) { //if a single nav-prop path is not loaded -> reload needed
									return true;
								}
							}
						} else if (oFirstNavProp.__ref) {
							//the first nav-prop is not a __list, but only a reference to a single entry (__ref)
							sPropKey = "/" + oFirstNavProp.__ref;
							oDataObject = this.getObject(sPropKey);
							bReloadNeeded = this._isReloadNeeded(sPropKey, oDataObject, {expand: sNavPropRest});
							if (bReloadNeeded) {
								return true;
							}
						}
					}
				}

			} else {
				//only one single Part, e.g. "Orders"
				//@TODO: why 'undefined'? Old compatibility issue?
				if (oData[navProp] === undefined || (oData[navProp] && oData[navProp].__deferred)) {
					return true;
				}
			}
		}

		if (mParameters && mParameters["select"]) {
			sSelectProps = mParameters["select"].replace(/\s/g, "");
			aSelectProps = sSelectProps.split(',');
		}

		for (i = 0; i < aSelectProps.length; i++) {
			// reload data if select property not available
			if (oData[aSelectProps[i]] === undefined) {
				return true;
			}
		}

		if (aSelectProps.length === 0){
			// check if all props exist and are already loaded...
			// only a subset of props may already be loaded before and now we want to load all.
			var oEntityType = this.oMetadata._getEntityTypeByPath(sFullPath);
			if (!oEntityType) {
				// if no entity type could be found we decide not to reload
				return false;
			} else {
				for (i = 0; i < oEntityType.property.length; i++) {
					if (oData[oEntityType.property[i].name] === undefined) {
						return true;
					}
				}
			}
		}
		return false;
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
					} else {
						aCustomParams.push(sName + "=" + jQuery.sap.encodeURL(mCustomQueryOptions[sName]));
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
	 * Returns the key part from the entry URI or the given context or object
	 *
	 * @param {object|sap.ui.model.Context} oObject The context or entry object
	 * @returns {string} [sKey] key of the entry
	 * @private
	 */
	ODataModel.prototype._getKey = function(oObject) {
		var sKey, sURI;
		if (oObject instanceof sap.ui.model.Context) {
			sKey = oObject.getPath().substr(1);
		} else if (oObject && oObject.__metadata && oObject.__metadata.uri) {
			sURI = oObject.__metadata.uri;
			sKey = sURI.substr(sURI.lastIndexOf("/") + 1);
		}
		return sKey;
	};

	/**
	 * Returns the key part from the entry URI or the given context or object
	 *
	 * @param {object|sap.ui.model.Context} oObject The context or entry object
	 * @returns {string} [sKey] key of the entry
	 * @public
	 */
	ODataModel.prototype.getKey = function(oObject) {
		return this._getKey(oObject);
	};

	/**
	 * Creates the key from the given collection name and property map
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
			sKey += ODataUtils.formatValue(oKeyProperties[sName], oProperty.type);
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
				sKey += ODataUtils.formatValue(oKeyProperties[sName], oProperty.type);
			});
		}
		sKey += ")";
		return sKey;
	};

	/**
	 * Returns the value for the property with the given <code>sPath</code>
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
		oValue = jQuery.extend(true, {}, oValue);

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
	 * @param {object} oContext binding context
	 * @returns {any} vValue the value for the given path/context
	 * @private
	 */
	ODataModel.prototype._getObject = function(sPath, oContext) {
		var oNode = this.isLegacySyntax() ? this.oData : null, 
			sResolvedPath = this.resolve(sPath, oContext),
			iSeparator, sDataPath, sMetaPath, oMetaContext, sKey;

		//check for metadata path
		if (this.oMetadata && sResolvedPath && sResolvedPath.indexOf('/#') > -1)  {
			iSeparator = sResolvedPath.indexOf('/##');
			if (iSeparator >= 0) {
				// Metadata binding resolved by ODataMetaModel
				sDataPath = sResolvedPath.substr(0, iSeparator);
				sMetaPath = sResolvedPath.substr(iSeparator + 3);
				oMetaContext = this.getMetaModel().getMetaContext(sDataPath);
				oNode = this.getMetaModel()._getObject(sMetaPath, oMetaContext);
			} else {
				// Metadata binding resolved by ODataMetadata
				oNode = this.oMetadata._getAnnotation(sResolvedPath);
			}
		} else {
			if (oContext) {
				sKey = oContext.getPath();
				// remove starting slash
				sKey = sKey.substr(1);
				oNode = this.mChangedEntities[sKey] ? this.mChangedEntities[sKey] : this.oData[sKey];
			}
			if (!sPath) {
				return oNode;
			}
			var aParts = sPath.split("/"),
			iIndex = 0;
			if (!aParts[0]) {
				// absolute path starting with slash
				iIndex++;
				if (this.mChangedEntities[aParts[iIndex]]) {
					oNode = this.mChangedEntities;
				} else {
					oNode = this.oData;
				}
			}
			while (oNode && aParts[iIndex]) {
				oNode = oNode[aParts[iIndex]];
				if (oNode) {
					if (oNode.__ref) {
						oNode = this.oData[oNode.__ref];
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
	ODataModel.prototype.refreshSecurityToken = function(fnSuccess, fnError) {
		var that = this, sUrl, sToken;

		// bAsync default is false ?!
		//var bAsync = false;

		// trigger a read to the service url to fetch the token
		sUrl = this._createRequestUrl("/");
		var oRequest = this._createRequest(sUrl, "GET", null,null,null,false);
		oRequest.headers["x-csrf-token"] = "Fetch";

		function _handleSuccess(oData, oResponse) {
			if (oResponse) {
				sToken = that._getHeader("x-csrf-token", oResponse.headers);
				if (sToken) {
					that.oServiceData.securityToken = sToken;
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

		function _handleError(oError) {
			// Disable token handling, if token request returns an error
			that.resetSecurityToken();
			that.bTokenHandling = false;
			that._handleError(oError);

			if (fnError) {
				fnError(oError);
			}
		}

		return this._request(oRequest, _handleSuccess, _handleError, undefined, undefined, this.getServiceMetadata());
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
		var that = this, /* oResponseData, mChangedEntities = {}, */ oHandler;

		function _handleSuccess(oData, oResponse) {
			//if batch the responses are handled by the batch success handler
			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
		}

		function _handleError(oError) {

			// If error is a 403 with XSRF token "Required" reset the token and retry sending request
			if (that.bTokenHandling && oError.response) {
				var sToken = that._getHeader("x-csrf-token", oError.response.headers);
				if (!oRequest.bTokenReset && oError.response.statusCode == '403' && sToken && sToken.toLowerCase() === "required") {
					that.resetSecurityToken();
					oRequest.bTokenReset = true;
					_submit();
					return;
				}
			}

			that._handleError(oError);

			if (fnError) {
				fnError(oError);
			}
		}

		function _submit() {
			// request token only if we have change operations or batch requests
			// token needs to be set directly on request headers, as request is already created
			if (that.bTokenHandling && oRequest.method !== "GET") {
				that.updateSecurityToken();
				// Check bTokenHandling again, as updateSecurityToken() might disable token handling
				if (that.bTokenHandling) {
					oRequest.headers["x-csrf-token"] = that.oServiceData.securityToken;
				}
			}
			//handler only needed for $batch; datajs gets the handler from the accept header
			oHandler = that._getODataHandler(oRequest.requestUri);

			return that._request(oRequest, _handleSuccess, _handleError, oHandler, undefined, that.getServiceMetadata());
		}

		return _submit();
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
			mEntityTypes = {},
			oEventInfo;

		var handleSuccess = function(oData, oResponse) {
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
				that._updateChangedEntities(mChangeEntities);
			};
			that._processSuccess(oRequest, oResponse, fnSingleSuccess, mGetEntities, mChangeEntities, mEntityTypes);
		};
		var handleError = function(oError) {
			if (fnError) {
				fnError(that._handleError(oError));
			}
			oEventInfo = that._createEventInfo(oRequest, oError);

			that.fireRequestCompleted(oEventInfo);
			if (!oRequestHandle || !oRequestHandle.bAborted) {
				that.fireRequestFailed(oEventInfo);
			}
		};
		oRequestHandle =  this._submitRequest(oRequest, handleSuccess, handleError);

		oEventInfo = this._createEventInfo(oRequest);

		this.fireRequestSent(oEventInfo);

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

								if (!oRequestObject.request._aborted) {
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
								if (!oRequestObject.request._aborted) {
									if (oChangeResponse.message) {
										that._processError(oRequestObject.request, oChangeResponse, oRequestObject.fnError);
									} else {
										that._processSuccess(oRequestObject.request, oChangeResponse, oRequestObject.fnSuccess, mGetEntities, mChangeEntities, mEntityTypes);
									}
								}
								oRequestObject.response = oChangeResponse;
							}
						}
					} else {
						oRequestObject = aRequests[i];
						if (!oRequestObject.request._aborted) {
							//check for error
							if (oResponse.message) {
								that._processError(oRequestObject.request, oResponse, oRequestObject.fnError);
							} else {
								that._processSuccess(oRequestObject.request, oResponse, oRequestObject.fnSuccess, mGetEntities, mChangeEntities, mEntityTypes);
							}
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
			that.fireBatchRequestCompleted(oEventInfo);
		};

		var handleError = function(oError) {
			if (fnError) {
				fnError(oError);
			}
			fireEvent("Completed", oBatchRequest, oError, aRequests);
			// Don't fire RequestFailed for intentionally aborted requests; fire event if we have no (OData.read fails before handle creation)
			if (!oRequestHandle || !oRequestHandle.bAborted) {
				fireEvent("Failed", oBatchRequest, oError, aRequests);
			}
		};
		
		var fireEvent = function(sType, oBatchRequest, oError, aRequests) {
			var oEventInfo;
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
			
			oEventInfo = that._createEventInfo(oBatchRequest, oError, aRequests);
			that["fireBatchRequest" + sType](oEventInfo);
		};

		var oRequestHandle = this._submitRequest(oBatchRequest, handleSuccess, handleError);
		
		fireEvent("Sent", oBatchRequest, null, aRequests);

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
	 * push request to internal request queue
	 *
	 * @param {map} mRequests Request queue
	 * @param {string} sBatchGroupId The batch group Id
	 * @param {string} [sChangeSetId] The changeSet Id
	 * @param {oRequest} oRequest The request
	 * @param {function} fnSuccess The success callback function
	 * @param {function} fnError The error callback function
	 * @private
	 */
	ODataModel.prototype._pushToRequestQueue = function(mRequests, sBatchGroupId, sChangeSetId, oRequest, fnSuccess, fnError) {
		var oChangeGroup, oRequestGroup = mRequests[sBatchGroupId];

		if (!oRequestGroup) {
			oRequestGroup = {};
			oRequestGroup.requests = [];
			mRequests[sBatchGroupId] = oRequestGroup;
		}
		if (oRequest.method !== "GET") {
			if (!oRequestGroup.changes) {
				oRequestGroup.changes = {};
			}
			if (oRequest.key && oRequestGroup.map && oRequest.key in oRequestGroup.map) {
				if (oRequest.method === "POST") {
					//failed create Entry createEntry
					oRequestGroup.map[oRequest.key].method = "POST";
				}
				// if change is aborted (resetChanges) and a change happens before submit we should delete
				// the aborted flag
				if (oRequestGroup.map[oRequest.key]._aborted) {
					delete oRequestGroup.map[oRequest.key]._aborted;
				}
				oRequestGroup.map[oRequest.key].data = oRequest.data;
			} else {
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
				if (oRequest.key) {
					if (!oRequestGroup.map) {
						oRequestGroup.map = {};
					}
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
					var oRequest = aChangeSet[i].request;
					if (oRequest.method === "POST") {
						var oEntityMetadata = that.oMetadata._getEntityTypeByPath("/" + oRequest.requestUri);
						if (oEntityMetadata) {
							mEntityTypes[oEntityMetadata.entityType] = true;
						}
					} else {
						mChangedEntities[oRequest.requestUri] = true;
					}
				}
			});
		}
	};

	/**
	 * Request queue processing
	 *
	 * @param {map} mRequests Request queue
	 * @param {string} sBatchGroupId The batchGroupId
	 * @param {function} fnSuccess Success callback function
	 * @param {function} fnError Erro callback function
	 * @returns {object|array} oRequestHandle The request handle: array if multiple request will be sent
	 * @private
	 */
	ODataModel.prototype._processRequestQueue = function(mRequests, sBatchGroupId, fnSuccess, fnError){
		var that = this,
			oRequestHandle = [];

		if (this.oRequestTimer && mRequests !== this.mDeferredRequests) {
			jQuery.sap.clearDelayedCall(this.oRequestTimer);
			this.oRequestTimer = undefined;
		}
		if (this.bUseBatch) {
			//auto refresh for batch / for single requests we refresh after the request was successful
			if (that.bRefreshAfterChange) {
				jQuery.each(mRequests, function(sGroupId, oGroup) {
					if (sGroupId === sBatchGroupId || !sBatchGroupId) {
						var mChangedEntities = {},
							mEntityTypes = {};
						that._collectChangedEntities(oGroup, mChangedEntities, mEntityTypes);
						that._refresh(false, sGroupId, mChangedEntities, mEntityTypes);
					}
				});
			}
			jQuery.each(mRequests, function(sGroupId, oGroup) {
				if (sGroupId === sBatchGroupId || !sBatchGroupId) {
					var aReadRequests = [], aBatchGroup = [], /* aChangeRequests, */ oChangeSet;

					if (oGroup.changes) {
						jQuery.each(oGroup.changes, function(sChangeSetId, aChangeSet){
							oChangeSet = {__changeRequests:[]};
							for (var i = 0; i < aChangeSet.length; i++) {
								//clear metadata.create
								if (!aChangeSet[i].request._aborted) {
									if (aChangeSet[i].request.data && aChangeSet[i].request.data.__metadata) {
										delete aChangeSet[i].request.data.__metadata.created;
									}
									oChangeSet.__changeRequests.push(aChangeSet[i].request);
								}
							}
							if (oChangeSet.__changeRequests && oChangeSet.__changeRequests.length > 0) {
								aReadRequests.push(oChangeSet);
								aBatchGroup.push(oGroup.changes[sChangeSetId]);
							}
						});
					}
					if (oGroup.requests) {
						var aRequests = oGroup.requests;
						for (var i = 0; i < aRequests.length; i++) {
							if (!aRequests[i].request._aborted) {
								aReadRequests.push(aRequests[i].request);
								aBatchGroup.push(aRequests[i]);
							}
						}
					}
					if (aReadRequests.length > 0) {
						var oBatchRequest = that._createBatchRequest(aReadRequests, true);
						oRequestHandle.push(that._submitBatchRequest(oBatchRequest, aBatchGroup, fnSuccess, fnError));
					}
					delete mRequests[sGroupId];
				}
			});
		} else  {
			jQuery.each(mRequests, function(sGroupId, oGroup) {
				if (sGroupId === sBatchGroupId || !sBatchGroupId) {
					//var aReadRequests = [], aBatchGroup = [], aChangeRequests, oChangeSet;

					if (oGroup.changes) {
						jQuery.each(oGroup.changes, function(sChangeSetId, aChangeSet){
							for (var i = 0; i < aChangeSet.length; i++) {
								// store last request Handle. If no batch there will be only 1 and we cpould return it?
								if (!aChangeSet[i].request._aborted) {
									oRequestHandle.push(that._submitSingleRequest(aChangeSet[i].request, aChangeSet[i].fnSuccess, aChangeSet[i].fnError));
								}
							}
						});
					}
					if (oGroup.requests) {
						var aRequests = oGroup.requests;
						for (var i = 0; i < aRequests.length; i++) {
							// store last request Handle. If no batch there will be only 1 and we cpould return it?
							if (!aRequests[i].request._aborted) {
								oRequestHandle.push(that._submitSingleRequest(aRequests[i].request, aRequests[i].fnSuccess, aRequests[i].fnError));
							}
						}
					}
					delete mRequests[sGroupId];
				}
			});
		}
		return oRequestHandle.length == 1 ? oRequestHandle[0] : oRequestHandle;
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
		var oResultData = oResponse.data, bContent, sUri, sPath, aParts,
		oEntityMetadata, that = this;

		bContent = !(oResponse.statusCode === 204 || oResponse.statusCode === '204');

		// no data available
		if (bContent && !oResultData && oResponse) {
			jQuery.sap.log.fatal(this + " - No data was retrieved by service: '" + oResponse.requestUri + +"'");
			that.fireRequestCompleted({url : oResponse.requestUri, type : "GET", async : oResponse.async,
				info: "Accept headers:" + this.oHeaders["Accept"], infoObject : {acceptHeaders: this.oHeaders["Accept"]},  success: false});
			return false;
		}
		if (oResultData && oResultData.results && !jQuery.isArray(oResultData.results)) {
			oResultData = oResultData.results;
		}

		// adding the result data to the data object
		if (oResultData && (jQuery.isArray(oResultData) || typeof oResultData == 'object')) {
			//need a deep data copy for import
			oResultData = jQuery.extend(true, {}, oResultData);
			that._importData(oResultData, mGetEntities);
		}

		sUri = oRequest.requestUri;
		sPath = sUri.replace(this.sServiceUrl,"");
		//in batch requests all paths are relative
		if (!jQuery.sap.startsWith(sPath,'/')) {
			sPath = '/' + sPath;
		}
		sPath = this._normalizePath(sPath);

		//get change entities for update/remove
		if (!bContent) {
			aParts = sPath.split("/");
			if (aParts[1]) {
				mChangeEntities[aParts[1]] = true;
				//cleanup of this.mChangedEntities; use only the actual response key
				var oMap = {};
				oMap[aParts[1]] = true;
				this._updateChangedEntities(oMap);
			}
			//for delete requests delete data in model
			if (oRequest.method === "DELETE") {
				delete that.oData[aParts[1]];
				delete that.mContexts["/" + aParts[1]]; // contexts are stored starting with /
			}
		}
		//get entityType for creates
		if (bContent && oRequest.method === "POST") {
			oEntityMetadata = this.oMetadata._getEntityTypeByPath(sPath);
			if (oEntityMetadata) {
				mEntityTypes[oEntityMetadata.entityType] = true;
			}
			// for createEntry entities change context path to new one
			if (oRequest.context) {
				var sKey = this._getKey(oResultData);
				delete this.mChangedEntities[oRequest.context.sPath.substr(1)];
				delete this.oData[oRequest.context.sPath.substr(1)];
				oRequest.context.sPath = '/' + sKey;
			}
		}

		this._updateETag(oRequest, oResponse);

		if (fnSuccess) {
			fnSuccess(oResponse.data, oResponse);
		}

		var oEventInfo = this._createEventInfo(oRequest, oResponse);
		this.fireRequestCompleted(oEventInfo);
		
		return true;
	};

	/**
	 * process request response for successful requests
	 *
	 * @param {object} oRequest The request
	 * @param {object} oResponse The response
	 * @param {function} fnError The error callback function
	 * @private
	 */
	ODataModel.prototype._processError = function(oRequest, oResponse, fnError) {
		var oError = this._handleError(oResponse);
		if (fnError) {
			fnError(oError);
		}

		var oEventInfo = this._createEventInfo(oRequest, oError);
		this.fireRequestCompleted(oEventInfo);
		this.fireRequestFailed(oEventInfo);

	};
	
	/**
	 * process a 'TwoWay' change
	 *
	 * @param {string} sKey Key of the entity to change
	 * @param {object} oData The entry data
	 * @param {boolean} [bMerge] Sets MERGE/PUT method
	 * @returns {object} oRequest The request object
	 * @private
	 */
	ODataModel.prototype._processChange = function(sKey, oData, bMerge) {
		var oPayload, oEntityType, sETag, sMethod, sUrl, oRequest, sType;

		// delete expand properties = navigation properties
		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);

		//default to true
		bMerge = bMerge !== false;

		if (oData.__metadata && oData.__metadata.created){
			sMethod = "POST";
			sKey = oData.__metadata.created.key;
		} else if (bMerge) {
			sMethod = "MERGE";
		} else {
			sMethod = "PUT";
		}

		// do a copy of the payload or the changes will be deleted in the model as well (reference)
		oPayload = jQuery.extend(true, {}, oData);
		// remove metadata, navigation properties to reduce payload
		if (oPayload.__metadata) {
			sType = oPayload.__metadata.type;
			sETag = oPayload.__metadata.etag;
			delete oPayload.__metadata;
			if (sType || sETag) {
				oPayload.__metadata = {};
			}
			// type information may be needed by an odata service!!!
			if (sType) {
				oPayload.__metadata.type = sType;
			}
			// etag information may be needed by an odata service, too!!!
			if (sETag) {
				oPayload.__metadata.etag = sETag;
			}
		}
		jQuery.each(oPayload, function(sPropName, oPropValue) {
			if (oPropValue && oPropValue.__deferred) {
				delete oPayload[sPropName];
			}
		});

		if (oEntityType) {
			var aNavProps = this.oMetadata._getNavigationPropertyNames(oEntityType);
			jQuery.each(aNavProps, function(iIndex, sNavPropName) {
				delete oPayload[sNavPropName];
			});
		}

		// remove any yet existing references which should already have been deleted
		oPayload = this._removeReferences(oPayload);

		sUrl = this._createRequestUrl('/' + sKey);
		oRequest = this._createRequest(sUrl, sMethod, undefined, oPayload, sETag);

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
		var oChangeGroup, oEntityType, sBatchGroupId, sChangeSetId;

		oEntityType = this.oMetadata._getEntityTypeByPath(sKey);

		//resolve batchGroupId/changeSetId
		if (this.mChangeBatchGroups[oEntityType.name]) {
			oChangeGroup = this.mChangeBatchGroups[oEntityType.name];
			sBatchGroupId = oChangeGroup.batchGroupId;
			sChangeSetId = oChangeGroup.single ? jQuery.sap.uid() : oChangeGroup.changeSetId;
		} else if (this.mChangeBatchGroups['*']) {
			oChangeGroup = this.mChangeBatchGroups['*'];
			sBatchGroupId = oChangeGroup.batchGroupId;
			sChangeSetId = oChangeGroup.single ? jQuery.sap.uid() : oChangeGroup.changeSetId;
		}

		return {batchGroupId: sBatchGroupId, changeSetId: sChangeSetId};
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
		oEntry = this._getObject(sUrl);
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
	ODataModel.prototype._handleError = function(oError) {
		var mParameters = {}, /* fnHandler, */ sToken;
		var sErrorMsg = "The following problem occurred: " + oError.message;

		mParameters.message = oError.message;
		if (oError.response){
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
	 * returns an ETag: either the passed sETag or tries to retrieve the ETag from the metadata of oPayload or sPath
	 *
	 * @param {string} sPath The binding path
	 * @param {object} oData The entry data
	 * @returns {string} sEtag The eTag
	 * @private
	 */
	ODataModel.prototype._getETag = function(sPath, oData) {
		var sETag, sEntry, iIndex;

		if (oData && oData.__metadata){
			sETag = oData.__metadata.etag;
		} else if (sPath) {
			sEntry = sPath.replace(this.sServiceUrl + '/', '');
			iIndex = sEntry.indexOf("?");
			if (iIndex > -1){
				sEntry = sEntry.substr(0, iIndex);
			}
			if (this.oData.hasOwnProperty(sEntry)){
				sETag = this.getProperty('/' + sEntry + '/__metadata/etag');
			}
		}

		return sETag;
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
		var oHeader = this._getHeaders(mHeaders);

		sETag = sETag || this._getETag(sUrl, oData);

		bAsync = bAsync !== false;

		if (sETag && sMethod !== "GET") {
			oHeader["If-Match"] = sETag;
		}

		/* make sure to set content type header for POST/PUT requests when using JSON
		 * format to prevent datajs to add "odata=verbose" to the content-type header
		 * may be removed as later gateway versions support this */
		if (this.bJSON && sMethod !== "DELETE" && this.sMaxDataServiceVersion === "2.0") {
			oHeader["Content-Type"] = "application/json";
		}

		// Set Accept header for $count requests
		if (sUrl.indexOf("$count") > -1) {
			oHeader["Accept"] = "text/plain, */*;q=0.5";
		}

		// format handling
		if (sMethod === "MERGE" && !this.bUseBatch) {
			oHeader["x-http-method"] = "MERGE";
			sMethod = "POST";
		}

		var oRequest = {
				headers : oHeader,
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
	 * Trigger a PUT/MERGE request to the odata service that was specified in the model constructor. Please note that deep updates are not supported
	 * and may not work. These should be done seperate on the entry directly.
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
	 * @param {boolean} [mParameters.merge=false] trigger a MERGE request instead of a PUT request to perform a differential update
	 * @param {string} [mParameters.eTag] If specified, the If-Match-Header will be set to this Etag.
	 * 		Please be advised that this feature is officially unsupported as using asynchronous
	 * 		requests can lead to data inconsistencies if the application does not make sure that
	 * 		the request was completed before continuing to work with the data.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {map} [mParameters.headers] A map of headers for this request
	 * @param {string} [mParameters.batchGroupId] batchGroupId for this request
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */

	ODataModel.prototype.update = function(sPath, oData, mParameters) {
		var fnSuccess, fnError, bMerge, oRequest, sUrl, oContext, sETag, oRequestHandle,
			oStoredEntry, sKey, aUrlParams, sBatchGroupId, sChangeSetId,
			mUrlParams, mHeaders, sMethod, mRequests;

		if (mParameters) {
			sBatchGroupId = mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			bMerge    = mParameters.merge !== false;
			mUrlParams = mParameters.urlParameters;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		sUrl = this._createRequestUrl(sPath, oContext, aUrlParams, this.bUseBatch);

		sMethod = bMerge ? "MERGE" : "PUT";

		oRequest = this._createRequest(sUrl, sMethod, mHeaders, oData, sETag);

		sPath = this._normalizePath(sPath, oContext);
		oStoredEntry = this._getObject(sPath);

		oRequest.keys = {};
		if (oStoredEntry) {
			sKey = this._getKey(oStoredEntry);
			oRequest.keys[sKey] = true;
		}

		mRequests = this.mRequests;
		if (sBatchGroupId in this.mDeferredBatchGroups) {
			mRequests = this.mDeferredRequests;
		}
		this._pushToRequestQueue(mRequests, sBatchGroupId, sChangeSetId, oRequest, fnSuccess, fnError);

		if (this.bUseBatch) {
			oRequestHandle = {
					abort: function() {
						oRequest._aborted = true;
					}
			};
			if (!this.oRequestTimer) {
				this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
			}
		} else {
			oRequestHandle = this._processRequestQueue(this.mRequests);
		}
		return oRequestHandle;
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
	 * @param {string} [mParameters.batchGroupId] batchGroupId for this request
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.create = function(sPath, oData, mParameters) {
		var oRequest, /* oBatchRequest, */ sUrl, oRequestHandle, oEntityMetadata,
		oContext, fnSuccess, fnError, /* bAsync = true, changeSetId, batchGroupId, */ mUrlParams, mRequests,
		mHeaders, aUrlParams, sEtag, sBatchGroupId, sMethod, sChangeSetId;
		//that = this;

		// The object parameter syntax has been used.
		if (mParameters) {
			oContext   = mParameters.context;
			mUrlParams = mParameters.urlParameters;
			fnSuccess  = mParameters.success;
			fnError    = mParameters.error;
			sBatchGroupId	= mParameters.batchGroupId;
			sChangeSetId	= mParameters.changeSetId;
			sEtag		= mParameters.eTag;
			mHeaders	= mParameters.headers;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		sMethod = "POST";

		sUrl = this._createRequestUrl(sPath, oContext, aUrlParams, this.bUseBatch);

		oRequest = this._createRequest(sUrl, sMethod, mHeaders, oData, sEtag);

		sPath = this._normalizePath(sPath, oContext);
		oEntityMetadata = this.oMetadata._getEntityTypeByPath(sPath);
		oRequest.entityTypes = {};
		if (oEntityMetadata) {
			oRequest.entityTypes[oEntityMetadata.entityType] = true;
		}

		mRequests = this.mRequests;
		if (sBatchGroupId in this.mDeferredBatchGroups) {
			mRequests = this.mDeferredRequests;
		}
		this._pushToRequestQueue(mRequests, sBatchGroupId, sChangeSetId, oRequest, fnSuccess, fnError);

		if (this.bUseBatch) {
			oRequestHandle = {
					abort: function() {
						oRequest._aborted = true;
					}
			};
			if (!this.oRequestTimer) {
				this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
			}
		} else {
			oRequestHandle = this._processRequestQueue(this.mRequests);
		}
		return oRequestHandle;
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
	 * @param {string} [mParameters.batchGroupId] batchGroupId for this request
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.remove = function(sPath, mParameters) {
		var oContext, sEntry, /* oStoredEntry, */ fnSuccess, fnError, oRequest, sUrl, sBatchGroupId,
		sChangeSetId, sETag, /* sKey, */ handleSuccess, /* oBatchRequest, */ oRequestHandle,
		mUrlParams, mHeaders, aUrlParams, sMethod, mRequests,
		that = this;

		if (mParameters) {
			sBatchGroupId = mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		handleSuccess = function(oData, oResponse) {
			sEntry = sUrl.substr(sUrl.lastIndexOf('/') + 1);
			//remove query params if any
			if (sEntry.indexOf('?') !== -1) {
				sEntry = sEntry.substr(0, sEntry.indexOf('?'));
			}
			delete that.oData[sEntry];
			delete that.mContexts["/" + sEntry]; // contexts are stored starting with /

			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
		};

		sMethod = "DELETE";

		sUrl = this._createRequestUrl(sPath, oContext, aUrlParams, this.bUseBatch);

		oRequest = this._createRequest(sUrl, sMethod, mHeaders, undefined, sETag);

		mRequests = this.mRequests;
		if (sBatchGroupId in this.mDeferredBatchGroups) {
			mRequests = this.mDeferredRequests;
		}

		this._pushToRequestQueue(mRequests, sBatchGroupId, sChangeSetId, oRequest, handleSuccess, fnError);

		if (this.bUseBatch) {
			oRequestHandle = {
					abort: function() {
						oRequest._aborted = true;
					}
			};
			if (!this.oRequestTimer) {
				this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
			}
		} else {
			oRequestHandle = this._processRequestQueue(this.mRequests);
		}
		return oRequestHandle;

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
	 * @param {string} [mParameters.batchGroupId] batchGroupId for this request
	 * @param {string} [mParameters.changeSetId] changeSetId for this request
	 *
	 * @return {object} oRequestHandle An object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.callFunction = function (sFunctionName, mParameters) {
		var oRequest, sUrl, oRequestHandle,
			oFunctionMetadata,
			mRequests,
			mUrlParameters, fnSuccess, fnError,
			sMethod = "GET",
			aUrlParams = [],
			sBatchGroupId,
			sChangeSetId,
			mHeaders;

		if (mParameters) {
			sBatchGroupId 	= mParameters.batchGroupId;
			sChangeSetId 	= mParameters.changeSetId;
			sMethod			= mParameters.method ? mParameters.method : sMethod;
			mUrlParameters	= mParameters.urlParameters;
			fnSuccess		= mParameters.success;
			fnError			= mParameters.error;
			mHeaders		= mParameters.headers;
		}

		if (!jQuery.sap.startsWith(sFunctionName, "/")) {
			jQuery.sap.log.fatal(this + " callFunction: path '" + sFunctionName + "' must be absolute!");
			return;
		}

		oFunctionMetadata = this.oMetadata._getFunctionImportMetadata(sFunctionName, sMethod);
		jQuery.sap.assert(oFunctionMetadata, this + ": Function " + sFunctionName + " not found in the metadata !");

		if (oFunctionMetadata) {
			if (oFunctionMetadata.parameter != null) {
				jQuery.each(mUrlParameters, function (sParameterName, oParameterValue) {
					var matchingParameters = jQuery.grep(oFunctionMetadata.parameter, function (oParameter) {
						return oParameter.name === sParameterName && oParameter.mode === "In";
					});
					if (matchingParameters != null && matchingParameters.length > 0) {
						var matchingParameter = matchingParameters[0];
						aUrlParams.push(sParameterName + "=" + ODataUtils.formatValue(oParameterValue, matchingParameter.type));
					} else {
						jQuery.sap.log.warning(this + " - Parameter '" + sParameterName + "' is not defined for function call '" + sFunctionName + "'!");
					}
				});
			}

			sUrl = this._createRequestUrl(sFunctionName, null, aUrlParams, this.bUseBatch);

			oRequest = this._createRequest(sUrl, sMethod, mHeaders, undefined);

			mRequests = this.mRequests;
			if (sBatchGroupId in this.mDeferredBatchGroups) {
				mRequests = this.mDeferredRequests;
			}
			this._pushToRequestQueue(mRequests, sBatchGroupId, sChangeSetId, oRequest, fnSuccess, fnError);

			if (this.bUseBatch) {
				oRequestHandle = {
						abort: function() {
							oRequest._aborted = true;
						}
				};
				if (!this.oRequestTimer) {
					this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
				}
			} else {
				oRequestHandle = this._processRequestQueue(this.mRequests);
			}
		}
		return oRequestHandle;
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
	 * @param {array} [mParameter.filters] an array of sap.ui.model.Filter to be included in the request URL
	 * @param {array} [mParameter.sorters] an array of sap.ui.model.Sorter to be included in the request URL
	 * @param {function} [mParameters.success] a callback function which is called when the data has
	 *		been successfully retrieved. The handler can have the
	 *		following parameters: oData and response.
	 * @param {function} [mParameters.error] a callback function which is called when the request
	 * 		failed. The handler can have the parameter: oError which contains additional error information.
	 * @param {string} [mParameters.batchGroupId] batchGroupId for this request
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.read = function(sPath, mParameters) {
		var oRequest, sUrl, oRequestHandle, // oBatchRequest,
		oContext, mUrlParams, fnSuccess, fnError,
		aFilters, aSorters, sFilterParams, sSorterParams,
		oEntityType, sNormalizedPath,
		aUrlParams, mHeaders, sMethod,
		sBatchGroupId,
		mRequests;
		//that = this;

		// The object parameter syntax has been used.
		if (mParameters) {
			oContext   = mParameters.context;
			mUrlParams = mParameters.urlParameters;
			fnSuccess  = mParameters.success;
			fnError    = mParameters.error;
			aFilters   = mParameters.filters;
			aSorters   = mParameters.sorters;
			sBatchGroupId = mParameters.batchGroupId;
			mHeaders = mParameters.headers;
		}
		//if the read is triggered via a refresh we should use the refreshBatchGroupId instead
		if (this.sRefreshBatchGroupId) {
			sBatchGroupId = this.sRefreshBatchGroupId;
		}

		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		// Add filter/sorter to URL parameters
		sSorterParams = ODataUtils.createSortParams(aSorters);
		if (sSorterParams) {
			aUrlParams.push(sSorterParams);
		}

		if (sPath.indexOf("$count") === -1){
			if (aFilters && !this.oMetadata) {
				jQuery.sap.log.fatal(this + " - Tried to use filters in read method before metadata is available.");
			} else {
				sNormalizedPath = this._normalizePath(sPath, oContext);
				oEntityType = this.oMetadata && this.oMetadata._getEntityTypeByPath(sNormalizedPath);
				sFilterParams = ODataUtils.createFilterParams(aFilters, this.oMetadata, oEntityType);
				if (sFilterParams) {
					aUrlParams.push(sFilterParams);
				}
			}
		}

		sMethod = "GET";

		sUrl = this._createRequestUrl(sPath, oContext, aUrlParams, this.bUseBatch);

		oRequest = this._createRequest(sUrl, sMethod, mHeaders);

		mRequests = this.mRequests;
		if (sBatchGroupId in this.mDeferredBatchGroups) {
			mRequests = this.mDeferredRequests;
		}
		this._pushToRequestQueue(mRequests, sBatchGroupId, null, oRequest, fnSuccess, fnError);

		if (this.bUseBatch) {
			oRequestHandle = {
					abort: function() {
						oRequest._aborted = true;
					}
			};
			if (!this.oRequestTimer) {
				this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
			}
		} else {
			oRequestHandle = this._processRequestQueue(this.mRequests);
		}
		return oRequestHandle;
	};

	/**
	 * Return the metadata object. Please note that when using the model with bLoadMetadataAsync = true then this function might return undefined because the
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
	 * Return the annotation object. Please note that when using the model with bLoadMetadataAsync = true then this function might return undefined because the
	 * metadata has not been loaded yet.
	 * In this case attach to the <code>annotationsLoaded</code> event to get notified when the annotations are available and then call this function.
	 *
	 * @return {Object} metdata object
	 * @public
	 * @experimental This feature has not been tested due to the lack of OData testing infrastructure. The API is NOT stable yet. Use at your own risk.
	 */
	ODataModel.prototype.getServiceAnnotations = function() {
		if (this.oAnnotations && this.oAnnotations.getAnnotationsData) {
			return this.oAnnotations.getAnnotationsData();
		}
	};

	/**
	 * Submits the collected changes which were collected by the setProperty method. A MERGE request will be triggered to only update the changed properties.
	 * If a URI with a $expand System Query Option was used then the expand entries will be removed from the collected changes.
	 * Changes to this entries should be done on the entry itself. So no deep updates are supported.
	 *
	 * @param {object} [mParameters] a map which contains the following parameter properties:
	 * @param {string} [mParameters.batchGroupId] defines the batchGroup that should be submitted. If not specified all deferred groups will be submitted
	 * @param {function} [mParameters.success] a callback function which is called when the data has
	 *            					 been successfully updated. The handler can have the
	 *            	                 following parameters: oData
	 * @param {function} [mParameters.error] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
	 * additional error information
	 *
	 * Important: The success/error handler will only be called if batch support is enabled. If multiple batchGroups are submitted the handlers will be called for every batchGroup.
	 *
	 * @param {string} [mParameters.eTag] an ETag which can be used for concurrency control. If it is specified, it will be used in an If-Match-Header in the request to the server for this entry.
	 * @return {objec|array} an object which has an <code>abort</code> function to abort the current request: returns an array if multiple requests will be sent.
	 *
	 * @public
	 */
	ODataModel.prototype.submitChanges = function(mParameters) {
		var bMerge = true, oRequest, sBatchGroupId, oGroupInfo, fnSuccess, fnError,
			that = this;

		if (mParameters) {
			sBatchGroupId = mParameters.batchGroupId;
			fnSuccess =	mParameters.success;
			fnError = mParameters.error;
			sBatchGroupId = mParameters.batchGroupId;
			bMerge = mParameters.merge !== false;
		}

		jQuery.each(this.mChangedEntities, function(sKey, oData) {
			oGroupInfo = that._resolveGroup(sKey);
			if (oGroupInfo.batchGroupId === sBatchGroupId || !sBatchGroupId) {
				oRequest = that._processChange(sKey, oData, bMerge);
				oRequest.key = sKey;
				if (oGroupInfo.batchGroupId in that.mDeferredBatchGroups) {
					that._pushToRequestQueue(that.mDeferredRequests, oGroupInfo.batchGroupId, oGroupInfo.changeSetId, oRequest);
				}
			}
		});

		return this._processRequestQueue(this.mDeferredRequests, sBatchGroupId, fnSuccess, fnError);
	};


	/*
	 * updateChangedEntities
	 * @private
	 * @param {map} mChangedEntities Map of changedEntities
	 */
	ODataModel.prototype._updateChangedEntities = function(mChangedEntities) {
		var that = this;

		jQuery.each(mChangedEntities, function(sKey, bChanged) {
			if (sKey in that.mChangedEntities) {
				var oChangedEntry = that._getObject('/' + sKey);
				delete that.mChangedEntities[sKey];
				var oEntry = that._getObject('/' + sKey);
				jQuery.extend(true, oEntry, oChangedEntry);

			}
		});
	};

	/**
	 *
	 * Resets the collected changes by the setProperty method.
	 *
	 * @param {array} [aKeys] 	Array of keys that should be resetted.
	 * 							If no array is passed all changes will be resetted.
	 *
	 * @public
	 */
	ODataModel.prototype.resetChanges = function(aKeys) {
		var that = this;

		if (aKeys) {
			jQuery.each(aKeys, function(iIndex, sKey) {
				if (sKey in that.mChangedEntities) {
					that.mChangeHandles[sKey].abort();
					delete that.mChangeHandles[sKey];
					delete that.mChangedEntities[sKey];
				} else {
					jQuery.sap.log.warning(that + " - resetChanges: " + sKey + " is not changed nor a valid change key!");
				}
			});
		} else {
			jQuery.each(this.mChangedEntities, function(sKey, oObject) {
				that.mChangeHandles[sKey].abort();
				delete that.mChangeHandles[sKey];
				delete that.mChangedEntities[sKey];
			});
		}
		this.checkUpdate();
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

		var sProperty, mRequests, oRequest, oEntry = { }, oData = { },
		sResolvedPath = this.resolve(sPath, oContext),
		aParts,	sKey, oGroupInfo, oRequestHandle,
		mChangedEntities = {};

		// check if path / context is valid
		if (!sResolvedPath) {
			jQuery.sap.log.warning(this + " - TwoWay binding: path '" + sPath + "' not resolvable!");
			return false;
		}

		// extract the Url that points to the 'entry'. We need to do this if a complex type will be updated.
		aParts = sResolvedPath.split("/");

		//property is the last part
		sProperty = aParts[aParts.length - 1]; //sPath.substr(sPath.lastIndexOf("/")+1);

		//get object: cut of property part of resolved path before
		oData = this._getObject(sResolvedPath.substr(0,sResolvedPath.lastIndexOf("/")));
		if (!oData) {
			return false;
		}

		//check all path segments to find the entity; The last segment can also point to a complex type (ignore property segment)
		for (var i = aParts.length - 1; i >= 0; i--) {
			oEntry = this._getObject(aParts.join("/"));
			if (oEntry) {
				sKey = this._getKey(oEntry);
				if (sKey) {
					break;
				}
			}
			aParts.splice(i,1);
		}

		if (!this.mChangedEntities[sKey]) {
			oEntry = jQuery.extend(true,{},oEntry);
		}
		this.mChangedEntities[sKey] = oEntry;

		oEntry[sProperty] = oValue;

		oGroupInfo = this._resolveGroup(sKey);

		mRequests = this.mRequests;

		if (oGroupInfo.batchGroupId in this.mDeferredBatchGroups) {
			mRequests = this.mDeferredRequests;
			oRequest = this._processChange(sKey, {__metadata : oEntry.__metadata});
			oRequest.key = sKey;
		} else {
			oRequest = this._processChange(sKey, oEntry);
		}

		if (!this.mChangeHandles[sKey]) {
			oRequestHandle = {
					abort: function() {
						oRequest._aborted = true;
					}
			};

			this.mChangeHandles[sKey] = oRequestHandle;
		}

		this._pushToRequestQueue(mRequests, oGroupInfo.batchGroupId, oGroupInfo.changeSetId, oRequest);

		if (this.bUseBatch) {
			if (!this.oRequestTimer) {
				this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
			}
		} else {
			this._processRequestQueue(this.mRequests);
		}

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

	ODataModel.prototype.getPendingChanges = function() {
		return jQuery.extend(true, {}, this.mChangedEntities);
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
	 * Format a JavaScript value according to the given EDM type
	 * http://www.odata.org/documentation/overview#AbstractTypeSystem
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
		if (oContext) {
			var sPath = oContext.getPath();
			delete this.mContexts[sPath]; // contexts are stored starting with /
			// remove starting / if any
			if (jQuery.sap.startsWith(sPath, "/")) {
				sPath = sPath.substr(1);
			}
			this.mChangeHandles[sPath].abort();
			delete this.mChangeHandles[sPath];
			delete this.mChangedEntities[sPath];
			delete this.oData[sPath];
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
	 * @param {string} [mParameters.batchGroupId] The batchGroupId
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
		var fnSuccess, fnError, oRequest, sUrl, oContext, sETag,
			sKey, aUrlParams, sBatchGroupId, sChangeSetId, oRequestHandle,
			mUrlParams, mHeaders, mRequests, vProperties, oEntry, oEntity = {},
			sMethod = "POST";

		if (mParameters) {
			vProperties = mParameters.properties;
			sBatchGroupId = mParameters.batchGroupId;
			sChangeSetId = mParameters.changeSetId;
			oContext  = mParameters.context;
			fnSuccess = mParameters.success;
			fnError   = mParameters.error;
			sETag     = mParameters.eTag;
			mHeaders  = mParameters.headers;
			mUrlParams = mParameters.urlParameters;
		}

		sBatchGroupId = sBatchGroupId ? sBatchGroupId : this.sDefaultChangeBatchGroup;
		aUrlParams = ODataUtils._createUrlParamsArray(mUrlParams);

		if (!jQuery.sap.startsWith(sPath, "/")) {
			sPath = "/" + sPath;
		}
		var oEntityMetadata = this.oMetadata._getEntityTypeByPath(sPath);
		if (!oEntityMetadata) {
			jQuery.sap.assert(oEntityMetadata, "No Metadata for collection " + sPath + " found");
			return undefined;
		}
		if (typeof vProperties === "object" && !jQuery.isArray(vProperties)) {
			oEntity = vProperties;
		} else {
			for (var i = 0; i < oEntityMetadata.property.length; i++) {
				var oPropertyMetadata = oEntityMetadata.property[i];

				var aType = oPropertyMetadata.type.split('.');
				var bPropertyInArray = jQuery.inArray(oPropertyMetadata.name,vProperties) > -1;
				if (!vProperties || bPropertyInArray)  {
					oEntity[oPropertyMetadata.name] = this._createPropertyValue(aType);
					if (bPropertyInArray) {
						vProperties.splice(vProperties.indexOf(oPropertyMetadata.name),1);
					}
				}
			}
			if (vProperties) {
				jQuery.sap.assert(vProperties.length === 0, "No metadata for the following properties found: " + vProperties.join(","));
			}
		}
		// remove starting / for key only
		sKey = sPath.substring(1) + "('" + jQuery.sap.uid() + "')";

		this.oData[sKey] = oEntity;

		oEntity.__metadata = {type: "" + oEntityMetadata.entityType, uri: this.sServiceUrl + '/' + sKey, created: {key: sPath.substring(1)}};

		sUrl = this._createRequestUrl(sPath, oContext, aUrlParams, this.bUseBatch);

		oRequest = this._createRequest(sUrl, sMethod, mHeaders, oEntity, undefined, sETag);

		oContext =  this.getContext("/" + sKey); // context wants a path
		oRequest.context = oContext;
		oRequest.key = sKey;

		if (!this.mChangedEntities[sKey]) {
			oEntry = jQuery.extend(true,{}, oEntity);
		}
		this.mChangedEntities[sKey] = oEntry;

		mRequests = this.mRequests;
		if (sBatchGroupId in this.mDeferredBatchGroups) {
			mRequests = this.mDeferredRequests;
		}

		this._pushToRequestQueue(mRequests, sBatchGroupId, sChangeSetId, oRequest, fnSuccess, fnError, mParameters);

		oRequestHandle = {
				abort: function() {
					oRequest._aborted = true;
				}
		};

		this.mChangeHandles[sKey] = oRequestHandle;

		if (this.bUseBatch) {

			if (!this.oRequestTimer) {
				this.oRequestTimer = jQuery.sap.delayedCall(0,this, this._processRequestQueue, [this.mRequests]);
			}
		} else {
			this._processRequestQueue(this.mRequests);
		}

		return oContext;
	};

	/**
	 * Return value for a property. This can also be a ComplexType property
	 * @param {array} aType Type splitted by dot and passed as array
	 * @returns {any} vValue The property value
	 * @private
	 */
	ODataModel.prototype._createPropertyValue = function(aType) {
		var sNamespace = aType[0];
		var sTypeName = aType[1];
		if (sNamespace.toUpperCase() !== 'EDM') {
			var oComplexType = {};
			var oComplexTypeMetadata = this.oMetadata._getObjectMetadata("complexType",sTypeName,sNamespace);
			jQuery.sap.assert(oComplexTypeMetadata, "Compley type " + sTypeName + " not found in the metadata !");
			for (var i = 0; i < oComplexTypeMetadata.property.length; i++) {
				var oPropertyMetadata = oComplexTypeMetadata.property[i];
				aType = oPropertyMetadata.type.split('.');
				oComplexType[oPropertyMetadata.name] = this._createPropertyValue(aType);
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
		if (this.oMetadataLoadEvent) {
			jQuery.sap.clearDelayedCall(this.oMetadataLoadEvent);
		}
		if (this.oMetadataFailedEvent) {
			jQuery.sap.clearDelayedCall(this.oMetadataFailedEvent);
		}

		if (this.oMetadata) {
			this.oMetadata.destroy();
			delete this.oMetadata;
		}


		if (this.oAnnotations) {
			this.oAnnotations.destroy();
			delete this.oAnnotations;
		}

		Model.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Setting batch groups as deferred. Requests that belongs to a deferred batch group will be sent manually
	 * via a submitChanges call.
	 *
	 * @param {array} aGroupIds Array of batchGroupIds that should be set as deferred
	 * @public
	 */
	ODataModel.prototype.setDeferredBatchGroups = function(aGroupIds) {
		var that = this;
		this.mDeferredBatchGroups = {};
		jQuery.each(aGroupIds, function(iIndex,sBatchGroupId){
			that.mDeferredBatchGroups[sBatchGroupId] = sBatchGroupId;
		});
	};

	/**
	 * Returns the array of batchGroupIds that are set as deferred
	 *
	 * @returns {array} aGroupIds The array of deferred batchGroupIds
	 * @public
	 */
	ODataModel.prototype.getDeferredBatchGroups = function() {
		var aGroupIds = [], i = 0;
		jQuery.each(this.mDeferredBatchGroups, function(sKey, sBatchGroupId){
			aGroupIds[i] = sBatchGroupId;
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
	 * @public
	 */
	ODataModel.prototype.setChangeBatchGroups = function(mGroups) {
		this.mChangeBatchGroups = mGroups;
	};

	/**
	 * Returns the definition of batchGroups per EntityType for TwoWay changes
	 * @returns {map} mChangeBatchGroups Definition of bactchGRoups for "TwoWay" changes
	 * @public
	 */
	ODataModel.prototype.getChangeBatchGroups = function() {
		return this.mChangeBatchGroups;
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
	 * Returns the meta model of this ODataModel containing OData service metadata and annotations
	 * in a merged fashion.
	 * @public
	 * @returns {sap.ui.model.odata.ODataMetaModel} The meta model for this ODataModel
	 */
	ODataModel.prototype.getMetaModel = function() {
		if (!this.oMetaModel) {
			this.oMetaModel = new ODataMetaModel(this.oMetadata, this.oAnnotations);
		}
		return this.oMetaModel;
	};

	return ODataModel;

}, /* bExport= */ true);
