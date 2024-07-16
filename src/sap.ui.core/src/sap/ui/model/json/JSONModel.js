/*!
 * ${copyright}
 */
/*eslint-disable max-len */
/**
 * JSON-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.json
 * @public
 */

// Provides the JSON object based model implementation
sap.ui.define([
	"./JSONListBinding",
	"./JSONPropertyBinding",
	"./JSONTreeBinding",
	"sap/base/Log",
	"sap/base/util/deepExtend",
	"sap/base/util/isPlainObject",
	"sap/ui/model/ClientModel",
	"sap/ui/model/Context"
], function(JSONListBinding, JSONPropertyBinding, JSONTreeBinding, Log, deepExtend, isPlainObject,
		ClientModel, Context) {
	"use strict";

	/**
	 * Constructor for a new JSONModel.
	 *
	 * When observation is activated, the application can directly change the JS objects without the need to call
	 * {@link sap.ui.model.json.JSONModel#setData}, {@link sap.ui.model.json.JSONModel#setProperty} or
	 * {@link sap.ui.model.Model#refresh}. <b>Note:</b> Observation only works for existing properties in the JSON
	 * model. Newly added or removed properties and newly added or removed array entries, for example, are not detected.
	 *
	 * @param {object|string} [oData] Either the URL where to load the JSON from or a JS object
	 * @param {boolean} [bObserve=false] Whether to observe the JSON data for property changes
	 *
	 * @class
	 * Model implementation for the JSON format.
	 *
	 * This model is not prepared to be inherited from.
	 *
	 * The model does not support {@link sap.ui.model.json.JSONModel#bindList binding lists} in case the bound data
	 * contains circular structures and the bound control uses
	 * {@link topic:7cdff73f308b4b10bdf7d83b7aba72e7 extended change detection}.
	 *
	 * @extends sap.ui.model.ClientModel
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.model.json.JSONModel
	 */
	var JSONModel = ClientModel.extend("sap.ui.model.json.JSONModel", /** @lends sap.ui.model.json.JSONModel.prototype */ {

		constructor : function(oData, bObserve) {
			this.pSequentialImportCompleted = Promise.resolve();
			ClientModel.apply(this, arguments);

			this.bObserve = bObserve;
			if (oData && typeof oData == "object") {
				this.setData(oData);
			}
		},

		metadata : {}

	});

	/**
	 * Sets the data, passed as a JS object tree, to the model.
	 *
	 * @param {object} oData the data to set on the model
	 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
	 * @throws {Error} If the provided data contains a cycle and <code>bMerge</code> is set
	 *
	 * @public
	 */
	JSONModel.prototype.setData = function(oData, bMerge){
		if (bMerge) {
			// do a deep copy
			this.oData = deepExtend(Array.isArray(this.oData) ? [] : {}, this.oData, oData);
		} else {
			this.oData = oData;
		}
		if (this.bObserve) {
			this.observeData();
		}
		this.checkUpdate();
	};

	/**
	 * Recursively iterates the JSON data and adds setter functions for the properties
	 *
	 * @private
	 */
	JSONModel.prototype.observeData = function(){
		var that = this;
		function createGetter(vValue) {
			return function() {
				return vValue;
			};
		}
		function createSetter(oObject, sName) {
			return function(vValue) {
				// Newly added data needs to be observed to be included
				observeRecursive(vValue, oObject, sName);
				that.checkUpdate();
			};
		}
		function createProperty(oObject, sName, vValue) {
			// Do not create getter/setter for function references
			if (typeof vValue == "function"){
				oObject[sName] = vValue;
			} else {
				Object.defineProperty(oObject, sName, {
					get: createGetter(vValue),
					set: createSetter(oObject, sName)
				});
			}
		}
		function observeRecursive(oObject, oParentObject, sName) {
			var i;

			if (Array.isArray(oObject)) {
				for (i = 0; i < oObject.length; i++) {
					observeRecursive(oObject[i], oObject, i);
				}
			} else if (isPlainObject(oObject)) {
				for (i in oObject) {
					observeRecursive(oObject[i], oObject, i);
				}
			}
			if (oParentObject) {
				createProperty(oParentObject, sName, oObject);
			}
		}
		observeRecursive(this.oData);
	};

	/**
	 * Sets the data, passed as a string in JSON format, to the model.
	 *
	 * @param {string} sJSON the JSON data to set on the model
	 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
	 *
	 * @public
	 */
	JSONModel.prototype.setJSON = function(sJSON, bMerge){
		var oJSONData;
		try {
			oJSONData = JSON.parse(sJSON + "");
			this.setData(oJSONData, bMerge);
		} catch (e) {
			Log.fatal("The following problem occurred: JSON parse Error: " + e);
			this.fireParseError({url : "", errorCode : -1,
				reason : "", srcText : e, line : -1, linepos : -1, filepos : -1});
		}
	};

	/**
	 * Serializes the current JSON data of the model into a string.
	 *
	 * @return {string} The JSON data serialized as string
	 * @public
	 */
	JSONModel.prototype.getJSON = function(){
		return JSON.stringify(this.oData);
	};

	/**
	 * Loads JSON-encoded data from the server and stores the resulting JSON data in the model.
	 * Note: Due to browser security restrictions, most "Ajax" requests are subject to the same origin policy,
	 * the request can not successfully retrieve data from a different domain, subdomain, or protocol.
	 *
	 * Note: To send a JSON object in the body of a "POST" request to load the model data, <code>oParameters</code> has
	 * to be the JSON-stringified value of the object to be sent, and <code>mHeaders</code> has to contain a
	 * <code>"Content-Type"</code> property with the value <code>"application/json;charset=utf-8"</code>.
	 *
	 * @param {string} sURL A string containing the URL to which the request is sent
	 * @param {object | string} [oParameters]
	 *   The data to be sent to the server with the data-loading request. If <code>oParameters</code> is a string, it
	 *   has to be encoded based on the used content type. The default encoding is
	 *   <code>'application/x-www-form-urlencoded; charset=UTF-8'</code> but it may be overwritten via the
	 *   <code>"Content-Type"</code> property given in <code>mHeaders</code>. If <code>oParameters</code> is an object,
	 *   a string is generated and the keys and values are URL-encoded. The resulting string is appended to the URL if
	 *   the HTTP request method cannot have a request body, e.g. for a "GET" request. Otherwise, the resulting string
	 *   is added to the request body.
	 * @param {boolean} [bAsync=true] <b>Deprecated as of Version 1.107</b>; always use asynchronous
	 * loading for performance reasons. By default, all requests are sent asynchronously.
	 * Synchronous requests may temporarily lock the browser, disabling any actions while
	 * the request is active. Cross-domain requests do not support synchronous operations.
	 * @param {string} [sType="GET"] The HTTP verb to use for the request ("GET" or "POST")
	 * @param {boolean} [bMerge=false] Whether the data should be merged instead of replaced
	 * @param {boolean} [bCache=true] <b>Deprecated as of Version 1.107</b>; always use the cache
	 * headers from the back-end system for performance reasons. Disables caching if set to
	 * <code>false</code>.
	 * @param {object} [mHeaders] An object of additional header key/value pairs to send along with the request
	 *
	 * @return {Promise|undefined} in case bAsync is set to true a Promise is returned; this promise resolves/rejects based on the request status
	 * @public
	 */
	JSONModel.prototype.loadData = function(sURL, oParameters, bAsync, sType, bMerge, bCache, mHeaders){
		var pImportCompleted;

		bAsync = (bAsync !== false);
		sType = sType || "GET";
		bCache = bCache === undefined ? this.bCache : bCache;

		this.fireRequestSent({url : sURL, type : sType, async : bAsync, headers: mHeaders,
			info : "cache=" + bCache + ";bMerge=" + bMerge, infoObject: {cache : bCache, merge : bMerge}});

		var fnSuccess = function(oData) {
			if (!oData) {
				Log.fatal("The following problem occurred: No data was retrieved by service: " + sURL);
			}
			this.setData(oData, bMerge);
			this.fireRequestCompleted({url : sURL, type : sType, async : bAsync, headers: mHeaders,
				info : "cache=" + bCache + ";bMerge=" + bMerge, infoObject: {cache : bCache, merge : bMerge}, success: true});
		}.bind(this);

		var fnError = function(oParams, sTextStatus){
			// the textStatus is either passed by jQuery via arguments,
			// or by us from a promise reject() in the async case
			var sMessage = sTextStatus || oParams.textStatus;
			var oParameters = bAsync ? oParams.request : oParams;
			var iStatusCode = oParameters.status;
			var sStatusText = oParameters.statusText;
			var sResponseText = oParameters.responseText;

			var oError = {
				message : sMessage,
				statusCode : iStatusCode,
				statusText : sStatusText,
				responseText : sResponseText
			};
			Log.fatal("The following problem occurred: " + sMessage, sResponseText + ","	+ iStatusCode + "," + sStatusText);

			this.fireRequestCompleted({url : sURL, type : sType, async : bAsync, headers: mHeaders,
				info : "cache=" + bCache + ";bMerge=" + bMerge, infoObject: {cache : bCache, merge : bMerge}, success: false, errorobject: oError});
			this.fireRequestFailed(oError);

			if (bAsync) {
				return Promise.reject(oError);
			}

			return undefined;
		}.bind(this);

		var _loadData = function(fnSuccess, fnError) {
			this._ajax({
				url: sURL,
				async: bAsync,
				dataType: 'json',
				cache: bCache,
				data: oParameters,
				headers: mHeaders,
				jsonp: false,
				type: sType,
				success: fnSuccess,
				error: fnError
			});
		}.bind(this);

		if (bAsync) {
			pImportCompleted = new Promise(function(resolve, reject) {
				var fnReject =  function(oXMLHttpRequest, sTextStatus, oError) {
					reject({request: oXMLHttpRequest, textStatus: sTextStatus, error: oError});
				};
				_loadData(resolve, fnReject);
			});

			// chain the existing loadData calls, so the import is done sequentially
			var pReturn = this.pSequentialImportCompleted.then(function() {
				return pImportCompleted.then(fnSuccess, fnError);
			});

			// attach exception/rejection handler, so the internal import promise always resolves
			this.pSequentialImportCompleted = pReturn.catch(function(oError) {
				Log.error("Loading of data failed: " + oError.stack);
			});

			// return chained loadData promise (sequential imports)
			// but without a catch handler, so the application can also is notified about request failures
			return pReturn;
		} else {
			_loadData(fnSuccess, fnError);

			return undefined;
		}
	};

	/**
	 * Returns a Promise of the current data-loading state.
	 * Every currently running {@link sap.ui.model.json.JSONModel#loadData} call is respected by the returned Promise.
	 * This also includes a potential loadData call from the JSONModel's constructor in case a URL was given.
	 * The data-loaded Promise will resolve once all running requests have finished.
	 * Only request, which have been queued up to the point of calling
	 * this function will be respected by the returned Promise.
	 *
	 * @return {Promise} a Promise, which resolves if all pending data-loading requests have finished
	 * @public
	 */
	JSONModel.prototype.dataLoaded = function() {
		return this.pSequentialImportCompleted;
	};

	/*
	 * @see sap.ui.model.ClientModel#bindProperty
	 */
	JSONModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new JSONPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/*
	 * @see sap.ui.model.Model.prototype.bindList
	 *
	 */
	JSONModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	/*
	 * @see sap.ui.model.Model.prototype.bindTree
	 *
	 * @param {object} [mParameters]
	 *   Additional model specific parameters; if the mParameter <code>arrayNames</code> is
	 *   specified with an array of string names these names will be checked against the tree data
	 *   structure and the found data in this array is included in the tree, but only if the parent
	 *   array is also included; if this parameter is not specified then all found arrays in the
	 *   data structure are bound; if the tree data structure doesn't contain an array, this
	 *   parameter doesn't need to be specified
	 *
	 */
	JSONModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters, aSorters) {
		var oBinding = new JSONTreeBinding(this, sPath, oContext, aFilters, mParameters, aSorters);
		return oBinding;
	};

	/**
	 * Sets <code>oValue</code> as new value for the property defined by the given
	 * <code>sPath</code> and <code>oContext</code>. Once the new model value has been set, all
	 * interested parties are informed.
	 *
	 * @param {string} sPath
	 *   The path of the property to set
	 * @param {any} oValue
	 *   The new value to be set for this property
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context used to set the property
	 * @param {boolean} [bAsyncUpdate]
	 *   Whether to update other bindings dependent on this property asynchronously
	 * @return {boolean}
	 *   <code>true</code> if the value was set correctly, and <code>false</code> if errors
	 *   occurred, for example if the entry was not found.
	 * @public
	 */
	JSONModel.prototype.setProperty = function(sPath, oValue, oContext, bAsyncUpdate) {
		var sResolvedPath = this.resolve(sPath, oContext),
			iLastSlash, sObjectPath, sProperty;

		// return if path / context is invalid
		if (!sResolvedPath) {
			return false;
		}

		// If data is set on root, call setData instead
		if (sResolvedPath == "/") {
			this.setData(oValue);
			return true;
		}

		iLastSlash = sResolvedPath.lastIndexOf("/");
		// In case there is only one slash at the beginning, sObjectPath must contain this slash
		sObjectPath = sResolvedPath.substring(0, iLastSlash || 1);
		sProperty = sResolvedPath.substr(iLastSlash + 1);

		var oObject = this._getObject(sObjectPath);
		if (oObject) {
			oObject[sProperty] = oValue;
			this.checkUpdate(false, bAsyncUpdate);
			return true;
		}
		return false;
	};

	/**
	 * Returns the value for the property with the given path and context.
	 *
	 * @param {string} sPath
	 *   The path to the property
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which will be used to retrieve the property
	 * @return {any|null|undefined}
	 *   The value of the property. If the property is not found, <code>null</code> or
	 *   <code>undefined</code> is returned.
	 * @public
	 */
	JSONModel.prototype.getProperty = function(sPath, oContext) {
		return this._getObject(sPath, oContext);

	};

	/**
	 * Returns the value for the property with the given path and context.
	 *
	 * @param {string} sPath
	 *   The path to the property
	 * @param {object|sap.ui.model.Context} [oContext]
	 *   The context or a JSON object
	 * @returns {any}
	 *   The value of the property. If the property path derived from the given path and context is
	 *   absolute (starts with a "/") but does not lead to a property in the data structure,
	 *   <code>undefined</code> is returned. If the property path is not absolute, <code>null</code>
	 *   is returned.
	 *
	 *   Note: If a JSON object is given instead of a context, the value of the property is taken
	 *   from the JSON object. If the given path does not lead to a property, <code>undefined</code>
	 *   is returned. If the given path represents a falsy JavaScript value, the given JSON object
	 *   is returned.
	 * @private
	 */
	JSONModel.prototype._getObject = function (sPath, oContext) {
		let oNode = null;
		if (oContext instanceof Context) {
			oNode = this._getObject(oContext.getPath());
		} else if (oContext != null) {
			oNode = oContext;
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
		while (oNode && aParts[iIndex]) {
			oNode = oNode[aParts[iIndex]];
			iIndex++;
		}
		return oNode;
	};

	JSONModel.prototype.isList = function(sPath, oContext) {
		var sAbsolutePath = this.resolve(sPath, oContext);
		return Array.isArray(this._getObject(sAbsolutePath));
	};

	/**
	 * Sets the meta model associated with this model
	 *
	 * @private
	 * @param {sap.ui.model.MetaModel} oMetaModel the meta model associated with this model
	 */
	JSONModel.prototype._setMetaModel = function(oMetaModel) {
		this._oMetaModel = oMetaModel;
	};

	JSONModel.prototype.getMetaModel = function() {
		return this._oMetaModel;
	};

	return JSONModel;

});