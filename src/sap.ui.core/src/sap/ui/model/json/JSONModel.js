/*!
 * ${copyright}
 */

/**
 * JSON-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.json
 * @public
 */

// Provides the JSON object based model implementation
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ClientModel', 'sap/ui/model/Context', './JSONListBinding', './JSONPropertyBinding', './JSONTreeBinding'],
	function(jQuery, ClientModel, Context, JSONListBinding, JSONPropertyBinding, JSONTreeBinding) {
	"use strict";


	/**
	 * Constructor for a new JSONModel.
	 *
	 * The observation feature is experimental! When observation is activated, the application can directly change the
	 * JS objects without the need to call setData, setProperty or refresh. Observation does only work for existing
	 * properties in the JSON, it cannot detect new properties or new array entries.
	 *
	 * @param {object|string} oData Either the URL where to load the JSON from or a JS object
	 * @param {boolean} bObserve Whether to observe the JSON data for property changes (experimental)
	 *
	 * @class
	 * Model implementation for JSON format
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

		metadata : {
			publicMethods : ["setJSON", "getJSON"]
		}

	});

	/**
	 * Sets the data, passed as a JS object tree, to the model.
	 *
	 * @param {object} oData the data to set on the model
	 * @param {boolean} [bMerge=false] whether to merge the data instead of replacing it
	 *
	 * @public
	 */
	JSONModel.prototype.setData = function(oData, bMerge){
		if (bMerge) {
			// do a deep copy
			this.oData = jQuery.extend(true, Array.isArray(this.oData) ? [] : {}, this.oData, oData);
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
			if (Array.isArray(oObject)) {
				for (var i = 0; i < oObject.length; i++) {
					observeRecursive(oObject[i], oObject, i);
				}
			} else if (jQuery.isPlainObject(oObject)) {
				for (var i in oObject) {
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
			oJSONData = jQuery.parseJSON(sJSON);
			this.setData(oJSONData, bMerge);
		} catch (e) {
			jQuery.sap.log.fatal("The following problem occurred: JSON parse Error: " + e);
			this.fireParseError({url : "", errorCode : -1,
				reason : "", srcText : e, line : -1, linepos : -1, filepos : -1});
		}
	};

	/**
	 * Serializes the current JSON data of the model into a string.
	 * Note: May not work in Internet Explorer 8 because of lacking JSON support (works only if IE 8 mode is enabled)
	 *
	 * @return {string} the JSON data serialized as string
	 * @public
	 */
	JSONModel.prototype.getJSON = function(){
		return JSON.stringify(this.oData);
	};

	/**
	 * Load JSON-encoded data from the server using a GET HTTP request and store the resulting JSON data in the model.
	 * Note: Due to browser security restrictions, most "Ajax" requests are subject to the same origin policy,
	 * the request can not successfully retrieve data from a different domain, subdomain, or protocol.
	 *
	 * @param {string} sURL A string containing the URL to which the request is sent.
	 * @param {object | string} [oParameters] A map or string that is sent to the server with the request.
	 * Data that is sent to the server is appended to the URL as a query string.
	 * If the value of the data parameter is an object (map), it is converted to a string and
	 * url-encoded before it is appended to the URL.
	 * @param {boolean} [bAsync=true] By default, all requests are sent asynchronous
	 * (i.e. this is set to true by default). If you need synchronous requests, set this option to false.
	 * Cross-domain requests do not support synchronous operation. Note that synchronous requests may
	 * temporarily lock the browser, disabling any actions while the request is active.
	 * @param {string} [sType=GET] The type of request to make ("POST" or "GET"), default is "GET".
	 * Note: Other HTTP request methods, such as PUT and DELETE, can also be used here, but
	 * they are not supported by all browsers.
	 * @param {boolean} [bMerge=false] whether the data should be merged instead of replaced
	 * @param {string} [bCache=false] force no caching if false. Default is false
	 * @param {object} [mHeaders] An object of additional header key/value pairs to send along with the request
	 *
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
				jQuery.sap.log.fatal("The following problem occurred: No data was retrieved by service: " + sURL);
			}
			this.setData(oData, bMerge);
			this.fireRequestCompleted({url : sURL, type : sType, async : bAsync, headers: mHeaders,
				info : "cache=" + bCache + ";bMerge=" + bMerge, infoObject: {cache : bCache, merge : bMerge}, success: true});
		}.bind(this);

		var fnError = function(oParams){
			var oError = { message : oParams.textStatus, statusCode : oParams.status, statusText : oParams.statusText, responseText : oParams.responseText};
			jQuery.sap.log.fatal("The following problem occurred: " + oParams.textStatus, oParams.responseText + ","
						+ oParams.status + "," + oParams.statusText);

			this.fireRequestCompleted({url : sURL, type : sType, async : bAsync, headers: mHeaders,
				info : "cache=" + bCache + ";bMerge=" + bMerge, infoObject: {cache : bCache, merge : bMerge}, success: false, errorobject: oError});
			this.fireRequestFailed(oError);
		}.bind(this);

		var _loadData = function(fnSuccess, fnError) {
			this._ajax({
				url: sURL,
				async: bAsync,
				dataType: 'json',
				cache: bCache,
				data: oParameters,
				headers: mHeaders,
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

			this.pSequentialImportCompleted = this.pSequentialImportCompleted.then(function() {
				//must always resolve
				return pImportCompleted.then(fnSuccess, fnError).catch(function(oError) {
					jQuery.sap.log.error("Loading of data failed: " + oError.stack);
				});
			});
		} else {
			_loadData(fnSuccess, fnError);
		}
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 *
	 */
	JSONModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
		var oBinding = new JSONPropertyBinding(this, sPath, oContext, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindList
	 *
	 */
	JSONModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
		var oBinding = new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
		return oBinding;
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindTree
	 *
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 *         If the mParameter <code>arrayNames</code> is specified with an array of string names this names will be checked against the tree data structure
	 *         and the found data in this array is included in the tree but only if also the parent array is included.
	 *         If this parameter is not specified then all found arrays in the data structure are bound.
	 *         If the tree data structure doesn't contain an array you don't have to specify this parameter.
	 *
	 */
	JSONModel.prototype.bindTree = function(sPath, oContext, aFilters, mParameters, aSorters) {
		var oBinding = new JSONTreeBinding(this, sPath, oContext, aFilters, mParameters, aSorters);
		return oBinding;
	};

	/**
	 * Sets a new value for the given property <code>sPropertyName</code> in the model.
	 * If the model value changed all interested parties are informed.
	 *
	 * @param {string}  sPath path of the property to set
	 * @param {any}     oValue value to set the property to
	 * @param {object} [oContext=null] the context which will be used to set the property
	 * @param {boolean} [bAsyncUpdate] whether to update other bindings dependent on this property asynchronously
	 * @return {boolean} true if the value was set correctly and false if errors occurred like the entry was not found.
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
	* Returns the value for the property with the given <code>sPropertyName</code>
	*
	* @param {string} sPath the path to the property
	* @param {sap.ui.model.Context} [oContext=null] the context which will be used to retrieve the property
	* @return {any} the value of the property
	* @public
	*/
	JSONModel.prototype.getProperty = function(sPath, oContext) {
		return this._getObject(sPath, oContext);

	};

	/**
	 * @param {string} sPath
	 * @param {object|sap.ui.model.Context} [oContext]
	 * @returns {any} the node of the specified path/context
	 */
	JSONModel.prototype._getObject = function (sPath, oContext) {
		var oNode = this.isLegacySyntax() ? this.oData : null;
		if (oContext instanceof Context) {
			oNode = this._getObject(oContext.getPath());
		} else if (oContext) {
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
