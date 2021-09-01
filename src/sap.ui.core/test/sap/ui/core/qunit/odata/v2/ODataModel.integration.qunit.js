/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/uid",
	"sap/ui/Device",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/library",
	"sap/ui/core/message/Message",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/datajs",
	"sap/ui/util/XMLHelper"
	// load Table resources upfront to avoid loading times > 1 second for the first test using Table
	// "sap/ui/table/Table"
], function (Log, uid, Device, ManagedObjectObserver, SyncPromise, coreLibrary, Message, Controller,
		View, BindingMode, Filter, FilterOperator, Sorter, JSONModel, CountMode, MessageScope,
		ODataModel, TestUtils, datajs, XMLHelper) {
	/*global QUnit, sinon*/
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0, quote-props: 0*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		MessageType = coreLibrary.MessageType, // shortcut for sap.ui.core.MessageType
		NO_CONTENT = {/*204 no content*/},
		sODataMessageParserClassName = "sap.ui.model.odata.ODataMessageParser",
		sODataModelClassName = "sap.ui.model.odata.v2.ODataModel",
		// determine the row in which the entity is expected from the context path
		rRowIndex = /~(\d+)~/,
		/**
		 * Maps back-end response severity values to the values defined in the enumeration
		 * <code>sap.ui.core.MessageType</code>.
		 */
		mSeverityMap = {
			error : MessageType.Error,
			warning : MessageType.Warning,
			success : MessageType.Success,
			info : MessageType.Information
		},
		rTemporaryKey = /id(?:-[0-9]+){2}/;

	/**
	 * Clones the given OData message object and replaces the target property of the clone by
	 * the given target path.
	 *
	 * @param {object} oODataMessage
	 *   An OData message object as returned by <code>createResponseMessage</code>
	 * @param {string} sTarget
	 *   The new target
	 * @param {string[]} aAdditionalTargets
	 *   The new additional targets in case of a multi-target message
	 * @returns {object}
	 *   The cloned OData message object with the replaced target
	 */
	function cloneODataMessage(oODataMessage, sTarget, aAdditionalTargets) {
		return Object.assign({}, oODataMessage,
			{target : sTarget, additionalTargets : aAdditionalTargets});
	}

	/**
	 * Creates an error response object for a technical error (http status code = 4xx/5xx).
	 *
	 * @param {object} [oErrorResponseInfo]
	 *   The object describing the error response
	 * @param {boolean} [oErrorResponseInfo.crashBatch]
	 *   Whether the complete batch request shall fail
	 * @param {string} [oErrorResponseInfo.message="Internal Server Error"]
	 *   The message text
	 * @param {string} [oErrorResponseInfo.messageCode="UF0"]
	 *   The message code
	 * @param {int} [oErrorResponseInfo.statusCode=500]
	 *   The HTTP status code
	 * @returns {object}
	 *   The error response
	 */
	function createErrorResponse(oErrorResponseInfo) {
		oErrorResponseInfo = oErrorResponseInfo || {};

		return {
			body : JSON.stringify({
				error : {
					code : oErrorResponseInfo.messageCode || "UF0",
					message : {
						value : oErrorResponseInfo.message || "Internal Server Error"
					}
				}
			}),
			crashBatch : oErrorResponseInfo.crashBatch,
			headers : {"Content-Type" : "application/json;charset=utf-8"},
			statusCode : oErrorResponseInfo.statusCode || 500,
			statusText : "FAILED"
		};
	}

	/**
	 * Creates a V2 OData model.
	 *
	 * @param {string} sServiceUrl
	 *   The service URL
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction
	 *   {@link sap.ui.model.odata.v2.ODataModel#constructor}. The standard ODataModel behavior will
	 *   be overwritten by the following default test parameters:
	 * @param {sap.ui.model.odata.CountMode} [mModelParameters.defaultCountMode=None]
	 *   Sets the default count mode for the model
	 * @returns {sap.ui.model.odata.v2.ODataModel} The model
	 */
	function createModel(sServiceUrl, mModelParameters) {
		var mDefaultParameters = {
				defaultCountMode : CountMode.None,
				serviceUrl : sServiceUrl
			};

		return new ODataModel(Object.assign(mDefaultParameters, mModelParameters));
	}

	/**
	 * Creates a V2 OData model for the Workcenter Groups service.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createPPWorkcenterGroupModel(mModelParameters) {
		return createModel("/sap/opu/odata/sap/PP_WORKCENTER_GROUP_SRV", mModelParameters);
	}

	/**
	 * Creates a V2 OData model for the RMT sample flight service.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createRMTSampleFlightModel(mModelParameters) {
		return createModel("/sap/opu/odata/IWBEP/RMTSAMPLEFLIGHT", mModelParameters);
	}

	/**
	 * Creates a V2 OData model for <code>GWSAMPLE_BASIC</code>.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createSalesOrdersModel(mModelParameters) {
		return createModel("/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", mModelParameters);
	}

	/**
	 * Creates a V2 OData model for <code>GWSAMPLE_BASIC</code> supporting message scope, which
	 * means it has <code>sap:message-scope-supported="true"</code> at the
	 * <code>EntityContainer</code> in its <code>$metadata</code>.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createSalesOrdersModelMessageScope(mModelParameters) {
		return createModel("/SalesOrderSrv/", mModelParameters);
	}

	/**
	 * Creates a V2 OData model for <code>UI_C_DFS_ALLWNCREQ</code> service to test hierarchies with
	 * <code>ODataTreeBinding</code>.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createAllowanceModel(mModelParameters) {
		return createModel("/sap/opu/odata/sap/UI_C_DFS_ALLWNCREQ/", mModelParameters);
	}

	/**
	 * Creates a V2 OData model for special cases.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createSpecialCasesModel(mModelParameters) {
		return createModel("/special/cases/", mModelParameters);
	}

	/**
	 * Gets a string representation of the given messages to be used in "sap-message" response
	 * header. In case of multiple messages, the first message is the outer message and the other
	 * messages are stored as inner messages in the "details" property.
	 *
	 * @param {object|object[]} vMessage
	 *   A message object or an array of message objects as returned by an OData V2 service.
	 * @returns {string}
	 *   A stringified representation of the given messages
	 */
	function getMessageHeader(vMessage) {
		var bIsArray = Array.isArray(vMessage),
			oMessage = bIsArray ? vMessage[0] : vMessage;

		return JSON.stringify(Object.assign(
			oMessage, {details : bIsArray ? vMessage.slice(1) : []}
		));
	}

	/**
	 * Delays the execution of a given callback function and returns its result within a Promise.
	 *
	 * @param {function} [fnCallback]
	 *   A callback function
	 * @param {number} [iDelay=5]
	 *   A delay in milliseconds
	 * @returns {Promise}
	 *   A promise which resolves with the result of the given callback or undefined after the given
	 *   delay
	 */
	function resolveLater(fnCallback, iDelay) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve(fnCallback && fnCallback());
			}, iDelay || 5);
		});
	}

	/**
	 * Wraps the given XML string into a <View> and creates an XML document for it. Verifies that
	 * the sap.m.Table does not use <items>, because this is the default aggregation and may be
	 * omitted. (This ensures that <ColumnListItem> is a direct child.)
	 *
	 * If the binding uses <ColumnListItem>, <columns> is not allowed. The columns are automatically
	 * determined from the number of the elements in <ColumnListItem>.
	 *
	 * @param {string} sViewXML The view content as XML string
	 * @returns {Document} The view as XML document
	 */
	function xml(sViewXML) {
		var oDocument;

		oDocument = XMLHelper.parse(
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:t="sap.ui.table">'
			+ sViewXML
			+ '</mvc:View>',
			"application/xml"
		);
		xmlConvertMTables(oDocument);
		xmlConvertGridTables(oDocument);

		return oDocument;
	}

	/**
	 * Converts the sap.ui.table.(Table|TreeTable) controls within the document. Embeds all inner
	 * controls into a <t:Column> with <t:template> each. <t:Column> may still be used however.
	 * Do not use <rows>, it breaks this automatic conversion (and is unnecessary anyway).
	 *
	 * @param {Document} oDocument The view as XML document
	 */
	function xmlConvertGridTables(oDocument) {
		function convertElements(aElements) {
			var oChildNode, aChildNodes, oColumn, oElement, i, j, oTemplate;

			for (i = aElements.length - 1; i >= 0; i -= 1) {
				oElement = aElements[i];

				aChildNodes = oElement.childNodes;
				for (j = aChildNodes.length - 1; j >= 0; j -= 1) {
					oChildNode = aChildNodes[j];
					if (oChildNode.nodeType === Node.ELEMENT_NODE
							&& oChildNode.localName !== "Column") {
						oColumn = document.createElementNS("sap.ui.table", "Column");
						oElement.insertBefore(oColumn, oChildNode);
						oElement.removeChild(oChildNode);
						oTemplate = document.createElementNS("sap.ui.table", "template");
						oColumn.appendChild(oTemplate);
						oTemplate.appendChild(oChildNode);
					}
				}
			}
		}

		convertElements(oDocument.getElementsByTagNameNS("sap.ui.table", "Table"));
		convertElements(oDocument.getElementsByTagNameNS("sap.ui.table", "TreeTable"));
	}

	/**
	 * Converts the sap.m.Table controls within the document. Embeds all inner controls into a
	 * <ColumnListItem>. <ColumnListItem> may still be used however. Do not use <items>, it breaks
	 * this automatic conversion (and is unnecessary anyway). Do not use <columns>, they are added
	 * automatically.
	 *
	 * @param {Document} oDocument The view as XML document
	 */
	function xmlConvertMTables(oDocument) {
		var aControls, oChildNode, aChildNodes, iColumnCount, aColumnNodes, oColumnsElement,
			oElement, bHasColumns, bHasListItem, i, j, k, aTableElements;

		aTableElements = oDocument.getElementsByTagNameNS("sap.m", "Table");
		iColumnCount = 0;
		for (i = aTableElements.length - 1; i >= 0; i -= 1) {
			oElement = aTableElements[i];
			aControls = [];

			aChildNodes = oElement.childNodes;
			for (j = aChildNodes.length - 1; j >= 0; j -= 1) {
				oChildNode = aChildNodes[j];
				switch (oChildNode.nodeName) {
					case "columns":
						bHasColumns = true;
						break;
					case "items":
						throw new Error("Do not use <items> in sap.m.Table");
					case "ColumnListItem":
						aColumnNodes = oChildNode.childNodes;

						bHasListItem = true;
						for (k = aColumnNodes.length - 1; k >= 0; k -= 1) {
							if (aColumnNodes[k].nodeType === Node.ELEMENT_NODE) {
								iColumnCount += 1;
							}
						}
						break;
					default:
						if (oChildNode.nodeType === Node.ELEMENT_NODE) {
							oElement.removeChild(oChildNode);
							aControls.unshift(oChildNode);
							iColumnCount += 1;
						}
				}
			}
			if (iColumnCount) {
				if (bHasColumns) {
					throw new Error("Do not use <columns> in sap.m.Table");
				}
				if (aControls.length) {
					if (bHasListItem) {
						throw new Error("Do not use controls w/ and w/o <ColumnListItem>"
							+ " in sap.m.Table");
					}
					oColumnsElement = document.createElementNS("sap.m", "ColumnListItem");
					for (j = 0; j < aControls.length; j += 1) {
						oColumnsElement.appendChild(aControls[j]);
					}
					oElement.appendChild(oColumnsElement);
				}
				oColumnsElement = oDocument.createElementNS("sap.m", "columns");
				while (iColumnCount > 0) {
					oColumnsElement.appendChild(oDocument.createElementNS("sap.m", "Column"));
					iColumnCount -= 1;
				}
				oElement.appendChild(oColumnsElement);
			}
		}
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataModel.integration", {
		beforeEach : function () {
			// We use a formatter to check for property changes. However before the formatter is
			// called, the value is passed through the type's formatValue
			// (see PropertyBinding#_toExternalValue). Ensure that this result is predictable.
			sap.ui.getCore().getConfiguration().setLanguage("en-US");

			// These metadata files are _always_ faked, the query option "realOData" is ignored
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core", {
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata"
					: {source : "qunit/model/GWSAMPLE_BASIC.metadata.xml"},
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/annotations.xml"
					: {source : "qunit/model/GWSAMPLE_BASIC.annotations.xml"},
				// GWSAMPLE_BASIC service with sap:message-scope-supported="true"
				"/SalesOrderSrv/$metadata"
					: {source : "qunit/testdata/SalesOrder/metadata.xml"},
				"/sap/opu/odata/sap/PP_WORKCENTER_GROUP_SRV/$metadata"
					: {source : "qunit/model/PP_WORKCENTER_GROUP_SRV.metadata.xml"},
				"/sap/opu/odata/IWBEP/RMTSAMPLEFLIGHT/$metadata"
					: {source : "qunit/model/RMTSAMPLEFLIGHT.withMessageScope.metadata.xml"},
				"/sap/opu/odata/sap/UI_C_DFS_ALLWNCREQ/$metadata"
					: {source : "qunit/odata/v2/data/UI_C_DFS_ALLWNCREQ.metadata.xml"},
				"/special/cases/$metadata"
					: {source : "qunit/odata/v2/data/metadata_special_cases.xml"},
				"/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/$metadata"
					: {source : "qunit/model/FAR_CUSTOMER_LINE_ITEMS.metadata.xml"}
			}, [{
				regExp : /GET \/sap\/opu\/odata\/sap\/ZUI5_GWSAMPLE_BASIC\/\$metadata.*/,
				response : [{source : "internal/samples/odata/v2/Products/data/metadata.xml"}]
			}]);
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning")
				.withExactArgs(sinon.match.string, "LegacyParametersGet", "sap.ui.support",
					sinon.match.func)
				.atLeast(0);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("fatal").never();

			// Counter for batch requests
			this.iBatchNo = 0;
			// {map<string, string[]>}
			// this.mChanges["id"] is a list of expected changes for the property "text" of the
			// control with ID "id"
			this.mChanges = {};
			// counter for OData messages created during a test
			this.iODataMessageCount = 0;
			// {map<string, true>}
			// If an ID is in this.mIgnoredChanges, change events with null are ignored
			this.mIgnoredChanges = {};
			// {map<string, string[][]>}
			// this.mListChanges["id"][i] is a list of expected changes for the property "text" of
			// the control with ID "id" in row i
			this.mListChanges = {};
			// A list of expected messages
			this.aMessages = [];
			// The number of pending responses checkFinish has to wait for
			this.iPendingResponses = 0;
			// A list of expected requests with the properties method, url, headers, response
			this.aRequests = [];
			// The temporary key for a created entity; can be referenced in deep paths by ~key~
			this.sTemporaryKey = undefined;

			// If the "VisibleRowCountMode" of the sap.ui.table.* is "Auto", the table uses the
			// screen height (Device.resize.height) to compute the amount of contexts it requests
			// initially. Make sure that this is stable across devices.
			this._oSandbox.stub(Device.resize, "height").value(1000);
		},

		afterEach : function (assert) {
			if (this.oView) {
				// avoid calls to formatters by UI5 localization changes in later tests
				this.oView.destroy();
			}
			if (this.oModel) {
				this.oModel.destroy();
			}
			// reset the language
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		},

		/**
		 * Checks the messages and finishes the test if no pending changes are left, all
		 * expected requests have been received and the expected number of messages have been
		 * reported.
		 *
		 * @param {object} assert The QUnit assert object
		 */
		checkFinish : function (assert) {
			var sControlId, aExpectedValuesPerRow, i;

			if (this.aRequests.length || this.iPendingResponses) {
				return;
			}
			for (sControlId in this.mChanges) {
				if (!this.hasOnlyOptionalChanges(sControlId)) {
					if (this.mChanges[sControlId].length) {
						return;
					}
					delete this.mChanges[sControlId];
				}
			}
			for (sControlId in this.mListChanges) {
				// Note: This may be a sparse array
				aExpectedValuesPerRow = this.mListChanges[sControlId];
				for (i in aExpectedValuesPerRow) {
					if (aExpectedValuesPerRow[i].length) {
						return;
					}
					delete aExpectedValuesPerRow[i];
				}
				delete this.mListChanges[sControlId];
			}
			if (sap.ui.getCore().getUIDirty()
					|| sap.ui.getCore().getMessageManager().getMessageModel().getObject("/").length
						< this.aMessages.length) {
				setTimeout(this.checkFinish.bind(this, assert), 10);

				return;
			}
			if (this.resolve) {
				this.resolve();
				this.resolve = null;
			}
		},

		/**
		 * Checks that exactly the expected messages have been reported, the order doesn't matter.
		 *
		 * @param {object} assert The QUnit assert object
		 */
		checkMessages : function (assert) {
			var aCurrentMessages = sap.ui.getCore().getMessageManager().getMessageModel()
					.getObject("/").sort(compareMessages),
				aExpectedMessages = this.aMessages.slice().sort(compareMessages);

			function compareMessages(oMessage1, oMessage2) {
				return oMessage1.message.localeCompare(oMessage2.message);
			}

			/*
			 * Maps the given message object to an object containing only the properties relevant
			 * for comparing expected and actual message leaving out properties like "id".
			 */
			function mapMessage(oMessage) {
				return {
					code : oMessage.code,
					description : oMessage.description,
					descriptionUrl : oMessage.descriptionUrl,
					aFullTargets : oMessage.aFullTargets.map(function (sFullTarget) {
						return sFullTarget.replace(rTemporaryKey, "~key~");
					}),
					message : oMessage.message,
					persistent : oMessage.persistent,
					aTargets : oMessage.aTargets.map(function (sTarget) {
						return sTarget.replace(rTemporaryKey, "~key~");
					}),
					technical : oMessage.technical,
					type : oMessage.type
				};
			}

			// check only a subset of properties
			aCurrentMessages = aCurrentMessages.map(mapMessage);
			aExpectedMessages = aExpectedMessages.map(mapMessage);

			assert.deepEqual(aCurrentMessages, aExpectedMessages,
				this.aMessages.length + " expected messages in message manager");
		},

		/**
		 * Checks that the given value is the expected one for the control.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sValue The value
		 * @param {string} sControlId The control ID
		 * @param {number|string} [vRow] The row index in case the control's binding is below a
		 *   list binding or the path of the row's context (for example in the tests of the
		 *   ODataMetaModel), otherwise <code>undefined</code>.
		 */
		checkValue : function (assert, sValue, sControlId, vRow) {
			var sExpectedValue,
				iRow = (typeof vRow === "string")
					? Number(rRowIndex.exec(vRow)[1])
					: vRow,
				aExpectedValues = (iRow === undefined)
					? this.mChanges[sControlId]
					: this.mListChanges[sControlId] && this.mListChanges[sControlId][iRow],
				sVisibleId = iRow === undefined ? sControlId : sControlId + "[" + iRow + "]";

			if (!aExpectedValues || !aExpectedValues.length) {
				if (!(sControlId in this.mIgnoredChanges && sValue === null)) {
					assert.ok(false, sVisibleId + ": " + JSON.stringify(sValue) + " (unexpected)");
				}
			} else {
				sExpectedValue = aExpectedValues.shift();
				// Note: avoid bad performance of assert.strictEqual(), e.g. DOM manipulation
				if (sValue !== sExpectedValue || iRow === undefined || typeof iRow !== "number"
						|| iRow < 10) {
					assert.strictEqual(sValue, sExpectedValue,
						sVisibleId + ": " + JSON.stringify(sValue));
				}
			}
			this.checkFinish(assert);
		},

		/**
		 * Checks the control's value state after waiting some time for the control to set it.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string|sap.m.InputBase} vControl The control ID or an instance of InputBase
		 * @param {sap.ui.core.ValueState} sState The expected value state
		 * @param {string} sText The expected text
		 *
		 * @returns {Promise} A promise resolving when the check is done
		 */
		checkValueState : function (assert, vControl, sState, sText) {
			var oControl = typeof vControl === "string" ? this.oView.byId(vControl) : vControl;

			return resolveLater(function () {
				assert.strictEqual(oControl.getValueState(), sState,
					oControl.getId() + ": value state: " + oControl.getValueState());
				assert.strictEqual(oControl.getValueStateText(), sText,
					oControl.getId() + ": value state text: " + oControl.getValueStateText());
			});
		},

		/**
		 * Searches the incoming request in the list of expected requests by comparing the URL.
		 * Removes the found request from the list.
		 *
		 * @param {object} oActualRequest The actual request
		 * @returns {object} The matching expected request or undefined if none was found
		 */
		consumeExpectedRequest : function (oActualRequest) {
			var oExpectedRequest, i;

			if (this.aRequests.length === 1) {
				return this.aRequests.shift(); // consume the one and only candidate to get a diff
			}
			for (i = 0; i < this.aRequests.length; i += 1) {
				oExpectedRequest = this.aRequests[i];
				if (oExpectedRequest.requestUri === oActualRequest.requestUri) {
					this.aRequests.splice(i, 1);
					return oExpectedRequest;
				}
			}
		},

		/**
		 * Creates an OData message object that can be passed as input parameter to
		 * <code>getMessageHeader</code>.
		 *
		 * @param {string|string[]} [vTarget]
		 *   The target or an array of targets in case of a multi-target message
		 * @param {string} [sMessage="message-~i~"]
		 *   The message text; if not given, "message-~i~" is used, where ~i~ is a generated number
		 * @param {string} [sSeverity="error"]
		 *   The message severity; either "error", "warning", "success" or "info"
		 * @param {boolean} [bTransition]
		 *   Whether the message is a transition message
		 * @returns {object}
		 *   An OData message object with following properties: <code>code</code> with the value
		 *   "code-~i~" (where ~i~ is a generated number), <code>message</code>,
		 *   <code>severity</code>, <code>target</code> and <code>transition</code>
		 */
		createResponseMessage : function (vTarget, sMessage, sSeverity, bTransition) {
			var i = this.iODataMessageCount,
				oResponseMessage;

			this.iODataMessageCount += 1;

			oResponseMessage = {
				code : "code-" + i,
				message : sMessage || "message-" + i,
				severity : sSeverity || "error",
				transition : bTransition
			};
			if (vTarget !== undefined) {
				if (Array.isArray(vTarget)) {
					if (vTarget.length > 1) {
						oResponseMessage.additionalTargets = vTarget.slice(1);
					}
					vTarget = vTarget[0];
				}
				oResponseMessage.target = vTarget;
			}

			return oResponseMessage;
		},

		/**
		 * Creates the view and attaches it to the model. Checks that the expected requests (see
		 * {@link #expectRequest} are fired and the controls got the expected changes (see
		 * {@link #expectChange}).
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sViewXML The view content as XML
		 * @param {sap.ui.model.odata.v2.ODataModel|Object<string,object>} [vModel] The model resp.
		 *   a map of named models (default model is undefined); the models are attached to the view
		 *   and to the test instance.
		 *   If no model is given, <code>createSalesOrdersModel</code> is used.
		 * @param {object} [oController]
		 *   An object defining the methods and properties of the controller
		 * @returns {Promise} A promise that is resolved when the view is created and all expected
		 *   values for controls have been set
		 */
		createView : function (assert, sViewXML, vModel, oController) {
			var mNamedModels,
				that = this;

			/**
			 * Stub function for datajs#request. Decides if a request should be executed as single
			 * request or batch request.
			 *
			 * @param {object} oRequest The request object
			 * @param {function} fnSuccess Success callback function
			 * @param {function} fnError Error callback function
			 * @param {object} oHandler The request handler object
			 * @param {object} oHttpClient The HttpClient object
			 * @param {object} oMetadata The metadata object
			 */
			function checkRequest(oRequest, fnSuccess, fnError, oHandler, oHttpClient, oMetadata) {
				if (oRequest.requestUri.includes("$batch")) {
					checkBatchRequest(oRequest, fnSuccess, fnError);
				} else {
					checkSingleRequest(oRequest, fnSuccess, fnError);
				}
			}

			/**
			 * Checks that all requests in a batch are as expected and handles its response.
			 *
			 * @param {object} oRequest The request object
			 * @param {function} fnSuccess Success callback function
			 * @param {function} fnError Error callback function
			 */
			function checkBatchRequest(oRequest, fnSuccess, fnError) {
				var oCrashedResponse;

				/**
				 * Processes a request within a batch
				 * @param {object} oRequest The request
				 * @returns {object} The processed response object of datajs#request
				 */
				function processRequest(oRequest) {
					if (oRequest.__changeRequests) {
						return Promise.all(
							oRequest.__changeRequests.map(processRequest)
						).then(function (aResponses) {
							var oErrorResponse = aResponses.reduce(function (oReduced, oCurrent) {
									return oReduced || oCurrent.message && oCurrent;
								}, undefined);

							if (oErrorResponse) {
								return oErrorResponse;
							}
							return {__changeResponses : aResponses};
						});
					}
					return checkSingleRequest(oRequest, function /*fnSuccess*/(oData, oResponse) {
							return oResponse;
						},
						function /*fnError*/(oError) {
							return {message : "HTTP request failed", response : oError.response};
						},
						that.iBatchNo
					).then(function (oResponse) {
						if (oResponse.response && oResponse.response.crashBatch) {
							delete oResponse.response.crashBatch;
							oCrashedResponse = oResponse;
						}
						return oResponse;
					});
				}

				/**
				 * @param {object} oRequest A batch request object that contains an array of
				 *   requests
				 */
				function processRequests(oRequest) {
					var aRequests = oRequest.data.__batchRequests;

					Promise.all(
						aRequests.map(processRequest)
					).then(function (aResponses) {
						var oBatchResponse;

						if (oCrashedResponse) {
							fnError(oCrashedResponse);
						} else {
							oBatchResponse = {
								data : {
									__batchResponses : aResponses
								}
							};

							fnSuccess(oBatchResponse.data, oBatchResponse);
						}
					});
				}

				that.iBatchNo += 1;

				processRequests(oRequest);
			}

			/**
			 * Checks that the expected request arrived and handles its response. If the status of
			 * the expected request is less than 300 the given success handler is called, otherwise
			 * the given error handler is called. This function can also be used to check requests
			 * within a $batch request. In this case the resulting promise is resolved with the
			 * return value of the given success or error handler.
			 *
			 * @param {object} oActualRequest
			 *   The request object
			 * @param {function} fnSuccess
			 *   Success callback function
			 * @param {function} fnError
			 *   Error callback function
			 * @param {number} [iBatchNo]
			 *   The number of the batch to which the request belongs to
			 * @returns {Promise}
			 *   Returns a Promise resolving with the result of the given success or error callback
			 */
			function checkSingleRequest(oActualRequest, fnSuccess, fnError, iBatchNo) {
				var sContentID,
					oExpectedRequest,
					oExpectedResponse,
					mHeaders,
					sMethod = oActualRequest.method,
					oResponse,
					mResponseHeaders,
					sUrl = oActualRequest.requestUri,
					bWaitForResponse = true;

				function checkFinish() {
					if (!that.aRequests.length && !that.iPendingResponses) {
						// give some time to process the response
						setTimeout(that.checkFinish.bind(that, assert), 0);
					}
				}

				function _getResponseMetadata(sRequestUri, iIndex) {
					sRequestUri = sRequestUri.split("?")[0];

					return {
						uri : (iIndex === undefined)
							? sRequestUri
							: sRequestUri + "('~" + iIndex + "~')"
					};
				}

				oActualRequest = Object.assign({}, oActualRequest);
				oActualRequest.headers = Object.assign({}, oActualRequest.headers);
				sContentID = oActualRequest.contentID;

				if (sUrl.startsWith(that.oModel.sServiceUrl)) {
					oActualRequest.requestUri = sUrl.slice(that.oModel.sServiceUrl.length + 1);
				}
				oExpectedRequest = that.consumeExpectedRequest(oActualRequest);

				mHeaders = oActualRequest.headers;
				delete mHeaders["Accept"];
				delete mHeaders["Accept-Language"];
				delete mHeaders["Content-Type"];
				delete mHeaders["DataServiceVersion"];
				delete mHeaders["MaxDataServiceVersion"];
				delete mHeaders["sap-cancel-on-close"];
				delete mHeaders["sap-contextid-accept"];
				delete mHeaders["X-Requested-With"];
				delete oActualRequest["_handle"];
				delete oActualRequest["adjustDeepPath"];
				delete oActualRequest["async"];
				delete oActualRequest["deferred"];
				delete oActualRequest["eventInfo"];
				delete oActualRequest["expandRequest"];
				delete oActualRequest["functionMetadata"];
				delete oActualRequest["functionTarget"];
				delete oActualRequest["password"];
				delete oActualRequest["requestID"];
				delete oActualRequest["updateAggregatedMessages"];
				delete oActualRequest["user"];
				delete oActualRequest["contentID"];
				if (oExpectedRequest) {
					oExpectedResponse = oExpectedRequest.response;

					if (oExpectedResponse === NO_CONTENT) {
						oResponse = {
							statusCode : 204
						};
					} else if (oExpectedResponse
							&& (oExpectedResponse.statusCode < 200
								|| oExpectedResponse.statusCode >= 300)) {
						oResponse = {
							response : oExpectedResponse
						};
					} else if (oExpectedResponse && typeof oExpectedResponse.then === "function") {
						oResponse = oExpectedResponse;
					} else {
						oResponse = oExpectedResponse && oExpectedResponse.data
							? oExpectedResponse
							: {data : oExpectedResponse, statusCode : 200};

						// oResponse needs __metadata for ODataModel.prototype._getKey
						if (oResponse.data && Array.isArray(oResponse.data.results)) {
							oResponse.data.results.forEach(function (oResponseItem, i) {
								oResponseItem.__metadata = oResponseItem.__metadata
									|| _getResponseMetadata(oExpectedRequest.requestUri, i);
							});
						} else if (oExpectedRequest.method !== "HEAD") {
							oResponse.data.__metadata = oResponse.data.__metadata
								|| _getResponseMetadata(oExpectedRequest.requestUri);
						}
					}

					bWaitForResponse = !(oResponse && typeof oResponse.then === "function");
					delete oExpectedRequest.response;
					mResponseHeaders = oExpectedRequest.responseHeaders;
					delete oExpectedRequest.responseHeaders;

					if (oActualRequest.key && sMethod !== "MERGE"
							&& oActualRequest.headers["x-http-method"] !== "MERGE") {
						that.sTemporaryKey = sContentID
							|| oActualRequest.key.match(rTemporaryKey)[0];

						oExpectedRequest.deepPath = oExpectedRequest.deepPath.replace("~key~",
							that.sTemporaryKey);
						delete oActualRequest["key"];

						if (oExpectedRequest.headers && oExpectedRequest.headers["Content-ID"]) {
							oExpectedRequest.headers["Content-ID"] =
								oExpectedRequest.headers["Content-ID"]
									.replace("~key~", that.sTemporaryKey);
						}
					}
					if (oExpectedRequest.headers && oExpectedRequest.headers["Content-ID"]) {
						oExpectedRequest.headers["Content-ID"] =
							oActualRequest.headers["Content-ID"];
						if (oExpectedResponse.body && oExpectedResponse.statusCode >= 400) {
							oExpectedResponse.body = oExpectedResponse.body.replace("~key~",
								oActualRequest.headers["Content-ID"]);
						}
					} else {
						// ignore content ID if not specified in the expected request
						delete oActualRequest.headers["Content-ID"];
					}
					if (oActualRequest.requestUri.startsWith("$") && sMethod === "GET") {
						oExpectedRequest.requestUri = oExpectedRequest.requestUri.replace("~key~",
							that.sTemporaryKey);
						oExpectedRequest.deepPath = oExpectedRequest.deepPath.replace("~key~",
							that.sTemporaryKey);
					}
					if ("batchNo" in oExpectedRequest) {
						oActualRequest.batchNo = iBatchNo;
					}
					assert.deepEqual(oActualRequest, oExpectedRequest, sMethod + " " + sUrl);
					oResponse.headers = mResponseHeaders || {};
					if (oExpectedRequest.headers["Content-ID"]) {
						oResponse.headers["Content-ID"] = oExpectedRequest.headers["Content-ID"];
					}
				} else {
					assert.ok(false, sMethod + " " + sUrl + " (unexpected)");
					oResponse = {value : []}; // dummy response to avoid further errors
				}

				if (bWaitForResponse) {
					that.iPendingResponses += 1;
				} else {
					checkFinish();
				}

				return Promise.resolve(oResponse).then(function (oResponseBody) {
					if (oResponseBody.statusCode >= 200 && oResponseBody.statusCode < 300) {
						return fnSuccess({}, oResponseBody);
					} else {
						return fnError(oResponseBody);
					}
				}).finally(function () {
					if (bWaitForResponse) {
						that.iPendingResponses -= 1;
					}
					// Waiting may be over after the promise has been handled
					checkFinish();
				});
			}

			mNamedModels = vModel && !(vModel instanceof sap.ui.model.Model)
				? vModel
				: {undefined : vModel || createSalesOrdersModel()};
			this.oModel = mNamedModels.undefined;
			this.mock(datajs).expects("request").atLeast(0).callsFake(checkRequest);
			//assert.ok(true, sViewXML); // uncomment to see XML in output, in case of parse issues
			this.assert = assert;

			return View.create({
				type : "XML",
				controller : oController && new (Controller.extend(uid(), oController))(),
				definition : xml(sViewXML)
			}).then(function (oView) {
				var sModelName;

				Object.keys(that.mChanges).forEach(function (sControlId) {
					var oControl = oView.byId(sControlId);

					if (oControl) {
						that.observe(assert, oControl, sControlId);
					}
				});
				Object.keys(that.mListChanges).forEach(function (sControlId) {
					var oControl = oView.byId(sControlId);

					if (oControl) {
						that.observe(assert, oControl, sControlId, true);
					}
				});

				for (sModelName in mNamedModels) {
					sModelName = sModelName === "undefined" ? undefined : sModelName;
					oView.setModel(mNamedModels[sModelName], sModelName);
				}
				// enable parse error messages in the message manager
				sap.ui.getCore().getMessageManager().registerObject(oView, true);
				// Place the view in the page so that it is actually rendered. In some situations,
				// esp. for the table.Table this is essential.
				oView.placeAt("qunit-fixture");
				that.oView = oView;

				return that.waitForChanges(assert);
			});
		},

		/**
		 * The following code (either {@link #createView} or anything before
		 * {@link #waitForChanges}) is expected to set a value (or multiple values) at the property
		 * "text" of the control with the given ID. <code>vValue</code> must be a list with expected
		 * values for each row if the control is created via a template in a list.
		 *
		 * You must call the function before {@link #createView}, even if you do not expect a change
		 * to the control's value initially. This is necessary because createView must attach a
		 * formatter function to the binding info before the bindings are created in order to see
		 * the change. If you expect a value at a later time but not initially, set the vValue
		 * parameter to <code>null</code>.
		 *
		 * Examples:
		 * this.expectChange("foo", "bar"); // expect value "bar" for the control with ID "foo"
		 * this.expectChange("foo", false); // listen to changes for the control with ID "foo", but
		 *                                  // do not expect a change (in createView). To be used if
		 *                                  // the control is a template within a table.
		 * this.expectChange("foo", ["a", "b"]); // expect values for two rows of the control with
		 *                                       // ID "foo"; may be combined with an offset vRow
		 * this.expectChange("foo", ["a",,"b"]); // expect values for the rows 0 and 2 of the
		 *                                       // control with the ID "foo", because this is a
		 *                                       // sparse array in which index 1 is unset
		 * this.expectChange("foo", "c", 2); // expect value "c" for control with ID "foo" in row 2
		 * this.expectChange("foo", "d", "/MyEntitySet/ID");
		 *                                 // expect value "d" for control with ID "foo" in a
		 *                                 // metamodel table on "/MyEntitySet/ID"
		 * this.expectChange("foo", "bar").expectChange("foo", "baz"); // expect 2 changes for "foo"
		 * this.expectChange("foo", null, null); // table.Table sets the binding context on an
		 *                                       // existing row to null when scrolling
		 * this.expectChange("foo", null); // row is deleted in table.Table so that its context is
		 *                                 // destroyed; this can also be used to listen to control
		 *                                 // changes that are not expected; a controls with a
		 *                                 // property binding (e.g. Text/Input) that expects
		 *                                 // changes must be initialized with <code>null</code>
		 *
		 * @param {string} sControlId The control ID
		 * @param {string|string[]|boolean|null} [vValue] The expected value, a list of expected
		 *   values, <code>false</code> to enforce listening to a template control or
		 *   <code>null</code> to initialize a control for a later change.
		 * @param {number|string} [vRow] The row index (for the model) or the path of its parent
		 *   context (for the metamodel), in case that a change is expected for a single row of a
		 *   list (in this case <code>vValue</code> must be a string).
		 * @returns {object} The test instance for chaining
		 * @throws {Error} If {@link #expectValue} is used in the same test
		 */
		expectChange : function (sControlId, vValue, vRow) {
			if (this.bCheckValue === true) {
				throw Error("Must not call expectChange after using expectValue in a test");
			}

			this.bCheckValue = false;
			this.expectChangeInternal.apply(this, arguments);

			return this;
		},

		/**
		 * Expects the code following a call to this method to set a value on the given control just
		 * like {@link #expectChange} with the difference that values given in the
		 * <code>vValue</code> parameter must be provided in <em>external</em> format as the
		 * corresponding change is checked by attaching a {@link sap.ui.base.ManagedObjectObserver}
		 * to the control's text or value property.
		 *
		 * @param {string} sControlId The control ID
		 * @param {string|string[]|boolean|null} [vValue] The expected value, a list of expected
		 *   values, <code>false</code> to enforce listening to a template control or
		 *   <code>null</code> to initialize a control for a later change.
		 * @param {number|string} [vRow] The row index (for the model) or the path of its parent
		 *   context (for the metamodel), in case that a change is expected for a single row of a
		 *   list (in this case <code>vValue</code> must be a string).
		 * @returns {object} The test instance for chaining
		 * @throws {Error} If {@link #expectChange} is used in the same test
		 */
		expectValue : function (sControlId, vValue, vRow) {
			var bInList;

			if (this.bCheckValue === false) {
				throw Error("Must not call expectValue after using expectChange in a test");
			}

			this.bCheckValue = true;
			bInList = this.expectChangeInternal.apply(this, arguments);

			if (this.oView) {
				this.observe(this.assert, this.oView.byId(sControlId), sControlId, bInList);
			}

			return this;
		},

		/**
		 * Implementation of methods {@link #expectChange} and {@link #expectValue}; see
		 * documentation of these for a description. Only the return statement is overridden.
		 *
		 * @returns {boolean} Whether the expected change is for a list element
		 */
		expectChangeInternal : function (sControlId, vValue, vRow) {
			var aExpectations, i;

			// Ensures that oObject[vProperty] is an array and returns it
			function array(oObject, vProperty) {
				oObject[vProperty] = oObject[vProperty] || [];

				return oObject[vProperty];
			}

			if (arguments.length === 3) {
				aExpectations = array(this.mListChanges, sControlId);
				if (Array.isArray(vValue)) {
					for (i = 0; i < vValue.length; i += 1) {
						if (i in vValue) {
							// This may create a sparse array this.mListChanges[sControlId]
							array(aExpectations, vRow + i).push(vValue[i]);
						}
					}
				} else {
					// This may create a sparse array this.mListChanges[sControlId]
					array(aExpectations, vRow).push(vValue);
				}
			} else if (Array.isArray(vValue)) {
				aExpectations = array(this.mListChanges, sControlId);
				for (i = 0; i < vValue.length; i += 1) {
					if (i in vValue) {
						array(aExpectations, i).push(vValue[i]);
					}
				}
			} else if (vValue === false) {
				array(this.mListChanges, sControlId);
			} else {
				aExpectations = array(this.mChanges, sControlId);
				if (arguments.length > 1) {
					aExpectations.push(vValue);
				}

				return false;
			}

			return true;
		},

		/**
		 * The following code (either {@link #createView} or anything before
		 * {@link #waitForChanges}) is expected to perform a <code>HEAD<code> request.
		 *
		 * @param {object} [mAdditionalHeaders]
		 *   Request headers additional to the "x-csrf-token" header
		 * @returns {object}
		 *   The test instance for chaining
		 */
		expectHeadRequest : function (mAdditionalHeaders) {
			this.aRequests.push({
				deepPath : "",
				headers : Object.assign({"x-csrf-token" : "Fetch"}, mAdditionalHeaders),
				method : "HEAD",
				requestUri : ""
			});

			return this;
		},

		/**
		 * Adds a message to the array of expected messages for this test based on the given OData
		 * message object, the target prefix and the full target prefix. If the given oODataMessage
		 * is <code>null</code>, no message is added. That allows using the "?" operator in
		 * <code>expectMessage</code> calls for messages that depend on the test fixture. No extra
		 * <code>if</code> statement is needed.
		 *
		 * @param {object} oODataMessage
		 *   An OData message object as returned by <code>createResponseMessage</code> or
		 *   <code>null</code>
		 * @param {string|string[]|object} vTargetPrefix
		 *   The prefix for the target; if vTargetPrefix is not of type string or an array of
		 *   strings the given object may have following properties: <code>path</code> and
		 *   <code>isComplete</code>;  note that a given array is modified
		 * @param {boolean} vTargetPrefix.isComplete
		 *   Whether <code>vTargetPrefix.path</code> is the complete message target or
		 *   <code>vTargetPrefix.path</code> is a prefix for the <code>oODataMessage.target</code>
		 * @param {string} vTargetPrefix.path
		 *   A path or a path prefix for the target
		 * @param {string|string[]} [vFullTargetPrefix=vTargetPrefix]
		 *   The prefix for the full target; if not given <code>vTargetPrefix</code> is also used as
		 *   prefix for the <code>fullTarget</code>; if vTargetPrefix is an array of strings the
		 *   vFullTargetPrefix must be given as an array with the equivalent number of strings; note
		 *   that a given array is modified
		 * @param {boolean} [bResetMessages]
		 *   Whether existing expected messages are reset before the new message is added
		 * @returns {object}
		 *   The test instance for chaining
		 */
		expectMessage : function (oODataMessage, vTargetPrefix, vFullTargetPrefix, bResetMessages) {
			var aAdditionalTargets,
				aFullTargets,
				sTargetPrefix,
				aTargets;

			function computeFullTarget(sODataMessageTarget) {
				return Array.isArray(vFullTargetPrefix)
					? vFullTargetPrefix.shift() + sODataMessageTarget
					: (vFullTargetPrefix || sTargetPrefix) + sODataMessageTarget;
			}

			function computeTarget(sODataMessageTarget) {
				if (Array.isArray(vTargetPrefix)) {
					sTargetPrefix = vTargetPrefix.shift();
				}
				return vTargetPrefix.isComplete
					? vTargetPrefix.path
					: sTargetPrefix + sODataMessageTarget;
			}

			if (bResetMessages) {
				this.aMessages = [];
			}

			if (oODataMessage !== null) {
				sTargetPrefix = vTargetPrefix.isComplete ? "" : vTargetPrefix.path || vTargetPrefix;
				aAdditionalTargets = oODataMessage.additionalTargets || [];
				aTargets = [computeTarget(oODataMessage.target)]
					.concat(aAdditionalTargets.map(computeTarget));
				aFullTargets = [computeFullTarget(oODataMessage.target)]
					.concat(aAdditionalTargets.map(computeFullTarget));

				this.aMessages.push(new Message({
					code : oODataMessage.code,
					description : oODataMessage.description,
					descriptionUrl : "",
					fullTarget : aFullTargets,
					message : oODataMessage.message,
					persistent : false,
					target : aTargets,
					technical : false,
					type : mSeverityMap[oODataMessage.severity]
				}));
			}

			return this;
		},

		/**
		 * The following code (either {@link #createView} or anything before
		 * {@link #waitForChanges}) is expected to report exactly the given messages. All expected
		 * messages should have a different message text.
		 *
		 * @param {object|object[]} vExpectedMessages
		 *   The expected message or an array of expected messages (with properties code, message,
		 *   target, persistent, technical and type corresponding the getters of
		 *   sap.ui.core.message.Message)
		 * @returns {object}
		 *   The test instance for chaining
		 */
		expectMessages : function (vExpectedMessages) {
			//TODO expectMessages takes sap.ui.core.message.Message like objects while
			// expectMessage takes an ODataMessage like object => make uniform, separate change
			// this.aMessages = [];
			//
			// if (!Array.isArray(vExpectedMessages)) {
			// 	vExpectedMessages = [vExpectedMessages];
			// }
			// vExpectedMessages.forEach(this.expectMessage.bind(this));
			if (!Array.isArray(vExpectedMessages)) {
				vExpectedMessages = [vExpectedMessages];
			}
			this.aMessages = vExpectedMessages.map(function (oMessage) {
				oMessage.description = oMessage.hasOwnProperty("description")
					?  oMessage.description
					: undefined;
				oMessage.descriptionUrl = oMessage.hasOwnProperty("descriptionUrl")
					?  oMessage.descriptionUrl
					: "";
				oMessage.technical = oMessage.technical || false;
				return new Message(oMessage);
			});

			return this;
		},

		/**
		 * The following code (either {@link #createView} or anything before
		 * {@link #waitForChanges}) is expected to perform the given request. <code>oResponse</code>
		 * describes how to react on the request. Usually you simply give the JSON for the response
		 * and the request will be responded in the next microtask.
		 *
		 * <code>oResponse</code> may also be a promise resolving with the response or the error. In
		 * this case you can control the response time (typically to control the order of the
		 * responses).
		 *
		 * @param {string|object} vRequest
		 *   The request with the mandatory properties "deepPath" and "requestUri".
		 *   Optional properties are:
		 *   <ul>
		 *     <li>"batchNo": The batch number in which the request is contained</li>
		 *     <li>"encodeRequestUri": Whether the query string of the requestUri has to be encoded;
		 *       <code>true</code> by default</li>
		 *     <li>"headers": The expected request headers</li>
		 *     <li>"method": The expected HTTP method; "GET" by default</li>
		 *   </ul>
		 *   A string is interpreted as URL with method "GET". Spaces inside the URL, and "'" and
		 *   "~" inside the query string are percent-encoded automatically.
		 * @param {object|Promise|Error} [oResponse] The response message to be returned from the
		 *   requestor or a promise on it
		 * @param {object} [mResponseHeaders] The response headers to be returned from the
		 *   requestor
		 * @returns {object} The test instance for chaining
		 */
		expectRequest : function (vRequest, oResponse, mResponseHeaders) {
			var aUrlParts;

			if (typeof vRequest === "string") {
				vRequest = {
					deepPath : "/" + vRequest.split("?")[0],
					method : "GET",
					requestUri : vRequest
				};
			}
			// ensure that these properties are defined (required for deepEqual)
			vRequest.headers = vRequest.headers || {};
			vRequest.method = vRequest.method || "GET";
			vRequest.responseHeaders = mResponseHeaders || {};
			vRequest.response = oResponse || {/*null object pattern*/};
			aUrlParts = vRequest.requestUri.split("?");
			if (aUrlParts[1] && vRequest.encodeRequestUri !== false) {
				vRequest.requestUri = aUrlParts[0] + "?"
					+ aUrlParts[1].replace(/ /g, "%20").replace(/'/g, "%27").replace(/~/g, "%7e");
			}
			delete vRequest.encodeRequestUri;
			this.aRequests.push(vRequest);

			return this;
		},

		/**
		 * Returns whether expected changes for the control are only optional null values.
		 *
		 * @param {string} sControlId The control ID
		 * @returns {boolean} Whether expected changes for the control are only optional null values
		 */
		hasOnlyOptionalChanges : function (sControlId) {
			return this.bNullOptional &&
				this.mChanges[sControlId].every(function (vValue) {
					return vValue === null;
				});
		},

		/**
		 * Allows that the property "text" of the control with the given ID is set to undefined or
		 * null. This may happen when bindings are initialized before the model value is available.
		 *
		 * @param {string} sControlId The control ID
		 * @returns {object} The test instance for chaining
		 */
		ignoreNullChanges : function (sControlId) {
			this.mIgnoredChanges[sControlId] = true;

			return this;
		},

		/**
		 * Observes and checks value changes for a control. In case the test uses {#expectChange},
		 * checks the model internal value by attaching a formatter; if the test uses
		 * {#expectValue}, checks the control value in its external representation using a managed
		 * object observer. In both cases, {#checkValue} is called for the actual value check each
		 * time the value changes.
		 * Note that you may only use controls that have a 'text' or a 'value' property.
		 * Note that the managed object observer for list changes only supports sap.ui.table.Table
		 * with one column currently; this can be enhanced as needed.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {sap.ui.base.ManagedObject} oControl The control
		 * @param {string} sControlId The (symbolic) control ID for which changes are expected
		 * @param {boolean} [bInList] Whether the control resides in a list item
		 */
		observe : function (assert, oControl, sControlId, bInList) {
			var oBindingInfo,
				oConfiguration,
				fnOriginalFormatter,
				sProperty = oControl.getBindingInfo("text") ? "text" : "value",
				oType,
				bIsCompositeType,
				that = this;

			function observeRow(oRow) {
				var oCellControl;

				//TODO find cell with observed control, currently assume 0
				//TODO aggregation "cells" is only valid for sap.ui.table.Table
				oCellControl = oRow.getAggregation("cells")[0];
				that.checkValue(assert, oCellControl.getProperty(sProperty), sControlId,
					oRow.getIndex());
				that.oObserver.observe(oCellControl, {properties : [sProperty]});
			}

			if (this.bCheckValue) { // ManagedObjectObserver checks value changes on the control
				this.oObserver = this.oObserver || new ManagedObjectObserver(function (oChange) {
					var i,
						sId = oChange.object.getId(),
						oParent = oChange.object.getParent();

					sId = sId.slice(sId.indexOf("--") + 2); // strip view ID
					i = sId.indexOf("-");
					if (i > 0) {
						sId = sId.slice(0, i); // strip clone ID if available
					}

					that.checkValue(assert, oChange.current, sId,
						/*TODO only for sap.ui.table.Row*/oParent.getIndex && oParent.getIndex());
				});
				if (bInList) {
					this.oTemplateObserver = this.oTemplateObserver
						|| new ManagedObjectObserver(function (oChange) {
						if (oChange.mutation === "remove") {
							that.oObserver.unobserve(oChange.child);
						} else if (oChange.mutation === "insert") {
							observeRow(oChange.child);
						}
					});
					oControl = oControl.getParent().getParent();
					//TODO aggregation "rows" is only valid for sap.ui.table.Table
					oConfiguration = {aggregations : ["rows"]};
					if (!this.oTemplateObserver.isObserved(oControl, oConfiguration)) {
						this.oTemplateObserver.observe(oControl, oConfiguration);
						oControl.getRows().forEach(observeRow); // observe initial rows (TreeTable)
					}
				} else {
					oConfiguration = {properties : [sProperty]};
					if (!this.oObserver.isObserved(oControl, oConfiguration)) {
						this.oObserver.observe(oControl, oConfiguration);
					}
				}
				return;
			}
			// formatter checks changes of values in model representation
			oBindingInfo = oControl.getBindingInfo(sProperty);
			fnOriginalFormatter = oBindingInfo.formatter;
			oType = oBindingInfo.type;
			bIsCompositeType = oType && oType.getMetadata().isA("sap.ui.model.CompositeType");
			oBindingInfo.formatter = function (sValue) {
				var oContext = bInList && this.getBindingContext();

				if (fnOriginalFormatter) {
					sValue = fnOriginalFormatter.apply(this, arguments);
				} else if (bIsCompositeType) {
					// composite type at binding with type and no original formatter: call the
					// type's formatValue, as CompositeBinding#getExternalValue calls only the
					// formatter if it is set
					sValue = oType.formatValue.call(oType, Array.prototype.slice.call(arguments),
						"string");
				}
				// CompositeType#formatValue is called each time a part changes; we expect null if
				// not all parts are set as it is the case for sap.ui.model.odata.type.Unit.
				// Only check the value once all parts are available.
				if (!bIsCompositeType || sValue !== null) {
					that.checkValue(assert, sValue, sControlId,
						oContext && (oContext.getBinding
							? oContext.getBinding() && oContext.getIndex()
							: oContext.getPath()
						)
					);
				}

				return sValue;
			};
		},

		/**
		 * Waits for the expected requests and changes.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {boolean} [bNullOptional] Whether a non-list change to a null value is optional
		 * @param {number} [iTimeout=3000] The timeout time in milliseconds
		 * @returns {Promise} A promise that is resolved when all requests have been responded and
		 *   all expected values for controls have been set
		 */
		waitForChanges : function (assert, bNullOptional, iTimeout) {
			var oPromise,
				that = this;

			oPromise = new SyncPromise(function (resolve) {
				that.resolve = resolve;
				that.bNullOptional = bNullOptional;
				// After three seconds everything should have run through
				// Resolve to have the missing requests and changes reported
				setTimeout(function () {
					if (oPromise.isPending()) {
						assert.ok(false, "Timeout in waitForChanges");
						resolve();
					}
				}, iTimeout || 3000);
				that.checkFinish(assert);
			}).then(function () {
				var sControlId, aExpectedValuesPerRow, i, j;

				// Report missing requests
				that.aRequests.forEach(function (oRequest) {
					assert.ok(false, oRequest.method + " " + oRequest.requestUri
						+ " (not requested)");
				});
				// Report missing changes
				for (sControlId in that.mChanges) {
					if (that.hasOnlyOptionalChanges(sControlId)) {
						delete that.mChanges[sControlId];
						continue;
					}
					for (i in that.mChanges[sControlId]) {
						assert.ok(false, sControlId + ": "
							+ JSON.stringify(that.mChanges[sControlId][i]) + " (not set)");
					}
				}
				for (sControlId in that.mListChanges) {
					// Note: This may be a sparse array
					aExpectedValuesPerRow = that.mListChanges[sControlId];
					for (i in aExpectedValuesPerRow) {
						for (j in aExpectedValuesPerRow[i]) {
							assert.ok(false, sControlId + "[" + i + "]: "
								+ JSON.stringify(aExpectedValuesPerRow[i][j]) + " (not set)");
						}
					}
				}
				that.checkMessages(assert);
			});

			return oPromise;
		}
	});

	//*********************************************************************************************
	// Integration test for correct path calculation during ODataModel#read(...).
	// JIRA: CPOUI5MODELS-404
	// BCP: 2080464216
[{
	expectedCanonicalRequest : "SalesOrderSet",
	expectedRequest : "SalesOrderSet",
	isArrayResponse : true,
	path : "/SalesOrderSet",
	title : "Absolute path with one segment to a collection"
}, {
	expectedCanonicalRequest : "SalesOrderSet('1')",
	expectedRequest : "SalesOrderSet('1')",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')",
	title : "Absolute path with one segment to a single entity"
}, {
	expectedCanonicalRequest : "SalesOrder_Confirm(SalesOrderID='1')",
	expectedRequest : "SalesOrder_Confirm(SalesOrderID='1')",
	isArrayResponse : false,
	path : "/SalesOrder_Confirm(SalesOrderID='1')",
	title : "Function import"
}, {
	expectedCanonicalRequest : "SalesOrderSet('1')/ToLineItems",
	expectedRequest : "SalesOrderSet('1')/ToLineItems",
	isArrayResponse : true,
	path : "/SalesOrderSet('1')/ToLineItems",
	title : "Absolute path with two segments to a collection"
}, {
	// MockServer does not support navigation properties with key predicates; as long as the
	// addressed entity set is addressable we can shorten the path
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
		requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
	},
	expectedRequest : "SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
	title : "Absolute path with two segments to a single entity of a collection"
}, {
	expectedCanonicalRequest : "SalesOrderSet('1')/ToBusinessPartner",
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToBusinessPartner",
	title : "Absolute path with two segments to a single entity via 'to 1' navigation property"
}, {
	expectedCanonicalRequest : "BusinessPartnerSet('BP1')/Address",
	expectedRequest : "BusinessPartnerSet('BP1')/Address",
	isArrayResponse : false,
	path : "/BusinessPartnerSet('BP1')/Address",
	title : "Absolute path with two segments to a complex type"
}, {
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
		requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
	},
	expectedRequest : "SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')"
		+ "/ToProduct",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
	title : "Absolute path with three segments to a single entity; 'to n' navigation in the"
		+ " middle"
}, {
	expectedCanonicalRequest : {
		deepPath : "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems",
		requestUri : "ProductSet('P1')/ToSalesOrderLineItems"
	},
	expectedRequest : "BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems",
	isArrayResponse : true,
	path : "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems",
	title : "Absolute path with three segments to a collection; 'to n' navigation in the middle"
}, {
	expectedCanonicalRequest : {
		deepPath : "/BusinessPartnerSet('BP1')/ToProducts('P1')"
			+ "/ToSalesOrderLineItems(SalesOrderID='1',ItemPosition='10')",
		// MockServer does not support navigation properties with key predicates; as long as the
		// addressed entity set is addressable we can shorten the path
		requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
	},
	expectedRequest : "BusinessPartnerSet('BP1')/ToProducts('P1')"
		+ "/ToSalesOrderLineItems(SalesOrderID='1',ItemPosition='10')",
	isArrayResponse : false,
	path : "/BusinessPartnerSet('BP1')/ToProducts('P1')"
		+ "/ToSalesOrderLineItems(SalesOrderID='1',ItemPosition='10')",
	title : "Absolute path with three segments to a single entity of a collection; 'to n'"
		+ " navigation in the middle"
}, {
	// path cannot be made canonical as the key predicate for the referenced product is missing
	expectedCanonicalRequest : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
		+ "/ToSupplier",
	expectedRequest : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
		+ "/ToSupplier",
	isArrayResponse : false,
	path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
	title : "Absolute path with three segments to a single entity; 'to 1' navigation in the"
		+ " middle"
}, {
	// path cannot be made canonical as the key predicate for the business partner is missing
	expectedCanonicalRequest : "SalesOrderSet('1')/ToBusinessPartner/ToProducts",
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner/ToProducts",
	isArrayResponse : true,
	path : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts",
	title : "Absolute path with three segments to a collection; 'to 1' navigation in the middle"
}, {
	// even if key predicates for ToBusinessPartner cannot be resolved, canonical path for the
	// product can be computed
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
		requestUri : "ProductSet('P1')"
	},
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
	title : "Absolute path with three segments to a single entity of a collection; 'to 1'"
		+ " navigation in the middle"
}, {
	expectedCanonicalRequest : "SalesOrderSet('1')/ToBusinessPartner/Address",
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner/Address",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToBusinessPartner/Address",
	title : "Absolute path with three segments to a complex type; 'to 1' navigation in the"
		+ " middle"
}, {
	expectedCanonicalRequest : "SalesOrderSet/$count",
	expectedRequest : "SalesOrderSet/$count",
	isArrayResponse : false,
	path : "/SalesOrderSet/$count",
	title : "Absolute path; second segment is $count"
}, {
	expectedCanonicalRequest : "SalesOrderSet('1')/ToLineItems/$count",
	expectedRequest : "SalesOrderSet('1')/ToLineItems/$count",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToLineItems/$count",
	title : "Absolute path; third segment is $count; 'to n' navigation in the middle"
}, {
	expectedCanonicalRequest : {
		deepPath : "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems/$count",
		requestUri : "ProductSet('P1')/ToSalesOrderLineItems/$count"
	},
	expectedRequest : "BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems/$count",
	isArrayResponse : false,
	path : "/BusinessPartnerSet('BP1')/ToProducts('P1')/ToSalesOrderLineItems/$count",
	title : "Absolute path; 4th segment is $count"
}, {
	contextDeepPath : "/SalesOrderSet",
	contextPath : "/SalesOrderSet",
	expectedCanonicalRequest : "SalesOrderSet",
	expectedRequest : "SalesOrderSet",
	isArrayResponse : true,
	path : "",
	title : "Relative empty path; resolved path has 1 segment referencing a collection"
}, {
	contextDeepPath : "/SalesOrderSet('1')",
	contextPath : "/SalesOrderSet('1')",
	expectedCanonicalRequest : "SalesOrderSet('1')",
	expectedRequest : "SalesOrderSet('1')",
	isArrayResponse : false,
	path : "",
	title : "Relative empty path; resolved path has 1 segment referencing a single entity"
}].forEach(function (oFixture) {
	[false, true].forEach(function (bCanonical) {
	var sTitle = "ODataModel#read:" + oFixture.title
			+ (bCanonical ? "; using canonical requests" : "");

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModel({tokenHandling : false}),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			var oContext = oFixture.contextPath
					? oModel.getContext(oFixture.contextPath, oFixture.contextDeepPath)
					: undefined,
				vExpectedRequest = bCanonical
					? oFixture.expectedCanonicalRequest
					: oFixture.expectedRequest,
				mParameters = {canonicalRequest : bCanonical, context : oContext};

			if (oFixture.pathCache) {
				oModel.mPathCache = oFixture.pathCache;
			}
			that.expectRequest(vExpectedRequest,
				// response not relevant for this test
				oFixture.isArrayResponse ? {results : []} : {});

			// code under test
			oModel.read(oFixture.path, mParameters);

			return that.waitForChanges(assert);
		});
	});
	});
});

	//*********************************************************************************************
	// Integration test for correct path calculation during ODataModel#read(...). A previous read
	// filled already the path cache, that "to 1" navigation properties can be resolved.
	// JIRA: CPOUI5MODELS-404
	// BCP: 2080464216
[{
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
			+ "/ToSupplier",
		requestUri : "ProductSet('P1')/ToSupplier"
	},
	expectedRequest : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
		+ "/ToSupplier",
	isArrayResponse : false,
	path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
	previousReads : [{
		request : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
		response : {__metadata : {uri : "ProductSet('P1')"} /*content not relevant*/}
	}, {
		request : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
		response : {__metadata : {uri : "BusinessPartnerSet('BP1')"} /*content not relevant*/}
	}],
	title : "Absolute path with three segments to a single entity; 'to 1' navigation in the"
		+ " middle"
}, {
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts",
		requestUri : "BusinessPartnerSet('BP1')/ToProducts"
	},
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner/ToProducts",
	isArrayResponse : true,
	path : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts",
	previousReads : [{
		request : "SalesOrderSet('1')/ToBusinessPartner",
		response : {__metadata : {uri : "BusinessPartnerSet('BP1')"} /*content not relevant*/}
	}],
	title : "Absolute path with three segments to a collection; 'to 1' navigation in the middle"
}, {
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
		// MockServer does not support navigation properties with key predicates; as long as the
		// addressed entity set is addressable we can shorten the path
		requestUri : "ProductSet('P1')"
	},
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
	previousReads : [{
		request : "SalesOrderSet('1')/ToBusinessPartner",
		response : {__metadata : {uri : "BusinessPartnerSet('BP1')"} /*content not relevant*/}
	}, {
		request : "SalesOrderSet('1')/ToBusinessPartner/ToProducts('P1')",
		response : {__metadata : {uri : "ProductSet('P1')"} /*content not relevant*/}
	}],
	title : "Absolute path with three segments to a single entity of a collection; 'to 1'"
		+ " navigation in the middle"
}, {
	expectedCanonicalRequest : "SalesOrderSet('1')/ToBusinessPartner/Address",
	expectedRequest : "SalesOrderSet('1')/ToBusinessPartner/Address",
	isArrayResponse : false,
	path : "/SalesOrderSet('1')/ToBusinessPartner/Address",
	previousReads : [{
		request : "SalesOrderSet('1')/ToBusinessPartner",
		response : {__metadata : {uri : "BusinessPartnerSet('BP1')"} /*content not relevant*/}
	}],
	title : "Absolute path with three segments to a complex type; 'to 1' navigation in the"
		+ " middle"
}, {
	contextDeepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
	contextPath : "/ProductSet('P1')",
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
			+ "/ToSupplier",
		requestUri : "ProductSet('P1')/ToSupplier"
	},
	expectedRequest : {
		deepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
			+ "/ToSupplier",
		requestUri : "ProductSet('P1')/ToSupplier"
	},
	isArrayResponse : false,
	path : "ToSupplier",
	previousReads : [{
		request : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
		response : {__metadata : {uri : "ProductSet('P1')"} /*content not relevant*/}
	}, {
		request : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
		response : {__metadata : {uri : "BusinessPartnerSet('BP1')"} /*content not relevant*/}
	}],
	title : "Relative path 'ToSupplier'; resolved deep path has 3 segments"
}, {
	contextDeepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
		+ "/ToSupplier",
	contextPath : "/ProductSet('P1')/ToSupplier",
	expectedCanonicalRequest : {
		deepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
			+ "/ToSupplier",
		requestUri : "ProductSet('P1')/ToSupplier"
	},
	expectedRequest : {
		deepPath : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct"
			+ "/ToSupplier",
		requestUri : "ProductSet('P1')/ToSupplier"
	},
	isArrayResponse : false,
	path : "",
	previousReads : [{
		request : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
		response : {__metadata : {uri : "ProductSet('P1')"} /*content not relevant*/}
	}, {
		request : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct/ToSupplier",
		response : {__metadata : {uri : "BusinessPartnerSet('BP1')"} /*content not relevant*/}
	}],
	title : "Relative empty path with '/ProductSet('P1')/ToSupplier' as context path; resolved"
		+ " deep path has 3 segments"
}].forEach(function (oFixture) {
	[false, true].forEach(function (bCanonical) {
	var sTitle = "ODataModel#read:" + oFixture.title
			+ (bCanonical ? "; using canonical requests" : "")
			+ "; 'to 1' navigation property in the middle already read";

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModel({tokenHandling : false}),
			that = this;

		oFixture.previousReads.forEach(function (oPreviousRead) {
			that.expectRequest(oPreviousRead.request, oPreviousRead.response);

			// trigger previous read to be able to resolve the "to 1" navigation property
			oModel.read("/" + oPreviousRead.request);
		});

		return this.createView(assert, "", oModel).then(function () {
			var oContext = oFixture.contextPath
					? oModel.getContext(oFixture.contextPath, oFixture.contextDeepPath)
					: undefined,
				vExpectedRequest = bCanonical
					? oFixture.expectedCanonicalRequest
					: oFixture.expectedRequest,
				mParameters = {canonicalRequest : bCanonical, context : oContext};

			that.expectRequest(vExpectedRequest,
				// response not relevant for this test
				oFixture.isArrayResponse ? {results : []} : {});

			// code under test
			oModel.read(oFixture.path, mParameters);

			return that.waitForChanges(assert);
		});
	});
	});
});

	//*********************************************************************************************
	// Integration test for correct path calculation during ODataModel#read(...). "To n" navigation
	// properties are not shortened if the corresponding entity set is not addressable.
	// JIRA: CPOUI5MODELS-404
	// BCP: 2080464216
	QUnit.test("ODataModel#read: not addressable 'to n' navigation property" , function (assert) {
		var oModel = createSpecialCasesModel({tokenHandling : false}),
			sResourcePath = "C_SubscrpnProductChargeTP('ID')/to_AllUserContactCards",
			that = this;

		this.expectRequest(sResourcePath, {
			results : [{__metadata : {uri : "I_UserContactCard('Card1')"}}]
		});

		// trigger previous read to be able to resolve the "to 1" navigation property
		oModel.read("/" + sResourcePath);

		return this.createView(assert, "", oModel).then(function () {
			that.expectRequest(sResourcePath + "('Card1')", {});

			// code under test
			oModel.read("/" + sResourcePath + "('Card1')", {canonicalRequest : true});

			return that.waitForChanges(assert);
		});
	});


	//*********************************************************************************************
	// Integration test for correct path calculation during ODataModel#read(...). "To 1" navigation
	// properties are not shortened independent whether the corresponding entity set is addressable.
	// JIRA: CPOUI5MODELS-404
	// BCP: 2080464216
	QUnit.test("ODataModel#read: not addressable 'to 1' navigation property" , function (assert) {
		var oModel = createSpecialCasesModel({tokenHandling : false}),
			sResourcePath = "C_SubscrpnProductChargeTP('ID')/to_CreatedByUserContactCard",
			that = this;

		this.expectRequest(sResourcePath, {__metadata : {uri : "I_UserContactCard('Card1')"}});

		// trigger previous read to be able to resolve the "to 1" navigation property
		oModel.read("/" + sResourcePath);

		return this.createView(assert, "", oModel).then(function () {
			that.expectRequest(sResourcePath, {});

			// code under test
			oModel.read("/" + sResourcePath, {canonicalRequest : true});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Integration test for correct path calculation during ODataModel#read(...). If the given path
	// has a query string, the query string is ignored by ODataModel#read.
	// JIRA: CPOUI5MODELS-404
	// BCP: 2080464216
[{
	path : "/SalesOrderSet('1')/ToBusinessPartner?sap-client=100"
}, {
	contextPath : "/SalesOrderSet('1')/ToBusinessPartner",
	path : "?sap-client=100"
}].forEach(function (oFixture) {
	QUnit.test("ODataModel#read: path with query string: " + oFixture.path, function (assert) {
		var oModel = createSalesOrdersModel({tokenHandling : false}),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			that.expectRequest("SalesOrderSet('1')/ToBusinessPartner",
				// response not relevant for this test
				{results : {}});

			// code under test
			oModel.read(oFixture.path, oFixture.contextPath
				? {context : oModel.getContext(oFixture.contextPath)}
				: {});

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Read and display data for a single field in a form
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test (useBatch=false)", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : false}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		this.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectValue("id", "1");

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Read and display data for a single field in a form
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test (useBatch=true)", function (assert) {
		var sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectValue("id", "1");

		// code under test
		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: A failed token HEAD request expects a following token GET request. A failed token
	// GET request leads to an error message and corresponding console log.
	QUnit.test("Messages: Failing token requests with logging", function (assert) {
		var oModel = createSalesOrdersModel({persistTechnicalMessages : true}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		this.expectRequest({
				deepPath : "",
				headers : {"x-csrf-token" : "Fetch"},
				method : "HEAD",
				requestUri : ""
			}, createErrorResponse({message : "HEAD failed"}))
			.expectRequest({
				deepPath : "",
				headers : {"x-csrf-token" : "Fetch"},
				method : "GET",
				requestUri : ""
			}, createErrorResponse({message : "GET failed"}))
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectValue("id", "1")
			.expectMessages([{
				code : "UF0",
				message : "GET failed",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 500: "
					+ "GET /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Read and display collection data for a table with a single field
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test with collection data (useBatch=false)", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : false}),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}" />\
</Table>';

		this.expectRequest("SalesOrderSet?$skip=0&$top=100", {
				results : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002"]);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Read and display collection data for a table with a single field
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test with collection data (useBatch=true)", function (assert) {
		var sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}" />\
</Table>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=100", {
				results : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002"]);

		// code under test
		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: A single request within a $batch request fails
	// JIRA: CPOUI5MODELS-198
	QUnit.test("$batch error handling: single request fails", function (assert) {
		var oErrorResponse = createErrorResponse({message : "Bad Request", statusCode : 400}),
			oEventHandlers = {
				batchCompleted : function () {},
				batchFailed : function () {},
				batchSent : function () {},
				requestCompleted : function () {},
				requestFailed : function () {},
				requestSent : function () {}
			},
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>\
<Table id="table" items="{/SalesOrderSet}">\
	<Text text="{SalesOrderID}" />\
</Table>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectValue("id", "1")
			.expectRequest("SalesOrderSet?$skip=0&$top=100", oErrorResponse)
			.expectMessages([{
				code : "UF0",
				descriptionUrl : "",
				fullTarget : "/SalesOrderSet",
				message : "Bad Request",
				persistent : false,
				target : "/SalesOrderSet",
				technical : true,
				type : "Error"
			}]);

		// don't care about passed arguments
		this.mock(oEventHandlers).expects("batchCompleted");
		this.mock(oEventHandlers).expects("batchFailed").never();
		this.mock(oEventHandlers).expects("batchSent");
		this.mock(oEventHandlers).expects("requestCompleted").twice();
		this.mock(oEventHandlers).expects("requestFailed");
		this.mock(oEventHandlers).expects("requestSent").twice();
		oModel.attachBatchRequestCompleted(oEventHandlers.batchCompleted);
		oModel.attachBatchRequestFailed(oEventHandlers.batchFailed);
		oModel.attachBatchRequestSent(oEventHandlers.batchSent);
		oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
		oModel.attachRequestFailed(oEventHandlers.requestFailed);
		oModel.attachRequestSent(oEventHandlers.requestSent);
		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 400: "
					+ "GET SalesOrderSet?$skip=0&$top=100",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: If network connection is lost, browsers may send status code 0; in that case a
	// generic, technical message is added to the message model.
	QUnit.test("$batch error handling: no network connection - generic error", function (assert) {
		var oEventHandlers = {
				batchCompleted : function () {},
				batchFailed : function () {},
				batchSent : function () {},
				requestCompleted : function () {},
				requestFailed : function () {},
				requestSent : function () {}
			},
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>\
<Table id="table" items="{/SalesOrderSet}">\
	<Text text="{SalesOrderID}" />\
</Table>';

		this.mock(sap.ui.getCore().getLibraryResourceBundle()).expects("getText")
			.atLeast(1)
			.callsFake(function (sKey) {
				return sKey;
			});
		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				body : "",
				crashBatch : true,
				headers : [],
				statusCode : 0,
				statusText : ""
			})
			.expectRequest("SalesOrderSet?$skip=0&$top=100" /* response not relevant */)
			.expectMessages([{
				code : "",
				description : "",
				message : "CommunicationError",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		// don't care about passed arguments
		this.mock(oEventHandlers).expects("batchCompleted");
		this.mock(oEventHandlers).expects("batchFailed");
		this.mock(oEventHandlers).expects("batchSent");
		this.mock(oEventHandlers).expects("requestCompleted").twice();
		this.mock(oEventHandlers).expects("requestFailed").twice();
		this.mock(oEventHandlers).expects("requestSent").twice();
		oModel.attachBatchRequestCompleted(oEventHandlers.batchCompleted);
		oModel.attachBatchRequestFailed(oEventHandlers.batchFailed);
		oModel.attachBatchRequestSent(oEventHandlers.batchSent);
		oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
		oModel.attachRequestFailed(oEventHandlers.requestFailed);
		oModel.attachRequestSent(oEventHandlers.requestSent);
		this.oLogMock.expects("error")
			.withExactArgs("Request failed with unsupported status code 0: "
					+ "POST /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$batch",
				undefined, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: A single request caused complete $batch to fail
	// JIRA: CPOUI5MODELS-198
	QUnit.test("$batch error handling: complete batch fails", function (assert) {
		var oErrorResponse = createErrorResponse({crashBatch : true}),
			oEventHandlers = {
				batchCompleted : function () {},
				batchFailed : function () {},
				batchSent : function () {},
				requestCompleted : function () {},
				requestFailed : function () {},
				requestSent : function () {}
			},
			oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text text="{SalesOrderID}" />\
</Table>\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=100", oErrorResponse)
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectMessages([{
				code : "UF0",
				descriptionUrl : "",
				fullTarget : "/$batch",
				message : "Internal Server Error",
				persistent : false,
				target : "/$batch",
				technical : true,
				type : "Error"
			}])
			.expectChange("id", null); // no change as batch fails

		// don't care about passed arguments
		this.mock(oEventHandlers).expects("batchCompleted");
		this.mock(oEventHandlers).expects("batchFailed");
		this.mock(oEventHandlers).expects("batchSent");
		this.mock(oEventHandlers).expects("requestCompleted").twice();
		this.mock(oEventHandlers).expects("requestFailed").twice();
		this.mock(oEventHandlers).expects("requestSent").twice();
		oModel.attachBatchRequestCompleted(oEventHandlers.batchCompleted);
		oModel.attachBatchRequestFailed(oEventHandlers.batchFailed);
		oModel.attachBatchRequestSent(oEventHandlers.batchSent);
		oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
		oModel.attachRequestFailed(oEventHandlers.requestFailed);
		oModel.attachRequestSent(oEventHandlers.requestSent);
		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 500: "
					+ "POST /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$batch",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Complete $batch fails with a technical error and the response has Content-Type
	// "text/plain": A persistent, generic UI message is created to show the issue on the UI.
	// BCP: 002075129500003079342020
	QUnit.test("$batch error handling: complete batch fails, plain error", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text text="{SalesOrderID}" />\
</Table>';

		this.mock(sap.ui.getCore().getLibraryResourceBundle()).expects("getText")
			.atLeast(1)
			.callsFake(function (sKey, aArgs) {
				return sKey;
			});
		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet?$skip=0&$top=100"
			}, {
				body : "A plain error text",
				crashBatch : true,
				headers : {
					"Content-Type" : "text/plain;charset=utf-8"
				},
				statusCode : 503
			})
			.expectMessages([{
				code : "",
				description : "A plain error text",
				descriptionUrl : "",
				fullTarget : "",
				message : "CommunicationError",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 503: POST /SalesOrderSrv/$batch",
				sinon.match.instanceOf(Error), sODataMessageParserClassName);

		oModel.setMessageScope(MessageScope.BusinessObject);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Message with empty target (tested as single request and as batch request)
[false, true].forEach(function (bUseBatch) {
	QUnit.test("Messages: empty target (useBatch=" + bUseBatch + ")", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : bUseBatch}),
			oResponseMessage = this.createResponseMessage(""),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		if (bUseBatch) {
			this.expectHeadRequest();
		}

		this.expectRequest("SalesOrderSet('1')", {SalesOrderID : "1"},
				{"sap-message" : getMessageHeader(oResponseMessage)})
			.expectValue("id", "1")
			.expectMessage(oResponseMessage, "/SalesOrderSet('1')");

		// code under test
		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: Message with a simple target in a complex data type
	// JIRA: CPOUI5MODELS-35
	QUnit.test("Messages: simple target with complex data type", function (assert) {
		var oResponseMessage = this.createResponseMessage("Address/City", "Foo"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'1\')}">\
	<Text id="CompanyName" text="{CompanyName}" />\
	<Input id="City" value="{Address/City}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('1')", {
				CompanyName : "SAP SE",
				Address : {
					City : "Walldorf"
				}
			}, {"sap-message" : getMessageHeader(oResponseMessage)})
			.expectValue("CompanyName", "SAP SE")
			.expectValue("City", "Walldorf")
			.expectMessage(oResponseMessage,"/BusinessPartnerSet('1')/");

		// code under test
		return this.createView(assert, sView).then(function () {
			return that.checkValueState(assert, "City", "Error", "Foo");
		});
	});

	//*********************************************************************************************
	// Scenario: Messages with a http status code of 4xx/5xx are expected to be technical
	// JIRA: CPOUI5MODELS-103
[
	{message : "Bad Request", statusCode : 400},
	{message : "Internal Server Error", statusCode : 500}
].forEach(function (oFixture) {
	var sTitle = "Messages: http status code '" + oFixture.statusCode + "' expects a technical "
			+ "error message";

	QUnit.test(sTitle , function (assert) {
		var sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text text="{SalesOrderID}" />\
</FlexBox>';

		this.oLogMock.expects("error").once();

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", createErrorResponse(oFixture))
			.expectMessages([{
				code : "UF0",
				fullTarget : "/SalesOrderSet('1')",
				message : oFixture.message,
				persistent : false,
				technical : true,
				target : "/SalesOrderSet('1')",
				type : MessageType.Error
			}]);

		// code under test
		return this.createView(assert, sView);
	});
});

	//*********************************************************************************************
	// Scenario: Error responses that contain messages within the response body (technical messages)
	// will not process any messages if the http status code is <400.
	// JIRA: CPOUI5MODELS-103
	QUnit.test("Messages: messages within a response body are not processed if http status code is "
			+ "'200'", function (assert) {
		var sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text text="{SalesOrderID}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", createErrorResponse({statusCode : 200}))
			.expectMessages([]); // clean all expected messages

		// code under test
		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: Messages are bound against targets with a deeper path (more than one navigation
	// property). Tested with simple type (productName) and complex type (supplierAddress).
	// JIRA: CPOUI5MODELS-103
	QUnit.test("Messages: more than one navigation property", function (assert) {
		var oMsgProductName = this.createResponseMessage("Name", "Foo"),
			oMsgSupplierAddress = this.createResponseMessage("Address/City", "Bar", "warning"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderId" text="{SalesOrderID}" />\
	<Table id="table" items="{ToLineItems}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
	</Table>\
</FlexBox>\
<FlexBox id="detailProduct" binding="{ToProduct}">\
	<Input id="productName" value="{Name}" />\
</FlexBox>\
<FlexBox id="detailSupplier" binding="{ToSupplier}">\
	<Input id="supplierAddress" value="{Address/City}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
				results : [{
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					SalesOrderID : "1",
					ItemPosition : "10"
				}, {
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					SalesOrderID : "1",
					ItemPosition : "20"
				}]
			})
			.expectChange("salesOrderId", null)
			.expectChange("salesOrderId", "1")
			.expectChange("itemPosition", ["10", "20"])
			.expectChange("productName", null) // expect a later change
			.expectChange("supplierAddress", null); // expect a later change

		// code under test
		return this.createView(assert, sView).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						+ "/ToProduct"
				}, {
					__metadata : {
						uri : "ProductSet('P1')"
					},
					ProductID : "P1",
					Name : "Product 1"
				}, {"sap-message" : getMessageHeader(oMsgProductName)})
				.expectChange("productName", "Product 1")
				.expectMessage(oMsgProductName, "/ProductSet('P1')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')"
					+ "/ToProduct/");

			// code under test
			that.oView.byId("detailProduct").setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext()
			);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct"
						+ "/ToSupplier",
					requestUri : "ProductSet('P1')/ToSupplier"
				}, {
					__metadata : {
						uri : "BusinessPartnerSet('BP1')"
					},
					BusinessPartnerID : "BP1",
					Address : {
						City : "Walldorf"
					}
				}, {"sap-message" : getMessageHeader(oMsgSupplierAddress)})
				.expectChange("supplierAddress", "Walldorf")
				.expectMessage(oMsgSupplierAddress, "/BusinessPartnerSet('BP1')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')"
					+ "/ToProduct/ToSupplier/");

			// code under test
			that.oView.byId("detailSupplier").setBindingContext(
				that.oView.byId("detailProduct").getBindingContext()
			);

			return that.waitForChanges(assert);
		}).then(function () {
			return Promise.all([
				that.checkValueState(assert, "productName", "Error", "Foo"),
				that.checkValueState(assert, "supplierAddress", "Warning", "Bar")
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages are visualized at controls that are bound against the messages' target.
	// BCP: 2070436327: the data state is updated if unbindProperty is called
	QUnit.test("Messages: check value state", function (assert) {
		var oMsgGrossAmount = this.createResponseMessage("GrossAmount", "Foo", "warning"),
			oMsgNote = this.createResponseMessage("Note", "Bar"),
			that = this,
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="Note" value="{Note}" />\
	<Input id="GrossAmount" value="{GrossAmount}" />\
	<Input id="LifecycleStatusDescription" value="{LifecycleStatusDescription}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				GrossAmount : "GrossAmount A",
				LifecycleStatusDescription : "LifecycleStatusDescription A",
				Note : "Note A"
			}, {"sap-message" : getMessageHeader([oMsgNote, oMsgGrossAmount])})
			.expectValue("Note", "Note A")
			.expectValue("GrossAmount", "GrossAmount A")
			.expectValue("LifecycleStatusDescription", "LifecycleStatusDescription A")
			.expectMessage(oMsgNote, "/SalesOrderSet('1')/")
			.expectMessage(oMsgGrossAmount, "/SalesOrderSet('1')/");

		// code under test
		return this.createView(assert, sView).then(function () {
			return Promise.all([
				that.checkValueState(assert, "Note", "Error", "Bar"),
				that.checkValueState(assert, "GrossAmount", "Warning", "Foo"),
				that.checkValueState(assert, "LifecycleStatusDescription", "None", ""),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("Note", "");

			// code under test
			that.oView.byId("Note").unbindProperty("value");

			return Promise.all([
				that.checkValueState(assert, "Note", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages are not removed after refresh, if messages are flagged as persistent
	// (transient or transition)
	// JIRA: CPOUI5MODELS-35
[
	{
		bIsPersistent : true,
		sTarget : "Note",
		bTransient : true
	}, {
		bIsPersistent : true,
		sTarget : "Note",
		bTransition : true
	}, {
		bIsPersistent : true,
		sTarget : "/#TRANSIENT#Note"
	}, {
		bIsPersistent : false,
		sTarget : "Note"
	}
].forEach(function (oFixture) {
	var sTitle = "Messages: message is persistent=" + oFixture.bIsPersistent + " (transient="
			+ oFixture.bTransient + ", transition=" + oFixture.bTransition + ", target='"
			+ oFixture.sTarget + "')";

	QUnit.test(sTitle, function (assert) {
		var oExpectedMessage = {
				code : "code",
				fullTarget : "/SalesOrderSet('1')/Note",
				message : "Foo",
				persistent : oFixture.bIsPersistent,
				target : "/SalesOrderSet('1')/Note",
				type : MessageType.Error
			},
			that = this,
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1",
				Note : "NoteA"
			}, {
				"sap-message" : getMessageHeader({
					code : "code",
					message : "Foo",
					severity : "error",
					target : oFixture.sTarget,
					transient : oFixture.bTransient,
					transition : oFixture.bTransition
				})
			})
			.expectValue("note", "NoteA")
			.expectMessages([oExpectedMessage]);

		// code under test
		return this.createView(assert, sView).then(function () {
			return that.checkValueState(assert, "note", "Error", "Foo");
		}).then(function () {
			that.expectRequest("SalesOrderSet('1')", {
					SalesOrderID : "1",
					Note : "NoteB"
				})
				.expectValue("note", "NoteB")
				.expectMessages(oFixture.bIsPersistent ? [oExpectedMessage] : []);

			// code under test
			that.oModel.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return oFixture.bIsPersistent
				? that.checkValueState(assert, "note", "Error", "Foo")
				: that.checkValueState(assert, "note", "None", "");
		});
	});
});

	//*********************************************************************************************
	// Scenario: While refreshing a model or a binding, all messages belonging to that model or
	// binding have to be removed before new messages are reported.
	// BCP: 1970544211
	QUnit.test("Messages: refresh model or binding", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oMsgProductAViaSalesOrder = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='3')/ToProduct('A')/Name"),
			oMsgProductAViaSalesOrderItem = cloneODataMessage(oMsgProductAViaSalesOrder,
				"(SalesOrderID='1',ItemPosition='3')/ToProduct('A')/Name"),
			oMsgSalesOrder = this.createResponseMessage(""),
			oMsgSalesOrderToLineItems1 = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='1')/ItemPosition"),
			oMsgSalesOrderToLineItems3 = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='3')/ItemPosition"),
			oMsgSalesOrderItem1 = cloneODataMessage(oMsgSalesOrderToLineItems1,
				"(SalesOrderID='1',ItemPosition='1')/ItemPosition"),
			oMsgSalesOrderItem3 = cloneODataMessage(oMsgSalesOrderToLineItems3,
				"(SalesOrderID='1',ItemPosition='3')/ItemPosition"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
	<Table id="table" items="{ToLineItems}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				requestUri : "SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader([oMsgSalesOrder, oMsgSalesOrderToLineItems1])})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				results : [
					{SalesOrderID : "1", ItemPosition : "1"},
					{SalesOrderID : "1", ItemPosition : "2"}
				]
			}, {"sap-message" : getMessageHeader(oMsgSalesOrderItem1)})
			.expectChange("id", null)
			.expectChange("id", "1")
			.expectChange("itemPosition", ["1", "2"])
			.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')")
			.expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')",
					requestUri : "SalesOrderSet('1')",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					SalesOrderID : "1"
				}, {
					"sap-message" : getMessageHeader([
						oMsgSalesOrder,
						oMsgSalesOrderToLineItems3,
						// not in business object scope but service does not allow deeper navigation
						// path within the business object
						oMsgProductAViaSalesOrder
					])
				})
				.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					results : [
						{SalesOrderID : "1", ItemPosition : "2"},
						{SalesOrderID : "1", ItemPosition : "3"}
					]
				}, {
					"sap-message" : getMessageHeader([
						oMsgSalesOrderItem3,
						// not in business object scope but service does not allow deeper navigation
						// path within the business object
						oMsgProductAViaSalesOrderItem
					])
				})
				.expectChange("itemPosition", ["2", "3"])
				.expectMessages([]) // clean all expected messages
				.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')")
				.expectMessage(oMsgSalesOrderItem3, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oMsgProductAViaSalesOrderItem,
					{isComplete : true, path : "/ProductSet('A')/Name"},
					"/SalesOrderSet('1')/ToLineItems");

			// code under test
			that.oModel.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					results : [
						{SalesOrderID : "1", ItemPosition : "3"},
						{SalesOrderID : "1", ItemPosition : "4"}
					]
				})
				.expectChange("itemPosition", ["3", "4"])
				.expectMessages([]) // clean all expected messages
				.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')");

			// code under test
			that.oView.byId("table").getBinding("items").refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: While paging in a table messages for non-affected rows must not be removed.
	// BCP: 1970544211
	QUnit.test("Messages: paging", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oMsgProductA
				= this.createResponseMessage("(SalesOrderID='1',ItemPosition='1')/ToProduct/Name"),
			oMsgProductB
				= this.createResponseMessage("(SalesOrderID='1',ItemPosition='3')/ToProduct/Name"),
			oMsgSalesOrderItem1
				= this.createResponseMessage("(SalesOrderID='1',ItemPosition='1')/ItemPosition"),
			oMsgSalesOrderItem3
				= this.createResponseMessage("(SalesOrderID='1',ItemPosition='3')/ItemPosition"),
			sView = '\
<Table growing="true" growingThreshold="2" id="table"\
		items="{/SalesOrderSet(\'1\')/ToLineItems}">\
	<Text id="itemPosition" text="{ItemPosition}" />\
</Table>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				results : [
					{SalesOrderID : "1", ItemPosition : "1"},
					{SalesOrderID : "1", ItemPosition : "2"}
				]
			}, {
				"sap-message" : getMessageHeader([
					oMsgSalesOrderItem1,
					// not in business object scope but service does not allow deeper navigation
					// path within the business object
					oMsgProductA
				])
			})
			.expectChange("itemPosition", ["1", "2"])
			.expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(oMsgProductA, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=2&$top=2",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					results : [
						{SalesOrderID : "1", ItemPosition : "3"},
						{SalesOrderID : "1", ItemPosition : "4"}
					]
				}, {
					"sap-message" : getMessageHeader([
						oMsgSalesOrderItem3,
						// not in business object scope but service does not allow deeper navigation
						// path within the business object
						oMsgProductB
					])
				})
				.expectChange("itemPosition", ["3", "4"])
				.expectChange("itemPosition", ["3", "4"]) // TODO: why twice?
				.expectMessage(oMsgSalesOrderItem3, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oMsgProductB, "/SalesOrderLineItemSet",
						"/SalesOrderSet('1')/ToLineItems");

			// do paging
			that.oView.byId("table").requestItems();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh of navigation properties previously pointing to the *same* entity responds
	// with a different entity for one of the navigation properties. Both navigation properties show
	// correct data on the UI. The fixed bugs are:
	// (1) the unchanged navigation property is updated with data from the changed one
	// (2) the changed navigation property is not updated
	// BCP: 1980535595
	QUnit.test("BCP 1980535595: refresh navigation properties to same entity", function (assert) {
		var sAdminDataRequest =
				"C_WorkCenterGroupAdminvData(ObjectTypeCode='G',ObjectInternalID='10000425')",
			oModel = createPPWorkcenterGroupModel(),
			sWCGroupRequest = "C_WorkCenterGroupTree(HierarchyRootNode='10000425'"
				+ ",HierarchyParentNode='00000000',HierarchyNode='10000425',HierarchyNodeType='G')",
			sView = '\
<FlexBox id="objectPage" binding="{\
path : \'/C_WorkCenterGroupTree(HierarchyRootNode=\\\'10000425\\\',\
HierarchyParentNode=\\\'00000000\\\',HierarchyNode=\\\'10000425\\\',HierarchyNodeType=\\\'G\\\')\',\
parameters : {createPreliminaryContext : true, canonicalRequest : true, \
usePreliminaryContext : false}}">\
	<FlexBox binding="{path : \'to_AdminData\',\
			parameters : {usePreliminaryContext : true, createPreliminaryContext : false}}">\
		<Text id="id" text="{ObjectInternalID}" />\
		<FlexBox binding="{path :\'to_CreatedByUserContactCard\',\
				parameters : {select : \'FullName\', createPreliminaryContext : false,\
					usePreliminaryContext : false}\
			}">\
			<Text id="createdName" text="{FullName}" />\
		</FlexBox>\
	</FlexBox>\
	<FlexBox binding="{path : \'to_AdminData\',\
			parameters : {usePreliminaryContext : true, createPreliminaryContext : false}}">\
		<FlexBox binding="{path :\'to_LastChangedByUserContactCard\',\
				parameters : {select : \'FullName\', createPreliminaryContext : false,\
					usePreliminaryContext : false}\
			}">\
			<Text id="lastChangedName" text="{FullName}" />\
		</FlexBox>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest(sWCGroupRequest, {
				__metadata : {uri : "/" + sWCGroupRequest},
				HierarchyRootNode : "10000425",
				HierarchyParentNode : "00000000",
				HierarchyNode : "10000425",
				HierarchyNodeType : "G"
			})
			.expectRequest(sWCGroupRequest + "/to_AdminData", {
				__metadata : {uri : "/" + sAdminDataRequest},
				ObjectTypeCode : "G",
				ObjectInternalID : "10000425"
			})
			.expectRequest({
				deepPath : "/C_WorkCenterGroupTree(HierarchyRootNode='10000425',"
					+ "HierarchyParentNode='00000000',HierarchyNode='10000425',"
					+ "HierarchyNodeType='G')/to_AdminData/to_CreatedByUserContactCard",
				requestUri : sAdminDataRequest + "/to_CreatedByUserContactCard?$select=FullName"
			}, {
				__metadata : {uri : "/I_UserContactCard('Smith')"},
				FullName : "Smith"
			})
			.expectRequest({
				deepPath : "/C_WorkCenterGroupTree(HierarchyRootNode='10000425',"
					+ "HierarchyParentNode='00000000',HierarchyNode='10000425',"
					+ "HierarchyNodeType='G')/to_AdminData/to_LastChangedByUserContactCard",
				requestUri : sAdminDataRequest + "/to_LastChangedByUserContactCard?$select=FullName"
			}, {
				__metadata : {uri : "/I_UserContactCard('Smith')"},
				FullName : "Smith"
			})
			.expectValue("id", "10000425")
			.expectValue("createdName", "Smith")
			.expectValue("lastChangedName", "Smith");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(sWCGroupRequest, {
					__metadata : {uri : "/" + sWCGroupRequest},
					HierarchyRootNode : "10000425",
					HierarchyParentNode : "00000000",
					HierarchyNode : "10000425",
					HierarchyNodeType : "G"
				})
				.expectRequest(sWCGroupRequest + "/to_AdminData", {
					__metadata : {uri : "/" + sAdminDataRequest},
					ObjectTypeCode : "G",
					ObjectInternalID : "10000425"
				})
				.expectRequest({
					deepPath : "/C_WorkCenterGroupTree(HierarchyRootNode='10000425',"
						+ "HierarchyParentNode='00000000',HierarchyNode='10000425',"
						+ "HierarchyNodeType='G')/to_AdminData/to_CreatedByUserContactCard",
					requestUri : sAdminDataRequest + "/to_CreatedByUserContactCard?$select=FullName"
				}, {
					__metadata : {uri : "/I_UserContactCard('Smith')"},
					FullName : "Smith"
				})
				.expectRequest({
					deepPath : "/C_WorkCenterGroupTree(HierarchyRootNode='10000425',"
						+ "HierarchyParentNode='00000000',HierarchyNode='10000425',"
						+ "HierarchyNodeType='G')/to_AdminData/to_LastChangedByUserContactCard",
					requestUri : sAdminDataRequest
						+ "/to_LastChangedByUserContactCard?$select=FullName"
				}, {
					__metadata : {uri : "/I_UserContactCard('Muller')"},
					FullName : "Muller"
				})
				.expectValue("id", "")
				.expectValue("id", "10000425")
				.expectValue("createdName", "")
				.expectValue("createdName", "Smith")
				.expectValue("lastChangedName", "")
				.expectValue("lastChangedName", "Muller");

			// code under test: refresh keeps canonical path for "/I_UserContactCard('Smith')" in
			// ODataModel#mPathCache and does *not* replace it by "/I_UserContactCard('Muller')";
			// all other path cache entries for "to_LastChangedByUserContactCard" are adapted
			that.oView.byId("objectPage").getObjectBinding().refresh(/*bForceUpdate*/true);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Use reduced paths for the messages' full target path.
	// A modification of an item causes sideeffects on the header, so the item and the header data
	// need to be updated via a GET request on the item, using $expand for the header data.
	// The backend returns messages with a target relative to the item. So the targets for header
	// messages will contain partner navigation properties that have to be removed.
	// JIRA: CPOUI5MODELS-82
	QUnit.test("Use reduced paths for the messages' full target path", function (assert) {
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderGrossAmountError = this.createResponseMessage("GrossAmount"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="grossAmount" value="{GrossAmount}" />\
	<Table id="table" items="{ToLineItems}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="grossAmount::item" value="{GrossAmount}" />\
		<Input id="currencyCode" value="{CurrencyCode}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				__metadata : {uri : "SalesOrderSet('1')"},
				GrossAmount : "0.00",
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader(oSalesOrderGrossAmountError)})
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectChange("grossAmount", null)
			.expectChange("grossAmount", "0.00")
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					CurrencyCode : "EUR",
					GrossAmount : "0.00",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~"])
			.expectChange("grossAmount::item", ["0.00"])
			.expectChange("currencyCode", ["EUR"])
			.expectMessage(oSalesOrderGrossAmountError, "/SalesOrderSet('1')/");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("table").getItems()[0].getBindingContext(),
				oSalesOrderItemToHeaderGrossAmountError
					= that.createResponseMessage("ToHeader/GrossAmount");

			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						+ "?$expand=ToHeader"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					SalesOrderID : "1",
					ItemPosition : "10~0~",
					GrossAmount : "1000.00",
					ToHeader : {
						__metadata : {uri : "SalesOrderSet('1')"},
						SalesOrderID : "1",
						GrossAmount : "1000.00"
					}
				}, {"sap-message" : getMessageHeader(oSalesOrderItemToHeaderGrossAmountError)})
				.expectChange("grossAmount", "1000.00")
				.expectChange("grossAmount::item", ["1000.00"])
				.expectMessages([{
					code : oSalesOrderItemToHeaderGrossAmountError.code,
					fullTarget : "/SalesOrderSet('1')/GrossAmount",
					message : oSalesOrderItemToHeaderGrossAmountError.message,
					persistent : false,
					target : "/SalesOrderSet('1')/GrossAmount",
					type : mSeverityMap[oSalesOrderItemToHeaderGrossAmountError.severity]
				}]);

			// code under test
			oModel.read("", {
				context : oContext,
				urlParameters : {$expand : "ToHeader"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: The ODataModel#create API is called with an object (partially) retrieved via
	// ODataModel#getObject which may contain properties inside a __metadata property which are not
	// specified by OData so that a request would fail on the server. The request payload is
	// cleaned up before the request is sent.
	// BCP: 002075129400000695502020
	// BCP: 002075129500001965532020
	QUnit.test("create payload only contains cleaned up __metadata", function (assert) {
		var oModel = createSalesOrdersModel({tokenHandling : false}),
			sView = '\
<FlexBox binding="{path : \'/SalesOrderSet(\\\'1\\\')\',\
		parameters : {select : \'SalesOrderID,Note\', expand : \'ToLineItems\'}}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table id="table" items="{path : \'ToLineItems\',\
			parameters : {select : \'ItemPosition,Note,SalesOrderID\'}}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderSet('1')?$select=SalesOrderID%2cNote&$expand=ToLineItems", {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Note",
				SalesOrderID : "1",
				ToLineItems : {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						ItemPosition : "10~0~",
						Note : "ItemNote",
						SalesOrderID : "1"
					}]
				}
			})
			.expectChange("note", null)
			.expectChange("note", "Note")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectChange("itemPosition", ["10~0~"])
			.expectChange("note::item", ["ItemNote"]);

		return this.createView(assert, sView, oModel).then(function () {
			// avoid MERGE on property change
			oModel.setChangeGroups(
				{SalesOrderLineItem : {groupId : "never"}},
				{"*" : {groupId : "change"}}
			);
			oModel.setDeferredGroups(["change", "never"]);

			that.expectChange("note::item", "ItemNote Changed", 0);

			// code under test: leads to __metadata.deepPath being set in the item data
			oModel.setProperty("/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')/Note",
				"ItemNote Changed");

			return that.waitForChanges(assert);
		}).then(function () {
			var oData;

			that.expectRequest({
				created : true,
				data : {
					SalesOrderID : "2",
					ToLineItems : [{
						Note : "ItemNote Changed",
						__metadata : {
							uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
							// Note: Payload must not contain deepPath
						}
					}]
				},
				deepPath : "/SalesOrderSet",
				entityTypes : {
					"GWSAMPLE_BASIC.SalesOrder" : true
				},
				method : "POST",
				requestUri : "SalesOrderSet"
			});

			// code under test
			oData = oModel.getObject("/SalesOrderSet('1')", null,
				{select : "SalesOrderID,ToLineItems/Note", expand : "ToLineItems"});
			oModel.create("/SalesOrderSet", {SalesOrderID : "2", ToLineItems : oData.ToLineItems});
			oModel.submitChanges({groupId : "change"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Keep user input and validation error after updating an entity if entity data is
	// invalidated via <code>sap.ui.model.odata.v2.ODataModel#invalidateEntry</code> by the
	// application.
	// BCP: 2080018339
	QUnit.test("Keep user input and validation error after updating an entity", function (assert) {
		var oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				preliminaryContext : true,
				refreshAfterChange : true,
				// in batch mode the value state Error is lost after calling Binding#refresh
				useBatch : false
			}),
			oNoteInput,
			sView = '\
<FlexBox id="form" binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{\
			path : \'Note\',\
			type : \'sap.ui.model.odata.type.String\',\
			constraints : {maxLength : 3}\
		}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderSet('1')", {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Bar",
				SalesOrderID : "1"
			})
			.expectValue("note", "Bar")
			.expectValue("salesOrderID", "1");

		return this.createView(assert, sView, oModel).then(function () {
			oNoteInput = that.oView.byId("note");

			that.expectMessages([{
					code : undefined,
					descriptionUrl : undefined,
					fullTarget : "",
					message : "Enter a text with a maximum of 3 characters and spaces",
					persistent : false,
					target : oNoteInput.getId() + "/value",
					technical : false,
					type : "Error"
				}])
				.expectValue("note", "abcd");

			// code under test - produce a validation error
			oNoteInput.setValue("abcd");

			return that.waitForChanges(assert);
		}).then(function () {
			var oElementBinding = that.oView.byId("form").getElementBinding();

			that.expectRequest("SalesOrderSet('1')", {
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Bar",
					SalesOrderID : "1"
				});

			// code under test
			oModel.invalidateEntry(oElementBinding.getBoundContext());
			oElementBinding.refresh(true);

			return that.waitForChanges(assert);
		}).then(function () {
			// check validation error and current value on the UI
			that.checkValueState(assert, oNoteInput, "Error",
				"Enter a text with a maximum of 3 characters and spaces");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet('2')", {
					__metadata : {uri : "SalesOrderSet('2')"},
					// model value is not changed -> no change event is triggered for that property
					Note : "Bar",
					SalesOrderID : "2"
				})
				.expectValue("note", "Bar")
				.expectValue("salesOrderID", "2")
				.expectMessages([]);

			// code under test - rebinding the form causes cleanup of the validation error and the
			// user input
			that.oView.byId("form").bindObject("/SalesOrderSet('2')");

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test - check validation error and current value on the UI reverted
			that.checkValueState(assert, oNoteInput, "None", "");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. All the
	// sales order items are returned with the initial request. Check the lifecycle of stateful
	// OData messages.
	// Expectation: All messages for the sales order and all messages for the sales order items are
	// displayed. In case of message scope BusinessObject also messages for child entities are
	// displayed.
	// JIRA: CPOUI5MODELS-111
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (1), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItemNoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderToItemPositionError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ItemPosition"),
			oSalesOrderItemNoteError = cloneODataMessage(oSalesOrderToItemNoteError,
				"(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderItemPositionError = cloneODataMessage(oSalesOrderToItemPositionError,
				"(SalesOrderID='1',ItemPosition='10~0~')/ItemPosition"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItemNoteError, oSalesOrderToItemPositionError]
					: [oSalesOrderNoteError])
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~"])
			.expectChange("note::item", ["Bar"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderItemNoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItemPositionError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/");
		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. Only a
	// part of the sales order items is displayed after the initial load. After initial load trigger
	// paging to get more sales order items. Check the lifecycle of stateful OData messages.
	// Expectation: In case of message scope BusinessObject all messages for the sales order and all
	// messages for the sales order items are displayed. Also all messages for child entities are
	// displayed. In case of message scope RequestedObjects only the messages for the sales order
	// and the messages for the requested sales order items are displayed.
	// Paging must not remove messages of items that are already on the client. New messages for the
	// sales order items are added, if they are not yet contained in the message model.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (2) + (3), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30~2~')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30~2~')/Note"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table growing="true" growingThreshold="2" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItem10NoteError, oSalesOrderToItem30NoteError]
					: oSalesOrderNoteError)
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					Note : "Baz",
					ItemPosition : "20~1~",
					SalesOrderID : "1"
				}]
			}/*, { // message is not sent because of transitionMessagesOnly
				"sap-message" : getMessageHeader(oSalesOrderItem10NoteError)
			}*/)
			.expectChange("itemPosition", ["10~0~", "20~1~"])
			.expectChange("note::item", ["Bar", "Baz"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
				.expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");
		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=2&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~2~')"
					},
					Note : "Qux",
					ItemPosition : "30~2~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='40~3~')"
					},
					Note : "Quux",
					ItemPosition : "40~3~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", "30~2~", 2)
			.expectChange("itemPosition", "40~3~", 3)
			.expectChange("note::item", "Qux", 2)
			.expectChange("note::item", "Quux", 3);

			// do paging
			that.oView.byId("table").requestItems();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. Only a
	// part of the sales order items is displayed after the initial load. After initial load
	// user filters the list, that some entries are filtered out and some additional are displayed.
	// Check the lifecycle of stateful OData messages.
	// Expectation: In case of message scope "BusinessObject", the filter request must not delete
	// messages for entities that have been filtered out because the list is embedded into an
	// object page. The topmost entity is responsible for the message handling.
	// In case of message scope "Request", old messages are untouched, new messages are added.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (4), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/GrossAmount"),
			oSalesOrderToItem20GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20~1~')/GrossAmount"),
			oSalesOrderToItem30GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30~1~')/GrossAmount"),
			oSalesOrderItem10GrossAmountError
				= cloneODataMessage(oSalesOrderToItem10GrossAmountError,
					"(SalesOrderID='1',ItemPosition='10~0~')/GrossAmount"),
			oSalesOrderItem20GrossAmountError
				= cloneODataMessage(oSalesOrderToItem20GrossAmountError,
					"(SalesOrderID='1',ItemPosition='20~1~')/GrossAmount"),
			oSalesOrderItem30GrossAmountError
				= cloneODataMessage(oSalesOrderToItem30GrossAmountError,
					"(SalesOrderID='1',ItemPosition='30~1~')/GrossAmount"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table growing="true" growingThreshold="2" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="grossAmount" value="{GrossAmount}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItem10GrossAmountError, oSalesOrderToItem20GrossAmountError,
						oSalesOrderToItem30GrossAmountError]
					: oSalesOrderNoteError)
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					GrossAmount : "111.0",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					GrossAmount : "42.0",
					ItemPosition : "20~1~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~", "20~1~"])
			.expectChange("grossAmount", ["111.0", "42.0"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
				.expectMessage(oSalesOrderItem10GrossAmountError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem20GrossAmountError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem30GrossAmountError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");

		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function() {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					headers : bWithMessageScope
						? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
						: {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
						+ "&$filter=GrossAmount gt 100.0m"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						GrossAmount : "111.0",
						ItemPosition : "10~0~",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~1~')"
						},
						GrossAmount : "222.0",
						ItemPosition : "30~1~",
						SalesOrderID : "1"
					}]
				})
				.expectChange("itemPosition", "30~1~", 1)
				.expectChange("grossAmount", "222.0", 1);

			// Code under test
			that.oView.byId("table").getBinding("items").filter([new Filter({
				path : 'GrossAmount',
				operator : FilterOperator.GT,
				value1 : "100.0"
			})]);

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. There are
	// two lists for the sales order items with different filter values. After data is loaded user
	// refreshs one list and gets different data / messages. Check the lifecycle of stateful OData
	// messages.
	// Expectation: In case of message scope "BusinessObjects" all messages for the sales order
	// add all messages for the child entities of the sales order are displayed. Refreshing a list
	// must not remove messages for the other list. Refreshing the messages has to be triggered via
	// root entity of the object page.
	// In case of message scope "Request" only the messages for the sales order and all messages for
	// both item list are displayed.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (5) + (6), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/GrossAmount"),
			oSalesOrderToItem20GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20~0~')/GrossAmount"),
			oSalesOrderToItem30GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30~0~')/GrossAmount"),
			oSalesOrderItem10GrossAmountError
				= cloneODataMessage(oSalesOrderToItem10GrossAmountError,
					"(SalesOrderID='1',ItemPosition='10~0~')/GrossAmount"),
			oSalesOrderItem20GrossAmountError
				= cloneODataMessage(oSalesOrderToItem20GrossAmountError,
					"(SalesOrderID='1',ItemPosition='20~0~')/GrossAmount"),
			oSalesOrderItem30GrossAmountError
				= cloneODataMessage(oSalesOrderToItem30GrossAmountError,
					"(SalesOrderID='1',ItemPosition='30~0~')/GrossAmount"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table id="table1" items="{path : \'ToLineItems\', \
		parameters : {transitionMessagesOnly : true},\
		filters : {path : \'GrossAmount\', operator : \'GT\', value1 : \'100.0\'}\
	}">\
		<Text id="itemPosition1" text="{ItemPosition}" />\
		<Input id="grossAmount1" value="{GrossAmount}" />\
	</Table>\
	<Table id="table2" items="{path : \'ToLineItems\', \
		parameters : {transitionMessagesOnly : true},\
		filters : {path : \'GrossAmount\', operator : \'LE\', value1 : \'100.0\'}\
	}">\
		<Text id="itemPosition2" text="{ItemPosition}" />\
		<Input id="grossAmount2" value="{GrossAmount}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItem10GrossAmountError, oSalesOrderToItem20GrossAmountError,
						oSalesOrderToItem30GrossAmountError]
					: oSalesOrderNoteError)
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100&"
					+ "$filter=GrossAmount gt 100.0m"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					GrossAmount : "111.0",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition1", ["10~0~"])
			.expectChange("grossAmount1", ["111.0"])
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100&"
					+ "$filter=GrossAmount le 100.0m"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~0~')"
					},
					GrossAmount : "42.0",
					ItemPosition : "20~0~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition2", ["20~0~"])
			.expectChange("grossAmount2", ["42.0"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
				.expectMessage(oSalesOrderItem10GrossAmountError, {
					isComplete : true,
					path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						+ "/GrossAmount"
				}, "/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem20GrossAmountError, {
					isComplete : true,
					path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~0~')"
						+ "/GrossAmount"
				}, "/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem30GrossAmountError, {
					isComplete : true,
					path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')"
						+ "/GrossAmount"
				}, "/SalesOrderSet('1')/ToLineItems");
		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			// assume a sideeffect removed entity (SalesOrderID='1',ItemPosition='10~0~')
			// with refresh only the data and the messages for that data is updated
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					headers : bWithMessageScope
						? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
						: {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100&"
						+ "$filter=GrossAmount gt 100.0m"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')"
						},
						GrossAmount : "123.0",
						ItemPosition : "30~0~",
						SalesOrderID : "1"
					}]
				})
				.expectChange("itemPosition1", ["30~0~"])
				.expectChange("grossAmount1", ["123.0"]);

			// Code under test
			that.oView.byId("table1").getBinding("items").refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			// to update also the messages, the messages need to be read again via the root entity
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')",
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					requestUri : "SalesOrderSet('1')?$select=SalesOrderID"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					"sap-message" : getMessageHeader(bWithMessageScope
						? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
							oSalesOrderToItem20GrossAmountError,
							oSalesOrderToItem30GrossAmountError]
						: oSalesOrderNoteError)
				})
				.expectMessages([]) // clean all expected messages
				.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

			if (bWithMessageScope) {
				that.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
					.expectMessage(oSalesOrderItem20GrossAmountError, {
						isComplete : true,
						path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~0~')"
							+ "/GrossAmount"
					}, "/SalesOrderSet('1')/ToLineItems")
					.expectMessage(oSalesOrderToItem30GrossAmountError, {
							isComplete : true,
							path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')"
								+ "/GrossAmount"
						}, "/SalesOrderSet('1')/");
			}

			// code under test
			oModel.read("/SalesOrderSet('1')", {
				updateAggregatedMessages : true,
				urlParameters : {
					$select : "SalesOrderID"
				}
			});

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. Only a
	// part of the sales order items is displayed after the initial load. After initial load
	// sort the list and get other sales order items. Check the lifecycle of stateful OData
	// messages.
	// Expectation: In case of message scope BusinessObject all messages for the sales order and all
	// messages for the sales order items are displayed. Also all messages for child entities are
	// displayed. In case of message scope RequestedObjects only the messages for the sales order
	// and the messages for the requested sales order items are displayed.
	// Sorting must not remove messages of items, new messages for the sales order items are added,
	// if they are not yet contained in the message model.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (2) + (7), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30~0~')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30~0~')/Note"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table growing="true" growingThreshold="2" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItem10NoteError, oSalesOrderToItem30NoteError]
					: oSalesOrderNoteError)
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					Note : "Baz",
					ItemPosition : "20~1~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~", "20~1~"])
			.expectChange("note::item", ["Bar", "Baz"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
				.expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");

		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					headers : bWithMessageScope
						? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
						: {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
						+ "&$orderby=GrossAmount asc"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30~0~')"
						},
						Note : "Qux",
						ItemPosition : "30~0~",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='40~1~')"
						},
						Note : "Quux",
						ItemPosition : "40~1~",
						SalesOrderID : "1"
					}]
				})
				.expectChange("itemPosition", ["30~0~", "40~1~"])
				.expectChange("note::item", ["Qux", "Quux"]);

			// Code under test
			that.oView.byId("table").getBinding("items").sort(new Sorter("GrossAmount"));

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. Only a
	// part of the sales order items is displayed after the initial load. After initial load
	// modify first a sales order item and later the sales order itself to get rid of messages.
	// Check the lifecycle of stateful OData messages.
	// Expectation: In case of message scope BusinessObject all messages for the sales order and all
	// messages for the sales order items are displayed. Also all messages for child entities are
	// displayed. After modifying the entities the corresponding messages are removed.
	// In case of message scope RequestedObjects only the messages for the sales order and the
	// messages for the requested sales order items are displayed. After modifying the entities the
	// corresponding messages are removed.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
	// BCP: 1980510782
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (8), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({
				canonicalRequests : true,
				preliminaryContext : true,
				refreshAfterChange : false,
				useBatch : false
			}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30~0~')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30~0~')/Note"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table growing="true" growingThreshold="2" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItem10NoteError, oSalesOrderToItem10ToProductPriceError,
						oSalesOrderToItem30NoteError]
					: oSalesOrderNoteError)
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					Note : "Baz",
					ItemPosition : "20~1~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~", "20~1~"])
			.expectChange("note::item", ["Bar", "Baz"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
				.expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");
		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			var oItem10ToProductPriceError = cloneODataMessage(oSalesOrderItem10ToProductPriceError,
					"ToProduct/Price");

			that.expectChange("note::item", "Qux", 0)
				.expectHeadRequest(bWithMessageScope
					? {"sap-message-scope" : "BusinessObject"}
					: {})
				.expectRequest({
					data : {
						Note : "Qux",
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						}
					},
					deepPath :
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')",
					headers : bWithMessageScope
						? {"sap-message-scope" : "BusinessObject", "x-http-method" : "MERGE"}
						: {"x-http-method" : "MERGE"},
					key : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')",
					method : "POST",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
				}, NO_CONTENT, bWithMessageScope
					? {"sap-message" : getMessageHeader(oItem10ToProductPriceError)}
					: undefined
				)
				.expectMessages([]) // clean all expected messages
				.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

			if (bWithMessageScope) {
				that.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
					.expectMessage(oItem10ToProductPriceError,
						"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')/",
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/")
					.expectMessage(oSalesOrderItem30NoteError,
						"/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
			}

			// code under test - modify a sales order item
			oModel.setProperty(
				"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note",
				"Qux");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("note", "Quxx")
				.expectRequest({
					data : {
						Note : "Quxx",
						__metadata : {uri : "SalesOrderSet('1')"}
					},
					deepPath :
						"/SalesOrderSet('1')",
					headers : bWithMessageScope
						? {"sap-message-scope" : "BusinessObject", "x-http-method" : "MERGE"}
						: {"x-http-method" : "MERGE"},
					key : "SalesOrderSet('1')",
					method : "POST",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT, bWithMessageScope
					? {"sap-message" : getMessageHeader(oSalesOrderToItem30NoteError)}
					: undefined
				)
				.expectMessages([]) // clean all expected messages
				.expectMessage(bWithMessageScope ? oSalesOrderItem30NoteError : null,
					"/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");

			// code under test - modify the sales order
			oModel.setProperty("/SalesOrderSet('1')/Note", "Quxx");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. Only a
	// part of the sales order items is displayed after the initial load. After initial load
	// delete one entry from the list. Check the lifecycle of stateful OData messages.
	// Expectation: In case of message scope BusinessObject all messages for the sales order and all
	// messages for the sales order items are displayed. Also all messages for child entities are
	// displayed. After the deletion of an entity all messages for that entity and all its child
	// entities are removed.
	// In case of message scope RequestedObjects only the messages for the sales order and the
	// messages for the requested sales order items are displayed. After the deletion only the
	// messages for the deleted entity are removed.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	QUnit.test("Message lifecycle (10), scope: " + sMessageScope, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderToItem20NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20~1~')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderItem20NoteError = cloneODataMessage(oSalesOrderToItem20NoteError,
				"(SalesOrderID='1',ItemPosition='20~1~')/Note"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table growing="true" growingThreshold="2" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrderNoteError, oSalesOrderToBusinessPartnerAddress,
						oSalesOrderToItem10NoteError, oSalesOrderToItem10ToProductPriceError,
						oSalesOrderToItem20NoteError]
					: oSalesOrderNoteError)
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : bWithMessageScope
					? {"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"}
					: {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					Note : "Baz",
					ItemPosition : "20~1~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~", "20~1~"])
			.expectChange("note::item", ["Bar", "Baz"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			this.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
				.expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oSalesOrderItem20NoteError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");
		}
		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					deepPath :
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')",
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					method : "DELETE",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
				}, NO_CONTENT)
				// ODataModel#remove does not remove the item from the list. A refresh needs to be
				// triggered or refreshAfterChange has to be true to trigger refresh automatically
				.expectChange("itemPosition", undefined, 0)
				.expectChange("note::item", undefined, 0)
				.expectMessages([]) // clean all expected messages
				.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/")
				.expectMessage(bWithMessageScope ? oSalesOrderToBusinessPartnerAddress : null,
					"/SalesOrderSet('1')/")
				.expectMessage(bWithMessageScope ? oSalesOrderItem20NoteError : null,
					"/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");

			// code under test
			oModel.remove("", {
				context : that.oView.byId("table").getItems()[0].getBindingContext(),
				refreshAfterChange : false
			});
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: On a list report page a list of sales orders is displayed. Only a part of the sales
	// orders is displayed after the initial load. After the data is displayed trigger a refresh or
	// filter the list. Check the lifecycle of stateful OData messages.
	// Expectation: In case of message scope BusinessObject all messages for the sales orders and
	// all messages for their child entities are displayed. After the refresh/filtering all messages
	// for all sales orders and all their child entities are removed and replaced by the messages
	// contained in the response of the refresh/filter request.
	// In case of message scope RequestedObjects only the messages for the requested sales orders
	// are displayed. A refresh/filtering does not cause a deletion of messages for entities that
	// are not returned any more.
	// JIRA: CPOUI5MODELS-111, CPOUI5MODELS-112
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	[true, false].forEach(function (bFilter) {
	var sTitle = "Message lifecycle (11), scope: " + sMessageScope + ", bFilter: " + bFilter;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrder1NoteError = this.createResponseMessage("('1~0~')/Note"),
			oSalesOrder1ToBusinessPartnerAddress
				= this.createResponseMessage("('1~0~')/ToBusinessPartner/Address"),
			oSalesOrder2NoteError = this.createResponseMessage("('2~1~')/Note"),
			oSalesOrder2ToBusinessPartnerAddress
				= this.createResponseMessage("('2~1~')/ToBusinessPartner/Address"),
			sView = '\
<Table growing="true" growingThreshold="2" id="table" items="{/SalesOrderSet}">\
	<Input id="note" value="{Note}" />\
</Table>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1~0~')"},
					Note : "Foo",
					SalesOrderID : "1~0~"
				}, {
					__metadata : {uri : "SalesOrderSet('2~1~')"},
					Note : "Bar",
					SalesOrderID : "2~1~"
				}]
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrder1NoteError, oSalesOrder1ToBusinessPartnerAddress,
						oSalesOrder2NoteError, oSalesOrder2ToBusinessPartnerAddress]
					: [oSalesOrder1NoteError, oSalesOrder2NoteError])
			})
			.expectChange("note", ["Foo", "Bar"])
			.expectMessage(oSalesOrder1NoteError, "/SalesOrderSet")
			.expectMessage(bWithMessageScope ? oSalesOrder1ToBusinessPartnerAddress : null,
				"/SalesOrderSet")
			.expectMessage(oSalesOrder2NoteError, "/SalesOrderSet")
			.expectMessage(bWithMessageScope ? oSalesOrder2ToBusinessPartnerAddress : null,
				"/SalesOrderSet");

		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			var oSalesOrder3NoteError = that.createResponseMessage("('3~1~')/Note");

			that.expectRequest({
					deepPath : "/SalesOrderSet",
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					requestUri : "SalesOrderSet?$skip=0&$top=2"
						+ (bFilter ? "&$filter=GrossAmount gt 100.0m" : "")
				}, {
					results : [{
						__metadata : {uri : "SalesOrderSet('1~0~')"},
						Note : "Foo",
						SalesOrderID : "1~0~"
					},
					// "SalesOrderSet('2~1~')" has been filtered out, or in case of a refresh the
					// entity has been removed in meantime
					{
						__metadata : {
							uri : "SalesOrderSet('3~1~')"
						},
						Note : "Baz",
						SalesOrderID : "3~1~"
					}]
				}, {
					"sap-message" : getMessageHeader(bWithMessageScope
						? [oSalesOrder1NoteError, oSalesOrder1ToBusinessPartnerAddress,
							oSalesOrder3NoteError]
						: [oSalesOrder1NoteError, oSalesOrder3NoteError])
				})
				.expectChange("note", "Baz", 1)
				.expectMessages([]) // clean all expected messages
				.expectMessage(oSalesOrder1NoteError, "/SalesOrderSet")
				.expectMessage(bWithMessageScope ? oSalesOrder1ToBusinessPartnerAddress : null,
					"/SalesOrderSet")
				//TODO: MessageScope.RequestedObjects: how to get rid of messages of entities that
				// are removed from the list?
				.expectMessage(!bWithMessageScope ? oSalesOrder2NoteError : null, "/SalesOrderSet")
				.expectMessage(oSalesOrder3NoteError, "/SalesOrderSet");

			if (bFilter) {
				// code under test
				that.oView.byId("table").getBinding("items").filter([new Filter({
					path : 'GrossAmount',
					operator : FilterOperator.GT,
					value1 : "100.0"
				})]);
			} else {
				// code under test - somehow the data changed - refresh to get current data
				that.oView.byId("table").getBinding("items").refresh();
			}

			return that.waitForChanges(assert);
		});
	});
	});
});

	//*********************************************************************************************
	// Scenario: Show entity with sub entities in same business object. Both have massages. Refresh
	// of entity should also lead to update of aggregated messages for the sub entities.
	// JIRA: CPOUI5MODELS-151
	QUnit.test("ODataModel#createBindingContext with updateAggregatedMessages", function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10~0~')/Note"),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader(
					[oSalesOrderNoteError, oSalesOrderToItem10NoteError])
			})
			.expectValue("salesOrderID", "1")
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/")
			.expectMessage(oSalesOrderItem10NoteError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");
		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "SalesOrderSet('1')"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					"sap-message" : getMessageHeader([oSalesOrderNoteError])
				})
				.expectMessages([])
				.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

			// code under test
			that.oView.byId("form").getObjectBinding().refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. Only a
	// part of the sales order items are displayed. Some of the items have messages. Filter the
	// items table by entries having messages.
	// JIRA: CPOUI5MODELS-106
	// BCP: 2170093336: ensure that key predicates are decoded before creating message filter
	QUnit.test("Filter table by items with messages", function (assert) {
		var oModel = createSalesOrdersModelMessageScope({preliminaryContext : true}),
			oItemsBinding,
			oSalesOrderDeliveryStatusAndToItemError = this.createResponseMessage(
				["DeliveryStatus", "ToLineItems(SalesOrderID='1',ItemPosition='40~2~')/Quantity"]),
			oSalesOrderDeliveryStatusAndItemError =
				cloneODataMessage(oSalesOrderDeliveryStatusAndToItemError,
					"DeliveryStatus", ["(SalesOrderID='1',ItemPosition='40~2~')/Quantity"]),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToItemsError = this.createResponseMessage("ToLineItems"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderToItem20NoteWarning = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20~1~')/Note", undefined, "warning"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				["ToLineItems(SalesOrderID='1',ItemPosition='30%20~1~')/Note",
				 "ToLineItems(SalesOrderID='1',ItemPosition='30%20~1~')/GrossAmount"]),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderItem20NoteWarning = cloneODataMessage(oSalesOrderToItem20NoteWarning,
				"(SalesOrderID='1',ItemPosition='20~1~')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30%20~1~')/Note",
				["(SalesOrderID='1',ItemPosition='30%20~1~')/GrossAmount"]),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table growing="true" growingThreshold="2" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				batchNo : 1,
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader([
					oSalesOrderDeliveryStatusAndToItemError,
					oSalesOrderNoteError,
					oSalesOrderToItemsError,
					oSalesOrderToItem10ToProductPriceError,
					oSalesOrderToItem20NoteWarning,
					oSalesOrderToItem30NoteError
				])
			})
			.expectChange("note", null)
			.expectChange("note", "Foo")
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectRequest({
				batchNo : 1,
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers :
					{"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					Note : "Baz",
					ItemPosition : "20~1~",
					SalesOrderID : "1"
				}]
			})
			.expectChange("itemPosition", ["10~0~", "20~1~"])
			.expectChange("note::item", ["Bar", "Baz"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/")
			.expectMessage(oSalesOrderToItemsError, "/SalesOrderSet('1')/")
			.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(oSalesOrderItem20NoteWarning, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(oSalesOrderItem30NoteError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(oSalesOrderDeliveryStatusAndItemError,
				["/SalesOrderSet('1')/", "/SalesOrderLineItemSet"],
				["/SalesOrderSet('1')/", "/SalesOrderSet('1')/ToLineItems"]);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			function filterErrors(oMessage) {
				return oMessage.getType() === MessageType.Error;
			}

			// code under test
			oItemsBinding = that.oView.byId("table").getBinding("items");

			return oItemsBinding.requestFilterForMessages(filterErrors);
		}).then(function (oFilter) {
			that.expectRequest({
					batchNo : 2,
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					headers :
						{"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
						+ "&$filter=(SalesOrderID eq '1' and ItemPosition eq '40~2~')"
						+ " or (SalesOrderID eq '1' and ItemPosition eq '10~0~')"
						+ " or (SalesOrderID eq '1' and ItemPosition eq '30 ~1~')"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						Note : "Bar",
						ItemPosition : "10~0~",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30%20~1~')"
						},
						Note : "Qux",
						ItemPosition : "30 ~1~",
						SalesOrderID : "1"
					}]
				})
				.expectChange("itemPosition", "30 ~1~", 1)
				.expectChange("note::item", "Qux", 1);

			oItemsBinding.filter(oFilter);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: On an object page a carrier with its flights is displayed. Only a part of the
	// flights are displayed. All of the flights have messages. Use client-side-filtering to filter
	// the flights table by entries with "warning" messages.
	// JIRA: CPOUI5MODELS-106
	QUnit.test("Filter table by items with messages - client side filtering", function (assert) {
		var oItemsBinding,
			oModel = createRMTSampleFlightModel({defaultOperationMode : "Client"}),
			oCarrierToFlight10PriceError = this.createResponseMessage(
				"carrierFlights(carrid='1',connid='10~0~',"
				+ "fldate=datetime'2015-05-30T13:47:26.253')/PRICE"),
			oCarrierToFlight20PriceWarning = this.createResponseMessage(
				"carrierFlights(carrid='1',connid='20~0~',"
				+ "fldate=datetime'2015-06-30T13:47:26.253')/PRICE", undefined, "warning"),
			oFlight10PriceError = cloneODataMessage(oCarrierToFlight10PriceError,
				"(carrid='1',connid='10~0~',fldate=datetime'2015-05-30T13:47:26.253')/PRICE"),
			oFlight20PriceWarning = cloneODataMessage(oCarrierToFlight20PriceWarning,
				"(carrid='1',connid='20~0~',fldate=datetime'2015-06-30T13:47:26.253')/PRICE"),
			sView = '\
<FlexBox binding="{/CarrierCollection(\'1\')}">\
	<Text id="carrierID" text="{carrid}" />\
	<Table growing="true" growingThreshold="1" id="table" items="{\
			path : \'carrierFlights\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="connectionID" text="{connid}" />\
		<Text id="flightDate" text="{\
			path:\'fldate\',\
			type: \'sap.ui.model.odata.type.DateTime\',\
			formatOptions: {style : \'short\', UTC : true}\
		}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/CarrierCollection('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "CarrierCollection('1')"
			}, {
				__metadata : {uri : "CarrierCollection('1')"},
				carrid : "1"
			}, {
				"sap-message" : getMessageHeader([
					oCarrierToFlight10PriceError,
					oCarrierToFlight20PriceWarning
				])
			})
			.expectChange("carrierID", null)
			.expectChange("carrierID", "1")
			.expectRequest({
				deepPath : "/CarrierCollection('1')/carrierFlights",
				headers :
					{"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"},
				requestUri : "CarrierCollection('1')/carrierFlights"
			}, {
				results : [{
					__metadata : {
						uri : "FlightCollection(carrid='1',connid='10~0~',"
							+ "fldate=datetime'2015-05-30T13:47:26.253')"
					},
					carrid : "1",
					connid : "10~0~",
					fldate : new Date(1432993646253)
				}, {
					__metadata : {
						uri : "FlightCollection(carrid='1',connid='20~0~',"
							+ "fldate=datetime'2015-06-30T13:47:26.253')"
					},
					carrid : "1",
					connid : "20~0~",
					fldate : new Date(1435672046253)
				}]
			})
			.expectChange("connectionID", ["10~0~"])
			.expectChange("flightDate", ["5/30/15, 1:47 PM"])
			.expectMessage(oFlight10PriceError, "/FlightCollection",
				"/CarrierCollection('1')/carrierFlights")
			.expectMessage(oFlight20PriceWarning, "/FlightCollection",
				"/CarrierCollection('1')/carrierFlights");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			oItemsBinding = that.oView.byId("table").getBinding("items");

			// code under test
			return oItemsBinding.requestFilterForMessages(function (oMessage) {
				return oMessage.getType() === MessageType.Warning;
			});
		}).then(function (oFilter) {
			that.expectChange("connectionID", ["20~0~"])
				.expectChange("flightDate", ["6/30/15, 1:47 PM"]);

			oItemsBinding.filter(oFilter);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Data state of a list binding is up to date after initialization and after a
	// relative list binding changes its context.
	// BCP: 2070113436, 2070134258
	QUnit.test("ODataListBinding: Correct data state after initialization or context switch",
			function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oItemsBinding,
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Table growing="true" growingThreshold="20" id="table" items="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true},\
			templateShareable : true\
		}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
		<Input id="note::item" value="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader([oSalesOrderToItem10ToProductPriceError])
			})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers :
					{"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=20"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}]
			})
			.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			oItemsBinding = that.oView.byId("table").getBinding("items");

			// data state is up to date after changing the context for undefined to new context
			assert.strictEqual(oItemsBinding.getDataState().getMessages().length, 1);

			return that.waitForChanges(assert);
		}).then(function (oFilter) {
			var oTable = that.oView.byId("table"),
				oBindingInfo = oTable.getBindingInfo("items");

			oTable.unbindAggregation("items");

			assert.strictEqual(oTable.getItems().length, 0);

			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					headers :
						{"sap-message-scope" : "BusinessObject", "sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=20"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						Note : "Bar",
						ItemPosition : "10~0~",
						SalesOrderID : "1"
					}]
				});

			// code under test - rebind the table; consider already available messages
			oTable.bindItems(oBindingInfo);

			return that.waitForChanges(assert);
		}).then(function () {
			oItemsBinding = that.oView.byId("table").getBinding("items");

			// messages returned in the request for the sales order are considered after
			// initializing the binding
			assert.strictEqual(oItemsBinding.getDataState().getMessages().length, 1);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Create two new entities and reload the collection in the same $batch. Test the
	// successfully creation and the creation of the first entity fails which leads to single error
	// response for the changeset. Ensure that test framework processes the requests as expected.
	// JIRA: CPOUI5MODELS-198
[{
	aExpectedMessages : [],
	aResponses : [{ // 1st create
		data : {
			__metadata : {uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"},
			ItemPosition : "10",
			SalesOrderID : "1"
		},
		statusCode : 201
	}, { // 2nd create
		data : {
			__metadata : {uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"},
			ItemPosition : "20",
			SalesOrderID : "1"
		},
		statusCode : 201
	}, { // read all items
		results : [{
			__metadata : {uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"},
			ItemPosition : "10",
			Note : "Foo",
			SalesOrderID : "1"
		}, {
			__metadata : {
				uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
			},
			ItemPosition : "20",
			Note : "Bar",
			SalesOrderID : "1"
		}]
	}],
	sTitle : "Successfully create 2 entities"
}, {
	aExpectedMessages : [{
		code : "UF0",
		descriptionUrl : "",
		fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
		message : "Internal Server Error",
		persistent : false,
		target : "/SalesOrderLineItemSet('~key~')",
		technical : true,
		type : "Error"
	}, {
		code : "UF0",
		descriptionUrl : "",
		fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
		message : "Internal Server Error",
		persistent : false,
		target : "/SalesOrderLineItemSet('~key~')",
		technical : true,
		type : "Error"
	}],
	aResponses : [createErrorResponse(), undefined/*no response needed*/, {results : []}],
	sTitle : "Create 2 entities with error response"
}].forEach(function (oFixture) {
	QUnit.test("ODataModel#createEntry: " + oFixture.sTitle, function (assert) {
		var oContext,
			oModel = createSalesOrdersModelMessageScope({canonicalRequests : true}),
			bWithError = oFixture.aExpectedMessages.length > 0,
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			var oEventHandlers = {
					requestCompleted : function () {},
					requestFailed : function () {}
				};

			that.expectHeadRequest()
				.expectRequest({
					batchNo : 1,
					created : true,
					data : {
						__metadata : {
							type : "gwsample_basic.SalesOrderLineItem"
						}
					},
					deepPath : "/SalesOrderSet('1')/ToLineItems('~key~')",
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, oFixture.aResponses[0])
				.expectRequest({
					batchNo : 1,
					created : true,
					data : {
						__metadata : {
							type : "gwsample_basic.SalesOrderLineItem"
						}
					},
					deepPath : "/SalesOrderSet('1')/ToLineItems('~key~')",
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, oFixture.aResponses[1])
				.expectRequest({
					batchNo : 1,
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, oFixture.aResponses[2])
				.expectMessages(oFixture.aExpectedMessages);
			if (bWithError) {
				that.oLogMock.expects("error").twice()
					.withExactArgs("Request failed with status code 500: "
							+ "POST SalesOrderSet('1')/ToLineItems",
						/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			}

			// don't care about passed arguments
			that.mock(oEventHandlers).expects("requestCompleted").exactly(3);
			that.mock(oEventHandlers).expects("requestFailed").exactly(bWithError ? 2 : 0);
			oModel.attachRequestCompleted(oEventHandlers.requestCompleted);
			oModel.attachRequestFailed(oEventHandlers.requestFailed);

			// code under test
			oContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {properties : {}});

			assert.strictEqual(oContext.isTransient(), true);

			// code under test
			oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {properties : {}});

			oModel.read("/SalesOrderSet('1')/ToLineItems", {groupId : "changes"});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oContext.isTransient(), bWithError ? true : false);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Create a new entity and immediately reset all changes or call deleteCreatedEntry.
	// The created entity is deleted and no request is sent.
	// JIRA: CPOUI5MODELS-198
	QUnit.test("ODataModel#createEntry: discard created entity", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			that = this;

		return this.createView(assert, /*sView*/"", oModel).then(function () {
			// code under test
			oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {properties : {}});

			// code under test
			oModel.resetChanges();

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			var oContext;

			// code under test
			oContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {properties : {}});

			// code under test
			oModel.deleteCreatedEntry(oContext);
		});
	});

	//*********************************************************************************************
	// Scenario: The creation (POST) of a new entity leads to an automatic expand of the given
	// navigation properties (GET) within the same $batch. If the creation fails, the POST request
	// and the corresponding GET request for the expansion of the navigation properties are repeated
	// with the next call of submitBatch.
	// JIRA: CPOUI5MODELS-198
	QUnit.test("createEntry: automatic expand of navigation properties", function (assert) {
		var iBatchNo = 1,
			oCreatedContext,
			oGETRequest = {
				deepPath : "/$~key~",
				requestUri : "$~key~?$expand=ToProduct&$select=ToProduct"
			},
			oModel = createSalesOrdersModelMessageScope({canonicalRequests : true}),
			oNoteError = this.createResponseMessage("Note"),
			oPOSTRequest = {
				created : true,
				data : {
					__metadata : {
						type : "gwsample_basic.SalesOrderLineItem"
					}
				},
				deepPath : "/SalesOrderSet('1')/ToLineItems('~key~')",
				headers : {"Content-ID": "~key~", "sap-messages": "transientOnly"},
				method : "POST",
				requestUri : "SalesOrderSet('1')/ToLineItems"
			},
			sView = '\
<FlexBox id="productDetails"\
	binding="{path : \'ToProduct\', parameters : {select : \'Name\'}}">\
	<Text id="productName" text="{Name}" />\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oErrorGET = createErrorResponse({message : "GET failed", statusCode : 424}),
				oErrorPOST = createErrorResponse({message : "POST failed", statusCode : 400}),
				bHandlerCalled;

			function fnHandleError (oEvent) {
				var oResponse = oEvent.getParameter("response");

				if (!bHandlerCalled) {
					assert.strictEqual(oResponse.expandAfterCreateFailed, undefined);
					bHandlerCalled = true;
				} else {
					assert.strictEqual(oResponse.expandAfterCreateFailed, true);
					oModel.detachRequestFailed(fnHandleError);
				}
			}

			that.expectHeadRequest()
				.expectRequest(Object.assign({batchNo : iBatchNo}, oPOSTRequest), oErrorPOST)
				.expectRequest(Object.assign({batchNo : iBatchNo}, oGETRequest), oErrorGET)
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderLineItemSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			oModel.attachRequestFailed(fnHandleError);

			// code under test
			oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				expand : "ToProduct",
				properties : {}
			});

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: "
						+ "POST SalesOrderSet('1')/ToLineItems",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			that.oLogMock.expects("error")
				.withExactArgs(sinon.match(new RegExp("Request failed with status code 424: "
						+ "GET \\$id-\\d*-\\d*\\?\\$expand=ToProduct&\\$select=ToProduct")),
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			oModel.submitChanges();

			iBatchNo += 1;
			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest(Object.assign({batchNo : iBatchNo}, oPOSTRequest), {
					data : {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						SalesOrderID : "1"
					},
					statusCode : 201
				})
				.expectRequest(Object.assign({batchNo : iBatchNo}, oGETRequest), {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					ToProduct : {
						__metadata : {uri : "ProductSet(ProductID='P1')"},
						Name : "Product 1",
						ProductID : "P1"
					}
				}, {
					"sap-message" : getMessageHeader([oNoteError])
				})
				.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/");

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("productName", "Product 1");

			// code under test
			that.oView.byId("productDetails").setBindingContext(oCreatedContext);

			return that.waitForChanges(assert);
		}).then(function () {
			[
				"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
				"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/ToProduct",
				"/ProductSet(ProductID='P1')"
			].forEach(function (sPath) {
				var oData = oModel.getObject(sPath, null, {select : "Name"});

				assert.strictEqual(oData.Name, "Product 1", "getObject for " + sPath);
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: The creation (POST) of a new entity leads to an automatic expand of the given
	// navigation properties (GET) within the same $batch. If the creation fails, the response of
	// both the POST and the GET request contain error responses. If the response to the GET request
	// has the status code 424, we do not create a message.
	QUnit.test("createEntry: ignore status code 424 of GET in batch with POST", function (assert) {
		var oModel = createSalesOrdersModelMessageScope({canonicalRequests : true}),
			sView = '\
<FlexBox id="productDetails"\
	binding="{path : \'ToProduct\', parameters : {select : \'Name\'}}">\
	<Text id="productName" text="{Name}" />\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oErrorGET = createErrorResponse({message : "GET failed", statusCode : 424}),
				oErrorPOST = createErrorResponse({message : "POST failed", statusCode : 400}),
				oGETRequest = {
					deepPath : "/$~key~",
					requestUri : "$~key~?$expand=ToProduct&$select=ToProduct"
				},
				bHandlerCalled,
				oPOSTRequest = {
					created : true,
					data : {
						__metadata : {
							type : "gwsample_basic.SalesOrderLineItem"
						}
					},
					deepPath : "/SalesOrderSet('1')/ToLineItems('~key~')",
					headers : {"Content-ID": "~key~", "sap-messages": "transientOnly"},
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				};

			function fnHandleError (oEvent) {
				var oResponse = oEvent.getParameter("response");

				if (!bHandlerCalled) {
					assert.strictEqual(oResponse.expandAfterCreateFailed, undefined);
					bHandlerCalled = true;
				} else {
					assert.strictEqual(oResponse.expandAfterCreateFailed, true);
					oModel.detachRequestFailed(fnHandleError);
				}
			}

			that.expectHeadRequest()
				.expectRequest(oPOSTRequest, oErrorPOST)
				.expectRequest(oGETRequest, oErrorGET)
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderLineItemSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			oModel.attachRequestFailed(fnHandleError);

			// code under test
			oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				expand : "ToProduct",
				properties : {}
			});

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: "
						+ "POST SalesOrderSet('1')/ToLineItems",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			that.oLogMock.expects("error")
				.withExactArgs(sinon.match(new RegExp("Request failed with status code 424: "
						+ "GET \\$id-\\d*-\\d*\\?\\$expand=ToProduct&\\$select=ToProduct")),
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: The creation (POST) of a new entity leads to an automatic expand of the given
	// navigation properties within the same $batch. Calling resetChanges on the model removes also
	// the GET request for the automatic expansion of the given navigation properties.
	// JIRA: CPOUI5MODELS-198
	QUnit.test("createEntry: abort automatic expand of navigation properties", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			that = this;

		return this.createView(assert, /*sView*/"", oModel).then(function () {
			// code under test
			oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				expand : "ToProduct",
				properties : {}
			});

			// code under test
			oModel.resetChanges();
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: When the creation of a new entry is called on a collection and leads to messages in
	// the response header, the request's deepPath is modified by replacing the generic UID with the
	// responsed entity key predicate. The generic UID must not appear in the message's calculated
	// fullTarget.
	// BCP: 002028376600002197422020
	QUnit.test("createEntry: update deep path with resulting entity", function (assert) {
		var oModel = createSalesOrdersModel(),
			oNoteError = this.createResponseMessage("Note"),
			sView = '\
<FlexBox id="page">\
	<Input id="note" value="{Note}" />\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
					deepPath : "/SalesOrderLineItemSet('~key~')",
					method : "POST",
					requestUri : "SalesOrderLineItemSet"
				}, {
					data : {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "foo",
						SalesOrderID : "1"
					},
					statusCode : 201
				}, {
					location : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderLineItemSet"
						+ "(SalesOrderID='1',ItemPosition='10')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectValue("note", "foo")
				.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/");

			// code under test
			that.oView.byId("page").setBindingContext(
				oModel.createEntry("/SalesOrderLineItemSet", {properties : {}})
			);
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.checkValueState(assert, "note", "Error", oNoteError.message);
		});
	});

	//*********************************************************************************************
	// Scenario: When the creation of a new entry is called on a navigation property pointing to a
	// collection and leads to messages in the response header, the request's deepPath is modified
	// by replacing the generic UID with the responsed entity key predicate. The generic UID must
	// not appear in the message's calculated fullTarget.
	// BCP: 002028376600002197422020
	QUnit.test("createEntry: update deep path with resulting entity (deep)", function (assert) {
		var oModel = createSalesOrdersModel({refreshAfterChange : false}),
			oNoteError = this.createResponseMessage("Note"),
			sView = '\
<FlexBox binding="{path : \'/SalesOrderSet(\\\'1\\\')\',\
		parameters : {select : \'SalesOrderID,Note\', expand : \'ToLineItems\'}}">\
	<Text id="noteSalesOrder" text="{Note}" />\
	<Table id="table" items="{path : \'ToLineItems\',\
			parameters : {select : \'ItemPosition,Note,SalesOrderID\'}}">\
		<Text id="itemPosition" text="{ItemPosition}" />\
	</Table>\
</FlexBox>\
<FlexBox id="details">\
	<Input id="noteLineItem" value="{Note}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')?$select=SalesOrderID%2cNote&$expand=ToLineItems", {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "foo",
				SalesOrderID : "1",
				ToLineItems : {
					results : []
				}
			})
			.expectValue("noteSalesOrder", "foo");

		return this.createView(assert, sView, oModel).then(function () {
			var oNoteErrorCopy = cloneODataMessage(oNoteError,
					"(SalesOrderID='1',ItemPosition='10')/Note");

			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
					deepPath : "/SalesOrderSet('1')/ToLineItems('~key~')",
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, {
					data : {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10~0~",
						Note : "bar",
						SalesOrderID : "1"
					},
					statusCode : 201
				}, {
					location : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/SalesOrderSet('1')/ToLineItems"
						+ "(SalesOrderID='1',ItemPosition='10')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectValue("noteLineItem", "bar")
				.expectMessage(oNoteErrorCopy, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");

			// code under test
			that.oView.byId("details").setBindingContext(
				oModel.createEntry("ToLineItems", {
					context : that.oView.byId("table").getBindingContext(),
					properties : {}
				})
			);
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.checkValueState(assert, "noteLineItem", "Error", oNoteError.message);
		});
	});

	//*********************************************************************************************
	// Scenario: When createEntry is called on a navigation property the deep path of the request is
	// the same as the fullTarget of associated messages.
	// BCP: 002028376600002197422020
	QUnit.test("createEntry: no change of deep path for non-collections", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}" id="page">\
	<FlexBox id="details">\
		<Input id="name" value="{CompanyName}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			});

		return this.createView(assert, sView, oModel).then(function () {
			var oCompanyNameError = that.createResponseMessage("CompanyName");

			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.BusinessPartner"
						}
					},
					deepPath : "/SalesOrderSet('1')/ToBusinessPartner",
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToBusinessPartner"
				}, {
					data : {
						__metadata : {
							uri : "/BusinessPartnerSet('BP1')"
						},
						BusinessPartnerID : "BP1",
						CompanyName : "SAP"
					},
					statusCode : 201
				}, {
					location : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/BusinessPartnerSet('BP1')",
					"sap-message" : getMessageHeader(oCompanyNameError)
				})
				.expectValue("name", "SAP")
				.expectMessage(oCompanyNameError, "/BusinessPartnerSet('BP1')/",
					"/SalesOrderSet('1')/ToBusinessPartner/");

			// code under test
			that.oView.byId("details").setBindingContext(
				oModel.createEntry("ToBusinessPartner", {
					context : that.oView.byId("page").getBindingContext(),
					properties : {}
				})
			);
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Read an entity (SalesOrderLineItem) with an expand on a 0..1 navigation property
	// (ToProduct) plus an expand of a second 0..1 navigation property from the first one
	// (ToProduct/ToSupplier). Element bindings on the second navigation property have a valid
	// context (not null), so that relative bindings underneath hold data as expected.
	// BCP: 2070126588
	QUnit.test("BCP 2070126588: binding to nested 0..1 navigation property", function (assert) {
		var sView = '\
<FlexBox id="objectPage" binding="{\
path : \'/SalesOrderLineItemSet(SalesOrderID=\\\'0500000005\\\',ItemPosition=\\\'0000000010\\\')\',\
parameters : {expand : \'ToProduct,ToProduct/ToSupplier\',\
	select : \'SalesOrderID,ItemPosition,ToProduct/ProductID,\
ToProduct/ToSupplier/BusinessPartnerID\'}}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Text id="itemPosition" text="{ItemPosition}" />\
	<FlexBox binding="{path : \'ToProduct\', parameters : {expand : \'ToSupplier\',\
			select : \'ProductID,ToSupplier/BusinessPartnerID\'}}">\
		<Text id="productID" text="{ProductID}" />\
		<FlexBox binding="{path : \'ToSupplier\', parameters : {select : \'BusinessPartnerID\'}}">\
			<Text id="businessPartnerID" text="{BusinessPartnerID}" />\
		</FlexBox>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderLineItemSet"
					+ "(SalesOrderID='0500000005',ItemPosition='0000000010')"
					+ "?$expand=ToProduct%2cToProduct%2fToSupplier"
					+ "&$select=SalesOrderID%2cItemPosition%2cToProduct%2fProductID"
						+ "%2cToProduct%2fToSupplier%2fBusinessPartnerID", {
				SalesOrderID : "0500000005",
				ItemPosition : "0000000010",
				ToProduct : {
					__metadata : {
						uri : "/sap/opu/odata/sap/GWSAMPLE_BASIC/ProductSet('HT-1500')"
					},
					ProductID : "HT-1500",
					ToSupplier : {
						__metadata : {
							uri : "/sap/opu/odata/sap/GWSAMPLE_BASIC"
								+ "/BusinessPartnerSet('0100000069')"
						},
						BusinessPartnerID : "0100000069"
					}
				}
			})
			.expectValue("salesOrderID", "0500000005")
			.expectValue("itemPosition", "0000000010")
			.expectValue("productID", "HT-1500")
			.expectValue("businessPartnerID", "0100000069");

		return this.createView(assert, sView).then(function () {
			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: UI5 messages are not created with a target for unbound transition messages that are
	// sent without a target. The empty ("") target leads still to a target creation for UI5
	// messages.
	// JIRA: CPOUI5MODELS-153
["", undefined].forEach(function (sTarget) {
	[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	var sTitle = "Messages: unbound transition messages; target = '" + sTarget + "'; scope = "
			+ sMessageScope;

	QUnit.test(sTitle, function (assert) {
		var bIsBusinessObject = sMessageScope === MessageScope.BusinessObject,
			oErrorWithoutTarget = this.createResponseMessage(sTarget, undefined, undefined, true),
			bHasTarget = sTarget !== undefined || !bIsBusinessObject,
			sExpectedTarget = bHasTarget ? "/SalesOrderSet('1')" : "",
			oModel = createSalesOrdersModelMessageScope(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest(bIsBusinessObject ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bIsBusinessObject ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				SalesOrderID : "1",
				Note : "Foo"
			}, {
				"sap-message" : getMessageHeader(oErrorWithoutTarget)
			})
			.expectValue("note", "Foo")
			.expectMessages([{
				code : "code-0",
				fullTarget : sExpectedTarget,
				message : "message-0",
				persistent : true,
				target : sExpectedTarget,
				type : MessageType.Error
			}]);

		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel);
	});
	});
});

	//*********************************************************************************************
	// Scenario: The OData response of an updated entity contains changed __metadata (new ETag).
	// This must not lead to pending changes.
	// BCP: 2070060665
	QUnit.test("BCP 2070060665: Ignore __metadata while updating the changed entities",
			function (assert) {
		var oModel = createSalesOrdersModel({refreshAfterChange : false}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {
					etag : "W/\"2020-05-19T08:08:58.312Z\"",
					uri : "SalesOrderSet('1')"
				},
				Note : "Foo",
				SalesOrderID : "1"
			})
			.expectValue("note", "Foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					data : {
						__metadata : {
							etag : "W/\"2020-05-19T08:08:58.312Z\"",
							uri : "SalesOrderSet('1')"
						},
						Note : "Bar"
					},
					deepPath : "/SalesOrderSet('1')",
					headers : {
						"If-Match" : "W/\"2020-05-19T08:08:58.312Z\""
					},
					key : "SalesOrderSet('1')",
					method : "MERGE",
					requestUri : "SalesOrderSet('1')"
				}, {
					data : {
						__metadata : {
							etag : "W/\"2020-05-19T08:09:00.146Z\"",
							uri : "SalesOrderSet('1')"
						},
						Note : "Bar",
						SalesOrderID : "1"
					},
					headers : {etag : "W/\"2020-05-19T08:09:00.146Z\""},
					statusCode : 200
				})
				.expectValue("note", "Bar");

			// code under test
			oModel.setProperty("/SalesOrderSet('1')/Note", "Bar");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oModel.getPendingChanges(), {});
		});
	});

	//*********************************************************************************************
	// Scenario: Use latest ETag when sending a change request for an entity. Modify a property of
	// an entity and submit the changes. Before the request comes back, modify the property again
	// but wait with the submit until the response of the first modification is processed. The ETag
	// of that response has to be used when sending the second modification to the backend.
	// BCP: 2080271261
	QUnit.test("BCP 2080271261: Use latest ETag when sending a request", function (assert) {
		var oModel = createSalesOrdersModel({refreshAfterChange : false}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {
					etag : "InitialETag",
					uri : "SalesOrderSet('1')"
				},
				Note : "Foo",
				SalesOrderID : "1"
			})
			.expectValue("note", "Foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					data : {
						__metadata : {
							etag : "InitialETag",
							uri : "SalesOrderSet('1')"
						},
						Note : "Bar"
					},
					deepPath : "/SalesOrderSet('1')",
					headers : {
						"If-Match" : "InitialETag"
					},
					key : "SalesOrderSet('1')",
					method : "MERGE",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT, {
					etag : "ETagAfter1stModification"
				})
				.expectValue("note", "Bar");

			// code under test
			oModel.setProperty("/SalesOrderSet('1')/Note", "Bar");
			oModel.submitChanges();

			that.expectValue("note", "Baz");

			// code under test do a second modification but do not yet submit the change
			oModel.setProperty("/SalesOrderSet('1')/Note", "Baz");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					data : {
						__metadata : {
							etag : "ETagAfter1stModification",
							uri : "SalesOrderSet('1')"
						},
						Note : "Baz"
					},
					deepPath : "/SalesOrderSet('1')",
					headers : {
						"If-Match" : "ETagAfter1stModification"
					},
					key : "SalesOrderSet('1')",
					method : "MERGE",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT, {
					etag : "ETagAfter2ndModification"
				});

			// code under test
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.getObject("/SalesOrderSet('1')").__metadata.etag,
				"ETagAfter2ndModification");
		});
	});

	//*********************************************************************************************
	// Scenario: Child messages are cleared when an entity is removed.
	// BCP: 2070222122
	// JIRA: CPOUI5MODELS-79
[MessageScope.BusinessObject, MessageScope.RequestedObjects].forEach(function (sMessageScope) {
	var sTitle = "BCP 2070222122: cleanup child messages for #remove, scope: " + sMessageScope;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10~0~')/ToProduct/Price"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				batchNo : 1,
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			}, {
				"sap-message" : getMessageHeader([
					oSalesOrderNoteError,
					oSalesOrderToItem10ToProductPriceError
				])
			})
			.expectValue("salesOrderID", "1")
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/")
			.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					batchNo : 2,
					deepPath : "/SalesOrderSet('1')",
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					method : "DELETE",
					requestUri : "SalesOrderSet('1')"
				}, {})
				.expectValue("salesOrderID", "")
				.expectMessages([]);

			if (!bWithMessageScope) {
				that.expectMessage(oSalesOrderItem10ToProductPriceError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems");
			}

			// code under test
			oModel.remove("/SalesOrderSet('1')");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Messages with multiple targets are visualized at controls that are bound against
	// one the the messages' targets. The lifecycle of multi-targets messages is correct, i.e.
	// a new messages where one target matches the target of an existing messages leads to removal
	// of this existing message.
	// JIRA: CPOUI5MODELS-197
	QUnit.test("Messages with multiple targets: value state and lifecycle", function (assert) {
		var oMsgNoteAndGrossAmount = this.createResponseMessage(["Note", "GrossAmount"], "Foo",
				"warning"),
			oMsgGrossAmountAndLifecycleStatus = this.createResponseMessage(
				["Note", "LifecycleStatusDescription"], "Bar", "error"),
			that = this,
			sView = '\
<FlexBox id="objectPage" binding="{/SalesOrderSet(\'1\')}">\
	<Input id="Note" value="{Note}" />\
	<Input id="GrossAmount" value="{GrossAmount}" />\
	<Input id="LifecycleStatusDescription" value="{LifecycleStatusDescription}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				GrossAmount : "GrossAmount A",
				LifecycleStatusDescription : "LifecycleStatusDescription A",
				Note : "Note A"
			}, {"sap-message" : getMessageHeader(oMsgNoteAndGrossAmount)})
			.expectValue("Note", "Note A")
			.expectValue("GrossAmount", "GrossAmount A")
			.expectValue("LifecycleStatusDescription", "LifecycleStatusDescription A")
			.expectMessage(oMsgNoteAndGrossAmount, "/SalesOrderSet('1')/");

		// code under test
		return this.createView(assert, sView).then(function () {
			return Promise.all([
				that.checkValueState(assert, "Note", "Warning", "Foo"),
				that.checkValueState(assert, "GrossAmount", "Warning", "Foo"),
				that.checkValueState(assert, "LifecycleStatusDescription", "None", ""),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("SalesOrderSet('1')", {
					GrossAmount : "GrossAmount A",
					LifecycleStatusDescription : "LifecycleStatusDescription A",
					Note : "Note A"
				}, {"sap-message" : getMessageHeader(oMsgGrossAmountAndLifecycleStatus)})
				.expectMessage(oMsgGrossAmountAndLifecycleStatus, "/SalesOrderSet('1')/",
					undefined, /*bResetMessages*/ true);

			// code under test: refresh => new multi-target message removes old one
			that.oView.byId("objectPage").getObjectBinding().refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return Promise.all([
				that.checkValueState(assert, "Note", "Error", "Bar"),
				that.checkValueState(assert, "GrossAmount", "None", ""),
				that.checkValueState(assert, "LifecycleStatusDescription", "Error", "Bar")
			]);
		});
	});

	//*********************************************************************************************
	// The result of a FunctionImport returning a collection can be accessed via $result relative
	// to the returned context.
	// BCP: 2170085431, 2170084065
[
	{functionName : "allUserAssignmentsGET", method : "GET"},
	{functionName : "allUserAssignmentsPOST", method : "POST"}
].forEach(function (oFixture) {
	var sTitle = "ODataModel#callFunction: bind result ($result) to a list, using method "
			+ oFixture.method + " " + oFixture.functionName;

	QUnit.test(sTitle, function (assert) {
		var oFunctionHandle, fnResolve,
			oModel = createSpecialCasesModel({tokenHandling : false}),
			oRequestPromise = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			sView = '\
<t:Table id="table" rows="{path : \'$result\', templateShareable : true}" visibleRowCount="2">\
	<Text id="userId" text="{UserId}" />\
</t:Table>',
			that = this;

		this.expectValue("userId", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					"deepPath": "/" + oFixture.functionName,
					"headers": {},
					"method": oFixture.method,
					"requestUri": oFixture.functionName
				}, oRequestPromise);

			// code under test
			oFunctionHandle = oModel.callFunction("/" + oFixture.functionName,
				{method : oFixture.method});

			return oFunctionHandle.contextCreated();
		}).then(function (oContext) {
			var oTable = that.oView.byId("table"),
				oResponse = {
					statusCode : 200,
					data : {
						results : [{
							__metadata : {uri : "UserAssignments('User1')"},
							UserId : "User1"
						}, {
							__metadata : {uri : "UserAssignments('User2')"},
							UserId : "User2"
						}]
					}
				};

			that.oLogMock.expects("error").withExactArgs(sinon.match(function (sError) {
				return sError.startsWith("List Binding is not bound against a list for "
						+ "/allUserAssignments");
			}));

			// code under test
			oTable.setBindingContext(oContext);

			that.expectValue("userId", ["User1", "User2"]);

			// code under test - server data processed
			fnResolve(oResponse);

			return Promise.all([
				oRequestPromise,
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Messages returned by a function import for an entity contained in a relative
	// collection get the correct full target.
	// JIRA: CPOUI5MODELS-230
	QUnit.test("Messages: function import for relative list entry; w/ location", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oNoteError = this.createResponseMessage("('1')/Note"),
			oToItem10NoteError = this.createResponseMessage(
				"('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oItem10NoteError = cloneODataMessage(oToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'100\')}">\
	<Table items="{ToSalesOrders}">\
		<Text id="soID" text="{SalesOrderID}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')/ToSalesOrders",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}]
			}, {"sap-message" : getMessageHeader([oNoteError, oToItem10NoteError])})
			.expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders")
			.expectMessage(oItem10NoteError, "/SalesOrderLineItemSet",
				"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems")
			.expectChange("soID", "1");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oGrossAmountError = that.createResponseMessage("GrossAmount"),
				oToItem20QuantityError = that.createResponseMessage(
					"ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"),
				oItem20QuantityError = cloneODataMessage(oToItem20QuantityError,
					"(SalesOrderID='1',ItemPosition='20')/Quantity");

			that.expectRequest({
					deepPath : "/SalesOrder_Confirm",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='1'"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					location : "/SalesOrderSrv/SalesOrderSet('1')",
					"sap-message" : getMessageHeader([oGrossAmountError, oToItem20QuantityError])
				})
				.expectMessage(oGrossAmountError, "/SalesOrderSet('1')/",
					"/BusinessPartnerSet('100')/ToSalesOrders('1')/", true)
				.expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet",
					"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");

			oPromise = oModel.callFunction("/SalesOrder_Confirm", {
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					SalesOrderID : "1"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages returned by a function import for an entity contained in a relative
	// collection don't get the correct full target without a location header.
	// JIRA: CPOUI5MODELS-230
	QUnit.test("Messages: function import for relative list entry; no location", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oNoteError = this.createResponseMessage("('1')/Note"),
			oToItem10NoteError = this.createResponseMessage(
				"('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oItem10NoteError = cloneODataMessage(oToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'100\')}">\
	<Table items="{ToSalesOrders}">\
		<Text id="soID" text="{SalesOrderID}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')/ToSalesOrders",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}]
			}, {"sap-message" : getMessageHeader([oNoteError, oToItem10NoteError])})
			.expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders")
			.expectMessage(oItem10NoteError, "/SalesOrderLineItemSet",
				"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems")
			.expectChange("soID", "1");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oGrossAmountError = that.createResponseMessage("GrossAmount"),
				oToItem20QuantityError = that.createResponseMessage(
					"ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"),
				oItem20QuantityError = cloneODataMessage(oToItem20QuantityError,
					"(SalesOrderID='1',ItemPosition='20')/Quantity");

			that.expectRequest({
					deepPath : "/SalesOrder_Confirm",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='1'"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					"sap-message" : getMessageHeader([oGrossAmountError, oToItem20QuantityError])
				})
				.expectMessage(oGrossAmountError, "/SalesOrderSet('1')/",
					undefined, true)
				.expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectMessage(oItem10NoteError, "/SalesOrderLineItemSet",
					"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");

			oPromise = oModel.callFunction("/SalesOrder_Confirm", {
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					SalesOrderID : "1"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages returned by a function import for a single entity referenced by a
	// navigation property get the correct full target.
	// JIRA: CPOUI5MODELS-230
[false, true].forEach(function (bMultipleOccurrences) {
	var sTitle = "Messages: function import for a navigation property; bMultipleOccurrences = "
			+ bMultipleOccurrences;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oToBPCompanyNameError = this.createResponseMessage("ToBusinessPartner/CompanyName"),
			oCompanyNameError = cloneODataMessage(oToBPCompanyNameError, "CompanyName"),
			oToProductADescriptionError = this.createResponseMessage(
				"ToBusinessPartner/ToProducts('A')/Description"),
			oProductADescriptionError = cloneODataMessage(oToProductADescriptionError,
				"('A')/Description"),
			sFlexBox = '\
<FlexBox binding="{path : \'ToBusinessPartner\', parameters : {select : \'BusinessPartnerID\'}}">\
	<Text id="bpID0" text="{BusinessPartnerID}" />\
</FlexBox>\
			',
			sView = '\
<FlexBox binding="{path : \'/SalesOrderSet(\\\'1\\\')\', parameters : {\
	expand : \'ToBusinessPartner\', select : \'ToBusinessPartner/BusinessPartnerID\'}}">'
	+ sFlexBox + (bMultipleOccurrences ? sFlexBox.replace("bpID0", "bpID1") : "")
+ '</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')?$expand=ToBusinessPartner"
					+ "&$select=ToBusinessPartner%2fBusinessPartnerID"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1",
				ToBusinessPartner : {
					__metadata : {uri : "BusinessPartnerSet('100')"},
					BusinessPartnerID : "100"
				}
			}, {
				"sap-message" : getMessageHeader([
					oToBPCompanyNameError, oToProductADescriptionError
				])
			})
			.expectMessage(oCompanyNameError, "/BusinessPartnerSet('100')/",
				"/SalesOrderSet('1')/ToBusinessPartner/")
			.expectMessage(oProductADescriptionError, "/ProductSet",
				"/SalesOrderSet('1')/ToBusinessPartner/ToProducts")
			.expectValue("bpID0", "100");

		if (bMultipleOccurrences) {
			this.expectValue("bpID1", "100");
		}

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oToProductBNameError = that.createResponseMessage("ToProducts('B')/Name"),
				oProductBNameError = cloneODataMessage(oToProductBNameError, "('B')/Name"),
				oWebAddressError = that.createResponseMessage("WebAddress");

			that.expectRequest({
					deepPath : "/BusinessPartner_Refresh",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "BusinessPartner_Refresh?BusinessPartnerID='100'"
				}, {
					__metadata : {uri : "BusinessPartnerSet('100')"},
					BusinessPartnerID : "100"
				}, {
					location : "/SalesOrderSrv/BusinessPartnerSet('100')",
					"sap-message" : getMessageHeader([oWebAddressError, oToProductBNameError])
				})
				.expectMessage(oWebAddressError,
					"/BusinessPartnerSet('100')/",
					"/SalesOrderSet('1')/ToBusinessPartner/", true)
				.expectMessage(oProductBNameError, "/ProductSet",
					"/SalesOrderSet('1')/ToBusinessPartner/ToProducts");

			oPromise = oModel.callFunction("/BusinessPartner_Refresh", {
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					BusinessPartnerID : "100"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	//TODO: Scenario: Messages returned by a function import for a different single entity
	// referenced by a navigation property does not yet get the correct full target. With feature
	// described in CPOUI5MODELS-230 we correct only the full target of messages for entities that
	// are already on the UI.
	// JIRA: CPOUI5MODELS-230
[false, true].forEach(function (bResultingEntityOnUI) {
	var sTitle = "Messages: function import returns different entity; bResultingEntityOnUI = "
			+ bResultingEntityOnUI;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oCompanyNameError = this.createResponseMessage("CompanyName"),
			oToProductADescriptionError = this.createResponseMessage("ToProducts('A')/Description"),
			oProductADescriptionError = cloneODataMessage(oToProductADescriptionError,
				"('A')/Description"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<FlexBox binding="{ToBusinessPartner}">\
		<Text id="bpID0" text="{BusinessPartnerID}" />\
	</FlexBox>\
</FlexBox>'
+ (bResultingEntityOnUI
	? '<FlexBox binding="{/ProductSet(\'Z\')}">\
		<FlexBox binding="{ToSupplier}">\
			<Text id="bpID1" text="{BusinessPartnerID}" />\
		</FlexBox>\
	</FlexBox>'
	: ''),
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToBusinessPartner",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')/ToBusinessPartner"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"},
				BusinessPartnerID : "100"
			}, {"sap-message" : getMessageHeader([oCompanyNameError, oToProductADescriptionError])})
			.expectMessage(oCompanyNameError,
				"/BusinessPartnerSet('100')/",
				"/SalesOrderSet('1')/ToBusinessPartner/")
			.expectMessage(oProductADescriptionError, "/ProductSet",
				"/SalesOrderSet('1')/ToBusinessPartner/ToProducts")
			.expectValue("bpID0", "100");
		if (bResultingEntityOnUI) {
			this.expectRequest({
					deepPath : "/ProductSet('Z')",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "ProductSet('Z')"
				}, {
					__metadata : {uri : "ProductSet('Z')"},
					ProductID : "Z"
				})
				.expectRequest({
					deepPath : "/ProductSet('Z')/ToSupplier",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "ProductSet('Z')/ToSupplier"
				}, {
					__metadata : {uri : "BusinessPartnerSet('200')"},
					BusinessPartnerID : "200"
				})
				.expectValue("bpID1", "200");
		}

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oToProductBNameError = that.createResponseMessage("ToProducts('B')/Name"),
				oProductBNameError = cloneODataMessage(oToProductBNameError, "('B')/Name"),
				oWebAddressError = that.createResponseMessage("WebAddress");

			that.expectRequest({
					deepPath : "/BusinessPartner_Refresh",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "BusinessPartner_Refresh?BusinessPartnerID='100'"
				}, {
					__metadata : {uri : "BusinessPartnerSet('200')"},
					BusinessPartnerID : "200"
				}, {
					location : "/SalesOrderSrv/BusinessPartnerSet('200')",
					"sap-message" : getMessageHeader([oWebAddressError, oToProductBNameError])
				})
				.expectMessage(oWebAddressError, "/BusinessPartnerSet('200')/")
				.expectMessage(oProductBNameError, "/ProductSet",
					"/BusinessPartnerSet('200')/ToProducts");

			oPromise = oModel.callFunction("/BusinessPartner_Refresh", {
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					BusinessPartnerID : "100"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Messages returned by a function import for a single entity with two different deep
	// paths on the UI cannot get automatically a correct full target. So the canonical path is used
	// as full target.
	// JIRA: CPOUI5MODELS-230
	QUnit.test("Messages: function import with same entity twice on UI", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oCompanyNameError = this.createResponseMessage("CompanyName"),
			oToProductADescriptionError = this.createResponseMessage("ToProducts('A')/Description"),
			oProductADescriptionError = cloneODataMessage(oToProductADescriptionError,
				"('A')/Description"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<FlexBox binding="{ToBusinessPartner}">\
		<Text id="bpID0" text="{BusinessPartnerID}" />\
	</FlexBox>\
</FlexBox>\
<FlexBox binding="{/ProductSet(\'Z\')}">\
	<FlexBox binding="{ToSupplier}">\
		<Text id="bpID1" text="{BusinessPartnerID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToBusinessPartner",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')/ToBusinessPartner"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"},
				BusinessPartnerID : "100"
			}, {"sap-message" : getMessageHeader([oCompanyNameError, oToProductADescriptionError])})
			// the same entity is returned with a different deep path in another request, so the old
			// messages are removed
			.expectValue("bpID0", "100")
			.expectRequest({
				deepPath : "/ProductSet('Z')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "ProductSet('Z')"
			}, {
				__metadata : {uri : "ProductSet('Z')"},
				ProductID : "Z"
			})
			.expectRequest({
				deepPath : "/ProductSet('Z')/ToSupplier",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "ProductSet('Z')/ToSupplier"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"},
				BusinessPartnerID : "100"
			}, {"sap-message" : getMessageHeader([oCompanyNameError, oToProductADescriptionError])})
			.expectMessage(oCompanyNameError,
				"/BusinessPartnerSet('100')/",
				"/ProductSet('Z')/ToSupplier/")
			.expectMessage(oProductADescriptionError, "/ProductSet",
				"/ProductSet('Z')/ToSupplier/ToProducts")
			.expectValue("bpID1", "100");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oToProductBNameError = that.createResponseMessage("ToProducts('B')/Name"),
				oProductBNameError = cloneODataMessage(oToProductBNameError, "('B')/Name"),
				oWebAddressError = that.createResponseMessage("WebAddress");

			that.expectRequest({
					deepPath : "/BusinessPartner_Refresh",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "BusinessPartner_Refresh?BusinessPartnerID='100'"
				}, {
					__metadata : {uri : "BusinessPartnerSet('100')"},
					BusinessPartnerID : "100"
				}, {
					location : "/SalesOrderSrv/BusinessPartnerSet('100')",
					"sap-message" : getMessageHeader([oWebAddressError, oToProductBNameError])
				})
				.expectMessage(oProductADescriptionError, "/ProductSet",
					"/ProductSet('Z')/ToSupplier/ToProducts", true)
				.expectMessage(oWebAddressError, "/BusinessPartnerSet('100')/")
				.expectMessage(oProductBNameError, "/ProductSet",
					"/BusinessPartnerSet('100')/ToProducts");

			oPromise = oModel.callFunction("/BusinessPartner_Refresh", {
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					BusinessPartnerID : "100"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Parameters of a function import are changed after calling ODataModel#callFunction
	// before submitting the changes (#submitChanges). The request URL contains the latest parameter
	// change and the messages get the correct target/fullTarget. Object for parameters does not
	// cause pending changes after the execution of the function import.
	// BCP: 2070289685, 2070333970
	// JIRA: CPOUI5MODELS-230
[
	{method: "GET", functionName : "/SalesOrder_Confirm_GET"},
	{method: "POST", functionName : "/SalesOrder_Confirm"}
].forEach(function (oFixture) {
	var sTitle = "Messages: function import with lazy parameter determination, method="
			+ oFixture.method;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({
				defaultBindingMode : "TwoWay",
				tokenHandling : false
			}),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'100\')}">\
	<Table items="{ToSalesOrders}">\
		<Text id="soID" text="{SalesOrderID}" />\
	</Table>\
</FlexBox>\
<FlexBox id="form">\
	<Input id="soIDParameter" value="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		this.expectRequest({
				deepPath : "/BusinessPartnerSet('100')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')/ToSalesOrders",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					SalesOrderID : "42"
				}]
			})
			.expectChange("soID", "42");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return Promise.all([
			oModel.callFunction(oFixture.functionName, {
				groupId : "changes",
				method : oFixture.method,
				refreshAfterChange : false,
				urlParameters : {
					SalesOrderID : "1"
				}
			}).contextCreated(),
			this.createView(assert, sView, oModel)
		]).then(function (aResults) {
			var oRequest = {
					deepPath : oFixture.functionName,
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : oFixture.method,
					requestUri : oFixture.functionName.slice(1) + "?SalesOrderID='42'"
				},
				oWebAddressError = that.createResponseMessage("WebAddress");

			if (oFixture.method === "POST") {
				oRequest.data = undefined;
			}

			that.expectRequest(oRequest, {
					__metadata : {uri : "SalesOrderSet('42')"},
					SalesOrderID : "42"
				}, {
					location : "/SalesOrderSrv/SalesOrderSet('42')",
					"sap-message" : getMessageHeader(oWebAddressError)
				})
				.expectMessage(oWebAddressError, "/SalesOrderSet('42')/",
					"/BusinessPartnerSet('100')/ToSalesOrders('42')/");

			that.oView.byId("form").setBindingContext(aResults[0]);
			that.oView.byId("soIDParameter").setValue("42");

			// code under test
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.hasPendingChanges(true), false);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Parameters of a function import are changed after calling ODataModel#callFunction
	// before submitting the changes (#submitChanges). The request URL contains the latest parameter
	// change and the messages get the correct target/fullTarget. Navigation properties are expanded
	// in the same $batch.
	// JIRA: CPOUI5MODELS-221
	QUnit.test("Messages: function import with expand and lazy parameters", function (assert) {
		var oModel = createSalesOrdersModelMessageScope({
				defaultBindingMode : "TwoWay",
				tokenHandling : false
			}),
			sView = '\
<FlexBox id="form">\
	<Input id="soIDParameter" value="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		oModel.setMessageScope(MessageScope.BusinessObject);

		return Promise.all([
			oModel.callFunction("/SalesOrder_Confirm", {
				expand : "ToLineItems",
				groupId : "changes",
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					SalesOrderID : "1"
				}
			}).contextCreated(),
			this.createView(assert, sView, oModel)
		]).then(function (aResults) {
			var oWebAddressError = that.createResponseMessage("WebAddress");

			that.expectRequest({
					batchNo : 1,
					data : undefined,
					deepPath : "/SalesOrder_Confirm",
					encodeRequestUri : false,
					headers : {
						"Content-ID": "~key~",
						"sap-message-scope" : "BusinessObject",
						"sap-messages": "transientOnly"
					},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='42'"
				}, {
					__metadata : {uri : "SalesOrderSet('42')"},
					SalesOrderID : "42"
				}, {
					location : "/SalesOrderSrv/SalesOrderSet('42')"
				})
				.expectRequest({
					batchNo : 1,
					deepPath : "/$~key~",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "$~key~?$expand=ToLineItems&$select=ToLineItems"
				}, {
					__metadata : {uri : "SalesOrderSet('42')"},
					ToLineItems : {
						results : [{
							__metadata : {
								uri : "SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')"
							},
							ItemPosition : "10",
							Note : "ItemNote",
							SalesOrderID : "42"
						}]
					}
				}, {
					"sap-message" : getMessageHeader(oWebAddressError)
				})
				.expectMessage(oWebAddressError, "/SalesOrderSet('42')/");

			that.oView.byId("form").setBindingContext(aResults[0]);
			that.oView.byId("soIDParameter").setValue("42");

			// code under test
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages returned by a function import get the correct full target by using the
	// given callback function adjustDeepPath. The framework is not able to determine the correct
	// deep path.
	// JIRA: CPOUI5MODELS-262
	QUnit.test("Messages: function import with callback function", function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Table items="{path : \'ToLineItems\', parameters : {transitionMessagesOnly : true}}">\
		<Text id="note" text="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : {
					"sap-message-scope" : "BusinessObject",
					"sap-messages" : "transientOnly"
				},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					ItemPosition : "10~0~",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", "Foo", 0);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oNoteError = that.createResponseMessage("Note"),
				oPromise;

			that.expectRequest({
					deepPath : "/LineItem_Create",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "LineItem_Create?SalesOrderID='1'"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					ItemPosition : "20~1~",
					Note : "Bar",
					SalesOrderID : "1"
				}, {
					location : "/SalesOrderSrv/"
						+ "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					headers : {
						"sap-message-scope" : "BusinessObject",
						"sap-messages" : "transientOnly"
					},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						ItemPosition : "10~0~",
						Note : "Foo",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
						},
						ItemPosition : "20~1~",
						Note : "Bar",
						SalesOrderID : "1"
					}]
				})
				.expectChange("note", "Bar", 1)
				.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20~1~')/");

			// code under test
			oPromise = oModel.callFunction("/LineItem_Create", {
				adjustDeepPath : function (mParameters) {
					assert.strictEqual(mParameters.deepPath,
						"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')");
					return "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20~1~')";
				},
				method : "POST",
				urlParameters : {
					SalesOrderID : "1"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages returned by a function import get the correct full target. The callback
	// function adjustDeepPath verifies that the ODataModel was able to calculate a correct deep
	// path based on given binding information. The callback function is used to overwrite the
	// calculated deep path due to the application's business logic. Exisiting messages for the
	// originally calculated deep path are not removed.
	// JIRA: CPOUI5MODELS-262
	QUnit.test("Messages: function import with callback function overrides calculated deepPath",
			function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oNoteError = this.createResponseMessage("('1')/Note"),
			oToItem10NoteError = this.createResponseMessage(
				"('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oItem10NoteError = cloneODataMessage(oToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'100\')}">\
	<Table items="{ToSalesOrders}">\
		<Text id="soID" text="{SalesOrderID}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('100')/ToSalesOrders",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}]
			}, {"sap-message" : getMessageHeader([oNoteError, oToItem10NoteError])})
			.expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders")
			.expectMessage(oItem10NoteError, "/SalesOrderLineItemSet",
				"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems")
			.expectChange("soID", "1");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oGrossAmountError = that.createResponseMessage("GrossAmount"),
				oPromise,
				oToItem20QuantityError = that.createResponseMessage(
					"ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"),
				oItem20QuantityError = cloneODataMessage(oToItem20QuantityError,
					"(SalesOrderID='1',ItemPosition='20')/Quantity");

			that.expectRequest({
					deepPath : "/SalesOrder_Confirm",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='1'"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					location : "/SalesOrderSrv/SalesOrderSet('1')",
					"sap-message" : getMessageHeader([oGrossAmountError, oToItem20QuantityError])
				})
				.expectMessage(oGrossAmountError, "/SalesOrderSet('1')/",
					"/BusinessPartnerSet('200')/ToSalesOrders('1')/", true)
				.expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet",
					"/BusinessPartnerSet('200')/ToSalesOrders('1')/ToLineItems")
				// oItem10NoteError is not removed because the value
				// SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10') is not an affected
				// target and prefix match does not match because BusinessPartner is updated to 200
				.expectMessage(oItem10NoteError, "/SalesOrderLineItemSet",
					"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");

			oPromise = oModel.callFunction("/SalesOrder_Confirm", {
				adjustDeepPath : function (mParameters) {
					assert.strictEqual(mParameters.deepPath,
						"/BusinessPartnerSet('100')/ToSalesOrders('1')");
					assert.strictEqual(mParameters.response.headers.location,
						"/SalesOrderSrv/SalesOrderSet('1')");
					return "/BusinessPartnerSet('200')/ToSalesOrders('1')";
				},
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					SalesOrderID : "1"
				}
			});

			return Promise.all([
				oPromise.contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: With the binding parameter <code>ignoreMessages</code> the application developer
	// can control whether messages are displayed at the control. It works for
	// <code>sap.ui.model.odata.ODataPropertyBinding</code>s and composite bindings containing such
	// bindings.
	// JIRA: CPOUI5MODELS-290
	QUnit.test("ODataPropertyBindings and CompositeBindings: ignoreMessages", function (assert) {
		var oNoteWarning = this.createResponseMessage("Note", "Foo", "warning"),
			sView = '\
<FlexBox id="objectPage" binding="{/SalesOrderSet(\'1\')}">\
	<Input id="Note0" value="{Note}" />\
	<Input id="Note1" value="{path : \'Note\', parameters : {ignoreMessages : false}}" />\
	<Input id="Note2" value="{path : \'Note\', parameters : {ignoreMessages : true}}" />\
	<Input id="Composite0" value="{= ${SalesOrderID} + ${value : \' - \'} + ${Note}}" />\
	<Input id="Composite1" value="{= ${SalesOrderID} + ${value : \' - \'} + ${\
			path : \'Note\',\
			parameters : {ignoreMessages : false}\
		}}" />\
	<Input id="Composite2" value="{= ${SalesOrderID} + ${value : \' - \'} + ${\
			path : \'Note\',\
			parameters : {ignoreMessages : true}\
		}}" />\
	<Input id="Composite3" value="{parts : [\'SalesOrderID\', {value : \'-\'}, {\
			path : \'Note\',\
			parameters : {ignoreMessages : false}\
		}]}" />\
	<Input id="Composite4" value="{parts : [\'SalesOrderID\', {value : \'-\'}, {\
			path : \'Note\',\
			parameters : {ignoreMessages : true}\
		}]}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				Note : "Note",
				SalesOrderID : '1'
			}, {"sap-message" : getMessageHeader(oNoteWarning)})
			.expectValue("Note0", "Note")
			.expectValue("Note1", "Note")
			.expectValue("Note2", "Note")
			.expectValue("Composite0", "null - null")
			.expectValue("Composite0", "1 - null")
			.expectValue("Composite0", "1 - Note")
			.expectValue("Composite1", "null - null")
			.expectValue("Composite1", "1 - null")
			.expectValue("Composite1", "1 - Note")
			.expectValue("Composite2", "null - null")
			.expectValue("Composite2", "1 - null")
			.expectValue("Composite2", "1 - Note")
			.expectValue("Composite3", " - ")
			.expectValue("Composite3", "1 - ")
			.expectValue("Composite3", "1 - Note")
			.expectValue("Composite4", " - ")
			.expectValue("Composite4", "1 - ")
			.expectValue("Composite4", "1 - Note")
			.expectMessage(oNoteWarning, "/SalesOrderSet('1')/");

		// code under test
		return this.createView(assert, sView).then(function () {
			return Promise.all([
				that.checkValueState(assert, "Note0", "Warning", "Foo"),
				that.checkValueState(assert, "Note1", "Warning", "Foo"),
				that.checkValueState(assert, "Note2", "None", ""),
				that.checkValueState(assert, "Composite0", "Warning", "Foo"),
				that.checkValueState(assert, "Composite1", "Warning", "Foo"),
				that.checkValueState(assert, "Composite2", "None", ""),
				that.checkValueState(assert, "Composite3", "Warning", "Foo"),
				that.checkValueState(assert, "Composite4", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: With the binding parameter <code>ignoreMessages</code> the application developer
	// can control whether messages are displayed at the control. For
	// <code>sap.ui.model.type.Currency</code> the parameter <code>ignoreMessages</code> is
	// determined automatically based on the format option <code>showMeasure</code>. Manual setting
	// of <code>ignoreMessages</code> wins over automatic determination.
	// JIRA: CPOUI5MODELS-302
	QUnit.test("ignoreMessages for sap.ui.model.type.Currency", function (assert) {
		var oCurrencyCodeWarning = this.createResponseMessage("CurrencyCode", "Foo", "warning"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="Amount0" value="{\
			formatOptions : {showMeasure : false},\
			mode : \'TwoWay\',\
			parts : [{\
				constraints : {precision : 16, scale : 3},\
				path : \'GrossAmount\',\
				type : \'sap.ui.model.odata.type.Decimal\'\
			}, {\
				constraints : {maxLength : 5},\
				path : \'CurrencyCode\',\
				type : \'sap.ui.model.odata.type.String\'\
			}],\
			type : \'sap.ui.model.type.Currency\'\
		}" />\
	<Input id="Amount1" value="{\
			formatOptions : {showMeasure : false},\
			mode : \'TwoWay\',\
			parts : [{\
				constraints : {precision : 16, scale : 3},\
				path : \'GrossAmount\',\
				type : \'sap.ui.model.odata.type.Decimal\'\
			}, {\
				constraints : {maxLength : 5},\
				parameters : {ignoreMessages : false},\
				path : \'CurrencyCode\',\
				type : \'sap.ui.model.odata.type.String\'\
			}],\
			type : \'sap.ui.model.type.Currency\'\
		}" />\
	<Input id="Amount2" value="{\
			formatOptions : {showMeasure : false},\
			mode : \'TwoWay\',\
			parts : [{\
				constraints : {precision : 16, scale : 3},\
				path : \'GrossAmount\',\
				type : \'sap.ui.model.odata.type.Decimal\'\
			}, {\
				constraints : {maxLength : 5},\
				parameters : {ignoreMessages : true},\
				path : \'CurrencyCode\',\
				type : \'sap.ui.model.odata.type.String\'\
			}],\
			type : \'sap.ui.model.type.Currency\'\
		}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				CurrencyCode : "JPY",
				GrossAmount : "12345",
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader(oCurrencyCodeWarning)})
			// change event for each part of the composite type
			.expectValue("Amount0", "12,345.00")
			.expectValue("Amount0", "12,345")
			.expectValue("Amount1", "12,345.00")
			.expectValue("Amount1", "12,345")
			.expectValue("Amount2", "12,345.00")
			.expectValue("Amount2", "12,345")
			.expectMessage(oCurrencyCodeWarning, "/SalesOrderSet('1')/");

		// code under test
		return this.createView(assert, sView).then(function () {
			return Promise.all([
				that.checkValueState(assert, "Amount0", "None", ""),
				that.checkValueState(assert, "Amount1", "Warning", "Foo"),
				that.checkValueState(assert, "Amount2", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//**********************************************************************************************
	// Scenario: In a master-detail scenario there are two requests in one batch, one for the list
	// (entity set) and one for the details (an entity of this set). If the first request responds
	// with a technical error (e.g. incorrect $select leads to 404 'Not Found'), the second request
	// should not clear the received messages, even though they are identified as the same entity.
	// The linked BCP ticket differs from the described scenario but for message processing leads to
	// the same issue.
	// BCP: 2070217402
	// JIRA: CPOUI5MODELS-250
	QUnit.test("Messages: Handle technical messages as persistent", function (assert) {
		var oErrorMessage = createErrorResponse({message : "Not Found", statusCode : 404}),
			oModel = createSalesOrdersModel({persistTechnicalMessages : true}),
			sView = '\
<Table items="{path : \'/SalesOrderSet\', parameters : {select : \'foo\'}}">\
	<Text text="{SalesOrderID}" />\
</Table>\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="idNote" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				deepPath : "/SalesOrderSet",
				requestUri : "SalesOrderSet?$skip=0&$top=100&$select=foo"
			}, oErrorMessage)
			.expectMessages([{
				code : "UF0",
				descriptionUrl : "",
				fullTarget : "",
				message : "Not Found",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}])
			.expectRequest({
				batchNo : 1,
				deepPath : "/SalesOrderSet('1')",
				requestUri : "SalesOrderSet('1')"
			}, {
				Note : "bar"
			})
			.expectValue("idNote", "bar");

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 404: "
					+ "GET SalesOrderSet?$skip=0&$top=100&$select=foo",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		return this.createView(assert, sView, oModel);
	});

	//**********************************************************************************************
	// Scenario: Allow changing of persistTechnicalMessages on model after instantiation.
	// JIRA: CPOUI5MODELS-344
[true, undefined, false].forEach(function (bPersistTechnicalMessages) {
	var sTitle = "Messages: Change persistTechnicalMessages after instantiation, "
		+ "bPersistTechnicalMessages=" + bPersistTechnicalMessages;

	QUnit.test(sTitle, function (assert) {
		var oErrorMessage = createErrorResponse({message : "Not Found", statusCode : 404}),
			oModel = createSalesOrdersModel({
				persistTechnicalMessages : bPersistTechnicalMessages,
				tokenHandling : false
			}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="idNote" value="{Note}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderSet('1')", oErrorMessage)
			.expectMessages([{
				code : "UF0",
				descriptionUrl : "",
				fullTarget : bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
				message : "Not Found",
				persistent : !!bPersistTechnicalMessages,
				target : bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
				technical : true,
				type : "Error"
			}]);

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 404: GET SalesOrderSet('1')",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		return this.createView(assert, sView, oModel).then(function () {
			oErrorMessage = createErrorResponse({message : "Not Found", statusCode : 404});

			that.expectRequest("SalesOrderSet('1')", oErrorMessage)
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
					message : "Not Found",
					persistent : !!bPersistTechnicalMessages,
					target : bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
					technical : true,
					type : "Error"
				}, {
					code : "UF0",
					descriptionUrl : "",
					fullTarget : !bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
					message : "Not Found",
					persistent : !bPersistTechnicalMessages,
					target : !bPersistTechnicalMessages ? "" : "/SalesOrderSet('1')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 404: GET SalesOrderSet('1')",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			if (bPersistTechnicalMessages !== undefined) {
				that.oLogMock.expects("warning")
					.withExactArgs("The flag whether technical messages should always be treated as"
						+ " persistent has been overwritten to " + !bPersistTechnicalMessages,
						undefined, sODataModelClassName);
			}

			// code under test
			oModel.setPersistTechnicalMessages(!bPersistTechnicalMessages);
			oModel.refresh(true);

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: When scrolling in an AnalyticalTable then the AnalyticalBinding requests an
	// appropriate number of items according to the defined threshold. See implementation of
	// ODataUtils#_getReadIntervals.
	// BCP: 2170020571
	// JIRA: CPOUI5MODELS-579
	// Scenario 2: Get the total number of entities from an analytical binding using the API
	// AnalyticalBinding#getCount.
	// JIRA: CPOUI5MODELS-576
	QUnit.test("AnalyticalBinding: gap calculation", function (assert) {
		var iItemCount = 0,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS", {
				tokenHandling : false
			}),
			oTable,
			sView = '\
<t:AnalyticalTable id="table" rows="{path : \'/Items\', parameters : {useBatchRequests : true}}"\
		threshold="10" visibleRowCount="2">\
	<t:AnalyticalColumn grouped="true" leadingProperty="AccountingDocumentItem"\
		template="AccountingDocumentItem"/>\
	<t:AnalyticalColumn leadingProperty="AmountInCompanyCodeCurrency" summed="true"\
		template="AmountInCompanyCodeCurrency"/>\
</t:AnalyticalTable>',
			that = this;

		function getItems(iNumberOfItems) {
			var i, aItems = [];

			for (i = 0; i < iNumberOfItems; i += 1) {
				aItems.push({
					__metadata : {
						uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(" + iItemCount + ")"
					},
					AccountingDocumentItem : String(iItemCount),
					AmountInCompanyCodeCurrency : String(iItemCount),
					Currency : "USD"
				});
				iItemCount += 1;
			}

			return aItems;
		}

		this.expectRequest("Items" // Grand Total Request
					+ "?$select=AmountInCompanyCodeCurrency,Currency&$top=100"
					+ "&$inlinecount=allpages", {
				__count : "1",
				results : [{
					__metadata : {
						uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items('grandTotal')"
					},
					AmountInCompanyCodeCurrency : "21763001.16",
					Currency : "USD"
				}]
			})
			.expectRequest("Items" // Data and Count Request
					+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency"
					+ "&$orderby=AccountingDocumentItem%20asc&$top=11&$inlinecount=allpages", {
				__count : "550",
				results : getItems(11)
			});
			// no expectChange required because only $skip&$top is relevant to be checked

		return this.createView(assert, sView, oModel).then(function () {
			// BEGIN: CPOUI5MODELS-576
			// code under test
			assert.strictEqual(that.oView.byId("table").getBinding("rows").getCount(), 550);
			// getLength has one row more because of the grand total row
			assert.strictEqual(that.oView.byId("table").getBinding("rows").getLength(), 551);
			// END: CPOUI5MODELS-576
		}).then(function () {
			oTable = that.oView.byId("table");

			that.expectRequest("Items"
						+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,"
						+ "Currency&$orderby=AccountingDocumentItem%20asc&$skip=11&$top=6", {
					results : getItems(6)
				});

			// code under test: gap at the end
			oTable.setFirstVisibleRow(6);

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test: no request needed
			oTable.setFirstVisibleRow(11);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Items"
						+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=AccountingDocumentItem%20asc&$skip=90&$top=21", {
					results : getItems(21)
				});

			// code under test: no data given for this row
			oTable.setFirstVisibleRow(100);

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test: no request needed
			oTable.setFirstVisibleRow(95);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Items"
						+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=AccountingDocumentItem%20asc&$skip=84&$top=6", {
					results : getItems(6)
				});

			// code under test: gap in front of start index
			oTable.setFirstVisibleRow(94);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Root entity returns a message for a *:0..1 navigation property which is
	// <code>null</code>. The data for the navigation property is requested in an own request.
	// The GET request for the navigation property returns a 204 No Content and does not have any
	// messages. The message returned in the request for the root object must not be removed.
	// BCP: 2080337477
	// JIRA: CPOUI5MODELS-339
	QUnit.test("Messages: GET returns 204 No Content", function (assert) {
		var oBusinessPartnerError = this.createResponseMessage("ToBusinessPartner"),
			oModel = createSalesOrdersModelMessageScope(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<FlexBox binding="{ToBusinessPartner}">\
		<Text id="id" text="{BusinessPartnerID}" />\
	</FlexBox>\
</FlexBox>';

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader(oBusinessPartnerError)})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToBusinessPartner",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')/ToBusinessPartner"
			}, NO_CONTENT
			/* we expect a NO_CONTENT response to have no messages and explicitly ignore them! */)
			.expectMessage(oBusinessPartnerError, "/SalesOrderSet('1')/");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			assert.strictEqual(oModel.getObject("/SalesOrderSet('1')/ToBusinessPartner"), null);
		});
	});

	//*********************************************************************************************
	// Scenario: A function import returning a collection of entities may contain messages for the
	// returned entities. Old messages for the entities returned by the function call are properly
	// updated. Messages for other entities of the same entity set are kept untouched.
	// JIRA: CPOUI5MODELS-287
[
	"/BusinessPartner_Alternatives",
	"/BusinessPartner_Alternatives_ReturnType"
].forEach(function (sFunctionName) {
	var sTitle = "Messages: function import returning a collection for different entities;"
		+ " messages are updated only for returned entities: " + sFunctionName;

	QUnit.test(sTitle, function (assert) {
		var oCompanyNameError1 = this.createResponseMessage("CompanyName"),
			oCompanyNameError2 = this.createResponseMessage("CompanyName"),
			oModel = createSalesOrdersModelMessageScope(),
			oToProductADescriptionError1
				= this.createResponseMessage("ToProducts('A')/Description"),
			oProductADescriptionError1 = cloneODataMessage(oToProductADescriptionError1,
				"('A')/Description"),
			oToProductADescriptionError2
				= this.createResponseMessage("ToProducts('B')/Description"),
			oProductADescriptionError2 = cloneODataMessage(oToProductADescriptionError2,
				"('B')/Description"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'1\')}">\
	<Input id="companyName1" value="{CompanyName}" />\
</FlexBox>\
<FlexBox binding="{/BusinessPartnerSet(\'2\')}">\
	<Input id="companyName2" value="{CompanyName}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('1')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('1')"},
				BusinessPartnerID : "1",
				CompanyName : "company1"
			}, {"sap-message" : getMessageHeader([
					oCompanyNameError1,
					oToProductADescriptionError1
				])})
			.expectRequest({
				deepPath : "/BusinessPartnerSet('2')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('2')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('2')"},
				BusinessPartnerID : "2",
				CompanyName : "company2"
			}, {"sap-message" : getMessageHeader([
					oCompanyNameError2,
					oToProductADescriptionError2
				])})
			.expectValue("companyName1", "company1")
			.expectValue("companyName2", "company2")
			.expectMessage(oCompanyNameError1, "/BusinessPartnerSet('1')/")
			.expectMessage(oProductADescriptionError1, "/ProductSet",
				"/BusinessPartnerSet('1')/ToProducts")
			.expectMessage(oCompanyNameError2, "/BusinessPartnerSet('2')/")
			.expectMessage(oProductADescriptionError2, "/ProductSet",
				"/BusinessPartnerSet('2')/ToProducts");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oCompanyNameError2_Update = that.createResponseMessage("('2')/CompanyName"),
				oToProductADescriptionError2
					= that.createResponseMessage("('2')/ToProducts('B')/Description"),
				oProductADescriptionError2 = cloneODataMessage(oToProductADescriptionError2,
					"('B')/Description");

			that.expectRequest({
					deepPath : sFunctionName,
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : sFunctionName.slice(1) + "?BusinessPartnerID='1'"
				}, {
					results : [{
						__metadata : {uri : "BusinessPartnerSet('2')"},
						BusinessPartnerID : "2",
						CompanyName : "companyName2New"
					}]
				}, {
					"sap-message" : getMessageHeader([
						oCompanyNameError2_Update,
						oToProductADescriptionError2
					])
				})
				.expectValue("companyName2", "companyName2New")
				.expectMessage(oCompanyNameError2_Update, "/BusinessPartnerSet", undefined, true)
				.expectMessage(oProductADescriptionError2, "/ProductSet",
					"/BusinessPartnerSet('2')/ToProducts")
				.expectMessage(oCompanyNameError1, "/BusinessPartnerSet('1')/")
				.expectMessage(oProductADescriptionError1, "/ProductSet",
					"/BusinessPartnerSet('1')/ToProducts");

			return Promise.all([
				oModel.callFunction(sFunctionName, {
					method : "POST",
					refreshAfterChange : false,
					urlParameters : {
						BusinessPartnerID : "1"
					}
				}).contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: A function import returning a collection of entities with the same parent may
	// contain messages for the returned entities. Old messages for the entities returned by the
	// function call are properly updated. <code>adjustDeepPath</code> is used to overwrite the
	// messages' deep path.
	// JIRA: CPOUI5MODELS-287
	QUnit.test("Messages: function import returning a collection (adjustDeepPath)",
			function (assert) {
		var oModel = createSalesOrdersModelMessageScope(),
			oQuantityError = this.createResponseMessage(
				"(SalesOrderID='1',ItemPosition='20~1~')/Quantity"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Table items="{ToLineItems}">\
		<Text id="quantity" text="{Quantity}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					ItemPosition : "10~0~",
					Quantity : "2",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
					},
					ItemPosition : "20~1~",
					Quantity : "0",
					SalesOrderID : "1"
				}]
			}, {
				"sap-message" : getMessageHeader(oQuantityError)
			})
			.expectChange("quantity", ["2", "0"])
			.expectMessage(oQuantityError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oQuantitySuccess = that.createResponseMessage(
					"(SalesOrderID='1',ItemPosition='20~1~')/Quantity", undefined, "success");

			that.expectRequest({
					deepPath : "/SalesOrder_FixQuantities",
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_FixQuantities?SalesOrderID='1'"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
						},
						ItemPosition : "20~1~",
						Quantity : "2",
						SalesOrderID : "1"
					}]
				}, {
					"sap-message" : getMessageHeader(oQuantitySuccess)
				})
				.expectChange("quantity", "2", 1)
				.expectMessage(oQuantitySuccess, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems", true);

			return Promise.all([
				// code under test
				oModel.callFunction("/SalesOrder_FixQuantities", {
					adjustDeepPath : function (mParameters) {
						assert.strictEqual(mParameters.deepPath, "/SalesOrderLineItemSet");
						return "/SalesOrderSet('1')/ToLineItems";
					},
					method : "POST",
					refreshAfterChange : false,
					urlParameters : {
						SalesOrderID : "1"
					}
				}).contextCreated(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Expand navigation properties of the entity returned by a function import call
	// within the same $batch.
	// JIRA: CPOUI5MODELS-221
	QUnit.test("callFunction: expand navigation properties in the same $batch", function (assert) {
		var oModel = createSalesOrdersModelMessageScope({
				canonicalRequests : true,
				tokenHandling : false
			}),
			sView = '\
<FlexBox id="productDetails">\
	<Text id="productName" text="{Name}" />\
</FlexBox>',
			that = this;

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oEventHandlers = {
					error : function () {},
					success : function () {}
				},
				oNoteError = that.createResponseMessage("Note"),
				oResponse = {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					ItemPosition : "20",
					SalesOrderID : "1"
				};

			that.mock(oEventHandlers).expects("error").never();
			that.mock(oEventHandlers).expects("success")
				.withExactArgs({
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					ItemPosition : "20",
					SalesOrderID : "1",
					ToProduct : {
						__metadata : {uri : "ProductSet(ProductID='P1')"},
						Name : "Product 1",
						ProductID : "P1"
					}
				}, sinon.match.has("data", oResponse));

			that.expectRequest({
					batchNo : 1,
					deepPath : "/SalesOrderItem_Clone",
					encodeRequestUri : false,
					headers : {
						"Content-ID" : "~key~",
						"sap-message-scope" : "BusinessObject",
						"sap-messages" : "transientOnly"
					},
					method : "POST",
					requestUri : "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'"
				}, oResponse, {
					location :
						"/SalesOrderSrv/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
				})
				.expectRequest({
					batchNo : 1,
					deepPath : "/$~key~",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "$~key~?$expand=ToProduct&$select=ToProduct"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					ToProduct : {
						__metadata : {uri : "ProductSet(ProductID='P1')"},
						Name : "Product 1",
						ProductID : "P1"
					}
				}, {
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20')/");

			return Promise.all([
				// code under test
				oModel.callFunction("/SalesOrderItem_Clone", {
					adjustDeepPath : function (mParameters) {
						assert.strictEqual(mParameters.deepPath,
							"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
							"Deep path adjusted");

						return "/SalesOrderSet('1')"
							+ "/ToLineItems(SalesOrderID='1',ItemPosition='20')";
					},
					error : oEventHandlers.error,
					expand : "ToProduct",
					method : "POST",
					success : oEventHandlers.success,
					urlParameters : {
						ItemPosition : "10",
						SalesOrderID : "1"
					}
				}).contextCreated(),
				that.waitForChanges(assert)
			]).then(function () {
				that.expectValue("productName", "Product 1");

				// code under test
				that.oView.byId("productDetails")
					.bindObject({
						parameters : {select : "Name"},
						path : "/SalesOrderSet('1')"
							+ "/ToLineItems(SalesOrderID='1',ItemPosition='20')/ToProduct"
					});

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Abort a function call with given expand parameter.
	// JIRA: CPOUI5MODELS-221
[true, false].forEach(function (bDeferred) {
	var sTitle = "callFunction: abort function call with given expand parameter; deferred: "
			+ bDeferred;

	QUnit.test(sTitle, function (assert) {
		var oCallFunctionResult,
			oModel = createSalesOrdersModelMessageScope(),
			that = this;

		oModel.setDeferredGroups(["change", "callFunction"]);

		return this.createView(assert, /*sView*/"", oModel).then(function () {
			oCallFunctionResult = oModel.callFunction("/SalesOrderItem_Clone", {
					adjustDeepPath : function (mParameters) {
						assert.strictEqual(mParameters.deepPath,
							"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
							"Deep path adjusted");

						return "/SalesOrderSet('1')"
							+ "/ToLineItems(SalesOrderID='1',ItemPosition='20')";
					},
					expand : "ToProduct",
					groupId : bDeferred ? "callFunction" : undefined,
					method : "POST",
					urlParameters : {
						ItemPosition : "10",
						SalesOrderID : "1"
					}
				});

			if (!bDeferred) {
				// code under test
				oCallFunctionResult.abort();
				oModel.submitChanges();

				return that.waitForChanges(assert);
			}
			// deferred case
			return Promise.all([
				Promise.resolve(), // request object is created async; wait for it
				that.waitForChanges(assert)
			]).then(function () {
				// code under test
				oCallFunctionResult.abort();
				oModel.submitChanges("callFunction");

				return that.waitForChanges(assert);
			});
		});
	});
});

	//*********************************************************************************************
	// Scenario: Function call with given expand parameter fails.
	// JIRA: CPOUI5MODELS-221
	QUnit.test("callFunction: with given expand parameter fails", function (assert) {
		var oModel = createSalesOrdersModelMessageScope({
				canonicalRequests : true,
				tokenHandling : false
			}),
			that = this;

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, /*sView*/"", oModel).then(function () {
			var oErrorGET = createErrorResponse({message : "GET failed", statusCode : 400}),
				oErrorPOST = createErrorResponse({message : "POST failed", statusCode : 400}),
				oEventHandlers = {
					error : function () {},
					success : function () {}
				};

			that.mock(oEventHandlers).expects("error")
				.withExactArgs(sinon.match({
					message: "HTTP request failed",
					responseText: oErrorPOST.body,
					statusCode: 400,
					statusText: "FAILED"
				}));
			that.mock(oEventHandlers).expects("success").never();
			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST "
						+ "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			that.oLogMock.expects("error")
				.withExactArgs(sinon.match(new RegExp("Request failed with status code 400: "
						+ "GET \\$id-\\d*-\\d*\\?\\$expand=ToProduct&\\$select=ToProduct")),
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			that.expectRequest({
					batchNo : 1,
					deepPath : "/SalesOrderItem_Clone",
					encodeRequestUri : false,
					headers : {
						"Content-ID" : "~key~",
						"sap-message-scope" : "BusinessObject",
						"sap-messages" : "transientOnly"
					},
					method : "POST",
					requestUri : "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'"
				}, oErrorPOST)
				.expectRequest({
					batchNo : 1,
					deepPath : "/$~key~",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "$~key~?$expand=ToProduct&$select=ToProduct"
				}, oErrorGET)
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
					technical : true,
					type : "Error"
				}, {
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/$~key~",
					message : "GET failed",
					persistent : false,
					target : "/$~key~",
					technical : true,
					type : "Error"
				}]);

			return Promise.all([
				// code under test
				oModel.callFunction("/SalesOrderItem_Clone", {
					adjustDeepPath : function (mParameters) {
						assert.strictEqual(mParameters.deepPath,
							"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
							"Deep path adjusted");

						return "/SalesOrderSet('1')"
							+ "/ToLineItems(SalesOrderID='1',ItemPosition='20')";
					},
					error : oEventHandlers.error,
					expand : "ToProduct",
					method : "POST",
					success : oEventHandlers.success,
					urlParameters : {
						ItemPosition : "10",
						SalesOrderID : "1"
					}
				}).contextCreated(),
				that.waitForChanges(assert)
			]).then(function () {
				// code under test - function call is not retried
				oModel.submitChanges();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: TreeTable on an ObjectPage bound to a preliminary context.
	// BCP: 2080201638
	QUnit.test("TreeTable with preliminary context", function (assert) {
		var oModel = createAllowanceModel(),
			sObjectUri = "C_DFS_AllwncReq(guid'fa163e35-93d9-1eda-b19c-c26490674ab4')",
			//use row count 1, as there are 10 null change events otherwise
			sView = '\
<FlexBox binding="{path : \'/C_DFS_AllwncReq(guid\\\'fa163e35-93d9-1eda-b19c-c26490674ab4\\\')\', \
		parameters : {createPreliminaryContext : true, groupId : \'myGroup\'}}">\
	<Text id="reqID" text="{DfsAllwncReqID}" />\
	<t:TreeTable id="table"\
			rows="{path : \'to_AllwncReqToFe\', parameters : \
				{countMode : \'Inline\', groupId : \'myGroup\', usePreliminaryContext : true}}"\
			visibleRowCount="1"\
			visibleRowCountMode="Fixed" \>\
		<Text id="orgID" text="{ForceElementOrgID}" />\
	</t:TreeTable>\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				deepPath : "/" + sObjectUri,
				requestUri : sObjectUri
			}, {
				DfsAllwncReqUUID : "fa163e35-93d9-1eda-b19c-c26490674ab4",
				DfsAllwncReqID : "Request ID"
			})
			.expectRequest({
				// TreeTable becomes async so that its GET is not in the same $batch as the 1st GET
				batchNo : 2,
				deepPath : "/" + sObjectUri + "/to_AllwncReqToFe",
				requestUri : sObjectUri + "/to_AllwncReqToFe"
					+ "?$skip=0&$top=101&$inlinecount=allpages&$filter=HierarchyLevel%20le%200"
			}, {
				__count : "1",
				results : [{
					"ForceElementOrgID" : "4711"
					// "HierarchyNode" : "32,FA163E2C58541EDA8E9C92E909255DAF",
					// "HierarchyParentNode" : "",
					// "HierarchyLevel" : 0,
					// "HierarchyDescendantCount" : 0,
					// "DrillDownState" : "collapsed"
				}]
			})
			.expectValue("reqID", "Request ID")
			.expectValue("orgID", [""]) //TODO why does this happen?
			.expectValue("orgID", ["4711"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: TreeTable using ODataTreeBindingFlat reads automatically an updated entity when
	// binding parameter 'refreshAfterChange' is enabled. With refreshAfterChange set to true, a
	// MERGE request is followed by a GET request within the same batch request.
	// BCP: 2070497030
	// JIRA: CPOUI5MODELS-379
	QUnit.test("ODataTreeBindingFlat: refreshAfterChange leads to GET", function (assert) {
		var oModel = createSpecialCasesModel({refreshAfterChange : true}),
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				gantt : {\
					rowIdName : \'OrderOperationRowID\'\
				},\
				treeAnnotationProperties : {\
					hierarchyDrillStateFor : \'OrderOperationIsExpanded\',\
					hierarchyLevelFor : \'OrderOperationRowLevel\',\
					hierarchyNodeDescendantCountFor : \'HierarchyDescendantCount\',\
					hierarchyNodeFor : \'OrderOperationRowID\',\
					hierarchyParentNodeFor : \'OrderOperationParentRowID\'\
				}\
			},\
			path : \'/C_RSHMaintSchedSmltdOrdAndOp\'\
		}"\
		visibleRowCount="1"\
		visibleRowCountMode="Fixed" \>\
	<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
</t:TreeTable>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				deepPath : "/C_RSHMaintSchedSmltdOrdAndOp",
				requestUri : "C_RSHMaintSchedSmltdOrdAndOp?$skip=0&$top=101&$inlinecount=allpages"
					+ "&$filter=OrderOperationRowLevel%20le%200"
			}, {
				__count : "1",
				results : [{
					__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('~0~')"},
					MaintenanceOrder : "Foo"
				}]
			})
			.ignoreNullChanges("maintenanceOrder") //FIXME: unexpected change occurring in testsuite
			.expectValue("maintenanceOrder", ["Foo"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					batchNo : 2,
					data : {
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('~0~')"},
						MaintenanceOrder : "Bar"
					},
					deepPath : "/C_RSHMaintSchedSmltdOrdAndOp('~0~')",
					headers : {},
					key : "C_RSHMaintSchedSmltdOrdAndOp('~0~')",
					method : "MERGE",
					requestUri : "C_RSHMaintSchedSmltdOrdAndOp('~0~')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 2,
					deepPath : "/C_RSHMaintSchedSmltdOrdAndOp",
					requestUri : "C_RSHMaintSchedSmltdOrdAndOp?$skip=0&$top=101"
						+ "&$inlinecount=allpages&$filter=OrderOperationRowLevel%20le%200"
				}, {
					__count : "1",
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('~0~')"},
						MaintenanceOrder : "Bar"
					}]
				})
				.expectValue("maintenanceOrder", ["Bar"]);

			// code under test
			oModel.setProperty("/C_RSHMaintSchedSmltdOrdAndOp('~0~')/MaintenanceOrder", "Bar");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: TreeTable with relative binding works with async adapter loading
	// JIRA: CPOUI5MODELS-650
	QUnit.test("ODataTreeBinding: relative binding, async adapter loading", function (assert) {
		var oModel = createSpecialCasesModel({preliminaryContext : true}),
			sView = '\
<FlexBox id="box">\
	<t:TreeTable id="table"\
			rows="{\
				parameters : {\
					countMode : \'Inline\',\
					treeAnnotationProperties : {\
						hierarchyDrillStateFor : \'OrderOperationIsExpanded\',\
						hierarchyLevelFor : \'OrderOperationRowLevel\',\
						hierarchyNodeDescendantCountFor : \'HierarchyDescendantCount\',\
						hierarchyNodeFor : \'OrderOperationRowID\',\
						hierarchyParentNodeFor : \'OrderOperationParentRowID\'\
					}\
				},\
				path : \'to_C_RSHMaintSchedSmltdOrdAndOp\'\
			}"\
			visibleRowCount="1"\
			visibleRowCountMode="Fixed" \>\
		<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
	</t:TreeTable>\
</FlexBox>',
		that = this;

			return this.createView(assert, sView, oModel).then(function () {
				that.expectHeadRequest()
					.expectRequest("DummySet('42')", {DummyID : "42"})
					.expectRequest({
						deepPath : "/DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp",
						requestUri : "DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp"
							+ "?$skip=0&$top=101&$inlinecount=allpages&"
							+ "$filter=OrderOperationRowLevel%20le%200"
					}, {
						__count : "1",
						results : [{
							__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('~0~')"},
							MaintenanceOrder : "Bar"
						}]
					})
					.expectValue("maintenanceOrder", [""])
					.expectValue("maintenanceOrder", ["Bar"]);

			// code under test
			that.oView.byId("box").bindElement({path : "/DummySet('42')"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Controls with PropertyBinding and CompositeBinding discard invalid values when the
	// context gets overwritten by another context that has the same values stored in the model.
	// JIRA: CPOUI5MODELS-336
[true, false].forEach(function (bUseStatic) {
	var sTitle = "CompositeBinding: Overwrite invalid entry with model value after context switch, "
			+ "static = " + bUseStatic;

	QUnit.test(sTitle, function (assert) {
		var oAmount0,
			oCurrency0,
			sCurrencyCodeJSON = "path : 'JSONModel>CurrencyCode',"
				+ "type : 'sap.ui.model.odata.type.String'",
			sCurrencyCodeStatic = "value : 'USD'",
			oJSONModel = new JSONModel({"CurrencyCode" : "USD"}),
			oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				refreshAfterChange : false
			}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="Amount0" value="{\
			formatOptions : {showMeasure : false},\
			parts : [{\
				path : \'GrossAmount\',\
				type : \'sap.ui.model.odata.type.Decimal\'\
			}, {'
				+ (bUseStatic ? sCurrencyCodeStatic : sCurrencyCodeJSON) +
			'}],\
			type : \'sap.ui.model.type.Currency\'\
		}" />\
	<Input id="Currency0" value="{\
			constraints : {maxLength : 3},\
			path : \'CurrencyCode\',\
			type : \'sap.ui.model.odata.type.String\'\
		}" />\
</FlexBox>\
<FlexBox binding="{/SalesOrderSet(\'2\')}">\
	<Input id="Amount1" value="{GrossAmount}" />\
	<Input id="Currency1" value="{CurrencyCode}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				CurrencyCode : "USD",
				GrossAmount : "10",
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderSet('2')", {
				CurrencyCode : "USD",
				GrossAmount : "10",
				SalesOrderID : "2"
			})
			.expectValue("Amount0", "10.00")
			.expectValue("Currency0", "USD")
			.expectValue("Amount1", "10")
			.expectValue("Currency1", "USD");

		return this.createView(assert, sView, {undefined : oModel, JSONModel : oJSONModel}).then(
				function () {
			oAmount0 = that.oView.byId("Amount0");
			oCurrency0 = that.oView.byId("Currency0");

			that.expectMessages([{
					descriptionUrl : undefined,
					message : "EnterNumber",
					target : oAmount0.getId() + "/value",
					type : "Error"
				}, {
					descriptionUrl : undefined,
					message : "EnterTextMaxLength 3",
					target : oCurrency0.getId() + "/value",
					type : "Error"
				}])
				.expectValue("Amount0", "invalid amount")
				.expectValue("Currency0", "invalid currency");


			TestUtils.withNormalizedMessages(function () {
				// code under test
				oAmount0.setValue("invalid amount");
				oCurrency0.setValue("invalid currency");
			});

			return Promise.all([
				that.checkValueState(assert, oAmount0, "Error", "EnterNumber"),
				that.checkValueState(assert, oCurrency0, "Error", "EnterTextMaxLength 3"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectMessages([])
				.expectValue("Amount0", "10.00")
				.expectValue("Currency0", "USD");

			// code under test
			oAmount0.setBindingContext(that.oView.byId("Amount1").getBindingContext());
			oCurrency0.setBindingContext(that.oView.byId("Currency1").getBindingContext());

			assert.strictEqual(oAmount0.getBindingContext().getPath(), "/SalesOrderSet('2')");
			assert.strictEqual(oCurrency0.getBindingContext().getPath(), "/SalesOrderSet('2')");

			return Promise.all([
				that.checkValueState(assert, oAmount0, "None", ""),
				that.checkValueState(assert, oCurrency0, "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: One model instance is defined as two named models. Setting a new binding context to
	// a composite binding must only use the context that is related to the expected named model.
	// JIRA: CPOUI5MODELS-336
	QUnit.test("CompositeBinding: Set binding context; one model instance for two named models",
			function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<Table id="SalesOrderList" items="{/SalesOrderSet}">\
	<Text id="SalesOrderNote" text="{Note}" />\
</Table>\
<Table id="LineItems0" items="{ToLineItems}">\
	<Text id="LineItems0Note" text="{ItemPosition}: {Note}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				deepPath : "/SalesOrderSet",
				requestUri : "SalesOrderSet?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("LineItems0Note", false);

		return this.createView(assert, sView, {undefined : oModel, model2 : oModel}).then(
				function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						ItemPosition : "10~0~",
						Note : "note0",
						SalesOrderID : "1"
					}]
				})
				.expectChange("LineItems0Note", ["10~0~: note0"]);

			// code under test
			that.oView.byId("LineItems0").setBindingContext(
				that.oView.byId("SalesOrderList").getItems()[0].getBindingContext()
			);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Value state of a control gets updates when removing a binding of a property.
	// BCP: 2070436327
	QUnit.test("JSONModel: Value state updated after calling unbindProperty", function (assert) {
		var oModel = new JSONModel({Note : "Foo"}),
			sView = '<Input id="note" value="{/Note}" />',
			that = this;

		this.expectValue("note", "Foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectMessages([{
					descriptionUrl : undefined,
					message : "Some message",
					target : "/Note",
					type : "Error"
				}]);

			sap.ui.getCore().getMessageManager().addMessages(new Message({
				message: "Some message",
				processor: oModel,
				target: "/Note",
				type: "Error"
			}));

			return Promise.all([
				that.checkValueState(assert, "note", "Error", "Some message"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", "");

			// code under test
			that.oView.byId("note").unbindProperty("value");

			return Promise.all([
				that.checkValueState(assert, "note", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Value state of a control gets updates when setting another model.
	// BCP: 2070436327
	QUnit.test("JSONModel: Correct value state after setting another model", function (assert) {
		var oModel = new JSONModel({Note : "Foo"}),
			sView = '<Input id="note" value="{/Note}" />',
			that = this;

		this.expectValue("note", "Foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectMessages([{
					descriptionUrl : undefined,
					message : "Some message",
					target : "/Note",
					type : "Error"
				}]);

			sap.ui.getCore().getMessageManager().addMessages(new Message({
				message: "Some message",
				processor: oModel,
				target: "/Note",
				type: "Error"
			}));

			return Promise.all([
				that.checkValueState(assert, "note", "Error", "Some message"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", "Bar");

			// code under test
			that.oView.setModel(new JSONModel({Note : "Bar"}));

			return Promise.all([
				that.checkValueState(assert, "note", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: If the OData service has no customizing for units, the OData Unit type uses the
	// UI5 built-in CLDR information for formatting and parsing.
	// JIRA: CPOUI5MODELS-423
	QUnit.test("OData Unit type without unit customizing falls back to CLDR", function (assert) {
		var oModel = createSalesOrdersModel({defaultBindingMode : "TwoWay"}),
			sView = '\
<FlexBox binding="{/ProductSet(\'P1\')}">\
	<Input id="weight" value="{\
		parts : [{\
			constraints : { scale : \'variable\' },\
			path : \'WeightMeasure\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'WeightUnit\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestUnitsOfMeasure\',\
			targetType : \'any\'\
		}],\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Unit\'\
	}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("ProductSet('P1')", {
				ProductID : "P1",
				WeightMeasure : "12.34",
				WeightUnit : "mass-kilogram"
			})
			.expectValue("weight", "12.34")
			.expectValue("weight", "12.34 kg");

		return this.createView(assert, sView, oModel).then(function () {
			var oControl = that.oView.byId("weight");

			that.expectValue("weight", "23.4 kg");

			// code under test
			oControl.setValue("23.4 kg");

			that.expectValue("weight", "0 kg")
				.expectValue("weight", "0 kg");

			// code under test
			oControl.setValue("");
		});
	});

	//*********************************************************************************************
	// Scenario: If the OData service has no customizing for currencies, the OData Currency type
	// uses the UI5 built-in CLDR information for formatting and parsing.
	// JIRA: CPOUI5MODELS-423
	QUnit.test("OData Currency type without customizing falls back to CLDR", function (assert) {
		var oModel = createSalesOrdersModel({defaultBindingMode : "TwoWay"}),
			sView = '\
<FlexBox binding="{/ProductSet(\'P1\')}">\
	<Input id="price" value="{\
		parts : [{\
			constraints : { scale : \'variable\' },\
			path : \'Price\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'CurrencyCode\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestCurrencyCodes\',\
			targetType : \'any\'\
		}],\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Currency\'\
	}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("ProductSet('P1')", {
				ProductID : "P1",
				Price : "12.3",
				CurrencyCode : "EUR"
			})
			.expectValue("price", "12.30")
			.expectValue("price", "12.30\u00a0EUR"); // "\u00a0" is a non-breaking space

		return this.createView(assert, sView, oModel).then(function () {
			var oControl = that.oView.byId("price");

			that.expectValue("price", "42\u00a0JPY")
				.expectValue("price", "42\u00a0JPY");

			// code under test
			oControl.setValue("42 JPY");

			that.expectValue("price", "0\u00a0JPY")
				.expectValue("price", "0\u00a0JPY");

			// code under test
			oControl.setValue("");
		});
	});

	//*********************************************************************************************
	// Scenario: TreeTable#collapseAll for a table using ODataTreeBindingAdapter resets the number
	// of levels expanded automatically in subsequent read requests to 0.
	// BCP: 66039 / 2021
	QUnit.test("ODataTreeBindingAdapter: collapseToLevel prevents auto expand of child nodes with"
			+ " higher level", function (assert) {
		var oModel = createSpecialCasesModel(),
			oTable,
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 1,\
				treeAnnotationProperties : {\
					hierarchyDrillStateFor : \'OrderOperationIsExpanded\',\
					hierarchyLevelFor : \'OrderOperationRowLevel\',\
					hierarchyNodeFor : \'OrderOperationRowID\',\
					hierarchyParentNodeFor : \'OrderOperationParentRowID\'\
				}\
			},\
			path : \'/C_RSHMaintSchedSmltdOrdAndOp\'\
		}"\
		threshold="0"\
		visibleRowCount="2"\
		visibleRowCountMode="Fixed" \>\
	<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
</t:TreeTable>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationRowLevel%20eq%200"
				+ "&$skip=0&$top=2&$inlinecount=allpages",
				{
					__count : "273",
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-0')"},
						MaintenanceOrder : "0",
						OrderOperationIsExpanded : "collapsed",
						OrderOperationRowID : "id-0",
						OrderOperationRowLevel : 0
					}, {
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-1')"},
						MaintenanceOrder : "1",
						OrderOperationIsExpanded : "leaf",
						OrderOperationRowID : "id-1",
						OrderOperationRowLevel : 0
					}]
				})
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp?"
				+ "$filter=OrderOperationParentRowID%20eq%20%27id-0%27&$skip=0&$top=2"
				+ "&$inlinecount=allpages",
				{
					__count : "5",
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-0.0')"},
						MaintenanceOrder : "0.0",
						OrderOperationIsExpanded : "leaf",
						OrderOperationParentRowID : "id-0",
						OrderOperationRowID : "id-0.0",
						OrderOperationRowLevel : 1
					}, {
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-0.1')"},
						MaintenanceOrder : "0.1",
						OrderOperationIsExpanded : "leaf",
						OrderOperationParentRowID : "id-0",
						OrderOperationRowID : "id-0.1",
						OrderOperationRowLevel : 1
					}]
				})
			.expectValue("maintenanceOrder", ["0", "1"])
			.expectValue("maintenanceOrder", "0.0", 1);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("maintenanceOrder", "1", 1);

			// code under test
			oTable.collapseAll();

			return that.waitForChanges(assert);
		}).then(function () {
			//TODO expect $top=2 instead of $top=4, check TreeBindingAdapter#_getContextsOrNodes?
			that.expectRequest("C_RSHMaintSchedSmltdOrdAndOp"
				+ "?$filter=OrderOperationRowLevel%20eq%200&$skip=2&$top=4",
				{
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-2')"},
						MaintenanceOrder : "2",
						OrderOperationIsExpanded : "collapsed",
						OrderOperationRowID : "id-2",
						OrderOperationRowLevel : 0
					}, {
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-3')"},
						MaintenanceOrder : "3",
						OrderOperationIsExpanded : "leaf",
						OrderOperationRowID : "id-3",
						OrderOperationRowLevel : 0
					}]
				})
				.expectValue("maintenanceOrder", "", 2)
				.expectValue("maintenanceOrder", "", 3)
				.expectValue("maintenanceOrder", "2", 2)
				.expectValue("maintenanceOrder", "3", 3);

			// code under test
			// scroll down shows additional level 0 nodes, but must NOT load or show their children
			oTable.setFirstVisibleRow(2);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If the OData service works with code list for units, the OData Unit type uses this
	// information for formatting and parsing.
	// JIRA: CPOUI5MODELS-437
	// If skipDecimalsValidation constraint is set to true, validation of decimal places based on
	// the code list customizing is disabled.
	// JIRA: CPOUI5MODELS-607
[{
	sConstraints : "",
	sMessageText : "EnterInt",
	sMessageType : "Error"
}, {
	sConstraints : "constraints : { skipDecimalsValidation : false },",
	sMessageText : "EnterInt",
	sMessageType : "Error"
}, {
	sConstraints : "constraints : { skipDecimalsValidation : true },",
	sMessageText : "",
	sMessageType : "None"
}].forEach(function (oFixture, i) {
	var sTitle = "OData Unit type with code list for units; " + oFixture.sConstraints;

	QUnit.test(sTitle, function (assert) {
		var oControl,
			// Make URI distinct for each test to prevent code list caching
			oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=bar" + i, {
				defaultBindingMode : "TwoWay",
				metadataUrlParams : {"customMeta" : "custom/meta"},
				serviceUrlParams : {"customService" : "custom/service"},
				tokenHandling : false
			}),
			sView = '\
<FlexBox binding="{/ProductSet(\'P1\')}">\
	<Input id="weight" value="{' + oFixture.sConstraints + '\
		parts : [{\
			constraints : { precision : 13, scale : 3 },\
			path : \'WeightMeasure\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'WeightUnit\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestUnitsOfMeasure\',\
			targetType : \'any\'\
		}],\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Unit\'\
	}" />\
</FlexBox>',
			that = this;

		this.expectRequest("ProductSet('P1')?foo=bar" + i + "&customService=custom%2Fservice", {
				ProductID : "P1",
				WeightMeasure : "12.34",
				WeightUnit : "KG"
			})
			.expectRequest("SAP__UnitsOfMeasure?foo=bar" + i + "&customService=custom%2Fservice"
					+ "&$skip=0&$top=5000", {
				results : [{
					DecimalPlaces : 0,
					ExternalCode : "EA",
					ISOCode : "EA",
					Text : "Each",
					UnitCode : "EA"
				}, {
					DecimalPlaces : 3,
					ExternalCode : "KG",
					ISOCode : "KGM",
					Text : "Kilogramm",
					UnitCode : "KG"
				}]
			})
			.expectValue("weight", "12.340 KG");

		return this.createView(assert, sView, oModel).then(function () {
			oControl = that.oView.byId("weight");

			// change event for each part of the composite type
			that.expectValue("weight", "23.400 KG")
				.expectValue("weight", "23.400 KG");

			// code under test
			oControl.setValue("23.4 KG");

			that.expectValue("weight", "0.000 KG")
				.expectValue("weight", "0.000 KG");

			// code under test
			oControl.setValue("");

			that.expectMessages([{
					descriptionUrl: undefined,
					message : "EnterNumberFraction 3",
					target : oControl.getId() + "/value",
					type : "Error"
				}])
				.expectValue("weight", "12.3456 KG");

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("12.3456 KG");
			});

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, that.oView.byId("weight"), "Error",
				"EnterNumberFraction 3");
		}).then(function () {
			that.expectValue("weight", "1.1 EA");

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("1.1 EA");
			});
		}).then(function () {
			return that.checkValueState(assert, that.oView.byId("weight"), oFixture.sMessageType,
				oFixture.sMessageText);
		});
	});
});

	//*********************************************************************************************
	// Scenario: If the OData service works with code list for currencies, the OData Currency type
	// uses this information for formatting and parsing.
	// JIRA: CPOUI5MODELS-437
	QUnit.test("OData Currency type with code list for currencies", function (assert) {
		var oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=bar", {
				defaultBindingMode : "TwoWay",
				metadataUrlParams : {"customMeta" : "custom/meta"},
				serviceUrlParams : {"customService" : "custom/service"},
				tokenHandling : false
			}),
			sView = '\
<FlexBox binding="{/ProductSet(\'P1\')}">\
	<Input id="price" value="{\
		parts : [{\
			constraints : { scale : \'variable\' },\
			path : \'Price\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'CurrencyCode\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestCurrencyCodes\',\
			targetType : \'any\'\
		}],\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Currency\'\
	}" />\
</FlexBox>',
			that = this;

		this.expectRequest("ProductSet('P1')?foo=bar&customService=custom%2Fservice", {
				ProductID : "P1",
				Price : "12.3",
				CurrencyCode : "EUR"
			})
			.expectRequest(
				"SAP__Currencies?foo=bar&customService=custom%2Fservice&$skip=0&$top=5000", {
				results : [{
					CurrencyCode : "EUR",
					DecimalPlaces : 2,
					ISOCode : "EUR",
					Text : "Euro"
				}, {
					CurrencyCode : "USDN",
					DecimalPlaces : 5,
					ISOCode : "",
					Text : "US Dollar"
				}]
			})
			// "\u00a0" is a non-breaking space
			.expectValue("price", "12.30\u00a0EUR");

		return this.createView(assert, sView, oModel).then(function () {
			var oControl = that.oView.byId("price");

			that.expectValue("price", "42.12345\u00a0USDN")
				.expectValue("price", "42.12345\u00a0USDN");

			// code under test
			oControl.setValue("42.12345 USDN");

			that.expectValue("price", "0.00000\u00a0USDN")
				.expectValue("price", "0.00000\u00a0USDN");

			// code under test
			oControl.setValue("");

			that.expectMessages([{
					descriptionUrl: undefined,
					message : "EnterNumberFraction 2",
					target : oControl.getId() + "/value",
					type : "Error"
				}])
				.expectValue("price", "1.234 EUR");

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("1.234 EUR");
			});

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, that.oView.byId("price"), "Error",
				"EnterNumberFraction 2");
		});
	});

	//*********************************************************************************************
	// Scenario: Currency values with showNumber and showMeasure.
	// BCP: 2170063390
	//TODO: activate the test if NumberFormat considers showNumber===false (do not format the
	// currency to empty string if the amount is cleared and vice versa
	QUnit.skip("OData Currency type with showNumber and showMeasure", function (assert) {
		var oAmountControl, oCurrencyControl,
			oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=baz", {
				defaultBindingMode : "TwoWay",
				tokenHandling : false
			}),
			sView = '\
<FlexBox binding="{/ProductSet(\'P1\')}">\
	<Input id="amount" value="{\
		parts : [{\
			constraints : {scale : \'variable\'},\
			path : \'Price\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'CurrencyCode\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestCurrencyCodes\',\
			targetType : \'any\'\
		}],\
		formatOptions : {emptyString : null, showMeasure : false},\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Currency\'\
	}" />\
	<Input id="currency" value="{\
		parts : [{\
			constraints : {scale : \'variable\'},\
			path : \'Price\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'CurrencyCode\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestCurrencyCodes\',\
			targetType : \'any\'\
		}],\
		formatOptions : {emptyString : null, showNumber : false},\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Currency\'\
	}" />\
	<Text id="price" text="{\
		parts : [{\
			constraints : {scale : \'variable\'},\
			path : \'Price\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'CurrencyCode\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestCurrencyCodes\',\
			targetType : \'any\'\
		}],\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Currency\'\
	}" />\
</FlexBox>',
			that = this;

		this.expectRequest("ProductSet('P1')?foo=baz", {
				ProductID : "P1",
				Price : "12.3",
				CurrencyCode : "EUR"
			})
			.expectRequest("SAP__Currencies?foo=baz&$skip=0&$top=5000", {
				results : [{
					CurrencyCode : "EUR",
					DecimalPlaces : 2,
					ISOCode : "EUR",
					Text : "Euro"
				}]
			})
			.expectValue("amount", "12.30")
			.expectValue("currency", "EUR")
			// "\u00a0" is a non-breaking space
			.expectValue("price", "12.30\u00a0EUR");

		return this.createView(assert, sView, oModel).then(function () {
			oAmountControl = that.oView.byId("amount");
			oCurrencyControl = that.oView.byId("currency");

			that.expectValue("amount", "")
				.expectValue("price", "");

			// code under test
			oAmountControl.setValue("");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oAmountControl, "None", ""),
				that.checkValueState(assert, oCurrencyControl, "None", "")
			]);
		}).then(function () {
			that.expectValue("amount", "12.00")
				.expectValue("amount", "12.00") //TODO why twice?
				.expectValue("price", "12.00\u00a0EUR");

			// code under test
			oAmountControl.setValue("12");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oAmountControl, "None", ""),
				that.checkValueState(assert, oCurrencyControl, "None", "")
			]);
		}).then(function () {
			that.expectValue("currency", "")
				.expectValue("price", "12.00");

			// code under test
			oCurrencyControl.setValue("");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oAmountControl, "None", ""),
				that.checkValueState(assert, oCurrencyControl, "None", "")
			]);
		}).then(function () {
			that.expectValue("amount", "98.70")
				.expectValue("amount", "98.70") //TODO why twice?
				.expectValue("price", "98.70");

			// code under test - as currency code is still missing no value should be displayed
			oAmountControl.setValue("98.7");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oAmountControl, "None", ""),
				that.checkValueState(assert, oCurrencyControl, "None", "")
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Unit values with showNumber and showMeasure.
	// BCP: 2170063390
	//TODO: activate the test if NumberFormat considers showNumber===false (do not format the
	// unit to empty string if the measure is cleared and vice versa
	QUnit.skip("OData Unit type with showNumber and showMeasure", function (assert) {
		var oMeasureControl, oUnitControl,
			oModel = createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC?foo=baz", {
				defaultBindingMode : "TwoWay",
				tokenHandling : false
			}),
			sView = '\
<FlexBox binding="{/ProductSet(\'P1\')}">\
	<Input id="measure" value="{\
		parts : [{\
			constraints : {scale : \'variable\'},\
			path : \'WeightMeasure\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'WeightUnit\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestUnitsOfMeasure\',\
			targetType : \'any\'\
		}],\
		formatOptions : {emptyString : null, showMeasure : false},\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Unit\'\
	}" />\
	<Input id="unit" value="{\
		parts : [{\
			constraints : {scale : \'variable\'},\
			path : \'WeightMeasure\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'WeightUnit\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestUnitsOfMeasure\',\
			targetType : \'any\'\
		}],\
		formatOptions : {emptyString : null, showNumber : false},\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Unit\'\
	}" />\
	<Text id="weight" text="{\
		parts : [{\
			constraints : {scale : \'variable\'},\
			path : \'WeightMeasure\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'WeightUnit\',\
			type : \'sap.ui.model.odata.type.String\'\
		}, {\
			mode : \'OneTime\',\
			path : \'/##@@requestUnitsOfMeasure\',\
			targetType : \'any\'\
		}],\
		mode : \'TwoWay\',\
		type : \'sap.ui.model.odata.type.Unit\'\
	}" />\
</FlexBox>',
			that = this;

		this.expectRequest("ProductSet('P1')?foo=baz", {
				ProductID : "P1",
				WeightMeasure : "12.34",
				WeightUnit : "KG"
			})
			.expectRequest("SAP__UnitsOfMeasure?foo=baz&$skip=0&$top=5000", {
				results : [{
					DecimalPlaces : 3,
					ExternalCode : "KG",
					ISOCode : "KGM",
					Text : "Kilogramm",
					UnitCode : "KG"
				}]
			})
			.expectValue("measure", "12.340")
			.expectValue("unit", "KG")
			.expectValue("weight", "12.340 KG");

		return this.createView(assert, sView, oModel).then(function () {
			oMeasureControl = that.oView.byId("measure");
			oUnitControl = that.oView.byId("unit");

			that.expectValue("measure", "")
				.expectValue("weight", "");

			// code under test - empty measure leads to 0??
			oMeasureControl.setValue("");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oMeasureControl, "None", ""),
				that.checkValueState(assert, oUnitControl, "None", "")
			]);
		}).then(function () {
			that.expectValue("measure", "12.000")
				.expectValue("measure", "12.000") //TODO why twice?
				.expectValue("weight", "12.000 KG");

			// code under test
			oMeasureControl.setValue("12");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oMeasureControl, "None", ""),
				that.checkValueState(assert, oUnitControl, "None", "")
			]);
		}).then(function () {
			that.expectValue("measure", "12")
				.expectValue("unit", "")
				.expectValue("weight", "12");

			// code under test
			oUnitControl.setValue("");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oMeasureControl, "None", ""),
				that.checkValueState(assert, oUnitControl, "None", "")
			]);
		}).then(function () {
			that.expectValue("measure", "98.7")
				.expectValue("weight", "98.7");

			// code under test
			oMeasureControl.setValue("98.7");

			return Promise.all([
				that.waitForChanges(assert),
				that.checkValueState(assert, oMeasureControl, "None", ""),
				that.checkValueState(assert, oUnitControl, "None", "")
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: After entering an invalid currency into an input field with a valid currency this
	// invalid currency is displayed with an error value state.
	// JIRA: CPOUI5MODELS-501
	QUnit.test("TwoFieldSolution: Invalid currency input is kept in control", function (assert) {
		var oControl,
			oModel = new JSONModel({
				Amount : null,
				Currency : null,
				customCurrencies : {
					EUR : {
						StandardCode : "EUR",
						UnitSpecificScale : 2
					}
				}
			}),
			sView = '\
<Input id="currency" value="{\
	parts : [{\
		constraints : {scale : \'variable\'},\
		path : \'/Amount\',\
		type : \'sap.ui.model.odata.type.Decimal\'\
	}, {\
		path : \'/Currency\',\
		type : \'sap.ui.model.odata.type.String\'\
	}, {\
		mode : \'OneTime\',\
		path : \'/customCurrencies\',\
		targetType : \'any\'\
	}],\
	formatOptions : {showNumber : false},\
	mode : \'TwoWay\',\
	type : \'sap.ui.model.odata.type.Currency\'\
}" />',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oControl = that.oView.byId("currency");

			that.expectValue("currency", "EUR");

			oControl.setValue("EUR");

			return Promise.all([
				that.checkValueState(assert, "currency", "None", ""),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("currency", "foo")
				.expectMessages([{
					descriptionUrl: undefined,
					message : "Currency.InvalidMeasure",
					target : oControl.getId() + "/value",
					type : "Error"
				}]);

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("foo");
			});

			return Promise.all([
				that.checkValueState(assert, "currency", "Error", "Currency.InvalidMeasure"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("currency", "EUR")
				.expectMessages([]);

			oControl.setValue("EUR");

			return Promise.all([
				that.checkValueState(assert, "currency", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: On creation (POST) of a new entity, not only the path but also the deep path of
	// the corresponding context is updated. With this, subsequent read requests triggered for
	// dependent bindings using this context use the key predicate of the created entity sent from
	// the back end.
	// BCP: 2170119337
	QUnit.test("createEntry: update deep path of created context", function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="productDetails" binding="{ToProduct}">\
	<Text id="productName" text="{Name}" />\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
					deepPath : "/SalesOrderSet('1')/ToLineItems('~key~')",
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, {
					data : {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						SalesOrderID : "1"
					},
					statusCode : 201
				});

			// code under test
			oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				properties : {}
			});
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						+ "/ToProduct"
				}, {
					__metadata : {
						uri : "ProductSet('P1')"
					},
					Name : "Product 1"
				})
				.expectValue("productName", "Product 1");

			// code under test
			that.oView.byId("productDetails").setBindingContext(oCreatedContext);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Properly assign error responses to the entities caused the error response by using
	// the "ContentID".
	// JIRA: CPOUI5MODELS-275
	QUnit.test("Messages: avoid duplicate messages using ContentID", function (assert) {
		var oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				refreshAfterChange : false,
				tokenHandling : false
			}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet(\'1\')/ToLineItems}" visibleRowCount="2">\
	<Input id="note" value="{Note}" />\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=102", {
				results : [{
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					ItemPosition : "10",
					Note : "Note 10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					ItemPosition : "20",
					Note : "Note 20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("note", ["Note 10", "Note 20"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					data : {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						Note : "foo"
					},
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
					headers : {"Content-ID" : "~key~"},
					key : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
					method : "MERGE",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
				}, {
					body : JSON.stringify({
						error : {
							code : "UF0",
							innererror : {errordetails : [{
								code : "UF0",
								ContentID : "~key~",
								message : "value not allowed",
								severity : "error",
								target : "Note",
								transition : true
							}]},
							message : {value : "value not allowed"}
						}
					}),
					headers : {
						"Content-Type" : "application/json;charset=utf-8",
						ContentID : "~key~"
					},
					statusCode : 400,
					statusText : "Bad Request"
				})
				.expectRequest({
					data : {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
						},
						Note : "bar"
					},
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='20')",
					headers : {"Content-ID" : "~key~"},
					key : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
					method : "MERGE",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
				}, undefined/*not relevant*/)
				.expectValue("note", ["foo", "bar"])
				.expectMessages([{
					fullTarget :
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
					target : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/Note",
					code : "UF0",
					message : "value not allowed",
					persistent : true,
					technical : true,
					type : "Error"
				  }]);

			that.oView.byId("table").getRows()[0].getCells()[0].setValue("foo");
			that.oView.byId("table").getRows()[1].getCells()[0].setValue("bar");

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: MERGE "
						+ "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: MERGE "
						+ "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
					"Another request in the same change set failed", sODataMessageParserClassName);

			// code under test
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Value state of a control with a composite binding is updated when the binding is
	// destroyed.
	// BCP: 2180190002
	QUnit.test("Composite Binding: Value state updated after binding removal", function (assert) {
		var oModel = new JSONModel({
				RequestedQuantity : "-1",
				RequestedQuantityUnit : "mass-kilogram"
			}),
			sView = '\
<Input id="quantity" value="{\
		formatOptions : {showMeasure : false},\
		parts : [{\
			path : \'/RequestedQuantity\',\
			type : \'sap.ui.model.odata.type.Decimal\'\
		}, {\
			path : \'RequestedQuantityUnit\',\
			type : \'sap.ui.model.odata.type.String\'\
		}],\
		type : \'sap.ui.model.type.Unit\'\
	}" />',
			that = this;

		this.expectValue("quantity", "-1");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectMessages([{
					descriptionUrl : undefined,
					message : "Some message",
					target : "/RequestedQuantity",
					type : "Error"
				}]);

			sap.ui.getCore().getMessageManager().addMessages(new Message({
				message: "Some message",
				processor: oModel,
				target: "/RequestedQuantity",
				type: "Error"
			}));

			return Promise.all([
				that.checkValueState(assert, "quantity", "Error", "Some message"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("quantity", "");

			// code under test
			that.oView.byId("quantity").unbindProperty("value");

			return Promise.all([
				that.checkValueState(assert, "quantity", "None", ""),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: The total number of entities can be requested from the v2.ODataListBinding.
	// JIRA: CPOUI5MODELS-577
	QUnit.test("ODLB#getCount returns final count", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=100", {
				results : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002"]);

		return this.createView(assert, sView, oModel).then(function () {

			// code under test
			assert.strictEqual(that.oView.byId("table").getBinding("items").getCount(), 2);
		});
	});

	//*********************************************************************************************
	// Scenario: Set created context as binding context for a table with a relative list binding.
	// The table becomes empty and there is no request.
	// JIRA: CPOUI5MODELS-605, CPOUI5MODELS-612
	QUnit.test("ODLB: transient context, no request", function (assert) {
		var oCreatedContext,
			sView = '\
<FlexBox id="objectPage">\
	<Text id="salesOrderId" text="{SalesOrderID}" />\
	<t:Table id="table" rows="{ToLineItems}" visibleRowCount="2">\
		<Text id="itemPosition" text="{ItemPosition}" />\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectValue("itemPosition", ["", ""]);

		return this.createView(assert, sView).then(function () {
			that.expectValue("salesOrderId", "42");

			// code under test - no requests are executed
			oCreatedContext = that.oModel.createEntry("/SalesOrderSet",
				{properties : {SalesOrderID : "42"}});
			that.oView.byId("objectPage").bindElement({path : oCreatedContext.getPath()});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest("SalesOrderSet('1')", {
					Note : "Note 1",
					SalesOrderID : "1"
				})
				.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=102", {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						},
						ItemPosition : "10",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20~1~')"
						},
						ItemPosition : "20",
						SalesOrderID : "1"
					}]
				})
				.expectValue("salesOrderId", "1")
				.expectValue("itemPosition", ["10", "20"]);

			// code under test
			that.oView.byId("objectPage").bindElement({path : "/SalesOrderSet('1')"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderId", "4711")
				.expectValue("itemPosition", ["", ""]);

			// code under test - no requests are executed
			oCreatedContext = that.oModel.createEntry("/SalesOrderSet",
				{properties : {SalesOrderID : "4711"}});
			that.oView.byId("objectPage").bindElement({path : oCreatedContext.getPath()});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Set created context as binding context for a flex box with a relative context
	// binding. The flex box becomes empty and there is no request.
	// JIRA: CPOUI5MODELS-612
	QUnit.test("ODCB: transient context, no request", function (assert) {
		var oCreatedContext,
			sView = '\
<FlexBox id="salesOrder">\
	<Text id="salesOrderId" text="{SalesOrderID}" />\
	<FlexBox id="businessPartner" binding="{ToBusinessPartner}">\
		<Text id="businessPartnerId" text="{BusinessPartnerID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView).then(function () {
			that.expectValue("salesOrderId", "42");

			// code under test - no requests are executed
			oCreatedContext = that.oModel.createEntry("/SalesOrderSet",
				{properties : {SalesOrderID : "42"}});
			that.oView.byId("salesOrder").bindElement({path : oCreatedContext.getPath()});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest("SalesOrderSet('1')", {
					SalesOrderID : "1"
				})
				.expectRequest("SalesOrderSet('1')/ToBusinessPartner", {
					__metadata : {uri : "/BusinessPartnerSet('BP1')"},
					BusinessPartnerID : "A"
				})
				.expectValue("salesOrderId", "1")
				.expectValue("businessPartnerId", "A");

			// code under test
			that.oView.byId("salesOrder").bindElement({path : "/SalesOrderSet('1')"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderId", "4711")
				.expectValue("businessPartnerId", "");

			// code under test - no requests are executed
			oCreatedContext = that.oModel.createEntry("/SalesOrderSet",
				{properties : {SalesOrderID : "4711"}});
			that.oView.byId("salesOrder").bindElement({path : oCreatedContext.getPath()});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: When scrolling in a table then, the ODataListBinding requests an appropriate number
	// of items according to the defined threshold. See implementation of
	// ODataUtils#_getReadIntervals.
	// JIRA: CPOUI5MODELS-605
	QUnit.test("ODataListBinding paging and gap calculation", function (assert) {
		var oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" threshold="10" visibleRowCount="2">\
	<Text id="textId" text="{SalesOrderID}" />\
</t:Table>',
			that = this;

		function getItems(iStart, iLength) {
			var i, aItems = [];

			for (i = 0; i < iLength; i += 1) {
				aItems.push({
					__metadata : {
						uri : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet" +
							"('" + iStart + "')"
					},
					SalesOrderID : "ID " + iStart
				});
				iStart += 1;
			}

			return aItems;
		}

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=12&$inlinecount=allpages", {
				__count : "550",
				results : getItems(0, 12)
			})
			.expectValue("textId", "ID 0", 0)
			.expectValue("textId", "ID 1", 1);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectRequest("SalesOrderSet?$skip=12&$top=6", {
					results : getItems(12, 6)
				})
				.expectValue("textId", "ID 6", 6)
				.expectValue("textId", "ID 7", 7);

			// code under test
			// when setting the first visible row to 6
			// the next 7 entries are checked if they are available (iLength + threshold / 2)
			// because only indices 0 to 11 are loaded, and the 12th one is not, we expect a request
			// reading entries up to index 18 (iStart + iLength + threshold)
			oTable.setFirstVisibleRow(6);

			return that.waitForChanges(assert);
		}).then(function () {
			// Not visible in test output because correct values are only output up to index 10
			that.expectValue("textId", "ID 11", 11)
				.expectValue("textId", "ID 12", 12);

			// code under test
			// when setting the first visible row to 11
			// the next 7 entries are checked if they are available (iLength + threshold / 2)
			// because indices 0 to 17 are loaded, no request needed
			oTable.setFirstVisibleRow(11);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet?$skip=90&$top=22", {
					results : getItems(90, 22)
				})
				.expectValue("textId", "", 100) //TODO: Why do these values come?
				.expectValue("textId", "", 101) //TODO: Why do these values come?
				.expectValue("textId", "ID 100", 100)
				.expectValue("textId", "ID 101", 101);

			// code under test
			// when setting the first visible row to 100
			// the next 7 entries are checked if they are available (iLength + threshold / 2) and
			// the previous 5 entries are checked (threshold / 2)
			// because only indices 0 to 17 are loaded, and the item 95 is not, we expect a request
			// reading entries up to index 112 (iLength + threshold * 2)
			// these are the 2 visible rows plus 10 entries before and behind them
			oTable.setFirstVisibleRow(100);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("textId", "ID 95", 95)
				.expectValue("textId", "ID 96", 96);

			// code under test
			// when setting the first visible row to 95
			// the next 7 entries are checked if they are available (iLength + threshold / 2) and
			// the previous 5 entries are checked (threshold / 2)
			// because indices 90 to 111 are loaded, no request needed
			oTable.setFirstVisibleRow(95);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet?$skip=84&$top=6", {
					results : getItems(84, 6)
				})
				.expectValue("textId", "ID 94", 94)
				.expectValue("textId", "ID 95", 95);

			// code under test
			// when setting the first visible row to 94
			// the next 7 entries are checked if they are available (iLength + threshold / 2) and
			// the previous 5 entries are checked (threshold / 2)
			// because indices 90 to 111 are loaded, but item 89 is not, we expect a request
			// reading entries up to index 90
			oTable.setFirstVisibleRow(94);

			return that.waitForChanges(assert);
		});
	});
});