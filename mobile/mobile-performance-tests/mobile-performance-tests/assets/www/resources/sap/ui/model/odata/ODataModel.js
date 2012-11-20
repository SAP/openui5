/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * OData-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.odata
 * @public
 */

// Provides class sap.ui.model.odata.ODataModel
jQuery.sap.declare("sap.ui.model.odata.ODataModel");
jQuery.sap.require("sap.ui.thirdparty.datajs");
jQuery.sap.require("sap.ui.model.Model");
jQuery.sap.require("sap.ui.model.odata.ODataPropertyBinding");
jQuery.sap.require("sap.ui.model.odata.ODataListBinding");

/*global OData *///declare unusual global vars for JSLint/SAPUI5 validation

/**
 * Constructor for a new ODataModel.
 *
 * @param {string} sServiceUrl required - base uri of the service to request data from
 * @param {string} [bJSON] (optional) true to request data as JSON
 * @param {string} [sUser] (optional) user
 * @param {string} [sPassword] (optional) password
 *
 * @class
 * Model implementation for oData format
 *
 * @extends sap.ui.model.Model
 *
 * @author SAP AG
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor
 * @public
 */
sap.ui.model.odata.ODataModel = function(sServiceUrl, bJSON, sUser, sPassword) {
	sap.ui.model.Model.apply(this, arguments);

	this.sDefaultBindingMode = sap.ui.model.BindingMode.OneWay;
	this.mSupportedBindingModes = {"OneWay": true, "OneTime": true, "TwoWay":true};
	this.bCountSupported = true;
	this.bJSON = bJSON;
	this.bCache = true;
	this.oRequestQueue = [];
	this.aBatchOperations = [];
	this.oHandler;

	// prepare variables for request headers, data and metadata
	// TODO: metadata should be an separate object furthermore
	this.oHeaders = {};
	this.oData = {};
	this.oMetadata = {};

	// determine the service base url and the url parameters
	if (sServiceUrl.indexOf("?") == -1) {
		this.sServiceUrl = sServiceUrl;
	} else {
		var aUrlParts = sServiceUrl.split("?");
		this.sServiceUrl = aUrlParts[0];
		this.sUrlParams = aUrlParts[1];
	}

	// Remove trailing slash (if any)
	this.sServiceUrl = this.sServiceUrl.replace(/\/$/, "");

	// store user and password
	this.sUser = sUser;
	this.sPassword = sPassword;
	
	this.oHeaders["x-csrf-token"] = "Fetch";

	// load the metadata before setting accept headers because metadata is only available as XML
	this._loadMetadata();

	// set the the header for the accepted content types
	if (this.bJSON) {
		this.oHeaders["Accept"] = "application/json";
		this.oHandler = OData.jsonHandler;
	} else {
		this.oHeaders["Accept"] = "application/atom+xml,application/atomsvc+xml,application/xml";
		this.oHandler = OData.atomHandler;
	}
	
	// the max version number the client can accept in a response 
	this.oHeaders["MaxDataServiceVersion"] = "2.0";
	
	// set version to 2.0 because 1.0 does not support e.g. skip/top, inlinecount...
	// states the version of the Open Data Protocol used by the client to generate the request.
	this.oHeaders["DataServiceVersion"] = "2.0";
};

// chain the prototypes
sap.ui.model.odata.ODataModel.prototype = jQuery.sap.newObject(sap.ui.model.Model.prototype);

/*
 * Describe the sap.ui.model.odata.ODataModel. Resulting metadata can be obtained via
 * sap.ui.model.odata.ODataModel.getMetadata();
 */
sap.ui.base.Object.defineClass("sap.ui.model.odata.ODataModel", {

	// ---- object ----
	baseType : "sap.ui.model.Model",
	publicMethods : ["create", "remove", "update", "submitChanges", "getServiceMetadata", "read", "hasPendingChanges", "refresh", "resetChanges",
	                 "isCountSupported", "setCountSupported", "forceNoCache", "setProperty", "refreshSecurityToken"]
});

sap.ui.model.odata.ODataModel.M_EVENTS = {
		RejectChange: "rejectChange"
};

sap.ui.model.odata.ODataModel.prototype.fireRejectChange = function(mArguments) {
	this.fireEvent("rejectChange", mArguments);
	return this;
};

sap.ui.model.odata.ODataModel.prototype.attachRejectChange = function(oData, fnFunction, oListener) {
	this.attachEvent("rejectChange", oData, fnFunction, oListener);
	return this;
};

sap.ui.model.odata.ODataModel.prototype.detachRejectChange = function(fnFunction, oListener) {
	this.detachEvent("rejectChange", fnFunction, oListener);
	return this;
};

/**
 * creates a request object
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._createRequest = function(sPath, aUrlParams, bAsync, bCache) {

	// create the url for the service
	var sUrl = this.sServiceUrl;
	if (sPath) {
		if (!jQuery.sap.startsWith(sPath, "/")) {
			sUrl += "/";
		}
		sUrl += sPath;
	}
	if (!aUrlParams) {
		aUrlParams = [];
	}
	if (this.sUrlParams) {
		aUrlParams.push(this.sUrlParams);
	}
	if (aUrlParams.length > 0) {
		sUrl += "?" + aUrlParams.join("&");
	}
	if (bCache === undefined) {
		bCache = true;
	}
	if (bCache === false) {

		var timeStamp = jQuery.now();
		// try replacing _= if it is there
		var ret = sUrl.replace( /([?&])_=[^&]*/, "$1_=" + timeStamp );
		// if nothing was replaced, add timestamp to the end
		sUrl = ret + ( ( ret === sUrl ) ? ( /\?/.test( sUrl ) ? "&" : "?" ) + "_=" + timeStamp : "" );
	}
	
	var oChangeHeader = {};
	jQuery.extend(oChangeHeader,this.oHeaders);
	
	// create a request object for the url, url params and async option
	return {
		requestUri: sUrl,
		headers: oChangeHeader,
		async: bAsync,
		user: this.sUser,
		password: this.sPassword
	};

};

/**
 * Loads the metadata for the service
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._loadMetadata = function() {

	// create a sychronous request object for the metadata request
	var oRequest = this._createRequest("$metadata", null, false);

	// request the metadata of the service (currently this is done synchronously)
	var that = this;

	function _handleSuccess(oMetadata, oResponse) {
		if (oResponse) {
			that.oHeaders["x-csrf-token"] = oResponse.headers["x-csrf-token"];
		}
		that.oMetadata = oMetadata;
	}

	function _handleError(oError) {
		that._handleError(oError);
	}

	// execute the request
	OData.read(oRequest, _handleSuccess, _handleError, OData.metadataHandler);

};

/**
 * Does a request using the provided sServiceUrl and config
 * parameters in the model's constructor and sets the response data into the
 * model. This request is performed asynchronously.
 *
 * @param {string}
 *            sPath Path A string containing the path to the data which should
 *            be retrieved. The path is concatenated to the sServiceUrl
 *            which was specified in the model constructor.
 * @param {function}
 *            fnSuccess a callback function which is called when the data has
 *            been successfully retrieved and stored in the model
 * @param {function}
 *            fnError a callback function which is called when the request
 *            failed
 *            
 * @param {boolean} bCache: Force no caching if false: default = true;
 * 					           
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._loadData = function(sPath, aParams, fnSuccess, fnError, oContext, bCache){

	 /*
	  * TODO: Johannes, Malte: check whether this is OK or not?
	  *
	  * We added a 5th parameter to support loading data within a context scope.
	  * In case of the ExactBrowser this led to the issue, that fn: checkUpdate
	  * updated all the bindings and also the root binding, which finally reset
	  * the ExactBrowser and the nested levels will not show up. By adding the
	  * context to this function it is possible now to update only the relevant
	  * bindings!
	  *
	  * To reproduce the issue just avoid to pass the binding context to the
	  * checkUpdate function and use the following Snippix sample: #3867
	  *
	  * Other change is in the ODataModel where this function is called when
	  * loading additional contexts.
	  */

	// create a request object for the data request
	var oRequest = this._createRequest(sPath, aParams, true, bCache || this.bCache);

	// request the data of the service for the given path
	var that = this;

	function _handleSuccess(oData, oResponse) {

		// no data available
		if (!oData) {
			jQuery.sap.log.fatal("The following problem occurred: No data was retrieved by service: " + oResponse.requestUri);
		}

		aResults = aResults.concat(oData.results);
		// check if not all requested data was loaded
		if (oData.__next){
			// replace request uri with next uri to retrieve additional data
			oRequest.requestUri = oData.__next;
			readRequestedData(oRequest);
		}else{
			// all data is read so merge all data
			jQuery.extend(oData.results, aResults);
			// broken implementations need this
			if (oData.results && !jQuery.isArray(oData.results)) {
				oData = oData.results;
			}
			
			// adding the result data to the data object
			that._importData(oData);

			if (fnSuccess) {
				fnSuccess(oData);
			}
			that.sChangeKey = null;
			that.checkUpdate(oContext); /* TODO: Johannes, Malte: check whether this is OK or not? */
			that.fireRequestCompleted({url : oRequest.requestUri, type : "GET", async : oRequest.async, info: "Accept headers:" + that.oHeaders["Accept"]});
		}
	}

	function _handleError(oError) {
		if (fnError) {
			fnError();
		}
		
		var mParameters = that._handleError(oError);
		
		that.sChangeKey = null;
		that.checkUpdate(oContext); /* TODO: Johannes, Malte: check whether this is OK or not? */
		
		that.fireRequestCompleted({url : oRequest.requestUri, type : "GET", async : oRequest.async, info: "Accept headers:" + that.oHeaders["Accept"]});
		that.fireRequestFailed(mParameters);

	}

	/**
	 * this method is used to retrieve all desired data. It triggers additional read requests if the server paging size
	 * permits to return all the requested data. This could only happen for servers with support for oData > 2.0.
	 */
	function readRequestedData(request){
		// execute the request and use the metadata if available
		OData.read(oRequest, _handleSuccess, _handleError, this.oHandler, undefined, that.oMetadata);
	}

	// execute request
	var aResults = [];
	this.fireRequestSent({url : oRequest.requestUri, type : "GET", async : oRequest.async, info: "Accept headers:" + this.oHeaders["Accept"]});
	readRequestedData(oRequest);
};

/**
 * Imports the data to the internal storage.
 * Nested entries are processed recursively, moved to the canonic location and referenced from the parent entry.
 */
sap.ui.model.odata.ODataModel.prototype._importData = function(oData){
	var that = this,
		aList, sKey, oResult;
	if (oData.results) {
		aList = [];
		jQuery.each(oData.results, function(i, entry) {
			aList.push(that._importData(entry));
		});
		return aList;
	} else {
		sKey = this._getKey(oData);
		this.oData[sKey] = oData;
		jQuery.each(oData, function(i, entry) {
			if (entry && (entry.__metadata && entry.__metadata.uri || entry.results) && !entry.__deferred) {
				oResult = that._importData(entry);
				if (jQuery.isArray(oResult)) {
					oData[i] = { __list: oResult };
				}
				else {
					oData[i] = { __ref: oResult	};
				}
			} 
		});
		return sKey;
	}
};

/**
 * Remove references of navigation properties created in importData function
 */
sap.ui.model.odata.ODataModel.prototype._removeReferences = function(oData){
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
 */
sap.ui.model.odata.ODataModel.prototype._restoreReferences = function(oData){
	var that = this,
 	oCurrentEntry, aList,
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
 * removes all existing data from the model and removes all bindings
 */
sap.ui.model.odata.ODataModel.prototype.removeData = function(){
	this.oData = {};
	this.aBindings = [];
};

/**
 * Private method iterating the registered bindings of this model instance and initiating their check for update
 *
 * @param {object}
 *          oContext
 * @param {boolean}
 *          bForceUpdate
 *
 * @private
 */
sap.ui.model.odata.ODataModel.prototype.checkUpdate = function(oContext, bForceUpdate) {
	var aBindings = this.aBindings.slice(0);
	jQuery.each(aBindings, function(iIndex, oBinding) {
		if ((!oContext || oBinding.getContext() == oContext) || bForceUpdate) {
			oBinding.checkUpdate(bForceUpdate);
		}
	});
};

/**
 * @see sap.ui.model.Model.prototype.bindProperty
 */
sap.ui.model.odata.ODataModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
	var oBinding = new sap.ui.model.odata.ODataPropertyBinding(this, sPath, oContext, mParameters);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.bindList
 */
sap.ui.model.odata.ODataModel.prototype.bindList = function(sPath, oContext, oSorter, aFilters, mParameters) {
	var oBinding = new sap.ui.model.odata.ODataListBinding(this, sPath, oContext, oSorter, aFilters, mParameters);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.createBindingContext
 */
sap.ui.model.odata.ODataModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack) {
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
	var oData = this._getObject(sPath, oContext),
		sKey,
		oNewContext,
		that = this;
	if (oData) {
		sKey = this._getKey(oData);
		oNewContext = this.getContext(sKey);
		fnCallBack(oNewContext);
	}
	else {
		var bIsRelative = !jQuery.sap.startsWith(sPath, "/"),
			sFullPath = this.resolve(sPath, oContext);
		if (sFullPath) {
			var aParams = [],
				sCustomParams = this.createCustomParams(mParameters);
			if (sCustomParams) {
				aParams.push(sCustomParams);
			}
			this._loadData(sFullPath, aParams, function(oData) {
				sKey = oData ? that._getKey(oData) : undefined;
				if (sKey && oContext && bIsRelative) {
					that.oData[oContext.getPath()][sPath] = {__ref: sKey};
				}
				oNewContext = that.getContext(sKey);
				fnCallBack(oNewContext);
			}, function() {
				fnCallBack(); // error - notify to recreate contexts
			});
		} else {
			fnCallBack(); // error - notify to recreate contexts
		}
	}
};

/**
 * @see sap.ui.model.Model.prototype.destroyBindingContext
 */
sap.ui.model.odata.ODataModel.prototype.destroyBindingContext = function(oContext) {
};

/**
 * Create URL parameters from custom parameters
 * @private
 */
sap.ui.model.odata.ODataModel.prototype.createCustomParams = function(mParameters) {
	var aCustomParams = [],
		mSupportedParams = {
			expand: true,
			select: true
		};
	for (var sName in mParameters) {
		if (sName in mSupportedParams) {
			aCustomParams.push("$" + sName + "=" + jQuery.sap.encodeURL(mParameters[sName]));
		}
	}
	return aCustomParams.join("&");
};

/**
 * Sets whether this OData service supports $count on its collections
 *
 * @param {boolean} bCountSupported
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.setCountSupported = function(bCountSupported) {
	this.bCountSupported = bCountSupported;
};

/**
 * Returns whether this model supports the $count on its collections
 *
 * @returns {boolean}
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.isCountSupported = function() {
	return this.bCountSupported;
};

/**
 * Returns the key part from the complete entry URI
 */
sap.ui.model.odata.ODataModel.prototype._getKey = function(oEntry) {
	var sURI = oEntry.__metadata.uri;
	return sURI.substr(sURI.lastIndexOf("/") + 1);
};


/**
 * Returns the value for the property with the given <code>sPropertyName</code>
 *
 * @param {string}
 *          sPath the path/name of the property
 * @param {Object} [oContext] the context if available to access the property value
 * @param {boolean} [bIncludeExpandEntries=null] This parameter should be set when a URI or custom parameter 
 * with a $expand System Query Option was used to retrieve associated entries embedded/inline.
 * If true then the getProperty function returns a desired property value/entry and includes the associated expand entries (if any).
 * If false the associated/expanded entry properties are removed and not included in the
 * desired entry as properties at all. This is useful for performing updates on the base entry only. Note: A copy and not a reference of the entry will be returned.
 * @type any
 * @return the value of the property
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.getProperty = function(sPath, oContext, bIncludeExpandEntries) {
	var oValue = this._getObject(sPath, oContext);
	
	// same behavior as before
	if (bIncludeExpandEntries == null || bIncludeExpandEntries == undefined) {
		return oValue;
	}
	
	// if value is a plain value and not an object we return directly
	if (!jQuery.isPlainObject(oValue)) {
		return oValue;
	}
	
	// do a value copy or the changes to that value will be modified in the model as well (reference)
	oValue = jQuery.extend(true, {}, oValue);
	
	if (bIncludeExpandEntries == true) {
		// include expand entries
		return this._restoreReferences(oValue);		
	} else {
		// remove expanded references
		return this._removeReferences(oValue);
	}

};

/**
 * @param sPath
 * @param oContext
 * @returns
 */
sap.ui.model.odata.ODataModel.prototype._getObject = function(sPath, oContext) {
	var oNode = this.isLegacySyntax() ? this.oData : null,
		// if path = null context must be respected as well: we handle this as relative here
		bIsRelative = sPath && jQuery.sap.startsWith(sPath, "/") ? false : true;
	if (oContext && bIsRelative) {
		oNode = this.oData[oContext.getPath()];
	}
	if (!sPath) {
		return oNode;
	}
	var aParts = sPath.split("/"),
		iIndex = 0;
	if (!aParts[0]) {
		// absolute path starting with slash
		oNode = this.oData;
		iIndex++;
	}
	while(oNode && aParts[iIndex]) {
		oNode = oNode[aParts[iIndex]];
		if (oNode) {
			if (oNode.__ref) {
				oNode = this.oData[oNode.__ref];
			}
			else if (oNode.__list) {
				oNode = oNode.__list;
			}
			else if (oNode.__deferred) {
				oNode = null;
			}
		}
		iIndex++;
	}
	return oNode;
};

/**
 * refresh XSRF token by performing a GET request against the service root URL.
 * 
 * @param {boolean} [bAsync] true for asynchronous requests. Default is false.
 * 
 * @param {function} [fnSuccess] a callback function which is called when the data has
 *            					 been successfully retrieved.
 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
 *  additional error information.
 * 
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.refreshSecurityToken = function(fnSuccess, fnError, bAsync) {
	var that = this;
	this.oHeaders["x-csrf-token"] = "Fetch";
	if (bAsync == undefined) {
		bAsync = false;
	}
	// trigger a read to the service url
	var oRequest = this._createRequest("/", null, bAsync);
	
	OData.read(oRequest, _handleSuccess, _handleError, this.oHandler, null, this.oMetadata);

	function _handleSuccess(oData, oResponse) {
		if (oResponse) {
			that.oHeaders["x-csrf-token"]= oResponse.headers["x-csrf-token"];	
		}
		
		if (fnSuccess) {
			fnSuccess(oData, oResponse);
		}
	}

	function _handleError(oError) {
		that._handleError(oError);

		if (fnError) {
			fnError(oError);
		}
	}
};

/**
 * refresh all bindings and trigger a new GET request. 
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.refresh = function(){

	var aBindings = this.aBindings.slice(0);
	jQuery.each(aBindings, function(iIndex, oBinding) {
		oBinding._refresh();
	});
};

/**
 * submit changes from the requestQueue (queue can currently have only one request) 
 * 
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._submitChange = function(oRequest, fnSuccess, fnError){	
	var that = this;
	
	function _handleSuccess(oData, oResponse) {
		if (fnSuccess) {
			fnSuccess(oData, oResponse);
		}
		
		if (that._isDataStored(that.oRequestQueue[0]) || that.oRequestQueue[0].method == "POST"){
			that.sChangeKey = null;
			that.refresh();
		}
		that.oRequestQueue = [];
		//TODO: do we need to read the data from the server again?
	}

	function _handleError(oError) {		
		that._handleError(oError);
		
		if (that._isDataStored(that.oRequestQueue[0])){
			that.sChangeKey = null;
			that.refresh();
		}
		
		that.oRequestQueue = [];
		
		if (fnError) {
			fnError(oError);
		}
	}
	
	OData.request(oRequest, _handleSuccess, _handleError, this.oHandler, undefined, this.oMetadata);
	
};

/**
 * submit batch requests and collects errors of included requests in an array.
 * 
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._submitBatch = function(oRequest, fnSuccess, fnError){	
	var that = this, sErrorMsg, 
		aErrorResponses = [];
	
	function _handleSuccess(oData, oResponse) {
		that.aBatchOperations = [];
		
		// check if errors occurred in the batch
		jQuery.each(oData.__batchResponses, function(iIndex, oOperationResponse) {
			if (oOperationResponse.message) {
				sErrorMsg = "The following problem occurred: " + oOperationResponse.message;
				if (oOperationResponse.response) {
					sErrorMsg += oOperationResponse.response.statusCode + "," +
					oOperationResponse.response.statusText + "," +
					oOperationResponse.response.body;				
				}
				aErrorResponses.push(oOperationResponse);
				jQuery.sap.log.fatal(sErrorMsg);
			}
			if (oOperationResponse.__changeResponses) {
				jQuery.each(oOperationResponse.__changeResponses, function(iIndex, oChangeOperationResponse) {
					if (oChangeOperationResponse.message) {
						sErrorMsg = "The following problem occurred: " + oChangeOperationResponse.message;
						if (oChangeOperationResponse.response) {
							sErrorMsg += oChangeOperationResponse.response.statusCode + "," +
							oChangeOperationResponse.response.statusText + "," +
							oChangeOperationResponse.response.body;				
						}
						aErrorResponses.push(oChangeOperationResponse);
						jQuery.sap.log.fatal(sErrorMsg);
					}
				});
			}
		});
		
		if (fnSuccess) {
			fnSuccess(oData, oResponse, aErrorResponses);
		}
	}

	function _handleError(oError) {
		that._handleError(oError);
		
		that.aBatchOperations = [];
				
		if (fnError) {
			fnError(oError);
		}
	}
	
	OData.request(oRequest, _handleSuccess, _handleError, OData.batchHandler, undefined, this.oMetadata);
	
};

/**
 * error handling for requests
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._handleError = function(oError) {
	var mParameters = {}; 
	var sErrorMsg = "The following problem occurred: " + oError.message;
			
	mParameters.message = oError.message;
	if (oError.response){
		// if XSRFToken is not valid we get 403 with the x-csrf-token header : Required. 
		// a new token will be fetched in the refresh afterwards.
		if (oError.response.statusCode == '403' && oError.response.headers["x-csrf-token"]) {
			this.oHeaders["x-csrf-token"] = oError.response.headers["x-csrf-token"];
			this.refreshSecurityToken();
		}
		sErrorMsg += oError.response.statusCode + "," +
		oError.response.statusText + "," +
		oError.response.body;
		mParameters.statusCode = oError.response.statusCode;
		mParameters.statusText = oError.response.statusText;
		mParameters.responseText = oError.response.body;
	}
	jQuery.sap.log.fatal(sErrorMsg);
	return mParameters;
};

/**
 * reset changes
 * 
 * @private
 */
/*sap.ui.model.odata.ODataModel.prototype.resetChanges = function(fnSuccess, fnError) {
	var that = this, sPath;
	
	
};*/

/**
 * Return requested data as object if the data has already been loaded and stored in the model. 
 * 
 * @param {String} sPath A string containing the path to the data object that should be returned.
 * @param {Object} [oContext] the optional context which is used with the sPath to retrieve the requested data.
 * @param {boolean} [bIncludeExpandEntries=null] This parameter should be set when a URI or custom parameter 
 * with a $expand System Query Option was used to retrieve associated entries embedded/inline.
 * If true then the getProperty function returns a desired property value/entry and includes the associated expand entries (if any).
 * If false the associated/expanded entry properties are removed and not included in the
 * desired entry as properties at all. This is useful for performing updates on the base entry only. Note: A copy and not a reference of the entry will be returned.
 * 
 * return {object} oData Object containing the requested data if the path is valid. 
 * @public
 * @deprecated please use {{{getProperty}}} instead
 */
sap.ui.model.odata.ODataModel.prototype.getData = function(sPath, oContext, bIncludeExpandEntries) {
	return this.getProperty(sPath, oContext, bIncludeExpandEntries);
};

/**
 * get change url: the url which can be used to easily trigger your change without "nachdenken".
 * 
 * @return {string} change url
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._getChangeUrl = function(sPath, oContext){
	var sUrl, sKey;
	
	if (oContext) {
		sKey = oContext.getPath();
		sKey = sKey.replace(/^\/|\/$/g, "");
	}

	sPath = sPath.replace(/^\/|\/$/g, "");
	
	if(oContext && sPath) {
		sUrl = this.sServiceUrl + '/' + sKey + '/' + sPath;
	} else if (!oContext && sPath){
		sUrl = this.sServiceUrl + '/' + sPath;
	} else {
		sUrl = this.sServiceUrl + '/' + sKey;
	}
	return sUrl;
};

/**
 * creation of a request object for changes
 * 
 * @return {Object} request object
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._createChangeRequest = function(sUrl, oPayload, sMethod, bAsync) {	
	var oChangeHeader = {};
	jQuery.extend(oChangeHeader,this.oHeaders);
		
	// make sure to set content type header for POST/PUT requests when using JSON format to prevent datajs to add "odata=verbose" to the content-type header
	if (this.bJSON && sMethod != "DELETE") {
		oChangeHeader["Content-Type"] = "application/json";		
	}
	
	if (sMethod == "MERGE") {
		oChangeHeader["x-http-method"] = "MERGE";
		sMethod = "POST";
	}
	
	return { 
		    headers : oChangeHeader, 
		    requestUri : sUrl, 
		    method : sMethod,
		    data : oPayload,
		    user: this.sUser,
		    password: this.sPassword,
		    async: bAsync
	};
};

/**
 * Checks if the data provided by the sPath and oContext is stored in the model.
 * This is needed to trigger a refresh only for the data which is stored in the model and so bound to the UI.
 * 
 * @return {boolean} 
 * @private
 */
sap.ui.model.odata.ODataModel.prototype._isDataStored = function(oRequest) {	
	var sPath, oData;
	
	sPath = oRequest.requestUri.replace(this.sServiceUrl,'');
	oData = this._getObject(sPath);
	if (oData) {
		return true;
	}
	return false;
};

/**
 * Trigger a PUT/MERGE request to the odata service that was specified in the model constructor. 
 * 
 * @param {String} sPath A string containing the path to the data that should be updated.
 * 							The path is concatenated to the sServiceUrl which was specified 
 * 							in the model constructor.
 * @param {Object} [oContext] If specified the sPath has to be is relative to the path given with the context.
 * @param {object} oData data of the entry that should be updated.
 *            					 
 * @param {function} [fnSuccess] a callback function which is called when the data has
 *            					 been successfully updated.
 *            
 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
 * additional error information.
 * 
 * @param {Boolean} [bMerge=false] trigger a MERGE request instead of a PUT request to perform a differential update
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.update = function(sPath, oData, oContext, fnSuccess, fnError, bMerge) {
	var oRequest, sUrl;
	
	sUrl = this._getChangeUrl(sPath, oContext);
	
	if (bMerge) {
		oRequest = this._createChangeRequest(sUrl, oData, "MERGE", false);		
	} else {
		oRequest = this._createChangeRequest(sUrl, oData, "PUT", false);
	}		
	
	this.oRequestQueue.push(oRequest);

	this._submitChange(oRequest, fnSuccess, fnError);
};

/**
 * Trigger a POST request to the odata service that was specified in the model constructor. 
 * 
 * @param {String} sPath A string containing the path to the collection where an entry 
 * 							should be created. The path is concatenated to the sServiceUrl
 *            				which was specified in the model constructor.
 * @param {Object} [oContext] If specified the sPath has to be is relative to the path given with the context. 
 * @param {object} oData data of the entry that should be created.
 *            					 
 * @param {function} [fnSuccess] a callback function which is called when the data has
 *            					 been successfully retrieved. The handler can have the 
 *            	                 following parameters: oData and response.
 *            						
 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
 * additional error information.
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.create = function(sPath, oData, oContext, fnSuccess, fnError) {
	var oRequest, sUrl;
	
	sUrl = this._getChangeUrl(sPath, oContext);
	
	oRequest = this._createChangeRequest(sUrl, oData, "POST", false);
	
	this.oRequestQueue.push(oRequest);
	
	this._submitChange(oRequest, fnSuccess, fnError);
};

/**
 * Trigger a DELETE request to the odata service that was specified in the model constructor. 
 *
 * @param {String} sPath A string containing the path to the data that should
 *            				be removed. The path is concatenated to the sServiceUrl
 *            				which was specified in the model constructor.
 * @param {Object} [oContext] If specified the sPath has to be is relative to the path given with the context.
 * @param {function} [fnSuccess]  a callback function which is called when the data has
 *            					 been successfully retrieved. The handler can have the 
 *            	                 following parameters: oData and response.
 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
 * additional error information.
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.remove = function(sPath, oContext, fnSuccess, fnError) {
	var oRequest, sUrl;
	
	sUrl = this._getChangeUrl(sPath, oContext);
	
	oRequest = this._createChangeRequest(sUrl, null, "DELETE", false);
	
	this.oRequestQueue.push(oRequest);
	
	this._submitChange(oRequest, fnSuccess, fnError);
};

/**
 * Trigger a GET request to the odata service that was specified in the model constructor. 
 * The data will not be stored in the model. The requested data is returned with the response.
 *
 * @param {String} sPath A string containing the path to the data which should
 *            				be retrieved. The path is concatenated to the sServiceUrl
 *            				which was specified in the model constructor.
 * @param {Object} [oContext] If specified the sPath has to be is relative to the path given with the context. 
 * @param {Array} [aParams] An Array of url parameters which will be concatenated to the read url
 *
 * @param {boolean} [bAsync] true for asynchronous requests. Default is true.
 * 
 * @param {function} [fnSuccess] a callback function which is called when the data has
 *            					 been successfully retrieved. The handler can have the 
 *            	                 following parameters: oData and response. 
 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
 * additional error information.
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.read = function(sPath, oContext, aParams, bAsync, fnSuccess, fnError) {
	var oRequest, sUrl;
	
	sUrl = this._getChangeUrl(sPath, oContext);
	
	oRequest = this._createRequest(sUrl.replace(this.sServiceUrl,''), aParams, bAsync);
	
	OData.read(oRequest, fnSuccess, fnError, this.oHandler, null, this.oMetadata);
};

/**
 * Creates a single batch operation (read or change operation) which can be used in a batch request.
 * 
 * @param {String} sPath A string containing the path to the collection or entry where the batch operation should be performed.
 * 						The path is concatenated to the sServiceUrl which was specified in the model constructor.
 * @param {String} sMethod for the batch operation. Possible values are GET, PUT, MERGE, POST, DELETE
 * @param {object} [oData] optional data payload which should be created, updated, deleted in a change batch operation. 
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.createBatchOperation = function(sPath, sMethod, oData) {
	
	// for batch remove strating / if any
	if (jQuery.sap.startsWith(sPath, "/")) {
		sPath = sPath.substr(1);
	}
	
	var oRequest = {
		requestUri: sPath,
		method: sMethod.toUpperCase()
	};
	
	if (oData) {
		oRequest.data = oData;
	}
	
	return oRequest;

};

/**
 * Appends the read batch operations to the end of the batch stack. Only GET batch operations should be included in the specified array. 
 * If an illegal batch operation is added to the batch nothing will be performed and false will be returned.
 * 
 * @param {Array} aReadOperations an array of read batch operations created via <code>createBatchOperation</code> and <code>sMethod</code> = GET
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.addBatchReadOperations = function(aReadOperations) {
	if (!jQuery.isArray(aReadOperations) || aReadOperations.length <= 0) {
		jQuery.sap.log.warning("No array with batch operations provided!");
		return false;
	}
	var that = this;
	jQuery.each(aReadOperations, function(iIndex, oReadOperation) {
		if (oReadOperation.method != "GET") {
			jQuery.sap.log.warning("Batch operation should be a GET operation!");
			return false;
		}
		that.aBatchOperations.push(oReadOperation);
	});
};

/**
 * Appends the change batch operations to the end of the batch stack. Only PUT, POST or DELETE batch operations should be included in the specified array. 
 * The operations in the array will be included in a single changeset. To embed change operations in different change sets call this method with the corresponding change operations again.
 * If an illegal batch operation is added to the change set nothing will be performed and false will be returned.
 * 
 * @param {Array} aChangeOperations an array of change batch operations created via <code>createBatchOperation</code> and <code>sMethod</code> = POST, PUT, MERGE or DELETE
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.addBatchChangeOperations = function(aChangeOperations) {
	if (!jQuery.isArray(aChangeOperations) || aChangeOperations.length <= 0) {
		return false;
	}
	jQuery.each(aChangeOperations, function(iIndex, oChangeOperation) {
		if (oChangeOperation.method != "POST" && oChangeOperation.method != "PUT" && oChangeOperation.method != "MERGE" && oChangeOperation.method != "DELETE") {
			jQuery.sap.log.warning("Batch operation should be a POST/PUT/MERGE/DELETE operation!");
			return false;
		}
	});
	this.aBatchOperations.push({ __changeRequests : aChangeOperations });
};

/**
 * Removes all operations in the current batch.
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.clearBatch = function() {
	this.aBatchOperations = [];
};

/**
 * Submits the collected changes in the batch which were collected via <code>addBatchReadOperations</code> or <code>addBatchChangeOperations</code>.
 * The batch will be cleared afterwards. If the batch is empty no request will be performed and false will be returned.
 * Note: No data will be stored in the model. 
 *  
 * @param {boolean} [bAsync] true for asynchronous request. Default is true.
 * 
 * @param {function} [fnSuccess] a callback function which is called when the batch request has
 *            					 been successfully sent. Note: There might have errors occured in the single batch operations. These errors can be accessed in the
 *            aErrorResponses parameter in the callback handler.
 *            The handler can have the 
 *            	                 following parameters: oData, oResponse and aErrorResponses. 
 * @param {function} [fnError] a callback function which is called when the batch request failed. The handler can have the parameter: oError which contains
 * additional error information.
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.submitBatch = function(bAsync, fnSuccess, fnError) {
	var oRequest, sUrl;
	
	if (this.aBatchOperations.length <= 0) {
		jQuery.sap.log.warning("No batch operations in batch. No request will be triggered!");
		return false;
	}
	
	sUrl = this.sServiceUrl	+ "/$batch";
	
	var oChangeHeader = {};
	jQuery.extend(oChangeHeader,this.oHeaders);
	
	// reset
	delete oChangeHeader["Content-Type"];

	// create payload
	var oPayload = { };
	oPayload.__batchRequests = this.aBatchOperations;
	
	var oRequest = {
		    headers : oChangeHeader, 
		    requestUri : sUrl, 
		    method : "POST",
		    data : oPayload,
		    user: this.sUser,
		    password: this.sPassword,
		    async: bAsync
	};
	
	this._submitBatch(oRequest, fnSuccess, fnError);
};

/**
 * Return the metadata object
 *
 * @return {Object} metdata object
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.getServiceMetadata = function() {
	return this.oMetadata;
};


/**
 * Submits the collected changes which were collected by the setProperty method. A MERGE request will be triggered to only update the changed properties.
 * If a URI with a $expand System Query Option was used then the expand entries will be removed from the collected changes.
 * Changes to this entries should be done on the entry itself. So no deep updates are supported.
 * 
 * @param {function} [fnSuccess] a callback function which is called when the data has
 *            					 been successfully updated. The handler can have the 
 *            	                 following parameters: oData and response. 
 * @param {function} [fnError] a callback function which is called when the request failed. The handler can have the parameter: oError which contains
 * additional error information
 * 
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.submitChanges = function(fnSuccess, fnError) {
		
	var oRequest, oPayload, that = this, sPath;
	
	if (this.sChangeKey) {	
		
		sPath = this.sChangeKey.replace(this.sServiceUrl,'');
		
		oPayload = this._getObject(sPath);
		
		if (jQuery.isPlainObject(oPayload)) {
			// do a copy of the payload or the changes will be deleted in the model as well (reference)
			oPayload = jQuery.extend(true, {}, oPayload);			
		
			// remove metadata, navigation properties to reduce payload
			delete oPayload.__metadata;
			jQuery.each(oPayload, function(sPropName, oPropValue) {
				if (oPropValue && oPropValue.__deferred) {
					delete oPayload[sPropName];
				}
			});
			
			// delete expand refs and __lists properties
			oPayload = this._removeReferences(oPayload);
		}
		
		oRequest = this._createChangeRequest(this.sChangeKey, oPayload, "MERGE", true);
		
		this.oRequestQueue.push(oRequest);

		function _handleSuccess(oData, oResponse) {
			if (fnSuccess) {
				fnSuccess(oData, oResponse);
			}
			that.sChangeKey = null;
		}
		function _handleError(oError) {
			if (fnError) {
				fnError(oError);
			} 
			that.sChangeKey = null;
		}
		
		this._submitChange(oRequest, _handleSuccess, _handleError);
	}
};

/**
 * 
 * Resets the collected changes by the setProperty method and reloads the data from the server.
 * 
 * @param {function} [fnSuccess] a callback function which is called when the data has
 *            					 been successfully resetted. The handler can have the 
 *            	                 following parameters: oData and response. 
 * @param {function} [fnError] a callback function which is called when the request failed
 * 
 * @public
 */ 
sap.ui.model.odata.ODataModel.prototype.resetChanges = function(fnSuccess, fnError) {
	
	var sPath;
	if (this.sChangeKey) {
		sPath = this.sChangeKey.replace(this.sServiceUrl,'');
		this._loadData(sPath, null, fnSuccess, fnError);
	}
};

/**
 * Sets a new value for the given property <code>sPropertyName</code> in the model without triggering a server request.
 *  This can be done by the submitChanges method.
 *  
 *  Note: Only one entry of one collection can be updated at once. Otherwise a fireRejectChange event is fired.
 *  
 *  Before updating a different entry the existing changes of the current entry have to be submitted or resetted by the
 *  corresponding methods: submitChanges, resetChanges.
 *  
 *  IMPORTANT: All pending changes are resetted in the model if the application triggeres any kind of requests 
 *  which change the model data e.g. sorting, filtering, refresh, create, remove, update. Make sure to
 *  submit the pending changes first. To determine if there are any pending changes call the hasPendingChanges method.
 * 
 * @param {string}  sPath path of the property to set
 * @param {any}     oValue value to set the property to
 * @param {object} [oContext=null] the context which will be used to set the property
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.setProperty = function(sPath, oValue, oContext) {
		
	var sProperty, oEntry = { }, 
		sChangeKey = this._getChangeUrl(sPath, oContext),
		sObjectPath = sPath.substring(0, sPath.lastIndexOf("/")),
		success = false;
	
	// extract the Url that points to the 'entry'. We need to do this if a complex type will be updated.
	sChangeKey = sChangeKey.replace(this.sServiceUrl+'/','');
	sChangeKey = sChangeKey.substring(0, sChangeKey.indexOf("/")),
	sChangeKey = this.sServiceUrl + '/' + sChangeKey,
	
	sProperty = sPath.substr(sPath.lastIndexOf("/")+1);
	oEntry = this._getObject(sObjectPath, oContext);
	
	if (!this.sChangeKey) {
		this.sChangeKey = sChangeKey;
	} 
	
	if (this.sChangeKey == sChangeKey) {
		oEntry[sProperty] = oValue;
		success = true;
		this.checkUpdate();
	} else {
		this.fireRejectChange(
				{rejectedValue : oValue,
				oldValue: oEntry[sProperty]}
		);
	}
	 return success;
	
};


/**
 * Checks if there exist pending changes in the model created by the setProperty method.
 * @return {boolean} true/false  
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.hasPendingChanges = function() {
	return this.sChangeKey != null;
};

/**
 * update all bindings
 * @param {boolean} bForceUpdate true/false: Default = false. If set to false an update 
 * 					will only be done when the value of a binding changed.   
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.updateBindings = function(bForceUpdate) {
	this.checkUpdate(null,bForceUpdate);
};

/**
 * Force no caching
 * @param {boolean} force no cache true/false: Default = false  
 * @public
 */
sap.ui.model.odata.ODataModel.prototype.forceNoCache = function(bForceNoCache) {
	this.bCache = !bForceNoCache; 
};


/**  
*  extract the entity type metadata of a specified collection out of the metadata document 
*/  
sap.ui.model.odata.ODataModel.prototype._getEntityType = function(sCollection) {
	var sEntityTypeNamespace, sEntityTypeName, oEntityType;
	if (!this.oMetadata || jQuery.isEmptyObject(this.oMetadata)) {
		jQuery.sap.assert(undefined, "No metadata loaded!");
		return null;
	}
	jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
		if (oSchema.entityContainer) {
			jQuery.each(oSchema.entityContainer, function(k, oEntityContainer) {   
				jQuery.each(oEntityContainer.entitySet, function(j, oEntitySet) {  
					if (oEntitySet.name === sCollection) {  
						var iSepIdx = oEntitySet.entityType.lastIndexOf("."); 
						sEntityTypeNamespace = oEntitySet.entityType.substr(0, iSepIdx);
						sEntityTypeName = oEntitySet.entityType.substr(iSepIdx + 1);
						return false;
					}
				});
			});
		}
	});
	if (!sEntityTypeName || !sEntityTypeNamespace) {
		jQuery.sap.assert(undefined, "EntitySet for Collection "+sCollection+ " not found!"); 
		return null;
	}
	// search again in all schemas for the entity type because it can be in different schemas.
	jQuery.each(this.oMetadata.dataServices.schema, function(i, oSchema) {
		// check if we found the right schema which will contain the type
		if (oSchema.entityType && oSchema.namespace === sEntityTypeNamespace) {
			jQuery.each(oSchema.entityType, function(j, oCurrentEntityType) {
				if (oCurrentEntityType.name === sEntityTypeName) {  
					oEntityType = oCurrentEntityType;
					return false;
				}
			});
			return !oEntityType;
		}
	});
	
	jQuery.sap.assert(oEntityType, "Entity type of Collection "+sCollection+ " not found!");  
	return oEntityType;  
};


// TODO complex types not supported
/**  
*  extract the property metadata of a specified property of a entity type out of the metadata document 
*/  
sap.ui.model.odata.ODataModel.prototype._getPropertyMetadata = function(oEntityType, sProperty) {
	var oPropertyMetadata;
	jQuery.each(oEntityType.property, function(k, oProperty) {
		if (oProperty.name === sProperty){
			oPropertyMetadata = oProperty;
			return false;
		}
	});
	
	jQuery.sap.assert(oPropertyMetadata, "Property type for property "+sProperty+ " of Entity type " +oEntityType.name+ " not found!");  
	return oPropertyMetadata;  
};
