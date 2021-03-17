/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/core/library",
	"sap/ui/thirdparty/URI",
	"sap/ui/core/message/MessageParser",
	"sap/ui/core/message/Message",
	"sap/base/Log"
],
	function(ODataMetadata, ODataUtils, coreLibrary, URI, MessageParser, Message, Log) {
	"use strict";

var sClassName = "sap.ui.model.odata.ODataMessageParser",
	rEnclosingSlashes = /^\/+|\/$/g,
	// shortcuts for enums
	MessageType = coreLibrary.MessageType,
	// This map is used to translate back-end response severity values to the values defined in the
	// enumeration sap.ui.core.MessageType
	mSeverity2MessageType = {
		"error" : MessageType.Error,
		"info" : MessageType.Information,
		"success" : MessageType.Success,
		"warning" : MessageType.Warning
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
 * OData implementation of the sap.ui.core.message.MessageParser class. Parses message responses
 * from the back end.
 *
 * @param {string} sServiceUrl
 *   Base URI of the service used for the calculation of message targets
 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
 *   The ODataMetadata object
 * @param {boolean} bPersistTechnicalMessages
 *   Whether technical messages should always be treated as persistent, since 1.83.0
 *
 * @class
 *   OData implementation of the sap.ui.core.message.MessageParser class. Parses message responses
 *   from the back end.
 * @extends sap.ui.core.message.MessageParser
 *
 * @author SAP SE
 * @version ${version}
 * @public
 * @alias sap.ui.model.odata.ODataMessageParser
 */
var ODataMessageParser = MessageParser.extend("sap.ui.model.odata.ODataMessageParser", {
	metadata: {
		publicMethods: [ "parse", "setProcessor", "getHeaderField", "setHeaderField" ]
	},

	constructor: function(sServiceUrl, oMetadata, bPersistTechnicalMessages) {
		MessageParser.apply(this);
		this._serviceUrl = getRelativeServerUrl(this._parseUrl(sServiceUrl).url);
		this._metadata = oMetadata;
		this._headerField = "sap-message"; // Default header field
		this._lastMessages = [];
		this._bPersistTechnicalMessages = bPersistTechnicalMessages;
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
 * @return {this} Instance reference for method chaining
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
 * @param {object} oResponse
 *   The response from the server containing body and headers
 * @param {object} oRequest
 *   The original request that lead to this response
 * @param {object} [mGetEntities]
 *   A map with the keys of the entities requested from the back-end mapped to true
 * @param {object} [mChangeEntities]
 *   A map with the keys of the entities changed in the back-end mapped to true
 * @param {boolean} [bMessageScopeSupported]
 *   Whether the used OData service supports the message scope
 *   {@link sap.ui.model.odata.MessageScope.BusinessObject}
 * @public
 */
ODataMessageParser.prototype.parse = function(oResponse, oRequest, mGetEntities, mChangeEntities,
		bMessageScopeSupported) {
	var aMessages, mRequestInfo;

	if (oRequest.method === "GET" && String(oResponse.statusCode) === "204") {
		return;
	}

	aMessages = [];
	mRequestInfo = {
		request: oRequest,
		response: oResponse,
		url: oRequest ? oRequest.requestUri : oResponse.requestUri
	};

	if (oResponse.statusCode >= 200 && oResponse.statusCode < 300) {
		// Status is 2XX - parse headers
		this._parseHeader(/* ref: */ aMessages, oResponse, mRequestInfo);
	} else if (oResponse.statusCode >= 400 && oResponse.statusCode < 600) {
		// Status us 4XX or 5XX - parse body
		this._parseBody(/* ref: */ aMessages, oResponse, mRequestInfo);
	} else {
		// Status neither ok nor error, may happen if no network connection is available (some
		// browsers use status code 0 in that case)
		this._addGenericError(aMessages, mRequestInfo);
	}

	this._propagateMessages(aMessages, mRequestInfo, mGetEntities, mChangeEntities,
		!bMessageScopeSupported);
};


////////////////////////////////////////// onEvent Methods /////////////////////////////////////////


////////////////////////////////////////// Private Methods /////////////////////////////////////////

/**
 * Computes the affected targets from the given messages contained in the response for the given
 * request, the request and entities read from or changed in the back-end.
 * These "affected targets" are used to check which currently available messages should be replaced
 * with the new ones.
 *
 * @param {sap.ui.core.message.Message[]} aMessages
 *   All messages returned from the back-end in this request
 * @param {object} mRequestInfo
 *   The request info
 * @param {object} mGetEntities
 *   A map with the keys of the entities requested from the back-end mapped to true
 * @param {object} mChangeEntities
 *   A map with the keys of the entities changed in the back-end mapped to true
 * @returns {object}
 *   A map of affected targets as keys mapped to true
 */
ODataMessageParser.prototype._getAffectedTargets = function (aMessages, mRequestInfo, mGetEntities,
		mChangeEntities) {
	// unbound messages are always affected => add target ""
	var mAffectedTargets = Object.assign({"" : true}, mGetEntities, mChangeEntities),
		oEntitySet,
		sRequestTarget = this._parseUrl(mRequestInfo.url).url;

	if (mRequestInfo.request && mRequestInfo.request.key && mRequestInfo.request.created){
		mAffectedTargets[mRequestInfo.request.key] = true;
	}

	if (sRequestTarget.startsWith(this._serviceUrl)) {
		sRequestTarget = sRequestTarget.slice(this._serviceUrl.length + 1);
	}
	oEntitySet = this._metadata._getEntitySetByPath(sRequestTarget);
	if (oEntitySet) {
		mAffectedTargets[oEntitySet.name] = true;
	}

	aMessages.forEach(function (oMessage) {
		oMessage.getTargets().forEach(function (sTarget) {
			var sParentEntity,
				iSlashPos,
				sTrimmedTarget;

			if (!sTarget) {
				return;
			}

			sTrimmedTarget = sTarget.replace(rEnclosingSlashes, "");
			mAffectedTargets[sTrimmedTarget] = true;
			iSlashPos = sTrimmedTarget.lastIndexOf("/");
			if (iSlashPos > 0) {
				// this may be no entity, but we keep the existing logic to avoid regressions
				sParentEntity = sTrimmedTarget.slice(0, iSlashPos);
				mAffectedTargets[sParentEntity] = true;
			}
		});
	});

	return mAffectedTargets;
};

/**
 * This method calculates the message delta and gives it to the MessageProcessor (fires the
 * messageChange-event) based on the entities belonging to this request. By using the request header
 * "sap-messages" with the value <code>transientOnly</code> all existing messages are kept with the
 * expectation to only receive transition messages from the back end.
 *
 * @param {sap.ui.core.message.Message[]} aMessages
 *   All messaged returned from the back-end in this request
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   Info object about the request URL. If the "request" property of "mRequestInfo" is flagged with
 *   "updateAggregatedMessages=true", all aggregated messages for the entities in the response are
 *   updated. Aggregated messages are messages of child entities of these entities which belong to
 *   the same business object.
 * @param {map} [mGetEntities] - A map containing the entities requested from the back-end as keys
 * @param {map} [mChangeEntities] - A map containing the entities changed on the back-end as keys
 * @param {boolean} bSimpleMessageLifecycle
 *   This flag is set to false, if the used OData Model v2 supports message scopes
 */
ODataMessageParser.prototype._propagateMessages = function(aMessages, mRequestInfo, mGetEntities,
		mChangeEntities, bSimpleMessageLifecycle) {
	var mAffectedTargets,
		sDeepPath = mRequestInfo.request.deepPath,
		aKeptMessages = [],
		aCanonicalPathsOfReturnedEntities,
		bPrefixMatch = sDeepPath && mRequestInfo.request.updateAggregatedMessages,
		bTransitionMessagesOnly = mRequestInfo.request.headers
			&& mRequestInfo.request.headers["sap-messages"] === "transientOnly",
		aRemovedMessages = [],
		bReturnsCollection
			= ODataMetadata._returnsCollection(mRequestInfo.request.functionMetadata),
		bStateMessages,
		iStatusCode,
		bSuccess;

	function isTargetMatching(oMessage, aTargets) {
		return aTargets.some(function (sTarget) { return mAffectedTargets[sTarget]; })
			|| bPrefixMatch && oMessage.aFullTargets.some(function (sFullTarget) {
				if (bReturnsCollection) {
					return aCanonicalPathsOfReturnedEntities.some(function (sKey) {
						var sKeyPredicate = sKey.slice(sKey.indexOf("("));
						return sFullTarget.startsWith(sDeepPath + sKeyPredicate);
					});
				} else {
					return sFullTarget.startsWith(sDeepPath);
				}
			});
	}

	mGetEntities = mGetEntities || {};

	if (bTransitionMessagesOnly) {
		aKeptMessages = this._lastMessages;
		bStateMessages = aMessages.some(function (oMessage) {
			return !oMessage.getPersistent() && !oMessage.getTechnical();
		});
		if (bStateMessages) {
			Log.error("Unexpected non-persistent message in response, but requested only "
				+ "transition messages", undefined, sClassName);
		}
	} else {
		mAffectedTargets = this._getAffectedTargets(aMessages, mRequestInfo, mGetEntities,
			mChangeEntities);
		// only the mGetEntities are relevant for function imports; mChangeEntities are used for
		// DELETE and MERGE requests
		aCanonicalPathsOfReturnedEntities = Object.keys(mGetEntities);
		iStatusCode = mRequestInfo.response.statusCode;
		bSuccess = (iStatusCode >= 200 && iStatusCode < 300);
		this._lastMessages.forEach(function (oCurrentMessage) {
			var aTargets = oCurrentMessage.getTargets().map(function (sTarget) {
				// Note: mGetEntities and mChangeEntities contain the keys without leading or
				// trailing "/", so all targets must be trimmed here
				sTarget = sTarget.replace(rEnclosingSlashes, "");
				// Get entity for given target (properties are not affected targets as all messages
				// must be sent for affected entity)
				var iPropertyPos = sTarget.lastIndexOf(")/");
				if (iPropertyPos > 0) {
					sTarget = sTarget.substr(0, iPropertyPos + 1);
				}

				return sTarget;
			});

			if (bSuccess || bSimpleMessageLifecycle){
				if (!oCurrentMessage.getPersistent()
						&& isTargetMatching(oCurrentMessage, aTargets)) {
					aRemovedMessages.push(oCurrentMessage);
				} else {
					aKeptMessages.push(oCurrentMessage);
				}
			} else if (!oCurrentMessage.getPersistent() && oCurrentMessage.getTechnical()
					&& isTargetMatching(oCurrentMessage, aTargets)) {
				aRemovedMessages.push(oCurrentMessage);
			} else {
				aKeptMessages.push(oCurrentMessage);
			}
		});
	}
	this.getProcessor().fireMessageChange({
		oldMessages: aRemovedMessages,
		newMessages: aMessages
	});

	this._lastMessages = aKeptMessages.concat(aMessages);
};

/**
 * Creates a <code>sap.ui.core.message.Message</code> from the given JavaScript object parsed from a
 * server response. Since 1.78.0 unbound non-technical messages are supported if the message scope
 * for the request is <code>BusinessObject</code>.
 *
 * @param {ODataMessageParser~ServerError} oMessageObject
 *   The object containing the message data
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   Info object about the request and the response; both properties <code>request</code> and
 *   <code>response</code> of <code>mRequestInfo</code> are mandatory
 * @param {boolean} bIsTechnical
 *   Whether the given message object is a technical error (like 404 - not found)
 * @return {sap.ui.core.message.Message}
 *   The message for the given error
 */
ODataMessageParser.prototype._createMessage = function (oMessageObject, mRequestInfo,
		bIsTechnical) {
	var bPersistent = oMessageObject.target && oMessageObject.target.indexOf("/#TRANSIENT#") === 0
			|| oMessageObject.transient
			|| oMessageObject.transition
			|| bIsTechnical && this._bPersistTechnicalMessages,
		oTargetInfos,
		sText = typeof oMessageObject.message === "object"
			? oMessageObject.message.value
			: oMessageObject.message,
		sType = oMessageObject["@sap.severity"] || oMessageObject.severity;

	oMessageObject.transition = !!bPersistent;
	oTargetInfos = this._createTargets(oMessageObject, mRequestInfo, bIsTechnical);

	return new Message({
		code : oMessageObject.code || "",
		description : oMessageObject.description,
		descriptionUrl : oMessageObject.longtext_url || "",
		fullTarget : oTargetInfos.aDeepPaths,
		message : sText,
		persistent : !!bPersistent,
		processor : this._processor,
		target : oTargetInfos.aTargets,
		technical : bIsTechnical,
		technicalDetails : {
			headers : mRequestInfo.response.headers,
			statusCode : mRequestInfo.response.statusCode
		},
		type : mSeverity2MessageType[sType] || sType
	});
};

/**
 * Whether the given response is the response for a successful entity creation.
 *
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   A map containing information about the current request
 * @return {boolean|undefined}
 *   <code>true</code> if the response is for a successful creation and the response header has a
 *   "location" property, <code>false</code> if the response is an error response for a failed
 *   creation, and <code>undefined</code> otherwise.
 *
 * @private
 */
ODataMessageParser._isResponseForCreate = function (mRequestInfo) {
	var oRequest = mRequestInfo.request,
		oResponse = mRequestInfo.response;

	if (oRequest.method === "POST" && oResponse.statusCode == 201
			&& oResponse.headers["location"]) {
		return true;
	}
	if (oRequest.key && oRequest.created && oResponse.statusCode >= 400) {
		return false;
	}
	// return undefined; otherwise
};

/**
 * Determines the absolute target URL (relative to the service URL) from the given
 * <code>sODataTarget</code> and from the given request info and calculates <code>target</code> and
 * <code>deepPath</code> used for the creation of a UI5 message object.
 * If the given <code>sODataTarget</code> is not absolute, it uses the location header of the
 * response (in case of a successful creation of an entity), the internal entity key (in case of a
 * failed creation of an entity) or the request URL to determine the <code>target</code> and
 * <code>deepPath</code>.
 * The <code>deepPath</code> is always reduced, that means all adjacent partner attributes have been
 * removed from the target path.
 * If given <code>sODataTarget</code> is for a technical transition message, or if no
 * <code>sODataTarget</code> is given, the request used the message scope
 * <code>BusinessObject</code> and the response is no technical error, then the <code>target</code>
 * and <code>deepPath</code> are set to empty string.
 *
 * @param {string} sODataTarget
 *   The target
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   A map containing information about the current request
 * @param {boolean} bIsTechnical
 *   Whether this is a technical error (like 404 - not found)
 * @param {boolean} bODataTransition
 *   Whether this is a transition error
 * @returns {object}
 *   An object with the target info for the creation of a UI5 message object with the properties
 *   <code>deepPath</code> and <code>target</code>
 * @private
 */
ODataMessageParser.prototype._createTarget = function (sODataTarget, mRequestInfo, bIsTechnical,
		bODataTransition) {
	var sCanonicalTarget, bCreate, sDeepPath, iPos, sPreviousCanonicalTarget, sRequestTarget, sUrl,
		mUrlData, sUrlForTargetCalculation,
		oRequest = mRequestInfo.request,
		oResponse = mRequestInfo.response;

	if (sODataTarget === undefined
			&& (!bIsTechnical && oRequest.headers["sap-message-scope"] === "BusinessObject"
			|| bIsTechnical && bODataTransition)) {
		return {deepPath : "", target : ""};
	}
	sODataTarget = sODataTarget || "";
	sODataTarget = sODataTarget.startsWith("/#TRANSIENT#") ? sODataTarget.slice(12) : sODataTarget;

	if (sODataTarget[0] !== "/") {
		bCreate = ODataMessageParser._isResponseForCreate(mRequestInfo);
		sDeepPath = oRequest.deepPath || "";

		if (bCreate === true) { // successful create
			// special case for 201 POST requests which create a resource;
			// the target is a relative resource path segment that can be appended to the location
			// response header (for POST requests that create a new entity)
			sUrlForTargetCalculation = oResponse.headers["location"];
		} else if (bCreate === false) { // failed create
			sUrlForTargetCalculation = oRequest.key;
		} else {
			sUrlForTargetCalculation = mRequestInfo.url;
		}
		mUrlData = this._parseUrl(sUrlForTargetCalculation);
		sUrl = mUrlData.url;
		iPos = sUrl.indexOf(this._serviceUrl);
		if (iPos > -1) {
			sRequestTarget = sUrl.slice(iPos + this._serviceUrl.length);
		} else { // e.g. within $batch responses
			sRequestTarget = "/" + sUrl;
		}

		// bCreate === false might be a failed function import
		if (!bCreate && oRequest.functionMetadata) {
			sRequestTarget = oRequest.functionTarget;
		}
		// If sRequestTarget is a collection, we have to add the target without a "/". In this case
		// a target would start with the specific product (like "(23)"), but the request itself
		// would not have the brackets
		if (sRequestTarget.slice(sRequestTarget.lastIndexOf("/")).indexOf("(") > -1
				|| !this._metadata._isCollection(sRequestTarget)) {// references a single entity
			sDeepPath = sODataTarget ? sDeepPath + "/" + sODataTarget : sDeepPath;
			sODataTarget = sODataTarget ? sRequestTarget + "/" + sODataTarget : sRequestTarget;
		} else { // references a collection or the complete $batch
			sDeepPath = sDeepPath + sODataTarget;
			sODataTarget = sRequestTarget + sODataTarget;
		}
	}

	sCanonicalTarget = this._processor.resolve(sODataTarget, undefined, true);
	// Multiple resolve steps are necessary for paths containing multiple navigation properties
	// with to n relation, e.g. /SalesOrder(1)/toItem(2)/toSubItem(3)
	while (sCanonicalTarget && sCanonicalTarget.lastIndexOf("/") > 0
			&& sCanonicalTarget !== sPreviousCanonicalTarget) {
		sPreviousCanonicalTarget = sCanonicalTarget;
		sCanonicalTarget = this._processor.resolve(sCanonicalTarget, undefined, true)
			// if canonical path cannot be determined, take the previous
			|| sPreviousCanonicalTarget;
	}
	sODataTarget = sCanonicalTarget || sODataTarget;

	return {
		deepPath : this._metadata._getReducedPath(sDeepPath || sODataTarget),
		target : ODataUtils._normalizeKey(sODataTarget)
	};
};

/**
 * Computes arrays of targets and deep paths from an OData message object for the creation of a UI5
 * message object see {@link sap.ui.core.message.Message}.
 *
 * @param {ODataMessageParser~ServerError} oMessageObject
 *   The object containing the message data
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   A map containing information about the current request
 * @param {boolean} bIsTechnical
 *   Whether this is a technical error (like 404 - not found)
 * @returns {object}
 *   An object with the target info for the creation of a UI5 message object with the properties
 *   <code>aDeepPaths</code>, an array containing the deep paths and <code>aTargets</code>, an array
 *   containing the targets
 * @private
 */
ODataMessageParser.prototype._createTargets = function(oMessageObject, mRequestInfo, bIsTechnical) {
	var aDeepPaths = [],
		aMessageObjectTargets = Array.isArray(oMessageObject.additionalTargets)
			? [oMessageObject.target].concat(oMessageObject.additionalTargets)
			: [oMessageObject.target],
		oTargetInfo,
		aTargets = [],
		that = this;

	if (oMessageObject.propertyref !== undefined && aMessageObjectTargets[0] !== undefined) {
		Log.warning("Used the message's 'target' property for target calculation; the property"
			+ " 'propertyref' is deprecated and must not be used together with 'target'",
			mRequestInfo.url, sClassName);
	} else if (aMessageObjectTargets[0] === undefined) {
		aMessageObjectTargets[0] = oMessageObject.propertyref;
	}

	aMessageObjectTargets.forEach(function (sAdditionalTarget) {
		oTargetInfo = that._createTarget(sAdditionalTarget, mRequestInfo, bIsTechnical,
			oMessageObject.transition);
		aDeepPaths.push(oTargetInfo.deepPath);
		aTargets.push(oTargetInfo.target);
	});

	return {
		aDeepPaths : aDeepPaths,
		aTargets : aTargets
	};
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
 * Adds a technical generic error message to the given array of messages. The
 * <code>description</code> of the error message is the response body.
 *
 * @param {sap.ui.core.message.Message[]} aMessages
 *   The array to which to add the generic error message
 * @param {ODataMessageParser~RequestInfo} mRequestInfo
 *   Info object about the request and the response
 */
ODataMessageParser.prototype._addGenericError = function (aMessages, mRequestInfo) {
	aMessages.push(this._createMessage({
		description : mRequestInfo.response.body,
		message : sap.ui.getCore().getLibraryResourceBundle().getText("CommunicationError"),
		severity : MessageType.Error,
		transition : true
	}, mRequestInfo, true));
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
		var oDoc = new DOMParser().parseFromString(oResponse.body, sContentType);
		var aElements = getAllElements(oDoc, [ "error", "errordetail" ]);
		if (!aElements.length) {
			this._addGenericError(aMessages, mRequestInfo);
			return;
		}
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
		this._addGenericError(aMessages, mRequestInfo);
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
			this._addGenericError(aMessages, mRequestInfo);
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
		this._addGenericError(aMessages, mRequestInfo);
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
 * Sets whether technical messages should always be treated as persistent.
 *
 * @param {boolean} bPersistTechnicalMessages
 *   Whether technical messages should always be treated as persistent
 * @private
 */
ODataMessageParser.prototype._setPersistTechnicalMessages = function (bPersistTechnicalMessages) {
	this._bPersistTechnicalMessages = bPersistTechnicalMessages;
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