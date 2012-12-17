/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * XML-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.xml
 * @public
 */

// Provides the XML object based model implementation
jQuery.sap.declare("sap.ui.model.xml.XMLModel");
jQuery.sap.require("sap.ui.model.Model");
jQuery.sap.require("sap.ui.model.xml.XMLPropertyBinding");
jQuery.sap.require("sap.ui.model.xml.XMLListBinding");
jQuery.sap.require("sap.ui.model.xml.XMLTreeBinding");
jQuery.sap.require("jquery.sap.xml");

/**
 * Constructor for a new XMLModel.
 *
 * @class
 * Model implementation for XML format
 *
 * @extends sap.ui.model.Model
 *
 * @author SAP AG
 * @version 1.9.1-SNAPSHOT
 *
 * @param {object} oData either the URL where to load the XML from or a XML
 * @constructor
 * @public
 * @name sap.ui.model.xml.XMLModel
 */
sap.ui.model.Model.extend("sap.ui.model.xml.XMLModel", /** @lends sap.ui.model.xml.XMLModel */ {
	
	constructor : function (oData) {
		sap.ui.model.Model.apply(this, arguments);
		this.oNameSpaces = null;
		this.bCache = true;
		
		if (typeof oData == "string") {
			this.loadData(oData);
		}
		else if (oData && oData.documentElement) {
			this.setData(oData);
		}
	},
	
	metadata : {
		publicMethods : ["loadData", "setData", "getData", "setXML", "getXML", "setNameSpace", "forceNoCache", "setProperty"]
	}

});

/**
 * Sets the specified XML formatted string text to the model
 *
 * @param {string} sXMLText the XML data as string
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.setXML = function(sXMLText){
	var oXMLDocument = jQuery.sap.parseXML(sXMLText);

	if (oXMLDocument.parseError.errorCode != 0){
		var oParseError = oXMLDocument.parseError;
		jQuery.sap.log.fatal("The following problem occurred: XML parse Error for " + oParseError.url + " code: " + oParseError.errorCode + " reason: " +
				oParseError.reason +  " src: " + oParseError.srcText + " line: " +  oParseError.line +  " linepos: " + oParseError.linepos +  " filepos: " + oParseError.filepos);
		this.fireParseError({url : oParseError.url, errorCode : oParseError.errorCode,
			reason : oParseError.reason, srcText : oParseError.srcText, line : oParseError.line, linepos : oParseError.linepos,
			filepos : oParseError.filepos});
	}
	this.setData(oXMLDocument);
};

/**
 * Serializes the current XML data of the model into a string.
 *
 * @return the XML document serialized as string
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.getXML = function(){
	return jQuery.sap.serializeXML(this.oData);
};

/**
 * Returns the current XML document of the model.
 * Be aware that the returned object is a reference to the model data so all changes to that data will also change the model data.
 *
 * @return the XML document
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.getData = function(){
	return this.oData;
};

/**
 * Sets the provided XML encoded data object to the model
 *
 * @param {object} oData the data to set to the model
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.setData = function(oData){
	this.oData = oData;
	this.checkUpdate();
};

/**
 * Load XML-encoded data from the server using a GET HTTP request and store the resulting XML data in the model.
 * Note: Due to browser security restrictions, most "Ajax" requests are subject to the same origin policy,
 * the request can not successfully retrieve data from a different domain, subdomain, or protocol.
 *
 * @param {string} sURL A string containing the URL to which the request is sent.
 * @param {object | string}[oParameters] A map or string that is sent to the server with the request.
 * @param {boolean} [bAsync=true] if the request should be asynchron or not. Default is true.
 * @param {string} [sType=GET] of request. Default is 'GET'
 * @param {string} [bCache=false] force no caching if false. Default is false
 *
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.loadData = function(sURL, oParameters, bAsync, sType, bCache){
	var that = this;
	if (bAsync !== false) {
		bAsync = true;
	}
	if (!sType)	{
		sType = "GET";
	}
	if (bCache === undefined) {
		bCache = this.bCache;
	}
	
	this.fireRequestSent({url : sURL, type : sType, async : bAsync, info : "cache="+bCache});
	jQuery.ajax({
	  url: sURL,
	  async: bAsync,
	  cache: bCache,
	  dataType: 'xml',
	  data: oParameters,
	  type: sType,
	  success: function(oData) {
		if (!oData) {
			jQuery.sap.log.fatal("The following problem occurred: No data was retrieved by service: " + sURL);
		}
		that.setData(oData);
		that.fireRequestCompleted({url : sURL, type : sType, async : bAsync, info : "cache=false"});
	  },
	  error: function(XMLHttpRequest, textStatus, errorThrown){
		jQuery.sap.log.fatal("The following problem occurred: " + textStatus, XMLHttpRequest.responseText + ","
					+ XMLHttpRequest.status + "," + XMLHttpRequest.statusText);
		that.fireRequestCompleted({url : sURL, type : sType, async : bAsync, info : "cache=false"});
		that.fireRequestFailed({message : textStatus,
			statusCode : XMLHttpRequest.status, statusText : XMLHttpRequest.statusText, responseText : XMLHttpRequest.responseText});
	  }
	});
};

/**
 * Sets an XML namespace to use in the binding path
 *
 * @param {string} sNameSpace the namespace URI
 * @param {string} [sPrefix=null] the prefix for the namespace (optional)
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.setNameSpace = function(sNameSpace, sPrefix){
	if (!sPrefix) {
		sPrefix = "";
	}
	if (!this.oNameSpaces) {
		this.oNameSpaces = {};
	}
	this.oNameSpaces[sPrefix] = sNameSpace;
};

/**
 * Private method iterating the registered bindings of this model instance and initiating their check for update
 * 
 * @param {boolean} bForceupdate
 * 
 * @private
 */
sap.ui.model.xml.XMLModel.prototype.checkUpdate = function(bForceupdate) {
	var aBindings = this.aBindings.slice(0);
	jQuery.each(aBindings, function(iIndex, oBinding) {
		oBinding.checkUpdate(bForceupdate);
	});
};


/**
 * @see sap.ui.model.Model.prototype.bindProperty
 */
sap.ui.model.xml.XMLModel.prototype.bindProperty = function(sPath, oContext, mParameters) {
	var oBinding = new sap.ui.model.xml.XMLPropertyBinding(this, sPath, oContext, mParameters);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.bindList
 */
sap.ui.model.xml.XMLModel.prototype.bindList = function(sPath, oContext, oSorter, aFilters, mParameters) {
	var oBinding = new sap.ui.model.xml.XMLListBinding(this, sPath, oContext, oSorter, aFilters, mParameters);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.bindTree
 */
sap.ui.model.xml.XMLModel.prototype.bindTree = function(sPath, oContext, mParameters) {
	var oBinding = new sap.ui.model.xml.XMLTreeBinding(this, sPath, oContext, mParameters);
	return oBinding;
};

/**
 * @see sap.ui.model.Model.prototype.createBindingContext
 */
sap.ui.model.xml.XMLModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack) {
	// optional parameter handling
	if (typeof oContext == "function") {
		fnCallBack = oContext;
		oContext = null;
	}
	if (typeof mParameters == "function") {
		fnCallBack = mParameters;
		mParameters = null;
	}
	// create context path
	var sFullPath = this.resolve(sPath, oContext);
	oContext = sFullPath ? this.getContext(sFullPath) : undefined;
	fnCallBack(oContext);
};

/**
 * @see sap.ui.model.Model.prototype.destroyBindingContext
 */
sap.ui.model.xml.XMLModel.prototype.destroyBindingContext = function(oContext) {
	// TODO: what todo here?
};

/**
 * Sets a new value for the given property <code>sPropertyName</code> in the model.
 * If the model value changed all interested parties are informed.
 *
 * @param {string}  sPath path of the property to set
 * @param {any}     oValue value to set the property to
 * @param {object} [oContext=null] the context which will be used to set the property
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.setProperty = function(sPath, oValue, oContext) {
	var sObjectPath = sPath.substring(0, sPath.lastIndexOf("/")),
		sProperty = sPath.substr(sPath.lastIndexOf("/")+1);
	if (!this.oData.documentElement) {
		jQuery.sap.log.warning("Trying to set property " + sPath + ", but no document exists.")
		return;
	}
	var oObject;
	if (sProperty.indexOf("@") == 0) {
		oObject = sObjectPath ? this._getObject(sObjectPath, oContext) : [this.oData.documentElement];
		oObject[0].setAttribute(sProperty.substr(1), oValue);
	} else {
		oObject = this._getObject(sPath, oContext);
		jQuery(oObject[0]).text(oValue);
	}
	this.checkUpdate();
};

/**
* Returns the value for the property with the given <code>sPropertyName</code>
*
* @param {string} sPath the path to the property
* @param {object} [oContext=null] the context which will be used to retrieve the property
* @type any
* @return the value of the property
* @public
*/
sap.ui.model.xml.XMLModel.prototype.getProperty = function(sPath, oContext) {
	var oResult = this._getObject(sPath, oContext);
	if (oResult && typeof oResult != "string") {
		oResult = jQuery(oResult[0]).text(); // TODO is this right? shouldn't we return the object?!
	}
	return oResult;
};

/**
 * @param sPath
 * @param oContext
 * @returns the node of the specified path/context
 */
sap.ui.model.xml.XMLModel.prototype._getObject = function (sPath, oContext) {
	var oRootNode = this.oData.documentElement;
	if (!oRootNode) {
		return null;
	}
	var oNode = this.isLegacySyntax() ? [oRootNode] : [];
	if (oContext instanceof sap.ui.model.Context){
		oNode = this._getObject(oContext.getPath());
	} else if (oContext) {
		oNode = [oContext];
	}
	if (!sPath) {
		return oNode;
	}
	var aParts = sPath.split("/"),
		sPart,
		iIndex = 0;
	if (!aParts[0]) {
		// absolute path starting with slash
		oNode = oRootNode;
		iIndex++;
	}
	
	oNode = oNode.length == undefined ? [oNode] : oNode;
	oNode = oNode[0] ? oNode : null;
			
	while(oNode && oNode.length > 0 && aParts[iIndex]) {
		sPart = aParts[iIndex];
		if (sPart.indexOf("@") == 0) {
			oNode = this._getAttribute(oNode[0], sPart.substr(1));
		} else if (sPart == "text()") {
			oNode = jQuery(oNode[0]).text();
		} else if (isNaN(sPart)) {
			oNode = this._getChildElementsByTagName(oNode[0], sPart);
		} else {
			oNode = [ oNode[sPart] ];
		}
		iIndex++;
	}
	return oNode;
};

/**
 * @param sPath
 * @param oContext
 * @returns
 */
sap.ui.model.xml.XMLModel.prototype._getAttribute = function (oNode, sName) {
	if (!this.oNameSpaces || sName.indexOf(":") == -1) {
		return oNode.getAttribute(sName);
	}
	var sNameSpace = this._getNameSpace(sName),
		sLocalName = this._getLocalName(sName);
	if (oNode.getAttributeNS) {
		return oNode.getAttributeNS(sNameSpace, sLocalName);
	}
	else { // IE8
		if (!this.oDocNSPrefixes) {
			this.oDocNSPrefixes = this._getDocNSPrefixes();
		}
		var sPrefix = this.oDocNSPrefixes[sNameSpace];
		sName = (sPrefix ? sPrefix + ":" : "") + sLocalName;
		return oNode.getAttribute(sName);
	}
};

/**
 * @param sPath
 * @param oContext
 * @returns
 */
sap.ui.model.xml.XMLModel.prototype._getChildElementsByTagName = function (oNode, sName) {
	var aChildNodes = oNode.childNodes,
		aResult = [];

	if (this.oNameSpaces) {
		var sNameSpace = this._getNameSpace(sName),
			sLocalName = this._getLocalName(sName),
			sChildLocalName;
		jQuery.each(aChildNodes, function(i, oChild){
			sChildLocalName =  oChild.localName || oChild.baseName;
			if (oChild.nodeType == 1 && sChildLocalName == sLocalName && oChild.namespaceURI == sNameSpace) {
				aResult.push(oChild);
			}
		});
	} else {
		jQuery.each(aChildNodes, function(i, oChild){
			if (oChild.nodeType == 1 && oChild.nodeName == sName) {
				aResult.push(oChild);
			}
		});
	}

	return aResult;
};

/**
 * @param sPath
 * @param oContext
 * @returns
 */
sap.ui.model.xml.XMLModel.prototype._getNameSpace = function (sName) {
	var iColonPos = sName.indexOf(":"),
		sPrefix = "";
	if (iColonPos > 0){
		sPrefix = sName.substr(0, iColonPos);
	}
	return this.oNameSpaces[sPrefix];
};

/**
 * @param sPath
 * @param oContext
 * @returns
 */
sap.ui.model.xml.XMLModel.prototype._getLocalName = function (sName) {
	var iColonPos = sName.indexOf(":"),
		sLocalName = sName;
	if (iColonPos > 0){
		sLocalName = sName.substr(iColonPos + 1);
	}
	return sLocalName;
};


/**
 * @param sPath
 * @param oContext
 * @returns
 */
sap.ui.model.xml.XMLModel.prototype._getDocNSPrefixes = function () {
	var oPrefixes = {},
		oDocumentElement = this.oData && this.oData.documentElement;
	if (!oDocumentElement) {
		return oPrefixes;
	}
	var aAttributes = oDocumentElement.attributes;
	jQuery.each(aAttributes, function(i, oAttribute) {
		var name = oAttribute.name,
			value = oAttribute.value;
		if (name == "xmlns") {
			oPrefixes[value] = "";
		}
		else if (name.indexOf("xmlns") == 0) {
			oPrefixes[value] = name.substr(6);
		}
	});
	return oPrefixes;
};

/**
 * Resolve the path relative to the given context
 */
sap.ui.model.xml.XMLModel.prototype._resolve = function(sPath, oContext) {
	var bIsRelative = !jQuery.sap.startsWith(sPath, "/"),
		sResolvedPath = sPath;
	if (bIsRelative) {
		if (oContext) {
			sResolvedPath = oContext.getPath() + "/" + sPath;
		}
		else {
			sResolvedPath = this.isLegacySyntax() ? "/" + sPath : undefined;
		}
	}
	return sResolvedPath;
};

/**
 * update all bindings
 * @param {boolean} bForceUpdate true/false: Default = false. If set to false an update 
 * 					will only be done when the value of a binding changed.   
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.updateBindings = function(bForceUpdate) {
	this.checkUpdate(bForceUpdate);
};

/**
 * Force no caching
 * @param {boolean} force no cache true/false: Default = true  
 * @public
 */
sap.ui.model.xml.XMLModel.prototype.forceNoCache = function(bForceNoCache) {
	this.bCache = !bForceNoCache; 
};
