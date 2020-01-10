/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/core/library",
	"sap/ui/thirdparty/URI",
	"sap/ui/core/message/MessageParser",
	"sap/ui/core/message/Message",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(MessageScope, ODataUtils, coreLibrary, URI, MessageParser, Message, Log, jQuery) {
	"use strict";

// shortcuts for enums
var MessageType = coreLibrary.MessageType;

/**
 * This map is used to translate back-end response severity values to the values defined in the
 * enumeration sap.ui.core.MessageType
 * @see sap.ui.core.ValueState
 */
var mSeverityMap = {
	"error":   MessageType.Error,
	"warning": MessageType.Warning,
	"success": MessageType.Success,
	"info":    MessageType.Information
};

/**
 * A plain error object as returned by the server. Either "@sap-severity"- or "severity"-property
 * must be set.
 *
 * @typedef {object} ODataMessageParser~ServerError
 * @property {string} target - The target entity path for which the message is meant
 * @property {string} message - The error message description
 * @property {string} code - The error code (message)
 * @property {string} [@sap-severity] - The level of the error (alternatively in V2: oMessageObject.severity) can be one of "success", "info", "warning", "error"
 * @property {string} [severity] - The level of the error (alternatively in V4: oMessageObject.@sap-severity) can be one of "success", "info", "warning", "error"
 */

/**
 * A map containing the relevant request-URL and (if available) the request and response objects
 *
 * @typedef {object} ODataMessageParser~RequestInfo
 * @property {string} url - The URL of the request
 * @property {object} request - The request object
 * @property {object} response - The response object
 */

/**
 * A map containing a parsed URL
 *
 * @typedef {object} ODataMessageParser~UrlInfo
 * @property {string} url - The URL, stripped of query and hash
 * @property {Object<string,string>} parameters - A map of the query parameters
 * @property {string} hash - The hash value of the URL
 */


/**
 *
 * @namespace
 * @name sap.ui.model.odata
 * @public
 */

/**
 * OData implementation of the sap.ui.core.message.MessageParser class. Parses message responses from the back-end.
 *
 * @class
 * @classdesc
 *   OData implementation of the sap.ui.core.message.MessageParser class. Parses message responses from the back-end.
 * @extends sap.ui.core.message.MessageParser
 *
 * @author SAP SE
 * @version ${version}
 * @public
 * @abstract
 * @alias sap.ui.model.odata.ODataMessageParser
 */
var ODataMessageParser = MessageParser.extend("sap.ui.model.odata.ODataMessageParser", {
	metadata: {
		publicMethods: [ "parse", "setProcessor", "getHeaderField", "setHeaderField" ]
	},

	constructor: function(sServiceUrl, oMetadata) {
		MessageParser.apply(this);
		this._serviceUrl = getRelativeServerUrl(this._parseUrl(sServiceUrl).url);
		this._metadata = oMetadata;
		this._processor = null;
		this._headerField = "sap-message"; // Default header field
		this._lastMessages = [];
	}
});


////////////////////////////////////////// Public Methods //////////////////////////////////////////

/**
 * Returns the name of the header field that is used to parse the server messages
 *
 * @return {string} The name of the header field
 * @public
 */
ODataMessageParser.prototype.getHeaderField = function() {
	return this._headerField;
};

/**
 * Sets the header field name that should be used for parsing the JSON messages
 *
 * @param {string} sFieldName - The name of the header field that should be used as source of the message object
 * @return {sap.ui.model.odata.ODataMessageParser} Instance reference for method chaining
 * @public
 */
ODataMessageParser.prototype.setHeaderField = function(sFieldName) {
	this._headerField = sFieldName;
	return this;
};


/**
 * Parses the given response for messages, calculates the delta and fires the messageChange-event
 * on the MessageProcessor if messages are found.
 *
 * @param {object} oResponse - The response from the server containing body and headers
 * @param {object} oRequest - The original request that lead to this response
 * @param {Object<string,any>} mGetEntities - A map containing the entities requested from the back-end as keys
 * @param {Object<string,any>} mChangeEntities - A map containing the entities changed on the back-end as keys
 * @public
 */
ODataMessageParser.prototype.parse = function(oResponse, oRequest, mGetEntities, mChangeEntities, bMessageScopeSupported) {
	// TODO: Implement filter function
	var aMessages = [];

	var mRequestInfo = {
		url: oRequest ? oRequest.requestUri : oResponse.requestUri,
		request: oRequest,
		response: oResponse
	};

	if (oResponse.statusCode >= 200 && oResponse.statusCode < 300) {
		// Status is 2XX - parse headers
		this._parseHeader(/* ref: */ aMessages, oResponse, mRequestInfo);
	} else if (oResponse.statusCode >= 400 && oResponse.statusCode < 600) {
		// Status us 4XX or 5XX - parse body
		this._parseBody(/* ref: */ aMessages, oResponse, mRequestInfo);
	} else {
		// Status neither ok nor error - I don't know what to do
		// TODO: Maybe this is ok and should be silently ignored...?
		Log.warning(
			"No rule to parse OData response with status " + oResponse.statusCode + " for messages"
		);
	}

	if (this._processor) {
		this._propagateMessages(aMessages, mRequestInfo, mGetEntities, mChangeEntities, !bMessageScopeSupported /* use simple message lifecycle */);
	} else {
		// In case no message processor is attached, at least log to console.
		// TODO: Maybe we should just output an error and do nothing, since this is not how messages are meant to be used like?
		this._outputMesages(aMessages);
	}
};


////////////////////////////////////////// onEvent Methods /////////////////////////////////////////


////////////////////////////////////////// Private Methods /////////////////////////////////////////

/**
 * Checks whether the property with the given name on the parent entity referenced by thegiven path is a
 * NavigationProperty.
 *
 * @param {string} sParentEntity - The path of the parent entity in which to search for the NavigationProperty
 * @param {string} sPropertyName - The name of the property which should be checked whether it is a NavigationProperty
 * @returns {boolean} Returns true if the given property is a NavigationProperty
 * @private
 */
ODataMessageParser.prototype._isNavigationProperty = function(sParentEntity, sPropertyName) {
	var mEntityType = this._metadata._getEntityTypeByPath(sParentEntity);
	if (mEntityType) {
		var aNavigationProperties = this._metadata._getNavigationPropertyNames(mEntityType);
		return aNavigationProperties.indexOf(sPropertyName) > -1;
	}

	return false;
};

/**
 * Parses the request URL as well as all message targets for paths that are affected, i.e. which have messages meaning
 * that currently available messages for that path will be replaced with the new ones
 *
 * @param {sap.ui.core.message.Message[]} aMessages - All messaged returned from the back-end in this request
 * @param {string} sRequestUri - The request URL
 * @param {map} mGetEntities - A map containing the entities requested from the back-end as keys
 * @param {map} mChangeEntities - A map containing the entities changed on the back-end as keys
 * @returns {map} A map of affected targets where every affected target
 */
ODataMessageParser.prototype._getAffectedTargets = function(aMessages, mRequestInfo, mGetEntities, mChangeEntities) {
	var mAffectedTargets = jQuery.extend({
		"": true // Allow global messages by default
	}, mGetEntities, mChangeEntities);

	if (mRequestInfo.request && mRequestInfo.request.key && mRequestInfo.request.created){
		mAffectedTargets[mRequestInfo.request.key] = true;
	}

	// Get EntitySet for Requested resource
	var sRequestTarget = this._parseUrl(mRequestInfo.url).url;
	if (sRequestTarget.indexOf(this._serviceUrl) === 0) {
		// This is an absolute URL, remove the service part at the front
		sRequestTarget = sRequestTarget.substr(this._serviceUrl.length + 1);
	}

	var mEntitySet = this._metadata._getEntitySetByPath(sRequestTarget);
	if (mEntitySet) {
		mAffectedTargets[mEntitySet.name] = true;
	}


	// Get the EntitySet for every single target
	for (var i = 0; i < aMessages.length; ++i) {
		var sTarget = aMessages[i].getTarget();

		if (sTarget) {
			var sTrimmedTarget = sTarget.replace(/^\/+|\/$/g, "");
			mAffectedTargets[sTrimmedTarget] = true;

			var iSlashPos = sTrimmedTarget.lastIndexOf("/");
			if (iSlashPos > 0) {
				// This seems to be a property...
				// But is it a NavigationProperty?
				var sParentEntity = sTrimmedTarget.substr(0, iSlashPos);
				var sProperty = sTrimmedTarget.substr(iSlashPos);

				// If this is a property (but no NavigationProperty!), also remove the messages for the entity containing it
				var bIsNavigationProperty = this._isNavigationProperty(sParentEntity, sProperty);
				if (!bIsNavigationProperty) {
					// It isn't a NavigationProperty, which means that the messages for this target belong to the
					// entity. The entity must be added to the affected targets.
					mAffectedTargets[sParentEntity] = true;
				}
			}

			// Info: As of 2015-11-12 the "parent" EntitySet should not be part of the affected targets, meaning that
			//       messages for the entire collection should not be deleted just because one entry of that selection
			//       has been requested.
			//       Before this all messages for the parent collection were deleted when an entry returned anything.
			//       This only concerns messages for the EntitySet itself, not for its entities.
			//       Example:
			//         GET /Products(1) used to delete all messages for /Products(1) and /Products
			//         now it only deletes all messages for the single entity /Products(1)
		}
	}

	return mAffectedTargets;
};

/**
 * This method calculates the message delta and gives it to the MessageProcessor (fires the
 * messageChange-event) based on the entities belonging to this request.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - All messaged returned from the back-end in this request
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   Info object about the request URL. If the "request" property of "mRequestInfo" is flagged with
 *   "bRefresh=true" and if the message scope is
 *    <code>sap.ui.model.odata.MessageScope.BusinessObject</code>, all non-persistent messages for
 *    the requested resources and its child resources are removed.
 * @param {map} mGetEntities - A map containing the entities requested from the back-end as keys
 * @param {map} mChangeEntities - A map containing the entities changed on the back-end as keys
 * @param {boolean} bSimpleMessageLifecycle - This flag is set to false, if the used OData Model v2 supports message scopes
 */
ODataMessageParser.prototype._propagateMessages = function(aMessages, mRequestInfo, mGetEntities, mChangeEntities, bSimpleMessageLifecycle) {
	var mAffectedTargets = this._getAffectedTargets(aMessages, mRequestInfo, mGetEntities,
			mChangeEntities),
		sDeepPath = mRequestInfo.request.deepPath,
		aKeptMessages = [],
		bPrefixMatch = sDeepPath
			&& mRequestInfo.request.refresh
			&& mRequestInfo.request.headers
			&& mRequestInfo.request.headers["sap-message-scope"] === MessageScope.BusinessObject,
		aRemovedMessages = [],
		iStatusCode = mRequestInfo.response.statusCode,
		bSuccess = (iStatusCode >= 200 && iStatusCode < 300),
		sTarget;

	function isTargetMatching(oMessage, sTarget) {
		return mAffectedTargets[sTarget]
			|| bPrefixMatch && oMessage.fullTarget.startsWith(sDeepPath);
	}

	this._lastMessages.forEach(function (oCurrentMessage) {
		// Note: mGetEntities and mChangeEntities contain the keys without leading or trailing "/", so all targets must
		// be trimmed here
		sTarget = oCurrentMessage.getTarget().replace(/^\/+|\/$/g, "");

		// Get entity for given target (properties are not affected targets as all messages must be sent for affected entity)
		var iPropertyPos = sTarget.lastIndexOf(")/");
		if (iPropertyPos > 0) {
			sTarget = sTarget.substr(0, iPropertyPos + 1);
		}

		if (bSuccess || bSimpleMessageLifecycle){
			if (!oCurrentMessage.getPersistent()
					&& isTargetMatching(oCurrentMessage, sTarget)) {
				aRemovedMessages.push(oCurrentMessage);
			} else {
				aKeptMessages.push(oCurrentMessage);
			}
		} else if (!oCurrentMessage.getPersistent() && oCurrentMessage.getTechnical()
				&& isTargetMatching(oCurrentMessage, sTarget)) {
			aRemovedMessages.push(oCurrentMessage);
		} else {
			aKeptMessages.push(oCurrentMessage);
		}
	});
	this.getProcessor().fireMessageChange({
		oldMessages: aRemovedMessages,
		newMessages: aMessages
	});

	this._lastMessages = aKeptMessages.concat(aMessages);
};

/**
 * Creates an sap.ui.core.message.Message from the given JavaScript object
 *
 * @param {ODataMessageParser~ServerError} oMessageObject - The object containing the message data
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Info object about the request URL
 * @param {boolean} bIsTechnical - Whether this is a technical error (like 404 - not found)
 * @return {sap.ui.core.message.Message} The message for the given error
 */
ODataMessageParser.prototype._createMessage = function(oMessageObject, mRequestInfo, bIsTechnical) {
	var sType = oMessageObject["@sap.severity"]
		? oMessageObject["@sap.severity"]
		: oMessageObject["severity"];
	// Map severity value to value defined in sap.ui.core.ValueState, use actual value if not found
	sType = mSeverityMap[sType] ? mSeverityMap[sType] : sType;

	var sCode = oMessageObject.code ? oMessageObject.code : "";

	var sText = typeof oMessageObject["message"] === "object" && oMessageObject["message"]["value"]
		? oMessageObject["message"]["value"]
		: oMessageObject["message"];

	var sDescriptionUrl = oMessageObject.longtext_url ? oMessageObject.longtext_url : "";

	var bPersistent = false;
	if (!oMessageObject.target && oMessageObject.propertyref) {
		oMessageObject.target = oMessageObject.propertyref;
	}
	// propertyRef is deprecated and should not be used if a target is specified
	if (typeof oMessageObject.target === "undefined") {
		oMessageObject.target = "";
	}

	if (oMessageObject.target.indexOf("/#TRANSIENT#") === 0) {
		bPersistent = true;
		oMessageObject.target = oMessageObject.target.substr(12);
	} else if (oMessageObject.transient) {
		bPersistent = true;
	} else if (oMessageObject.transition) {
		bPersistent = true;
	}

	this._createTarget(oMessageObject, mRequestInfo);

	return new Message({
		type:      sType,
		code:      sCode,
		message:   sText,
		descriptionUrl: sDescriptionUrl,
		target:    ODataUtils._normalizeKey(oMessageObject.canonicalTarget),
		processor: this._processor,
		technical: bIsTechnical,
		persistent: bPersistent,
		fullTarget: oMessageObject.deepPath,
		technicalDetails: {
			statusCode: mRequestInfo.response.statusCode,
			headers: mRequestInfo.response.headers
		}
	});
};

/**
 * Returns the path of the Entity affected by the given FunctionImport. It either uses the location header sent by the
 * back-end or if none is sent tries to construct the correct URL from the metadata information about the function.
 * In case the URL of the target is built using only one key, the parameter-name is removed from the URL.
 * Example, if there are two keys "A" and "B", the URL mitgt look like this: "/List(A=1,B=2)" in case there is only one
 * key named "A", the URL would be "/List(1)"
 *
 * @param {map} mFunctionInfo - Function information map as returned by sap.ui.model.odata.ODataMetadata._getFunctionImportMetadata
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Map containing information about the current request
 * @param {ODataMessageParser~UrlInfo} mUrlData - Map containing parsed URL information as returned by sap.ui.mode.odata.ODataMessageParser._parseUrl
 * @returns {string} The Path to the affected entity
 */
ODataMessageParser.prototype._getFunctionTarget = function(mFunctionInfo, mRequestInfo, mUrlData) {
	var sTarget = "";

	var i;

	// In case of a function import the location header may point to the correct entry in the service.
	// This should be the case for writing/changing operations using POST
	if (mRequestInfo.response && mRequestInfo.response.headers && mRequestInfo.response.headers["location"]) {
		sTarget = mRequestInfo.response.headers["location"];

		var iPos = sTarget.lastIndexOf(this._serviceUrl);
		if (iPos > -1) {
			sTarget = sTarget.substr(iPos + this._serviceUrl.length);
		}
	} else {

		// Search for "action-for" annotation
		var sActionFor = null;
		if (mFunctionInfo.extensions) {
			for (i = 0; i < mFunctionInfo.extensions.length; ++i) {
				if (mFunctionInfo.extensions[i].name === "action-for") {
					sActionFor = mFunctionInfo.extensions[i].value;
					break;
				}
			}
		}

		var mEntityType;
		if (sActionFor) {
			mEntityType = this._metadata._getEntityTypeByName(sActionFor);
		} else if (mFunctionInfo.entitySet) {
			mEntityType = this._metadata._getEntityTypeByPath(mFunctionInfo.entitySet);
		} else if (mFunctionInfo.returnType) {
			mEntityType = this._metadata._getEntityTypeByName(mFunctionInfo.returnType);
		}
		if (mEntityType){
			var mEntitySet = this._metadata._getEntitySetByType(mEntityType);

			if (mEntitySet && mEntityType && mEntityType.key && mEntityType.key.propertyRef) {

				var sId = "";
				var sParam;

				if (mEntityType.key.propertyRef.length === 1) {
					// Just the ID in brackets
					sParam = mEntityType.key.propertyRef[0].name;
					if (mUrlData.parameters[sParam]) {
						sId = mUrlData.parameters[sParam];
					}
				} else {
					// Build ID string from keys
					var aKeys = [];
					for (i = 0; i < mEntityType.key.propertyRef.length; ++i) {
						sParam = mEntityType.key.propertyRef[i].name;
						if (mUrlData.parameters[sParam]) {
							aKeys.push(sParam + "=" + mUrlData.parameters[sParam]);
						}
					}
					sId = aKeys.join(",");
				}

				sTarget = "/" + mEntitySet.name + "(" + sId + ")";
			} else if (!mEntitySet) {
				Log.error("Could not determine path of EntitySet for function call: " + mUrlData.url);
			} else {
				Log.error("Could not determine keys of EntityType for function call: " + mUrlData.url);
			}
		}
	}

	return sTarget;
};


/**
 * Creates an absolute target URL (relative to the service URL) from the given message-object and
 * the Response. It uses the service-URL to extract the base URI of the message from the response-
 * URI and appends the target if the target was not specified as absolute path (with leading "/")
 *
 * @param {ODataMessageParser~ServerError} oMessageObject - The object containing the message data
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Map containing information about the current request
 * @return {string} The actual target string
 * @private
 */
ODataMessageParser.prototype._createTarget = function(oMessageObject, mRequestInfo) {
	var sTarget = oMessageObject.target;
	var sDeepPath = "";

	if (sTarget.substr(0, 1) !== "/") {
		var sRequestTarget = "";

		// special case for 201 POST requests which create a resource
		// The target is a relative resource path segment that can be appended to the Location response header (for POST requests that create a new entity)
		var sMethod = (mRequestInfo.request && mRequestInfo.request.method) ? mRequestInfo.request.method : "GET";
		var bRequestCreatePost = (sMethod === "POST"
			&& mRequestInfo.response
			&& mRequestInfo.response.statusCode == 201
			&& mRequestInfo.response.headers
			&& mRequestInfo.response.headers["location"]);

		var sUrlForTargetCalculation;
		if (bRequestCreatePost) {
			sUrlForTargetCalculation = mRequestInfo.response.headers["location"];
		} else if (mRequestInfo.request && mRequestInfo.request.key && mRequestInfo.request.created && mRequestInfo.response && mRequestInfo.response.statusCode >= 400) {
			// If a create request returns an error the target should be set to the internal entity key
			sUrlForTargetCalculation = mRequestInfo.request.key;
		} else {
			sUrlForTargetCalculation = mRequestInfo.url;
		}

		//parsing
		var mUrlData = this._parseUrl(sUrlForTargetCalculation);
		var sUrl = mUrlData.url;

		var iPos = sUrl.lastIndexOf(this._serviceUrl);
		if (iPos > -1) {
			sRequestTarget = sUrl.substr(iPos + this._serviceUrl.length);
		} else {
			sRequestTarget = "/" + sUrl;
		}

		// function import case
		if (!bRequestCreatePost) {
			var mFunctionInfo = this._metadata._getFunctionImportMetadata(sRequestTarget, sMethod);

			if (mFunctionInfo) {
				sRequestTarget = this._getFunctionTarget(mFunctionInfo, mRequestInfo, mUrlData);
				sDeepPath = sRequestTarget;
			}
		}

		// If sRequestTarget is a collection, we have to add the target without a "/". In this case
		// a target would start with the specific product (like "(23)"), but the request itself
		// would not have the brackets
		var iSlashPos = sRequestTarget.lastIndexOf("/");
		var sRequestTargetName = iSlashPos > -1 ? sRequestTarget.substr(iSlashPos) : sRequestTarget;


		if (!sDeepPath && mRequestInfo.request && mRequestInfo.request.deepPath){
			sDeepPath = mRequestInfo.request.deepPath;
		}
		if (sRequestTargetName.indexOf("(") > -1) {
			// It is an entity
			sTarget = sTarget ? sRequestTarget + "/" + sTarget : sRequestTarget;
			sDeepPath = oMessageObject.target ? sDeepPath + "/" + oMessageObject.target : sDeepPath;
		} else if (this._metadata._isCollection(sRequestTarget)){ // (0:n) cardinality
				sTarget = sRequestTarget + sTarget;
				sDeepPath = sDeepPath + oMessageObject.target;
		} else { // 0:1 cardinality
			sTarget = sTarget ? sRequestTarget + "/" + sTarget : sRequestTarget;
			sDeepPath = oMessageObject.target ? sDeepPath + "/" + oMessageObject.target : sDeepPath;
		}

	}

	oMessageObject.canonicalTarget = sTarget;
	if (this._processor){

		var sCanonicalTarget = this._processor.resolve(sTarget, undefined, true);

		// Multiple resolve steps are necessary for paths containing multiple navigation properties
		// with to 0 or 1 to n relation, e.g. /SalesOrder(1)/toItem(2)/toSubItem(3)
		var iNumberOfParts = sTarget.split(")").length - 1; // number of parts is decreased by one thus last part is the property or empty string
		for (var i = 2; i < iNumberOfParts; i++){ // e.g. path: "/SalesOrder(1)/toItem(2)/toSubItem(3)" => 3 parts = 2 nav properties
			sCanonicalTarget = this._processor.resolve(sCanonicalTarget, undefined, true);
		}

		oMessageObject.canonicalTarget = sCanonicalTarget || sTarget;
		oMessageObject.deepPath = sDeepPath || oMessageObject.canonicalTarget;

	}
};

/**
 * Parses the header with the set headerField and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the headers property map will be used
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Info object about the request URL
 *
 */
ODataMessageParser.prototype._parseHeader = function(/* ref: */ aMessages, oResponse, mRequestInfo) {
	var sField = this.getHeaderField();
	if (!oResponse.headers) {
		// No header set, nothing to process
		return;
	}

	for (var sKey in oResponse.headers) {
		if (sKey.toLowerCase() === sField.toLowerCase()) {
			sField = sKey;
		}
	}

	if (!oResponse.headers[sField]) {
		// No header set, nothing to process
		return;
	}

	var sMessages = oResponse.headers[sField];
	var oServerMessage = null;

	try {
		oServerMessage = JSON.parse(sMessages);

		aMessages.push(this._createMessage(oServerMessage, mRequestInfo));

		if (Array.isArray(oServerMessage.details)) {
			for (var i = 0; i < oServerMessage.details.length; ++i) {
				aMessages.push(this._createMessage(oServerMessage.details[i], mRequestInfo));
			}
		}
	} catch (ex) {
		Log.error("The message string returned by the back-end could not be parsed: '" + ex.message + "'");
		return;
	}
};

/**
 * Parses the body of the request and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the body property will be used
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Info object about the request URL
 */
ODataMessageParser.prototype._parseBody = function(/* ref: */ aMessages, oResponse, mRequestInfo) {
	// TODO: The main error object does not support "target". Find out how to proceed with the main error information (ignore/add without target/add to all other errors)

	var sContentType = getContentType(oResponse);
	if (sContentType && sContentType.indexOf("xml") > -1) {
		// XML response
		this._parseBodyXML(/* ref: */ aMessages, oResponse, mRequestInfo, sContentType);
	} else {
		// JSON response
		this._parseBodyJSON(/* ref: */ aMessages, oResponse, mRequestInfo);
	}

	filterDuplicates(aMessages);
};


/**
 * Parses the body of a JSON request and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the body property will be used
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Info object about the request URL
 * @param {string} sContentType - The content type of the response (for the XML parser)
 */
ODataMessageParser.prototype._parseBodyXML = function(/* ref: */ aMessages, oResponse, mRequestInfo, sContentType) {
	try {
		// TODO: I do not have a V4 service to test this with.

		var oDoc = new DOMParser().parseFromString(oResponse.body, sContentType);
		var aElements = getAllElements(oDoc, [ "error", "errordetail" ]);
		for (var i = 0; i < aElements.length; ++i) {
			var oNode = aElements[i];

			var oError = {};
			// Manually set severity in case we get an error response
			oError["severity"] = MessageType.Error;

			for (var n = 0; n < oNode.childNodes.length; ++n) {
				var oChildNode = oNode.childNodes[n];
				var sChildName = oChildNode.nodeName;

				if (sChildName === "errordetails" || sChildName === "details" || sChildName === "innererror" || sChildName === "#text") {
					// Ignore known children that contain other errors
					continue;
				}

				if (sChildName === "message" && oChildNode.hasChildNodes() && oChildNode.firstChild.nodeType !== window.Node.TEXT_NODE) {
					// Special case for V2 error message - the message is in the child node "value"
					for (var m = 0; m < oChildNode.childNodes.length; ++m) {
						if (oChildNode.childNodes[m].nodeName === "value") {
							oError["message"] = oChildNode.childNodes[m].text || oChildNode.childNodes[m].textContent;
						}
					}
				} else {
					oError[oChildNode.nodeName] = oChildNode.text || oChildNode.textContent;
				}
			}

			aMessages.push(this._createMessage(oError, mRequestInfo, true));
		}
	} catch (ex) {
		Log.error("Error message returned by server could not be parsed");
	}
};

/**
 * Parses the body of a JSON request and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the body property will be used
 * @param {ODataMessageParser~RequestInfo} mRequestInfo - Info object about the request URL
 */
ODataMessageParser.prototype._parseBodyJSON = function(/* ref: */ aMessages, oResponse, mRequestInfo) {
	try {
		var oErrorResponse = JSON.parse(oResponse.body);

		var oError;
		if (oErrorResponse["error"]) {
			// V4 response according to OData specification or V2 response according to MS specification and SAP message specification
			oError = oErrorResponse["error"];
		} else {
			// Actual V2 response in some tested services
			oError = oErrorResponse["odata.error"];
		}

		if (!oError) {
			Log.error("Error message returned by server did not contain error-field");
			return;
		}

		// Manually set severity in case we get an error response
		oError["severity"] = MessageType.Error;

		aMessages.push(this._createMessage(oError, mRequestInfo, true));

		// Check if more than one error has been returned from the back-end
		var aFurtherErrors = null;
		if (Array.isArray(oError.details)) {
			// V4 errors
			aFurtherErrors = oError.details;
		} else if (oError.innererror && Array.isArray(oError.innererror.errordetails)) {
			// V2 errors
			aFurtherErrors = oError.innererror.errordetails;
		} else {
			// No further errors
			aFurtherErrors = [];
		}

		for (var i = 0; i < aFurtherErrors.length; ++i) {
			aMessages.push(this._createMessage(aFurtherErrors[i], mRequestInfo, true));
		}
	} catch (ex) {
		Log.error("Error message returned by server could not be parsed");
	}
};

/**
 * Parses the URL into an info map containing the url, the parameters and the has in its properties
 *
 * @param {string} sUrl - The URL to be stripped
 * @returns {ODataMessageParser~UrlInfo} An info map about the parsed URL
 * @private
 */
ODataMessageParser.prototype._parseUrl = function(sUrl) {
	var mUrlData = {
		url: sUrl,
		parameters: {},
		hash: ""
	};

	var iPos = -1;

	iPos = sUrl.indexOf("#");
	if (iPos > -1) {
		mUrlData.hash = mUrlData.url.substr(iPos + 1);
		mUrlData.url = mUrlData.url.substr(0, iPos);
	}

	iPos = sUrl.indexOf("?");
	if (iPos > -1) {
		var sParameters = mUrlData.url.substr(iPos + 1);
		mUrlData.parameters = URI.parseQuery(sParameters);
		mUrlData.url = mUrlData.url.substr(0, iPos);
	}

	return mUrlData;
};

/**
 * Outputs messages to the browser console. This is a fallback for when there is no MessageProcessor
 * attached to this parser. This should not happen in standard cases, as the ODataModel registers
 * itself as MessageProcessor. Only if used stand-alone, this can at least prevent the messages
 * from being ignored completely.
 *
 * @param {sap.ui.message.Message[]} aMessages - The messages to be displayed on the console
 * @private
 */
ODataMessageParser.prototype._outputMesages = function(aMessages) {
	for (var i = 0; i < aMessages.length; ++i) {
		var oMessage = aMessages[i];
		var sOutput = "[OData Message] " + oMessage.getMessage() + " - " + oMessage.getDescription() + " (" + oMessage.getTarget() + ")";
		switch (aMessages[i].getType()) {
			case MessageType.Error:
				Log.error(sOutput);
				break;

			case MessageType.Warning:
				Log.warning(sOutput);
				break;

			case MessageType.Success:
				Log.debug(sOutput);
				break;

			case MessageType.Information:
			case MessageType.None:
			default:
				Log.info(sOutput);
				break;
		}
	}
};

///////////////////////////////////////// Hidden Functions /////////////////////////////////////////


/**
 * Returns the content-type header of the given response, it searches in a case-insentitive way for
 * the header
 *
 * @param {object} oResponse - The response object from which the body property will be used
 * @return {string|false} Either the content-type header content or false if none is found
 * @private
 */
function getContentType(oResponse) {
	if (oResponse && oResponse.headers) {
		for (var sHeader in oResponse.headers) {
			if (sHeader.toLowerCase() === "content-type") {
				return oResponse.headers[sHeader].replace(/([^;]*);.*/, "$1");
			}
		}
	}
	return false;
}

/**
 * Local helper element used to determine the path of a URL relative to the server
 *
 * @type {HTMLAnchorElement}
 */
var oLinkElement = document.createElement("a");
/**
 * Returns the URL relative to the host (i.e. the absolute path on the server) for the given URL
 *
 * @param {string} sUrl - The URL to be converted
 * @returns {string} The server-relative URL
 */
function getRelativeServerUrl(sUrl) {
	oLinkElement.href = sUrl;
	return URI.parse(oLinkElement.href).path;
}

/**
 * Returns all elements in the given document (or node) that match the given elementnames
 *
 * @param {Node} oDocument - The start node from where to search for elements
 * @param {string[]} aElementNames - The names of the elements to search for
 * @returns {HTMLElement[]} The matching elements
 * @private
 */
function getAllElements(oDocument, aElementNames) {
	var aElements = [];

	var mElementNames = {};
	for (var i = 0; i < aElementNames.length; ++i) {
		mElementNames[aElementNames[i]] = true;
	}

	var oElement = oDocument;
	while (oElement) {
		if (mElementNames[oElement.tagName]) {
			aElements.push(oElement);
		}

		if (oElement.hasChildNodes()) {
			oElement = oElement.firstChild;
		} else {
			while (!oElement.nextSibling) {
				oElement = oElement.parentNode;

				if (!oElement || oElement === oDocument) {
					oElement = null;
					break;
				}
			}
			if (oElement) {
				oElement = oElement.nextSibling;
			}
		}
	}

	return aElements;
}

	/**
	* The message container returned by the backend could contain duplicate messages in some scenarios.
	* The outer error could be identical to an inner error. This makes sense when the outer error is only though as error message container
	* for the inner errors and therefore shouldn't be end up in a seperate UI message.
    *
	* This function is used to filter out not relevant outer errors.
	* @example
	* {
	*  "error": {
	*    "code": "ABC",
	*    "message": {
	*      "value": "Bad things happened."
	*    },
	*    "innererror": {
	*      "errordetails": [
	*        {
	*          "code": "ABC",
	*          "message": "Bad things happened."
	*        },
	*   ...
	* @private
	*/
	function filterDuplicates(/*ref*/ aMessages){
		if (aMessages.length > 1) {
			for (var iIndex = 1; iIndex < aMessages.length; iIndex++) {
				if (aMessages[0].getCode() == aMessages[iIndex].getCode() && aMessages[0].getMessage() == aMessages[iIndex].getMessage()) {
					aMessages.shift(); // Remove outer error, since inner error is more detailed
					break;
				}
			}
		}
	}

//////////////////////////////////////// Overridden Methods ////////////////////////////////////////

return ODataMessageParser;

});