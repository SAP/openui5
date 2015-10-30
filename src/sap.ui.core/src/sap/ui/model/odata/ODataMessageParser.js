/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/core/library", "sap/ui/core/message/MessageParser", "sap/ui/core/message/Message"],
	function(jQuery, coreLibrary, MessageParser, Message) {
	"use strict";

/**
 * This map is used to translate back-end response severity values to the values defined in the
 * enumeration sap.ui.core.MessageType
 * @see sap.ui.core.ValueState
 */
var mSeverityMap = {
	"error":   sap.ui.core.MessageType.Error,
	"warning": sap.ui.core.MessageType.Warning,
	"success": sap.ui.core.MessageType.Success,
	"info":    sap.ui.core.MessageType.Information
};

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
		this._serviceUrl = stripURI(sServiceUrl);
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
 * @param {map} mGetEntities - A map containing the entities requested from the back-end as keys
 * @param {map} mChangeEntities - A map containing the entities changed on the back-end as keys
 * @return {void}
 * @public
 */
ODataMessageParser.prototype.parse = function(oResponse, oRequest, mGetEntities, mChangeEntities) {
	// TODO: Implement filter function
	var aMessages = [];

	var sRequestUri = oRequest ? oRequest.requestUri : oResponse.requestUri;

	if (oResponse.statusCode >= 200 && oResponse.statusCode < 300) {
		// Status is 2XX - parse headers
		this._parseHeader(/* ref: */ aMessages, oResponse, sRequestUri);
	} else if (oResponse.statusCode >= 400 && oResponse.statusCode < 600) {
		// Status us 4XX or 5XX - parse body
		this._parseBody(/* ref: */ aMessages, oResponse, sRequestUri);
	} else {
		// Status neither ok nor error - I don't know what to do
		// TODO: Maybe this is ok and should be silently ignored...?
		jQuery.sap.log.warning(
			"No rule to parse OData response with status " + oResponse.statusCode + " for messages"
		);
	}

	if (!this._processor) {
		// In case no message processor is attached, at least log to console.
		// TODO: Maybe we should just output an error an do nothing, since this is not how messages are meant to be used like?
		this._outputMesages(aMessages);
	}

	this._propagateMessages(aMessages, sRequestUri, mGetEntities, mChangeEntities);
};


////////////////////////////////////////// onEvent Methods /////////////////////////////////////////


////////////////////////////////////////// Private Methods /////////////////////////////////////////


ODataMessageParser.prototype._getAffectedTargets = function(aMessages, sRequestUri, mGetEntities, mChangeEntities) {
	var mAffectedTargets = jQuery.extend({
		"": true // Allow global messages by default
	}, mGetEntities, mChangeEntities);


	// Get EntitySet for Requested resource
	var sRequestTarget = stripURI(sRequestUri);
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
			mEntitySet = this._metadata._getEntitySetByPath(sTarget);
			if (mEntitySet) {
				mAffectedTargets[mEntitySet.name] = true;
			}
		}
	}
	
	return mAffectedTargets;
};

/**
 * This method calculates the message delta and gives it to the MessageProcessor (fires the
 * messageChange-event) based on the entities belonging to this request.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - All messaged returned from the back-end in this request
 * @param {object} oResponse - The response from the back-end
 * @param {map} mGetEntities - A map containing the entities requested from the back-end as keys
 * @param {map} mChangeEntities - A map containing the entities changed on the back-end as keys
 * @return {void}
 */
ODataMessageParser.prototype._propagateMessages = function(aMessages, sRequestUri, mGetEntities, mChangeEntities) {
	var i, sTarget;

	var mAffectedTargets = this._getAffectedTargets(aMessages, sRequestUri, mGetEntities, mChangeEntities);
	
	// All messages with targets are part of the changed targets by definition. All Messages that
	// come back from the server belong to affected entities/sets
	// TODO: Check if this is necessary, since only messages for requested entities/sets should be returned from the service...
	for (i = 0; i < aMessages.length; ++i) {
		sTarget = aMessages[i].getTarget();
		if (!mAffectedTargets[sTarget]) {
			jQuery.sap.log.error(
				"Service returned messages for entities that were not requested. " +
				"This might lead to wrong message processing and loss of messages"
			);
			mAffectedTargets[sTarget] = true;
		}
	}

	var aRemovedMessages = [];
	var aKeptMessages = [];
	for (i = 0; i < this._lastMessages.length; ++i) {
		sTarget = this._lastMessages[i].getTarget();
		if (mAffectedTargets[sTarget]) {
			// Message belongs to targets handled/requested by this request
			aRemovedMessages.push(this._lastMessages[i]);
		} else {
			// Message is not affected, i.e. should stay
			aKeptMessages.push(this._lastMessages[i]);
		}
	}

	this.getProcessor().fireMessageChange({
		oldMessages: aRemovedMessages,
		newMessages: aMessages
	});

	this._lastMessages = aKeptMessages.concat(aMessages);
};

/**
 * A plain error object as returned by the server. Either "@sap-severity"- or "severity"-property
 * must be set.
 *
 * @typedef {object} ODataMessageParser~ServerError
 * @property {string} target - The target entity path for which the message is meant
 * @property {string} message - The error message description
 * @property {string} code - The error code (message)
 * @property {string} [@sap-severity] - The level of the error (alternatively in v2: oMessageObject.severity) can be one of "success", "info", "warning", "error"
 * @property {string} [severity] - The level of the error (alternatively in v4: oMessageObject.@sap-severity) can be one of "success", "info", "warning", "error"
 */

/**
 * Creates a sap.ui.core.message.Message from the given JavaScript object
 *
 * @param {ODataMessageParser~ServerError} oMessageObject - The object containing the message data
 * @param {object} oResponse - The response from the back-end
 * @param {boolean} bIsTechnical - Whether this is a technical error (like 404 - not found)
 * @return {sap.ui.core.message.Message} The message for the given error
 */
ODataMessageParser.prototype._createMessage = function(oMessageObject, sRequestUri, bIsTechnical) {
	var sType = oMessageObject["@sap.severity"]
		? oMessageObject["@sap.severity"]
		: oMessageObject["severity"];
	// Map severity value to value defined in sap.ui.core.ValueState, use actual value if not found
	sType = mSeverityMap[sType] ? mSeverityMap[sType] : sType;

	var sCode = oMessageObject.code ? oMessageObject.code : "";

	var sText = typeof oMessageObject["message"] === "object" && oMessageObject["message"]["value"]
		? oMessageObject["message"]["value"]
		: oMessageObject["message"];

	var sTarget = this._createTarget(oMessageObject, sRequestUri);

	return new Message({
		type:      sType,
		code:      sCode,
		message:   sText,
		target:    sTarget,
		processor: this._processor,
		technical: bIsTechnical
	});
};


/**
 * Creates an absolute target URL (relative to the service URL) from the given message-object and
 * the Response. It uses the service-URL to extract the base URI of the message from the response-
 * URI and appends the target if the target was not specified as absolute path (with leading "/")
 *
 * @param {ODataMessageParser~ServerError} oMessageObject - The object containing the message data
 * @param {object} oResponse - The response from the back-end
 * @return {string} The actual target string
 * @private
 */
ODataMessageParser.prototype._createTarget = function(oMessageObject, sRequestUri) {
	var sTarget = "";

	if (oMessageObject.target) {
		sTarget = oMessageObject.target;
	} else if (oMessageObject.propertyref) {
		sTarget = oMessageObject.propertyref;
	}

	if (sTarget.substr(0, 1) !== "/") {
		var sRequestTarget = "";
		var sUri = stripURI(sRequestUri);

		if (sUri.indexOf(this._serviceUrl) === 0) {
			sRequestTarget = "/" + sUri.substr(this._serviceUrl.length + 1);
		} else {
			sRequestTarget = "/" + sUri;
		}

		// If sRequestTarget is a collection, we have to add the target without a "/". In this case
		// a target would start with the specific product (like "(23)"), but the request itself
		// would not have the brackets
		var iSlashPos = sRequestTarget.lastIndexOf("/");
		var sRequestTargetName = iSlashPos > -1 ? sRequestTarget.substr(iSlashPos) : sRequestTarget;
		if (sRequestTargetName.indexOf("(") > -1) {
			// It is an entity
			sTarget = sRequestTarget + "/" + sTarget;
		} else {
			// It's a collection
			sTarget = sRequestTarget + sTarget;
		}
	} /* else {
		// Absolute target path, do not use base URL
	} */

	return sTarget;
};

/**
 * Parses the header with the set headerField and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the headers property map will be used
 *
 */
ODataMessageParser.prototype._parseHeader = function(/* ref: */ aMessages, oResponse, sRequestUri) {
	var sField = this.getHeaderField();
	if (!oResponse.headers || !oResponse.headers[sField]) {
		// No header set, nothing to process
		return;
	}

	var sMessages = oResponse.headers[sField];
	var oServerMessage = null;

	try {
		oServerMessage = JSON.parse(sMessages);

		aMessages.push(this._createMessage(oServerMessage, sRequestUri));

		if (oServerMessage.details && jQuery.isArray(oServerMessage.details)) {
			for (var i = 0; i < oServerMessage.details.length; ++i) {
				aMessages.push(this._createMessage(oServerMessage.details[i], sRequestUri));
			}
		}

	} catch (ex) {
		jQuery.sap.log.error("The message string returned by the back-end could not be parsed");
		return;
	}
};

/**
 * Parses the body of the request and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the body property will be used
 */
ODataMessageParser.prototype._parseBody = function(/* ref: */ aMessages, oResponse, sRequestUri) {
	// TODO: The main error object does not support "target". Find out how to proceed with the main error information (ignore/add without target/add to all other errors)

	var sContentType = getContentType(oResponse);
	if (sContentType && sContentType.indexOf("xml") > -1) {
		// XML response
		this._parseBodyXML(/* ref: */ aMessages, oResponse, sRequestUri, sContentType);
	} else {
		// JSON response
		this._parseBodyJSON(/* ref: */ aMessages, oResponse, sRequestUri);
	}
	
	// Messages from an error response should contain duplicate messages - the main error should be the
	// same as the first errordetail error. If this is the case, remove the first one.
	// TODO: Check if this is actually correct, and if so, check if the below check can be improved
	if (aMessages.length > 1) {
		if (
			aMessages[0].getCode()    == aMessages[1].getCode()    &&
			aMessages[0].getMessage() == aMessages[1].getMessage()
		) {
			aMessages.shift();
		}
	}
};


/**
 * Parses the body of a JSON request and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the body property will be used
 * @param {string} sContentType - The content type of the response (for the XML parser)
 * @return {void}
 */
ODataMessageParser.prototype._parseBodyXML = function(/* ref: */ aMessages, oResponse, sRequestUri, sContentType) {
	try {
		// TODO: I do not have a v4 service to test this with.

		var oDoc = new DOMParser().parseFromString(oResponse.body, sContentType);
		var aElements = getAllElements(oDoc, [ "error", "errordetail" ]);
		for (var i = 0; i < aElements.length; ++i) {
			var oNode = aElements[i];

			var oError = {};
			// Manually set severity in case we get an error response
			oError["severity"] = sap.ui.core.MessageType.Error;

			for (var n = 0; n < oNode.childNodes.length; ++n) {
				var oChildNode = oNode.childNodes[n];
				var sChildName = oChildNode.nodeName;

				if (sChildName === "errordetails" || sChildName === "details" || sChildName === "innererror") {
					// Ignore known children that contain other errors
					continue;
				}

				if (sChildName === "message" && oChildNode.hasChildNodes() && oChildNode.firstChild.nodeType !== window.Node.TEXT_NODE) {
					// Special case for v2 error message - the message is in the child node "value"
					for (var m = 0; m < oChildNode.childNodes.length; ++m) {
						if (oChildNode.childNodes[m].nodeName === "value") {
							oError["message"] = oChildNode.childNodes[m].text || oChildNode.childNodes[m].textContent;
						}
					}
				} else {
					oError[oChildNode.nodeName] = oChildNode.text || oChildNode.textContent;
				}
			}

			aMessages.push(this._createMessage(oError, sRequestUri, true));
		}
	} catch (ex) {
		jQuery.sap.log.error("Error message returned by server could not be parsed");
	}
};

/**
 * Parses the body of a JSON request and tries to extract the messages from it.
 *
 * @param {sap.ui.core.message.Message[]} aMessages - The Array into which the new messages are added
 * @param {object} oResponse - The response object from which the body property will be used
 * @return {void}
 */
ODataMessageParser.prototype._parseBodyJSON = function(/* ref: */ aMessages, oResponse, sRequestUri) {
	try {
		var oErrorResponse = JSON.parse(oResponse.body);

		var oError;
		if (oErrorResponse["error"]) {
			// v4 response according to OData specification or v2 response according to MS specification and SAP message specification
			oError = oErrorResponse["error"];
		} else {
			// Actual v2 response in some tested services
			oError = oErrorResponse["odata.error"];
		}

		if (!oError) {
			jQuery.sap.log.error("Error message returned by server did not contain error-field");
			return;
		}

		// Manually set severity in case we get an error response
		oError["severity"] = sap.ui.core.MessageType.Error;

		aMessages.push(this._createMessage(oError, sRequestUri, true));

		// Check if more than one error has been returned from the back-end
		var aFurtherErrors = null;
		if (jQuery.isArray(oError.details)) {
			// v4 errors
			aFurtherErrors = oError.details;
		} else if (oError.innererror && jQuery.isArray(oError.innererror.errordetails)) {
			// v2 errors
			aFurtherErrors = oError.innererror.errordetails;
		} else {
			// No further errors
			aFurtherErrors = [];
		}

		for (var i = 0; i < aFurtherErrors.length; ++i) {
			aMessages.push(this._createMessage(aFurtherErrors[i], sRequestUri, true));
		}
	} catch (ex) {
		jQuery.sap.log.error("Error message returned by server could not be parsed");
	}
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
		var sOutput = "[OData Message] " + aMessages.getMessage() + " - " + aMessages.getDexcription() + " (" + aMessages.getTarget() + ")";
		switch (aMessages[i].getSeverity()) {
			case "error":
				jQuery.sap.log.error(sOutput);
				break;

			case "warning":
				jQuery.sap.log.warning(sOutput);
				break;

			case "success":
				jQuery.sap.log.debug(sOutput);
				break;

			case "info":
			default:
				jQuery.sap.log.info(sOutput);
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
				return oResponse.headers[sHeader];
			}
		}
	}
	return false;
}

/**
 * Strips all parameters from a URI
 *
 * @param {string} sURI - The URI to be stripped
 * @returns {string} The stripped URI
 * @private
 */
function stripURI(sURI) {
	var iPos = -1;
	var sStrippedURI = sURI;

	iPos = sURI.indexOf("?");
	if (iPos > -1) {
		sStrippedURI = sStrippedURI.substr(0, iPos);
	}

	iPos = sURI.indexOf("#");
	if (iPos > -1) {
		sStrippedURI = sStrippedURI.substr(0, iPos);
	}

	return sStrippedURI;
}

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

//////////////////////////////////////// Overridden Methods ////////////////////////////////////////

return ODataMessageParser;

});
