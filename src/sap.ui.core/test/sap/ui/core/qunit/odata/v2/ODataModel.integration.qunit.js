/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/uid",
	"sap/ui/Device",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	'sap/ui/thirdparty/datajs',
	'sap/ui/util/XMLHelper'
	// load Table resources upfront to avoid loading times > 1 second for the first test using Table
	// "sap/ui/table/Table"
], function (Log, uid, Device, SyncPromise, coreLibrary, Controller, View, CountMode, MessageScope,
		ODataModel, TestUtils, datajs, XMLHelper) {
	/*global QUnit*/
	/*eslint max-nested-callbacks: 0, quote-props: 0*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		MessageType = coreLibrary.MessageType, // shortcut for sap.ui.core.MessageType
		NO_CONTENT = {/*204 no content*/},
		// determine the row in which the entity is expected from the context path
		rRowIndex = /~(\d+)~/,
		/**
		 * Maps back-end response severity values to the values defined in the enumeration
		 * <code>sap.ui.core.MessageType</code>.
		 */
		mSeverityMap = {
			"error" : MessageType.Error,
			"warning" : MessageType.Warning,
			"success" : MessageType.Success,
			"info" : MessageType.Information
		};

	/**
	 * Clones the given OData message object and replaces the target property of the clone by
	 * the given target path.
	 *
	 * @param {object} oODataMessage
	 *   An OData message object as returned by <code>createResponseMessage</code>
	 * @param {string} sTarget
	 *   The new target
	 * @returns {object}
	 *   The cloned OData message object with the replaced target
	 */
	function cloneODataMessage(oODataMessage, sTarget) {
		return Object.assign({}, oODataMessage, {target : sTarget});
	}

	/**
	 * Creates an error response object for a technical error (http status code = 4xx/5xx).
	 *
	 * @param {int} [iStatusCode=500]
	 *   The HTTP status code
	 * @param {string} [sMessage="Internal Server Error"]
	 *   The message text
	 * @param {string} [sMessageCode="UF0"]
	 *   The message code
	 * @returns {object}
	 *   The error response
	 */
	function createErrorResponse(iStatusCode, sMessage, sMessageCode) {
		sMessage = sMessage || "Internal Server Error";
		sMessageCode = sMessageCode || "UF0";
		iStatusCode = iStatusCode || 500;

		return {
			statusCode : iStatusCode,
			body : JSON.stringify({
				"error" : {
					"message" : {
						"value" : sMessage
					},
					"code" : sMessageCode
				}
			})
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
	 * @param {boolean} [mModelParameters.useBatch=false]
	 *   Whether all requests should be sent in batch requests
	 * @returns {sap.ui.model.odata.v2.ODataModel} The model
	 */
	function createModel(sServiceUrl, mModelParameters) {
		var mDefaultParameters = {
				defaultCountMode : CountMode.None,
				serviceUrl : sServiceUrl,
				useBatch : false
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
		var oChildNode, aChildNodes, iColumnCount, aColumnNodes, oColumnsElement, oDocument,
			oElement, bHasColumns, i, j, k, aTableElements;

		oDocument = XMLHelper.parse(
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:t="sap.ui.table">'
			+ sViewXML
			+ '</mvc:View>',
			"application/xml"
		);
		aTableElements = oDocument.getElementsByTagNameNS("sap.m", "Table");
		iColumnCount = 0;
		for (i = aTableElements.length - 1; i >= 0; i -= 1) {
			oElement = aTableElements[i];

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

						for (k = aColumnNodes.length - 1; k >= 0; k -= 1) {
							if (aColumnNodes[k].nodeType === 1) { // Node.ELEMENT_NODE
								iColumnCount += 1;
							}
						}
						break;
					// no default
				}
			}
			if (iColumnCount) {
				if (bHasColumns) {
					throw new Error("Do not use <columns> in sap.m.Table");
				}
				oColumnsElement = oDocument.createElementNS("sap.m", "columns");
				while (iColumnCount > 0) {
					oColumnsElement.appendChild(oDocument.createElementNS("sap.m", "Column"));
					iColumnCount -= 1;
				}
				oElement.appendChild(oColumnsElement);
			}
		}

		return oDocument;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataModel.integration", {
		beforeEach : function () {
			// We use a formatter to check for property changes. However before the formatter is
			// called, the value is passed through the type's formatValue
			// (see PropertyBinding#_toExternalValue). Ensure that this result is predictable.
			sap.ui.getCore().getConfiguration().setLanguage("en-US");

			// These metadata files are _always_ faked, the query option "realOData" is ignored
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit", {
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata"
					: {source : "model/GWSAMPLE_BASIC.metadata.xml"},
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/annotations.xml"
					: {source : "model/GWSAMPLE_BASIC.annotations.xml"},
				// GWSAMPLE_BASIC service with sap:message-scope-supported="true"
				"/SalesOrderSrv/$metadata"
					: {source : "testdata/SalesOrder/metadata.xml"},
				"/sap/opu/odata/sap/PP_WORKCENTER_GROUP_SRV/$metadata"
					: {source : "model/PP_WORKCENTER_GROUP_SRV.metadata.xml"}
			});
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("fatal").never();

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

			// check only a subset of properties
			aCurrentMessages = aCurrentMessages.map(function (oMessage) {
				return {
					code : oMessage.code,
					descriptionUrl : oMessage.descriptionUrl,
					fullTarget : oMessage.fullTarget,
					message : oMessage.message,
					persistent : oMessage.persistent,
					target : oMessage.target,
					technical : oMessage.technical,
					type : oMessage.type
				};
			});

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
				if (oExpectedRequest.url === oActualRequest.url) {
					this.aRequests.splice(i, 1);
					return oExpectedRequest;
				}
			}
		},

		/**
		 * Creates an OData message object that can be passed as input parameter to
		 * <code>getMessageHeader</code>.
		 *
		 * @param {string} [sTarget=""]
		 *   The target
		 * @param {string} [sMessage="message-~i~"]
		 *   The message text; if not given, "message-~i~" is used, where ~i~ is a generated number
		 * @param {string} [sSeverity="error"]
		 *   The message severity; either "error", "warning", "success" or "info"
		 * @returns {object}
		 *   An OData message object with following properties: <code>code</code> with the value
		 *   "code-~i~" (where ~i~ is a generated number), <code>message</code>,
		 *   <code>severity</code> and <code>target</code>
		 */
		createResponseMessage : function (sTarget, sMessage, sSeverity) {
			var i = this.iODataMessageCount;

			this.iODataMessageCount += 1;

			return {
				code : "code-" + i,
				message : sMessage || "message-" + i,
				severity : sSeverity || "error",
				target : sTarget || ""
			};
		},

		/**
		 * Creates the view and attaches it to the model. Checks that the expected requests (see
		 * {@link #expectRequest} are fired and the controls got the expected changes (see
		 * {@link #expectChange}).
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sViewXML The view content as XML
		 * @param {sap.ui.model.odata.v2.ODataModel} [oModel] The model; it is attached to the view
		 *   and to the test instance.
		 *   If no model is given, <code>createSalesOrdersModel</code> is used.
		 * @param {object} [oController]
		 *   An object defining the methods and properties of the controller
		 * @returns {Promise} A promise that is resolved when the view is created and all expected
		 *   values for controls have been set
		 */
		createView : function (assert, sViewXML, oModel, oController) {
			var that = this;

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

			/*
			 * Checks that all requests in a batch are as expected and handles its response.
			 */
			function checkBatchRequest(oRequest, fnSuccess, fnError) {
				/**
				 * Helper function to pass through the return of checkSingleRequest
				 * @param {object} oData An application-specific payload object
				 * @param {object} oResponse The response value of a proceeded single request
				 * @returns {object} The response value of a proceeded single request
				 */
				function fnCallbackHelper(oData, oResponse) {
					return oResponse;
				}

				/**
				 * Processes a request within a batch
				 * @param {object} oRequest The request
				 * @returns {object} The processed response object of datajs#request
				 */
				function processRequest(oRequest) {
					// TODO: correct error handling
					return checkSingleRequest(oRequest, fnCallbackHelper, fnCallbackHelper);
				}

				/**
				 * @param {object} oRequest A batch request object that contains an array of
				 *   requests
				 * @returns {object} The executed success handler of datajs#request
				 */
				function processRequests(oRequest) {
					var aRequests = oRequest.data.__batchRequests;

					return Promise.all(
						aRequests.map(processRequest)
					).then(function (aResponses) {
						// TODO: correct error handling
						var oBatchResponse = {
							data : {
								__batchResponses : aResponses
							}
						};

						return fnSuccess(oBatchResponse.data, oBatchResponse);
					});
				}

				return processRequests(oRequest);
			}

			/*
			 * Checks that the expected request arrived and handles its response. This is used
			 * individual for single requests or as reused part of batch requests.
			 */
			function checkSingleRequest(oActualRequest, fnSuccess, fnError, oHandler, oHttpClient,
					oMetadata) {
				var oExpectedRequest = that.consumeExpectedRequest(oActualRequest),
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
				mHeaders = oActualRequest.headers;
				delete mHeaders["Accept"];
				delete mHeaders["Accept-Language"];
				delete mHeaders["Content-Type"];
				delete mHeaders["DataServiceVersion"];
				delete mHeaders["MaxDataServiceVersion"];
				delete mHeaders["sap-cancel-on-close"];
				delete mHeaders["sap-contextid-accept"];
				delete oActualRequest["_handle"];
				delete oActualRequest["async"];
				delete oActualRequest["deferred"];
				delete oActualRequest["eventInfo"];
				delete oActualRequest["refresh"];
				delete oActualRequest["password"];
				delete oActualRequest["requestID"];
				delete oActualRequest["user"];
				if (oExpectedRequest) {
					if (oExpectedRequest.response === NO_CONTENT) {
						oResponse = {
							statusCode : 204
						};
					} else if (oExpectedRequest.response.statusCode >= 400) {
						oResponse = {
							response : oExpectedRequest.response
						};
					} else {
						oResponse = {
							data : oExpectedRequest.response,
							statusCode : 200
						};

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

					if (sUrl.startsWith(that.oModel.sServiceUrl)) {
						oActualRequest.requestUri = sUrl.slice(that.oModel.sServiceUrl.length + 1);
					}
					bWaitForResponse = !(oResponse && typeof oResponse.then === "function");
					delete oExpectedRequest.response;
					mResponseHeaders = oExpectedRequest.responseHeaders;
					delete oExpectedRequest.responseHeaders;
					assert.deepEqual(oActualRequest, oExpectedRequest, sMethod + " " + sUrl);
					oResponse.headers = mResponseHeaders || {};
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
					if (oResponseBody.statusCode < 300) {
						return fnSuccess({}, oResponseBody);
					} else {
						// TODO: correct error handling
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

			this.oModel = oModel || createSalesOrdersModel();
			this.mock(datajs).expects("request").atLeast(0).callsFake(checkRequest);
			//assert.ok(true, sViewXML); // uncomment to see XML in output, in case of parse issues

			return View.create({
				type : "XML",
				controller : oController && new (Controller.extend(uid(), oController))(),
				definition : xml(sViewXML)
			}).then(function (oView) {
				Object.keys(that.mChanges).forEach(function (sControlId) {
					var oControl = oView.byId(sControlId);

					if (oControl) {
						that.setFormatter(assert, oControl, sControlId);
					}
				});
				Object.keys(that.mListChanges).forEach(function (sControlId) {
					var oControl = oView.byId(sControlId);

					if (oControl) {
						that.setFormatter(assert, oControl, sControlId, true);
					}
				});

				oView.setModel(that.oModel);
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
		 */
		expectChange : function (sControlId, vValue, vRow) {
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
			}

			return this;
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
		 * @param {string|object} vTargetPrefix
		 *   The prefix for the target; if vTargetPrefix is not of type string the given object may
		 *   have following properties: <code>path</code> and <code>isComplete</code>
		 * @param {boolean} vTargetPrefix.isComplete
		 *   Whether <code>vTargetPrefix.path</code> is the complete message target or
		 *   <code>vTargetPrefix.path</code> is a prefix for the <code>oODataMessage.target</code>
		 * @param {string} vTargetPrefix.path
		 *   A path or a path prefix for the target
		 * @param {string} [sFullTargetPrefix=vTargetPrefix]
		 *   The prefix for the full target; if not given <code>vTargetPrefix</code> is also used as
		 *   prefix for the <code>fullTarget</code>
		 * @returns {object}
		 *   The test instance for chaining
		 */
		expectMessage : function (oODataMessage, vTargetPrefix, sFullTargetPrefix) {
			var sTarget, sTargetPrefix;

			if (oODataMessage !== null) {
				if (vTargetPrefix.isComplete) {
					sTargetPrefix = "";
					sTarget = vTargetPrefix.path;
				} else {
					sTargetPrefix = vTargetPrefix.path || vTargetPrefix;
					sTarget = sTargetPrefix + oODataMessage.target;
				}

				this.aMessages.push({
					code : oODataMessage.code,
					descriptionUrl : "",
					fullTarget : (sFullTargetPrefix || sTargetPrefix) + oODataMessage.target,
					message : oODataMessage.message,
					persistent : false,
					target : sTarget,
					technical : false,
					type : mSeverityMap[oODataMessage.severity]
				});
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
			if (!Array.isArray(vExpectedMessages)) {
				vExpectedMessages = [vExpectedMessages];
			}
			this.aMessages = vExpectedMessages.map(function (oMessage) {
				oMessage.descriptionUrl = oMessage.descriptionUrl || "";
				oMessage.technical = oMessage.technical || false;
				return oMessage;
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
		 * @param {string|object} vRequest The request with the properties "method", "url" and
		 *   "headers". A string is interpreted as URL with method "GET". Spaces inside the URL are
		 *   percent-encoded automatically.
		 * @param {object|Promise|Error} [oResponse] The response message to be returned from the
		 *   requestor or a promise on it
		 * @param {object} [mResponseHeaders] The response headers to be returned from the
		 *   requestor
		 * @returns {object} The test instance for chaining
		 */
		expectRequest : function (vRequest, oResponse, mResponseHeaders) {
			if (typeof vRequest === "string") {
				vRequest = {
					deepPath : "/" + vRequest.split("?")[0],
					method : "GET",
					requestUri : vRequest
				};
			}
			// ensure that these properties are defined (required for deepEqual)
			vRequest.headers = vRequest.headers || {};
			vRequest.responseHeaders = mResponseHeaders || {};
			vRequest.response = oResponse || {/*null object pattern*/};
			vRequest.requestUri = vRequest.requestUri.replace(/ /g, "%20");
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
		 * Sets the formatter function which calls {@link #checkValue} for the given control.
		 * Note that you may only use controls that have a 'text' or a 'value' property.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {sap.ui.base.ManagedObject} oControl The control
		 * @param {string} sControlId The (symbolic) control ID for which changes are expected
		 * @param {boolean} [bInList] Whether the control resides in a list item
		 */
		setFormatter : function (assert, oControl, sControlId, bInList) {
			var oBindingInfo = oControl.getBindingInfo("text") || oControl.getBindingInfo("value"),
				fnOriginalFormatter = oBindingInfo.formatter,
				oType = oBindingInfo.type,
				bIsCompositeType = oType && oType.getMetadata().isA("sap.ui.model.CompositeType"),
				that = this;

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

	/**
	 *
	 * Creates a test with the given title and executes viewStart with the given parameters.
	 *
	 * @param {string} sTitle The title of the test case
	 * @param {string} sView The XML snippet of the view
	 * @param {object} mResponseByRequest A map containing the request as key
	 *   and response as value
	 * @param {object|object[]} mValueByControl A map or an array of maps containing control id as
	 *   key and the expected control values as value
	 * @param {string|sap.ui.model.odata.v4.ODataModel} [vModel]
	 *   The model (or the name of a function at <code>this</code> which creates it); it is attached
	 *   to the view and to the test instance.
	 *   If no model is given, the <code>GWSAMPLE_BASIC</code> model is created and used.
	 * @param {function} [fnAssert]
	 *   A function containing additional assertions such as expected log messages which is called
	 *   just before view creation with the test as "this"
	 */
	function testViewStart(sTitle, sView, mResponseByRequest, mValueByControl, vModel, fnAssert) {

		QUnit.test(sTitle, function (assert) {
			var sControlId, sRequest, that = this;

			function expectChanges(mValueByControl) {
				for (sControlId in mValueByControl) {
					that.expectChange(sControlId, mValueByControl[sControlId]);
				}
			}

			for (sRequest in mResponseByRequest) {
				this.expectRequest(sRequest, mResponseByRequest[sRequest]);
			}
			if (Array.isArray(mValueByControl)) {
				mValueByControl.forEach(expectChanges);
			} else {
				expectChanges(mValueByControl);
			}
			if (typeof vModel === "string") {
				vModel = this[vModel]();
			}
			if (fnAssert) {
				fnAssert.call(this);
			}

			return this.createView(assert, sView, vModel);
		});
	}

	//*********************************************************************************************
	// Scenario: Read and display data for a single field in a form
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	testViewStart("Minimal integration test", '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>',
		{"SalesOrderSet('1')" : {SalesOrderID : "1"}},
		[{"id" : null}, {"id" : "1"}]
	);

	//*********************************************************************************************
	// Scenario: Read and display data for a single field in a form
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test (useBatch=true)", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : true}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectChange("id", null)
			.expectChange("id", "1");

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Read and display collection data for a table with a single field
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test with collection data", function (assert) {
		var sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("SalesOrderSet?$skip=0&$top=100", {
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
	// Scenario: Read and display collection data for a table with a single field
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("Minimal integration test with collection data (useBatch=true)", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : true}),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
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
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Message with empty target (tested as single request and as batch request)
[false, true].forEach(function (bUseBatch) {
	QUnit.test("Messages: empty target (useBatch=" + bUseBatch + ")", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : bUseBatch}),
			oResponseMessage = this.createResponseMessage(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id" text="{SalesOrderID}" />\
</FlexBox>';

		if (bUseBatch) {
			this.expectHeadRequest();
		}

		this.expectRequest("SalesOrderSet('1')", {SalesOrderID : "1"},
				{"sap-message" : getMessageHeader(oResponseMessage)})
			.expectChange("id", null)
			.expectChange("id", "1")
			.expectMessage(oResponseMessage, "/SalesOrderSet('1')");

		// code under test
		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: Message with a simple target in a complex data type
	// JIRA: CPOUI5MODELS-35
	QUnit.test("Messages: simple target with complex data type", function (assert) {
		var oModel = createSalesOrdersModel(),
			oResponseMessage = this.createResponseMessage("Address/City", "Foo"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'1\')}">\
	<Text id="CompanyName" text="{CompanyName}" />\
	<Input id="City" value="{Address/City}" />\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerSet('1')", {
				CompanyName : "SAP SE",
				Address : {
					City : "Walldorf"
				}
			}, {"sap-message" : getMessageHeader(oResponseMessage)})
			.expectChange("CompanyName", null)
			.expectChange("CompanyName", "SAP SE")
			.expectChange("City", null)
			.expectChange("City", "Walldorf")
			.expectMessage(oResponseMessage,"/BusinessPartnerSet('1')/");

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert, "City", "Error", "Foo");
		});
	});

	//*********************************************************************************************
	// Scenario: Messages with a http status code of 4xx/5xx are expected to be technical
	// JIRA: CPOUI5MODELS-103
[
	{statusCode : 400, message : "Bad Request"},
	{statusCode : 500, message : "Internal Server Error"}
].forEach(function (oFixture) {
	var sTitle = "Messages: http status code '" + oFixture.statusCode + "' expects a technical "
			+ "error message";

	QUnit.test(sTitle , function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text text="{SalesOrderID}" />\
</FlexBox>';

		this.oLogMock.expects("fatal").once();

		this.expectRequest("SalesOrderSet('1')",
				createErrorResponse(oFixture.statusCode, oFixture.message))
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
		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: Error responses that contain messages within the response body (technical messages)
	// will not process any messages if the http status code is <400.
	// JIRA: CPOUI5MODELS-103
	QUnit.test("Messages: messages within a response body are not processed if http status code is "
			+ "'200'", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text text="{SalesOrderID}" />\
</FlexBox>';

		this.expectRequest("SalesOrderSet('1')", createErrorResponse(200))
			.expectMessages([]); // clean all expected messages

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Messages are bound against targets with a deeper path (more than one navigation
	// property). Tested with simple type (productName) and complex type (supplierAddress).
	// JIRA: CPOUI5MODELS-103
	QUnit.test("Messages: more than one navigation property", function (assert) {
		var oModel = createSalesOrdersModel(),
			oMsgProductName = this.createResponseMessage("Name", "Foo"),
			oMsgSupplierAddress = this.createResponseMessage("Address/City", "Bar", "warning"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderId" text="{SalesOrderID}" />\
	<Table id="table" items="{ToLineItems}">\
		<ColumnListItem>\
			<Text id="itemPosition" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<FlexBox id="detailProduct" binding="{ToProduct}">\
	<Input id="productName" value="{Name}" />\
</FlexBox>\
<FlexBox id="detailSupplier" binding="{ToSupplier}">\
	<Input id="supplierAddress" value="{Address/City}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderSet('1')", {
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
		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')/ToProduct",
					method : "GET",
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
					method : "GET",
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
	QUnit.test("Messages: check value state", function (assert) {
		var oModel = createSalesOrdersModel(),
			oMsgGrossAmount = this.createResponseMessage("GrossAmount", "Foo", "warning"),
			oMsgNote = this.createResponseMessage("Note", "Bar"),
			that = this,
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="Note" value="{Note}" />\
	<Input id="GrossAmount" value="{GrossAmount}" />\
	<Input id="LifecycleStatusDescription" value="{LifecycleStatusDescription}" />\
</FlexBox>';

		this.expectRequest("SalesOrderSet('1')", {
				GrossAmount : "GrossAmount A",
				LifecycleStatusDescription : "LifecycleStatusDescription A",
				Note : "Note A"
			}, {"sap-message" : getMessageHeader([oMsgNote, oMsgGrossAmount])})
			.expectChange("Note", null)
			.expectChange("Note", "Note A")
			.expectChange("GrossAmount", null)
			.expectChange("GrossAmount", "GrossAmount A")
			.expectChange("LifecycleStatusDescription", null)
			.expectChange("LifecycleStatusDescription", "LifecycleStatusDescription A")
			.expectMessage(oMsgNote, "/SalesOrderSet('1')/")
			.expectMessage(oMsgGrossAmount, "/SalesOrderSet('1')/");

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			return Promise.all([
				that.checkValueState(assert, "Note", "Error", "Bar"),
				that.checkValueState(assert, "GrossAmount", "Warning", "Foo"),
				that.checkValueState(assert, "LifecycleStatusDescription", "None", "")
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
			oModel = createSalesOrdersModel(),
			that = this,
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>';

		this.expectRequest("SalesOrderSet('1')", {
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
			.expectChange("note", null)
			.expectChange("note", "NoteA")
			.expectMessages([oExpectedMessage]);

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert, "note", "Error", "Foo");
		}).then(function () {
			that.expectRequest("SalesOrderSet('1')", {
					SalesOrderID : "1",
					Note : "NoteB"
				})
				.expectChange("note", "NoteB")
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
			oMsgSalesOrder = this.createResponseMessage(),
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
		<ColumnListItem>\
			<Text id="itemPosition" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				method : "GET",
				requestUri : "SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader([oMsgSalesOrder, oMsgSalesOrderToLineItems1])})
			.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				method : "GET",
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
					method : "GET",
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
					method : "GET",
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
					method : "GET",
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
	<ColumnListItem>\
		<Text id="itemPosition" text="{ItemPosition}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest({
				deepPath : "/SalesOrderSet('1')/ToLineItems",
				method : "GET",
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
					method : "GET",
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
			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Cleanup messages of the entity and its child entities after updating the root
	// entity if message scope is "BusinessObject".
	// BCP: 1980510782
[
	MessageScope.BusinessObject,
	MessageScope.RequestedObjects
].forEach(function (sMessageScope) {
	[true, false].forEach(function (bRefreshAfterChange) {
	var bCleanupChildMessages = sMessageScope === MessageScope.BusinessObject,
		sTitle = "Messages: Changing a value removes obsolete child messages only if message scope"
			+ " is BusinessObject; message scope is '" + sMessageScope + "'; refresh after change: "
			+ bRefreshAfterChange;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelMessageScope({refreshAfterChange : bRefreshAfterChange}),
			oMsgSalesOrder = this.createResponseMessage("", "MsgSalesOrder"),
			oMsgSalesOrderCustomerID = this.createResponseMessage("CustomerID",
				"MsgSalesOrderCustomerID", "warning"),
			oMsgSalesOrderItem = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='1')/ItemPosition"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="customerID" value="{CustomerID}" />\
</FlexBox>',
			that = this;

		this.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				method : "GET",
				requestUri : "SalesOrderSet('1')",
				headers : bCleanupChildMessages ? {"sap-message-scope" : "BusinessObject"} : {}
			}, {
				CustomerID : "42"
			}, {
				"sap-message" : getMessageHeader([oMsgSalesOrder,oMsgSalesOrderCustomerID,
					oMsgSalesOrderItem])
			})
			.expectChange("customerID", null)
			.expectChange("customerID", "42")
			.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')")
			.expectMessage(oMsgSalesOrderCustomerID, "/SalesOrderSet('1')/")
			.expectMessage(oMsgSalesOrderItem, {
				isComplete : true,
				path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')/ItemPosition"
			}, "/SalesOrderSet('1')/");

		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			var oNewMsgForCustomerID = that.createResponseMessage("CustomerID");

			that.expectChange("customerID", "13")
				.expectHeadRequest(bCleanupChildMessages
					? {"sap-message-scope" : "BusinessObject"} : {})
				.expectRequest({
					data : {
						CustomerID : "13",
						"__metadata" : {"uri" : "SalesOrderSet('1')"}
					},
					deepPath : "/SalesOrderSet('1')",
					headers : bCleanupChildMessages
						? {
							"sap-message-scope" : "BusinessObject",
							"x-http-method" : "MERGE"
						} : {"x-http-method" : "MERGE"},
					key : "SalesOrderSet('1')",
					method : "POST",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT, {
					"sap-message" : getMessageHeader(oNewMsgForCustomerID)
				});
			if (bRefreshAfterChange) {
				that.expectRequest({
						deepPath : "/SalesOrderSet('1')",
						method : "GET",
						requestUri : "SalesOrderSet('1')",
						headers : bCleanupChildMessages
						? {"sap-message-scope" : "BusinessObject"} : {}
					}, {
						CustomerID : "13"
					}, {
						"sap-message" : getMessageHeader(oNewMsgForCustomerID)
					});
			}
			that.expectMessages([]); // clean all expected messages
			if (!bCleanupChildMessages) {
				that.expectMessage(oMsgSalesOrderItem, {
					isComplete : true,
					path : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')/ItemPosition"
				}, "/SalesOrderSet('1')/");
			}
			that.expectMessage(oNewMsgForCustomerID, "/SalesOrderSet('1')/");

			// code under test
			// Scenario: updating customer id replaces messages for the sales order and its children
			oModel.setProperty("/SalesOrderSet('1')/CustomerID", "13");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});
	});
});

	//*********************************************************************************************
	// Scenario: Refresh of navigation properties previously pointing to the *same* entity responds
	// with a different entity for one of the navigation properties. Both navigation properties show
	// correct data on the UI; bug was: the unchanged navigation property is updated with data
	// from the changed one.
	// BCP: 1980535595
	QUnit.test("BCP 1980535595: refresh navigation properties to same entity", function (assert) {
		var sAdminDataPath =
				"/C_WorkCenterGroupAdminvData(ObjectTypeCode='G',ObjectInternalID='10000425')",
			oModel = createPPWorkcenterGroupModel({preliminaryContext : true}),
			sWCGroupToAdminDataRequest = "C_WorkCenterGroupTree(HierarchyRootNode='10000425'"
				+ ",HierarchyParentNode='00000000',HierarchyNode='10000425',HierarchyNodeType='G')"
				+ "/to_AdminData",
			sView = '\
<FlexBox id="objectPage" binding="{/' + sWCGroupToAdminDataRequest + '}">\
	<Text id="id" text="{ObjectInternalID}" />\
	<FlexBox id="createByUser" binding="{\
			path :\'to_CreatedByUserContactCard\',\
			parameters : {select : \'FullName\'}\
		}">\
		<Text id="name0" text="{FullName}" />\
	</FlexBox> \
	<FlexBox binding="{to_LastChangedByUserContactCard}">\
		<Text id="name1" text="{FullName}" />\
	</FlexBox> \
</FlexBox>',
			that = this;

		this.expectRequest(sWCGroupToAdminDataRequest, {
				"__metadata" : {"uri" : sAdminDataPath},
				ObjectTypeCode : "G",
				ObjectInternalID : "10000425"
			})
			.expectRequest(sWCGroupToAdminDataRequest
					+ "/to_CreatedByUserContactCard?$select=FullName", {
				"__metadata" : {"uri" : "/I_UserContactCard('Smith')"},
				FullName : "Smith"
			})
			.expectRequest(sWCGroupToAdminDataRequest + "/to_LastChangedByUserContactCard", {
				"__metadata" : {"uri" : "/I_UserContactCard('Smith')"},
				FullName : "Smith"
			})
			.expectChange("id", null)
			.expectChange("id", "10000425")
			.expectChange("name0", null)
			.expectChange("name0", "Smith")
			.expectChange("name1", null)
			.expectChange("name1", "Smith");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(sWCGroupToAdminDataRequest, {
					"__metadata" : {"uri" : sAdminDataPath},
					ObjectTypeCode : "G",
					ObjectInternalID : "10000425"
				})
				.expectRequest(sWCGroupToAdminDataRequest
						+ "/to_CreatedByUserContactCard?$select=FullName", {
					"__metadata" : {"uri" : "/I_UserContactCard('Smith')"},
					FullName : "Smith"
				})
				.expectRequest(sWCGroupToAdminDataRequest + "/to_LastChangedByUserContactCard", {
					"__metadata" : {"uri" : "/I_UserContactCard('Muller')"},
					FullName : "Muller"
				})
				.expectChange("name1", "Muller");

			// code under test: refresh keeps canonical path for "/I_UserContactCard('Smith')" in
			// ODataModel#mPathCache and does *not* replace it by "/I_UserContactCard('Muller')"
			that.oView.byId("objectPage").getObjectBinding().refresh(/*bForceUpdate*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test: checkUpdate calls ODataModel#createBindingContext which creates a
			// context for the "create by user" field based on the patch cache entry.
			// This only happens if no reload is needed.
			that.oView.byId("createByUser").getObjectBinding().checkUpdate();

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
		<ColumnListItem>\
			<Text id="itemPosition" text="{ItemPosition}" />\
			<Input id="grossAmount::item" value="{GrossAmount}" />\
			<Input id="currencyCode" value="{CurrencyCode}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderSet('1')", {
				"__metadata" : {"uri" : "SalesOrderSet('1')"},
				GrossAmount : "0.00",
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader(oSalesOrderGrossAmountError)})
			.expectChange("salesOrderID", null)
			.expectChange("salesOrderID", "1")
			.expectChange("grossAmount", null)
			.expectChange("grossAmount", "0.00")
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
				results : [{
					"__metadata" : {
						"uri" : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
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
					"deepPath" : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10~0~')",
					"headers" : {},
					"method" : "GET",
					"requestUri" : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						+ "?$expand=ToHeader"
				}, {
					"__metadata" : {
						"uri" : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					SalesOrderID : "1",
					ItemPosition : "10~0~",
					GrossAmount : "1000.00",
					ToHeader : {
						"__metadata" : {
							"uri" : "SalesOrderSet('1')"
						},
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
				urlParameters : {"$expand" : "ToHeader"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: On an object page a sales order with its sales order items is displayed. All the
	// sales order items are returned with the initial request. Check the lifecycle of stateful
	// OData messages.
	// Expectation: All messages for the sales order and all messages for the sales order items are
	// displayed. In case of message scope BusinessObject also messages for sub entities are
	// displayed.
	// JIRA: CPOUI5MODELS-111
[true, false].forEach(function (bWithMessageScope) {
	var sTitle = "Message lifecycle (1), "
			+ (bWithMessageScope ? "MessageScope.Business" : "MessageScope.Request")
			+ ": Object page with relative list (all items are displayed)";

	QUnit.test(sTitle, function (assert) {
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
	<Table id="table" items="{ToLineItems}">\
		<ColumnListItem>\
			<Text id="itemPosition" text="{ItemPosition}" />\
			<Input id="note::item" value="{Note}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest({
				deepPath : "/SalesOrderSet('1')",
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				method : "GET",
				requestUri : "SalesOrderSet('1')"
			}, {
				"__metadata" : {"uri" : "SalesOrderSet('1')"},
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
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				method : "GET",
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					"__metadata" : {
						"uri" : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
					},
					Note : "Bar",
					ItemPosition : "10~0~",
					SalesOrderID : "1"
				}]
			}, {
				"sap-message" :
					getMessageHeader([oSalesOrderItemNoteError,oSalesOrderItemPositionError])
			})
			.expectChange("itemPosition", ["10~0~"])
			.expectChange("note::item", ["Bar"])
			.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/")
			.expectMessage(oSalesOrderItemNoteError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(oSalesOrderItemPositionError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(bWithMessageScope ? oSalesOrderToBusinessPartnerAddress : null,
				"/SalesOrderSet('1')/");

		if (bWithMessageScope) {
			oModel.setMessageScope(MessageScope.BusinessObject);
		}

		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: The ODataModel#create API is called with an object retrieved via
	// ODataModel#getObject which may contain properties inside a __metadata property which are not
	// specified by OData so that a request would fail on the server. The request payload is
	// cleaned up before the request is sent.
	// BCP: 002075129400000695502020
	QUnit.test("create payload only contains cleaned up __metadata", function (assert) {
		var oModel = createSalesOrdersModel({tokenHandling : false}),
			sView = '\
<FlexBox binding="{path : \'/SalesOrderSet(\\\'1\\\')\',\
		parameters : {select : \'SalesOrderID,Note\', expand : \'ToLineItems\'}}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
	<Table id="table" items="{path : \'ToLineItems\',\
			parameters : {select : \'ItemPosition,Note,SalesOrderID\'}}">\
		<ColumnListItem>\
			<Text id="itemPosition" text="{ItemPosition}" />\
			<Input id="note::item" value="{Note}" />\
		</ColumnListItem>\
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
				{"SalesOrderLineItem" : {groupId : "never"}},
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
					SalesOrderID : "1",
					ToLineItems : [{
						Note : "ItemNote Changed",
						__metadata : {
							uri: "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10~0~')"
						}
					}],
					__metadata : {
						uri: "SalesOrderSet('1')"
						// Note: Payload must not contain deepPath
					}
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
			oModel.create("/SalesOrderSet", oData);
			oModel.submitChanges({groupId : "change"});

			return that.waitForChanges(assert);
		});
	});
});