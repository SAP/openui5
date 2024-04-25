/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap/base/util/uid",
	"sap/m/Input",
	"sap/ui/Device",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Lib",
	"sap/ui/core/Messaging",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/core/Rendering",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Model",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/message/MessageModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/v2/Context",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/xml/XMLModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/datajs",
	"sap/ui/util/XMLHelper"
	// load Table resources upfront to avoid loading times > 1 second for the first test using Table
	// "sap/ui/table/Table"
], function (Log, Localization, merge, uid, Input, Device, ManagedObjectObserver, SyncPromise,
		Library, Messaging, UI5Date, Message, MessageType, Controller, View, Rendering, BindingMode, Filter,
		FilterOperator, FilterType, Model, Sorter, JSONModel, MessageModel, CountMode, MessageScope, Decimal,
		Context, ODataModel, XMLModel, TestUtils, datajs, XMLHelper) {
	/*global QUnit, sinon*/
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0, quote-props: 0*/
	"use strict";

	var sDefaultLanguage = Localization.getLanguage(),
		sDefaultTimezone = Localization.getTimezone(),
		NO_CONTENT = {/*204 no content*/},
		sODataListBindingClassName = "sap.ui.model.odata.v2.ODataListBinding",
		sODataMessageParserClassName = "sap.ui.model.odata.ODataMessageParser",
		sODataModelClassName = "sap.ui.model.odata.v2.ODataModel",
		// determine the row in which the entity is expected from the context path
		rRowIndex = /~(\d+)~/,
		/**
		 * Maps back-end response severity values to the values defined in the enumeration
		 * <code>sap/ui/core/message/MessageType</code>.
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
	 * @param {number} [oErrorResponseInfo.statusCode=500]
	 *   The HTTP status code
	 * @param {string} [oErrorResponseInfo.target]
	 *   The message target
	 * @returns {object}
	 *   The error response
	 */
	function createErrorResponse(oErrorResponseInfo) {
		var oError;

		oErrorResponseInfo = oErrorResponseInfo || {};
		oError = {
			code : oErrorResponseInfo.messageCode || "UF0",
			message : {
				value : oErrorResponseInfo.message || "Internal Server Error"
			}
		};
		if (oErrorResponseInfo.hasOwnProperty("target")) {
			oError.target = oErrorResponseInfo.target;
		}

		return {
			body : JSON.stringify({
				error : oError
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
	 * Creates a V2 OData model for <code>ZUI5_GWSAMPLE_BASIC</code> service.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createSalesOrdersModel(mModelParameters) {
		return createModel("/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/", mModelParameters);
	}

	/**
	 * Creates a V2 OData model for <code>GWSAMPLE_BASIC</code> containing special function imports
	 * that are not available in the original service.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createSalesOrdersModelSpecialFunctionImports(mModelParameters) {
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
	 * Creates a V2 OData model for hierarchy maintenance.
	 *
	 * @param {object} [mModelParameters]
	 *   Map of parameters for model construction. The default parameters are set in the createModel
	 *   function.
	 * @returns {sap.ui.model.odata.v2.ODataModel}
	 *   The model
	 */
	function createHierarchyMaintenanceModel(mModelParameters) {
		return createModel("/hierarchy/maintenance/", mModelParameters);
	}

	/**
	 * Gets a far customer line item as contained in the server response.
	 *
	 * @param {string} sCompanyCode The company code
	 * @param {string} [sCustomer] The customer
	 * @param {string} [sAccountingDocument] The accounting document ID
	 * @param {string} [sAccountingDocumentItem] The accounting document item ID
	 * @returns {object} A far customer line item as contained in the server response
	 */
	function getFarCustomerLineItem(sCompanyCode, sCustomer, sAccountingDocument,
			sAccountingDocumentItem) {
		var oResult = {
				__metadata : {
					uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items("
						+ sCompanyCode
						+ (sCustomer ? "," + sCustomer : "")
						+ (sAccountingDocument ? "," + sAccountingDocument : "")
						+ (sAccountingDocumentItem ? "," + sAccountingDocumentItem : "")
						+ ")"
				},
				CompanyCode : sCompanyCode,
				AmountInCompanyCodeCurrency : "1",
				Currency : "USD"
			};

		if (sCustomer) {
			oResult.Customer = sCustomer;
		}
		if (sAccountingDocument) {
			oResult.AccountingDocument = sAccountingDocument;
		}
		if (sAccountingDocumentItem) {
			oResult.AccountingDocumentItem = sAccountingDocumentItem;
		}

		return oResult;
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
	 * Extracts the content of the visible cells of the given table.
	 *
	 * @param {sap.ui.table.Table} oTable The table
	 * @returns {(string[])[]} A 2 dimensional array of the visible table content
	 */
	function getTableContent(oTable) {
		return oTable.getRows().map(function(oRow) {
			return oRow.getCells().map(function (oCell) {
				return oCell.getText ? oCell.getText() : oCell.getValue();
			});
		});
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
			'<mvc:View xmlns="sap.m" xmlns:f="sap.f" xmlns:mvc="sap.ui.core.mvc" \
				xmlns:t="sap.ui.table" xmlns:trm="sap.ui.table.rowmodes">'
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
			var oChildNode, aChildNodes, oColumn, oElement, i, j, oTemplate,
				oRowMode, oFixedRowMode;

			for (i = aElements.length - 1; i >= 0; i -= 1) {
				oElement = aElements[i];

				if (oElement.hasAttribute("visibleRowCount")) {
					oRowMode = document.createElementNS("sap.ui.table", "rowMode");
					oElement.appendChild(oRowMode);
					oFixedRowMode = document.createElementNS("sap.ui.table.rowmodes", "Fixed");
					oFixedRowMode.setAttribute("rowCount", oElement.getAttribute("visibleRowCount"));
					oRowMode.appendChild(oFixedRowMode);
					oElement.removeAttribute("visibleRowCount");
				}

				aChildNodes = oElement.childNodes;
				for (j = aChildNodes.length - 1; j >= 0; j -= 1) {
					oChildNode = aChildNodes[j];
					if (oChildNode.nodeType === Node.ELEMENT_NODE
							&& oChildNode.localName !== "AnalyticalColumn"
							&& oChildNode.localName !== "Column"
							&& oChildNode.localName !== "rowMode") {
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

		convertElements(oDocument.getElementsByTagNameNS("sap.ui.table", "AnalyticalTable"));
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
			Localization.setLanguage("en-US");

			// These metadata files are _always_ faked, the query option "realOData" is ignored
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core", {
				// GWSAMPLE_BASIC service with special function imports
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
				"/hierarchy/maintenance/$metadata"
					: {source : "qunit/odata/v2/data/metadata_hierarchy_maintenance.xml"},
				"/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/$metadata"
					: {source : "qunit/model/FAR_CUSTOMER_LINE_ITEMS.metadata.xml"}
			}, [{
				regExp : /GET \/sap\/opu\/odata\/sap\/ZUI5_GWSAMPLE_BASIC\/\$metadata.*/,
				response : [{source : "qunit/odata/v2/data/ZUI5_GWSAMPLE_BASIC.metadata.xml"}]
			}]);
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("fatal").never();

			// Counter for batch requests
			this.iBatchNo = 0;
			// Counter for single requests within a batch
			this.iRequestNo = 0;
			// {map<string, string[]>}
			// this.mChanges["id"] is a list of expected changes for the property "text" of the
			// control with ID "id"
			this.mChanges = {};
			// counter for OData messages created during a test
			this.iODataMessageCount = 0;
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
			// A list of expected value states; each entry has following properties:
			// {string|sap.m.InputBase} vControl with the control ID or an instance of InputBase,
			// {sap.ui.core.ValueState} sState with she expected value state, and
			// {string} sText with the expected text
			this.aValueStates = [];

			// If the "rowMode" of the sap.ui.table.* is "Auto", the table uses the
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
			Localization.setLanguage(sDefaultLanguage);
			// reset the time zone
			Localization.setTimezone(sDefaultTimezone);
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
				if (this.mChanges[sControlId].length) {
					return;
				}
				delete this.mChanges[sControlId];
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

			if (Rendering.isPending()
					|| Messaging.getMessageModel().getObject("/").length < this.aMessages.length) {
				setTimeout(this.checkFinish.bind(this, assert), 10);

				return;
			}
			if (this.resolve) {
				this.resolve();
				this.resolve = null;
			}
			this.oListControlIds = null;
		},

		/**
		 * Checks that exactly the expected messages have been reported, the order doesn't matter.
		 *
		 * @param {object} assert The QUnit assert object
		 */
		checkMessages : function (assert) {
			var aCurrentMessages = Messaging.getMessageModel()
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
				assert.ok(false, sVisibleId + ": " + JSON.stringify(sValue) + " (unexpected)");
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
		 * Searches the incoming request in the list of expected requests by comparing the URL.
		 * Removes the found request from the list.
		 *
		 * @param {object} oActualRequest The actual request
		 * @returns {object|undefined} The matching expected request or undefined if none was found
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

			return undefined;
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
			 * @returns {object}
			 *   An object with a property <code>abort</code>, containing a function to abort the request
			 */
			function checkRequest(oRequest, fnSuccess, fnError, oHandler, oHttpClient, oMetadata) {
				if (oRequest.requestUri.includes("$batch")) {
					checkBatchRequest(oRequest, fnSuccess, fnError);
				} else {
					checkSingleRequest(oRequest, fnSuccess, fnError);
				}
				return { // request handle
					abort : fnError.bind(that.oModel, ODataModel._createAbortedError())
				};
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
				that.iRequestNo = 0;

				processRequests(oRequest);
			}

			/**
			 * Checks that the expected request arrived and handles its response. If the status of
			 * the expected request is 2xx, the given success handler is called, otherwise
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
				delete mHeaders["X-Requested-With"];
				delete mHeaders["sap-cancel-on-close"];
				delete mHeaders["sap-contextid-accept"];
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
				delete oActualRequest["sideEffects"];
				that.iRequestNo += 1;
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
						} else if (oExpectedRequest.method !== "HEAD"
								&& !oExpectedRequest.requestUri.includes("/$count")) {
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
					if ("requestNo" in oExpectedRequest) {
						oActualRequest.requestNo = that.iRequestNo;
					}
					if (!("data" in oExpectedRequest) && oActualRequest.data === undefined) {
						delete oActualRequest.data;
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

			mNamedModels = vModel && !(vModel instanceof Model)
				? vModel
				: {undefined : vModel || createSalesOrdersModel()};
			this.oModel = mNamedModels.undefined;
			const oDatajsMock = this.mock(datajs);
			oDatajsMock.expects("request")
				.withArgs(/*request*/sinon.match.any, /*success*/sinon.match.any, /*error*/sinon.match.any,
					sinon.match((handler) => handler !== datajs.metadataHandler),
					/*httpClient*/sinon.match.any, /*metadata*/sinon.match.any)
				.atLeast(0).callsFake(checkRequest);
			// always load $metadata resources via TestUtils fake server, they are not mocked
			oDatajsMock.expects("request").atLeast(0).callThrough();
			//assert.ok(true, sViewXML); // uncomment to see XML in output, in case of parse issues
			this.assert = assert;

			return View.create({
				type : "XML",
				controller : oController && new (Controller.extend(uid(), oController))(),
				definition : xml(sViewXML)
			}).then(function (oView) {
				that.oView = oView;

				return Promise.all(Object.values(mNamedModels).filter(function (oModel) {
					return oModel instanceof ODataModel;
				}).map(function (oModel) {
					return oModel.metadataLoaded(true);
				}));
			}).then(function () {
				var sModelName;

				Object.keys(that.mChanges).forEach(function (sControlId) {
					var oControl = that.oView.byId(sControlId);

					if (oControl) {
						that.observe(assert, oControl, sControlId);
					}
				});
				Object.keys(that.mListChanges).forEach(function (sControlId) {
					var oControl = that.oView.byId(sControlId);

					if (oControl) {
						that.observe(assert, oControl, sControlId, true);
					}
				});

				for (sModelName in mNamedModels) {
					sModelName = sModelName === "undefined" ? undefined : sModelName;
					that.oView.setModel(mNamedModels[sModelName], sModelName);
				}
				// enable parse error messages in the message manager
				Messaging.registerObject(that.oView, true);
				// Place the view in the page so that it is actually rendered. In some situations,
				// esp. for the table.Table this is essential.
				that.oView.placeAt("qunit-fixture");

				return that.waitForChanges(assert, "create view");
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
		 * this.expectChange("foo", ["a", "b"], 2); // expect values for the rows of the control
		 *                                          // with the ID "foo":
		 *                                          // 0 : empty
		 *                                          // 1 : empty
		 *                                          // 2 : "a"
		 *                                          // 3 : "b"
		 * this.expectChange("foo", "c", 2); // expect value "c" for control with ID "foo" in row
		 *                                   // with index 2
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
		 *   list (in this case <code>vValue</code> must be a string). In case <code>vValue</code>
		 *   is an array and <code>vRow</code> is a number, <code>vRow</code> is the start index of
		 *   the array (the values before <code>vRow</code> are treated as empty elements in the
		 *   array).
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
		 * Expects that the given value state is set after all changes have been processed.
		 *
		 * @param {string|sap.m.InputBase} vControl The control ID or an instance of InputBase
		 * @param {sap.ui.core.ValueState} sState The expected value state
		 * @param {string} sText The expected text
		 * @returns {object} The test instance for chaining
		 */
		 expectValueState : function (vControl, sState, sText) {
			this.aValueStates.push({vControl : vControl, sState : sState, sText : sText});

			return this;
		},

		/**
		 * Implementation of methods {@link #expectChange} and {@link #expectValue}; see
		 * documentation of these for a description. Only the return statement is overridden.
		 *
		 * @param {string} sControlId
		 *   The control ID
		 * @param {string|string[]|boolean|null} [vValue]
		 *   The expected value, see {@link #expectChange} and {@link #expectValue}
		 * @param {number|string} [vRow]
		 *   The row index, see {@link #expectChange} and {@link #expectValue}
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
					vValue = Array(vRow || 0).concat(vValue);
					for (i = 0; i < vValue.length; i += 1) {
						if (i in vValue) {
							// This may create a sparse array this.mListChanges[sControlId]
							array(aExpectations, i).push(vValue[i]);
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
					persistent : oODataMessage.transition || false,
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
		 *   The request with the mandatory properties "requestUri".
		 *   Optional properties are:
		 *   <ul>
		 *     <li>"batchNo": The batch number in which the request is contained</li>
		 *     <li>"deepPath": The entities deep path. Defaults to requestUri prefixed with "/";
		 *       in case of a "created" request, "('~key~') is appended as placeholder for the
		 *       temporary key of the transient context</li>
		 *     <li>"encodeRequestUri": Whether the query string of the requestUri has to be encoded;
		 *       <code>true</code> by default</li>
		 *     <li>"headers": The expected request headers</li>
		 *     <li>"method": The expected HTTP method; "GET" by default</li>
		 *     <li>"requestNo": The number of the request within the batch; use this to check the
		 *       order of change requests</li>
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
			if (vRequest.deepPath === undefined) {
				vRequest.deepPath = "/" + vRequest.requestUri.split("?")[0]
					+ (vRequest.created ? "('~key~')" : "");
			}
			vRequest.headers = vRequest.headers || {};
			vRequest.method = vRequest.method || "GET";
			vRequest.responseHeaders = mResponseHeaders || {};
			vRequest.response = oResponse || {/*null object pattern*/};
			aUrlParts = vRequest.requestUri.split("?");
			if (aUrlParts[1] && vRequest.encodeRequestUri !== false) {
				vRequest.requestUri = aUrlParts[0] + "?"
					+ aUrlParts[1].replace(/ /g, "%20").replace(/'/g, "%27").replace(/~/g, "%7e")
						.replace(/,/g, "%2c").replace(/\//g, "%2f");
			}
			delete vRequest.encodeRequestUri;
			this.aRequests.push(vRequest);

			return this;
		},

		/**
		 * Observes and checks value changes for a control. In case the test uses {#expectChange},
		 * checks the model internal value by attaching a formatter; if the test uses
		 * {#expectValue}, checks the control value in its external representation using a managed
		 * object observer. In both cases, {#checkValue} is called for the actual value check each
		 * time the value changes.
		 * Note that you may only use controls that have a 'text' or a 'value' property.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {sap.ui.base.ManagedObject} oControl The control
		 * @param {string} sControlId The (symbolic) control ID for which changes are expected
		 * @param {boolean} [bInList] Whether the control resides in a list item
		 */
		observe : function (assert, oControl, sControlId, bInList) {
			var oBindingInfo, bIsCompositeType, fnOriginalFormatter, oType,
				sProperty = oControl.getBindingInfo("text") ? "text" : "value",
				that = this;

			if (this.bCheckValue) { // ManagedObjectObserver checks value changes on the control
				this.observeValue(assert, oControl, sControlId, bInList);
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
		 * Implementation of {@link #observe} when values are observed via managed object observer.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {sap.ui.base.ManagedObject} oControl The control
		 * @param {string} sControlId The (symbolic) control ID for which changes are expected
		 * @param {boolean} [bInList] Whether the control resides in a list item
		 */
		observeValue : function (assert, oControl, sControlId, bInList) {
			var oConfiguration, aTables,
				that = this;

			/**
			 * Helper to extract the control ID leaving out the view ID prefix and the optional
			 * clone suffix in case the control is contained in a table and cloned from the table
			 * row template.
			 *
			 * @param {string} sId The complete ID of the control, including the view and clone IDs
			 * @returns {string} The extracted control ID as used in the XML view
			 */
			function extractControlId(sId) {
				sId = sId.slice(sId.indexOf("--") + 2); // strip view ID

				return sId.split("-")[0];
			}

			/**
			 * Returns the index of the given table item/row in its table or <code>undefined</code>
			 * in case the given item control is no table item
			 *
			 * @param {any} oItem The table item control
			 * @returns {number|undefined} The index of the item control or <code>undefined</code>
			 */
			function getItemIndex(oItem) {
				if (oItem.getIndex) { // sap.ui.table.Row
					return oItem.getIndex();
				} else if (oItem.getList) { // sap.m.ListItemBase
					return oItem.getList().getItems().indexOf(oItem);
				}

				return undefined;
			}

			/**
			 * The managed observer callback for changes to properties on a table item. Checks if
			 * the current property value is expected.
			 *
			 * @param {object} oChange The property change object
			 */
			function observeItem(oChange) {
				that.checkValue(assert, oChange.current, extractControlId(oChange.object.getId()),
					getItemIndex(oChange.object.getParent()));
			}

			/**
			 * The managed observer callback for changes to the "items" or "rows" of the table.
			 * On "insert": Checks value or text of the cells of the inserted item and all successor
			 * items (which "move down" by the insert) and attaches observer to each cell of the
			 * inserted item.
			 * On "remove": Unobserves the removed item.
			 *
			 * @param {object} oChange The aggregation change object
			 */
			function observeItemsAggregation(oChange) {
				var aCells,
					aItems, // all items in the table
					oItem = oChange.child; // the table row or item control

				if (that.oView.isDestroyStarted()) {
					return; // view destruction on test end, no need to check values
				}

				aItems = oChange.object.getAggregation(oChange.name);
				if (!aItems) {
					return;
				}
				if (oChange.mutation === "remove") {
					oItem = aItems[oItem.$index]; // successor item of removed item
				}
				aCells = oItem ? oItem.getAggregation("cells") : [];
				aCells.forEach(function (oCurrentCell, iCellIndex) {
					var oCell, i,
						sCellId = extractControlId(oCurrentCell.getId()),
						sCellProperty = oCurrentCell.getBindingInfo("text") ? "text" : "value";

					if (that.oListControlIds.has(sCellId)) {
						for (i = aItems.indexOf(oItem); i < aItems.length; i += 1) {
							aItems[i].$index = i;
							oCell = aItems[i].getAggregation("cells")[iCellIndex];
							that.checkValue(assert, oCell.getProperty(sCellProperty),
								sCellId, getItemIndex(aItems[i]));
						}
						if (oChange.mutation === "insert") {
							that.oObserver.observe(oCurrentCell, {properties : [sCellProperty]});
						}
					}
				});
			}

			this.oObserver = this.oObserver || new ManagedObjectObserver(observeItem);
			if (!bInList) {
				oConfiguration = {properties : [
					oControl.getBindingInfo("text") ? "text" : "value"]};
				if (!this.oObserver.isObserved(oControl, oConfiguration)) {
					this.oObserver.observe(oControl, oConfiguration);
				}

				return;
			}

			this.oListControlIds = this.oListControlIds || new Set();
			this.oListControlIds.add(sControlId);
			if (!this.oTemplateObserver) { //TODO support multiple tables in view?
				this.oTemplateObserver = new ManagedObjectObserver(observeItemsAggregation);
				aTables = this.oView.findAggregatedObjects(true, function (oControl) {
					return oControl.isA("sap.m.Table") || oControl.isA("sap.ui.table.Table");
				});
				if (aTables.length !== 1) {
					throw new Error("Expected one table in view but found " + aTables.length);
				}
				oConfiguration = {
					aggregations : [aTables[0].isA("sap.m.Table") ? "items" : "rows"]
				};
				this.oTemplateObserver.observe(aTables[0], oConfiguration);
			}
		},

		/**
		 * Removes all persistent and technical message from the message model.
		 */
		removePersistentAndTechnicalMessages : function () {
			var aMessages = Messaging.getMessageModel().getObject("/").filter(function (oMessage) {
					return oMessage.getPersistent() || oMessage.getTechnical();
				});

			Messaging.removeMessages(aMessages);
		},

		/**
		 * Waits for the expected requests and changes, checks the expected messages and value
		 * states.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} [sTitle] Title for this section of a test
		 * @param {number} [iWaitTimeout=3000] The timeout time in milliseconds
		 * @returns {Promise} A promise that is resolved when all requests have been responded,
		 *   all expected values for controls have been set, all expected messages and all value
		 *   states have been checked
		 */
		waitForChanges : function (assert, sTitle, iWaitTimeout) {
			var oPromise,
				that = this;

			iWaitTimeout = iWaitTimeout || 3000;
			oPromise = new SyncPromise(function (resolve) {
				that.resolve = resolve;
				// After three seconds everything should have run through
				// Resolve to have the missing requests and changes reported
				setTimeout(function () {
					if (oPromise.isPending()) {
						assert.ok(false, "Timeout in waitForChanges");
						resolve(true);
					}
				}, iWaitTimeout);
				that.checkFinish(assert);
			}).then(function (bTimeout) {
				var sControlId, aExpectedValuesPerRow, i, j;

				// Report missing requests
				that.aRequests.forEach(function (oRequest) {
					assert.ok(false, oRequest.method + " " + oRequest.requestUri
						+ " (not requested)");
				});
				// Report missing changes
				for (sControlId in that.mChanges) {
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
				return (that.aValueStates.length === 0
					? SyncPromise.resolve()
					// Checks the controls' value state after waiting some time for the control to
					// set it.
					: resolveLater(function () {
						that.aValueStates.forEach(function (oValueStateInfo) {
							var oControl = typeof oValueStateInfo.vControl === "string"
									? that.oView.byId(oValueStateInfo.vControl)
									: oValueStateInfo.vControl;

							assert.strictEqual(oControl.getValueState(), oValueStateInfo.sState,
								oControl.getId() + ": value state: " + oControl.getValueState());
							assert.strictEqual(oControl.getValueStateText(), oValueStateInfo.sText,
								oControl.getId() + ": value state text: "
									+ oControl.getValueStateText());
						});
						that.aValueStates = [];
					})).then(() => {
						assert.ok(!bTimeout, "waitForChanges(" + (sTitle || "") + "): "
							+ (bTimeout ? "Timeout (" + iWaitTimeout + " ms)" : "Done"));
					});
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
	// Usage of service: /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/
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
					+ "GET /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Read and display collection data for a table with a single field
	// Usage of service: /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/
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
			.expectValue("id", ["0500000001", "0500000002"]);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Read and display collection data for a table with a single field
	// Usage of service: /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/
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
			.expectValue("id", ["0500000001", "0500000002"]);

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

		this.mock(Library.getResourceBundleFor("sap.ui.core")).expects("getText")
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
					+ "POST /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/$batch",
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
			.withExactArgs("Request failed with status code 500: "
					+ "POST /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/$batch",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Complete $batch fails with a technical error and the response has Content-Type
	// "text/plain": A persistent, generic UI message is created to show the issue on the UI.
	// BCP: 002075129500003079342020
	QUnit.test("$batch error handling: complete batch fails, plain error", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text text="{SalesOrderID}" />\
</Table>';

		this.mock(Library.getResourceBundleFor("sap.ui.core")).expects("getText")
			.atLeast(1)
			.callsFake(function (sKey, aArgs) {
				return sKey;
			});
		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
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

		this.oLogMock.expects("debug").atLeast(0); // Required for all additional debug logs
		this.oLogMock.expects("debug")
			.withExactArgs("Failed to parse error messages from the response body",
				sinon.match.instanceOf(Error), sODataMessageParserClassName);
		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 503: POST /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/$batch",
				sinon.match.string, sODataMessageParserClassName);

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
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('1')", {
				CompanyName : "SAP SE",
				Address : {
					City : "Walldorf"
				}
			}, {"sap-message" : getMessageHeader(oResponseMessage)})
			.expectValue("CompanyName", "SAP SE")
			.expectValue("City", "Walldorf")
			.expectMessage(oResponseMessage,"/BusinessPartnerSet('1')/")
			.expectValueState("City", "Error", "Foo");

		// code under test
		return this.createView(assert, sView);
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
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					SalesOrderID : "1",
					ItemPosition : "10"
				}, {
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					SalesOrderID : "1",
					ItemPosition : "20"
				}]
			})
			.expectValue("salesOrderId", "1")
			.expectValue("itemPosition", ["10", "20"]);

		// code under test
		return this.createView(assert, sView).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						+ "/ToProduct"
				}, {
					__metadata : {
						uri : "ProductSet('P1')"
					},
					ProductID : "P1",
					Name : "Product 1"
				}, {"sap-message" : getMessageHeader(oMsgProductName)})
				.expectValue("productName", "Product 1")
				.expectMessage(oMsgProductName, "/ProductSet('P1')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')"
					+ "/ToProduct/");

			// code under test
			that.oView.byId("detailProduct").setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext()
			);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct"
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
				.expectValue("supplierAddress", "Walldorf")
				.expectMessage(oMsgSupplierAddress, "/BusinessPartnerSet('BP1')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')"
					+ "/ToProduct/ToSupplier/")
				.expectValueState("productName", "Error", "Foo")
				.expectValueState("supplierAddress", "Warning", "Bar");

			// code under test
			that.oView.byId("detailSupplier").setBindingContext(
				that.oView.byId("detailProduct").getBindingContext()
			);

			return that.waitForChanges(assert);
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
			.expectMessage(oMsgGrossAmount, "/SalesOrderSet('1')/")
			.expectValueState("Note", "Error", "Bar")
			.expectValueState("GrossAmount", "Warning", "Foo")
			.expectValueState("LifecycleStatusDescription", "None", "");

		// code under test
		return this.createView(assert, sView).then(function () {
			that.expectValue("Note", "")
				.expectValueState("Note", "None", "");

			// code under test
			that.oView.byId("Note").unbindProperty("value");

			return that.waitForChanges(assert);
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
			.expectMessages([oExpectedMessage])
			.expectValueState("note", "Error", "Foo");

		// code under test
		return this.createView(assert, sView).then(function () {
			that.expectRequest("SalesOrderSet('1')", {
					SalesOrderID : "1",
					Note : "NoteB"
				})
				.expectValue("note", "NoteB")
				.expectMessages(oFixture.bIsPersistent ? [oExpectedMessage] : [])
				.expectValueState("note", oFixture.bIsPersistent ? "Error" : "None",
					oFixture.bIsPersistent ? "Foo" : "");

			// code under test
			that.oModel.refresh();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: When two bindings reference the same entity only one GET request is send and the
	// response is processed for each binding but transient messages in response header must only be
	// propagated once.
	// BCP: 2280114574
	QUnit.test("Messages: redundant bindings - no duplicate transient messages", function (assert) {
		var oMessage = this.createResponseMessage("Note", "Foo", "error", true),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note1" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1",
				Note : "NoteA"
			}, {
				"sap-message" : getMessageHeader(oMessage)
			})
			.expectValue("note", "NoteA")
			.expectValue("note1", "NoteA")
			.expectMessage(oMessage, "/SalesOrderSet('1')/")
			.expectValueState("note", "Error", "Foo")
			.expectValueState("note1", "Error", "Foo");

		// code under test
		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: When two bindings reference the same entity only one GET request is send and the
	// response is processed for each binding but transient error messages must only be propagated
	// once.
	// BCP: 2280114574
	QUnit.test("Messages: redundant bindings - no duplicate error messages", function (assert) {
		var oErrorMessage = createErrorResponse({message : "Not Found", statusCode : 404}),
			oModel = createSalesOrdersModel({persistTechnicalMessages : true}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note1" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", oErrorMessage)
			.expectMessages([{
				code : "UF0",
				descriptionUrl : "",
				fullTarget : "",
				message : "Not Found",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 404: GET SalesOrderSet('1')",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: When two bindings reference the same entity only one GET request is send and the
	// response is processed for each binding but error message for failed $batch must only be
	// propagated once.
	// BCP: 2280114574
	QUnit.test("Messages: redundant bindings - no duplicate error if $batch crashed",
			function (assert) {
		var oErrorMessage = createErrorResponse({
				crashBatch : true,
				message : "Not Found",
				statusCode : 404
			}),
			oModel = createSalesOrdersModel({persistTechnicalMessages : true}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note1" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", oErrorMessage)
			.expectMessages([{
				code : "UF0",
				descriptionUrl : "",
				fullTarget : "",
				message : "Not Found",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code 404: POST"
				+ " /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/$batch",
				/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: While refreshing a model or a binding, all messages belonging to that model or
	// binding have to be removed before new messages are reported.
	// BCP: 1970544211
	QUnit.test("Messages: refresh model or binding", function (assert) {
		var oModel = createSalesOrdersModel(),
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
				requestUri : "SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader([oMsgSalesOrder, oMsgSalesOrderToLineItems1])})
			.expectRequest({
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				results : [
					{SalesOrderID : "1", ItemPosition : "1"},
					{SalesOrderID : "1", ItemPosition : "2"}
				]
			}, {"sap-message" : getMessageHeader(oMsgSalesOrderItem1)})
			.expectValue("id", "1")
			.expectValue("itemPosition", ["1", "2"])
			.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')")
			.expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
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
				.expectValue("itemPosition", ["2", "3"])
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
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					results : [
						{SalesOrderID : "1", ItemPosition : "3"},
						{SalesOrderID : "1", ItemPosition : "4"}
					]
				})
				.expectValue("itemPosition", ["3", "4"])
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
		var oModel = createSalesOrdersModel(),
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
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				results : [{
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')"
					},
					SalesOrderID : "1",
					ItemPosition : "1"
				}, {
					__metadata : {
						uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='2')"
					},
					SalesOrderID : "1",
					ItemPosition : "2"
				}]
			}, {
				"sap-message" : getMessageHeader([
					oMsgSalesOrderItem1,
					// not in business object scope but service does not allow deeper navigation
					// path within the business object
					oMsgProductA
				])
			})
			.expectValue("itemPosition", ["1", "2"])
			.expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectMessage(oMsgProductA, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=2&$top=2",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='3')"
						},
						SalesOrderID : "1",
						ItemPosition : "3"
					}, {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='4')"
						},
						SalesOrderID : "1",
						ItemPosition : "4"
					}]
				}, {
					"sap-message" : getMessageHeader([
						oMsgSalesOrderItem3,
						// not in business object scope but service does not allow deeper navigation
						// path within the business object
						oMsgProductB
					])
				})
				.expectValue("itemPosition", "3", 2)
				.expectValue("itemPosition", "4", 3)
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
		<FlexBox binding="{path : \'to_CreatedByUserContactCard\',\
				parameters : {select : \'FullName\', createPreliminaryContext : false,\
					usePreliminaryContext : false}\
			}">\
			<Text id="createdName" text="{FullName}" />\
		</FlexBox>\
	</FlexBox>\
	<FlexBox binding="{path : \'to_AdminData\',\
			parameters : {usePreliminaryContext : true, createPreliminaryContext : false}}">\
		<FlexBox binding="{path : \'to_LastChangedByUserContactCard\',\
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
			.expectValue("salesOrderID", "1")
			.expectValue("grossAmount", "0.00")
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					CurrencyCode : "EUR",
					GrossAmount : "0.00",
					ItemPosition : "10",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10"])
			.expectValue("grossAmount::item", ["0.00"])
			.expectValue("currencyCode", ["EUR"])
			.expectMessage(oSalesOrderGrossAmountError, "/SalesOrderSet('1')/");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("table").getItems()[0].getBindingContext(),
				oSalesOrderItemToHeaderGrossAmountError
					= that.createResponseMessage("ToHeader/GrossAmount");

			that.expectRequest({
					deepPath : "/SalesOrderSet('1')"
						+ "/ToLineItems(SalesOrderID='1',ItemPosition='10')",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						+ "?$expand=ToHeader"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					SalesOrderID : "1",
					ItemPosition : "10",
					GrossAmount : "1000.00",
					ToHeader : {
						__metadata : {uri : "SalesOrderSet('1')"},
						SalesOrderID : "1",
						GrossAmount : "1000.00"
					}
				}, {"sap-message" : getMessageHeader(oSalesOrderItemToHeaderGrossAmountError)})
				.expectValue("grossAmount", "1000.00")
				.expectValue("grossAmount::item", ["1000.00"])
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

		this.expectRequest("SalesOrderSet('1')?$select=SalesOrderID,Note&$expand=ToLineItems", {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Note",
				SalesOrderID : "1",
				ToLineItems : {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "ItemNote",
						SalesOrderID : "1"
					}]
				}
			})
			.expectValue("note", "Note")
			.expectValue("salesOrderID", "1")
			.expectValue("itemPosition", ["10"])
			.expectValue("note::item", ["ItemNote"]);

		return this.createView(assert, sView, oModel).then(function () {
			// avoid MERGE on property change
			oModel.setChangeGroups(
				{SalesOrderLineItem : {groupId : "never"}},
				{"*" : {groupId : "change"}}
			);
			oModel.setDeferredGroups(["change", "never"]);

			that.expectValue("note::item", "ItemNote Changed", 0);

			// code under test: leads to __metadata.deepPath being set in the item data
			oModel.setProperty("/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/Note",
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
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
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
					message : "EnterTextMaxLength 3",
					persistent : false,
					target : oNoteInput.getId() + "/value",
					technical : false,
					type : "Error"
				}])
				.expectValue("note", "abcd");

			TestUtils.withNormalizedMessages(function () {
				// code under test - produce a validation error
				oNoteInput.setValue("abcd");
			});

			return that.waitForChanges(assert);
		}).then(function () {
			var oElementBinding = that.oView.byId("form").getElementBinding();

			that.expectRequest("SalesOrderSet('1')", {
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Bar",
					SalesOrderID : "1"
				})
				.expectValueState(oNoteInput, "Error", "EnterTextMaxLength 3");

			// code under test
			oModel.invalidateEntry(oElementBinding.getBoundContext());
			oElementBinding.refresh(true);

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
				.expectMessages([])
				.expectValueState(oNoteInput, "None", "");

			// code under test - rebinding the form causes cleanup of the validation error and the
			// user input
			that.oView.byId("form").bindObject("/SalesOrderSet('2')");

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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItemNoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderToItemPositionError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/ItemPosition"),
			oSalesOrderItemNoteError = cloneODataMessage(oSalesOrderToItemNoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderItemPositionError = cloneODataMessage(oSalesOrderToItemPositionError,
				"(SalesOrderID='1',ItemPosition='10')/ItemPosition"),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10"])
			.expectValue("note::item", ["Bar"])
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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30')/Note"),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			}/*, { // message is not sent because of transitionMessagesOnly
				"sap-message" : getMessageHeader(oSalesOrderItem10NoteError)
			}*/)
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("note::item", ["Bar", "Baz"])
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
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=2&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
					},
					Note : "Qux",
					ItemPosition : "30",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='40')"
					},
					Note : "Quux",
					ItemPosition : "40",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", "30", 2)
			.expectValue("itemPosition", "40", 3)
			.expectValue("note::item", "Qux", 2)
			.expectValue("note::item", "Quux", 3);

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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/GrossAmount"),
			oSalesOrderToItem20GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20')/GrossAmount"),
			oSalesOrderToItem30GrossAmountError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30')/GrossAmount"),
			oSalesOrderItem10GrossAmountError
				= cloneODataMessage(oSalesOrderToItem10GrossAmountError,
					"(SalesOrderID='1',ItemPosition='10')/GrossAmount"),
			oSalesOrderItem20GrossAmountError
				= cloneODataMessage(oSalesOrderToItem20GrossAmountError,
					"(SalesOrderID='1',ItemPosition='20')/GrossAmount"),
			oSalesOrderItem30GrossAmountError
				= cloneODataMessage(oSalesOrderToItem30GrossAmountError,
					"(SalesOrderID='1',ItemPosition='30')/GrossAmount"),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					GrossAmount : "111.0",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					GrossAmount : "42.0",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("grossAmount", ["111.0", "42.0"])
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
					headers : {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
						+ "&$filter=GrossAmount gt 100.0m"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						GrossAmount : "111.0",
						ItemPosition : "10",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
						},
						GrossAmount : "222.0",
						ItemPosition : "30",
						SalesOrderID : "1"
					}]
				})
				.expectValue("itemPosition", "30", 1)
				.expectValue("grossAmount", "222.0", 1);

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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
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
				headers : {"sap-messages" : "transientOnly"},
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
				headers : {"sap-messages" : "transientOnly"},
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
					headers : {"sap-messages" : "transientOnly"},
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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30')/Note"),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("note::item", ["Bar", "Baz"])
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
					headers : {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
						+ "&$orderby=GrossAmount asc"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
						},
						Note : "Qux",
						ItemPosition : "30",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='40')"
						},
						Note : "Quux",
						ItemPosition : "40",
						SalesOrderID : "1"
					}]
				})
				.expectValue("itemPosition", ["30", "40"])
				.expectValue("note::item", ["Qux", "Quux"]);

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
		var oModel = createSalesOrdersModel({
				canonicalRequests : true,
				preliminaryContext : true,
				refreshAfterChange : false,
				useBatch : false
			}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='30')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30')/Note"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("note::item", ["Bar", "Baz"])
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

			that.expectValue("note::item", "Qux", 0)
				.expectHeadRequest(bWithMessageScope
					? {"sap-message-scope" : "BusinessObject"}
					: {})
				.expectRequest({
					data : {
						Note : "Qux",
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						}
					},
					deepPath :
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
					headers : bWithMessageScope
						? {"sap-message-scope" : "BusinessObject", "x-http-method" : "MERGE"}
						: {"x-http-method" : "MERGE"},
					key : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')",
					method : "POST",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
				}, NO_CONTENT, bWithMessageScope
					? {"sap-message" : getMessageHeader(oItem10ToProductPriceError)}
					: undefined
				)
				.expectMessages([]) // clean all expected messages
				.expectMessage(oSalesOrderNoteError, "/SalesOrderSet('1')/");

			if (bWithMessageScope) {
				that.expectMessage(oSalesOrderToBusinessPartnerAddress, "/SalesOrderSet('1')/")
					.expectMessage(oItem10ToProductPriceError,
						"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/",
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/")
					.expectMessage(oSalesOrderItem30NoteError,
						"/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");
			}

			// code under test - modify a sales order item
			oModel.setProperty(
				"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/Note",
				"Qux");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "Quxx")
				.expectRequest({
					data : {
						Note : "Quxx",
						__metadata : {uri : "SalesOrderSet('1')"}
					},
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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToBusinessPartnerAddress
				= this.createResponseMessage("ToBusinessPartner/Address"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderToItem20NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderItem20NoteError = cloneODataMessage(oSalesOrderToItem20NoteError,
				"(SalesOrderID='1',ItemPosition='20')/Note"),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("note::item", ["Bar", "Baz"])
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
						"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					method : "DELETE",
					requestUri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
				}, NO_CONTENT)
				// ODataModel#remove does not remove the item from the list. A refresh needs to be
				// triggered or refreshAfterChange has to be true to trigger refresh automatically
				.expectValue("itemPosition", "", 0)
				.expectValue("note::item", "", 0)
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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrder1NoteError = this.createResponseMessage("('1')/Note"),
			oSalesOrder1ToBusinessPartnerAddress
				= this.createResponseMessage("('1')/ToBusinessPartner/Address"),
			oSalesOrder2NoteError = this.createResponseMessage("('2')/Note"),
			oSalesOrder2ToBusinessPartnerAddress
				= this.createResponseMessage("('2')/ToBusinessPartner/Address"),
			sView = '\
<Table growing="true" growingThreshold="2" id="table" items="{/SalesOrderSet}">\
	<Input id="note" value="{Note}" />\
</Table>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
				requestUri : "SalesOrderSet?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Foo",
					SalesOrderID : "1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					Note : "Bar",
					SalesOrderID : "2"
				}]
			}, {
				"sap-message" : getMessageHeader(bWithMessageScope
					? [oSalesOrder1NoteError, oSalesOrder1ToBusinessPartnerAddress,
						oSalesOrder2NoteError, oSalesOrder2ToBusinessPartnerAddress]
					: [oSalesOrder1NoteError, oSalesOrder2NoteError])
			})
			.expectValue("note", ["Foo", "Bar"])
			.expectMessage(oSalesOrder1NoteError, "/SalesOrderSet")
			.expectMessage(bWithMessageScope ? oSalesOrder1ToBusinessPartnerAddress : null,
				"/SalesOrderSet")
			.expectMessage(oSalesOrder2NoteError, "/SalesOrderSet")
			.expectMessage(bWithMessageScope ? oSalesOrder2ToBusinessPartnerAddress : null,
				"/SalesOrderSet");

		oModel.setMessageScope(sMessageScope);

		return this.createView(assert, sView, oModel).then(function () {
			var oSalesOrder3NoteError = that.createResponseMessage("('3')/Note");

			that.expectRequest({
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					requestUri : "SalesOrderSet?$skip=0&$top=2"
						+ (bFilter ? "&$filter=GrossAmount gt 100.0m" : "")
				}, {
					results : [{
						__metadata : {uri : "SalesOrderSet('1')"},
						Note : "Foo",
						SalesOrderID : "1"
					},
					// "SalesOrderSet('2')" has been filtered out, or in case of a refresh the
					// entity has been removed in meantime
					{
						__metadata : {
							uri : "SalesOrderSet('3')"
						},
						Note : "Baz",
						SalesOrderID : "3"
					}]
				}, {
					"sap-message" : getMessageHeader(bWithMessageScope
						? [oSalesOrder1NoteError, oSalesOrder1ToBusinessPartnerAddress,
							oSalesOrder3NoteError]
						: [oSalesOrder1NoteError, oSalesOrder3NoteError])
				})
				.expectValue("note", "Baz", 1)
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
	// Scenario: When destroying a control, the control ID gets properly removed from the message.
	// BCP: 2180415452
[true, false].forEach(function (bRemoveContext) {
	var sTitle = "Messages: Remove the control ID from the message object when the control gets"
			+ " destroyed; remove context before destroy: " + bRemoveContext;

	QUnit.test(sTitle, function (assert) {
		var oMessage, oObjectPage,
			oModel = createSalesOrdersModel(),
			oSalesOrder1NoteError = this.createResponseMessage("('1')/Note"),
			sView = '\
<Table growing="true" growingThreshold="1" id="table" items="{/SalesOrderSet}">\
	<Text id="note" text="{Note}" />\
</Table>\
<FlexBox id="objectPage">\
	<Input id="note1" value="{Note}" />\
	<Input id="note2" value="{= ${SalesOrderID} + \' - \' + ${Note}}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet?$skip=0&$top=1"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Foo",
					SalesOrderID : "1"
				}]
			}, {
				"sap-message" : getMessageHeader([oSalesOrder1NoteError])
			})
			.expectValue("note", ["Foo"])
			.expectMessage(oSalesOrder1NoteError, "/SalesOrderSet");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			oMessage = Messaging.getMessageModel().getObject("/")[0];
			oObjectPage = that.oView.byId("objectPage");

			assert.deepEqual(oMessage.getControlIds(), []);
			that.expectValueState("note1", "Error", oSalesOrder1NoteError.message)
				.expectValueState("note2", "Error", oSalesOrder1NoteError.message);

			oObjectPage.setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			var aControlIds = oMessage.getControlIds();

			assert.ok(aControlIds.includes(that.oView.byId("note1").getId()), "simple binding");
			assert.ok(aControlIds.includes(that.oView.byId("note2").getId()), "composite binding");

			if (bRemoveContext) {
				oObjectPage.setBindingContext(null);
			}

			// code under test
			oObjectPage.getItems().forEach(function (oItem) { oItem.destroy(); });
			oObjectPage.removeAllItems();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oMessage.getControlIds(), []);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Show entity with sub entities in same business object. Both have massages. Refresh
	// of entity should also lead to update of aggregated messages for the sub entities.
	// JIRA: CPOUI5MODELS-151
	QUnit.test("ODataModel#createBindingContext with updateAggregatedMessages", function (assert) {
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToItem10NoteError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/Note"),
			oSalesOrderItem10NoteError = cloneODataMessage(oSalesOrderToItem10NoteError,
				"(SalesOrderID='1',ItemPosition='10')/Note"),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
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
		var oModel = createSalesOrdersModel({preliminaryContext : true}),
			oItemsBinding,
			oSalesOrderDeliveryStatusAndToItemError = this.createResponseMessage(
				["DeliveryStatus", "ToLineItems(SalesOrderID='1',ItemPosition='40')/Quantity"]),
			oSalesOrderDeliveryStatusAndItemError =
				cloneODataMessage(oSalesOrderDeliveryStatusAndToItemError,
					"DeliveryStatus", ["(SalesOrderID='1',ItemPosition='40')/Quantity"]),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToItemsError = this.createResponseMessage("ToLineItems"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderToItem20NoteWarning = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='20')/Note", undefined, "warning"),
			oSalesOrderToItem30NoteError = this.createResponseMessage(
				["ToLineItems(SalesOrderID='1',ItemPosition='30%20')/Note",
				"ToLineItems(SalesOrderID='1',ItemPosition='30%20')/GrossAmount"]),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderItem20NoteWarning = cloneODataMessage(oSalesOrderToItem20NoteWarning,
				"(SalesOrderID='1',ItemPosition='20')/Note"),
			oSalesOrderItem30NoteError = cloneODataMessage(oSalesOrderToItem30NoteError,
				"(SalesOrderID='1',ItemPosition='30%20')/Note",
				["(SalesOrderID='1',ItemPosition='30%20')/GrossAmount"]),
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
			.expectValue("note", "Foo")
			.expectValue("salesOrderID", "1")
			.expectRequest({
				batchNo : 1,
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("note::item", ["Bar", "Baz"])
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
					headers : {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=2"
						+ "&$filter=(SalesOrderID eq '1' and ItemPosition eq '40')"
						+ " or (SalesOrderID eq '1' and ItemPosition eq '10')"
						+ " or (SalesOrderID eq '1' and ItemPosition eq '30 ')"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						Note : "Bar",
						ItemPosition : "10",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30%20')"
						},
						Note : "Qux",
						ItemPosition : "30 ",
						SalesOrderID : "1"
					}]
				})
				.expectValue("itemPosition", "30 ", 1)
				.expectValue("note::item", "Qux", 1);

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
				"carrierFlights(carrid='1',connid='10',"
				+ "fldate=datetime'2015-05-30T13:47:26.253')/PRICE"),
			oCarrierToFlight20PriceWarning = this.createResponseMessage(
				"carrierFlights(carrid='1',connid='20',"
				+ "fldate=datetime'2015-06-30T13:47:26.253')/PRICE", undefined, "warning"),
			oFlight10PriceError = cloneODataMessage(oCarrierToFlight10PriceError,
				"(carrid='1',connid='10',fldate=datetime'2015-05-30T13:47:26.253')/PRICE"),
			oFlight20PriceWarning = cloneODataMessage(oCarrierToFlight20PriceWarning,
				"(carrid='1',connid='20',fldate=datetime'2015-06-30T13:47:26.253')/PRICE"),
			sView = '\
<FlexBox binding="{/CarrierCollection(\'1\')}">\
	<Text id="carrierID" text="{carrid}" />\
	<Table growing="true" growingThreshold="1" id="table" items="{\
			path : \'carrierFlights\',\
			parameters : {transitionMessagesOnly : true}\
		}">\
		<Text id="connectionID" text="{connid}" />\
		<Text id="flightDate" text="{\
			path : \'fldate\',\
			type : \'sap.ui.model.odata.type.DateTime\',\
			formatOptions: {style : \'short\', UTC : true}\
		}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
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
			.expectValue("carrierID", "1")
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "CarrierCollection('1')/carrierFlights"
			}, {
				results : [{
					__metadata : {
						uri : "FlightCollection(carrid='1',connid='10',"
							+ "fldate=datetime'2015-05-30T13:47:26.253')"
					},
					carrid : "1",
					connid : "10",
					// no need to use UI5Date.getInstance as datajs returns JavaScript Dates
					fldate : new Date(1432993646253)
				}, {
					__metadata : {
						uri : "FlightCollection(carrid='1',connid='20',"
							+ "fldate=datetime'2015-06-30T13:47:26.253')"
					},
					carrid : "1",
					connid : "20",
					// no need to use UI5Date.getInstance as datajs returns JavaScript Dates
					fldate : new Date(1435672046253)
				}]
			})
			.expectValue("connectionID", ["10"])
			.expectValue("flightDate", ["5/30/15, 1:47\u202FPM"])
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
			that.expectValue("connectionID", ["20"])
				.expectValue("flightDate", ["6/30/15, 1:47\u202FPM"]);

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
		var oModel = createSalesOrdersModel(),
			oItemsBinding,
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
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
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=20"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
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
					headers : {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=20"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						Note : "Bar",
						ItemPosition : "10",
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
		var oContext, oCreatedPromise,
			oModel = createSalesOrdersModel({canonicalRequests : true}),
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
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, oFixture.aResponses[0])
				.expectRequest({
					batchNo : 1,
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, oFixture.aResponses[1])
				.expectRequest({
					batchNo : 1,
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

			oCreatedPromise = oContext.created();

			assert.ok(oCreatedPromise);

			// code under test
			oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {properties : {}});

			oModel.read("/SalesOrderSet('1')/ToLineItems", {groupId : "changes"});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oContext.isTransient(), bWithError ? true : undefined);
			assert.strictEqual(oContext.created(),  bWithError ? oCreatedPromise : undefined);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Ensure that 'refreshAfterChange' flag given to ODataModel#createEntry is also
	// considered if the first creation attempt failed and the creation is retried. Use default
	// deferred group ID 'changes'.
	QUnit.test("ODataModel#createEntry: consider refreshAfterChange when retrying the creation; "
			+ " use deferred group ID", function (assert) {
		var oContext,
			oModel = createSalesOrdersModel(),
			sView = '\
<Table items="{/SalesOrderSet(\'1\')/ToLineItems}">\
	<Text text="{ItemPosition}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {results : []});

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"}
					},
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, createErrorResponse())
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
					message : "Internal Server Error",
					persistent : false,
					target : "/SalesOrderLineItemSet('~key~')",
					technical : true,
					type : "Error"
				}]);
			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 500: "
						+ "POST SalesOrderSet('1')/ToLineItems",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			// code under test
			oContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				properties : {},
				refreshAfterChange : false
			});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
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
				})
				.expectMessages([]);

			// code under test - retry
			oModel.submitChanges();

			return Promise.all([
				oContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity and call resetChanges either immediately or after a failed
	// attempt to submit the creation. The created entity is deleted if bDeleteCreatedEntities is
	// set and no request is sent after deletion.
	// JIRA: CPOUI5MODELS-198, CPOUI5MODELS-614, CPOUI5MODELS-615
	// BCP: 2170206361; delete entity only if explicitly requested
[false, true].forEach(function (bWithFailedPOST) {
	[false, true].forEach(function (bWithPath) {
		[false, true].forEach(function (bDeleteCreatedEntities) {
			[false, true].forEach(function (bPersistTechnicalMessages) {
	var sTitle = "ODataModel#createEntry: discard created entity by using ODataModel#resetChanges "
			+ (bWithPath ? "called with the context path " : "")
			+ (bWithFailedPOST ? "after failed submit " : " immediately ")
			+ (bDeleteCreatedEntities ? "; delete" : "; keep") + " cache data"
			+ "; bPersistTechnicalMessages: " + bPersistTechnicalMessages;

	QUnit.test(sTitle, function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel({
				persistTechnicalMessages : bPersistTechnicalMessages
			}),
			that = this;

		return this.createView(assert, /*sView*/"", oModel).then(function () {
			// code under test
			oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				properties : {Note : "Foo"}
			});

			if (bWithFailedPOST) {
				that.expectHeadRequest()
					.expectRequest({
						created : true,
						data : {
							__metadata : {
								type : "GWSAMPLE_BASIC.SalesOrderLineItem"
							},
							Note : "Foo"
						},
						headers : {"Content-ID" : "~key~"},
						method : "POST",
						requestUri : "SalesOrderSet('1')/ToLineItems"
					}, createErrorResponse({
						message : "POST failed",
						statusCode : 400,
						target : ""
					}))
					.expectMessages([{
						code : "UF0",
						fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
						message : "POST failed",
						persistent : bPersistTechnicalMessages,
						target : "/SalesOrderLineItemSet('~key~')",
						technical : true,
						type : "Error"
					}]);

				that.oLogMock.expects("error")
					.withExactArgs("Request failed with status code 400: "
							+ "POST SalesOrderSet('1')/ToLineItems",
						/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

				oModel.submitChanges();
			}

			return that.waitForChanges(assert);
		}).then(function () {
			var oResetPromise;

			if (bWithFailedPOST && bPersistTechnicalMessages) {
				that.expectMessages([{
						code : "UF0",
						fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
						message : "POST failed",
						persistent : bPersistTechnicalMessages,
						target : "/SalesOrderLineItemSet('~key~')",
						technical : true,
						type : "Error"
					}]);
			} else {
				that.expectMessages([]);
			}

			// code under test
			oResetPromise = oModel.resetChanges(bWithPath
					? [oCreatedContext.getPath()]
					: undefined,
				/*bAll*/undefined,
				bDeleteCreatedEntities);

			// check that data cache is cleaned synchronously if bDeleteCreatedEntities is true
			if (bDeleteCreatedEntities) {
				assert.strictEqual(oModel.getObject(oCreatedContext.getPath()), undefined);
			} else {
				assert.ok(oModel.getObject(oCreatedContext.getPath()));
				assert.strictEqual(oModel.getObject(oCreatedContext.getPath() + "/Note"), "Foo");
			}

			oModel.submitChanges(); // no request is sent

			return Promise.all([
				oResetPromise,
				that.waitForChanges(assert)
			]);
		});
	});
			});
		});
	});
});
	/** @deprecated As of version 1.95.0 */
	//*********************************************************************************************
	// Scenario: Create a new entity and call deleteCreatedEntry either immediately or after a
	// failed attempt to submit the creation. The created entity is deleted and no request is sent
	// after deletion.
	// JIRA: CPOUI5MODELS-198, CPOUI5MODELS-614
[false, true].forEach(function (bWithFailedPOST) {
	var sTitle = "ODataModel#createEntry: discard created entity by using "
			+ "ODataModel#deleteCreatedEntry "
			+ (bWithFailedPOST ? "after failed submit" : "immediately");

	QUnit.test(sTitle, function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel(),
			that = this;

		return this.createView(assert, /*sView*/"", oModel).then(function () {
			// code under test
			oCreatedContext = oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				properties : {}
			});
			if (bWithFailedPOST) {
				that.expectHeadRequest()
					.expectRequest({
						created : true,
						data : {
							__metadata : {
								type : "GWSAMPLE_BASIC.SalesOrderLineItem"
							}
						},
						headers : {"Content-ID" : "~key~"},
						method : "POST",
						requestUri : "SalesOrderSet('1')/ToLineItems"
					}, createErrorResponse({message : "POST failed", statusCode : 400}))
					.expectMessages([{
						code : "UF0",
						fullTarget : "/SalesOrderSet('1')/ToLineItems('~key~')",
						message : "POST failed",
						persistent : false,
						target : "/SalesOrderLineItemSet('~key~')",
						technical : true,
						type : "Error"
					}]);

				that.oLogMock.expects("error")
					.withExactArgs("Request failed with status code 400: "
							+ "POST SalesOrderSet('1')/ToLineItems",
						/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

				oModel.submitChanges();
			}

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectMessages([]);

			// code under test
			oModel.deleteCreatedEntry(oCreatedContext);

			// check that data cache is cleaned synchronously
			assert.strictEqual(oModel.getObject(oCreatedContext.getPath()), undefined);

			oModel.submitChanges(); // no request is sent

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: The creation (POST) of a new entity leads to an automatic expand of the given
	// navigation properties (GET) within the same $batch. If the creation fails, the POST request
	// and the corresponding GET request for the expansion of the navigation properties are repeated
	// with the next call of submitBatch.
	// JIRA: CPOUI5MODELS-198
	// Scenario 2: If the change group is marked for transient messages only the GET request must also
	// have the "sap-message" header set to "transientOnly".
	// JIRA: CPOUI5MODELS-1129
[false, true].forEach(function (bWithTransientOnlyHeader) {
	var sTitle = "createEntry: automatic expand of navigation properties"
			+ (bWithTransientOnlyHeader ? ", GET with header: 'sap-messages': 'transientOnly'" : "");

	QUnit.test(sTitle, function (assert) {
		var iBatchNo = 1,
			oCreatedContext,
			oGETRequest = {
				requestUri : "$~key~?$expand=ToProduct&$select=ToProduct",
				headers : bWithTransientOnlyHeader ? {"sap-messages" : "transientOnly"} : {}
			},
			oModel = createSalesOrdersModel({canonicalRequests : true}),
			oNoteError = this.createResponseMessage("Note"),
			oPOSTRequest = {
				created : true,
				data : {
					__metadata : {
						type : "GWSAMPLE_BASIC.SalesOrderLineItem"
					}
				},
				headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
				method : "POST",
				requestUri : "SalesOrderSet('1')/ToLineItems"
			},
			sView = '\
<FlexBox id="productDetails"\
	binding="{path : \'ToProduct\', parameters : {select : \'Name\'}}">\
	<Text id="productName" text="{Name}" />\
</FlexBox>',
			that = this;

		oModel.setTransitionMessagesOnlyForGroup("changes", bWithTransientOnlyHeader);

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
				}, bWithTransientOnlyHeader ? undefined : {"sap-message" : getMessageHeader([oNoteError])});

			if (!bWithTransientOnlyHeader) {
				that.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')/");
			}

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
});

	//*********************************************************************************************
	// Scenario: The creation (POST) of a new entity leads to an automatic expand of the given
	// navigation properties (GET) within the same $batch. If the creation fails, the response of
	// both the POST and the GET request contain error responses. If the response to the GET request
	// has the status code 424, we do not create a message.
	QUnit.test("createEntry: ignore status code 424 of GET in batch with POST", function (assert) {
		var oModel = createSalesOrdersModel({canonicalRequests : true}),
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
					requestUri : "$~key~?$expand=ToProduct&$select=ToProduct"
				},
				bHandlerCalled,
				oPOSTRequest = {
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						}
					},
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
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
		var oModel = createSalesOrdersModel(),
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
					location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderLineItemSet"
						+ "(SalesOrderID='1',ItemPosition='10')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectValue("note", "foo")
				.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')/")
				.expectValueState("note", "Error", oNoteError.message);

			// code under test
			that.oView.byId("page").setBindingContext(
				oModel.createEntry("/SalesOrderLineItemSet", {properties : {}})
			);
			oModel.submitChanges();

			return that.waitForChanges(assert);
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
			.expectRequest("SalesOrderSet('1')?$select=SalesOrderID,Note&$expand=ToLineItems", {
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
						},
						SalesOrderID : "1"
					},
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, {
					data : {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "bar",
						SalesOrderID : "1"
					},
					statusCode : 201
				}, {
					location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet('1')/ToLineItems"
						+ "(SalesOrderID='1',ItemPosition='10')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectValue("noteLineItem", "bar")
				.expectMessage(oNoteErrorCopy, "/SalesOrderLineItemSet",
					"/SalesOrderSet('1')/ToLineItems")
				.expectValueState("noteLineItem", "Error", oNoteError.message);

			// code under test
			that.oView.byId("details").setBindingContext(
				oModel.createEntry("ToLineItems", {
					context : that.oView.byId("table").getBindingContext(),
					properties : {}
				})
			);
			oModel.submitChanges();

			return that.waitForChanges(assert);
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
					location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/BusinessPartnerSet('BP1')",
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
	// Scenario: Use ODataListBinding#create to create a new entity and discard it afterwards.
	// JIRA: CPOUI5MODELS-616
	QUnit.test("ODataListBinding#create: create and discard", function (assert) {
		var oBinding, oCreatedContext, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<Table growing="true" growingThreshold="2" id="SalesOrderList" items="{/SalesOrderSet}">\
	<Text id="SalesOrderNote" text="{Note}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2", {
				results : []
			})
			.expectValue("SalesOrderNote", []);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("SalesOrderList");
			oBinding = oTable.getBinding("items");

			that.expectValue("SalesOrderNote", ["baz"]);

			// code under test
			oCreatedContext = oBinding.create({Note : "baz"});

			assert.strictEqual(oBinding.getLength(), 1);
			assert.strictEqual(oBinding.getCount(), 1);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getItems().length, 1);

			return Promise.all([
				// code under test
				oModel.resetChanges([oCreatedContext.getPath()], undefined, true),
				// code under test
				oCreatedContext.created().then(function () {
					assert.ok(false, "unexpected success");
				}, function (oError) {
					assert.strictEqual(oError.aborted, true);
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oBinding.getLength(), 0);
			assert.strictEqual(oBinding.getCount(), 0);
			assert.strictEqual(oTable.getItems().length, 0);

			that.expectValue("SalesOrderNote", ["foo"]);

			// code under test
			oCreatedContext = oBinding.create({Note : "foo"});

			assert.strictEqual(oBinding.getLength(), 1);
			assert.strictEqual(oBinding.getCount(), 1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						},
						Note : "foo"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {
							uri : "SalesOrderSet('42')"
						},
						Note : "bar",
						SalesOrderID : "42"
					},
					statusCode : 201
				})
				.expectValue("SalesOrderNote", ["bar"]);

			oModel.submitChanges();

			return Promise.all([
				// code under test
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create the first entry on a relative list binding with a parent context for an
	// entity that has been read from the server and persist the data. After that change the parent
	// context to a transient context. Ensure that the table for this list binding gets a change
	// event and clears its content.
	// JIRA: CPOUI5MODELS-616
	QUnit.test("Clear table if parent context is transient", function (assert) {
		var oBinding, oObjectPage, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="salesOrderId" text="{SalesOrderID}" />\
	<Table id="table" items="{ToLineItems}">\
		<Text id="salesOrderNote" text="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function (oView) {
			oObjectPage = that.oView.byId("objectPage");

			that.expectHeadRequest()
				.expectRequest("SalesOrderSet('1')", {
					SalesOrderID : "1"
				})
				.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
					results : []
				})
				.expectValue("salesOrderId", "1")
				.expectValue("salesOrderNote", []);

			oObjectPage.bindElement({path : "/SalesOrderSet('1')"});

			return that.waitForChanges(assert);
		}).then(function () {
			var oCreatedContext;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrderLineItem"
						},
						Note : "foo",
						SalesOrderID : "1"
					},
					method : "POST",
					requestUri : "SalesOrderSet('1')/ToLineItems"
				}, {
					data : {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						Note : "foo",
						SalesOrderID : "1",
						ItemPosition : "10"
					},
					statusCode : 201
				})
				.expectValue("salesOrderNote", ["foo"]);

			oCreatedContext = oBinding.create({Note : "foo"});
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oCreatedContext = oModel.createEntry("/SalesOrderSet", {
					properties : {SalesOrderID : "new"}
				});

			assert.strictEqual(oTable.getItems().length, 1);

			that.expectValue("salesOrderId", "new");

			// code under test
			oObjectPage.bindElement({path : oCreatedContext.getPath()});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getItems().length, 0);
		});
	});

	//*********************************************************************************************
	// Scenario: Relative listbinding with transient contexts gets refreshed with bForceUpdate set
	// to true. Ensure, that the created entites are kept.
	// JIRA: CPOUI5MODELS-616
	QUnit.test("ODataListBinding#create: keep created after refresh", function (assert) {
		var oModel = createSalesOrdersModel(),
			oTable,
			sView = '\
<FlexBox id="page" binding="{/SalesOrderSet(\'1\')}">\
	<Table growing="true" growingThreshold="20" id="table" items="{ToLineItems}">\
		<Input id="note" value="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=20", {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Foo",
					ItemPosition : "10",
					SalesOrderID : "1"
				}]
			})
			.expectValue("note", ["Foo"])
			.expectMessages([]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("note", ["Bar", "Foo"]);

			oTable.getBinding("items").create({Note : "Bar"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getItems().length, 2);

			that.expectRequest("SalesOrderSet('1')", {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				})
				.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=20", {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						Note : "Foo",
						ItemPosition : "10",
						SalesOrderID : "1"
					}]
				});

			// code under test
			that.oView.byId("page").getElementBinding().refresh(true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getItems().length, 2);
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
					+ "?$expand=ToProduct,ToProduct/ToSupplier"
					+ "&$select=SalesOrderID,ItemPosition,ToProduct/ProductID,"
						+ "ToProduct/ToSupplier/BusinessPartnerID", {
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
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>';

		this.expectHeadRequest(bIsBusinessObject ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
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
	// Scenario: If the change group is marked to only request transient messages from the server,
	// a MERGE and a POST request must have the "sap-message" header set to "transientOnly". This
	// must also be true if a failed request is sent again.
	// JIRA: CPOUI5MODELS-1129
	QUnit.test("MERGE and POST requests have transientOnly header", function (assert) {
		var oMergeRequest = {
				data : {
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Bar"
				},
				headers : {"sap-messages" : "transientOnly"},
				key : "SalesOrderSet('1')",
				method : "MERGE",
				requestUri : "SalesOrderSet('1')"
			},
			oModel = createSalesOrdersModel({refreshAfterChange : false}),
			oPostRequest = {
				created : true,
				data : {
					__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"}
				},
				headers : {"sap-messages" : "transientOnly"},
				method : "POST",
				requestUri : "SalesOrderSet"
			},
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>',
			that = this;

		oModel.setTransitionMessagesOnlyForGroup("changes", true);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				__metadata : {uri : "SalesOrderSet('1')"},
				Note : "Foo",
				SalesOrderID : "1"
			})
			.expectValue("note", "Foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(oMergeRequest, createErrorResponse({crashBatch : true}))
				.expectRequest(oPostRequest, undefined /*not relevant*/)
				.expectValue("note", "Bar")
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/$batch",
					message : "Internal Server Error",
					persistent : false,
					target : "/$batch",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 500: "
						+ "POST /sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/$batch",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			// code under test
			oModel.setProperty("/SalesOrderSet('1')/Note", "Bar");
			oModel.createEntry("/SalesOrderSet", {properties : {}});
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest(oMergeRequest, NO_CONTENT)
				.expectRequest(oPostRequest, {
					data : {
						__metadata : {
							uri : "SalesOrderSet('2')"
						},
						SalesOrderID : "2"
					},
					statusCode : 201
				});

			// code under test
			oModel.submitChanges();
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
			.expectRequest("SalesOrderSet('1')", {
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
			.expectRequest("SalesOrderSet('1')", {
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
		var oModel = createSalesOrdersModel(),
			oSalesOrderNoteError = this.createResponseMessage("Note"),
			oSalesOrderToItem10ToProductPriceError = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			oSalesOrderItem10ToProductPriceError
				= cloneODataMessage(oSalesOrderToItem10ToProductPriceError,
					"(SalesOrderID='1',ItemPosition='10')/ToProduct/Price"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
</FlexBox>',
			bWithMessageScope = sMessageScope === MessageScope.BusinessObject,
			that = this;

		this.expectHeadRequest(bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {})
			.expectRequest({
				batchNo : 1,
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
					headers : bWithMessageScope ? {"sap-message-scope" : "BusinessObject"} : {},
					method : "DELETE",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT)
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
			.expectMessage(oMsgNoteAndGrossAmount, "/SalesOrderSet('1')/")
			.expectValueState("Note", "Warning", "Foo")
			.expectValueState("GrossAmount", "Warning", "Foo")
			.expectValueState("LifecycleStatusDescription", "None", "");

		// code under test
		return this.createView(assert, sView).then(function () {
			that.expectRequest("SalesOrderSet('1')", {
					GrossAmount : "GrossAmount A",
					LifecycleStatusDescription : "LifecycleStatusDescription A",
					Note : "Note A"
				}, {"sap-message" : getMessageHeader(oMsgGrossAmountAndLifecycleStatus)})
				.expectMessage(oMsgGrossAmountAndLifecycleStatus, "/SalesOrderSet('1')/",
					undefined, /*bResetMessages*/ true)
				.expectValueState("Note", "Error", "Bar")
				.expectValueState("GrossAmount", "None", "")
				.expectValueState("LifecycleStatusDescription", "Error", "Bar");

			// code under test: refresh => new multi-target message removes old one
			that.oView.byId("objectPage").getObjectBinding().refresh();

			return that.waitForChanges(assert);
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
					method : oFixture.method,
					requestUri : oFixture.functionName
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
				}), undefined, sODataListBindingClassName);

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
	//
	// The location response header for the function import may contain encoded characters like
	// "%2A" for "*". These characters are decoded on importing an entity when the entity key
	// derived from __metadata.uri in the response is normalized. Normalization also has to be done
	// for the entity key in the location header so that messages have the correct full target.
	// BCP: 2270118627
	QUnit.test("Messages: function import for relative list entry; w/ location", function (assert) {
		var oModel = createSalesOrdersModel(),
			oNoteError = this.createResponseMessage("('1*')/Note"),
			oToItem10NoteError = this.createResponseMessage(
				"('1*')/ToLineItems(SalesOrderID='1*',ItemPosition='10')/Note"),
			oItem10NoteError = cloneODataMessage(oToItem10NoteError,
				"(SalesOrderID='1*',ItemPosition='10')/Note"),
			sView = '\
<FlexBox binding="{/BusinessPartnerSet(\'100\')}">\
	<Table items="{ToSalesOrders}">\
		<Text id="soID" text="{SalesOrderID}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1%2A')"},
					SalesOrderID : "1*"
				}]
			}, {"sap-message" : getMessageHeader([oNoteError, oToItem10NoteError])})
			.expectMessage(oNoteError, "/SalesOrderSet", "/BusinessPartnerSet('100')/ToSalesOrders")
			.expectMessage(oItem10NoteError, "/SalesOrderLineItemSet",
				"/BusinessPartnerSet('100')/ToSalesOrders('1*')/ToLineItems")
			.expectValue("soID", ["1*"]);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oGrossAmountError = that.createResponseMessage("GrossAmount"),
				oToItem20QuantityError = that.createResponseMessage(
					"ToLineItems(SalesOrderID='1*',ItemPosition='20')/Quantity"),
				oItem20QuantityError = cloneODataMessage(oToItem20QuantityError,
					"(SalesOrderID='1*',ItemPosition='20')/Quantity");

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='1*'"
				}, {
					__metadata : {uri : "SalesOrderSet('1%2A')"},
					SalesOrderID : "1*"
				}, {
					location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet('1%2A')",
					"sap-message" : getMessageHeader([oGrossAmountError, oToItem20QuantityError])
				})
				.expectMessage(oGrossAmountError, "/SalesOrderSet('1*')/",
					"/BusinessPartnerSet('100')/ToSalesOrders('1*')/", true)
				.expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet",
					"/BusinessPartnerSet('100')/ToSalesOrders('1*')/ToLineItems");

			oPromise = oModel.callFunction("/SalesOrder_Confirm", {
				method : "POST",
				refreshAfterChange : false,
				urlParameters : {
					SalesOrderID : "1*"
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
	// Scenario 2: Function import returns a complex type with a message for an entity.
	// Use the entity's deep path for which the function is called as the root for messages.
	// BCP: 2380037458
	QUnit.test("Messages: function import for relative list entry; no location", function (assert) {
		var oModel = createSalesOrdersModel(),
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
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
			.expectValue("soID", ["1"]);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise,
				oGrossAmountError = that.createResponseMessage("GrossAmount"),
				oToItem20QuantityError = that.createResponseMessage(
					"ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"),
				oItem20QuantityError = cloneODataMessage(oToItem20QuantityError,
					"(SalesOrderID='1',ItemPosition='20')/Quantity");

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_FixItems?SalesOrderID='1'"
				}, {
					__metadata : {type : "GWSAMPLE_BASIC.CT_String"},
					String : "foo bar"
				}, {
					"sap-message" : getMessageHeader([oGrossAmountError, oToItem20QuantityError])
				})
				.expectMessage(oGrossAmountError, "/SalesOrderSet('1')/",
					"/BusinessPartnerSet('100')/ToSalesOrders('1')/", true)
				.expectMessage(oItem20QuantityError, "/SalesOrderLineItemSet",
					"/BusinessPartnerSet('100')/ToSalesOrders('1')/ToLineItems");

			oPromise = oModel.callFunction("/SalesOrder_FixItems", {
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
	// Scenario: The key predicate of an entity contains an encoded * character (='%2A'). Ensure
	// that the message targets (target and full target) are normalized in the same way as the
	// enitity key.
	// BCP: 2370146338
	QUnit.test("Messages: normalize target and full target paths", function (assert) {
		const oModel = createSalesOrdersModel();
		const sView = '\
<FlexBox id="flexbox">\
	<Table id="table" growing="true" items="{ToLineItems}">\
		<Text id="itemPosition" text="{ItemPosition}"/>\
		<Input id="note" value="{Note}"/>\
	</Table>\
</FlexBox>';

		return this.createView(assert, sView, oModel).then(() => {
			this.expectHeadRequest()
				.expectRequest({
					deepPath : "/BusinessPartnerSet('4711')/ToSalesOrders('42')/ToLineItems",
					method : "GET",
					requestUri : "SalesOrderSet('42')/ToLineItems?$skip=0&$top=20"
				}, {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='1%2A%30%2F')"
						},
						ItemPosition : "1*0/",
						Note : "Position 10",
						SalesOrderID : "42"
					}]
				}, {"sap-message" : getMessageHeader(this.createResponseMessage(
					"(SalesOrderID='42',ItemPosition='1%2A%30%2F')/Note", "Foo"))})
				.expectMessages([{
					code : "code-0",
					fullTarget : "/BusinessPartnerSet('4711')/ToSalesOrders('42')"
						+ "/ToLineItems(SalesOrderID='42',ItemPosition='1*0%2F')/Note",
					message : "Foo",
					persistent : false,
					target : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='1*0%2F')/Note",
					technical : false,
					type : "Error"
				}])
				.expectValue("itemPosition", ["1*0/"])
				.expectValue("note", ["Position 10"]);

			// code under test - relative binding context
			this.oView.byId("flexbox").setBindingContext(new Context(oModel, "/SalesOrderSet('42')",
				"/BusinessPartnerSet('4711')/ToSalesOrders('42')"));

			return this.waitForChanges(assert);
		}).then(() => {
			const oInput = this.oView.byId("table").getItems()[0].getCells()[1];
			this.expectValueState(oInput, "Error", "Foo");

			assert.strictEqual(oInput.getBinding("value").oContext.getDeepPath(),
				"/BusinessPartnerSet('4711')/ToSalesOrders('42')/ToLineItems(SalesOrderID='42',ItemPosition='1*0%2F')");
			assert.strictEqual(oInput.getBinding("value").getResolvedPath(),
				"/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='1*0%2F')/Note");
			return this.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Function import parameters need to be encoded when creating the default target
	// path for for a function import. Otherwise messages cannot be assigned properly and it might
	// lead to duplicate messages.
	// BCP: 2270075487
	QUnit.test("Messages: Encode key values for default function import target", function (assert) {
		var oModel = createSpecialCasesModel(),
			that = this;

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, "", oModel).then(function () {
			var oError = that.createResponseMessage("BankFeeSrvcChrgMeth");

			that.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
				.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "C_BankConditionTPPrepare?BankFeeConditionID='F%26FF'"
						+ "&ValidityStartDate=datetime'2022-06-16T10%3A30%3A00'"
				}, {
					"C_BankConditionTPPrepare" : {
						__metadata  : {type : "special.cases.DummyFunctionImportResult"},
						IsInvalid : false
					}
				}, {"sap-message" : getMessageHeader(oError)})
				.expectMessage(oError,
					"/C_BankConditionTP(BankFeeConditionID='F%26FF',"
					+ "ValidityStartDate=datetime'2022-06-16T10%3A30%3A00')/");

			return Promise.all([
				// code under test
				oModel.callFunction("/C_BankConditionTPPrepare", {
					method : "POST",
					urlParameters : {
						BankFeeConditionID : "F&FF",
						ValidityStartDate : UI5Date.getInstance(Date.UTC(2022, 5, 16, 10, 30, 0))
					}
				}, {
					"C_BankConditionTPPrepare" : {
						__metadata : {type : "special.cases.DummyFunctionImportResult"},
						IsInvalid : false
					}
				}).contextCreated(),
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
		var oModel = createSalesOrdersModelSpecialFunctionImports(),
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')?$expand=ToBusinessPartner"
					+ "&$select=ToBusinessPartner/BusinessPartnerID"
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
		var oModel = createSalesOrdersModelSpecialFunctionImports(),
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
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
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "ProductSet('Z')"
				}, {
					__metadata : {uri : "ProductSet('Z')"},
					ProductID : "Z"
				})
				.expectRequest({
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
		var oModel = createSalesOrdersModelSpecialFunctionImports(),
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "ProductSet('Z')"
			}, {
				__metadata : {uri : "ProductSet('Z')"},
				ProductID : "Z"
			})
			.expectRequest({
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
	// Scenario 2: Function call is retriggered with each change of a parameter value
	// JIRA: CPOUI5MODELS-1233
[
	{method : "GET", functionName : "SalesOrder_Confirm_GET"},
	{method : "POST", functionName : "SalesOrder_Confirm"}
].forEach(function (oFixture) {
	var sTitle = "Messages: function import with lazy parameter determination, method="
			+ oFixture.method;

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModelSpecialFunctionImports({
				defaultBindingMode : "TwoWay",
				// avoid reloading ToSalesOrders table with the second attempt
				refreshAfterChange : false,
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')/ToSalesOrders?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					SalesOrderID : "42"
				}]
			})
			.expectValue("soID", ["42"]);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			return oModel.callFunction("/" + oFixture.functionName, {
					groupId : "changes",
					method : oFixture.method,
					refreshAfterChange : false,
					urlParameters : {
						SalesOrderID : "1"
					}
				}).contextCreated();
		}).then(function (oFunctionContext) {
			var oWebAddressError = that.createResponseMessage("WebAddress");

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : oFixture.method,
					requestUri : oFixture.functionName + "?SalesOrderID='42'"
				}, {
					__metadata : {uri : "SalesOrderSet('42')"},
					SalesOrderID : "42"
				}, {
					location : "/SalesOrderSrv/SalesOrderSet('42')",
					"sap-message" : getMessageHeader(oWebAddressError)
				})
				.expectMessage(oWebAddressError, "/SalesOrderSet('42')/",
					"/BusinessPartnerSet('100')/ToSalesOrders('42')/");

			that.oView.byId("form").setBindingContext(oFunctionContext);
			that.oView.byId("soIDParameter").setValue("42");

			// code under test
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.hasPendingChanges(true), false);

			var oWebAddressError = that.createResponseMessage("WebAddress");

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : oFixture.method,
					requestUri : oFixture.functionName + "?SalesOrderID='13'"
				}, {
					__metadata : {uri : "SalesOrderSet('13')"},
					SalesOrderID : "13"
				}, {
					location : "/SalesOrderSrv/SalesOrderSet('13')",
					"sap-message" : getMessageHeader(oWebAddressError)
				})
				 // object has not been read so deep path is equal to the path
				.expectMessage(oWebAddressError, "/SalesOrderSet('13')/");

			// code under test - successful funtion import calls are repeated if parameter value changes
			that.oView.byId("soIDParameter").setValue("13");
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Parameters of a function import are changed after calling ODataModel#callFunction
	// before submitting the changes (#submitChanges). The request URL contains the latest parameter
	// change and the messages get the correct target/fullTarget. Navigation properties are expanded
	// in the same $batch.
	// JIRA: CPOUI5MODELS-221
	// Scenario 2: Parameter changes are considered as pending changes. When changing a parameter
	// again, another request is triggered together with another GET request for the expand.
	// JIRA: CPOUI5MODELS-1233
	QUnit.test("Messages: function import with expand and lazy parameters", function (assert) {
		var oEventHandler = {
				error : function () {},
				success : function () {}
			},
			oEventHandlerMock = this.mock(oEventHandler),
			oModel = createSalesOrdersModelSpecialFunctionImports({
				defaultBindingMode : "TwoWay",
				tokenHandling : false
			}),
			sView = '\
<FlexBox id="form">\
	<Input id="soIDParameter" value="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		oModel.setMessageScope(MessageScope.BusinessObject);

		oEventHandlerMock.expects("error").never();
		oEventHandlerMock.expects("success").never();

		return this.createView(assert, sView, oModel).then(function () {
			return oModel.callFunction("/SalesOrder_Confirm", {
					error : oEventHandler.error,
					expand : "ToLineItems",
					groupId : "changes",
					method : "POST",
					refreshAfterChange : false,
					success : oEventHandler.success,
					urlParameters : {
						SalesOrderID : "1"
					}
				}).contextCreated();
		}).then(function (oFunctionContext) {
			var oWebAddressError = that.createResponseMessage("WebAddress"),
				oSalesOrder42 = {
					__metadata : {uri : "SalesOrderSet('42')"},
					SalesOrderID : "42"
				},
				oToLineItems = {
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
				};

			assert.notOk(oModel.hasPendingChanges(), "no parameter change -> no pending change");

			that.expectRequest({
					batchNo : 1,
					encodeRequestUri : false,
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='42'"
				}, oSalesOrder42, {
					location : "/SalesOrderSrv/SalesOrderSet('42')"
				})
				.expectRequest({
					batchNo : 1,
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "$~key~?$expand=ToLineItems&$select=ToLineItems"
				}, oToLineItems, {
					"sap-message" : getMessageHeader(oWebAddressError)
				})
				.expectMessage(oWebAddressError, "/SalesOrderSet('42')/");

			that.oView.byId("form").setBindingContext(oFunctionContext);
			that.oView.byId("soIDParameter").setValue("42");

			// parameter value changes lead to pending changes
			assert.ok(oModel.hasPendingChanges());

			oEventHandlerMock.expects("success")
				.withExactArgs(merge({}, oSalesOrder42, oToLineItems), sinon.match.object);

			// code under test
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test: no request as there are no parameter changes
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		}).then(function () {
			var oWebAddressError = that.createResponseMessage("WebAddress"),
				oSalesOrder13 = {
					__metadata : {uri : "SalesOrderSet('13')"},
					SalesOrderID : "13"
				},
				oToLineItems = {
					__metadata : {uri : "SalesOrderSet('13')"},
					ToLineItems : {
						results : [{
							__metadata : {
								uri : "SalesOrderLineItemSet(SalesOrderID='13',ItemPosition='20')"
							},
							ItemPosition : "20",
							Note : "ItemNote",
							SalesOrderID : "13"
						}]
					}
				};

			that.expectRequest({
					batchNo : 2,
					encodeRequestUri : false,
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='13'"
				}, oSalesOrder13, {
					location : "/SalesOrderSrv/SalesOrderSet('13')"
				})
				.expectRequest({
					batchNo : 2,
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "$~key~?$expand=ToLineItems&$select=ToLineItems"
				}, oToLineItems, {
					"sap-message" : getMessageHeader(oWebAddressError)
				})
				.expectMessage(oWebAddressError, "/SalesOrderSet('13')/");

			that.oView.byId("soIDParameter").setValue("13");

			oEventHandlerMock.expects("success")
				.withExactArgs(merge({}, oSalesOrder13, oToLineItems), sinon.match.object);

			// code under test - changing a parameter value repeats the request
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Parameters of a function import are changed after calling ODataModel#callFunction
	// before submitting the changes (#submitChanges). If the request fails, the function call is
	// repeated with the next call of submitChanges even without changing the parameters again.
	// JIRA: CPOUI5MODELS-1233
	QUnit.test("callFunction: lazy parameter changes; failed request is repeated", function (assert) {
		var oEventHandler = {
				error : function () {},
				success : function () {}
			},
			oEventHandlerMock = this.mock(oEventHandler),
			oModel = createSalesOrdersModelSpecialFunctionImports({
				defaultBindingMode : "TwoWay",
				tokenHandling : false
			}),
			sView = '\
<FlexBox id="form">\
	<Input id="soIDParameter" value="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		oEventHandlerMock.expects("error").never();
		oEventHandlerMock.expects("success").never();

		return this.createView(assert, sView, oModel).then(function () {
			return oModel.callFunction("/SalesOrder_Confirm", {
				error : oEventHandler.error,
				expand : "ToLineItems",
				groupId : "changes",
				method : "POST",
				refreshAfterChange : false,
				success : oEventHandler.success,
				urlParameters : {
					SalesOrderID : "1"
				}
			}).contextCreated();
		}).then(function (oFunctionContext) {
			var oErrorResponse = createErrorResponse({message : "POST failed", statusCode : 400});
			that.expectRequest({
					encodeRequestUri : false,
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='foo'"
				}, oErrorResponse)
				.expectRequest("$~key~?$expand=ToLineItems&$select=ToLineItems",
					createErrorResponse({message : "GET failed", statusCode : 424}))
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('foo')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('foo')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrder_Confirm?SalesOrderID='foo'",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			that.oLogMock.expects("error")
				.withExactArgs(sinon.match(new RegExp("Request failed with status code 424: "
						+ "GET \\$id-\\d*-\\d*\\?\\$expand=ToLineItems&\\$select=ToLineItems")),
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			that.oView.byId("form").setBindingContext(oFunctionContext);
			that.oView.byId("soIDParameter").setValue("foo");

			// other properties are not of interest
			oEventHandlerMock.expects("error").withExactArgs(sinon.match({
				message : "HTTP request failed",
				responseText : oErrorResponse.body,
				statusCode : 400,
				statusText : "FAILED"
			}));

			// code under test
			oModel.submitChanges({groupId : "changes"});

			return that.waitForChanges(assert);
		}).then(function () {
			var oErrorResponse = createErrorResponse({message : "POST failed", statusCode : 400});

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='foo'"
				}, oErrorResponse)
				.expectRequest("$~key~?$expand=ToLineItems&$select=ToLineItems",
					createErrorResponse({message : "GET failed", statusCode : 424}))
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('foo')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('foo')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrder_Confirm?SalesOrderID='foo'",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);
			that.oLogMock.expects("error")
				.withExactArgs(sinon.match(new RegExp("Request failed with status code 424: "
						+ "GET \\$id-\\d*-\\d*\\?\\$expand=ToLineItems&\\$select=ToLineItems")),
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			oEventHandlerMock.expects("error").withExactArgs(sinon.match({
				message : "HTTP request failed",
				responseText : oErrorResponse.body,
				statusCode : 400,
				statusText : "FAILED"
			}));

			that.removePersistentAndTechnicalMessages();

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
		var oModel = createSalesOrdersModelSpecialFunctionImports(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Table items="{path : \'ToLineItems\', parameters : {transitionMessagesOnly : true}}">\
		<Text id="note" text="{Note}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
				headers : {"sap-messages" : "transientOnly"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectValue("note", "Foo", 0);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oNoteError = that.createResponseMessage("Note"),
				oPromise;

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "LineItem_Create?SalesOrderID='1'"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					ItemPosition : "20",
					Note : "Bar",
					SalesOrderID : "1"
				}, {
					location : "/SalesOrderSrv/"
						+ "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectRequest({
					headers : {"sap-messages" : "transientOnly"},
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "Foo",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
						},
						ItemPosition : "20",
						Note : "Bar",
						SalesOrderID : "1"
					}]
				})
				.expectValue("note", "Bar", 1)
				.expectMessage(oNoteError,
					"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')/",
					"/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20')/");

			// code under test
			oPromise = oModel.callFunction("/LineItem_Create", {
				adjustDeepPath : function (mParameters) {
					assert.strictEqual(mParameters.deepPath,
						"/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')");
					return "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='20')";
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
		var oModel = createSalesOrdersModelSpecialFunctionImports(),
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
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('100')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('100')"}
			})
			.expectRequest({
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
			.expectValue("soID", ["1"]);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oGrossAmountError = that.createResponseMessage("GrossAmount"),
				oPromise,
				oToItem20QuantityError = that.createResponseMessage(
					"ToLineItems(SalesOrderID='1',ItemPosition='20')/Quantity"),
				oItem20QuantityError = cloneODataMessage(oToItem20QuantityError,
					"(SalesOrderID='1',ItemPosition='20')/Quantity");

			that.expectRequest({
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
</FlexBox>';

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
			.expectMessage(oNoteWarning, "/SalesOrderSet('1')/")
			.expectValueState("Note0", "Warning", "Foo")
			.expectValueState("Note1", "Warning", "Foo")
			.expectValueState("Note2", "None", "")
			.expectValueState("Composite0", "Warning", "Foo")
			.expectValueState("Composite1", "Warning", "Foo")
			.expectValueState("Composite2", "None", "")
			.expectValueState("Composite3", "Warning", "Foo")
			.expectValueState("Composite4", "None", "");

		// code under test
		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: With the binding parameter <code>ignoreMessages</code> the application developer
	// can control whether messages are displayed at the control. It works for
	// <code>sap.ui.model.json.JSONPropertyBinding</code>s and composite bindings containing such
	// bindings.
	// JIRA: CPOUI5MODELS-1397
	QUnit.test("JSONPropertyBinding and CompositeBindings: ignoreMessages", function (assert) {
		var oJSONModel = new JSONModel({
				data: {SalesOrderID: "1", Note: "Note"}
			}),
			oMessage = {
				processor: oJSONModel,
				target: ["/data/Note"],
				message: "Foo",
				type: MessageType.Warning
			},
			sView = '\
<FlexBox id="objectPage" binding="{/data}">\
	<Input id="Note0" value="{Note}" />\
	<Input id="Note1" value="{path: \'Note\', parameters: {ignoreMessages: false}}" />\
	<Input id="Note2" value="{path: \'Note\', parameters: {ignoreMessages: true}}" />\
	<Input id="Composite0" value="{= ${SalesOrderID} + ${value: \' - \'} + ${Note}}" />\
	<Input id="Composite1" value="{= ${SalesOrderID} + ${value: \' - \'} + ${\
			path: \'Note\',\
			parameters: {ignoreMessages: false}\
		}}" />\
	<Input id="Composite2" value="{= ${SalesOrderID} + ${value: \' - \'} + ${\
			path: \'Note\',\
			parameters: {ignoreMessages: true}\
		}}" />\
	<Input id="Composite3" value="{parts: [\'SalesOrderID\', {value: \'-\'}, {\
			path: \'Note\',\
			parameters: {ignoreMessages: false}\
		}]}" />\
	<Input id="Composite4" value="{parts: [\'SalesOrderID\', {value: \'-\'}, {\
			path: \'Note\',\
			parameters: {ignoreMessages: true}\
		}]}" />\
</FlexBox>';

		this.expectValue("Note0", "Note")
			.expectValue("Note1", "Note")
			.expectValue("Note2", "Note")
			.expectValue("Composite0", "1 - Note")
			.expectValue("Composite1", "1 - Note")
			.expectValue("Composite2", "1 - Note")
			.expectValue("Composite3", "1 - Note")
			.expectValue("Composite4", "1 - Note")
			.expectValueState("Note0", "Warning", "Foo")
			.expectValueState("Note1", "Warning", "Foo")
			.expectValueState("Note2", "None", "")
			.expectValueState("Composite0", "Warning", "Foo")
			.expectValueState("Composite1", "Warning", "Foo")
			.expectValueState("Composite2", "None", "")
			.expectValueState("Composite3", "Warning", "Foo")
			.expectValueState("Composite4", "None", "")
			.expectMessages([oMessage]);

		Messaging.addMessages([new Message(oMessage)]);

		// code under test
		return this.createView(assert, sView, oJSONModel);
	});

	//*********************************************************************************************
	// Scenario: With the binding parameter <code>ignoreMessages</code> the application developer
	// can control whether messages are displayed at the control. It works for
	// <code>sap.ui.model.xml.XMLPropertyBinding</code>s and composite bindings containing such
	// bindings.
	// JIRA: CPOUI5MODELS-1397
	QUnit.test("XMLPropertyBinding and CompositeBindings: ignoreMessages", function (assert) {
		var oXMLModel = new XMLModel(),
			oMessage = {
				processor: oXMLModel,
				target: ["/data/0/@Note"],
				message: "Foo",
				type: MessageType.Warning
			},
			sView = '\
<FlexBox id="objectPage" binding="{/data/0}">\
	<Input id="Note0" value="{@Note}" />\
	<Input id="Note1" value="{path: \'@Note\', parameters: {ignoreMessages: false}}" />\
	<Input id="Note2" value="{path: \'@Note\', parameters: {ignoreMessages: true}}" />\
	<Input id="Composite0" value="{= ${@SalesOrderID} + ${value: \' - \'} + ${@Note}}" />\
	<Input id="Composite1" value="{= ${@SalesOrderID} + ${value: \' - \'} + ${\
			path: \'@Note\',\
			parameters: {ignoreMessages: false}\
		}}" />\
	<Input id="Composite2" value="{= ${@SalesOrderID} + ${value: \' - \'} + ${\
			path: \'@Note\',\
			parameters: {ignoreMessages: true}\
		}}" />\
	<Input id="Composite3" value="{parts: [\'@SalesOrderID\', {value: \'-\'}, {\
			path: \'@Note\',\
			parameters: {ignoreMessages: false}\
		}]}" />\
	<Input id="Composite4" value="{parts: [\'@SalesOrderID\', {value: \'-\'}, {\
			path: \'@Note\',\
			parameters: {ignoreMessages: true}\
		}]}" />\
</FlexBox>';

		this.expectValue("Note0", "Note")
			.expectValue("Note1", "Note")
			.expectValue("Note2", "Note")
			.expectValue("Composite0", "1 - Note")
			.expectValue("Composite1", "1 - Note")
			.expectValue("Composite2", "1 - Note")
			.expectValue("Composite3", "1 - Note")
			.expectValue("Composite4", "1 - Note")
			.expectValueState("Note0", "Warning", "Foo")
			.expectValueState("Note1", "Warning", "Foo")
			.expectValueState("Note2", "None", "")
			.expectValueState("Composite0", "Warning", "Foo")
			.expectValueState("Composite1", "Warning", "Foo")
			.expectValueState("Composite2", "None", "")
			.expectValueState("Composite3", "Warning", "Foo")
			.expectValueState("Composite4", "None", "")
			.expectMessages([oMessage]);

		oXMLModel.setXML('<?xml version="1.0"?><root><data SalesOrderID="1" Note="Note"/></root>');
		Messaging.addMessages([new Message(oMessage)]);

		// code under test
		return this.createView(assert, sView, oXMLModel);
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
</FlexBox>';

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
			.expectMessage(oCurrencyCodeWarning, "/SalesOrderSet('1')/")
			.expectValueState("Amount0", "None", "")
			.expectValueState("Amount1", "Warning", "Foo")
			.expectValueState("Amount2", "None", "");

		// code under test
		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: Messages for parts of the composite binding are propagated based on the format
	// options showDate, showTime and showTimezone.
	// JIRA: CPOUI5MODELS-752
	QUnit.test("Messages: sap.ui.model.odata.type.DateTimeWithTimezone", function (assert) {
		var oDateWarning = this.createResponseMessage("DateTime", "Foo", "warning"),
			oModel = createSpecialCasesModel({
				defaultBindingMode : BindingMode.TwoWay
			}),
			sView = '\
<FlexBox id="objectPage" binding="{/DateTimeWithTimezoneSet(\'1\')}">\
	<Input id="dateAndTime" value="{\
		formatOptions : {showDate : true, showTime : true, showTimezone : false},\
		parts : [\
			{path : \'DateTime\', parameters : {useUndefinedIfUnresolved : true}},\
			{path : \'TimezoneID\', parameters : {useUndefinedIfUnresolved : true}}\
		],\
		type : \'sap.ui.model.odata.type.DateTimeWithTimezone\'}" />\
	<Input id="date" value="{\
		formatOptions : {showDate : true, showTime : false, showTimezone : false},\
		parts : [\
			{path : \'DateTime\', parameters : {useUndefinedIfUnresolved : true}},\
			{path : \'TimezoneID\', parameters : {useUndefinedIfUnresolved : true}}\
		],\
		type : \'sap.ui.model.odata.type.DateTimeWithTimezone\'}" />\
	<Input id="time" value="{\
		formatOptions : {showDate : false, showTime : true, showTimezone : false},\
		parts : [\
			{path : \'DateTime\', parameters : {useUndefinedIfUnresolved : true}},\
			{path : \'TimezoneID\', parameters : {useUndefinedIfUnresolved : true}}\
		],\
		type : \'sap.ui.model.odata.type.DateTimeWithTimezone\'}" />\
	<Input id="timezone" value="{\
		formatOptions : {showDate : false, showTime : false, showTimezone : true},\
		parts : [\
			{path : \'DateTime\', parameters : {useUndefinedIfUnresolved : true}},\
			{path : \'TimezoneID\', parameters : {useUndefinedIfUnresolved : true}}\
		],\
		type : \'sap.ui.model.odata.type.DateTimeWithTimezone\'}" />\
	<Input id="default" value="{\
		parts : [\
			{path : \'DateTime\', parameters : {useUndefinedIfUnresolved : true}},\
			{path : \'TimezoneID\', parameters : {useUndefinedIfUnresolved : true}}\
		],\
		type : \'sap.ui.model.odata.type.DateTimeWithTimezone\'}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("DateTimeWithTimezoneSet('1')", {
				// no need to use UI5Date.getInstance as datajs returns JavaScript Dates
				DateTime : new Date(1642413288000),
				ID : "1",
				TimezoneID : "America/New_York"
			}, {"sap-message" : getMessageHeader(oDateWarning)})
			.expectValue("dateAndTime", "Jan 17, 2022, 4:54:48\u202FAM")
			.expectValue("date", "Jan 17, 2022")
			.expectValue("time", "4:54:48\u202FAM")
			.expectValue("timezone", "Americas, New York")
			.expectValue("default", "Jan 17, 2022, 4:54:48\u202FAM Americas, New York")
			.expectMessage(oDateWarning, "/DateTimeWithTimezoneSet('1')/")
			.expectValueState("dateAndTime", "Warning", "Foo")
			.expectValueState("date", "Warning", "Foo")
			.expectValueState("time", "Warning", "Foo")
			.expectValueState("timezone", "None", "")
			.expectValueState("default", "Warning", "Foo");

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			var oTimezoneWarning = that.createResponseMessage("TimezoneID", "Bar", "warning");

			that.expectRequest("DateTimeWithTimezoneSet('1')", {
					// no need to use UI5Date.getInstance as datajs returns JavaScript Dates
					DateTime : new Date(1642413288000),
					ID : "1",
					TimezoneID : "America/New_York"
				}, {"sap-message" : getMessageHeader(oTimezoneWarning)})
				.expectMessage(oTimezoneWarning, "/DateTimeWithTimezoneSet('1')/", undefined, true)
				.expectValueState("dateAndTime", "None", "")
				.expectValueState("date", "None", "")
				.expectValueState("time", "None", "")
				.expectValueState("timezone", "Warning", "Bar")
				.expectValueState("default", "Warning", "Bar");

			// code under test
			oModel.refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: DateTimeWithTimezone type parses empty input for time zone to empty string instead
	// of null if the corresponding part has format option parseKeepsEmptyString.
	// JIRA: CPOUI5MODELS-858
	QUnit.test("Empty string: sap.ui.model.odata.type.DateTimeWithTimezone", function (assert) {
		var oModel = createSpecialCasesModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<FlexBox id="objectPage" binding="{/DateTimeWithTimezoneSet(\'1\')}">\
	<Input id="timezone" value="{\
		formatOptions : {showDate : false, showTime : false},\
		parts : [\
			{path : \'DateTime\', parameters : {useUndefinedIfUnresolved : true}},\
			{\
				constraints : {nullable : false},\
				formatOptions : {parseKeepsEmptyString : true},\
				parameters : {useUndefinedIfUnresolved : true},\
				path : \'TimezoneID\',\
				type : \'sap.ui.model.odata.type.String\'\
			}\
		],\
		type : \'sap.ui.model.odata.type.DateTimeWithTimezone\'}" />\
</FlexBox>',
		that = this;

		Localization.setTimezone("Europe/London");

		this.expectHeadRequest()
			.expectRequest("DateTimeWithTimezoneSet('1')", {
				// no need to use UI5Date.getInstance as datajs returns JavaScript Dates
				DateTime : new Date(1642413288000),
				ID : "1",
				TimezoneID : ""
			})
			.expectValue("timezone", "Europe, London");

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			that.expectValue("timezone", "Americas, New York");

			// code under test
			that.oView.byId("timezone").setValue("Americas, New York");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.getProperty("/DateTimeWithTimezoneSet('1')/TimezoneID"),
				"America/New_York");

			that.expectValue("timezone", "Europe, London")
				.expectValue("timezone", "Europe, London")
				.expectValueState("timezone", "None", "");

			// code under test
			that.oView.byId("timezone").setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.getProperty("/DateTimeWithTimezoneSet('1')/TimezoneID"),
				"", "time zone value in model is empty string, not null");
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
<t:AnalyticalTable id="table" rows="{path : \'/Items\',\
		parameters : {useBatchRequests : true}, sorter : {path : \'AccountingDocumentItem\', descending : true}}"\
		threshold="10" visibleRowCount="2">\
	<t:AnalyticalColumn grouped="true" leadingProperty="AccountingDocumentItem">\
		<Label text="AccountingDocumentItem"/>\
		<t:template><Text wrapping="false" text="{AccountingDocumentItem}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
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
		this.oLogMock.expects("warning")
			.withExactArgs("Applying sorters to groups is only possible with auto expand mode 'Sequential';"
				+ " current mode is: Bundled",
				"/Items", "sap.ui.model.analytics.AnalyticalBinding", undefined)
			.atLeast(1);

		this.expectRequest({
				encodeRequestUri : false,
				requestUri : "Items" // Grand Total Request
					+ "?$select=AmountInCompanyCodeCurrency,Currency&$top=100"
					+ "&$inlinecount=allpages"
			}, {
				__count : "1",
				results : [{
					__metadata : {
						uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items('grandTotal')"
					},
					AmountInCompanyCodeCurrency : "21763001.16",
					Currency : "USD"
				}]
			})
			.expectRequest({
				encodeRequestUri : false,
				requestUri : "Items" // Data and Count Request
					+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency"
					+ "&$orderby=AccountingDocumentItem%20desc&$top=11&$inlinecount=allpages"
			}, {
				__count : "550",
				results : getItems(11)
			});
			// no expectValue required because only $skip&$top is relevant to be checked

		return this.createView(assert, sView, oModel).then(function () {
			// BEGIN: CPOUI5MODELS-576
			// code under test
			assert.strictEqual(that.oView.byId("table").getBinding("rows").getCount(), 550);
			// getLength has one row more because of the grand total row
			assert.strictEqual(that.oView.byId("table").getBinding("rows").getLength(), 551);
			// END: CPOUI5MODELS-576
		}).then(function () {
			oTable = that.oView.byId("table");

			that.expectRequest({
					encodeRequestUri : false,
					requestUri : "Items"
						+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,"
						+ "Currency&$orderby=AccountingDocumentItem%20desc&$skip=11&$top=6"
				}, {
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
			that.expectRequest({
					encodeRequestUri : false,
					requestUri : "Items"
						+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=AccountingDocumentItem%20desc&$skip=90&$top=21"
				}, {
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
			that.expectRequest({
					encodeRequestUri : false,
					requestUri : "Items"
						+ "?$select=AccountingDocumentItem,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=AccountingDocumentItem%20desc&$skip=84&$top=6"
				}, {
					results : getItems(6)
				});

			// code under test: gap in front of start index
			oTable.setFirstVisibleRow(94);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Grouping by a property of type "Edm.Time" is possible with the AnalyticalBinding.
	// The AnalyticalBinding has to ensure that the generated IDs e.g. multi-unit ID, group ID are
	// different for different "Edm.Time" values. "Edm.Time" objects are the only ones that do not
	// provide a useful toString representation.
	// SNOW: CS20230006325114
[{
	sTitle: "no multi-unit case ([a, b, c,| d, e,| f, g, h, i, j])",
	aLengths: [551, 551, 551],
	aKeyIndexForRoot: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	aMultiUnitIndices: [],
	aMultiUnitKeysForRoot: undefined,
	aSkip: [5, 3],
	aTop: [5, 2],
	aVisibleRow: [7, 2],
	bWithWarning: false
}, {
	sTitle: "multi-unit at the end of the gap ([a, a, b,| c, d, d, e, f,| f, g, h, ...]); case c) II",
	aKeyIndexForRoot: ["ZERO", 2, 3, -4, 6, -7, 9, 10, 11, 12, 13, 14, 15],
	aLengths: [550, 550, 548],
	aMultiUnitIndices: [[0, 1], [4,5], [7, 8]],
	aMultiUnitKeysForRoot: [
		",,,0,*,,,-multiple-units-not-dereferencable",
		undefined,
		undefined,
		",,,4,*,,,-multiple-units-not-dereferencable",
		undefined,
		",,,7,*,,,-multiple-units-not-dereferencable"
	],
	aSkip: [8, 3],
	aTop: [8, 5],
	aVisibleRow: [9, 2],
	bWithWarning: true
}, {
	sTitle: "multi-unit in block one and at the beginning and the end of last block"
		+ " ([a, a, b,| b, c, d, e, e,| e, g, h, ...])",
	aKeyIndexForRoot: ["ZERO", -2, 4, 5, -6, 9, 10, 11, 12, 13, 14, 15],
	aLengths: [550, 550, 547],
	aMultiUnitIndices: [[0, 1], [2, 3], [6, 8]],
	aMultiUnitKeysForRoot: [
		",,,0,*,,,-multiple-units-not-dereferencable",
		",,,2,*,,,-multiple-units-not-dereferencable",
		undefined,
		undefined,
		",,,6,*,,,-multiple-units-not-dereferencable"
	],
	aSkip: [8, 3],
	aTop: [8, 5],
	aVisibleRow: [9, 2],
	bWithWarning: true
}].forEach(function (oFixture) {
	QUnit.test("AnalyticalBinding: grouping by property of type Edm.Time, " + oFixture.sTitle, function (assert) {
		var oBinding, oTable,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS", {
				tokenHandling : false
			}),
			sView = '\
<t:AnalyticalTable id="table" rows="{path : \'/Items\', parameters : {useBatchRequests : true}}"\
		threshold="2" visibleRowCount="2">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CreationTime">\
		<Label text="CreationTime"/>\
		<t:template><Text wrapping="false" text="{CreationTime}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
			that = this;

		var aItems = [];
		for (var i = 0; i < 50; i += 1) {
			aItems.push({
				__metadata : {uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(" + i + ")"},
				CreationTime : {ms: i, __edmType: 'Edm.Time'},
				AmountInCompanyCodeCurrency : String(i),
				Currency : "USD"
			});
		}
		// create multi-unit situations by reusing the dimension value of the grouped column (CreationTime) of the first
		// item of the range for all others in the range; a multi-unit situation requires also a different dimension
		// value of the measure's dimension, so use different the Currency values.
		oFixture.aMultiUnitIndices.forEach(function (aMultiUnitRange) {
			var iFrom = aMultiUnitRange[0],
				iTo = aMultiUnitRange[1];

			for (var i = iFrom + 1; i <= iTo; i += 1) {
				aItems[i].CreationTime = aItems[iFrom].CreationTime;
				aItems[i].Currency = aItems[iFrom].Currency + i;
			}
		});

		this.oLogMock.expects("warning")
			.withExactArgs("Detected a multi-unit case, so sorting is only possible on leaves", "/Items",
				"sap.ui.model.analytics.AnalyticalBinding", undefined)
			.exactly(oFixture.bWithWarning ? 1 : 0);

		this.expectRequest({
				encodeRequestUri : false,
				requestUri : "Items" // Grand Total Request
					+ "?$select=AmountInCompanyCodeCurrency,Currency&$top=100"
					+ "&$inlinecount=allpages"
			}, {
				__count : "1",
				results : [{
					__metadata : {uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items('grandTotal')"},
					AmountInCompanyCodeCurrency : "42.00",
					Currency : "USD"
				}]
			})
			.expectRequest({
				encodeRequestUri : false,
				requestUri : "Items" // Data and Count Request
					+ "?$select=CreationTime,AmountInCompanyCodeCurrency,Currency"
					+ "&$orderby=CreationTime%20asc&$top=3&$inlinecount=allpages"
			}, {
				__count : "550",
				results : aItems.slice(0, 3)
			});

		function readBlock(i) {
			assert.strictEqual(oBinding.getLength(), oFixture.aLengths[i]);

			var iSkip = oFixture.aSkip[i];
			var iTop = oFixture.aTop[i];
			that.expectRequest({
					encodeRequestUri : false,
					requestUri : "Items"
						+ "?$select=CreationTime,AmountInCompanyCodeCurrency,"
						+ "Currency&$orderby=CreationTime%20asc&$skip=" + iSkip + "&$top=" + iTop
				}, {
					results : aItems.slice(iSkip, iSkip + iTop)
				});

			// code under test
			oTable.setFirstVisibleRow(oFixture.aVisibleRow[i]);

			return that.waitForChanges(assert);
		}

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			return readBlock(0);
		}).then(function () {
			return readBlock(1);
		}).then(function () {
			assert.strictEqual(oBinding.getLength(), oFixture.aLengths[2]);
			var aMultiUnitKeysForRoot = oBinding.mMultiUnitKey["/"];
			// strip trailing |<number> to before comparing; number is a global counter of multi-unit situations
			if (aMultiUnitKeysForRoot) {
				aMultiUnitKeysForRoot = aMultiUnitKeysForRoot.map(function (sKey) {
					return sKey.split("|")[0];
				});
			}
			assert.deepEqual(aMultiUnitKeysForRoot, oFixture.aMultiUnitKeysForRoot);
			assert.deepEqual(oBinding.mKeyIndex["/"], oFixture.aKeyIndexForRoot);
		});
	});
});

	//*********************************************************************************************
	// Scenario: A user scrolls in an AnalyticalTable. Further data needs to be requested. The first
	// entry of a response for a level request belongs to a different node than the watermark node.
	// The response has to be inserted at the right position, no empty rows for missing data are
	// displayed. To reproduce the issue we need at least 3 expanded levels and the watermark has to
	// be on the second level after initial data load.
	// BCP: 2280169612
	QUnit.test("AnalyticalBinding: Second chunk of data is properly inserted even if first entry"
			+ " does not belong to the watermark node", function (assert) {
		var oBinding, oTable,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS"),
			sView = '\
<t:AnalyticalTable id="table" threshold="6" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="true" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="true" leadingProperty="AccountingDocument">\
		<Label text="AccountingDocument"/>\
		<t:template><Text wrapping="false" text="{AccountingDocument}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="AccountingDocumentItem">\
		<Label text="AccountingDocumentItem"/>\
		<t:template><Text wrapping="false" text="{AccountingDocumentItem}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,AccountingDocumentItem"
						+ "&$top=0&$inlinecount=allpages"
				}, {__count : "140", results : []})
				// for simplicity the character of the dimension value defines the level and the
				// number the poisition within that level
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
					+ "&$orderby=CompanyCode%20asc&$top=3"
				}, {
					results : [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2")
					]
				})
				.expectRequest({ // second level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc&$top=3"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0"),
						getFarCustomerLineItem("A1", "B0"),
						getFarCustomerLineItem("A2", "B0")
					]
				})
				.expectRequest({ // third level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
						+ "&$top=4"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0", "C0"),
						getFarCustomerLineItem("A0", "B0", "C1"),
						getFarCustomerLineItem("A1", "B0", "C0"),
						getFarCustomerLineItem("A1", "B0", "C1")
					]
				})
				.expectRequest({ // leaf request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,AccountingDocumentItem,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
							+ "&$top=6"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0", "C0", "D0"),
						getFarCustomerLineItem("A0", "B0", "C1", "D0"),
						getFarCustomerLineItem("A1", "B0", "C0", "D0"),
						getFarCustomerLineItem("A1", "B0", "C1", "D0"),
						getFarCustomerLineItem("A2", "B0", "C0", "D0"),
						getFarCustomerLineItem("A2", "B0", "C1", "D0")
					]
				});

			// bind it lately otherwise table resets numberOfExpandedLevels to 0
			oTable.bindRows({
				path : "/Items",
				parameters : {
					numberOfExpandedLevels : 3,
					provideGrandTotals : false,
					useBatchRequests : true
				}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "", "", "", "1"],
				["A0", "B0", "", "", "1"],
				["A0", "B0", "C0", "", "1"],
				["A0", "B0", "C0", "D0", "1"]
			]);

			oBinding = oTable.getBinding("rows");
			assert.strictEqual(oBinding._oWatermark.groupID, "/A1/B0/");
			assert.strictEqual(oBinding._oWatermark.startIndex, 2);

			// code under test - scroll to load next chunk of data (based on the watermark)
			oTable.setFirstVisibleRow(4);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "B0", "C1", "", "1"],
				["A0", "B0", "C1", "D0", "1"],
				["A1", "", "", "", "1"],
				["A1", "B0", "", "", "1"]
			]);

			that.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
					+ "&$filter=((((CompanyCode%20gt%20%27A1%27))))&$orderby=CompanyCode%20asc"
					+ "&$top=3"
				}, {
					results : [
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3"),
						getFarCustomerLineItem("A4")
					]
				})
				.expectRequest({ // second level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency"
						+ "&$filter=((((CompanyCode%20gt%20%27A1%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A1%27)"
								+ "%20and%20(Customer%20gt%20%27B0%27))))"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc&$top=3"
				}, {
					results : [
						getFarCustomerLineItem("A2", "B0"),
						getFarCustomerLineItem("A3", "B0"),
						getFarCustomerLineItem("A4", "B0")
					]
				})
				.expectRequest({ // third level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$filter=((((CompanyCode%20gt%20%27A1%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A1%27)"
								+ "%20and%20(Customer%20gt%20%27B0%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A1%27)"
								+ "%20and%20(Customer%20eq%20%27B0%27)"
								+ "%20and%20(AccountingDocument%20gt%20%27C1%27))))"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
						+ "&$top=4"
				}, {
					results : [
						getFarCustomerLineItem("A2", "B0", "C0"),
						getFarCustomerLineItem("A3", "B0", "C1"),
						getFarCustomerLineItem("A4", "B0", "C0"),
						getFarCustomerLineItem("A5", "B0", "C1")
					]
				})
				.expectRequest({ // leaf request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,AccountingDocumentItem,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$filter=((((CompanyCode%20gt%20%27A1%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A1%27)"
								+ "%20and%20(Customer%20gt%20%27B0%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A1%27)"
								+ "%20and%20(Customer%20eq%20%27B0%27)"
								+ "%20and%20(AccountingDocument%20gt%20%27C1%27))))"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
						+ "&$top=6"
				}, {
					results : [
						getFarCustomerLineItem("A2", "B0", "C0", "D0"),
						getFarCustomerLineItem("A2", "B0", "C1", "D0"),
						getFarCustomerLineItem("A3", "B0", "C0", "D0"),
						getFarCustomerLineItem("A3", "B0", "C1", "D0"),
						getFarCustomerLineItem("A4", "B0", "C0", "D0"),
						getFarCustomerLineItem("A4", "B0", "C1", "D0")
					]
				});

			// code under test - scroll to see first entry after the former watermark node
			oTable.setFirstVisibleRow(11);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A1", "B0", "C1", "D0", "1"],
				["A2", "", "", "", "1"],
				["A2", "B0", "", "", "1"],
				["A2", "B0", "C0", "", "1"] // must not be an empty row as in BCP 2280169612
			]);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: An analytical table is expanded to level 2. On root level there are only few
	// entries but the first node of the first level has a lot of children. Avoid loading all
	// children if it is not necessary because there is enough data on the client for the table
	// BCP: 2270125832
	QUnit.test("AnalyticalBinding: Avoid loading all nodes for a watermark", function (assert) {
		var oBinding, oTable,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS"),
			sView = '\
<t:AnalyticalTable id="table" threshold="1" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="true" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="true" leadingProperty="AccountingDocument">\
		<Label text="AccountingDocument"/>\
		<t:template><Text wrapping="false" text="{AccountingDocument}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer,AccountingDocument"
						+ "&$top=0&$inlinecount=allpages"
				}, {__count : "140", results : []})
				// for simplicity the character of the dimension value defines the level and the
				// number the poisition within that level
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
					+ "&$orderby=CompanyCode%20asc&$top=3"
				}, {
					results : [getFarCustomerLineItem("A0"), getFarCustomerLineItem("A1")]
				})
				.expectRequest({ // second level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc&$top=3"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0"),
						getFarCustomerLineItem("A0", "B1"),
						getFarCustomerLineItem("A0", "B2")
					]
				})
				.expectRequest({ // leaf request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
							+ "&$top=5"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0", "C0"),
						getFarCustomerLineItem("A0", "B1", "C0"),
						getFarCustomerLineItem("A0", "B2", "C0"),
						getFarCustomerLineItem("A0", "B3", "C0"),
						getFarCustomerLineItem("A0", "B4", "C0")
					]
				});

			// bind it lately otherwise table resets numberOfExpandedLevels to 0
			oTable.bindRows({
				path : "/Items",
				parameters : {
					numberOfExpandedLevels : 2,
					provideGrandTotals : false,
					useBatchRequests : true
				}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "", "", "1"],
				["A0", "B0", "", "1"],
				["A0", "B0", "C0", "1"],
				["A0", "B1", "", "1"]
			]);

			oBinding = oTable.getBinding("rows");
			assert.strictEqual(oBinding._oWatermark.groupID, "/A0/");
			assert.strictEqual(oBinding._oWatermark.startIndex, 3);

			that.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
					+ "&$filter=((((CompanyCode%20gt%20%27A0%27))))&$orderby=CompanyCode%20asc"
					+ "&$top=3"
				}, {
					results : [getFarCustomerLineItem("A1")]
				})
				.expectRequest({ // second level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency"
						+ "&$filter=((((CompanyCode%20gt%20%27A0%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A0%27)"
								+ "%20and%20(Customer%20gt%20%27B2%27))))"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc&$top=3"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B3"),
						getFarCustomerLineItem("A0", "B4"),
						getFarCustomerLineItem("A0", "B5")
					]
				})
				.expectRequest({ // leaf request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$filter=((((CompanyCode%20gt%20%27A0%27))"
							+ "%20or%20((CompanyCode%20eq%20%27A0%27)"
								+ "%20and%20(Customer%20gt%20%27B2%27))))"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
						+ "&$top=5"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B3", "C0"),
						getFarCustomerLineItem("A0", "B4", "C0"),
						getFarCustomerLineItem("A0", "B5", "C0"),
						getFarCustomerLineItem("A0", "B6", "C0"),
						getFarCustomerLineItem("A0", "B7", "C0")
					]
				});

			// code under test - scroll to end
			oTable.setFirstVisibleRow(oBinding.getLength() - 4);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "B2", "", "1"],
				["A0", "B2", "C0", "1"],
				["A0", "B3", "", "1"],
				["A0", "B3", "C0", "1"]
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: An analytical table is expanded to level 2. The entries in front of the watermark
	// node are displayed properly
	// BCP: 2270125832
	QUnit.test("AnalyticalBinding: nodes in front of the watermark", function (assert) {
		var oBinding, oTable,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS"),
			sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="true" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="true" leadingProperty="AccountingDocument">\
		<Label text="AccountingDocument"/>\
		<t:template><Text wrapping="false" text="{AccountingDocument}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer,AccountingDocument"
						+ "&$top=0&$inlinecount=allpages"
				}, {__count : "140", results : []})
				// for simplicity the character of the dimension value defines the level and the
				// number the poisition within that level
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
					+ "&$orderby=CompanyCode%20asc&$top=5"
				}, {
					results : [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3")
					]
				})
				.expectRequest({ // second level request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc&$top=6"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0"),
						getFarCustomerLineItem("A1", "B0"),
						getFarCustomerLineItem("A2", "B0"),
						getFarCustomerLineItem("A3", "B0"),
						getFarCustomerLineItem("A3", "B1"),
						getFarCustomerLineItem("A3", "B2")
					]
				})
				.expectRequest({ // leaf request
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,"
							+ "AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc,Customer%20asc,AccountingDocument%20asc"
							+ "&$top=11"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0", "C0"),
						getFarCustomerLineItem("A1", "B0", "C0"),
						getFarCustomerLineItem("A2", "B0", "C0"),
						getFarCustomerLineItem("A3", "B0", "C0"),
						getFarCustomerLineItem("A3", "B0", "C1"),
						getFarCustomerLineItem("A3", "B0", "C2"),
						getFarCustomerLineItem("A3", "B0", "C3"),
						getFarCustomerLineItem("A3", "B0", "C4"),
						getFarCustomerLineItem("A3", "B0", "C5"),
						getFarCustomerLineItem("A3", "B0", "C6"),
						getFarCustomerLineItem("A3", "B0", "C7")
					]
				});

			// bind it lately otherwise table resets numberOfExpandedLevels to 0
			oTable.bindRows({
				path : "/Items",
				parameters : {
					numberOfExpandedLevels : 2,
					provideGrandTotals : false,
					useBatchRequests : true
				}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "", "", "1"],
				["A0", "B0", "", "1"],
				["A0", "B0", "C0", "1"],
				["A1", "", "", "1"]
			]);

			oBinding = oTable.getBinding("rows");
			assert.strictEqual(oBinding._oWatermark.groupID, "/A3/B0/");
			assert.strictEqual(oBinding._oWatermark.startIndex, 8);

			// code under test - scroll to end
			oTable.setFirstVisibleRow(3);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A1", "", "", "1"],
				["A1", "B0", "", "1"],
				["A1", "B0", "C0", "1"],
				["A2", "", "", "1"]
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: An analytical table is expanded to level 1. When ungrouping all groups there are
	// no errors and no unnecessary requests.
	// BCP: 2380008491
	QUnit.test("AnalyticalBinding: ungroup all", function (assert) {
		var oBinding, oTable,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS"),
			sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="AccountingDocument">\
		<Label text="AccountingDocument"/>\
		<t:template><Text wrapping="false" text="{AccountingDocument}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
			that = this;

		// invalidating the UI via refresh and calling setGrouped immediately after cause
		// "Couldn't rerender..." warnings that can be ignored here
		this.mock(Rendering.getLogger()).expects("warning")
			.withExactArgs(sinon.match.string)
			.atLeast(0);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer,AccountingDocument"
						+ "&$top=0&$inlinecount=allpages"
				}, {__count : "140", results : []})
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=7"
				}, {
					results : [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3"),
						getFarCustomerLineItem("A4"),
						getFarCustomerLineItem("A5"),
						getFarCustomerLineItem("A6")
					]
				})
				.expectRequest({ // children of first level
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=12"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0", "C0"),
						getFarCustomerLineItem("A0", "B0", "C1"),
						getFarCustomerLineItem("A0", "B1", "C0"),
						getFarCustomerLineItem("A0", "B1", "C1"),
						getFarCustomerLineItem("A1", "B0", "C0"),
						getFarCustomerLineItem("A2", "B0", "C0"),
						getFarCustomerLineItem("A3", "B0", "C0"),
						getFarCustomerLineItem("A4", "B0", "C0"),
						getFarCustomerLineItem("A5", "B0", "C0"),
						getFarCustomerLineItem("A6", "B0", "C0"),
						getFarCustomerLineItem("A7", "B0", "C0"),
						getFarCustomerLineItem("A8", "B0", "C2")
					]
				});

			// bind it lately otherwise table resets numberOfExpandedLevels to 0
			oTable.bindRows({
				path : "/Items",
				parameters : {
					numberOfExpandedLevels : 1,
					provideGrandTotals : false,
					useBatchRequests : true
				}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "", "", "1"],
				["A0", "B0", "C0", "1"],
				["A0", "B0", "C1", "1"],
				["A0", "B1", "C0", "1"]
			]);

			that.expectRequest({ // no grouping -> flat list request
				encodeRequestUri : false,
				requestUri : "Items?"
					+ "$select=CompanyCode,Customer,AccountingDocument,AmountInCompanyCodeCurrency,Currency"
					+ "&$top=14&$inlinecount=allpages"
			}, {
				results : [
					getFarCustomerLineItem("A0", "B0", "C0"),
					getFarCustomerLineItem("A0", "B0", "C1"),
					getFarCustomerLineItem("A0", "B1", "C0"),
					getFarCustomerLineItem("A0", "B1", "C1"),
					getFarCustomerLineItem("A1", "B0", "C0"),
					getFarCustomerLineItem("A2", "B0", "C0"),
					getFarCustomerLineItem("A3", "B0", "C0"),
					getFarCustomerLineItem("A4", "B0", "C0"),
					getFarCustomerLineItem("A5", "B0", "C0"),
					getFarCustomerLineItem("A6", "B0", "C0"),
					getFarCustomerLineItem("A7", "B0", "C0"),
					getFarCustomerLineItem("A8", "B0", "C2"),
					getFarCustomerLineItem("A9", "B0", "C2"),
					getFarCustomerLineItem("A10", "B0", "C2")
				]
			});

			oBinding = oTable.getBinding("rows");
			// simulate the issue in the ticket:
			// - first a refresh is triggered which adds an expand request to the queue,
			// - then the grouped property of the column is set to false which causes another refresh
			// - and after that the number of expanded levels is set to 0 which causes another
			//   refresh and which makes the expand request obsolete
			// code under test
			oBinding.refresh();
			oTable.getColumns()[0].setGrouped(false);
			oBinding.setNumberOfExpandedLevels(0);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "B0", "C0", "1"],
				["A0", "B0", "C1", "1"],
				["A0", "B1", "C0", "1"],
				["A0", "B1", "C1", "1"]
			]);

			that.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer,AccountingDocument"
						+ "&$top=0&$inlinecount=allpages"
				}, {__count : "140", results : []})
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=7"
				}, {
					results : [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3"),
						getFarCustomerLineItem("A4"),
						getFarCustomerLineItem("A5"),
						getFarCustomerLineItem("A6")
					]
				})
				.expectRequest({ // children of first level
					encodeRequestUri : false,
					requestUri : "Items?"
						+ "$select=CompanyCode,Customer,AccountingDocument,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=12"
				}, {
					results : [
						getFarCustomerLineItem("A0", "B0", "C0"),
						getFarCustomerLineItem("A0", "B0", "C1"),
						getFarCustomerLineItem("A0", "B1", "C0"),
						getFarCustomerLineItem("A0", "B1", "C1"),
						getFarCustomerLineItem("A1", "B0", "C0"),
						getFarCustomerLineItem("A2", "B0", "C0"),
						getFarCustomerLineItem("A3", "B0", "C0"),
						getFarCustomerLineItem("A4", "B0", "C0"),
						getFarCustomerLineItem("A5", "B0", "C0"),
						getFarCustomerLineItem("A6", "B0", "C0"),
						getFarCustomerLineItem("A7", "B0", "C0"),
						getFarCustomerLineItem("A8", "B0", "C2")
					]
				});

			// revert the steps above
			// code under test
			oBinding.refresh();
			// code under test
			oTable.getColumns()[0].setGrouped(true);
			// code under test
			oBinding.setNumberOfExpandedLevels(1);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "", "", "1"],
				["A0", "B0", "C0", "1"],
				["A0", "B0", "C1", "1"],
				["A0", "B1", "C0", "1"]
			]);
		});
	});

	//*****************************************************************************************************************
	// Scenario: When sorting in an analytic table, and the "autoExpandMode" is set to "Sequential", the column is
	// sorted in the desired order.
	// BCP: 2380000530
	QUnit.test("AnalyticalBinding: sort for grouped columns when autoExpandMode = 'Sequential'",
			function (assert) {
		var oTable,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS"),
			sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
		that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer&$top=0&$inlinecount=allpages"
				}, {__count : "20", results : []})
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency&"
					+ "$orderby=CompanyCode%20desc&$top=14&$inlinecount=allpages"
				}, {
					results : [
						getFarCustomerLineItem("A3"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A0")
					]
				})
				.expectRequest({ // grand total request
					encodeRequestUri : false,
					requestUri : "Items?$select=AmountInCompanyCodeCurrency,Currency&$top=100&$inlinecount=allpages"
				}, {
					__count : 1,
					results : [{
						__metadata : {uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(grandTotal)"},
						AmountInCompanyCodeCurrency : "140",
						Currency : "USD"
					}]
				});

			// bind it lately otherwise table resets numberOfExpandedLevels to 0
			oTable.bindRows({
				path : "/Items",
				parameters : {
					autoExpandMode : "Sequential",
					numberOfExpandedLevels : 0,
					provideGrandTotals : false,
					useBatchRequests : true
				},
				sorter : [new Sorter("CompanyCode", true)]
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A3", "", "1"],
				["A2", "", "1"],
				["A1", "", "1"],
				["A0", "", "1"]
			]);
		});
	});

	//*****************************************************************************************************************
	// Scenario: Sequential mode: Sorting by text properties that are only additionally selected is possible.
	// JIRA:CPOUI5MODELS-1311
	QUnit.test("AnalyticalBinding: sort additional selected text properties (Sequential)", function (assert) {
		const oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS");
		const sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>';

		return this.createView(assert, sView, oModel).then(() => {
			this.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer&$top=0&$inlinecount=allpages"
				}, {__count : "20", results : []})
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,CompanyName,AmountInCompanyCodeCurrency,Currency&"
					+ "$orderby=CompanyName%20desc,CompanyCode%20asc&$top=14&$inlinecount=allpages"
				}, {
					results : [
						Object.assign(getFarCustomerLineItem("A0"), {CompanyName: "A0Name"}),
						Object.assign(getFarCustomerLineItem("A1"), {CompanyName: "A1Name"}),
						Object.assign(getFarCustomerLineItem("A2"), {CompanyName: "A2Name"}),
						Object.assign(getFarCustomerLineItem("A3"), {CompanyName: "A2Name"})
					]
				})
				.expectRequest({ // grand total request
					encodeRequestUri : false,
					requestUri : "Items?$select=AmountInCompanyCodeCurrency,Currency&$top=100&$inlinecount=allpages"
				}, {
					__count : 1,
					results : [{
						__metadata : {uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(grandTotal)"},
						AmountInCompanyCodeCurrency : "140",
						Currency : "USD"
					}]
				});

			// bind it lately, otherwise the binding is constructed without the analytical info and the select parameter
			// is ignored
			this.oView.byId("table").bindRows({
				path : "/Items",
				parameters : {
					autoExpandMode : "Sequential",
					numberOfExpandedLevels : 0,
					provideGrandTotals : false,
					select : "CompanyCode,AmountInCompanyCodeCurrency,Currency,Customer,CompanyName",
					useBatchRequests : true
				},
				sorter : [new Sorter("CompanyName", true)]
			});

			return this.waitForChanges(assert);
		});
	});

	//*****************************************************************************************************************
	// Scenario: Bundled mode: Sorting by text properties that are only additionally selected is possible.
	// JIRA:CPOUI5MODELS-1311
	QUnit.test("AnalyticalBinding: sort additional selected text properties (Bundled)", function (assert) {
		const oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS");
		const sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text wrapping="false" text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>';

		return this.createView(assert, sView, oModel).then(() => {
			this.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer&$top=0&$inlinecount=allpages"
				}, {__count : "20", results : []})
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,CompanyName,AmountInCompanyCodeCurrency,Currency&"
					+ "$orderby=CompanyName%20desc,CompanyCode%20asc&$top=7"
				}, {
					results : [
						Object.assign(getFarCustomerLineItem("A0"), {CompanyName: "A0Name"}),
						Object.assign(getFarCustomerLineItem("A1"), {CompanyName: "A1Name"}),
						Object.assign(getFarCustomerLineItem("A2"), {CompanyName: "A2Name"}),
						Object.assign(getFarCustomerLineItem("A3"), {CompanyName: "A2Name"})
					]
				})
				.expectRequest({ // leaf level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,CompanyName,Customer,AmountInCompanyCodeCurrency,Currency&"
					+ "$orderby=CompanyName%20desc,CompanyCode%20asc&$top=12"
				}, {
					results : [
						Object.assign(getFarCustomerLineItem("A0"), {CompanyName: "A0Name"}),
						Object.assign(getFarCustomerLineItem("A1"), {CompanyName: "A1Name"}),
						Object.assign(getFarCustomerLineItem("A2"), {CompanyName: "A2Name"}),
						Object.assign(getFarCustomerLineItem("A3"), {CompanyName: "A2Name"})
					]
				});

			this.oLogMock.expects("warning")
				.withExactArgs("Applying sorters to groups is only possible with auto expand mode 'Sequential';"
					+ " current mode is: Bundled",
					"/Items", "sap.ui.model.analytics.AnalyticalBinding", undefined)
				.atLeast(1);

			// bind it lately, otherwise the binding is constructed without the analytical info and the select parameter
			// is ignored
			this.oView.byId("table").bindRows({
				path : "/Items",
				parameters : {
					numberOfExpandedLevels : 1,
					provideGrandTotals : false,
					select : "CompanyCode,AmountInCompanyCodeCurrency,Currency,Customer,CompanyName",
					useBatchRequests : true
				},
				sorter : [new Sorter("CompanyName", true)]
			});

			return this.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Sequential mode: Order by properties that are additionally selected and that are
	// neither a dimension, nor a measure, nor an associated property of a dimension or a measure.
	// JIRA: CPOUI5MODELS-1384
	QUnit.test("AnalyticalBinding: order by additional properties (Sequential)", function (assert) {
		let oTable;
		const oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS");
		const sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn leadingProperty="OrdinaryProperty">\
		<Label text="OrdinaryProperty"/>\
		<t:template><Text text="{OrdinaryProperty}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>';

		return this.createView(assert, sView, oModel).then(() => {
			this.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri: false,
					requestUri: "Items?$select=CompanyCode,Customer&$top=0&$inlinecount=allpages"
				}, {__count: "20", results: []})
				.expectRequest({ // first level request
					encodeRequestUri: false,
					requestUri: "Items?$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=14&$inlinecount=allpages"
				}, {
					results : [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3")
					]
				})
				.expectRequest({ // grand total request
					encodeRequestUri: false,
					requestUri: "Items?$select=AmountInCompanyCodeCurrency,Currency&$top=100&$inlinecount=allpages"
				}, {
					__count: "1",
					results: [{
						__metadata: {uri: "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(grandTotal)"},
						AmountInCompanyCodeCurrency: "140",
						Currency: "USD"
					}]
				});

			oTable = this.oView.byId("table");
			// bind it lately, otherwise the binding is constructed without the analytical info and the select
			// parameter is ignored
			oTable.bindRows({
				path: "/Items",
				parameters: {
					autoExpandMode: "Sequential",
					numberOfExpandedLevels: 0,
					provideGrandTotals: false,
					select: "CompanyCode,AmountInCompanyCodeCurrency,Currency,Customer,OrdinaryProperty",
					useBatchRequests: true
				},
				sorter: [new Sorter("OrdinaryProperty", true)]
			});

			return this.waitForChanges(assert, "bind table").then(() => {
				assert.deepEqual(getTableContent(oTable), [
					["A0", "", "1", ""],
					["A1", "", "1", ""],
					["A2", "", "1", ""],
					["A3", "", "1", ""]
				]);

				this.expectRequest({ // leaf level request
						encodeRequestUri: false,
						requestUri: "Items?"
							+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency,OrdinaryProperty"
							+ "&$filter=(CompanyCode%20eq%20%27A0%27)"
							+ "&$orderby=CompanyCode%20asc,OrdinaryProperty%20desc&$top=14&$inlinecount=allpages"
					}, {
						results: [
							Object.assign(getFarCustomerLineItem("A0", "C0"), {OrdinaryProperty: "P1"}),
							Object.assign(getFarCustomerLineItem("A0", "C1"), {OrdinaryProperty: "P0"})
						]
					});

				// code under test - expand leaf level -> sort by OrdinaryProperty
				oTable.expand(0);

				return this.waitForChanges(assert, "expand node 'A0'");
			}).then(() => {
				assert.deepEqual(getTableContent(oTable), [
					["A0", "", "1", ""],
					["A0", "C0", "1", "P1"],
					["A0", "C1", "1", "P0"],
					["A1", "", "1", ""]
				]);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Bundled mode: Order by properties that are additionally selected and that are
	// neither a dimension, nor a measure, nor an associated property of a dimension or a measure.
	// JIRA: CPOUI5MODELS-1384
	QUnit.test("AnalyticalBinding: order by additional properties (Bundled)", function (assert) {
		let oTable;
		const oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS");
		const sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn leadingProperty="OrdinaryProperty">\
		<Label text="OrdinaryProperty"/>\
		<t:template><Text text="{OrdinaryProperty}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>';

		return this.createView(assert, sView, oModel).then(() => {
			this.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri: false,
					requestUri: "Items?$select=CompanyCode,Customer&$top=0&$inlinecount=allpages"
				}, {__count: "20", results: []})
				.expectRequest({ // first level request
					encodeRequestUri: false,
					requestUri: "Items?$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=7"
				}, {
					results: [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3")
					]
				})
				.expectRequest({ // leaf level request
					encodeRequestUri: false,
					requestUri: "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency,OrdinaryProperty"
						+ "&$orderby=CompanyCode%20asc,OrdinaryProperty%20desc&$top=12"
				}, {
					results : [
						Object.assign(getFarCustomerLineItem("A0", "C0"), {OrdinaryProperty: "P0"}),
						Object.assign(getFarCustomerLineItem("A0", "C1"), {OrdinaryProperty: "P1"}),
						Object.assign(getFarCustomerLineItem("A0", "C2"), {OrdinaryProperty: "P2"}),
						Object.assign(getFarCustomerLineItem("A1", "C0"), {OrdinaryProperty: "P3"})
					]
				});

			this.oLogMock.expects("warning")
				.withExactArgs("Applying sorters to groups is only possible with auto expand mode 'Sequential';"
					+ " current mode is: Bundled",
					"/Items", "sap.ui.model.analytics.AnalyticalBinding", undefined)
				.atLeast(1);

			oTable = this.oView.byId("table");
			// bind it lately, otherwise the binding is constructed without the analytical info and the select parameter
			// is ignored
			oTable.bindRows({
				path: "/Items",
				parameters: {
					numberOfExpandedLevels: 1,
					provideGrandTotals: false,
					select: "CompanyCode,AmountInCompanyCodeCurrency,Currency,Customer,OrdinaryProperty",
					useBatchRequests: true
				},
				sorter: [new Sorter("OrdinaryProperty", true)]
			});

			return this.waitForChanges(assert, "bind table");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [
				["A0", "", "1", ""],
				["A0", "C0", "1", "P0"],
				["A0", "C1", "1", "P1"],
				["A0", "C2", "1", "P2"]
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Bundled mode: Order by properties that are additionally selected and that are
	// neither a dimension, nor a measure, nor an associated property of a dimension or a measure.
	// Data is not grouped.
	// JIRA: CPOUI5MODELS-1384
	QUnit.test("AnalyticalBinding: order by additional properties (ungrouped, Bundled)", function (assert) {
		let oTable;
		const oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS");
		const sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="false" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn leadingProperty="OrdinaryProperty">\
		<Label text="OrdinaryProperty"/>\
		<t:template><Text text="{OrdinaryProperty}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>';

		return this.createView(assert, sView, oModel).then(() => {
			this.expectHeadRequest()
				.expectRequest({ // leaf level request
					encodeRequestUri: false,
					requestUri: "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency,OrdinaryProperty"
						+ "&$orderby=OrdinaryProperty%20desc&$top=14&$inlinecount=allpages"
				}, {
					results: [
						Object.assign(getFarCustomerLineItem("A1", "C0"), {OrdinaryProperty: "P3"}),
						Object.assign(getFarCustomerLineItem("A0", "C2"), {OrdinaryProperty: "P2"}),
						Object.assign(getFarCustomerLineItem("A0", "C1"), {OrdinaryProperty: "P1"}),
						Object.assign(getFarCustomerLineItem("A0", "C0"), {OrdinaryProperty: "P0"})
					]
				});

			this.oLogMock.expects("warning")
				.withExactArgs("Applying sorters to groups is only possible with auto expand mode 'Sequential';"
					+ " current mode is: Bundled",
					"/Items", "sap.ui.model.analytics.AnalyticalBinding", undefined)
				.atLeast(1);

			oTable = this.oView.byId("table");
			// bind it lately, otherwise the binding is constructed without the analytical info and the select parameter
			// is ignored
			oTable.bindRows({
				path: "/Items",
				parameters: {
					numberOfExpandedLevels: 1,
					provideGrandTotals: false,
					select: "CompanyCode,AmountInCompanyCodeCurrency,Currency,Customer,OrdinaryProperty",
					useBatchRequests: true
				},
				sorter: [new Sorter("OrdinaryProperty", true)]
			});

			return this.waitForChanges(assert, "bind table");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [
				["A1", "C0", "1", "P3"],
				["A0", "C2", "1", "P2"],
				["A0", "C1", "1", "P1"],
				["A0", "C0", "1", "P0"]
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: AnalyticalBinding filtering by Edm.DateTime property with precision > 3
	// JIRA: CPOUI5MODELS-1582
	QUnit.test("AnalyticalBinding: Filtering Edm.DateTime property with precision > 3", function (assert) {
		const oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS");
		const sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="true" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn grouped="false" leadingProperty="Customer">\
		<Label text="Customer"/>\
		<t:template><Text text="{Customer}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>';

		return this.createView(assert, sView, oModel).then(() => {
			const sExpectedFilter = "&$filter=((ChangedAt%20ge%20datetime%272020-02-01T15%3a30%3a02.456123%27%20"
				+ "and%20ChangedAt%20le%20datetime%272020-02-01T18%3a45%3a02.456789%27))";
			this.expectHeadRequest()
				.expectRequest({ // count request
					encodeRequestUri : false,
					requestUri : "Items?$select=CompanyCode,Customer" + sExpectedFilter
						+ "&$top=0&$inlinecount=allpages"
				}, {__count : "1", results : []})
				.expectRequest({ // first level request
					encodeRequestUri : false,
					requestUri : "Items?"
					+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency" + sExpectedFilter
					+ "&$orderby=CompanyCode%20asc&$top=14&$inlinecount=allpages"
				}, {
					results : [getFarCustomerLineItem("A0")]
				})
				.expectRequest({ // grand total request
					encodeRequestUri : false,
					requestUri : "Items?$select=AmountInCompanyCodeCurrency,Currency" + sExpectedFilter
						+ "&$top=100&$inlinecount=allpages"
				}, {
					__count : 1,
					results : [{
						__metadata : {uri : "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(grandTotal)"},
						AmountInCompanyCodeCurrency : "140",
						Currency : "USD"
					}]
				});
			const oFilter = new Filter("ChangedAt", FilterOperator.BT, new Date(Date.UTC(2020, 1, 1, 15, 30, 2, 456)),
				new Date(Date.UTC(2020, 1, 1, 18, 45, 2, 456)));
			oFilter.appendFractionalSeconds1("123");
			oFilter.appendFractionalSeconds2("789");

			// code under test
			this.oView.byId("table").bindRows({
				path : "/Items",
				parameters : {
					autoExpandMode : "Sequential",
					numberOfExpandedLevels : 0,
					useBatchRequests : true
				},
				filters : [oFilter]
			});

			return this.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If a request for an AnalyticalBinding is cancelled because the analytical info has
	// been updated before the request was processed, a "dataReceived" event has to be fired. Table
	// counts the "dataRequested" and "dataReceived" event to show a busy indicator, so the number
	// of "dataRequested" and "dataReceived" events has to be equal.
	// BCP: 2380036006
	QUnit.test("AnalyticalBinding: dataReceived is fired even if request is cancelled", function (assert) {
		var oBinding, oTable,
			iDataRequested = 0,
			iDataReceived = 0,
			iDataReceivedError = 0,
			oModel = createModel("/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS"),
			sView = '\
<t:AnalyticalTable id="table" threshold="10" visibleRowCount="4">\
	<t:AnalyticalColumn grouped="false" leadingProperty="CompanyCode">\
		<Label text="CompanyCode"/>\
		<t:template><Text wrapping="false" text="{CompanyCode}"/></t:template>\
	</t:AnalyticalColumn>\
	<t:AnalyticalColumn summed="true" leadingProperty="AmountInCompanyCodeCurrency">\
		<Label text="AmountInCompanyCodeCurrency"/>\
		<t:template><Text wrapping="false" text="{AmountInCompanyCodeCurrency}"/></t:template>\
	</t:AnalyticalColumn>\
</t:AnalyticalTable>',
			that = this;

		function dataReceived(oEvent) {
			iDataReceived += 1;
			if (!oEvent.getParameter("data")) {
				iDataReceivedError += 1;
			}
		}

		function dataRequested() {
			iDataRequested += 1;
		}

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectHeadRequest()
				.expectRequest({ // first level request
					encodeRequestUri: false,
					requestUri: "Items?"
						+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20desc&$top=14&$inlinecount=allpages"
				}, {
					results: [
						getFarCustomerLineItem("A3"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A0")
					]
				})
				.expectRequest({ // grand total request
					encodeRequestUri: false,
					requestUri: "Items?$select=AmountInCompanyCodeCurrency,Currency"
						+ "&$top=100&$inlinecount=allpages"
				}, {
					__count: 1,
					results: [{
						__metadata: {
							uri: "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(grandTotal)"
						},
						AmountInCompanyCodeCurrency: "140",
						Currency: "USD"
					}]
				});

			// bind it lately otherwise table resets numberOfExpandedLevels to 0
			oTable.bindRows({
				events: {
					dataRequested: dataRequested,
					dataReceived: dataReceived
				},
				path: "/Items",
				parameters: {
					autoExpandMode: "Sequential",
					numberOfExpandedLevels: 0,
					provideGrandTotals: false,
					useBatchRequests: true
				},
				sorter: [new Sorter("CompanyCode", true)]
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [
				["A3", "1"],
				["A2", "1"],
				["A1", "1"],
				["A0", "1"]
			]);
			assert.strictEqual(iDataRequested, 1);
			assert.strictEqual(iDataReceived, 1);
			assert.strictEqual(iDataReceivedError, 0);

			that.expectRequest({ // first level request
					encodeRequestUri: false,
					requestUri: "Items?"
						+ "$select=CompanyCode,Customer,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20desc&$top=14&$inlinecount=allpages"
				}, new Promise(function () {})) // pending request that gets aborted
				.expectRequest({ // grand total request
					encodeRequestUri: false,
					requestUri: "Items?$select=AmountInCompanyCodeCurrency,Currency"
						+ "&$top=100&$inlinecount=allpages"
				}, new Promise(function () {}));  // pending request that gets aborted

			oBinding = oTable.getBinding("rows");

			oBinding.updateAnalyticalInfo([
				{name: "CompanyCode", grouped: false, visible: true},
				{name: "Customer", grouped: false, visible: true},
				{name: "AmountInCompanyCodeCurrency", visible: true}
			]);
			oBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(iDataRequested, 2);
			assert.strictEqual(iDataReceived, 1);
			assert.strictEqual(iDataReceivedError, 0);

			that.expectRequest({ // first level request
					encodeRequestUri: false,
					requestUri: "Items?"
						+ "$select=CompanyCode,AmountInCompanyCodeCurrency,Currency"
						+ "&$orderby=CompanyCode%20asc&$top=14&$inlinecount=allpages"
				}, {
					results : [
						getFarCustomerLineItem("A0"),
						getFarCustomerLineItem("A1"),
						getFarCustomerLineItem("A2"),
						getFarCustomerLineItem("A3")
					]
				})
				.expectRequest({ // grand total request
					encodeRequestUri: false,
					requestUri: "Items?$select=AmountInCompanyCodeCurrency,Currency"
						+ "&$top=100&$inlinecount=allpages"
				}, {
					__count: 1,
					results: [{
						__metadata: {
							uri: "/sap/opu/odata/sap/FAR_CUSTOMER_LINE_ITEMS/Items(grandTotal)"
						},
						AmountInCompanyCodeCurrency: "140",
						Currency: "USD"
					}]
				});

			// code under test - new analytical info; sort aborts pending requests
			oBinding.updateAnalyticalInfo([
				{name: "CompanyCode", grouped: false, visible: true},
				{name: "AmountInCompanyCodeCurrency", visible: true}
			]);
			oBinding.sort(new Sorter("CompanyCode", false));

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(iDataRequested, 3);
			assert.strictEqual(iDataReceived, 3);
			assert.strictEqual(iDataReceivedError, 1);
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
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<FlexBox binding="{ToBusinessPartner}">\
		<Text id="id" text="{BusinessPartnerID}" />\
	</FlexBox>\
</FlexBox>';

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader(oBusinessPartnerError)})
			.expectRequest({
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
	"BusinessPartner_Alternatives",
	"BusinessPartner_Alternatives_ReturnType"
].forEach(function (sFunctionName) {
	var sTitle = "Messages: function import returning a collection for different entities;"
		+ " messages are updated only for returned entities: " + sFunctionName;

	QUnit.test(sTitle, function (assert) {
		var oCompanyNameError1 = this.createResponseMessage("CompanyName"),
			oCompanyNameError2 = this.createResponseMessage("CompanyName"),
			oModel = createSalesOrdersModelSpecialFunctionImports(),
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
			var oCompanyNameError2Update = that.createResponseMessage("('2')/CompanyName"),
				oToProductADescriptionError2
					= that.createResponseMessage("('2')/ToProducts('B')/Description"),
				oProductADescriptionError2 = cloneODataMessage(oToProductADescriptionError2,
					"('B')/Description");

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : sFunctionName + "?BusinessPartnerID='1'"
				}, {
					results : [{
						__metadata : {uri : "BusinessPartnerSet('2')"},
						BusinessPartnerID : "2",
						CompanyName : "companyName2New"
					}]
				}, {
					"sap-message" : getMessageHeader([
						oCompanyNameError2Update,
						oToProductADescriptionError2
					])
				})
				.expectValue("companyName2", "companyName2New")
				.expectMessage(oCompanyNameError2Update, "/BusinessPartnerSet", undefined, true)
				.expectMessage(oProductADescriptionError2, "/ProductSet",
					"/BusinessPartnerSet('2')/ToProducts")
				.expectMessage(oCompanyNameError1, "/BusinessPartnerSet('1')/")
				.expectMessage(oProductADescriptionError1, "/ProductSet",
					"/BusinessPartnerSet('1')/ToProducts");

			return Promise.all([
				oModel.callFunction("/" + sFunctionName, {
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
		var oModel = createSalesOrdersModelSpecialFunctionImports(),
			oQuantityError = this.createResponseMessage(
				"(SalesOrderID='1',ItemPosition='20')/Quantity"),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Table items="{ToLineItems}">\
		<Text id="quantity" text="{Quantity}" />\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')"
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					ItemPosition : "10",
					Quantity : "2",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					ItemPosition : "20",
					Quantity : "0",
					SalesOrderID : "1"
				}]
			}, {
				"sap-message" : getMessageHeader(oQuantityError)
			})
			.expectValue("quantity", ["2", "0"])
			.expectMessage(oQuantityError, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems");

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			var oQuantitySuccess = that.createResponseMessage(
					"(SalesOrderID='1',ItemPosition='20')/Quantity", undefined, "success");

			that.expectRequest({
					encodeRequestUri : false,
					headers : {"sap-message-scope" : "BusinessObject"},
					method : "POST",
					requestUri : "SalesOrder_FixQuantities?SalesOrderID='1'"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
						},
						ItemPosition : "20",
						Quantity : "2",
						SalesOrderID : "1"
					}]
				}, {
					"sap-message" : getMessageHeader(oQuantitySuccess)
				})
				.expectValue("quantity", "2", 1)
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
		var oModel = createSalesOrdersModel({
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
					encodeRequestUri : false,
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
					method : "POST",
					requestUri : "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'"
				}, oResponse, {
					location :
						"/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
				})
				.expectRequest({
					batchNo : 1,
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
			oModel = createSalesOrdersModel(),
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
		var oModel = createSalesOrdersModel({
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
					message : "HTTP request failed",
					responseText : oErrorPOST.body,
					statusCode : 400,
					statusText : "FAILED"
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
					encodeRequestUri : false,
					headers : {"Content-ID" : "~key~", "sap-messages" : "transientOnly"},
					method : "POST",
					requestUri : "SalesOrderItem_Clone?ItemPosition='10'&SalesOrderID='1'"
				}, oErrorPOST)
				.expectRequest({
					batchNo : 1,
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
			visibleRowCount="1">\
		<Text id="orgID" text="{ForceElementOrgID}" />\
	</t:TreeTable>\
</FlexBox>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : sObjectUri
			}, {
				DfsAllwncReqUUID : "fa163e35-93d9-1eda-b19c-c26490674ab4",
				DfsAllwncReqID : "Request ID"
			})
			.expectRequest({
				// TreeTable becomes async so that its GET is not in the same $batch as the 1st GET
				batchNo : 2,
				requestUri : sObjectUri + "/to_AllwncReqToFe"
					+ "?$skip=0&$top=101&$inlinecount=allpages&$filter=HierarchyLevel le 0"
			}, {
				__count : "1",
				results : [{
					ForceElementOrgID : "4711"
					// HierarchyNode : "32,FA163E2C58541EDA8E9C92E909255DAF",
					// HierarchyParentNode : "",
					// HierarchyLevel : 0,
					// HierarchyDescendantCount : 0,
					// DrillDownState : "collapsed"
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
	// Scenario 2: An update *outside* the tree leads to a change; in the customer scenario this is
	// a low-level change through v2.ODataModel#update. The check for changes in
	// ODataTreeBindingFlat#_hasChangedEntity when refreshing the model must consider that nodes
	// may not yet be read from the server.
	// BCP: 002075129400001959552023
	QUnit.test("ODataTreeBindingFlat: refreshAfterChange leads to GET", function (assert) {
		var oModel = createSpecialCasesModel({refreshAfterChange : true}),
			sView = '\
<Input id="person" value="{Person}" binding="{/I_UserContactCard(\'foo\')}"/>\
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
		threshold="0"\
		visibleRowCount="1">\
	<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
</t:TreeTable>';
		let oTable;

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "I_UserContactCard('foo')"
			}, {
				__metadata : {uri : "I_UserContactCard('foo')"},
				Person : "Alice"
			})
			.expectRequest({
				batchNo : 2,
				requestUri : "C_RSHMaintSchedSmltdOrdAndOp?$skip=0&$top=1&$inlinecount=allpages"
					+ "&$filter=OrderOperationRowLevel le 0"
			}, {
				__count : "2",
				results : [{
					__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('1')"},
					MaintenanceOrder : "Foo"
				}]
			})
			.expectValue("person", "Alice");

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["Foo"]]);

			this.expectRequest({
					batchNo : 3,
					data : {
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('1')"},
						MaintenanceOrder : "Bar"
					},
					key : "C_RSHMaintSchedSmltdOrdAndOp('1')",
					method : "MERGE",
					requestUri : "C_RSHMaintSchedSmltdOrdAndOp('1')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 3,
					requestUri : "C_RSHMaintSchedSmltdOrdAndOp?$skip=0&$top=1"
						+ "&$inlinecount=allpages&$filter=OrderOperationRowLevel le 0"
				}, {
					__count : "2",
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('1')"},
						MaintenanceOrder : "Bar"
					}]
				});

			// code under test
			oModel.setProperty("/C_RSHMaintSchedSmltdOrdAndOp('1')/MaintenanceOrder", "Bar");
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["Bar"]]);

			this.expectRequest({
					batchNo : 4,
					data : {
						Person : "Bob"
					},
					method : "MERGE",
					requestUri : "I_UserContactCard('foo')"
				})
				.expectRequest({
					batchNo : 4,
					requestUri : "I_UserContactCard('foo')"
				}, {
					__metadata : {uri : "I_UserContactCard('foo')"},
					Person : "Bob"
				})
				.expectValue("person", "Bob");

			// code under test: scenario 2
			oModel.update("/I_UserContactCard('foo')", {"Person" : "Bob"});

			return this.waitForChanges(assert);
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
			visibleRowCount="1">\
		<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
	</t:TreeTable>\
</FlexBox>',
		that = this;

		this.expectValue("maintenanceOrder", [""]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectHeadRequest()
				.expectRequest("DummySet('42')", {DummyID : "42"})
				.expectRequest({
					requestUri : "DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp"
						+ "?$skip=0&$top=101&$inlinecount=allpages&"
						+ "$filter=OrderOperationRowLevel le 0"
				}, {
					__count : "1",
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('1')"},
						MaintenanceOrder : "Bar"
					}]
				})
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
			oJSONModel = new JSONModel({CurrencyCode : "USD"}),
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
				.expectValue("Currency0", "invalid currency")
				.expectValueState(oAmount0, "Error", "EnterNumber")
				.expectValueState(oCurrency0, "Error", "EnterTextMaxLength 3");


			TestUtils.withNormalizedMessages(function () {
				// code under test
				oAmount0.setValue("invalid amount");
				oCurrency0.setValue("invalid currency");
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectMessages([])
				.expectValue("Amount0", "10.00")
				.expectValue("Currency0", "USD")
				.expectValueState(oAmount0, "None", "")
				.expectValueState(oCurrency0, "None", "");

			// code under test
			oAmount0.setBindingContext(that.oView.byId("Amount1").getBindingContext());
			oCurrency0.setBindingContext(that.oView.byId("Currency1").getBindingContext());

			assert.strictEqual(oAmount0.getBindingContext().getPath(), "/SalesOrderSet('2')");
			assert.strictEqual(oCurrency0.getBindingContext().getPath(), "/SalesOrderSet('2')");

			return that.waitForChanges(assert);
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
			.expectRequest("SalesOrderSet?$skip=0&$top=100", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("LineItems0Note", false);

		return this.createView(assert, sView, {undefined : oModel, model2 : oModel}).then(
				function () {
			that.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=100", {
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
				}])
				.expectValueState("note", "Error", "Some message");

			Messaging.addMessages(new Message({
				message : "Some message",
				processor : oModel,
				target : "/Note",
				type : "Error"
			}));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "")
				.expectValueState("note", "None", "");

			// code under test
			that.oView.byId("note").unbindProperty("value");

			return that.waitForChanges(assert);
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
				}])
				.expectValueState("note", "Error", "Some message");

			Messaging.addMessages(new Message({
				message : "Some message",
				processor : oModel,
				target : "/Note",
				type : "Error"
			}));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "Bar")
				.expectValueState("note", "None", "");

			// code under test
			that.oView.setModel(new JSONModel({Note : "Bar"}));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If the OData service has no customizing for units, the OData Unit type uses the
	// UI5 built-in CLDR information for formatting and parsing.
	// JIRA: CPOUI5MODELS-423
	QUnit.test("OData Unit type without unit customizing falls back to CLDR", function (assert) {
		var oModel = createSpecialCasesModel({defaultBindingMode : "TwoWay"}),
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
	// Scenario: Do not show more decimal places than available for the amount/quantity part
	// Observe different formats if the scale of the amount part type's changes
	// JIRA: CPOUI5MODELS-1600
	QUnit.test("CPOUI5MODELS-1600: UnitType with unit decimals places > measure scale", function (assert) {
		const URLParameter = "CPOUI5MODELS-1600=true"; // unqiue URL for each test needed
		const oModel = createModel(`/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/?${URLParameter}`,
				{defaultBindingMode : "TwoWay", tokenHandling : false});
		const sView = `\
<FlexBox binding="{/ProductSet('P1')}">
	<Input id="weight" value="{
		parts : [{
			constraints : {precision : 13, scale : 3},
			path : 'WeightMeasure',
			type : 'sap.ui.model.odata.type.Decimal'
		}, {
			path : 'WeightUnit',
			type : 'sap.ui.model.odata.type.String'
		}, {
			mode : 'OneTime',
			path : '/##@@requestUnitsOfMeasure',
			targetType : 'any'
		}],
		mode : 'TwoWay',
		type : 'sap.ui.model.odata.type.Unit',
		formatOptions : {preserveDecimals : false}
	}"/>
</FlexBox>`;
		let oBindingPart;
		this.expectRequest(`ProductSet('P1')?${URLParameter}`, {
				ProductID : "P1",
				WeightMeasure : "12.341",
				WeightUnit : "KWH"
			})
			.expectRequest(`SAP__UnitsOfMeasure?${URLParameter}&$skip=0&$top=5000`, {
				results : [{
					DecimalPlaces : 7, // more decimals than WeightMeasure's scale
					ExternalCode : "KWH"
				}]
			})
			.expectValue("weight", "12.341 KWH"); // amount type's scale wins

		return this.createView(assert, sView, oModel).then(() => {
			oBindingPart = this.oView.byId("weight").getBinding("value").getBindings()[0];
			this.expectValue("weight", "12.3410000 KWH");

			// code under test
			oBindingPart.setType(new Decimal(undefined, {precision : 13, scale : "variable"}));

			return this.waitForChanges(assert, "change scale to variable -> unit's decimals wins");
		}).then(() => {
			this.expectValue("weight", "12.34 KWH");

			// code under test
			oBindingPart.setType(new Decimal(undefined, {precision : 13, scale : 2}));

			return this.waitForChanges(assert, "change scale to 2 -> amount type's scale wins");
		}).then(() => {
			this.expectValue("weight", "12.3410000 KWH");

			// code under test
			oBindingPart.setType(new Decimal(undefined, {precision : 13}));

			return this.waitForChanges(assert, "change scale to undefined -> unit's decimals wins");
		});
	});

	//*********************************************************************************************
	// Scenario: Do not show more decimal places than available for the amount/quantity part
	// Show that the Unit amount is formatted properly regarding the decimal places depending on:
	// a) the maxFractionDigits formatOption for the unit type
	// b) the amount part data type's scale and
	// with a fix unit decimal places of 7 for the used unit code
	// JIRA: CPOUI5MODELS-1600
[
	{iMaxFractionDigits: 1, iScale: 3, sExpected: "12.3 KWH"},  // maxFractionDigits wins
	{iMaxFractionDigits: 9, iScale: 3, sExpected: "12.3410000 KWH"}, // unit's decimal places wins
	{iMaxFractionDigits: undefined, iScale: 3, sExpected: "12.341 KWH"}, // scale wins
	{iMaxFractionDigits: undefined, iScale: "'variable'", sExpected: "12.3410000 KWH"}, // unit's decimal places wins
	{iMaxFractionDigits: undefined, iScale: undefined, sExpected: "12.3410000 KWH"} // unit's decimal places wins
].forEach(({iMaxFractionDigits, iScale, sExpected}, i) => {
	QUnit.test(`CPOUI5MODELS-1600: UnitType with unit maxFractionDigits, ${i}`, function (assert) {
		const sURLParameter = "CPOUI5MODELS-1600=true" + i; // unqiue URL for each test needed
		const oModel = createModel(`/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/?${sURLParameter}`,
			{defaultBindingMode : "TwoWay", tokenHandling : false});
		const sScaleConstraint = iScale ? `, scale : ${iScale}` : "";
		const sMaxFractionDigitsOption = iMaxFractionDigits ? `, maxFractionDigits : ${iMaxFractionDigits}` : "";
		const sView = `\
<FlexBox binding="{/ProductSet('P1')}">
	<Input id="weight" value="{
		parts : [{
			constraints : {precision : 13${sScaleConstraint}},
			path : 'WeightMeasure',
			type : 'sap.ui.model.odata.type.Decimal'
		}, {
			path : 'WeightUnit',
			type : 'sap.ui.model.odata.type.String'
		}, {
			mode : 'OneTime',
			path : '/##@@requestUnitsOfMeasure',
			targetType : 'any'
		}],
		mode : 'TwoWay',
		type : 'sap.ui.model.odata.type.Unit',
		formatOptions : {preserveDecimals : false${sMaxFractionDigitsOption}}
	}"/>\
</FlexBox>`;

		this.expectRequest(`ProductSet('P1')?${sURLParameter}`, {
				ProductID : "P1",
				WeightMeasure : "12.341",
				WeightUnit : "KWH"
			})
			.expectRequest(`SAP__UnitsOfMeasure?${sURLParameter}&$skip=0&$top=5000`, {
				results : [{
					DecimalPlaces : 7, // more decimals than WeightMeasure's scale
					ExternalCode : "KWH",
					ISOCode : "KWH",
					Text : "Kilowatt hour",
					UnitCode : "KWH"
				}]
			})
			.expectValue("weight", sExpected);

		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: Do not show more decimal places than available for the amount/quantity part.
	// Observe different formats if the scale of the amount part type changes
	// JIRA: CPOUI5MODELS-1619
	QUnit.test("CPOUI5MODELS-1619: CurrencyType with currency decimals places > measure scale", function (assert) {
		const sURLParameter = "CPOUI5MODELS-1619=true"; // unqiue URL for each test needed
		const oModel = createModel(`/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/?${sURLParameter}`,
			{defaultBindingMode : "TwoWay", tokenHandling : false});
		const sView = `\
<FlexBox binding="{/ProductSet('P1')}">
	<Input id="price" value="{
		parts : [{
			constraints : {precision : 5, scale : 3},
			path : 'Price',
			type : 'sap.ui.model.odata.type.Decimal'
		}, {
			path : 'CurrencyCode',
			type : 'sap.ui.model.odata.type.String'
		}, {
			mode : 'OneTime',
			path : '/##@@requestCurrencyCodes',
			targetType : 'any'
		}],
		mode : 'TwoWay',
		type : 'sap.ui.model.odata.type.Currency',
		formatOptions : {preserveDecimals : false}
	}"/>
</FlexBox>`;
		let oBindingPart;
		this.expectRequest(`ProductSet('P1')?${sURLParameter}`, {
				ProductID : "P1",
				Price : "12.341",
				CurrencyCode : "FOO"
			})
			.expectRequest(`SAP__Currencies?${sURLParameter}&$skip=0&$top=5000`, {
				results : [{
					CurrencyCode : "FOO",
					DecimalPlaces : 7 // more decimals than Price's scale
				}]
			})
			.expectValue("price", "12.341\u00a0FOO");

		return this.createView(assert, sView, oModel).then(() => {
			oBindingPart = this.oView.byId("price").getBinding("value").getBindings()[0];
			this.expectValue("price", "12.3410000\u00a0FOO");

			// code under test
			oBindingPart.setType(new Decimal(undefined, {precision : 13, scale : "variable"}));

			return this.waitForChanges(assert, "change scale to variable -> currency's decimals wins");
		}).then(() => {
			this.expectValue("price", "12.34\u00a0FOO");

			// code under test
			oBindingPart.setType(new Decimal(undefined, {precision : 13, scale : 2}));

			return this.waitForChanges(assert, "change scale to 2 -> amount type's scale wins");
		}).then(() => {
			this.expectValue("price", "12.3410000\u00a0FOO");

			// code under test
			oBindingPart.setType(new Decimal(undefined, {precision : 13}));

			return this.waitForChanges(assert, "change scale to undefined -> currency's decimals wins");
		});
	});

	//*********************************************************************************************
	// Scenario: Do not show more decimal places than available for the amount/quantity part.
	// Show that the currency amount is formatted properly regarding the decimal places depending on:
	// a) the maxFractionDigits formatOption for the unit type
	// b) the amount part data type's scale and
	// with a fix currency decimal places of 7 for the used currency
	// JIRA: CPOUI5MODELS-1600
[
	{iMaxFractionDigits: 1, iScale: 3, sExpected: "12.3\u00a0FOO"},  // maxFractionDigits wins
	{iMaxFractionDigits: 9, iScale: 3, sExpected: "12.3410000\u00a0FOO"}, // currency's decimal places wins
	{iMaxFractionDigits: undefined, iScale: 3, sExpected: "12.341\u00a0FOO"}, // scale wins
	{iMaxFractionDigits: undefined, iScale: "'variable'", sExpected: "12.3410000\u00a0FOO"}, // currency's decimal places wins
	{iMaxFractionDigits: undefined, iScale: undefined, sExpected: "12.3410000\u00a0FOO"} // currency's decimal places wins
].forEach(({iMaxFractionDigits, iScale, sExpected}, i) => {
	QUnit.test(`CPOUI5MODELS-1619: CurrencyType with unit maxFractionDigits: ${i}`, function (assert) {
		const sURLParameter = "CPOUI5MODELS-1619=" + i; // unqiue URL for each test needed
		const oModel = createModel(`/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/?${sURLParameter}`,
			{defaultBindingMode : "TwoWay", tokenHandling : false});
		const sScaleConstraint = iScale ? `, scale : ${iScale}` : "";
		const sMaxFractionDigitsOption = iMaxFractionDigits ? `, maxFractionDigits : ${iMaxFractionDigits}` : "";
		const sView = `\
<FlexBox binding="{/ProductSet('P1')}">
	<Input id="price" value="{
		parts : [{
			constraints : {precision : 13${sScaleConstraint}},
			path : 'Price',
			type : 'sap.ui.model.odata.type.Decimal'
		}, {
			path : 'CurrencyCode',
			type : 'sap.ui.model.odata.type.String'
		}, {
			mode : 'OneTime',
			path : '/##@@requestCurrencyCodes',
			targetType : 'any'
		}],
		mode : 'TwoWay',
		type : 'sap.ui.model.odata.type.Currency',
		formatOptions : {preserveDecimals : false${sMaxFractionDigitsOption}}
	}" />
</FlexBox>`;

		this.expectRequest(`ProductSet('P1')?${sURLParameter}`, {
				ProductID : "P1",
				Price : "12.341",
				CurrencyCode : "FOO"
			})
			.expectRequest(`SAP__Currencies?${sURLParameter}&$skip=0&$top=5000`, {
				results : [{
					CurrencyCode : "FOO",
					DecimalPlaces : 7 // more decimals than Price's scale
				}]
			})
			.expectValue("price", sExpected);

		return this.createView(assert, sView, oModel);
	});
});

	//*********************************************************************************************
	// Scenario: If the OData service has no customizing for currencies, the OData Currency type
	// uses the UI5 built-in CLDR information for formatting and parsing.
	// JIRA: CPOUI5MODELS-423
	QUnit.test("OData Currency type without customizing falls back to CLDR", function (assert) {
		var oModel = createSpecialCasesModel({defaultBindingMode : "TwoWay"}),
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
	// Scenario: ODataTreeBinding#expandNodeToLevel expands all children up to the given level.
	// JIRA: CPOUI5MODELS-1437
	QUnit.test("ODataTreeBindingAdapter: collapseToLevel prevents auto expand of child nodes with"
			+ " higher level and expandNodeToLevel works as expected", function (assert) {
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
		visibleRowCount="2">\
	<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationRowLevel eq 0"
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
				+ "$filter=OrderOperationParentRowID eq 'id-0'&$skip=0&$top=2"
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
				});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["0"], ["0.0"]]);

			// code under test
			oTable.collapseAll();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"]]);

			//TODO expect $top=2 instead of $top=4, check TreeBindingAdapter#_getContextsOrNodes?
			this.expectRequest("C_RSHMaintSchedSmltdOrdAndOp"
				+ "?$filter=OrderOperationRowLevel eq 0&$skip=2&$top=4",
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
				});

			// code under test
			// scroll down shows additional level 0 nodes, but must NOT load or show their children
			oTable.setFirstVisibleRow(2);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["2"], ["3"]]);

			this.expectRequest(
				"C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationRowID eq 'id-2' and OrderOperationRowLevel le 2",
				{
					results : [{
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-2')"},
						MaintenanceOrder : "2",
						OrderOperationIsExpanded : "expanded",
						OrderOperationRowID : "id-2",
						OrderOperationRowLevel : 0
					}, {
						__metadata : {uri : "C_RSHMaintSchedSmltdOrdAndOp('id-2.0')"},
						MaintenanceOrder : "2.0",
						OrderOperationIsExpanded : "leaf",
						OrderOperationParentRowID : "id-2",
						OrderOperationRowID : "id-2.0",
						OrderOperationRowLevel : 1
					}]
				});

			return Promise.all([
				// code under test
				oTable.getBinding("rows").expandNodeToLevel(2, 2),
				this.waitForChanges(assert)
			]);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["2"], ["2.0"]]);
		});
	});

	//*********************************************************************************************
	// Scenario: All read requests of the tree binding except $count requests, consider "transitionMessagesOnly"
	// parameter.
	// JIRA: CPOUI5MODELS-1437
	QUnit.test("ODataTreeBinding: transtionMessagesOnly", function (assert) {
		const oModel = createSpecialCasesModel();
		let oTable;
		const sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters: {\
				countMode : \'Request\',\
				numberOfExpandedLevels: 1,\
				transitionMessagesOnly: true,\
				treeAnnotationProperties: {\
					hierarchyDrillStateFor: \'OrderOperationIsExpanded\',\
					hierarchyLevelFor: \'OrderOperationRowLevel\',\
					hierarchyNodeFor: \'OrderOperationRowID\',\
					hierarchyParentNodeFor: \'OrderOperationParentRowID\'\
				}\
			},\
			path: \'/C_RSHMaintSchedSmltdOrdAndOp\'\
		}"\
		threshold="0"\
		visibleRowCount="2">\
	<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			// triggered by ODataTreeBinding#_getCountForNodeId
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp/$count?$filter=OrderOperationRowLevel eq 0", "273")
			.expectRequest({ // triggered by ODataTreeBinding#_loadSubNodes
					headers: {"sap-messages": "transientOnly"},
					requestUri: "C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationRowLevel eq 0&$skip=0&$top=2"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0')"},
						MaintenanceOrder: "0",
						OrderOperationIsExpanded: "collapsed",
						OrderOperationRowID: "id-0",
						OrderOperationRowLevel: 0
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-1')"},
						MaintenanceOrder: "1",
						OrderOperationIsExpanded: "leaf",
						OrderOperationRowID: "id-1",
						OrderOperationRowLevel: 0
					}]
				})
			// triggered by ODataTreeBinding#_getCountForNodeId
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp/$count?$filter=OrderOperationParentRowID eq 'id-0'", "5")
			.expectRequest({ // triggered by ODataTreeBinding#_loadSubNodes
					headers: {"sap-messages": "transientOnly"},
					requestUri: "C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationParentRowID eq 'id-0'"
						+ "&$skip=0&$top=2"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0')"},
						MaintenanceOrder: "0.0",
						OrderOperationIsExpanded: "leaf",
						OrderOperationParentRowID: "id-0",
						OrderOperationRowID: "id-0.0",
						OrderOperationRowLevel: 1
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.1')"},
						MaintenanceOrder: "0.1",
						OrderOperationIsExpanded: "leaf",
						OrderOperationParentRowID: "id-0",
						OrderOperationRowID: "id-0.1",
						OrderOperationRowLevel: 1
					}]
				});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["0"], ["0.0"]]);

			// code under test
			oTable.collapseAll();

			return this.waitForChanges(assert, "collapse all nodes");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"]]);

			this.expectRequest({ // triggered by ODataTreeBinding#_loadSubNodes
					headers: {"sap-messages": "transientOnly"},
					requestUri: "C_RSHMaintSchedSmltdOrdAndOp?$filter=OrderOperationRowLevel eq 0&$skip=2&$top=4"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-2')"},
						MaintenanceOrder: "2",
						OrderOperationIsExpanded: "collapsed",
						OrderOperationRowID: "id-2",
						OrderOperationRowLevel: 0
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-3')"},
						MaintenanceOrder: "3",
						OrderOperationIsExpanded: "leaf",
						OrderOperationRowID: "id-3",
						OrderOperationRowLevel: 0
					}]
				});

			// code under test
			oTable.setFirstVisibleRow(2);

			return this.waitForChanges(assert, "scroll down");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["2"], ["3"]]);

			this.expectRequest({ // triggered by ODataTreeBinding#_loadSubTree
					headers: {"sap-messages": "transientOnly"},
					requestUri: "C_RSHMaintSchedSmltdOrdAndOp?"
						+ "$filter=OrderOperationRowID eq 'id-2' and OrderOperationRowLevel le 2"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-2')"},
						MaintenanceOrder: "2",
						OrderOperationIsExpanded: "expanded",
						OrderOperationRowID: "id-2",
						OrderOperationRowLevel: 0
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-2.0')"},
						MaintenanceOrder: "2.0",
						OrderOperationIsExpanded: "leaf",
						OrderOperationParentRowID: "id-2",
						OrderOperationRowID: "id-2.0",
						OrderOperationRowLevel: 1
					}]
				});

			return Promise.all([
				// code under test
				oTable.getBinding("rows").expandNodeToLevel(2, 2),
				this.waitForChanges(assert, "expand node to level 2")
			]);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["2"], ["2.0"]]);

			// code under test
			oTable.setFirstVisibleRow(0);

			return this.waitForChanges(assert, "scroll up again");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"]]);
		});
	});

	//*********************************************************************************************
	// Scenario: All contexts created by ODataTreeBinding consider the deep path of the tree binding that the OData
	// messages can be properly assigned.
	// JIRA: CPOUI5MODELS-1529, SNOW: CS20230006644418, CPOUI5MODELS-1531
	QUnit.test("ODataTreeBinding: Message handling", function (assert) {
		let oTable;
		const oModel = createSpecialCasesModel();
		const oMessage0 = this.createResponseMessage("to_C_RSHMaintSchedSmltdOrdAndOp('id-0')/MaintenanceOrder");
		const oMessage000 = this.createResponseMessage("to_C_RSHMaintSchedSmltdOrdAndOp('id-0.0.0')/MaintenanceOrder");
		const sView = '\
<VBox binding="{/DummySet(\'42\')}">\
<t:TreeTable id="table"\
		rows="{\
			parameters: {\
				countMode : \'Request\',\
				numberOfExpandedLevels: 1,\
				transitionMessagesOnly: true,\
				treeAnnotationProperties: {\
					hierarchyDrillStateFor: \'OrderOperationIsExpanded\',\
					hierarchyLevelFor: \'OrderOperationRowLevel\',\
					hierarchyNodeFor: \'OrderOperationRowID\',\
					hierarchyParentNodeFor: \'OrderOperationParentRowID\'\
				}\
			},\
			path: \'to_C_RSHMaintSchedSmltdOrdAndOp\'\
		}"\
		threshold="0"\
		visibleRowCount="2">\
	<Text id="maintenanceOrder" text="{MaintenanceOrder}" />\
</t:TreeTable>\
</VBox>';

		this.expectHeadRequest()
			.expectRequest("DummySet('42')", {
				__metadata: {uri: "/DummySet('42')"},
				DummyID: "42"
			}, {"sap-message" : getMessageHeader([oMessage0, oMessage000])})
			// triggered by ODataTreeBinding#_getCountForNodeId
			.expectRequest("DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp/$count?$filter=OrderOperationRowLevel eq 0",
				"273")
			.expectRequest({ // triggered by ODataTreeBinding#_loadSubNodes
					headers: {"sap-messages": "transientOnly"},
					requestUri: "DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp?"
						+ "$filter=OrderOperationRowLevel eq 0&$skip=0&$top=2"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0')"},
						MaintenanceOrder: "0",
						OrderOperationIsExpanded: "collapsed",
						OrderOperationRowID: "id-0",
						OrderOperationRowLevel: 0
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-1')"},
						MaintenanceOrder: "1",
						OrderOperationIsExpanded: "leaf",
						OrderOperationRowID: "id-1",
						OrderOperationRowLevel: 0
					}]
				})
			// triggered by ODataTreeBinding#_getCountForNodeId
			.expectRequest(
				"DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp/$count?$filter=OrderOperationParentRowID eq 'id-0'",
				"2")
			.expectRequest({ // triggered by ODataTreeBinding#_loadSubNodes
					headers: {"sap-messages": "transientOnly"},
					requestUri: "DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp?"
						+ "$filter=OrderOperationParentRowID eq 'id-0'&$skip=0&$top=2"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0')"},
						MaintenanceOrder: "0.0",
						OrderOperationIsExpanded: "collapsed",
						OrderOperationParentRowID: "id-0",
						OrderOperationRowID: "id-0.0",
						OrderOperationRowLevel: 1
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.1')"},
						MaintenanceOrder: "0.1",
						OrderOperationIsExpanded: "leaf",
						OrderOperationParentRowID: "id-0",
						OrderOperationRowID: "id-0.1",
						OrderOperationRowLevel: 1
					}]
				})
			.expectMessages([{
				code : oMessage0.code,
				fullTarget : "/DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp('id-0')/MaintenanceOrder",
				message : oMessage0.message,
				persistent : false,
				target : "/C_RSHMaintSchedSmltdOrdAndOp('id-0')/MaintenanceOrder",
				type : mSeverityMap[oMessage0.severity]
			}, {
				code : oMessage000.code,
				fullTarget : "/DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp('id-0.0.0')/MaintenanceOrder",
				message : oMessage000.message,
				persistent : false,
				target : "/C_RSHMaintSchedSmltdOrdAndOp('id-0.0.0')/MaintenanceOrder",
				type : mSeverityMap[oMessage000.severity]
			}]);

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["0"], ["0.0"]]);

			let aMessages = oTable.getBindingContext().getMessages();
			assert.strictEqual(aMessages.length, 2);
			assert.strictEqual(aMessages[0].code, oMessage0.code);
			assert.strictEqual(aMessages[1].code, oMessage000.code);
			aMessages = oTable.getRows()[0].getBindingContext().getMessages(); // messages for id-0
			assert.strictEqual(aMessages.length, 1);
			assert.strictEqual(aMessages[0].code, oMessage0.code);

			this.expectRequest({
					headers: {"sap-messages": "transientOnly"},
					requestUri: "DummySet('42')/to_C_RSHMaintSchedSmltdOrdAndOp?"
						+ "$filter=OrderOperationRowID eq 'id-0.0' and OrderOperationRowLevel le 3"
				}, {
					results: [{
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0')"},
						MaintenanceOrder: "0.0",
						OrderOperationIsExpanded: "expanded",
						OrderOperationParentRowID: "id-0",
						OrderOperationRowID: "id-0.0",
						OrderOperationRowLevel: 1
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0.0')"},
						MaintenanceOrder: "0.0.0",
						OrderOperationIsExpanded: "expanded",
						OrderOperationParentRowID: "id-0.0",
						OrderOperationRowID: "id-0.0.0",
						OrderOperationRowLevel: 2
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0.0.0')"},
						MaintenanceOrder: "0.0.0.0",
						OrderOperationIsExpanded: "leaf",
						OrderOperationParentRowID: "id-0.0.0",
						OrderOperationRowID: "id-0.0.0.0",
						OrderOperationRowLevel: 3
					}, {
						__metadata: {uri: "C_RSHMaintSchedSmltdOrdAndOp('id-0.0.1')"},
						MaintenanceOrder: "0.0.1",
						OrderOperationIsExpanded: "leaf",
						OrderOperationParentRowID: "id-0.0",
						OrderOperationRowID: "id-0.0.1",
						OrderOperationRowLevel: 2
					}]
				});

			return Promise.all([
				// code under test - context creation via ODataTreeBindingAdapter#expandNodeToLevel
				oTable.getBinding("rows").expandNodeToLevel(1, 3),
				this.waitForChanges(assert)
			]);
		}).then(() => {
			// scroll to id-0-0-0
			oTable.setFirstVisibleRow(2);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0.0.0"], ["0.0.0.0"]]);
			const aMessages = oTable.getRows()[0].getBindingContext().getMessages(); // messages for id-0-0-0
			assert.strictEqual(aMessages.length, 1);
			assert.strictEqual(aMessages[0].code, oMessage000.code);
		});
	});

	/** @deprecated As of version 1.102.0, reason OperationMode.Auto */
	//*********************************************************************************************
	// Scenario: If operation mode auto and a threshold is set as binding parameter and a count
	// request returns a count smaller than the threshold then this count is used as the $top
	// value for requesting the complete tree data.
	// BCP: 2270014869
	QUnit.test("ODataTreeBinding: _loadCompleteTreeWithAnnotations sets $top URL parameter",
			function (assert) {
		var oModel = createSpecialCasesModel(),
			sView = '\
<t:TreeTable rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 2,\
				operationMode : \'Auto\',\
				rootLevel : 0,\
				threshold : 200,\
				treeAnnotationProperties : {\
					hierarchyDrillStateFor : \'OrderOperationIsExpanded\',\
					hierarchyLevelFor : \'OrderOperationRowLevel\',\
					hierarchyNodeFor : \'OrderOperationRowID\',\
					hierarchyParentNodeFor : \'OrderOperationParentRowID\'\
				}\
			},\
			path : \'/C_RSHMaintSchedSmltdOrdAndOp\'\
		}"\
		visibleRowCount="2">\
	<Text text="{MaintenanceOrder}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp?$top=0&$inlinecount=allpages", {
				__count : "150",
				results : []
			})
			.expectRequest("C_RSHMaintSchedSmltdOrdAndOp?$top=150", {
				results : [/*data not neccessary*/]
			});

		return this.createView(assert, sView, oModel);
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
				metadataUrlParams : {customMeta : "custom/meta"},
				serviceUrlParams : {customService : "custom/service"},
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
					descriptionUrl : undefined,
					message : "EnterNumberFraction 3",
					target : oControl.getId() + "/value",
					type : "Error"
				}])
				.expectValue("weight", "12.3456 KG")
				.expectValueState(that.oView.byId("weight"), "Error", "EnterNumberFraction 3");

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("12.3456 KG");
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectMessages(
				oFixture.sMessageText
				? [{
					descriptionUrl : undefined,
					message : oFixture.sMessageText,
					target : oControl.getId() + "/value",
					type : "Error"
				}]
				: [])
				.expectValue("weight", "1.1 EA")
				.expectValueState(that.oView.byId("weight"), oFixture.sMessageType,
					oFixture.sMessageText);

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("1.1 EA");
			});

			return that.waitForChanges(assert);
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
				metadataUrlParams : {customMeta : "custom/meta"},
				serviceUrlParams : {customService : "custom/service"},
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
					descriptionUrl : undefined,
					message : "EnterNumberFraction 2",
					target : oControl.getId() + "/value",
					type : "Error"
				}])
				.expectValue("price", "1.234 EUR")
				.expectValueState(that.oView.byId("price"), "Error", "EnterNumberFraction 2");

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("1.234 EUR");
			});

			return that.waitForChanges(assert);
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
				.expectValue("price", "")
				.expectValueState(oAmountControl, "None", "")
				.expectValueState(oCurrencyControl, "None", "");

			// code under test
			oAmountControl.setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("amount", "12.00")
				.expectValue("amount", "12.00") //TODO why twice?
				.expectValue("price", "12.00\u00a0EUR")
				.expectValueState(oAmountControl, "None", "")
				.expectValueState(oCurrencyControl, "None", "");

			// code under test
			oAmountControl.setValue("12");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("currency", "")
				.expectValue("price", "12.00")
				.expectValueState(oAmountControl, "None", "")
				.expectValueState(oCurrencyControl, "None", "");

			// code under test
			oCurrencyControl.setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("amount", "98.70")
				.expectValue("amount", "98.70") //TODO why twice?
				.expectValue("price", "98.70")
				.expectValueState(oAmountControl, "None", "")
				.expectValueState(oCurrencyControl, "None", "");

			// code under test - as currency code is still missing no value should be displayed
			oAmountControl.setValue("98.7");

			return that.waitForChanges(assert);
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
				.expectValue("weight", "")
				.expectValueState(oMeasureControl, "None", "")
				.expectValueState(oUnitControl, "None", "");

			// code under test - empty measure leads to 0??
			oMeasureControl.setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("measure", "12.000")
				.expectValue("measure", "12.000") //TODO why twice?
				.expectValue("weight", "12.000 KG")
				.expectValueState(oMeasureControl, "None", "")
				.expectValueState(oUnitControl, "None", "");

			// code under test
			oMeasureControl.setValue("12");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("measure", "12")
				.expectValue("unit", "")
				.expectValue("weight", "12")
				.expectValueState(oMeasureControl, "None", "")
				.expectValueState(oUnitControl, "None", "");

			// code under test
			oUnitControl.setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("measure", "98.7")
				.expectValue("weight", "98.7")
				.expectValueState(oMeasureControl, "None", "")
				.expectValueState(oUnitControl, "None", "");

			// code under test
			oMeasureControl.setValue("98.7");

			return that.waitForChanges(assert);
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

			that.expectValue("currency", "EUR")
				.expectValueState("currency", "None", "");

			oControl.setValue("EUR");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("currency", "foo")
				.expectMessages([{
					descriptionUrl : undefined,
					message : "Currency.InvalidMeasure",
					target : oControl.getId() + "/value",
					type : "Error"
				}])
				.expectValueState("currency", "Error", "Currency.InvalidMeasure");

			TestUtils.withNormalizedMessages(function () {
				// code under test
				oControl.setValue("foo");
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("currency", "EUR")
				.expectMessages([])
				.expectValueState("currency", "None", "");

			oControl.setValue("EUR");

			return that.waitForChanges(assert);
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
				}])
				.expectValueState("quantity", "Error", "Some message");

			Messaging.addMessages(new Message({
				message : "Some message",
				processor : oModel,
				target : "/RequestedQuantity",
				type : "Error"
			}));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("quantity", "")
				.expectValueState("quantity", "None", "");

			// code under test
			that.oView.byId("quantity").unbindProperty("value");

			return that.waitForChanges(assert);
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
			.expectValue("id", ["0500000001", "0500000002"]);

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
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						ItemPosition : "10",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
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

	//*********************************************************************************************
	// Scenario: Successful creation of an entity results in a fulfilled promise on the
	// corresponding context.
	// JIRA: CPOUI5MODELS-615
	QUnit.test("createEntry: Context#created fulfills", function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="salesOrder">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						}
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {
							uri : "SalesOrderSet('42')"
						},
						SalesOrderID : "42"
					},
					statusCode : 201
				});

			oCreatedContext = oModel.createEntry("/SalesOrderSet", {properties : {}});
			oModel.submitChanges();

			return Promise.all([
				that.waitForChanges(assert),
				// code under test
				oCreatedContext.created()
			]);
		}).then(function () {
			that.expectValue("salesOrderID", "42");

			// code under test
			that.oView.byId("salesOrder").bindElement({
				path : oCreatedContext.getPath(),
				parameters : {select : "SalesOrderID"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Unsuccessful creation of an entity results in a pending promise on the
	// corresponding context. On resetting the changes the promise is rejected with an aborted
	// error.
	// JIRA: CPOUI5MODELS-615
	QUnit.test("createEntry: Context#created pending, then rejects", function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="salesOrder">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						SalesOrderID : "draftID",
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						}
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, createErrorResponse({message : "POST failed", statusCode : 400}))
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			oCreatedContext = oModel.createEntry("/SalesOrderSet", {properties : {
				SalesOrderID : "draftID"
			}});
			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrderSet",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", "draftID");

			that.oView.byId("salesOrder").bindElement({
				path : oCreatedContext.getPath(),
				parameters : {select : "SalesOrderID"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			var pCreated = oCreatedContext.created();

			that.expectValue("salesOrderID", "")
				.expectMessages([]);

			// code under test
			oModel.resetChanges([oCreatedContext.getPath()], undefined, true);

			return Promise.all([
				that.waitForChanges(assert),
				// code under test
				pCreated.then(function () {
					assert.ok(false, "unexpected success");
				}, function (oError) {
					assert.strictEqual(oError.aborted, true);
				})
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create an entity and immediately reset changes without deleting the created entity.
	// Do some changes and then reset changes with deleting created entities. In that case the
	// created promise is rejected with an aborted error.
	// JIRA: CPOUI5MODELS-615
	QUnit.test("createEntry: create - reset - modify - 'hard' reset", function (assert) {
		var pCreated, oCreatedContext, bResolved,
			oModel = createSalesOrdersModel(),
			that = this;

		return this.createView(assert, '', oModel).then(function () {
			// code under test
			oCreatedContext = oModel.createEntry("/SalesOrderSet", {properties : {
				SalesOrderID : "draftID"
			}});

			pCreated = oCreatedContext.created().catch(function (oError) {
				bResolved = true;
				throw oError;
			});

			// code under test - reset changes without deleting created entities
			oModel.resetChanges([oCreatedContext.getPath()]);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.notOk(bResolved); // first resetChanges does not reject the promise

			oModel.setProperty(oCreatedContext.getPath() + "/Note", "Foo");

			// code under test - reset changes deleting also created entities
			oModel.resetChanges([oCreatedContext.getPath()], undefined, true);

			return Promise.all([
				pCreated.then(function () {
					assert.ok(false, "unexpected success");
				}, function (oError) {
					assert.strictEqual(oError.aborted, true);
				}),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity and modify data before response is processed. Another call of
	// ODataModel#submitChanges must not create a second POST request but has to create a MERGE
	// request with the etag received from the POST request.
	// BCP: 2270069046
[false, true].forEach(function (bCustomChangeGroup) {
	var sTitle = "ODataListBinding#create: create, modify before create is done"
			+ (bCustomChangeGroup ? "; with custom change group" : "");

	QUnit.test(sTitle, function (assert) {
		var oBinding, oCreatedContext, fnResolve, oTable,
			oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				refreshAfterChange : false
			}),
			sView = '\
<Table growing="true" growingThreshold="2" id="table" items="{/SalesOrderSet}">\
	<Input id="note" value="{Note}" />\
	<Input id="customerID" value="{CustomerID}" />\
</Table>',
			that = this;

		function fnSubmitChanges() {
			var mParams = {groupId : bCustomChangeGroup ? "~groupId" : undefined};

			oModel.submitChanges(mParams);
		}

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2", {
				results : []
			});

		if (bCustomChangeGroup) {
			oModel.setDeferredGroups(["~groupId"]);
			oModel.setChangeGroups({"*":{groupId: "~groupId"}});
		}

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("customerID", [""])
				.expectValue("note", ["foo"]);

			// code under test
			oCreatedContext = oBinding.create({Note : "foo"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						},
						Note : "foo"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, new Promise(function (resolve) { fnResolve = resolve; }));

			fnSubmitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("customerID", ["13"]);

			oTable.getItems()[0].getCells()[1].setValue("13");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["bar"]);

			fnResolve({
				data : {
					__metadata : {
						etag : "W/\"2022-04-14T08:08:58.312Z\"",
						uri : "SalesOrderSet('42')"
					},
					CustomerID : "0",
					Note : "bar",
					SalesOrderID : "42"
				},
				statusCode : 201
			});

			return Promise.all([
				// code under test
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					data : {
						__metadata : {
							etag : "W/\"2022-04-14T08:08:58.312Z\"",
							uri : "SalesOrderSet('42')"
						},
						CustomerID : "13"
					},
					headers : {
						"If-Match" : "W/\"2022-04-14T08:08:58.312Z\""
					},
					key : "SalesOrderSet('42')",
					method : "MERGE",
					requestUri : "SalesOrderSet('42')"
				}, {
					data : NO_CONTENT,
					headers : {etag : "W/\"2020-05-19T08:10:00.146Z\""},
					statusCode : 204
				});

			// code under test
			fnSubmitChanges();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Create a new entity and modify data before response is processed. After the
	// response has failed, another call of ODataModel#submitChanges leads to a second POST request
	// with combined data of the failed request and the modification.
	// BCP: 2270069046
	QUnit.test("ODataListBinding#create: create, modify before create is done; first #submitChanges"
			+ " failed", function (assert) {
		var oBinding, oCreatedContext, fnResolve, oTable,
			oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				refreshAfterChange : false
			}),
			sView = '\
<Table growing="true" growingThreshold="2" id="table" items="{/SalesOrderSet}">\
	<Input id="note" value="{Note}" />\
	<Input id="customerID" value="{CustomerID}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2", {
				results : []
			});

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("customerID", [""])
				.expectValue("note", ["foo"]);

			// code under test
			oCreatedContext = oBinding.create({Note : "foo"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						},
						Note : "foo"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, new Promise(function (resolve) { fnResolve = resolve; }));

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("customerID", ["13"]);

			oTable.getItems()[0].getCells()[1].setValue("13");

			return that.waitForChanges(assert);
		}).then(function () {
			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrderSet",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			fnResolve({
				response : createErrorResponse({message : "POST failed", statusCode : 400})
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						},
						CustomerID : "13",
						Note : "foo"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('42')"},
						CustomerID : "15",
						Note : "bar",
						SalesOrderID : "42"
					},
					statusCode : 201
				})
				.expectValue("customerID", ["15"])
				.expectValue("note", ["bar"]);

			// code under test
			oModel.submitChanges();

			return Promise.all([
				// code under test
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity with complex type. The response contains an updated property
	// within this complex type. Therefore the changed entity handling works correct and a second
	// ODataModel#submitChanges triggers no MERGE request.
	// BCP: 2270069046
	// BCP: 2270084110
	QUnit.test("ODataListBinding#create: create with complex type results in no pending changes",
			function (assert) {
		var oBinding, oCreatedContext,
			oModel = createSalesOrdersModel({refreshAfterChange : false}),
			sView = '\
<Table growing="true" growingThreshold="2" id="table" items="{/BusinessPartnerSet}">\
	<Input id="country" value="{Address/Country}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=2", {
				results : []
			});

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			that.expectValue("country", ["de"]);

			// code under test
			oCreatedContext = oBinding.create({Address : {Country : "de"}});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.BusinessPartner"
						},
						Address : {Country : "de"}
					},
					method : "POST",
					requestUri : "BusinessPartnerSet"
				}, {
					data : {
						__metadata : {
							etag : "W/\"2022-04-14T08:08:58.312Z\"",
							uri : "BusinessPartnerSet('42')"
						},
						BusinessPartnerID : "42",
						Address : {Country : "DE"}
					},
					statusCode : 201
				})
				.expectValue("country", ["DE"]);

			oModel.submitChanges();

			return Promise.all([
				// code under test
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oModel.hasPendingChanges(), false);

			// code under test
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (1)
	// Number of transient: 2
	// Delete: ODataModel.resetChanges
	// Create at: start
	// Table control: sap.ui.table.Table
	// POST request for second item: submitWithFailure
	// CPOUI5MODELS-635
	QUnit.test("All pairs test for multi create (1)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");
			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectValue("id", ["43"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("id", ["", "43", "42"])
				.expectValue("note", ["New 2", "New 1", "First SalesOrder"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, createErrorResponse({message : "POST failed", statusCode : 400}))
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrderSet",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "43", "42"], 1)
				.expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);

			oBinding.create({Note : "New 3"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			// clean all expected messages
			that.expectMessages([])
				// The PropertyBinding is updated synchronously, the ListBinding asynchronously
				.expectValue("note", "", 1)
				.expectValue("id", ["43", "42", ""], 1)
				.expectValue("note", ["New 1", "First SalesOrder", ""], 1);

			oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (2)
	// Number of transient: 1
	// Delete: ODataModel.remove
	// Create at: start
	// Table control: sap.m.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-635
	QUnit.test("All pairs test for multi create (2)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" growing="true" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</Table>',
			that = this;

		oModel.setDeferredGroups(["changes", "deleteGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=20", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42"])
			.expectValue("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "", "42"])
				.expectValue("note", ["New 2", "New 1", "First SalesOrder"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectValue("id", ["44", "43"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("id", ["", "44", "43", "42"])
				.expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);

			oBinding.create({Note : "New 3"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('44')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?$skip=0&$top=20"
					+ "&$filter=not(SalesOrderID eq '44' or SalesOrderID eq '43')", {
					results : [{
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				.expectValue("id", ["43", "42"], 1)
				.expectValue("note", ["New 1", "First SalesOrder"], 1);

			oModel.remove("", {
				groupId : "deleteGroup", context : oCreatedContext1, refreshAfterChange : true
			});
			oModel.submitChanges({groupId : "deleteGroup"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
			assert.strictEqual(oTable.getItems().length, 3, "number of table items");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (3)
	// Number of transient: 3
	// Delete: ODataModel.resetChanges
	// Create at: start
	// Table control: sap.ui.table.Table
	// POST request for second item: submitWithFailure
	// CPOUI5MODELS-635
	QUnit.test("All pairs test for multi create (3)", function (assert) {
		var oBinding, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");
			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 2", "New 1", "First SalesOrder"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, createErrorResponse({message : "POST failed", statusCode : 400}))
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}) // Response not relevant
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}, {
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrderSet",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName)
				.exactly(2);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 2)
				.expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);

			oBinding.create({Note : "New 3"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			// message for item with note "New 1" remains
			that.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}])
				// The PropertyBinding is updated synchronously, the ListBinding asynchronously
				.expectValue("note", "", 1)
				.expectValue("id", ["42", ""], 2)
				.expectValue("note", ["New 1", "First SalesOrder", ""], 1);

			// code under test
			oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (4)
	// Number of transient: 0
	// Delete: ODataModel.remove
	// Create at: start
	// Table control: sap.ui.table.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-635
	QUnit.test("All pairs test for multi create (4)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oCreatedContext2, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 2", "New 1", "First SalesOrder"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 2)
				.expectValue("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);

			oCreatedContext2 = oBinding.create({Note : "New 3"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 3"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('45')"},
						Note : "New 3",
						SalesOrderID : "45"
					},
					statusCode : 201
				})
				.expectValue("id", ["45", "44", "43"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('44')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?$skip=0&$top=105"
					+ "&$filter=not(SalesOrderID eq '45' or SalesOrderID eq '44' "
					+ "or SalesOrderID eq '43')", {
					results : [{
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				// The PropertyBinding is updated synchronously, the ListBinding asynchronously
				.expectValue("id", "", 1)
				.expectValue("note", "", 1)
				.expectValue("id", ["43", "42", ""], 1)
				.expectValue("note", ["New 1", "First SalesOrder", ""], 1);

			oModel.remove("", {context : oCreatedContext1, refreshAfterChange : true});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (5)
	// Number of transient: 1
	// Delete: ODataModel.remove
	// Create at: end
	// Table control: sap.ui.table.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-668
	QUnit.test("All pairs test for multi create (5)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		oModel.setDeferredGroups(["changes", "deleteGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105&$inlinecount=allpages", {
				__count : "1",
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("note", "New 1", 1);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "New 2", 2);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectValue("id", ["43", "44"], 1);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", "New 3", 3);

			oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('44')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?$skip=0&$top=105"
					+ "&$filter=not(SalesOrderID eq '43' or SalesOrderID eq '44')"
					+ "&$inlinecount=allpages", {
					results : [{
						__count : "1",
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				// The PropertyBinding is updated synchronously, the ListBinding asynchronously
				.expectValue("id", "", 2)
				.expectValue("note", "", 2)
				.expectValue("note", ["New 3", ""], 2);

			oModel.remove("", {
				groupId : "deleteGroup", context : oCreatedContext1, refreshAfterChange : true
			});
			oModel.submitChanges({groupId : "deleteGroup"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (6)
	// Number of transient: 3
	// Delete: ODataModel.resetChanges
	// Create at: end
	// Table control: sap.m.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-668
	QUnit.test("All pairs test for multi create (6)", function (assert) {
		var oBinding, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			sView = '\
<Table id="table" growing="true" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</Table>',
			that = this;

		oModel.setDeferredGroups(["changes", "deleteGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=20&$inlinecount=allpages", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42"])
			.expectValue("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("note", "New 1", 1);

			oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "New 2", 2);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "New 3", 3);

			oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["New 3"], 2);

			// code under test
			oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
			assert.strictEqual(oTable.getItems().length, 3, "number of table items");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (7)
	// Number of transient: 2
	// Delete: ODataModel.resetChanges
	// Create at: end
	// Table control: sap.ui.table.Table
	// POST request for second item: submitWithFailure
	// CPOUI5MODELS-668
	QUnit.test("All pairs test for multi create (7)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105&$inlinecount=allpages", {
				__count : "1",
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("note", "New 1", 1);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectValue("id", "43", 1);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", "New 2", 2);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, createErrorResponse({message : "POST failed", statusCode : 400}))
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrderSet",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "New 3", 3);

			oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			// The PropertyBinding is updated synchronously, the ListBinding asynchronously
			that.expectValue("note", "", 2)
				.expectValue("note", ["New 3", ""], 2)
				.expectMessages([]);

			// code under test
			oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (8)
	// Number of transient: 0
	// Delete: ODataModel.remove
	// Create at: end
	// Table control: sap.ui.table.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-668
	QUnit.test("All pairs test for multi create (8)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oCreatedContext2, oTable,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105&$inlinecount=allpages", {
				__count : "1",
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("note", "New 1", 1);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "New 2", 2);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "New 3", 3);

			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 3"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('45')"},
						Note : "New 3",
						SalesOrderID : "45"
					},
					statusCode : 201
				})
				.expectValue("id", ["43", "44", "45"], 1);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('44')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?$skip=0&$top=105"
					+ "&$filter=not(SalesOrderID eq '43' or SalesOrderID eq '44'"
					+ " or SalesOrderID eq '45')&$inlinecount=allpages", {
					results : [{
						__count : "1",
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				// The PropertyBinding is updated synchronously, the ListBinding asynchronously
				.expectValue("id", "", 2)
				.expectValue("note", "", 2)
				.expectValue("id", ["45", ""], 2)
				.expectValue("note", ["New 3", ""], 2);

			oModel.remove("", {context : oCreatedContext1, refreshAfterChange : true});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (9)
	// Number of transient: 2
	// Delete: ODataModel.resetChanges
	// Create at: endOfStart
	// Table control: sap.m.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-701
	QUnit.test("All pairs test for multi create (9)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" growing="true" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</Table>',
			that = this;

		oModel.setDeferredGroups(["changes", "deleteGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=20", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42"])
			.expectValue("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectValue("id", "43", 0);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 2", "First SalesOrder"], 1);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 2)
				.expectValue("note", ["New 3", "First SalesOrder"], 2);

			oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 3", "First SalesOrder"], 1);

			// code under test
			oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
			assert.strictEqual(oTable.getItems().length, 3, "number of table items");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (10)
	// Number of transient: 3
	// Delete: ODataModel.resetChanges
	// Create at: endOfStart
	// Table control: sap.m.Table
	// POST request for second item: submitWithFailure
	// CPOUI5MODELS-701
	QUnit.test("All pairs test for multi create (10)", function (assert) {
		var oBinding, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" growing="true" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</Table>',
			that = this;

		oModel.setDeferredGroups(["changes", "deleteGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=20", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42"])
			.expectValue("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 2", "First SalesOrder"], 1);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, createErrorResponse({message : "POST failed", statusCode : 400}))
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}) // Response not relevant
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}, {
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: POST SalesOrderSet",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName)
				.exactly(2);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 2)
				.expectValue("note", ["New 3", "First SalesOrder"], 2);

			oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 3", "First SalesOrder"], 1)
				.expectMessages([{
					code : "UF0",
					descriptionUrl : "",
					fullTarget : "/SalesOrderSet('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			// code under test
			oModel.resetChanges([oCreatedContext1.getPath()], undefined, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
			assert.strictEqual(oTable.getItems().length, 3, "number of table items");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (11)
	// Number of transient: 1
	// Delete: ODataModel.remove
	// Create at: endOfStart
	// Table control: sap.ui.table.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-701
	QUnit.test("All pairs test for multi create (11)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="5">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		oModel.setDeferredGroups(["changes", "deleteGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=105", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", "", "", "", ""])
			.expectValue("note", ["First SalesOrder", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 2", "First SalesOrder"], 1);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectValue("id", ["43", "44"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("id", ["", "42"], 2)
				.expectValue("note", ["New 3", "First SalesOrder"], 2);

			oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('44')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?$skip=0&$top=105"
					+ "&$filter=not(SalesOrderID eq '43' or SalesOrderID eq '44')", {
					results : [{
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				// The PropertyBinding is updated synchronously, the ListBinding asynchronously
				.expectValue("id", "", 1)
				.expectValue("note", "", 1)
				.expectValue("id", ["42", ""], 2)
				.expectValue("note", ["New 3", "First SalesOrder", ""], 1);

			oModel.remove("", {
				groupId : "deleteGroup", context : oCreatedContext1, refreshAfterChange : true
			});
			oModel.submitChanges({groupId : "deleteGroup"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (12)
	// Number of transient: 0
	// Delete: ODataModel.remove
	// Create at: endOfStart
	// Table control: sap.m.Table
	// POST request for second item: noAdditionalSubmit
	// CPOUI5MODELS-701
	QUnit.test("All pairs test for multi create (12)", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oCreatedContext2, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" growing="true" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=20", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42"])
			.expectValue("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectValue("id", ["", "42"])
				.expectValue("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 1)
				.expectValue("note", ["New 2", "First SalesOrder"], 1);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", ["", "42"], 2)
				.expectValue("note", ["New 3", "First SalesOrder"], 2);

			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 3"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('45')"},
						Note : "New 3",
						SalesOrderID : "45"
					},
					statusCode : 201
				})
				.expectValue("id", ["43", "44", "45"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('44')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?$skip=0&$top=20"
					+ "&$filter=not(SalesOrderID eq '43' or SalesOrderID eq '44'"
					+ " or SalesOrderID eq '45')", {
					results : [{
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				.expectValue("id", ["45", "42"], 1)
				.expectValue("note", ["New 3", "First SalesOrder"], 1);

			oModel.remove("", {context : oCreatedContext1, refreshAfterChange : true});
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3, "number of contexts");
			assert.strictEqual(oTable.getItems().length, 3, "number of table items");
		});
	});

	//*********************************************************************************************
	// Scenario: Multi create with relative binding and messages
	// CPOUI5MODELS-635
	QUnit.test("Multi create with relative binding and messages", function (assert) {
		var oBinding, oCreatedContext, oObjectPage, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="flexbox">\
	<Table id="table" growing="true" items="{ToLineItems}">\
		<Text id="itemPosition" text="{ItemPosition}"/>\
		<Text id="note" text="{Note}"/>\
	</Table>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oObjectPage = that.oView.byId("flexbox");

			that.expectHeadRequest()
				.expectRequest({
					deepPath : "/BusinessPartnerSet('4711')/ToSalesOrders('42')/ToLineItems",
					method : "GET",
					requestUri : "SalesOrderSet('42')/ToLineItems?$skip=0&$top=20"
				}, {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "Position 10",
						SalesOrderID : "42"
					}]
				}, {"sap-message" : getMessageHeader(that.createResponseMessage(
					"(SalesOrderID='42',ItemPosition='10')/Note", "message-0"))})
				.expectMessages([{
					code : "code-0",
					fullTarget : "/BusinessPartnerSet('4711')/ToSalesOrders('42')"
						+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/Note",
					message : "message-0",
					persistent : false,
					target : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/Note",
					technical : false,
					type : "Error"
				}])
				.expectValue("itemPosition", ["10"])
				.expectValue("note", ["Position 10"]);

			// code under test - relative binding context
			oObjectPage.setBindingContext(new Context(oModel, "/SalesOrderSet('42')",
				"/BusinessPartnerSet('4711')/ToSalesOrders('42')"));

			return that.waitForChanges(assert);
		}).then(function () {
			oBinding = oTable.getBinding("items");
			that.expectValue("itemPosition", ["", "10"])
				.expectValue("note", ["Position New", "Position 10"]);

			oCreatedContext = oBinding.create({Note : "Position New"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"},
						Note : "Position New"
					},
					deepPath : "/BusinessPartnerSet('4711')/ToSalesOrders('42')"
						+ "/ToLineItems('~key~')",
					method : "POST",
					requestUri : "SalesOrderSet('42')/ToLineItems"
				}, createErrorResponse({message : "POST failed", statusCode : 400}))
				.expectMessages([{
					code : "code-0",
					fullTarget : "/BusinessPartnerSet('4711')/ToSalesOrders('42')"
						+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/Note",
					message : "message-0",
					persistent : false,
					target : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/Note",
					technical : false,
					type : "Error"
				}, {
					code : "UF0",
					fullTarget : "/BusinessPartnerSet('4711')/ToSalesOrders('42')"
						+ "/ToLineItems('~key~')",
					message : "POST failed",
					persistent : false,
					target : "/SalesOrderLineItemSet('~key~')",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Request failed with status code 400: "
					+ "POST SalesOrderSet('42')/ToLineItems",
					/*details not relevant*/ sinon.match.string, sODataMessageParserClassName);

			// code under test
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("itemPosition", ["10"])
				.expectValue("note", ["Position 10"])
				.expectMessages([{
					code : "code-0",
					fullTarget : "/BusinessPartnerSet('4711')/ToSalesOrders('42')"
						+ "/ToLineItems(SalesOrderID='42',ItemPosition='10')/Note",
					message : "message-0",
					persistent : false,
					target : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')/Note",
					technical : false,
					type : "Error"
				}]);

			return Promise.all([
				oModel.resetChanges([oCreatedContext.getPath()], undefined, true),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Paging and $count requests exclude persisted created entries to avoid duplicate
	// entries, respectively wrong binding length. The $count request it triggered by switching the
	// list bindings context.
	// An additional refresh (a user interaction) is performed. The expectation is that
	// persisted entities are integrated into the existing data and their position changes.
	// CPOUI5MODELS-693, CPOUI5MODELS-692
	QUnit.test("Paging/$count requests exclude persisted created entries", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oObjectPage, oTable,
			oModel = createSalesOrdersModel(),
			oObjectPageContext = new Context(oModel, "/BusinessPartnerSet('4711')",
				"/BusinessPartnerSet('4711')"),
			sView = '\
<FlexBox id="flexbox">\
	<t:Table id="table" rows="{\
				filters : [{\
					filters : [\
						{path : \'SalesOrderID\', operator : \'GE\', value1 : \'13\'},\
						{path : \'LifecycleStatus\', operator : \'EQ\', value1 : \'N\'}\
					]}\
				],\
				parameters : {countMode : \'Request\'},\
				path : \'ToSalesOrders\'\
			}"\
			threshold="0" visibleRowCount="1" >\
		<Text id="id" text="{SalesOrderID}"/>\
		<Text id="note" text="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectValue("id", [""])
			.expectValue("note", [""]);

		return this.createView(assert, sView, oModel).then(function () {
			oObjectPage = that.oView.byId("flexbox");
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectHeadRequest()
				.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders/$count"
					+ "?$filter=SalesOrderID ge '13' or LifecycleStatus eq 'N'", "17")
				.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders?$skip=0&$top=1"
					+ "&$filter=SalesOrderID ge '13' or LifecycleStatus eq 'N'", {
					results : [{
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				.expectValue("id", ["42"])
				.expectValue("note", ["First SalesOrder"]);

			oObjectPage.setBindingContext(oObjectPageContext);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getLength(), 17);

			that.expectValue("id", [""])
				.expectValue("note", ["New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			assert.strictEqual(oBinding.getLength(), 18);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders/$count"
					+ "?$filter=SalesOrderID ge '13' or LifecycleStatus eq 'N'", "17")
				.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders?$skip=0&$top=1"
					+ "&$filter=SalesOrderID ge '13' or LifecycleStatus eq 'N'", {
					results : [{
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				});

			oBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getLength(), 18);
			that.expectValue("note", ["New 2"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('4711')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('4711')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectValue("id", ["44"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders?$skip=1&$top=1"
					+ "&$filter=(SalesOrderID ge '13' or LifecycleStatus eq 'N')"
					+ " and not(SalesOrderID eq '44' or SalesOrderID eq '43')", {
					results : [{
						__metadata : {uri : "SalesOrderSet('41')"},
						Note : "Second SalesOrder",
						SalesOrderID : "41"
					}]
				})
				.expectValue("id", [""], 3)
				.expectValue("note", [""], 3)
				.expectValue("id", ["41"], 3)
				.expectValue("note", ["Second SalesOrder"], 3);

			oTable.setFirstVisibleRow(3);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders/$count"
					+ "?$filter=SalesOrderID ge '13' or LifecycleStatus eq 'N'", "17")
				.expectRequest("BusinessPartnerSet('4711')/ToSalesOrders?$skip=3&$top=1"
					+ "&$filter=SalesOrderID ge '13' or LifecycleStatus eq 'N'", {
					results : [{
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					}]
				})
				.expectValue("id", ["44"], 3)
				.expectValue("note", ["New 2"], 3);

			// code under test
			oBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getRows()[0].getBindingContext(), oCreatedContext1);
			assert.strictEqual(oCreatedContext1.isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: Server returned an empty list, user creates an entity and saves the data. Then
	// user sorts the data. When removing a persisted created entity from the list of created
	// entities it has to be ensured that the persisted created entities are read from server again
	// and the table has the correct count.
	// CPOUI5MODELS-692
	QUnit.test("Sorting has to read persisted contexts from server again", function (assert) {
		var oBinding, oCreatedContext0, oCreatedContext1, oTable,
			oModel = createSalesOrdersModel(),
			// use visibleRowCount="2" to avoid the control's default of 10 lines for which the
			// expectations need to be defined
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="2">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=102", {
				results : []
			})
			.expectValue("id", ["", ""])
			.expectValue("note", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("note", ["New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["New 2", "New 1"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 1"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "New 2"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					},
					statusCode : 201
				})
				.expectValue("id", ["44", "43"]);
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("SalesOrderSet?$skip=0&$top=2&$orderby=SalesOrderID asc", {
					results : [{
						__metadata : {uri : "SalesOrderSet('43')"},
						Note : "New 1",
						SalesOrderID : "43"
					}, {
						__metadata : {uri : "SalesOrderSet('44')"},
						Note : "New 2",
						SalesOrderID : "44"
					}]
				})
				.expectValue("id", ["43", "44"])
				.expectValue("note", ["New 1", "New 2"]);

			// code under test
			oBinding.sort(new Sorter("SalesOrderID"));

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getRows().length, 2);
			assert.strictEqual(oTable.getRows()[0].getCells()[0].getText(), "43");
			assert.strictEqual(oTable.getRows()[1].getCells()[0].getText(), "44");
			assert.strictEqual(oTable.getBinding("rows").getLength(), 2);
		});
	});

	//*********************************************************************************************
	// Scenario: All contexts of a bound list available on the client are returned, including
	// transient and created contexts and without firing any request.
	// CPOUI5MODELS-741
	QUnit.test("ODataListBinding#getAllCurrentContexts", function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" threshold="0" visibleRowCount="2">\
	<Input id="note" value="{Note}" />\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2&$inlinecount=allpages", {
				__count : "97",
				results : [{
					__metadata : {
						uri : "SalesOrderSet('1')"
					},
					Note : "SO1",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderSet('2')"
					},
					Note : "SO2",
					SalesOrderID : "2"
				}]
			})
			.expectValue("note", ["SO1", "SO2"])
			.expectMessages([]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("note", ["SONew", "SO1"]);

			oCreatedContext = oTable.getBinding("rows").create({Note : "SONew"});

			return that.waitForChanges(assert);
		}).then(function () {
			//code under test
			var aAllCurrentContextsPaths = oTable.getBinding("rows").getAllCurrentContexts()
					.map(function (oContext) {
						return oContext.getPath();
					});

			assert.strictEqual(aAllCurrentContextsPaths.length, 3);
			assert.ok(aAllCurrentContextsPaths.includes("/SalesOrderSet('1')"));
			assert.ok(aAllCurrentContextsPaths.includes("/SalesOrderSet('2')"));
			assert.ok(aAllCurrentContextsPaths.includes(oCreatedContext.getPath()));

			that.expectRequest("SalesOrderSet?$skip=4&$top=2", {
					results : [{
						__metadata : {
							uri : "SalesOrderSet('9')"
						},
						Note : "SO9",
						SalesOrderID : "9"
					}, {
						__metadata : {
							uri : "SalesOrderSet('10')"
						},
						Note : "SO10",
						SalesOrderID : "10"
					}]
				})
				.expectValue("note", ["", ""], 5)
				.expectValue("note", ["SO9", "SO10"], 5);

			oTable.setFirstVisibleRow(5);

			return that.waitForChanges(assert);
		}).then(function () {
			//code under test
			var aAllCurrentContextsPaths = oTable.getBinding("rows").getAllCurrentContexts()
					.map(function (oContext) {
						return oContext.getPath();
					});

			assert.strictEqual(aAllCurrentContextsPaths.length, 5);
			assert.ok(aAllCurrentContextsPaths.includes("/SalesOrderSet('1')"));
			assert.ok(aAllCurrentContextsPaths.includes("/SalesOrderSet('2')"));
			assert.ok(aAllCurrentContextsPaths.includes(oCreatedContext.getPath()));
			assert.ok(aAllCurrentContextsPaths.includes("/SalesOrderSet('9')"));
			assert.ok(aAllCurrentContextsPaths.includes("/SalesOrderSet('10')"));
		});
	});

	//*********************************************************************************************
	// Scenario: If a list binding contains created entries at the start of the list and the
	// binding's length is final, ensure that all data is requested if the user scrolls to the end
	// of the list.
	// BCP: 002075129400006921272023
	QUnit.test("Created entries at start: scrolling to the end reads all data", function (assert) {
		var oTable,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			sView = '\
<Table growing="true" growingThreshold="3" id="table" items="{/SalesOrderSet}">\
	<Input id="note" value="{Note}"/>\
</Table>',
		that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=3&$inlinecount=allpages", {
				__count : "5",
				results : [
					{__metadata : {uri : "SalesOrderSet('1')"}, Note : "SO1", SalesOrderID : "1"},
					{__metadata : {uri : "SalesOrderSet('2')"}, Note : "SO2", SalesOrderID : "2"},
					{__metadata : {uri : "SalesOrderSet('3')"}, Note : "SO3", SalesOrderID : "3"}
				]
			})
			.expectValue("note", ["SO1", "SO2", "SO3"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("note", ["SONew", "SO1", "SO2", "SO3"]);

			// code under test - create an item at the start of the list
			oTable.getBinding("items").create({Note : "SONew"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet?$skip=3&$top=2", {
				results : [
					{__metadata : {uri : "SalesOrderSet('4')"}, Note : "SO4", SalesOrderID : "4"},
					{__metadata : {uri : "SalesOrderSet('5')"}, Note : "SO5", SalesOrderID : "5"}
				]
			});

			that.expectValue("note", ["SO3", "SO4", "SO5"], 3);

			// code under test - scroll down to get all data from server
			oTable.requestItems();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If the table displays only transient entities (no threshold is set) and a new
	// control filter is set on the table the number of available entities is properly displayed.
	// CPOUI5MODELS-692
[CountMode.Request, CountMode.Inline, CountMode.InlineRepeat].forEach(function (sCountMode) {
	var sTitle = "More button is updated after filtering the data and if only transient entities"
			+ " are displayed; count mode: " + sCountMode;

	QUnit.test(sTitle, function (assert) {
		var oBinding, oTable,
			bInlineCount = sCountMode !== CountMode.Request,
			oModel = createSalesOrdersModel({defaultCountMode : sCountMode}),
			oResponse = {
				results : [{__metadata : {uri : "SalesOrderSet('42')"}, SalesOrderID : "42"}]
			},
			sUrl = "SalesOrderSet?$skip=0&$top=1",
			sView = '\
<Table growing="true" growingThreshold="1" id="table" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
</Table>',
			that = this;

		if (bInlineCount) {
			oResponse.__count = "17";
			sUrl += "&$inlinecount=allpages";
		} else {
			this.expectRequest("SalesOrderSet/$count", "17");
		}
		this.expectHeadRequest()
			.expectRequest(sUrl, oResponse)
			.expectValue("id", ["42"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			assert.deepEqual(oTable.getGrowingInfo(), {actual : 1, total : 17});

			that.expectValue("id", [""]);

			oBinding.create({}, false);

			assert.deepEqual(oTable.getGrowingInfo(), {actual : 1, total : 18});

			return that.waitForChanges(assert);
		}).then(function () {
			oResponse = {
				results : [{__metadata : {uri : "SalesOrderSet('42')"}, SalesOrderID : "42"}]
			};
			sUrl = "SalesOrderSet?$skip=0&$top=1&$filter=SalesOrderID ge '13'";
			if (bInlineCount) {
				oResponse.__count = "11";
				sUrl += "&$inlinecount=allpages";
			} else {
				that.expectRequest("SalesOrderSet/$count?$filter=SalesOrderID ge '13'", "11");
			}
			that.expectRequest(sUrl, oResponse);

			// Simulate control filter
			oBinding.filter(new Filter("SalesOrderID", FilterOperator.GE, "13"));

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 12);
			assert.deepEqual(oTable.getGrowingInfo(), {actual : 1, total : 12});

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Simple test for creation at the end of the list; more complex cases are tested in
	// all pairs tests for multi create.
	// JIRA: CPOUI5MODELS-617
	// Scenario 2: Contexts can be retrieved using getContextByIndex
	// BCP: 002075129400004574672023
	QUnit.test("Creation at the end of a list", function (assert) {
		var oRowsBinding,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="2">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		function checkContextByIndex(bCreated) {
			assert.strictEqual(oRowsBinding.getContextByIndex(-1), undefined);
			assert.strictEqual(oRowsBinding.getContextByIndex(0).getPath(), "/SalesOrderSet('42')");
			if (bCreated) {
				assert.strictEqual(oRowsBinding.getContextByIndex(1).isTransient(), true);
			} else {
				assert.strictEqual(oRowsBinding.getContextByIndex(1), undefined);
			}
			assert.strictEqual(oRowsBinding.getContextByIndex(2), undefined);
		}

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectValue("id", ["42", ""])
			.expectValue("note", ["First SalesOrder", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oRowsBinding = that.oView.byId("table").getBinding("rows");

			that.expectValue("note", "New 1", 1);
			checkContextByIndex(false);

			// code under test
			oRowsBinding.create({Note : "New 1"}, /*bAtEnd*/true);

			checkContextByIndex(true);
			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: On creation of inactive entities, the methods #resetChanges, #hasPendingChanges
	// and #submitChanges ignore these. The first valid edit activates the inactive entity.
	// JIRA: CPOUI5MODELS-717
	// Scenario 2: createActivate event is fired for each activation of inactive contexts.
	// JIRA: CPOUI5MODELS-718
	// Scenario 3: getCount on list bindings does not count inactive contexts.
	// JIRA: CPOUI5MODELS-719
	QUnit.test("Create inactive entity and activate it", function (assert) {
		var iCreateActivateCalled = 0,
			oCreatedContext,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Text id="id" text="{BusinessPartnerID}"/>\
	<Input id="company" value="{CompanyName}"/>\
	<Input id="mail" value="{EmailAddress}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					CompanyName : "SAP",
					EmailAddress : "Mail0"
				}]
			})
			.expectValue("id", ["42", ""])
			.expectValue("company", ["SAP", ""])
			.expectValue("mail", ["Mail0", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			that.expectValue("company", "Initial", 1)
				.expectValue("mail", "Mail1", 1);

			// code under test: Scenario 2
			oTable.getBinding("rows").attachEvent("createActivate", function () {
				iCreateActivateCalled += 1;
			});

			// code under test
			assert.strictEqual(oTable.getBinding("rows").getLength(), 1);
			// code under test: Scenario 3
			assert.strictEqual(oTable.getBinding("rows").getCount(), 1);

			// code under test
			oTable.getBinding("rows").create({
				CompanyName : "Initial",
				EmailAddress : "Mail1"
			}, /*bAtEnd*/true, {inactive : true});

			// code under test
			assert.strictEqual(oTable.getBinding("rows").getLength(), 2);
			// code under test: Scenario 3
			assert.strictEqual(oTable.getBinding("rows").getCount(), 1);

			return that.waitForChanges(assert);
		}).then(function () {
			// inactive entities are no pending changes and do not cause requests
			assert.strictEqual(oModel.hasPendingChanges(), false);
			oModel.submitChanges(); // expect no request

			return Promise.all([
				oModel.resetChanges(undefined, undefined, true), // expect no value change
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// evaluate Scenario 2
			assert.strictEqual(iCreateActivateCalled, 0);

			that.expectValue("company", "ACME", 1);

			// code under test: activate by edit
			oTable.getRows()[1].getCells()[1].setValue("ACME");

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test: Scenario 3
			assert.strictEqual(oTable.getBinding("rows").getCount(), 2);

			// evaluate Scenario 2
			assert.strictEqual(iCreateActivateCalled, 1);

			that.expectValue("company", "", 1)
				.expectValue("mail", "", 1);

			// code under test
			assert.strictEqual(oModel.hasPendingChanges(), true);

			return Promise.all([
				oModel.resetChanges(undefined, undefined, true),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("company", "Initial2", 1)
				.expectValue("mail", "Mail2", 1);

			// code under test
			assert.strictEqual(oTable.getBinding("rows").getLength(), 1);
			oCreatedContext = oTable.getBinding("rows").create({
				CompanyName : "Initial2",
				EmailAddress : "Mail2"
			}, /*bAtEnd*/true, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "ACME", 1);

			// code under test
			oTable.getRows()[1].getCells()[1].setValue("ACME");

			return that.waitForChanges(assert);
		}).then(function () {
			// evaluate Scenario 2
			assert.strictEqual(iCreateActivateCalled, 2);

			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.BusinessPartner"},
						CompanyName : "ACME",
						EmailAddress : "Mail2"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet"
				}, {
					data : {
						__metadata : {uri : "BusinessPartnerSet('43')"},
						BusinessPartnerID : "43",
						CompanyName : "ACME",
						EmailAddress : "Mail2"
					},
					statusCode : 201
				})
				.expectValue("id", "43", 1);

			// code under test
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: A created inactive entity is activated. In its triggered createActivate-event the
	// modified data which has led to the activation can already be accessed via the model; the
	// model has now pending changes. The same entity value can be overwritten in this event again.
	// JIRA: CPOUI5MODELS-805
	QUnit.test("Inactive entity is accessible while activation", function (assert) {
		var oBinding, oCreatedContext, oTable,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Text id="id" text="{BusinessPartnerID}"/>\
	<Input id="company" value="{CompanyName}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					CompanyName : "SAP"
				}]
			})
			.expectValue("id", ["42", ""])
			.expectValue("company", ["SAP", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("company", "Initial", 1);

			// code under test
			oCreatedContext = oBinding.create({
				CompanyName : "Initial"
			}, /*bAtEnd*/true, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			var oCreatedItemCompanyInput = oTable.getRows()[1].getCells()[1],
				oEntityData = oModel.getObject(oCreatedContext.getPath());

			assert.strictEqual(oEntityData.CompanyName, "Initial");
			assert.strictEqual(oModel.hasPendingChanges(), false);

			that.expectValue("company", "Activation", 1);

			// code under test
			oBinding.attachEvent("createActivate", function () {
				oEntityData = oModel.getObject(oCreatedContext.getPath());

				assert.strictEqual(oEntityData.CompanyName, "Activation");
				assert.strictEqual(oModel.hasPendingChanges(), true);

				that.expectValue("company", "Activation - modified", 1);

				oCreatedItemCompanyInput.setValue("Activation - modified");
			});
			oCreatedItemCompanyInput.setValue("Activation");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: After creation of an inactive entity with a complex type, the first valid edit
	// within the complex type activates the inactive entity.
	// JIRA: CPOUI5MODELS-717
	// JIRA: CPOUI5MODELS-827
	QUnit.test("Create inactive entity and activate it (complex type)", function (assert) {
		var oCreatedContext, oObjectPage, oTable,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Text id="id" text="{BusinessPartnerID}"/>\
	<Text id="company" text="{CompanyName}"/>\
</t:Table>\
<FlexBox id="objectPage">\
	<FlexBox binding="{path : \'Address\', parameters : {select : \'City\'}}">\
		<Input id="city" value="{City}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "BusinessPartnerSet('42')"},
					Address : {City : "Walldorf"},
					BusinessPartnerID : "42",
					CompanyName : "SAP"
				}]
			})
			.expectValue("id", ["42", ""])
			.expectValue("company", ["SAP", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oObjectPage = that.oView.byId("objectPage");
			that.expectValue("city", "Walldorf");

			oObjectPage.setBindingContext(oTable.getRows()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "Initial", 1);

			// code under test: create inactive context
			oCreatedContext = oTable.getBinding("rows").create({
				Address : {},
				CompanyName : "Initial"
			}, /*bAtEnd*/true, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("city", "");

			oObjectPage.setBindingContext(oCreatedContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("city", "Berlin");

			// code under test: no request before context activation
			oModel.submitChanges();
			// code under test: activate parent context by edit
			that.oView.byId("city").setValue("Berlin");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.BusinessPartner"},
						Address : {City : "Berlin"},
						CompanyName : "Initial"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet"
				}, {
					data : {
						__metadata : {uri : "BusinessPartnerSet('43')"},
						Address : {City : "Berlin"},
						BusinessPartnerID : "43",
						CompanyName : "Initial"
					},
					statusCode : 201
				})
				.expectValue("id", "43", 1);

			// code under test: activated entity triggers request
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(that.oView.byId("city").getBindingContext().getPath(),
				"/BusinessPartnerSet('43')/Address");
		});
	});

	//*********************************************************************************************
	// Scenario: The contexts status inactive, transient and created contexts can be retrieved via
	// the instance annotation of the contexts.
	// JIRA: CPOUI5MODELS-721
	QUnit.test("Create inactive and transient entity and activate it", function (assert) {
		var oCreatedContext, oTable,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" threshold="0" visibleRowCount="2">\
	<Input id="note" value="{Note}"/>\
	<Text id="inactive" text="{= %{@$ui5.context.isInactive} }"/>\
	<Text id="transient" text="{= %{@$ui5.context.isTransient} }"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "SO1",
					SalesOrderID : "1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					Note : "SO2",
					SalesOrderID : "2"
				}]
			})
			.expectValue("note", ["SO1", "SO2"])
			.expectValue("inactive", ["false", "false"])
			.expectValue("transient", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("note", ["", "SO1"])
				.expectValue("inactive", ["true"])
				.expectValue("transient", ["true"]);

			// code under test
			oCreatedContext = oTable.getBinding("rows").create({}, /*bAtEnd*/false,
				{inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["SONew"])
				.expectValue("inactive", ["false"]);

			// code under test
			oTable.getRows()[0].getCells()[0].setValue("SONew");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "SONew"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('3')"},
						Note : "SONew",
						SalesOrderID : "3"
					},
					statusCode : 201
				})
				.expectValue("transient", ["false"]);

			// code under test
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: In a table with an inactive, transient and persistent entry all entries are deleted
	// via v2.Context#delete.
	// JIRA: CPOUI5MODELS-806
	QUnit.test("Delete inactive, transient and persisted entity", function (assert) {
		var oContext, sContextPath, oTable, oTableBinding,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" threshold="0" visibleRowCount="3">\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=3", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "SO1",
					SalesOrderID : "1"
				}]
			})
			.expectValue("note", ["SO1", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oTableBinding = oTable.getBinding("rows");

			that.expectValue("note", ["SO inactive/transient", "SO1"]);

			oTableBinding.create({Note : "SO inactive/transient"}, /*bAtEnd*/false,
				{inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["SO active/transient", "SO inactive/transient", "SO1"]);

			oTableBinding.create({Note : "SO active/transient"}, /*bAtEnd*/false);

			return that.waitForChanges(assert);
		}).then(function () {
			oContext = oTable.getRows()[0].getBindingContext();
			that.expectValue("note", "", 0)
				.expectValue("note", ["SO inactive/transient", "SO1", ""]);

			sContextPath = oContext.getPath();

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			oContext = oTable.getRows()[0].getBindingContext();
			that.expectValue("note", "", 0)
				.expectValue("note", ["SO1", ""]);
			assert.strictEqual(oModel.getObject(sContextPath), undefined,
				"data of active/transient context removed");

			sContextPath = oContext.getPath();

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oPromise;

			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT)
				.expectValue("note", [""]);
			assert.strictEqual(oModel.getObject(sContextPath), undefined,
				"data of inactive/transient context removed");

			// code under test
			oPromise = oTable.getRows()[0].getBindingContext().delete({refreshAfterChange : false});
			oModel.submitChanges();

			return Promise.all([oPromise, that.waitForChanges(assert)]);
		});
	});

	//*********************************************************************************************
	// Scenario: On calling a function import (or using a different API to trigger a write request)
	// and creating an entry synchronously in this order (and vice versa), the corresponding
	// requests are in the same order in the change set in the $batch request.
	// BCP: 2280012509
[
	["callFunction", "createEntry"],
	["createEntry", "callFunction"]
].forEach(function (aOrderedFunctions) {
	var sTitle = "Correct request order with createEntry and callFunction; applied order: "
			+ JSON.stringify(aOrderedFunctions);

	QUnit.test(sTitle, function (assert) {
		var oModel = createSalesOrdersModel({refreshAfterChange : false, useBatch : true}),
			oFunctions = {
				callFunction : function () {
					oModel.callFunction("/SalesOrder_Confirm", {
						groupId : "changes",
						method : "POST",
						refreshAfterChange : false,
						urlParameters : {
							SalesOrderID : "0500000001"
						}
					});
				},
				createEntry : function () {
					oModel.createEntry("/SalesOrderSet", {properties : {Note : "note"}});
				}
			},
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					batchNo : 1,
					encodeRequestUri : false,
					method : "POST",
					requestNo : (aOrderedFunctions.indexOf("callFunction") + 1),
					requestUri : "SalesOrder_Confirm?SalesOrderID='0500000001'"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet('0500000001')"
				})
				.expectRequest({
					batchNo : 1,
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "note"
					},
					method : "POST",
					requestNo : (aOrderedFunctions.indexOf("createEntry") + 1),
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('0500000002')"},
						Note : "note",
						SalesOrderID : "0500000002"
					},
					statusCode : 201
				});

			// code under test
			aOrderedFunctions.forEach(function (sFunction) {
				oFunctions[sFunction]();
			});
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Load list data with $select, create a new entry in the list, but only few
	// properties are initially set.
	// JIRA: CPOUI5MODELS-656
	QUnit.test("ODataListBinding#create: use $select", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" items="{path : \'/BusinessPartnerSet\',\
		parameters : {select : \'Address,BusinessPartnerID,CompanyName\'}}">\
	<Text id="id" text="{BusinessPartnerID}" />\
	<Input id="name" value="{CompanyName}" />\
	<Input id="city" value="{Address/City}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=100"
					+ "&$select=Address,BusinessPartnerID,CompanyName", {
				results : [{
					__metadata : {uri : "/BusinessPartnerSet('1')"},
					Address : {
						__metadata : {"type":"GWSAMPLE_BASIC.CT_Address"},
						City : "Walldorf"
					},
					CompanyName : "SAP",
					BusinessPartnerID : "1"
				}]
			})
			.expectValue("id", ["1"])
			.expectValue("name", ["SAP"])
			.expectValue("city", ["Walldorf"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectValue("id", ["", "1"])
				.expectValue("name", ["Foo", "SAP"])
				.expectValue("city", ["", "Walldorf"]);

			that.oView.byId("table").getBinding("items").create({CompanyName : "Foo"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If no expand parameter is provided when an entry is created via an ODataListBinding
	// then the expand parameter of the ODataListBinding is used.
	// JIRA: CPOUI5MODELS-695
	QUnit.test("ODataListBinding#create: use expand from binding", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" items="{path : \'/ProductSet\',\
		parameters : {\
			expand : \'ToSupplier\',\
			select : \'Name,ToSupplier/Company\'}}">\
	<Text id="name" text="{Name}" />\
	<Text id="companyName" text="{ToSupplier/CompanyName}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("ProductSet?$skip=0&$top=100"
					+ "&$expand=ToSupplier&$select=Name,ToSupplier/Company", {
				results : [{
					__metadata : {uri : "/ProductSet('1')"},
					Name : "Laptop",
					ToSupplier : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						CompanyName : "SAP"
					}
				}]
			})
			.expectValue("name", ["Laptop"])
			.expectValue("companyName", ["SAP"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.Product"},
						Name : "iPhone"
					},
					headers : {"sap-messages": "transientOnly"},
					method : "POST",
					requestUri : "ProductSet"
				}, {
					data : {
						__metadata : {uri : "ProductSet('2')"},
						Name : "iPhone"
					},
					statusCode : 201
				}).expectRequest("$~key~?$expand=ToSupplier&$select=ToSupplier", {
					__metadata : {uri : "ProductSet('2')"},
					ToSupplier : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						CompanyName : "SAP"
					}
				})
				.expectValue("name", ["iPhone", "Laptop"])
				.expectValue("companyName", ["", "SAP"])
				.expectValue("companyName", "SAP", 0);

			that.oView.byId("table").getBinding("items").create({Name : "iPhone"});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects for entities on object page properly read data for a table on
	// the object page with creation-rows and its nested lists (Select controls). In the sample, the
	// table has all kind of rows: transient, created and persisted and read from server. Following
	// aspects are considered after the side effects have been executed:
	// 1. The order of rows is kept
	// 2. Creation-rows which are persisted keep their position and are updated with side effects
	// 3. Created, persisted rows are not considered in the response to the side-effect read
	//    request in order to avoid duplicates
	// 4. Nested collections are updated
	// JIRA: CPOUI5MODELS-656
	// Scenario: The promise returned by requestSideEffects is to be resolved with the list bindings
	// which have been refreshed.
	// JIRA: CPOUI5MODELS-1299
	QUnit.test("Request side effects: $batch, nested collections", function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{\
				path : \'ToSalesOrders\',\
				parameters : {\
					expand : \'ToBusinessPartner\',\
					select : \'SalesOrderID,Note,ToBusinessPartner/CompanyName\'\
				}\
			}" visibleRowCount="4">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Text id="note" text="{Note}"/>\
		<Select items="{path : \'ToLineItems\', templateShareable : true}">\
			<MenuItem text="{Note}" />\
		</Select>\
		<Text id="name" text="{ToBusinessPartner/CompanyName}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "BusinessPartnerSet('42')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest({
				batchNo : 2,
				requestUri : "BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=104"
					+ "&$expand=ToBusinessPartner"
					+ "&$select=SalesOrderID,Note,ToBusinessPartner/CompanyName"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1",
					ToBusinessPartner : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						BusinessPartnerID : "42",
						CompanyName : "SAP"
					}
				}]
			})
			.expectRequest({
				batchNo : 3,
				deepPath : "/BusinessPartnerSet('42')/ToSalesOrders('1')/ToLineItems",
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					SalesOrderID : "1",
					ItemPosition : "10",
					Note : "Sales Order Line Item 1"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", "", "", ""])
			.expectValue("note", ["Sales Order 1", "", "", ""])
			.expectValue("name", ["SAP", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			var aSelectItems;

			oTable = that.oView.byId("table");
			aSelectItems = oTable.getRows()[0].getCells()[2].getItems();

			assert.strictEqual(aSelectItems.length, 1);
			assert.strictEqual(aSelectItems[0].getText(), "Sales Order Line Item 1");

			// the relative ODLB for select control of the second row gets a context after the
			// create and therefore requests data
			that.expectRequest({
					batchNo : 4,
					deepPath : "/BusinessPartnerSet('42')/ToSalesOrders('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						SalesOrderID : "1",
						ItemPosition : "10",
						Note : "Sales Order Line Item 1"
					}]
				})
				.expectValue("salesOrderID", ["", "1"])
				.expectValue("note", ["Sales Order New 1", "Sales Order 1"])
				.expectValue("name", ["", "SAP"]);

			oBinding = oTable.getBinding("rows");
			oBinding.create({Note : "Sales Order New 1"}, false, {expand : "ToBusinessPartner"});

			return that.waitForChanges(assert);
		}).then(function () {
			var aSelectItems = oTable.getRows()[0].getCells()[2].getItems();

			assert.strictEqual(aSelectItems.length, 0);
			aSelectItems = oTable.getRows()[1].getCells()[2].getItems();
			assert.strictEqual(aSelectItems.length, 1);
			assert.strictEqual(aSelectItems[0].getText(), "Sales Order Line Item 1");

			that.expectRequest({
					batchNo : 5,
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					headers : {"sap-messages": "transientOnly"},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						Note : "Sales Order New 1",
						SalesOrderID : "2"
					},
					statusCode : 201
				})
				.expectRequest({
					batchNo : 5,
					requestUri : "$~key~?$expand=ToBusinessPartner&$select=ToBusinessPartner"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					ToBusinessPartner : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						BusinessPartnerID : "42",
						CompanyName : "SAP"
					}
				})
				.expectValue("salesOrderID", "2", 0)
				.expectValue("name", "SAP", 0);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			// the relative ODLB for select control of the third row gets a context after the create
			// and therefore requests data
			that.expectRequest({
					batchNo : 6,
					deepPath : "/BusinessPartnerSet('42')/ToSalesOrders('1')/ToLineItems",
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=100"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						SalesOrderID : "1",
						ItemPosition : "10",
						Note : "Sales Order Line Item 1"
					}]
				})
				.expectValue("salesOrderID", ["", "1"], 1)
				.expectValue("note", ["Sales Order New 2", "Sales Order 1"], 1)
				.expectValue("name", ["", "SAP"], 1);

			oBinding.create({Note : "Sales Order New 2"}, true, {expand : "ToBusinessPartner"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 7,
					requestUri : "BusinessPartnerSet('42')"
						+ "?$expand=ToSalesOrders%2CToSalesOrders%2FToBusinessPartner"
						+ "%2CToSalesOrders%2FToLineItems"
						+ "&$select=ToSalesOrders%2FSalesOrderID%2CToSalesOrders%2FNote%2C"
						+ "ToSalesOrders%2FToBusinessPartner%2FCompanyName%2C"
						+ "ToSalesOrders%2FToLineItems%2FSalesOrderID%2C"
						+ "ToSalesOrders%2FToLineItems%2FItemPosition%2C"
						+ "ToSalesOrders%2FToLineItems%2FNote"
				}, {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							Note : "Sales Order 1 - SideEffect",
							SalesOrderID : "1",
							ToBusinessPartner : {
								__metadata : {uri : "BusinessPartnerSet('42')"},
								BusinessPartnerID : "42",
								CompanyName : "SAP - SideEffect"
							},
							ToLineItems : {
								results : [{
									__metadata : {
										uri : "SalesOrderLineItemSet(SalesOrderID='1',"
											+ "ItemPosition='10')"
									},
									SalesOrderID : "1",
									ItemPosition : "10",
									Note : "Sales Order Line Item 1 - SideEffect"
								}]
							}
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							Note : "Sales Order New 1 - SideEffect",
							SalesOrderID : "2",
							ToBusinessPartner : {
								__metadata : {uri : "BusinessPartnerSet('42')"},
								BusinessPartnerID : "42",
								CompanyName : "SAP - SideEffect"
							},
							ToLineItems : {
								results : [{
									__metadata : {
										uri : "SalesOrderLineItemSet(SalesOrderID='2',"
											+ "ItemPosition='10')"
									},
									SalesOrderID : "2",
									ItemPosition : "10",
									Note : "New Sales Order Line Item 1 - SideEffect"
								}]
							}
						}]
					}
				})
				.expectValue("note", "Sales Order New 1 - SideEffect", 0)
				.expectValue("note", "Sales Order 1 - SideEffect", 2)
				.expectValue("name", "SAP - SideEffect", 0)
				.expectValue("name", "SAP - SideEffect", 2);

			// code under test
			var oSideEffectPromise = oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
					urlParameters : {
						$expand : "ToSalesOrders,ToSalesOrders/ToBusinessPartner,"
							+ "ToSalesOrders/ToLineItems",
						$select : "ToSalesOrders/SalesOrderID,ToSalesOrders/Note,"
							+ "ToSalesOrders/ToBusinessPartner/CompanyName,"
							+ "ToSalesOrders/ToLineItems/SalesOrderID,"
							+ "ToSalesOrders/ToLineItems/ItemPosition,ToSalesOrders/ToLineItems/Note"
					}
				});

			return Promise.all([oSideEffectPromise, that.waitForChanges(assert)]);
		}).then(function (aResults) {
			var aSelectItems = oTable.getRows()[0].getCells()[2].getItems();

			assert.strictEqual(aSelectItems.length, 1);
			assert.strictEqual(aSelectItems[0].getText(),
				"New Sales Order Line Item 1 - SideEffect");
			aSelectItems = oTable.getRows()[1].getCells()[2].getItems();
			assert.strictEqual(aSelectItems.length, 0);
			aSelectItems = oTable.getRows()[2].getCells()[2].getItems();
			assert.strictEqual(aSelectItems.length, 1);
			assert.strictEqual(aSelectItems[0].getText(), "Sales Order Line Item 1 - SideEffect");

			var aAffectedListBindings = aResults[0];

			assert.strictEqual(aAffectedListBindings.length, 3);
			// only list bindings with non-transient parent context may be affected by side effects
			assert.ok(aAffectedListBindings.includes(oTable.getBinding("rows")));
			assert.ok(aAffectedListBindings.includes(oTable.getRows()[0].getCells()[2].getBinding("items")));
			assert.ok(aAffectedListBindings.includes(oTable.getRows()[2].getCells()[2].getBinding("items")));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Changing entities after a side-effect request does not cause duplicates or missing
	// entries. Creation of new entities is still possible after a side-effect request. Side effects
	// are also supported in non-batch scenarios.
	// JIRA: CPOUI5MODELS-656
	QUnit.test("Request side effects: no duplicates/missing entries; no $batch", function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				useBatch : false
			}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="5">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=105", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", "", "", "", ""])
			.expectValue("note", ["Sales Order 1", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("salesOrderID", ["", "1"])
				.expectValue("note", ["Sales Order New 1", "Sales Order 1"]);

			oBinding = oTable.getBinding("rows");
			oBinding.create({Note : "Sales Order New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						Note : "Sales Order New 1",
						SalesOrderID : "2"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "2", 0);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", ["", "1"], 1)
				.expectValue("note", ["Sales Order New 2", "Sales Order 1"], 1);

			oBinding.create({Note : "Sales Order New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					requestUri : "BusinessPartnerSet('42')?$expand=ToSalesOrders"
				}, {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							Note : "Sales Order 1 - SideEffect",
							SalesOrderID : "1"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							Note : "Sales Order New 1 - SideEffect",
							SalesOrderID : "2"
						}]
					}
				})
				.expectValue("note", "Sales Order New 1 - SideEffect", 0)
				.expectValue("note", "Sales Order 1 - SideEffect", 2);

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", ["", "1"], 2)
				.expectValue("note", ["Sales Order New 3", "Sales Order 1 - SideEffect"], 2);

			oBinding.create({Note : "Sales Order New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "Foo - New 3", 2);

			oTable.getRows()[2].getCells()[1].setValue("Foo - New 3");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 2"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('3')"},
						CustomerID : "42",
						Note : "Sales Order New 2",
						SalesOrderID : "3"
					},
					statusCode : 201
				})
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Foo - New 3"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('4')"},
						CustomerID : "42",
						Note : "Foo - New 3",
						SalesOrderID : "4"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", ["3", "4"], 1);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=4"
					+ "&$orderby=SalesOrderID desc",
				{
					results : [{
						__metadata : {uri : "SalesOrderSet('4')"},
						Note : "Foo - New 3",
						SalesOrderID : "4"
					}, {
						__metadata : {uri : "SalesOrderSet('3')"},
						Note : "Sales Order New 2",
						SalesOrderID : "3"
					}, {
						__metadata : {uri : "SalesOrderSet('2')"},
						Note : "Sales Order New 1 - SideEffect",
						SalesOrderID : "2"
					}, {
						__metadata : {uri : "SalesOrderSet('1')"},
						Note : "Sales Order 1 - SideEffect",
						SalesOrderID : "1"
					}]
				})
				// sales orders "1" resp. "3" are already in 4th resp. 2nd line -> no value changes
				.expectValue("note", "Foo - New 3", 0)
				.expectValue("note", "Sales Order New 1 - SideEffect", 2)
				.expectValue("salesOrderID", "4", 0)
				.expectValue("salesOrderID", "2", 2);

			oBinding.sort(new Sorter("SalesOrderID", /*bDescending*/true));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "Bar", 2);

			oTable.getRows()[2].getCells()[1].setValue("Bar");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: The side-effects response contains the complete data for the binding in "Client"
	// mode, no additional GET request is needed.
	// JIRA: CPOUI5MODELS-780
	QUnit.test("Request side effects: no second request in 'Client' mode", function (assert) {
		var oModel = createSalesOrdersModel({defaultOperationMode : "Client"}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2",
					Note : "Sales Order 2"
				}]
			})
			.expectValue("note", ["Sales Order 1", "Sales Order 2"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("BusinessPartnerSet('42')?$expand=ToSalesOrders", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Sales Order 1 - SideEffect"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							SalesOrderID : "2",
							Note : "Sales Order 2 - SideEffect"
						}]
					}
				})
				.expectValue("note", ["Sales Order 1 - SideEffect", "Sales Order 2 - SideEffect"]);

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Messages that are no longer valid after a side-effects request are removed
	// JIRA: CPOUI5MODELS-656
	QUnit.test("Request side effects: correct message handling", function (assert) {
		var oModel = createSalesOrdersModel(),
			oMsgSalesOrder = this.createResponseMessage("SalesOrderID", "Foo"),
			oMsgSalesOrderToLineItems1 = this.createResponseMessage(
				"ToLineItems(SalesOrderID='1',ItemPosition='1')/Note", "Bar"),
			oMsgSalesOrderItem1 = cloneODataMessage(oMsgSalesOrderToLineItems1,
				"(SalesOrderID='1',ItemPosition='1')/Note"),
			sView = '\
<FlexBox id="objectPage" binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}"/>\
	<t:Table id="table" rows="{\
			path : \'ToLineItems\',\
			parameters : {transitionMessagesOnly : true}\
		}" visibleRowCount="2">\
		<Text id="itemPosition" text="{ItemPosition}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		oModel.setMessageScope(MessageScope.BusinessObject);

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				requestUri : "SalesOrderSet('1')",
				headers : {"sap-message-scope" : "BusinessObject"}
			}, {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			}, {"sap-message" : getMessageHeader([oMsgSalesOrder, oMsgSalesOrderToLineItems1])})
			.expectRequest({
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=102",
				headers : {"sap-messages" : "transientOnly"}
			}, {
				results : [{
					__metadata : {uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')"},
					SalesOrderID : "1",
					ItemPosition : "1",
					Note : "Item 1"
				}, {
					__metadata : {uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='2')"},
					SalesOrderID : "1",
					ItemPosition : "2",
					Note : "Item 2"
				}]
			})
			.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')/")
			.expectMessage(oMsgSalesOrderItem1, "/SalesOrderLineItemSet",
				"/SalesOrderSet('1')/ToLineItems")
			.expectValue("salesOrderID", "1")
			.expectValue("itemPosition", ["1", "2"])
			.expectValue("note", ["Item 1", "Item 2"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					requestUri : "SalesOrderSet('1')?$expand=ToLineItems",
					headers : {"sap-message-scope" : "BusinessObject"}
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					ToLineItems : {
						results : [{
							__metadata : {
								uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='2')"
							},
							SalesOrderID : "1",
							ItemPosition : "2",
							Note : "Item 2"
						}, {
							__metadata : {
								uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='3')"
							},
							SalesOrderID : "1",
							ItemPosition : "3",
							Note : "Item 3"
						}]
					}
				}, {"sap-message" : getMessageHeader([oMsgSalesOrder])})
				.expectValue("itemPosition", ["2", "3"])
				.expectValue("note", ["Item 2", "Item 3"])
				.expectMessage(oMsgSalesOrder, "/SalesOrderSet('1')/", undefined, true);

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToLineItems"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects also updates bindings with custom parameters.
	// JIRA: CPOUI5MODELS-838
	QUnit.test("Request side effects: updates bindings with custom parameters", function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel({preliminaryContext : true}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{\
				path : \'ToSalesOrders\',\
				parameters : {\
					custom : {\
						\'foo\' : \'bar\'\
					}\
				}\
			}" visibleRowCount="5">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "BusinessPartnerSet('42')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest({
				batchNo : 1,
				requestUri : "BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=105&foo=bar"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", "", "", "", ""])
			.expectValue("note", ["Sales Order 1", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("salesOrderID", ["", "1"])
				.expectValue("note", ["Sales Order New 1", "Sales Order 1"]);

			oBinding = oTable.getBinding("rows");
			oBinding.create({Note : "Sales Order New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 2,
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						Note : "Sales Order New 1",
						SalesOrderID : "2"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "2", 0);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", ["", "1"], 1)
				.expectValue("note", ["Sales Order New 2", "Sales Order 1"], 1);

			oBinding.create({Note : "Sales Order New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 3,
					requestUri : "BusinessPartnerSet('42')?$expand=ToSalesOrders"
				}, {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							Note : "Sales Order 1 - SideEffect",
							SalesOrderID : "1"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							Note : "Sales Order New 1 - SideEffect",
							SalesOrderID : "2"
						}, {
							__metadata : {uri : "SalesOrderSet('42')"},
							Note : "Added via side effect",
							SalesOrderID : "42"
						}]
					}
				})
				.expectValue("note", "Sales Order New 1 - SideEffect", 0)
				.expectValue("note", "Sales Order 1 - SideEffect", 2)
				.expectRequest({
					batchNo : 3,
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=105"
						+ "&$filter=not(SalesOrderID eq '2')&foo=bar"
				}, {
					results : [{
						__metadata : {uri : "SalesOrderSet('1')"},
						Note : "Sales Order 1 - SideEffect",
						SalesOrderID : "1"
					}, {
						__metadata : {uri : "SalesOrderSet('42')"},
						Note : "Added via side effect",
						SalesOrderID : "42"
					}]
				})
				.expectValue("salesOrderID", "42", 3)
				.expectValue("note", "Added via side effect", 3);

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				groupId : "~groupId",
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A created persisted entity is not part of a side-effects response. Therefore this
	// created persisted entity gets removed from the list and all related messages and pending
	// changes are discarded.
	// JIRA: CPOUI5MODELS-843
	QUnit.test("Request side effects: Removes created persisted entities", function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest({"sap-message-scope" : "BusinessObject"})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('42')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest({
				headers : {"sap-message-scope" : "BusinessObject"},
				requestUri : "BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", ""])
			.expectValue("note", ["Sales Order 1", ""]);

		oModel.setMessageScope(MessageScope.BusinessObject);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("salesOrderID", ["", "1"])
				.expectValue("note", ["Sales Order New 1", "Sales Order 1"]);

			oBinding.create({Note : "Sales Order New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			var oNoteError = that.createResponseMessage("Note");

			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID: "42",
						Note : "Sales Order New 1"
					},
					headers : {
						"sap-message-scope" : "BusinessObject"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID: "42",
						Note : "Sales Order New 1",
						SalesOrderID : "2"
					},
					statusCode : 201
				}, {
					location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet('2')",
					"sap-message" : getMessageHeader(oNoteError)
				})
				.expectValue("salesOrderID", "2", 0)
				.expectMessage(oNoteError, "/SalesOrderSet('2')/",
					"/BusinessPartnerSet('42')/ToSalesOrders('2')/");

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", "Sales Order New 1 - pending change", 0);

			oTable.getRows()[0].getCells()[1].setValue("Sales Order New 1 - pending change");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					deepPath : "/BusinessPartnerSet('42')/ToSalesOrders('1')",
					headers : {"sap-message-scope" : "BusinessObject"},
					requestUri : "SalesOrderSet('1')?$expand=ToBusinessPartner"
						+ "%2CToBusinessPartner%2FToSalesOrders"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1 - SideEffect",
					ToBusinessPartner : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						BusinessPartnerID : "42",
						ToSalesOrders : {
							results : [{
								__metadata : {uri : "SalesOrderSet('1')"},
								SalesOrderID : "1",
								Note : "Sales Order 1 - SideEffect"
							}]
						}
					}
				})
				.expectValue("salesOrderID", "", 0)
				.expectValue("note", ["", "Sales Order 1 - SideEffect"])
				.expectValue("salesOrderID", ["1", ""])
				.expectValue("note", ["Sales Order 1 - SideEffect", ""])
				.expectMessages([]);

			// code under test: using a context NOT starting at root level ("objectPage") leads to a
			// different deep path; this ensures the existing message is not removed via the usual
			// business object lifecycle
			oModel.requestSideEffects(/*SalesOrderSet('1')*/oBinding.getAllCurrentContexts()[1], {
				urlParameters : {$expand : "ToBusinessPartner,ToBusinessPartner/ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.notOk(oModel.hasPendingChanges());
		});
	});

	//*********************************************************************************************
	// Scenario: An entity is created in an empty list. After submitting this entry and refreshing
	// it via side effects, the entry is no longer contained in the side effects response. Therefore
	// this created persisted entity and its bound context is removed from the table.
	// JIRA: CPOUI5MODELS-843
	QUnit.test("Request side effects: Removes created persisted entities (empty table)",
			function (assert) {
		var oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102", {
				results : []
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["", ""])
			.expectValue("note", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("note", "Sales Order New 1", 0);

			oTable.getBinding("rows").create({Note : "Sales Order New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						Note : "Sales Order New 1",
						SalesOrderID : "2"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "2", 0);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('42')?$expand=ToSalesOrders", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : []
					}
				})
				.expectValue("salesOrderID", "", 0)
				.expectValue("note", "", 0);

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getRows()[0].getBindingContext(), null);
		});
	});

	//*********************************************************************************************
	// Scenario: An entity is created in an empty list. After submitting this entry and refreshing
	// it via side effects, the entry is no longer contained in the side effects response, but
	// another new entity is contained in this response. Therefore this created persisted entity is
	// replaced with the new responded entity from back end.
	// JIRA: CPOUI5MODELS-844
	QUnit.test("Request side effects: Remove created persisted entity, response with new entity",
			function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102", {
				results : []
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["", ""])
			.expectValue("note", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectValue("note", "Sales Order New 1", 0);

			that.oView.byId("table").getBinding("rows").create({Note : "Sales Order New 1"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						SalesOrderID : "2",
						Note : "Sales Order New 1"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "2", 0);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('42')?$expand=ToSalesOrders", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('3')"},
							SalesOrderID : "3",
							Note : "Sales Order 3 - SideEffect"
						}]
					}
				})
				.expectValue("salesOrderID", "", 0)
				.expectValue("note", "", 0)
				.expectValue("salesOrderID", "3", 0)
				.expectValue("note", "Sales Order 3 - SideEffect", 0);

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A created persisted entity is added in a table, but the entity is not visible
	// because its creation was at the end of the list. The created persisted entity is not part of
	// a side-effects response. Therefore this created persisted entity gets removed from the list.
	// Change events are triggered as expected.
	// JIRA: CPOUI5MODELS-844
	QUnit.test("Request side effects: Removed created persisted entity not visible",
			function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel(),
			oUiModel = new JSONModel({itemsCount : 0}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<Text id="count" text="{ui>/itemsCount}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2",
					Note : "Sales Order 2"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("count", "0")
			.expectValue("salesOrderID", ["1", "2"])
			.expectValue("note", ["Sales Order 1", "Sales Order 2"]);

		return this.createView(assert, sView, {undefined : oModel, ui : oUiModel}).then(
				function () {
			oBinding = that.oView.byId("table").getBinding("rows");

			oBinding.attachChange(function () {
				that.oView.byId("count").getBinding("text").getModel()
					.setProperty("/itemsCount", oBinding.getCount());
			});
		}).then(function () {
			that.expectValue("count", "3");

			oBinding.create({Note : "Sales Order New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('42')"},
						CustomerID : "42",
						SalesOrderID : "42",
						Note : "Sales Order New 1"
					},
					statusCode : 201
				});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("count", "2");

			that.expectRequest("BusinessPartnerSet('42')?$expand=ToSalesOrders", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Sales Order 1"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							SalesOrderID : "2",
							Note : "Sales Order 2"
						}]
					}
				});

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A created persisted entity is added in a table using custom parameters, but the
	// entity is not visible because its creation was at the end of the list. The created persisted
	// entity is not part of a side-effects response. Therefore this created persisted entity gets
	// removed from the list.
	// JIRA: CPOUI5MODELS-844
	QUnit.test("Request side effects: Removed created persisted entity not visible (custom params)",
			function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{\
				path : \'ToSalesOrders\',\
				parameters : {\
					custom : {\
						\'foo\' : \'bar\'\
					}\
				}\
			}" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102&foo=bar", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2",
					Note : "Sales Order 2"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", "2"])
			.expectValue("note", ["Sales Order 1", "Sales Order 2"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("rows");

			oBinding.create({Note : "Sales Order New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('42')"},
						CustomerID : "42",
						SalesOrderID : "42",
						Note : "Sales Order New 1"
					},
					statusCode : 201
				});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 3);

			that.expectRequest("BusinessPartnerSet('42')?$expand=ToSalesOrders", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Sales Order 1"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							SalesOrderID : "2",
							Note : "Sales Order 2"
						}]
					}
				})
				.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102"
						+ "&$filter=not(SalesOrderID eq '42')&foo=bar", {
					results : [{
						__metadata : {uri : "SalesOrderSet('1')"},
						SalesOrderID : "1",
						Note : "Sales Order 1"
					}, {
						__metadata : {uri : "SalesOrderSet('2')"},
						SalesOrderID : "2",
						Note : "Sales Order 2"
					}]
				});

			// code under test
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oBinding.getCount(), 2);
		});
	});

	//*********************************************************************************************
	// Scenario: After a list binding is suspended, a created persisted entity is not part of a
	// side-effects response. The created persisted entity gets removed from the list, either after
	// resuming the list binding, or after rebinding the table.
	// JIRA: CPOUI5MODELS-844
[false, true].forEach(function (bRebind) {
	var sTitle = "Request side effects: Remove created persisted after "
			+ (bRebind ? "rebind" : "resume");

	QUnit.test(sTitle, function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", ""])
			.expectValue("note", ["Sales Order 1", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("note", "Sales Order New 1", 1);

			oBinding.create({Note : "Sales Order New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New 1"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						SalesOrderID : "2",
						Note : "Sales Order New 1"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "2", 1);

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('42')?$expand=ToSalesOrders", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Sales Order 1"
						}]
					}
				});

			// code under test
			oBinding.suspend();
			oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(), {
				urlParameters : {$expand : "ToSalesOrders"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", "", 1)
				.expectValue("note", "", 1);

			if (bRebind) {
				that.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102", {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Sales Order 1"
						}]
					});

				// code under test: rebind
				oTable.bindRows(oTable.getBindingInfo("rows"));
			} else {
				// code under test: resume
				oBinding.resume();
			}

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: When a table with created persisted entries is refreshed, then the created
	// persisted entries are removed from the creation area and are inserted in the order as given
	// in the response of the refresh. If a side-effects request is within the same batch, the order
	// of the requests (requestSideEffects and then refresh, and vice versa) has no impact on the
	// final result.
	// JIRA: CPOUI5MODELS-844
[
	["refresh", "requestSideEffects"],
	["requestSideEffects", "refresh"]
].forEach(function (aOrderedFunctions) {
	var sTitle = "Request side effects: refresh overrules the side-effects response; applied "
			+ "order: " + JSON.stringify(aOrderedFunctions);

	QUnit.test(sTitle, function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel({preliminaryContext : true}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<t:Table id="table" rows="{ToSalesOrders}" visibleRowCount="5">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Text id="note" text="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "BusinessPartnerSet('42')"
			}, {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectValue("businessPartnerID", "42")
			.expectRequest({
				batchNo : 1,
				requestUri : "BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=105"
			}, {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Sales Order 1"
				}]
			})
			.expectValue("salesOrderID", ["1", "", "", "", ""])
			.expectValue("note", ["Sales Order 1", "", "", "", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("rows");

			that.expectRequest({
					batchNo : 2,
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "Sales Order New: created persisted"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						CustomerID : "42",
						SalesOrderID : "2",
						Note : "Sales Order New: created persisted"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", ["", "1"])
				.expectValue("note", ["Sales Order New: created persisted", "Sales Order 1"])
				.expectValue("salesOrderID", "2", 0);

			// code under test: new created persisted entity
			oBinding.create({Note : "Sales Order New: created persisted"}, false);
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", ["", "1"], 1)
				.expectValue("note", ["Sales Order New: transient", "Sales Order 1"], 1);

			// code under test: new transient entity
			oBinding.create({Note : "Sales Order New: transient"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			var mFunctions = {
					refresh : function () {
						oBinding.refresh();
					},
					requestSideEffects : function () {
						oModel.requestSideEffects(that.oView.byId("objectPage").getBindingContext(),
							{urlParameters : {$expand : "ToSalesOrders"}});
					}
				};

			that.expectRequest({
					batchNo : 3,
					requestNo : (aOrderedFunctions.indexOf("requestSideEffects") + 1),
					requestUri : "BusinessPartnerSet('42')?$expand=ToSalesOrders"
				}, {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					ToSalesOrders : {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Sales Order 1 - SideEffect"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							SalesOrderID : "2",
							Note : "Sales Order New: created persisted - SideEffect"
						}, {
							__metadata : {uri : "SalesOrderSet('3')"},
							SalesOrderID : "3",
							Note : "Added via side effect - but unused due to refresh"
						}]
					}
				})
				.expectValue("note", "Sales Order New: created persisted - SideEffect", 0)
				.expectValue("note", "Sales Order 1 - SideEffect", 2)
				.expectRequest({
					batchNo : 3,
					requestNo : (aOrderedFunctions.indexOf("refresh") + 1),
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=105"
				}, {
					results : [{
						__metadata : {uri : "SalesOrderSet('43')"},
						SalesOrderID : "43",
						Note : "Sales Order 43"
					}, {
						__metadata : {uri : "SalesOrderSet('2')"},
						SalesOrderID : "2",
						Note : "Sales Order New: created persisted - SideEffect"
					}, {
						__metadata : {uri : "SalesOrderSet('42')"},
						SalesOrderID : "42",
						Note : "Sales Order 42"
					}, {
						__metadata : {uri : "SalesOrderSet('1')"},
						SalesOrderID : "1",
						Note : "Sales Order 1 - SideEffect"
					}]
				})
				.expectValue("salesOrderID", ["", "43", "2", "42", "1"])
				.expectValue("note", ["Sales Order New: transient", "Sales Order 43",
					"Sales Order New: created persisted - SideEffect", "Sales Order 42",
					"Sales Order 1 - SideEffect"]);

			// code under test: calling refresh and requestSideEffects (and vice versa) in one batch
			// leads to the same result (refresh response wins)
			aOrderedFunctions.forEach(function (sFunction) {
				mFunctions[sFunction]();
			});

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: When enforcing the update of a relative list binding with a transient context via
	// ODataModel#updateBindings(true), there is no backend request.
	// JIRA: CPOUI5MODELS-755
	QUnit.test("No request for relative list binding with transient context", function (assert) {
		var oModel = createSalesOrdersModel({useBatch : false}),
			sView = '\
<FlexBox id="objectPage">\
	<t:Table id="table" rows="{ToSalesOrders}">\
		<Text id="id" text="{SalesOrderID}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oCreatedContext = oModel.createEntry("/BusinessPartnerSet"),
				oListBinding = that.oView.byId("table").getBinding("rows");

			that.oView.byId("objectPage").bindElement({
				path : oCreatedContext.getPath()
			});

			// code under test
			oModel.updateBindings(/*bForceUpdate*/true);

			assert.strictEqual(oListBinding.getLength(), 0);
			assert.strictEqual(oListBinding.getCount(), 0);
			assert.strictEqual(oListBinding.isLengthFinal(), true);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Opening an object page with a given persisted context starts reading a list via a
	// navigation property. When immediately changing the object page's context to a transient
	// context before the response is processed, then the read list data is not propagated to the
	// list binding.
	// JIRA: CPOUI5MODELS-755
	QUnit.test("Immediate change to transient context stops data propagation to list binding",
			function (assert) {
		var oContext, oObjectPage, fnResolve, oSalesOrderList,
			oModel = createSalesOrdersModel(),
			oRequestPromise = new Promise(function (resolve) { fnResolve = resolve; }),
			sView = '\
<Select id="salesOrderList" items="{/SalesOrderSet}">\
	<MenuItem text="{SalesOrderID}" />\
</Select>\
<FlexBox id="objectPage">\
	<Text id="customer" text="{CustomerName}"/>\
	<t:Table rows="{ToLineItems}" visibleRowCount="2">\
		<Text id="itemPosition" text="{ItemPosition}"/>\
		<Text id="itemNote" text="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=100", {
				results : [{
					__metadata : {uri : "SalesOrderSet('42')"},
					CustomerName : "Customer A",
					SalesOrderID : "42"
				}]
			})
			.expectValue("itemPosition", ["", ""])
			.expectValue("itemNote", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oObjectPage = that.oView.byId("objectPage");
			oSalesOrderList = that.oView.byId("salesOrderList");
			oContext = oSalesOrderList.getItems()[0].getBindingContext();

			that.expectRequest("SalesOrderSet('42')/ToLineItems?$skip=0&$top=102", oRequestPromise)
				.expectValue("customer", "Customer A");

			// code under test: triggers request
			oObjectPage.setBindingContext(oContext);

			return that.waitForChanges(assert);
		}).then(function () {
			oContext = oSalesOrderList.getBinding("items").create({CustomerName : "Customer B"});

			that.expectValue("customer", "Customer B");

			// code under test: set transient context
			oObjectPage.setBindingContext(oContext);

			// code under test: server data processed
			fnResolve({
				statusCode : 200,
				data : {
					results : [{
						__metadata : {
							uri : "/SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "Position 10",
						SalesOrderID : "42"
					}]
				}
			});

			return Promise.all([
				oRequestPromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Setting a null context to a unresolved list binding does not trigger change events.
	// BCP: 2280055052
	QUnit.test("No change event when setting null context to unresolved ODLB", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<Table id="table" items="{ToSalesOrders}">\
	<Text text="{SalesOrderID}"/>\
</Table>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("table");

			oTable.getBinding("items").attachChange(function () {
				assert.ok(false, "must not trigger change event");
			});
			oTable.attachUpdateFinished(undefined, function () {
				assert.ok(false, "must not trigger updateFinished event");
			});

			// code under test
			oTable.setBindingContext(null);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: There is a list binding which is initially suspended. In it's suspended state a
	// parent context is set which refreshes the binding. After that for example a function call
	// triggers indirectly a call to ODataListBinding#_refresh. Later the list binding is resumed
	// and needs to trigger a request to get its data.
	// BCP: 2280074593
	QUnit.test("Refresh of a suspended binding must not clear the bPendingRefresh flag",
		function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage" binding="{/SalesOrderSet(\'1\')}"/>\
<t:Table id="lineItems" rows="{path : \'ToLineItems\', suspended : true}" visibleRowCount="1">\
	<Text id="itemPosition" text="{ItemPosition}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				__metadata : {uri : "SalesOrderSet('1')"},
				SalesOrderID : "1"
			})
			.expectValue("itemPosition", [""]);

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("lineItems");

			oBinding = oTable.getBinding("rows");
			oTable.setBindingContext(that.oView.byId("objectPage").getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					encodeRequestUri : false,
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='1'"
				}, {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				});

			return Promise.all([
				oModel.callFunction("/SalesOrder_Confirm", {
					method : "POST",
					urlParameters : {SalesOrderID : "1"}
				}).contextCreated(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=101", {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')"
						},
						SalesOrderID : "1",
						ItemPosition : "1"
					}]
				})
				.expectValue("itemPosition", ["1"]);

			// code under test
			oBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A binding which already requested data gets suspended. The binding itself is not
	// refreshed and it is not affected by other changes (refreshAfterChange) then the binding does
	// not trigger a request if it gets resumed.
	// BCP: 2280074593
	QUnit.test("Resuming an unmodified binding does not fire a request while resuming",
		function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet(\'1\')/ToLineItems}" threshold="0" visibleRowCount="1">\
	<Text id="itemPosition" text="{ItemPosition}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=1", {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='1')"
					},
					SalesOrderID : "1",
					ItemPosition : "1"
				}]
			})
			.expectValue("itemPosition", ["1"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("rows");

			// code under test
			oBinding.suspend();

			that.expectRequest({
					encodeRequestUri : false,
					method : "POST",
					requestUri : "SalesOrder_Confirm?SalesOrderID='2'"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2"
				});

			return Promise.all([
				oModel.callFunction("/SalesOrder_Confirm", {
					method : "POST",
					urlParameters : {SalesOrderID : "2"}
				}).contextCreated(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// code under test - no requests expected
			oBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: When growing a responsive table with created items using the requestItems API
	// there is no unnecessary data request.
	// CPOUI5MODELS-845
	QUnit.test("No unnecessary data request after requestItems", function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel({defaultCountMode : CountMode.Inline}),
			sView = '\
<Table growing="true" growingThreshold="1" id="table" items="{/SalesOrderSet}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Input id="note" value="{Note}"/>\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=1&$inlinecount=allpages", {
				__count : "0",
				results : []
			});

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			assert.deepEqual(oTable.getGrowingInfo(), {actual : 0, total : 0});
			that.expectValue("note", ["created"]);

			oBinding.create({Note : "created"}, /*bAtEnd*/false);

			assert.deepEqual(oTable.getGrowingInfo(), {actual : 1, total : 1});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["created - changed"]);

			oTable.getItems()[0].getCells()[1].setValue("created - changed");
			// code under test: no request, length 0 is final
			oTable.requestItems(1);

			assert.deepEqual(oTable.getGrowingInfo(), {actual : 1, total : 1});
			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet?$skip=0&$top=1&$inlinecount=allpages", {
					__count : "17",
					results : [
						{__metadata : {uri : "SalesOrderSet('42')"},
						SalesOrderID : "42",
						Note : "note42"}
					]
				});

			// code under test: collection in backend has updated to 17 sales orders
			oBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oTable.getGrowingInfo(), {actual : 1, total : 18});
			that.expectValue("id", ["42"], 1)
				.expectValue("note", ["note42"], 1);

			// code under test: still no request
			oTable.requestItems(1);

			assert.deepEqual(oTable.getGrowingInfo(), {actual : 2, total : 18});
			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: On rebinding a table with a relative binding and with transient contexts at the
	// end, the table only shows data when the backend request returns in order to avoid that the
	// transient contexts are first shown at the beginning of the table and then moved to the end
	// when backend data is available ("flickering").
	// JIRA: CPOUI5MODELS-884
	QUnit.test("Don't show created contexts at end with pending data request", function (assert) {
		var fnResolve, oTable,
			oModel = createSalesOrdersModel(),
			oResponse = {
				statusCode : 200,
				data : {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
						},
						Note : "Foo",
						ItemPosition : "10",
						SalesOrderID : "1"
					}]
				}
			},
			sView = '\
<t:Table id="table" binding="{/SalesOrderSet(\'1\')}" rows="{ToLineItems}" visibleRowCount="2">\
	<Text id="itemPosition" text="{ItemPosition}" />\
	<Text id="itemNote" text="{Note}" />\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=102", oResponse)
			.expectValue("itemPosition", ["10", ""])
			.expectValue("itemNote", ["Foo", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			that.expectValue("itemNote", "New item", 1);

			oTable.getBinding("rows").create({Note : "New item"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet('2')", {
					SalesOrderID : "2"
				}).expectRequest("SalesOrderSet('2')/ToLineItems?$skip=0&$top=102", {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='2',ItemPosition='22')"
						},
						Note : "Bar",
						ItemPosition : "22",
						SalesOrderID : "2"
					}]
				})
				.expectValue("itemPosition", "22", 0)
				.expectValue("itemNote", ["Bar", ""]);

			oTable.bindElement("/SalesOrderSet('2')");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderSet('1')/ToLineItems?$skip=0&$top=102",
					new Promise(function (resolve) { fnResolve = resolve; })
				)
				.expectValue("itemPosition", "", 0)
				.expectValue("itemNote", "", 0);

			// code under test: unbind + bind with already loaded entity
			oTable.unbindElement();
			oTable.bindElement({
				path : "/SalesOrderSet('1')",
				// prevent reload from server => same scenario as in SalesOrders app
				parameters : {select : "SalesOrderID"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("itemPosition", "10", 0)
				.expectValue("itemNote", ["Foo", "New item"]);

			// code under test: only backend response triggers UI update
			fnResolve(oResponse);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: User interactions (filter, sort, refresh) for a list binding in "Client" mode
	// behave the same as in "Server" mode. During user interactions, transient entries are kept in
	// the creation area. When these entries become created persisted, they are removed from the
	// creation area and are handled as normal persisted entries.
	// JIRA: CPOUI5MODELS-780
["refresh", "filter", "sort"].forEach(function (sAction) {
	QUnit.test("#create with OperationMode.Client: " + sAction, function (assert) {
		var oBinding, oContext,
			oModel = createSalesOrdersModel({defaultOperationMode : "Client"}),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Input id="note" value="{Note}"/>\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Note 1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2",
					Note : "Note 2"
				}]
			})
			.expectValue("note", ["Note 1", "Note 2"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			that.expectValue("note", ["transient", "Note 1", "Note 2"]);

			oContext = oBinding.create({Note : "transient"}, false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["inactive", "Note 1", "Note 2"], 1);

			oBinding.create({Note : "inactive"}, true, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			if (sAction === "refresh") {
				that.expectRequest("SalesOrderSet", {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Note 1"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							SalesOrderID : "2",
							Note : "Note 2"
						}]
					});

				// code under test
				oBinding.refresh();
			} else if (sAction === "filter") {
				that.expectValue("note", ["Note 2"], 2);

				// code under test
				oBinding.filter(new Filter("SalesOrderID", FilterOperator.EQ, "2"));
			} else if (sAction === "sort") {
				that.expectValue("note", ["Note 2", "Note 1"], 2);

				// code under test
				oBinding.sort(new Sorter("SalesOrderID", /*bDescending*/true));
			}

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "transient"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('3')"},
						SalesOrderID : "3",
						Note : "persisted"
					},
					statusCode : 201
				})
				.expectValue("note", "persisted", 0);

			oModel.submitChanges();

			return Promise.all([
				oContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			if (sAction === "refresh") {
				that.expectRequest("SalesOrderSet", {
						results : [{
							__metadata : {uri : "SalesOrderSet('1')"},
							SalesOrderID : "1",
							Note : "Note 1"
						}, {
							__metadata : {uri : "SalesOrderSet('2')"},
							SalesOrderID : "2",
							Note : "Note 2"
						}, {
							__metadata : {uri : "SalesOrderSet('3')"},
							SalesOrderID : "3",
							Note : "persisted"
						}]
					})
					.expectValue("note", ["inactive", "Note 1", "Note 2", "persisted"]);

				// code under test
				oBinding.refresh();
			} else if (sAction === "filter") {
				that.expectValue("note", ["inactive", "Note 1"])
					// "Note 2" in row 3 is unchanged
					.expectValue("note", "persisted", 3);

				// code under test
				oBinding.filter();
			} else if (sAction === "sort") {
				that.expectValue("note", ["inactive", "Note 1"])
					// "Note 2" in row 3 is unchanged
					.expectValue("note", "persisted", 3);

				// code under test
				oBinding.sort();
			}

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: A list binding in "Client" mode has an inactive, a transient and a created
	// persisted item. After switching the list binding's parent context and then switching it back
	// to the initial context, the inactive and transient items are restored and the created
	// persisted item is handled as a normal persisted item outside the creation area. This behaves
	// the same as in "Server" mode.
	// JIRA: CPOUI5MODELS-780
	QUnit.test("#create with OperationMode.Client: switch context", function (assert) {
		var oBinding, oContext,
			oModel = createSalesOrdersModel({defaultOperationMode : "Client"}),
			sView = '\
<FlexBox id="objectPage" binding="{/BusinessPartnerSet(\'42\')}">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<Table id="table" items="{ToSalesOrders}">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet('42')", {
				__metadata : {uri : "BusinessPartnerSet('42')"},
				BusinessPartnerID : "42"
			})
			.expectRequest("BusinessPartnerSet('42')/ToSalesOrders", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					Note : "Note 1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2",
					Note : "Note 2"
				}]
			})
			.expectValue("businessPartnerID", "42")
			.expectValue("salesOrderID", ["1", "2"])
			.expectValue("note", ["Note 1", "Note 2"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			that.expectValue("salesOrderID", ["", "1", "2"])
				.expectValue("note", ["inactive", "Note 1", "Note 2"]);

			oBinding.create({Note : "inactive"}, false, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("salesOrderID", ["", "1", "2"], 1)
				.expectValue("note", ["transient", "Note 1", "Note 2"], 1);

			oContext = oBinding.create({Note : "transient"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerID : "42",
						Note : "transient"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet('42')/ToSalesOrders"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('3')"},
						CustomerID : "42",
						SalesOrderID : "3",
						Note : "persisted"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "3", 1)
				.expectValue("note", "persisted", 1);

			oModel.submitChanges();

			return Promise.all([
				oContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("salesOrderID", ["", "1", "2"], 2)
				.expectValue("note", ["transient", "Note 1", "Note 2"], 2);

			oBinding.create({Note : "transient"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('99')", {
					__metadata : {uri : "BusinessPartnerSet('99')"},
					BusinessPartnerID : "99"
				})
				.expectRequest("BusinessPartnerSet('99')/ToSalesOrders", {
					results : [{
						__metadata : {uri : "SalesOrderSet('11')"},
						SalesOrderID : "11",
						Note : "Note 11"
					}, {
						__metadata : {uri : "SalesOrderSet('12')"},
						SalesOrderID : "12",
						Note : "Note 12"
					}]
				})
				.expectValue("businessPartnerID", "99")
				// TODO: While context change, can we prevent the separate change event for removing
				// first the transient and afterwards the persisted items and do one combined change
				// event instead?
				.expectValue("salesOrderID", ["1", "2"], 2)
				.expectValue("note", ["Note 1", "Note 2"], 2)
				.expectValue("salesOrderID", "2", 2)
				.expectValue("note", "Note 2", 2)
				.expectValue("salesOrderID", ["11", "12"])
				.expectValue("note", ["Note 11", "Note 12"]);

			that.oView.byId("objectPage").bindElement("/BusinessPartnerSet('99')");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet('42')", {
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42"
				})
				.expectRequest("BusinessPartnerSet('42')/ToSalesOrders", {
					results : [{
						__metadata : {uri : "SalesOrderSet('1')"},
						SalesOrderID : "1",
						Note : "Note 1"
					}, {
						__metadata : {uri : "SalesOrderSet('2')"},
						SalesOrderID : "2",
						Note : "Note 2"
					}, {
						__metadata : {uri : "SalesOrderSet('3')"},
						SalesOrderID : "3",
						Note : "persisted"
					}]
				})
				.expectValue("businessPartnerID", "42")
				.expectValue("salesOrderID", ["", "", "1", "2", "3"])
				.expectValue("note", ["inactive", "transient", "Note 1", "Note 2", "persisted"]);

			// code under test
			that.oView.byId("objectPage").bindElement("/BusinessPartnerSet('42')");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: deleting an inactive, a transient and a created persisted item from a list binding
	// in "Client" mode. The binding behaves the same as in "Server" mode.
	// JIRA: CPOUI5MODELS-780
	QUnit.test("#create with OperationMode.Client: delete", function (assert) {
		var oBinding, oContextInactive, oContextPersisted, oContextTransient,
			oModel = createSalesOrdersModel({defaultOperationMode : "Client"}),
			sView = '\
<Table id="table" items="{/SalesOrderSet}">\
	<Text id="note" text="{Note}"/>\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					Note : "from server",
					SalesOrderID : "1"
				}]
			})
			.expectValue("note", ["from server"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			that.expectValue("note", ["inactive", "from server"]);

			oContextInactive = oBinding.create({Note : "inactive"}, /*bAtEnd*/false,
				{inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note", ["persisted", "from server"], 1);

			oContextPersisted = oBinding.create({Note : "persisted"}, /*bAtEnd*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						Note : "persisted"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('2')"},
						Note : "persisted",
						SalesOrderID : "2"
					},
					statusCode : 201
				});

			// code under test
			oModel.submitChanges();

			return Promise.all([
				oContextPersisted.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", ["transient", "from server"], 2);

			oContextTransient = oBinding.create({Note : "transient"}, /*bAtEnd*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					requestUri : "SalesOrderSet('2')"
				}, NO_CONTENT)
				.expectRequest("SalesOrderSet?"
					+ "$filter=not(SalesOrderID eq '2')", {
					results : [{
						__metadata : {uri : "SalesOrderSet('1')"},
						Note : "from server",
						SalesOrderID : "1"
					}]
				})
				.expectValue("note", ["transient", "from server"], 1);

			return Promise.all([
				// code under test
				oContextPersisted.delete({groupId : "$auto"}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", ["from server"], 1);

			return Promise.all([
				// code under test
				oContextTransient.delete(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("note", ["from server"]);

			return Promise.all([
				// code under test
				oContextInactive.delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Calling ODataListBinding#getContexts with bKeepCurrent=true does not have an
	// influence on ODataListBinding#getCurrentContexts.
	// JIRA: CPOUI5MODELS-802
	QUnit.test("ODataListBinding#getContexts: bKeepCurrent=true", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" threshold="0" visibleRowCount="2">\
	<Text id="id" text="{SalesOrderID}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2", {
				results : [{
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1"
				}, {
					__metadata : {uri : "SalesOrderSet('2')"},
					SalesOrderID : "2"
				}]
			})
			.expectValue("id", ["1", "2"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("table"),
				oBinding = oTable.getBinding("rows"),
				aContexts = oBinding.getCurrentContexts();

			// code under test - getContextByIndex is calling getContexts with bKeepCurrent=true
			assert.strictEqual(oTable.getContextByIndex(0), aContexts[0]);

			// code under test
			assert.deepEqual(oBinding.getCurrentContexts(), aContexts);

			assert.throws(function () {
				oBinding.getContexts(/*iStartIndex*/0, /*iLength*/1, /*iMaximumPrefetchSize*/1,
					/*bKeepCurrent*/true);
			}, Error("Unsupported operation: sap.ui.model.odata.v2.ODataListBinding#getContexts,"
				+ " must not use both iMaximumPrefetchSize and bKeepCurrent"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Calling JSONListBinding#getContexts with bKeepCurrent=true does not have an
	// influence on JSONListBinding#getCurrentContexts.
	// JIRA: CPOUI5MODELS-802
	QUnit.test("JSONListBinding#getContexts: bKeepCurrent=true", function (assert) {
		var oModel = new JSONModel({
				data : [{ID : "1"}, {ID : "2"}, {ID : "3"}]
			}),
			sView = '\
<t:Table id="table" rows="{/data}" visibleRowCount="2">\
	<Text id="id" text="{ID}"/>\
</t:Table>',
			that = this;

		this.expectValue("id", ["1", "2"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("table"),
				oBinding = oTable.getBinding("rows"),
				aContexts = oBinding.getCurrentContexts();

			// code under test - getContextByIndex is calling getContexts with bKeepCurrent=true
			assert.strictEqual(oTable.getContextByIndex(0), aContexts[0]);

			// code under test
			assert.deepEqual(oBinding.getCurrentContexts(), aContexts);

			assert.throws(function () {
				oBinding.getContexts(/*iStartIndex*/0, /*iLength*/1, /*iMaximumPrefetchSize*/1,
					/*bKeepCurrent*/true);
			}, Error("Unsupported operation: sap.ui.model.json.JSONListBinding#getContexts, must"
				+ " not use both iMaximumPrefetchSize and bKeepCurrent"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If model data is changed that affects a list binding's filter, then the attached
	// control need to be notified about the changes via a change-event.
	// BCP: 2270146962
	QUnit.test("ClientListBinding#getContexts", function (assert) {
		var oModel = new JSONModel({
				tiles : [
					{ID : "1", visible : true},
					{ID : "2", visible : false},
					{ID : "3", visible : true}
				]
			}),
			sView = '\
<f:GridContainer id="grid" width="100%"\
	items="{\
		path : \'/tiles\',\
		filters : [{path : \'visible\', operator : \'EQ\', value1 : true}]\
	}">\
	<f:layout>\
		<f:GridContainerSettings rowSize="10rem" columnSize="10rem" gap="2rem"/>\
	</f:layout>\
	<GenericTile header="{ID}"/>\
</f:GridContainer>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oGrid = that.oView.byId("grid"),
				aItems = oGrid.getItems();

			assert.strictEqual(aItems.length, 2, "grid shows 2 tiles");
			assert.strictEqual(aItems[0].getBindingContext().getProperty("ID"), "1");
			assert.strictEqual(aItems[1].getBindingContext().getProperty("ID"), "3");

			// change visibility of a tile so grid shows only one tile
			oModel.setProperty("/tiles/2/visible", false);

			aItems = oGrid.getItems();
			assert.strictEqual(aItems.length, 1, "grid shows 1 tile");
			assert.strictEqual(aItems[0].getBindingContext().getProperty("ID"), "1");

			// change visibility of a tile so grid shows 2 tiles again
			oModel.setProperty("/tiles/1/visible", true);

			aItems = oGrid.getItems();
			assert.strictEqual(aItems.length, 2, "grid shows 2 tiles");
			assert.strictEqual(aItems[0].getBindingContext().getProperty("ID"), "1");
			assert.strictEqual(aItems[1].getBindingContext().getProperty("ID"), "2");
		});
	});

	//*********************************************************************************************
	// Scenario: Calling XMLListBinding#getContexts with bKeepCurrent=true does not have an
	// influence on XMLListBinding#getCurrentContexts.
	// JIRA: CPOUI5MODELS-802
	QUnit.test("XMLListBinding#getContexts: bKeepCurrent=true", function (assert) {
		var oModel = new XMLModel(),
			sView = '\
<t:Table id="table" rows="{/data}" visibleRowCount="2">\
	<Text id="id" text="{@ID}"/>\
</t:Table>',
			that = this;

		oModel.setXML('<?xml version="1.0"?><root><data ID="1" /><data ID="2" /><data ID="3" />'
			+ '</root>');
		this.expectValue("id", ["1", "2"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("table"),
				oBinding = oTable.getBinding("rows"),
				aContexts = oBinding.getCurrentContexts();

			// code under test - getContextByIndex is calling getContexts with bKeepCurrent=true
			assert.strictEqual(oTable.getContextByIndex(0), aContexts[0]);

			// code under test
			assert.deepEqual(oBinding.getCurrentContexts(), aContexts);

			assert.throws(function () {
				oBinding.getContexts(/*iStartIndex*/0, /*iLength*/1, /*iMaximumPrefetchSize*/1,
					/*bKeepCurrent*/true);
			}, Error("Unsupported operation: sap.ui.model.xml.XMLListBinding#getContexts, must not"
				+ " use both iMaximumPrefetchSize and bKeepCurrent"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Calling MessageListBinding#getContexts with bKeepCurrent=true does not have an
	// influence on MessageListBinding#getCurrentContexts. MessageListBinding#getCurrentContexts
	// returns only the messages that have been requested with the last call of
	// MessageListBinding#getContexts.
	// JIRA: CPOUI5MODELS-802
	QUnit.test("MessageListBinding#getContexts: bKeepCurrent=true", function (assert) {
		var aMessages = [
				new Message({code : "1"}),
				new Message({code : "2"}),
				new Message({code : "3"})
			],
			oModel = new MessageModel(),
			sView = '\
<t:Table id="table" rows="{/}" visibleRowCount="2">\
	<Text id="code" text="{code}"/>\
</t:Table>',
			that = this;

		oModel.setData(aMessages);
		this.expectValue("code", ["1", "2"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("table"),
				oBinding = oTable.getBinding("rows"),
				aContexts = oBinding.getCurrentContexts();

			// code under test - only the context for the visible rows are returned
			assert.strictEqual(aContexts.length, 2);

			// code under test - getContextByIndex is calling getContexts with bKeepCurrent=true
			assert.strictEqual(oTable.getContextByIndex(0), aContexts[0]);

			// code under test
			assert.deepEqual(oBinding.getCurrentContexts(), aContexts);

			assert.throws(function () {
				oBinding.getContexts(/*iStartIndex*/0, /*iLength*/1, /*iMaximumPrefetchSize*/1,
					/*bKeepCurrent*/true);
			}, Error("Unsupported operation: sap.ui.model.message.MessageListBinding#getContexts,"
				+ " must not use both iMaximumPrefetchSize and bKeepCurrent"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A not yet initialized ODataListBinding (with transient context) is getting
	// initialized after the entity of its parent ODataContextBinding which has the empty binding
	// path and thus the transient context as element context got persisted.
	// BCP: 002075129400002462642022
	QUnit.test("ODataListBinding with created parent context initializes", function (assert) {
		var oContext,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<Text id="companyName" text="{CompanyName}"/>\
	<t:Table id="table" visibleRowCount="2">\
		<Text id="salesOrderID" text="{SalesOrderID}"/>\
		<Input id="note" value="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oObjectPage = that.oView.byId("objectPage"),
				oTable = that.oView.byId("table");

			that.expectValue("companyName", "SAP");

			// ODataContextBinding must be created first!
			oObjectPage.bindObject("", {select : "BusinessPartnerID,CompanyName"});
			oContext = oModel.createEntry("/BusinessPartnerSet", {
				properties : {CompanyName : "SAP"}
			});
			oObjectPage.setBindingContext(oContext);
			// in the ticket scenario a failed $batch caused a #checkUpdate on the bindings; for
			// simplicity a #updateBindings leads to the same binding behavior
			oModel.updateBindings();
			oTable.bindRows("ToSalesOrders");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.BusinessPartner"},
						CompanyName : "SAP"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet"
				}, {
					data : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						BusinessPartnerID : "42",
						CompanyName : "SAP"
					},
					statusCode : 201
				})
				.expectValue("businessPartnerID", "42")
				.expectRequest("BusinessPartnerSet('42')/ToSalesOrders?$skip=0&$top=102", {
					results : [{
						__metadata : {uri : "SalesOrderSet('1')"},
						SalesOrderID : "1",
						Note : "Note 1"
					}, {
						__metadata : {uri : "SalesOrderSet('2')"},
						SalesOrderID : "2",
						Note : "Note 2"
					}]
				})
				.expectValue("salesOrderID", ["1", "2"])
				.expectValue("note", ["Note 1", "Note 2"]);

			oModel.submitChanges();

			return Promise.all([
				oContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: A table using ODataTreeBindingFlat with restoreTreeStateAfterChange=true correctly
	// restores the tree state for property and hierarchy changes, regardless of whether
	// refreshAfterChange is true or false.
	// JIRA: CPOUI5MODELS-958
	// Scenario: To perform hierarchy changes ODataModel#submitChanges can be used. For simple property
	// changes a refresh/restoreTreeState is not needed.
	// JIRA: CPOUI5MODELS-745
[false, true].forEach(function (bRefreshAfterChange) {
	var sTitle = "ODataTreeBindingFlat: ODataModel#submitChanges for refreshAfterChange="
			+ bRefreshAfterChange + " and restoreTreeStateAfterChange=true";

	QUnit.test(sTitle, function (assert) {
		var oBinding, oTable,
			oModel = createHierarchyMaintenanceModel({refreshAfterChange : bRefreshAfterChange}),
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "foo",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "bar",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "baz",
				HierarchyNode : "300",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 1,
				HierarchySiblingRank : 1
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0,\
				restoreTreeStateAfterChange : true\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="3">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [oNode100]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "2",
					results : [oNode200, oNode300]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			oBinding = oTable.getBinding("rows");

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"]]);

			this.expectRequest({
					batchNo : 3,
					method : "DELETE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				})
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [oNode200]
				});

			// code under test: hierarchy change
			oBinding.removeContext(oTable.getContextByIndex(2));
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""]]);

			this.expectRequest({
					batchNo : 5,
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
						ErhaOrderItemName : "bar: renamed"
					},
					deepPath : "/ErhaOrder('1')/to_Item(ErhaOrder='1',ErhaOrderItem='200')",
					key : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')",
					method : "MERGE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"
				}, NO_CONTENT);

			// code under test: property change
			oModel.setProperty("ErhaOrderItemName", "bar: renamed", oTable.getContextByIndex(1));
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar: renamed"], [""]]);
		});
	});
});

	/** @deprecated As of version 1.104.0 */
	//*********************************************************************************************
	// Scenario: A table using ODataTreeBindingFlat with restoreTreeStateAfterChange=true correctly
	// restores the tree state for property and hierarchy changes, regardless of whether
	// refreshAfterChange is true or false.
	// JIRA: CPOUI5MODELS-958
	// Scenario: To perform hierarchy changes ODataTreeBinding#submitChanges can be used. For simple property
	// changes a refresh/restoreTreeState is needed.
	// JIRA: CPOUI5MODELS-745
[false, true].forEach(function (bRefreshAfterChange) {
	var sTitle = "ODataTreeBindingFlat: ODataTreeBindingFlat#submitChanges for refreshAfterChange="
			+ bRefreshAfterChange + " and restoreTreeStateAfterChange=true";

	QUnit.test(sTitle, function (assert) {
		var oBinding, oTable,
			oModel = createHierarchyMaintenanceModel({refreshAfterChange : bRefreshAfterChange}),
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "foo",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "bar",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "baz",
				HierarchyNode : "300",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 1,
				HierarchySiblingRank : 1
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0,\
				restoreTreeStateAfterChange : true\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="3">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [oNode100]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "2",
					results : [oNode200, oNode300]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			oBinding = oTable.getBinding("rows");

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"]]);

			this.expectRequest({
					batchNo : 3,
					method : "DELETE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				})
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [oNode200]
				});

			// code under test: hierarchy change
			oBinding.removeContext(oTable.getContextByIndex(2));
			oBinding.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""]]);

			this.expectRequest({
					batchNo : 5,
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
						ErhaOrderItemName : "bar: renamed"
					},
					deepPath : "/ErhaOrder('1')/to_Item(ErhaOrder='1',ErhaOrderItem='200')",
					key : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')",
					method : "MERGE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 6,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				})
				.expectRequest({
					batchNo : 6,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [Object.assign(oNode200, {ErhaOrderItemName : "bar: renamed"})]
				});

			// code under test: property change
			oModel.setProperty("ErhaOrderItemName", "bar: renamed", oTable.getContextByIndex(1));
			oBinding.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar: renamed"], [""]]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: A table using ODataTreeBindingFlat with refreshAfterChange=false and
	// restoreTreeStateAfterChange=false. After property / hierarchy changes have been submitted the
	// binding gets refreshed.
	// JIRA: CPOUI5MODELS-959
	// Scenario: To perform hierarchy changes ODataModel#submitChanges can be used. For simple property
	// changes a refresh/restoreTreeState is not needed.
	// JIRA: CPOUI5MODELS-745
	QUnit.test("ODataTreeBindingFlat: ODataModel#submitChanges for refreshAfterChange=false and "
			+ "restoreTreeStateAfterChange=false", function (assert) {
		var oBinding, oTable,
			oModel = createHierarchyMaintenanceModel({refreshAfterChange : false}),
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "foo",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "bar",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "baz",
				HierarchyNode : "300",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 1,
				HierarchySiblingRank : 1
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="3">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [oNode100]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "2",
					results : [oNode200, oNode300]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			oBinding = oTable.getBinding("rows");

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"]]);

			this.expectRequest({
					batchNo : 3,
					method : "DELETE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				});

			// code under test: hierarchy change
			oBinding.removeContext(oTable.getContextByIndex(2));
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			// binding gets refreshed, no restore tree state
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 5,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [oNode200]
				});

			// manually expand the node again
			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""]]);

			this.expectRequest({
					batchNo : 6,
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
						ErhaOrderItemName : "bar: renamed"
					},
					deepPath : "/ErhaOrder('1')/to_Item(ErhaOrder='1',ErhaOrderItem='200')",
					key : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')",
					method : "MERGE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"
				}, NO_CONTENT);

			// code under test: property change
			oModel.setProperty("ErhaOrderItemName", "bar: renamed", oTable.getContextByIndex(1));
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar: renamed"], [""]]);
		});
	});

	/** @deprecated As of version 1.104.0 */
	//*********************************************************************************************
	// Scenario: A table using ODataTreeBindingFlat with refreshAfterChange=false and
	// restoreTreeStateAfterChange=false. After property / hierarchy changes have been submitted the
	// binding gets refreshed.
	// JIRA: CPOUI5MODELS-959
	// Scenario: To perform hierarchy changes ODataTreeBinding#submitChanges can be used. For simple property
	// changes a refresh/restoreTreeState is needed.
	// JIRA: CPOUI5MODELS-745
	QUnit.test("ODataTreeBindingFlat: ODataTreeBindingFlat#submitChanges for refreshAfterChange=false and "
			+ "restoreTreeStateAfterChange=false", function (assert) {
		var oBinding, oTable,
			oModel = createHierarchyMaintenanceModel({refreshAfterChange : false}),
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "foo",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "bar",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "baz",
				HierarchyNode : "300",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 1,
				HierarchySiblingRank : 1
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="3">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [oNode100]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "2",
					results : [oNode200, oNode300]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			oBinding = oTable.getBinding("rows");

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"]]);

			this.expectRequest({
					batchNo : 3,
					method : "DELETE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				});

			// code under test: hierarchy change
			oBinding.removeContext(oTable.getContextByIndex(2));
			oBinding.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			// binding gets refreshed, no restore tree state
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 5,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [oNode200]
				});

			// manually expand the node again
			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""]]);

			this.expectRequest({
					batchNo : 6,
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
						ErhaOrderItemName : "bar: renamed"
					},
					deepPath : "/ErhaOrder('1')/to_Item(ErhaOrder='1',ErhaOrderItem='200')",
					key : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')",
					method : "MERGE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 7,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				});

			// code under test: property change
			oModel.setProperty("ErhaOrderItemName", "bar: renamed", oTable.getContextByIndex(1));
			oBinding.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			// binding gets refreshed, no restore tree state
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);
		});
	});

	//*********************************************************************************************
	// Scenario: A table using ODataTreeBindingFlat with refreshAfterChange=true and
	// restoreTreeStateAfterChange=false. After property / hierarchy changes have been submitted
	// via ODataModel#submitChanges the binding gets refreshed only once via <code>refreshAfterChange</code>.
	// JIRA: CPOUI5MODELS-970
	QUnit.test("ODataTreeBindingFlat: ODataModel#submitChanges for refreshAfterChange=true and "
			+ "restoreTreeStateAfterChange=false", function (assert) {
		var oBinding, oTable,
			oModel = createHierarchyMaintenanceModel({refreshAfterChange : true}),
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "foo",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "bar",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "baz",
				HierarchyNode : "300",
				HierarchyParentNode : "200",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 2,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="3">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [oNode100]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [oNode200]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""]]);

			this.expectRequest({
					batchNo : 3,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '200'"
				}, {
					__count : "1",
					results : [oNode300]
				});

			oTable.expand(1);

			return this.waitForChanges(assert);
		}).then(() => {
			var oMoveContext = oTable.getContextByIndex(2),
				oParentContext = oTable.getContextByIndex(0);

			oBinding = oTable.getBinding("rows");

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"]]);

			this.expectRequest({
					batchNo : 4,
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
						HierarchyParentNode : "100"
					},
					deepPath : "/ErhaOrder('1')/to_Item(ErhaOrder='1',ErhaOrderItem='300')",
					key : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')",
					method : "MERGE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				}); // binding gets refreshed

			// code under test: hierarchy change
			oBinding.removeContext(oMoveContext);
			oBinding.addContexts(oParentContext, [oMoveContext]);
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			// binding gets refreshed
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);

			this.expectRequest({
					batchNo : 5,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [oNode200]
				});

			// manually expand the node again
			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""]]);

			this.expectRequest({
					batchNo : 6,
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
						ErhaOrderItemName : "bar: renamed"
					},
					deepPath : "/ErhaOrder('1')/to_Item(ErhaOrder='1',ErhaOrderItem='200')",
					key : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')",
					method : "MERGE",
					requestUri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"
				}, NO_CONTENT)
				.expectRequest({
					batchNo : 6,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [oNode100]
				});

			// code under test: property change
			oModel.setProperty("ErhaOrderItemName", "bar: renamed", oTable.getContextByIndex(1));
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			// binding gets refreshed, no restore tree state
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""]]);
		});
	});

	//*********************************************************************************************
	// Scenario: It has to be possible to change a property with Edm.Time type to a different value
	// and after that back again to the value returned by the server.
	// Case: 223397/2022 (002075129500002233972022)
	QUnit.test("Reverting Edm.Time value is possible", function (assert) {
		var oModel = createSpecialCasesModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<FlexBox id="objectPage" binding="{/Employees(\'Foo\')}">\
	<TimePicker id="time" value="{\
		formatOptions : {pattern: \'HH:mm\'},\
		path : \'Time\',\
		type : \'sap.ui.model.odata.type.Time\'\
	}" maskMode="On"/>\
</FlexBox>',
		that = this;

		this.expectHeadRequest()
			.expectRequest("Employees('Foo')", {
				ID : "Foo",
				Time : { // parse from "PT00H01M00S"
					ms : 60000,
					__edmType : "Edm.Time"
				}
			})
			.expectValue("time", "00:01");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectValue("time", "00:02");

			// code under test
			that.oView.byId("time").setValue("00:02");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oModel.getProperty("/Employees('Foo')/Time"),
				{ms : 120000, __edmType : "Edm.Time"}, "PT00H02M00S");

			that.expectValue("time", "00:01");

			// code under test
			that.oView.byId("time").setValue("00:01");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oModel.getProperty("/Employees('Foo')/Time"),
				{ms : 60000, __edmType : "Edm.Time"}, "PT00H01M00S");

			that.expectValue("time", "00:03");

			// code under test
			that.oView.byId("time").setValue("00:03");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oModel.getProperty("/Employees('Foo')/Time"),
				{ms : 180000, __edmType : "Edm.Time"}, "PT00H03M00S");

			that.expectRequest("Employees('Foo')", {
					ID : "Foo",
					Time : { // parsed value for "PT00H03M00S"
						ms : 180000,
						__edmType : "Edm.Time"
					}
				});

			// code under test - reading the same value as locally set from the server
			that.oView.byId("objectPage").getElementBinding().refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(oModel.getProperty("/Employees('Foo')/Time"),
				{ms : 180000, __edmType : "Edm.Time"}, "PT00H03M00S");
			assert.strictEqual(oModel.hasPendingChanges(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: ODataModel#hasPendingChanges, ODataModel#getPendingChanges and
	// ODataModel#resetChanges work also if there is a table using ODataTreeBindingFlat. These APIs
	// properly handle added, moved and removed nodes and also the special case of a cancelled
	// creation.
	// JIRA: CPOUI5MODELS-977
	QUnit.test("ODataModel#hasPendingChanges|#getPendingChanges|#resetChanges: works also if "
			+ "ODataTreeBindingFlat is used", function (assert) {
		var oBinding, oCancelledContext, sKey, oPendingChanges, oTable,
			oModel = createHierarchyMaintenanceModel(),
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "foo",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "bar",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "baz",
				HierarchyNode : "300",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 1,
				HierarchySiblingRank : 1
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0,\
				restoreTreeStateAfterChange : true\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="4">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [oNode100]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "2",
					results : [oNode200, oNode300]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			var oCreatedContext, oExpectedEntry;

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"], [""]]);
			assert.strictEqual(oModel.hasPendingChanges(), false);
			assert.deepEqual(oModel.getPendingChanges(), {});

			// code under test: add node
			oCreatedContext = oBinding.createEntry({properties : {ErhaOrderItemName : "qux"}});
			oBinding.addContexts(oTable.getContextByIndex(0), [oCreatedContext]);

			assert.strictEqual(oModel.hasPendingChanges(), true);
			oPendingChanges = oModel.getPendingChanges();
			assert.notDeepEqual(oPendingChanges, {});
			for (sKey in oPendingChanges) {
				assert.strictEqual("/" + sKey, oCreatedContext.getPath());
				oExpectedEntry = oCreatedContext.getObject();
				oExpectedEntry.HierarchyParentNode = "100";
				assert.deepEqual(oPendingChanges[sKey], oExpectedEntry);
			}

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["qux"], ["bar"], ["baz"]]);

			// code under test: reset added node
			oModel.resetChanges();

			assert.strictEqual(oModel.hasPendingChanges(), false);
			assert.deepEqual(oModel.getPendingChanges(), {});

			return this.waitForChanges(assert);
		}).then(() => {
			var oMovedContext = oTable.getContextByIndex(2);

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"], [""]]);

			// code under test: move node
			oBinding.removeContext(oMovedContext);
			oBinding.addContexts(oTable.getContextByIndex(1), [oMovedContext]);

			assert.strictEqual(oModel.hasPendingChanges(), true);
			oPendingChanges = oModel.getPendingChanges();
			assert.notDeepEqual(oPendingChanges, {});
			for (sKey in oPendingChanges) {
				assert.strictEqual("/" + sKey, oMovedContext.getPath());
				assert.deepEqual(oPendingChanges[sKey], {HierarchyParentNode : "200"});
			}

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""], [""]]);

			// code under test: reset moved node
			oModel.resetChanges();

			assert.strictEqual(oModel.hasPendingChanges(), false);
			assert.deepEqual(oModel.getPendingChanges(), {});

			return this.waitForChanges(assert);
		}).then(() => {
			var oRemovedContext = oTable.getContextByIndex(2);

			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"], [""]]);

			// code under test: remove node
			oBinding.removeContext(oRemovedContext);

			assert.strictEqual(oModel.hasPendingChanges(), true);
			oPendingChanges = oModel.getPendingChanges();
			assert.notDeepEqual(oPendingChanges, {});
			for (sKey in oPendingChanges) {
				assert.strictEqual("/" + sKey, oRemovedContext.getPath());
				assert.deepEqual(oPendingChanges[sKey], {});
			}

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], [""], [""]]);

			// code under test: reset removed node
			oModel.resetChanges();

			assert.strictEqual(oModel.hasPendingChanges(), false);
			assert.deepEqual(oModel.getPendingChanges(), {});

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"], [""]]);

			// code under test: cancelled creation (add)
			oCancelledContext = oBinding.createEntry({properties : {ErhaOrderItemName : "qux2"}});
			oBinding.addContexts(oTable.getContextByIndex(0), [oCancelledContext]);

			// #hasPendingChanges and #getPendingChanges tested in "added case"

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["qux2"], ["bar"], ["baz"]]);

			// code under test: cancelled creation (remove)
			oBinding.removeContext(oCancelledContext);

			assert.strictEqual(oModel.hasPendingChanges(), false);
			assert.deepEqual(oModel.getPendingChanges(), {});

			// code under test: no request as created entry has been removed again
			oModel.submitChanges();

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"], ["baz"], [""]]);
		});
	});

	//*********************************************************************************************
	// Scenario: If a node A is collapsed by the user and a node B below node A is expanded and
	// thereby loads deep nodes, then the binding length is correctly calculated.
	// BCP: 002075129400005773722022
	QUnit.test("ODataTreeBindingFlat: binding length is correct", function (assert) {
		var oBinding, oTable,
			oModel = createHierarchyMaintenanceModel(),
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 1,\
				restoreTreeStateAfterChange : true\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="3">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 1"
			}, {
				__count : "4",
				results : [{
					__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='099')"},
					ErhaOrder : "1",
					ErhaOrderItem : "099",
					ErhaOrderItemName : "099",
					HierarchyParentNode : "",
					HierarchyDescendantCount : 0,
					HierarchyDistanceFromRoot : 0,
					HierarchyDrillState : "leaf",
					HierarchyNode : "099",
					HierarchyPreorderRank : 0,
					HierarchySiblingRank : 0
				}, {
					__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
					ErhaOrder : "1",
					ErhaOrderItem : "100",
					ErhaOrderItemName : "100",
					HierarchyParentNode : "",
					HierarchyDescendantCount : 1,
					HierarchyDistanceFromRoot : 0,
					HierarchyDrillState : "expanded",
					HierarchyNode : "100",
					HierarchyPreorderRank : 1,
					HierarchySiblingRank : 1
				}, {
					__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='110')"},
					ErhaOrder : "1",
					ErhaOrderItem : "110",
					ErhaOrderItemName : "110",
					HierarchyParentNode : "100",
					HierarchyDescendantCount : 0,
					HierarchyDistanceFromRoot : 1,
					HierarchyDrillState : "collapsed",
					HierarchyNode : "110",
					HierarchyPreorderRank : 2,
					HierarchySiblingRank : 0
				}, {
					__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
					ErhaOrder : "1",
					ErhaOrderItem : "200",
					ErhaOrderItemName : "200",
					HierarchyParentNode : "",
					HierarchyDescendantCount : 1,
					HierarchyDistanceFromRoot : 0,
					HierarchyDrillState : "collapsed",
					HierarchyNode : "200",
					HierarchyPreorderRank : 3,
					HierarchySiblingRank : 2
				}]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["099"], ["100"], ["110"]]);
			assert.strictEqual(oBinding.isExpanded(1), true, "row 2 expanded");
			assert.strictEqual(oBinding.isExpanded(3), false, "row 4 collapsed");
			assert.strictEqual(oBinding.getLength(), 4, "initial binding length is 3");

			return this.waitForChanges(assert);
		}).then(() => {
			// code under test
			oBinding.collapse(1);

			assert.strictEqual(oBinding.getLength(), 3,
				"first collapse reduces binding length to 3");

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["099"], ["100"], ["200"]]);
			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=103&$inlinecount=allpages&"
						+ "$filter=HierarchyParentNode eq '200'"
				}, {
					__count : 1,
					results : [{
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='210')"},
						ErhaOrder : "1",
						ErhaOrderItem : "210",
						ErhaOrderItemName : "baz",
						HierarchyParentNode : "200",
						HierarchyDescendantCount : 0,
						HierarchyDistanceFromRoot : 1,
						HierarchyDrillState : "collapsed",
						HierarchyNode : "210",
						HierarchyPreorderRank : 0,
						HierarchySiblingRank : 0
					}]
				});

			// code under test
			oBinding.expand(2);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["099"], ["100"], ["200"]]);
			assert.strictEqual(oBinding.isExpanded(2), true, "row 2 expanded");
			assert.strictEqual(oBinding.getLength(), 4,
				"expand of row 2 increases binding length to 4");
		});
	});

	//*********************************************************************************************
	// Scenario: If a new node B is added to a leaf node A and the former leaf node A is expanded,
	// ensure that the node A is also expanded while restoring the tree state after data is
	// submitted.
	// JIRA: CPOUI5MODELS-831
	QUnit.test("ODataTreeBindingFlat: restore tree for nodes added to a leaf", function (assert) {
		var oBinding, oCreatedContext, oTable,
			oModel = createHierarchyMaintenanceModel(),
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0,\
				restoreTreeStateAfterChange : true\
			},\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\'\
		}"\
		visibleRowCount="2">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=102&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
			}, {
				__count : "1",
				results : [{
					__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
					ErhaOrder : "1",
					ErhaOrderItem : "100",
					ErhaOrderItemName : "foo",
					HierarchyParentNode : "",
					HierarchyDescendantCount : 0,
					HierarchyDistanceFromRoot : 0,
					HierarchyDrillState : "leaf",
					HierarchyNode : "100",
					HierarchyPreorderRank : 0,
					HierarchySiblingRank : 0
				}]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["foo"], [""]]);

			// code under test: add node
			oCreatedContext = oBinding.createEntry({
				properties : {ErhaOrderItemName : "bar", HierarchyNode : "~key~"}});
			oBinding.addContexts(oTable.getContextByIndex(0), [oCreatedContext]);

			assert.strictEqual(oBinding.isExpanded(0), false);

			return this.waitForChanges(assert);
		}).then(() => {
			// code under test
			oTable.expand(0);

			assert.strictEqual(oBinding.isExpanded(0), true);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"]]);

			this.expectRequest({ // POST for entity creation
					batchNo : 2,
					created : true,
					data : {
						ErhaOrderItemName : "bar",
						HierarchyNode : "~key~",
						HierarchyParentNode : "100",
						__metadata: {type : "cds_zrh_erhaordermanage.ErhaOrderItemType"}
					},
					method : "POST",
					requestUri : "ErhaOrder('1')/to_Item"
				}, {
					data : {
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='110')"},
						ErhaOrder : "1",
						ErhaOrderItem : "110",
						ErhaOrderItemName : "bar",
						HierarchyParentNode : "100",
						HierarchyDescendantCount : 0,
						HierarchyDistanceFromRoot : 1,
						HierarchyDrillState : "leaf",
						HierarchyNode : "110",
						HierarchyPreorderRank : 1,
						HierarchySiblingRank : 0
					},
					statusCode : 201
				})
				.expectRequest({ // request to check whether the new node is a deep node
					batchNo : 3,
					requestUri : "ErhaOrder('1')/to_Item?"
						+ "$select=ErhaOrder,ErhaOrderItem,HierarchyNode,HierarchyDescendantCount,"
						+ "HierarchyDrillState,HierarchyPreorderRank"
						+ "&$filter=ErhaOrder eq '1' and ErhaOrderItem eq '110' "
						+ "and HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [{
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
						ErhaOrder : "1",
						ErhaOrderItem : "100",
						HierarchyDescendantCount : 0,
						HierarchyDrillState : "collapsed",
						HierarchyNode : "100",
						HierarchyPreorderRank : 0
					}]
				})
				.expectRequest({ // re-read server index nodes
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "1",
					results : [{
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
						ErhaOrder : "1",
						ErhaOrderItem : "100",
						ErhaOrderItemName : "foo",
						HierarchyParentNode : "",
						HierarchyDescendantCount : 0,
						HierarchyDistanceFromRoot : 0,
						HierarchyDrillState : "collapsed",
						HierarchyNode : "100",
						HierarchyPreorderRank : 0,
						HierarchySiblingRank : 0
					}]
				})
				.expectRequest({ // read children of the node to which the new node is added
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=1&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
				}, {
					__count : "1",
					results : [{
						__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='110')"},
						ErhaOrder : "1",
						ErhaOrderItem : "110",
						ErhaOrderItemName : "bar",
						HierarchyParentNode : "100",
						HierarchyDescendantCount : 0,
						HierarchyDistanceFromRoot : 1,
						HierarchyDrillState : "leaf",
						HierarchyNode : "110",
						HierarchyPreorderRank : 0,
						HierarchySiblingRank : 0
					}]
				});

			// code under test
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext.created(),
				this.waitForChanges(assert)
			]);
		}).then(function () {
			assert.deepEqual(getTableContent(oTable), [["foo"], ["bar"]]);
			assert.strictEqual(oBinding.isExpanded(0), true, "expanded state is restored");
		});
	});

	//*********************************************************************************************
	// Scenario: All read requests of the ODataTreeBindingFlat, consider "transitionMessagesOnly" parameter.
	// Contexts are created with deep path information that messages can be assigned properly to the rows.
	// JIRA: CPOUI5MODELS-1437, CPOUI5MODELS-1453
	QUnit.test("ODataTreeBindingFlat: transitionMessagesOnly and messages", function (assert) {
		const oModel = createHierarchyMaintenanceModel();
		const oMessageItem0 = this.createResponseMessage("to_Item(ErhaOrder='1',ErhaOrderItem='0')/ErhaOrderItem");
		const oMessageItem100 = this.createResponseMessage("to_Item(ErhaOrder='1',ErhaOrderItem='1.0.0')"
			+ "/ErhaOrderItem");
		let oTable;
		const sView = '\
<VBox binding="{/ErhaOrder(\'1\')}">\
<t:TreeTable id="table"\
		rows="{\
			parameters: {countMode: \'Inline\', numberOfExpandedLevels: 1, transitionMessagesOnly: true},\
			path: \'to_Item\'\
		}"\
		visibleRowCount="4">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>\
</VBox>';

		this.expectHeadRequest()
			.expectRequest("ErhaOrder('1')", {
				__metadata: {uri: "/ErhaOrder('1')"},
				ErhaOrder: "1"
			}, {"sap-message" : getMessageHeader([oMessageItem0, oMessageItem100])})
			.expectRequest({ // triggered by ODataTreeBindingFlat#_requestServerIndexNodes
				batchNo: 2,
				headers: {"sap-messages": "transientOnly"},
				requestUri: "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 1"
			}, {
				__count: "4",
				results: [{
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='0')"},
					ErhaOrder: "1",
					ErhaOrderItem: "0",
					ErhaOrderItemName: "0",
					HierarchyParentNode: "",
					HierarchyDescendantCount: 0,
					HierarchyDistanceFromRoot: 0,
					HierarchyDrillState: "leaf",
					HierarchyNode: "0",
					HierarchyPreorderRank: 0,
					HierarchySiblingRank: 0
				}, {
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1",
					ErhaOrderItemName: "1",
					HierarchyParentNode: "",
					HierarchyDescendantCount: 2,
					HierarchyDistanceFromRoot: 0,
					HierarchyDrillState: "expanded",
					HierarchyNode: "1",
					HierarchyPreorderRank: 1,
					HierarchySiblingRank: 1
				}, {
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.0')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1.0",
					ErhaOrderItemName: "1.0",
					HierarchyParentNode: "1",
					HierarchyDescendantCount: 0,
					HierarchyDistanceFromRoot: 1,
					HierarchyDrillState: "collapsed",
					HierarchyNode: "1.0",
					HierarchyPreorderRank: 2,
					HierarchySiblingRank: 0
				}, {
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.1')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1.1",
					ErhaOrderItemName: "1.1",
					HierarchyParentNode: "1",
					HierarchyDescendantCount: 0,
					HierarchyDistanceFromRoot: 1,
					HierarchyDrillState: "leaf",
					HierarchyNode: "1.1",
					HierarchyPreorderRank: 3,
					HierarchySiblingRank: 1
				}]
			})
			.expectMessages([{
				code : oMessageItem0.code,
				fullTarget : "/ErhaOrder(\'1\')/to_Item(ErhaOrder='1',ErhaOrderItem='0')/ErhaOrderItem",
				message : oMessageItem0.message,
				persistent : false,
				target : "/ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='0')/ErhaOrderItem",
				type : mSeverityMap[oMessageItem0.severity]
			}, {
				code : oMessageItem100.code,
				fullTarget : "/ErhaOrder(\'1\')/to_Item(ErhaOrder='1',ErhaOrderItem='1.0.0')/ErhaOrderItem",
				message : oMessageItem100.message,
				persistent : false,
				target : "/ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.0.0')/ErhaOrderItem",
				type : mSeverityMap[oMessageItem100.severity]
			}]);

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"], ["1.0"], ["1.1"]]);

			let aMessages = oTable.getBindingContext().getMessages();
			assert.strictEqual(aMessages.length, 2);
			assert.strictEqual(aMessages[0].code, oMessageItem0.code);
			assert.strictEqual(aMessages[1].code, oMessageItem100.code);
			// one message for ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='0')
			aMessages = oTable.getRows()[0].getBindingContext().getMessages();
			assert.strictEqual(aMessages.length, 1);
			assert.strictEqual(aMessages[0].code, oMessageItem0.code);
			// no messages for ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1')
			assert.deepEqual(oTable.getRows()[1].getBindingContext().getMessages(), []);

			this.expectRequest({ // triggered by ODataTreeBindingFlat#_requestChildren
					batchNo: 3,
					headers: {"sap-messages": "transientOnly"},
					requestUri: "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '1.0'"
				}, {
					__count: "1",
					results: [{
						__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.0.0')"},
						ErhaOrder: "1",
						ErhaOrderItem: "1.0.0",
						ErhaOrderItemName: "1.0.0",
						HierarchyParentNode: "1.0",
						HierarchyDescendantCount: 0,
						HierarchyDistanceFromRoot: 2,
						HierarchyDrillState: "leaf",
						HierarchyNode: "1.0.0",
						HierarchyPreorderRank: 0,
						HierarchySiblingRank: 0
					}]
				});

			// code under test
			oTable.expand(2);

			return this.waitForChanges(assert, "expand node '1.0'");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"], ["1.0"], ["1.0.0"]]);
			// one message for ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.0.0')
			const aMessages = oTable.getRows()[3].getBindingContext().getMessages();
			assert.strictEqual(aMessages.length, 1);
			assert.strictEqual(aMessages[0].code, oMessageItem100.code);

			// code under test
			oTable.collapse(1);

			return this.waitForChanges(assert, "collapse node '1'");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"], [""], [""]]);

			this.expectRequest({ // triggered by ODataTreeBindingFlat#_requestSubTree
				batchNo: 4,
				headers: {"sap-messages": "transientOnly"},
				requestUri: "ErhaOrder('1')/to_Item?$filter=HierarchyNode eq '1' and HierarchyDistanceFromRoot le 2"
			}, {
				__count: "3",
				results: [{
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1",
					ErhaOrderItemName: "1",
					HierarchyParentNode: "",
					HierarchyDescendantCount: 3,
					HierarchyDistanceFromRoot: 0,
					HierarchyDrillState: "expanded",
					HierarchyNode: "1",
					HierarchyPreorderRank: 1,
					HierarchySiblingRank: 1
				}, {
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.0')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1.0",
					ErhaOrderItemName: "1.0",
					HierarchyParentNode: "1",
					HierarchyDescendantCount: 1,
					HierarchyDistanceFromRoot: 1,
					HierarchyDrillState: "expanded",
					HierarchyNode: "1.0",
					HierarchyPreorderRank: 2,
					HierarchySiblingRank: 0
				}, {
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.0.0')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1.0.0",
					ErhaOrderItemName: "1.0.0",
					HierarchyParentNode: "1.0",
					HierarchyDescendantCount: 0,
					HierarchyDistanceFromRoot: 2,
					HierarchyDrillState: "leaf",
					HierarchyNode: "1.0.0",
					HierarchyPreorderRank: 0,
					HierarchySiblingRank: 0
				}, {
					__metadata: {uri: "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='1.1')"},
					ErhaOrder: "1",
					ErhaOrderItem: "1.1",
					ErhaOrderItemName: "1.1",
					HierarchyParentNode: "1",
					HierarchyDescendantCount: 0,
					HierarchyDistanceFromRoot: 1,
					HierarchyDrillState: "leaf",
					HierarchyNode: "1.1",
					HierarchyPreorderRank: 3,
					HierarchySiblingRank: 1
				}]
			});

			return Promise.all([
				// code under test
				oTable.getBinding("rows").expandNodeToLevel(1, 2),
				this.waitForChanges(assert, "expand node '1' to level 2")
			]);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["0"], ["1"], ["1.0"], ["1.0.0"]]);
		});
	});

	//*********************************************************************************************
	// Scenario: A table has an inactive created entity. After rebinding the table and activating
	// this inactive entity, the createActivate-event of the ODataListBinding is properly handled.
	// BCP: 2280135558
	QUnit.test("ODataListBinding: createActivate-event works after rebinding", function (assert) {
		var oBinding, oTable,
			aCreateActivateCalledBy = [],
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Input id="company" value="{CompanyName}"/>\
</t:Table>',
			that = this;

		function fnAttachEvent(sText) {
			oBinding.attachCreateActivate(function () {
				aCreateActivateCalledBy.push(sText);
			});
		}

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {results : []})
			.expectValue("company", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("company", "Initial", 0);

			// code under test: attach createActivate on initial binding; create inactive entity
			fnAttachEvent("table before rebind");
			oBinding.create({CompanyName : "Initial"}, false, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {results : []});

			// code under test: rebind table and attach event on new binding
			oTable.bindRows(oTable.getBindingInfo("rows"));
			oBinding = oTable.getBinding("rows");
			fnAttachEvent("table after rebind");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "Activation", 0);

			// code under test: activate entity
			oTable.getRows()[0].getCells()[0].setValue("Activation");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(aCreateActivateCalledBy, ["table after rebind"]);
		});
	});

	//*********************************************************************************************
	// Scenario: A table has an inactive created entity and a 'createActivate' event handler
	// suppresses the activation until all conditions are fulfilled. After re-binding the table the
	// activation is still only done if all conditions are fulfilled. Destroyed bindings don't
	// influence the activation.
	// BCP: 2380123522
	QUnit.test("ODataListBinding: createActivate-event works with destroyed bindings", function (assert) {
		var oBinding, oCreatedContext, oTable,
			oModel = createSalesOrdersModel({defaultBindingMode: BindingMode.TwoWay, refreshAfterChange: false}),
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Input id="company" value="{CompanyName}"/>\
</t:Table>',
			that = this;

		function onCreateActivate(oEvent) {
			assert.strictEqual(oEvent.getParameter("context"), oCreatedContext);
			assert.strictEqual(oCreatedContext.isInactive(), true);
			if (oCreatedContext.getObject("").CompanyName !== "SAP") {
				oEvent.preventDefault();
			}
		}

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {results: []})
			.expectValue("company", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectValue("company", "Initial", 0);

			// code under test: attach createActivate on initial binding; create inactive entity
			oBinding.attachCreateActivate(onCreateActivate);
			oCreatedContext = oBinding.create({CompanyName: "Initial"}, false, {inactive: true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "Foo", 0);

			// code under test: change the value that prevents activation
			oTable.getRows()[0].getCells()[0].setValue("Foo");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {results: []});

			// code under test: rebind table and attach event on new binding
			oTable.bindRows(oTable.getBindingInfo("rows"));
			oBinding = oTable.getBinding("rows");
			oBinding.attachCreateActivate(onCreateActivate);
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "Bar", 0);

			// code under test: on new binding change value that still not activate the entry
			oTable.getRows()[0].getCells()[0].setValue("Bar");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created: true,
					data: {
						__metadata: {type: "GWSAMPLE_BASIC.BusinessPartner"},
						CompanyName: "SAP"
					},
					method: "POST",
					requestUri: "BusinessPartnerSet"
				}, {
					data: {
						__metadata: {uri: "BusinessPartnerSet('42')"},
						BusinessPartnerID: "42",
						CompanyName: "SAP"
					},
					statusCode: 201
				})
				.expectValue("company", "SAP", 0);

			// code under test: change the value that activation is done
			oTable.getRows()[0].getCells()[0].setValue("SAP");
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: For a transient entity, transient sub-entities are created for its :n-navigation
	// property. The complete deep create object is created in back-end via one POST request.
	// As per the OData V2 spec, Example 4, 2.2.7.1.1.1 the backend does *not*
	// return the "deep" sub-entities in the POST response.
	// JIRA: CPOUI5MODELS-1009
	QUnit.test("deep create: :n navigation property", function (assert) {
		var oListBinding, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="salesOrderID" text="{SalesOrderID}"/>\
	<Text id="customerName" text="{CustomerName}"/>\
	<t:Table id="table" rows="{ToLineItems}" visibleRowCount="2">\
		<Text id="itemPosition" text="{ItemPosition}"/>\
		<Text id="note" text="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectValue("itemPosition", ["", ""])
			.expectValue("note", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			var oRootContext;

			that.expectValue("customerName", "SAP");

			oRootContext = oModel.createEntry("/SalesOrderSet", {
				properties : {CustomerName : "SAP"}
			});
			that.oView.byId("objectPage").setBindingContext(oRootContext);

			return that.waitForChanges(assert);
		}).then(function () {
			oTable = that.oView.byId("table");
			oListBinding = oTable.getBinding("rows");

			that.expectValue("note", "Note 0", 0)
				.expectValue("note", "Note 1", 1);

			// code under test: deep creates update controls
			oListBinding.create({Note : "Note 0"}, /*bAtEnd*/true);
			oListBinding.create({Note : "Note 1"}, /*bAtEnd*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerName : "SAP",
						ToLineItems : [
							{Note : "Note 0"},
							{Note : "Note 1"}
						]
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('42')"},
						SalesOrderID : "42",
						CustomerName : "SAP"
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "42")
				// transient sub contexts are removed -> controls become empty
				.expectValue("note", ["", ""]);

			// code under test: proper request with deep payload
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.hasPendingChanges(), false);

			that.expectRequest("SalesOrderSet('42')/ToLineItems?$skip=0&$top=102", {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='10')"
						},
						ItemPosition : "10",
						Note : "Note 0",
						SalesOrderID : "42"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='20')"
						},
						ItemPosition : "20",
						Note : "Note 1",
						SalesOrderID : "42"
					}]
				})
				.expectValue("itemPosition", ["10", "20"])
				.expectValue("note", ["Note 0", "Note 1"]);

			// code under test: re-read items
			oListBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("itemPosition", ["20", ""], 1)
				.expectValue("note", ["Note 1", "Note 2"], 1);

			// code under test: further create
			oListBinding.create({Note : "Note 2"}, /*bAtEnd*/true);
			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"},
						Note : "Note 2",
						SalesOrderID : "42"
					},
					method : "POST",
					requestUri : "SalesOrderSet('42')/ToLineItems"
				}, {
					data : {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='30')"
						},
						ItemPosition : "30",
						Note : "Note 2",
						SalesOrderID : "42"
					},
					statusCode : 201
				})
				.expectValue("itemPosition", "30", 2);

			// code under test: submit further create
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: For a transient entity, transient sub-entities are created for its :n-navigation
	// property. The complete deep create object is created in back-end via one POST request.
	// The backend returns the "deep" sub-entities in the POST response and therefore no refresh
	// is needed.
	// JIRA: CPOUI5MODELS-1009
	QUnit.test("deep create: :n navigation property (with deep response)", function (assert) {
		var oListBinding, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="salesOrderID" text="{SalesOrderID}"/>\
	<Text id="customerName" text="{CustomerName}"/>\
	<t:Table id="table" rows="{ToLineItems}" visibleRowCount="2">\
		<Text id="itemPosition" text="{ItemPosition}"/>\
		<Text id="note" text="{Note}"/>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectValue("itemPosition", ["", ""])
			.expectValue("note", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			var oRootContext;

			that.expectValue("customerName", "SAP");

			oRootContext = oModel.createEntry("/SalesOrderSet", {
				properties : {CustomerName : "SAP"}
			});
			that.oView.byId("objectPage").setBindingContext(oRootContext);

			return that.waitForChanges(assert);
		}).then(function () {
			oTable = that.oView.byId("table");
			oListBinding = oTable.getBinding("rows");

			that.expectValue("note", "Note 0", 0)
				.expectValue("note", "Note 1", 1);

			// code under test: deep creates update controls
			oListBinding.create({Note : "Note 0"}, /*bAtEnd*/true);
			oListBinding.create({Note : "Note 1"}, /*bAtEnd*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						CustomerName : "SAP",
						ToLineItems : [
							{Note : "Note 0"},
							{Note : "Note 1"}
						]
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : {uri : "SalesOrderSet('42')"},
						SalesOrderID : "42",
						CustomerName : "SAP",
						ToLineItems : {
							results : [{
								__metadata : {
									uri : "SalesOrderLineItemSet"
										+ "(SalesOrderID='42',ItemPosition='10')"
								},
								ItemPosition : "10",
								Note : "Note 0",
								SalesOrderID : "42"
							}, {
								__metadata : {
									uri : "SalesOrderLineItemSet"
										+ "(SalesOrderID='42',ItemPosition='20')"
								},
								ItemPosition : "20",
								Note : "Note 1",
								SalesOrderID : "42"
							}]
						}
					},
					statusCode : 201
				})
				.expectValue("salesOrderID", "42")
				// transient sub contexts are removed -> controls become empty
				.expectValue("note", ["", ""])
				// reinserts items from deep response
				.expectValue("itemPosition", ["10", "20"])
				.expectValue("note", ["Note 0", "Note 1"]);

			// code under test: proper request with deep payload
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.hasPendingChanges(), false);

			that.expectValue("itemPosition", ["20", ""], 1)
				.expectValue("note", ["Note 1", "Note 2"], 1);

			// code under test: further create
			oListBinding.create({Note : "Note 2"}, /*bAtEnd*/true);
			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"},
						Note : "Note 2",
						SalesOrderID : "42"
					},
					method : "POST",
					requestUri : "SalesOrderSet('42')/ToLineItems"
				}, {
					data : {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='42',ItemPosition='30')"
						},
						ItemPosition : "30",
						Note : "Note 2",
						SalesOrderID : "42"
					},
					statusCode : 201
				})
				.expectValue("itemPosition", "30", 2);

			// code under test: submit further create
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: For a transient entity, a transient sub-entity is created for a :n-navigation
	// property. From this one, a deeper nested transient sub-entity for a :n-navigation property is
	// created. The complete deep create object is created in back-end via one POST request.
	// JIRA: CPOUI5MODELS-1009
	QUnit.test("deep create: nested navigation properties (:n)", function (assert) {
		var oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="businessPartnerID" text="{BusinessPartnerID}"/>\
	<Text id="companyName" text="{CompanyName}"/>\
	<t:Table id="salesOrdersTable" rows="{ToSalesOrders}" visibleRowCount="2">\
		<Text id="note_table" text="{Note}"/>\
	</t:Table>\
</FlexBox>\
<FlexBox id="salesOrderPage">\
	<Input id="note_input" value="{Note}"/>\
	<Select id="lineItemsList" items="{ToLineItems}">\
		<MenuItem text="{ProductID}" />\
	</Select>\
</FlexBox>',
			that = this;

		this.expectValue("note_table", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			var oRootContext;

			that.expectValue("companyName", "SAP");

			// code under test: create root entity
			oRootContext = oModel.createEntry("/BusinessPartnerSet", {
				properties : {CompanyName : "SAP"}
			});
			that.oView.byId("objectPage").setBindingContext(oRootContext);

			return that.waitForChanges(assert);
		}).then(function () {
			var oListBinding = that.oView.byId("salesOrdersTable").getBinding("rows"),
				oSalesOrderContext;

			that.expectValue("note_table", "Note 0", 0)
				.expectValue("note_input", "Note 0");

			// code under test: create sub-entity level 1 and bind it to object page
			oSalesOrderContext = oListBinding.create({Note : "Note 0"});
			that.oView.byId("salesOrderPage").bindObject(oSalesOrderContext.getPath());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("note_table", "Note foo", 0)
				.expectValue("note_input", "Note foo");

			// code under test: two-way binding on sub-entity
			that.oView.byId("note_input").setValue("Note foo");

			return that.waitForChanges(assert);
		}).then(function () {
			var oLineItemsList = that.oView.byId("lineItemsList"),
				oListBinding = oLineItemsList.getBinding("items");

			assert.strictEqual(oLineItemsList.getItems().length, 0);

			// code under test: create sub-entity level 2
			oListBinding.create({ProductID : "HT-1000"});

			assert.strictEqual(oLineItemsList.getItems().length, 1);
			assert.strictEqual(oLineItemsList.getItems()[0].getText(), "HT-1000");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.BusinessPartner"},
						CompanyName : "SAP",
						ToSalesOrders : [{
							Note : "Note foo",
							ToLineItems : [{ProductID : "HT-1000"}]
						}]
					},
					method : "POST",
					requestUri : "BusinessPartnerSet"
				}, {
					data : {
						__metadata : {uri : "BusinessPartnerSet('42')"},
						BusinessPartnerID : "42",
						CompanyName : "SAP"
					},
					statusCode : 201
				})
				.expectValue("businessPartnerID", "42")
				.expectValue("note_table", "", 0)
				.expectValue("note_input", "");

			// code under test: POST request with deep payload
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(that.oView.byId("lineItemsList").getItems().length, 0);
			assert.strictEqual(oModel.hasPendingChanges(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: For a transient entity, a transient sub-entity is created for a :1-navigation
	// property and a :n-navigation property as well as for navigation properties of these.
	// The complete deep create object is created in back-end via one POST request.
	// Note: This is a technical test; in a business scenario, it is not realistic to create
	// a product with related sales order items -> sales order and with business partner and
	// related contacts. These entities have been chosen to cover cases of creation in navigation
	// properties with different cardinalities.
	// JIRA: CPOUI5MODELS-1009
	// TODO: activate the test if deep create for :1 navigation properties is supported
	QUnit.skip("deep create: nested navigation properties (:1)", function (assert) {
		var oRootContext,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="productID" text="{ProductID}"/>\
	<Text id="productName" text="{Name}"/>\
	<t:Table id="tableSOItems" rows="{ToSalesOrderLineItems}" visibleRowCount="2">\
		<Text id="itemNote" text="{Note}"/>\
		<Text id="customerName" text="{ToHeader/CustomerName}"/>\
	</t:Table>\
</FlexBox>\
<FlexBox id="supplierObjectPage">\
	<Input id="supplierCompanyName" value="{CompanyName}"/>\
</FlexBox>',
			that = this;
		//Product
		//  -> (:n) ToSalesOrderLineItems
		//    -> (:1) ToHeader
		//  -> (:1) ToSupplier
		//    -> (:n) ToContacts

		this.expectValue("itemNote", ["", ""])
			.expectValue("customerName", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectValue("productName", "MyProduct");

			oRootContext = oModel.createEntry("/ProductSet", {
				properties : {Name : "MyProduct"}
			});
			that.oView.byId("objectPage").setBindingContext(oRootContext);

			return that.waitForChanges(assert);
		}).then(function () {
			var oItemContext0, oSupplierContext,
				oListBinding = that.oView.byId("tableSOItems").getBinding("rows");

			that.expectValue("itemNote", "Note 0", 0)
				.expectValue("itemNote", "Note 1", 1)
				.expectValue("supplierCompanyName", "SAP")
				.expectValue("supplierCompanyName", "ACME");

			// code under test: deep creates update controls
			oItemContext0 = oListBinding.create({Note : "Note 0"}, true);
			oListBinding.create({Note : "Note 1"}, true);
			oModel.createEntry("ToHeader",
				{context : oItemContext0, properties : {Note : "SalesOrderNote"}});
			oSupplierContext = oModel.createEntry("ToSupplier",
				{context : oRootContext, properties : {CompanyName : "SAP"}});
			oModel.createEntry("ToContacts",
				{context : oSupplierContext, properties : {FirstName : "Alice"}});
			oModel.createEntry("ToContacts",
				{context : oSupplierContext, properties : {FirstName : "Bob"}});
			that.oView.byId("supplierObjectPage").bindObject(oSupplierContext.getPath());
			// code under test: user-input for sub-entity
			that.oView.byId("supplierCompanyName").setValue("ACME");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectHeadRequest()
				.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.Product"},
						Name : "MyProduct",
						ToSalesOrderLineItems : [
							{
								Note : "Note 0",
								ToHeader : {
									Note : "SalesOrderNote"
								}
							},
							{Note : "Note 1"}
						],
						ToSupplier : {
							CompanyName : "ACME",
							ToContacts : [{FirstName : "Alice"}, {FirstName : "Bob"}]
						}
					},
					method : "POST",
					requestUri : "ProductSet"
				}, {
					data : {
						__metadata : {uri : "ProductSet('77')"},
						ProductID : "77",
						Name : "MyProduct"
					},
					statusCode : 201
				})
				.expectValue("productID", "77")
				// transient sub contexts are removed -> controls become empty
				.expectValue("supplierCompanyName", "")
				.expectValue("itemNote", ["", ""]);

			// code under test: proper request with deep payload
			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oModel.hasPendingChanges(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: The POST request for inline create in a table (ODLB#create) and the GET for table refresh
	// (ODLB#refresh) are sent in one $batch. The newly created row should be considered "persistent" and thus
	// removed so that it does not appear as duplicate when being returned in the GET response.
	// One must therefore remove created, persisted rows also when the response for the GET request is processed, not
	// only when ODLB#refresh is called as the newly created row is still transient then.
	// BCP: 2380015211
	QUnit.test("No duplicate rows with ODLB#create/POST and ODLB#refresh/GET in one $batch", function (assert) {
		var oBinding, oTable,
			oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="2">\
	<Text id="salesOrderID" text="{SalesOrderID}"/>\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		oModel.setDeferredGroups(["myGroup"]);

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=102", {
				results : []
			})
			.expectValue("salesOrderID", ["", ""])
			.expectValue("note", ["", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");

			that.expectValue("note", ["foo"]);
			oBinding = oTable.getBinding("rows");
			oBinding.create({Note : "foo"}, true, {groupId : "myGroup"});

			return that.waitForChanges(assert);
		}).then(function () {
			var oNewSalesOrderData = {
					__metadata : {
						uri : "SalesOrderSet('42')"
					},
					Note : "bar",
					SalesOrderID : "42"
				};

			that.expectRequest({
					created : true,
					data : {
						__metadata : {
							type : "GWSAMPLE_BASIC.SalesOrder"
						},
						Note : "foo"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : oNewSalesOrderData,
					statusCode : 201
				})
				.expectRequest("SalesOrderSet?$skip=0&$top=102", {
					results : [oNewSalesOrderData]
				})
				.expectValue("salesOrderID", ["42"])
				.expectValue("note", ["bar"]);

			oBinding.refresh(/*bForceUpdate*/true, "myGroup");
			oModel.submitChanges({groupId : "myGroup"});
		});
	});

	//*********************************************************************************************
	// Scenario: Use OData V2 list binding and a DateRangeSelection control to determine filter
	// values.
	// JIRA: CPOUI5MODELS-1131
	QUnit.test("ODataListBinding#filter: client side filtering", function (assert) {
		var oJSONModel = new JSONModel({
				start: null,
				end: null
			}),
			oModel = createSalesOrdersModel({}),
			mModels = {json: oJSONModel,"undefined": oModel},
			sView = '\
<DateRangeSelection id="DateRangeSelection" value="{\
		parts: [{\
			path: \'json>/start\',\
			type: \'sap.ui.model.odata.type.DateTime\'\
		}, {\
			path: \'json>/end\',\
			type: \'sap.ui.model.odata.type.DateTime\'\
		}],\
		type: \'sap.ui.model.type.DateInterval\'\
	}" />\
<Table id="Table" growing="true" growingThreshold="2" items="{\
			parameters: {operationMode: \'Client\'},\
			path: \'/SalesOrderSet\'\
		}\">\
	<Text id="SalesOrderID" text="{SalesOrderID}" />\
	<Text id="CreatedAt" text="{path: \'CreatedAt\', type: \'sap.ui.model.odata.type.DateTime\'}" />\
</Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet", {
				results : [
					{CreatedAt: UI5Date.getInstance(2023, 0, 25), SalesOrderID : "1"},
					{CreatedAt: UI5Date.getInstance(2023, 0, 29, 23), SalesOrderID : "2"},
					{CreatedAt: UI5Date.getInstance(2023, 0, 31, 23), SalesOrderID : "3"},
					{CreatedAt: UI5Date.getInstance(2023, 1, 1), SalesOrderID : "4"}
				]
			})
			.expectValue("SalesOrderID", ["1", "2"])
			.expectValue("CreatedAt", ["Jan 25, 2023, 12:00:00\u202FAM", "Jan 29, 2023, 11:00:00\u202FPM"]);

		return this.createView(assert, sView, mModels).then(function () {
			that.oView.byId("DateRangeSelection").setValue("Jan 30, 2023 - Jan 31, 2023");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("SalesOrderID", ["3"])
				.expectValue("CreatedAt", ["Jan 31, 2023, 11:00:00\u202FPM"]);

			// code under test
			that.oView.byId("Table").getBinding("items").filter(new Filter({
				filters: [
					new Filter("CreatedAt", FilterOperator.GE, oJSONModel.getProperty("/start")),
					new Filter("CreatedAt", FilterOperator.LE, oJSONModel.getProperty("/end"))
				],
				and: true
			}), FilterType.Application);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: While the read for the object page root entity including an $expand on a navigation property is
	// underway, a list binding for the navigation property is created. The object page's context binding is
	// set to "create preliminary context".
	// Case from BCP 2280184236: If the list binding is set to *not use* preliminary contexts, there must be no
	// additional request on the navigation property. Also check that the updated flag of the object page's
	// context is not set, as this caused the issue in the incident.
	// TODO, Additional case: If the list binding is set to *use* preliminary contexts, the additional request on
	//   the navigation property may be sent. When this request is aborted, the binding context for the root
	//   entity must however not be marked as "updated", as this may lead to an endless loop of read requests
	//   for bindings dependent on this context.
	//
	// BCP: 2280184236
	QUnit.test("No request from ODLB with preliminary context and usePreliminaryContext=false", function (assert) {
		var oObjectPage, fnResolveObjectPageRead,
			oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="id" text="{SalesOrderID}"/>\
	<t:Table id="table" visibleRowCount="2">\
		<Text id="itemPosition" text="{ItemPosition}" />\
	</t:Table>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oObjectPage = that.oView.byId("objectPage");

			that.expectHeadRequest()
				.expectRequest({
					batchNo : 1,
					requestUri : "SalesOrderSet('1')?$expand=ToLineItems&$select=SalesOrderID"
				}, new Promise(function (resolve) { fnResolveObjectPageRead = resolve; }));

			// code under test: bind object page
			// in BCP scenario: triggered by FE on navigation from entity information contained in URL hash
			oObjectPage.bindObject({path : "/SalesOrderSet('1')",
				parameters : {createPreliminaryContext : true, expand : "ToLineItems", select : "SalesOrderID"}});

			return that.waitForChanges(assert);
		}).then(function () {
			// no request expected

			// code under test: bind dependent table *while the read for the entity of its context is still underway*
			// in BCP scenario: triggered by SmartMultiInput when creating "internal" control
			that.oView.byId("table").bindRows({
				path : "ToLineItems",
				parameters : {usePreliminaryContext : false, select : "ItemPosition"}
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("id", "1")
				.expectValue("itemPosition", ["10", ""]);

			// code under test: read for root-entity with $expand is responded to by server
			fnResolveObjectPageRead({
				data : {
					__metadata : {uri : "SalesOrderSet('1')"},
					SalesOrderID : "1",
					ToLineItems : {
						results : [{
							__metadata : {
								uri : "/SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
							},
							SalesOrderID : "1",
							ItemPosition : "10"
						}]
					}
				},
				statusCode : 200
			});

			return that.waitForChanges(assert);
		}).then(function () {
			// if context is still "updated", further dependent bindings will continuously send read requests
			// as they assume a change: an "endless loop of $batch"
			assert.strictEqual(oObjectPage.getObjectBinding().getBoundContext().isUpdated(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: On creation of an inactive entity, it remains inactive as long as a createActivate event handler
	// cancels the event. The corresponding edit is considered a pending change: ODataModel#resetChanges resets it,
	// ODataModel#hasPendingChanges returns true; there must however be no POST request on ODataModel#submitChanges.
	// A following not cancelled createActivate event on the inactive entity activates the context; submitChanges
	// triggers a POST request.
	// JIRA: CPOUI5MODELS-940
	QUnit.test("Create inactive entity and cancel activation", function (assert) {
		var oCreatedContext, oTable,
			bCancelCreateActivate = true,
			iCreateActivateCalled = 0,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Text id="id" text="{BusinessPartnerID}"/>\
	<Input id="company" value="{CompanyName}"/>\
	<Input id="mail" value="{EmailAddress}"/>\
</t:Table>',
			that = this;

		function onCreateActivate(oEvent) {
			iCreateActivateCalled += 1;
			assert.strictEqual(oEvent.getParameter("context"), oCreatedContext, "context passed to event handler");
			assert.strictEqual(oCreatedContext.isInactive(), true, "context inactive in event handler");
			if (bCancelCreateActivate) {
				oEvent.preventDefault();
			}
		}

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					CompanyName : "SAP",
					EmailAddress : "Mail0"
				}]
			})
			.expectValue("id", ["42", ""])
			.expectValue("company", ["SAP", ""])
			.expectValue("mail", ["Mail0", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			that.expectValue("company", "Initial", 1)
				.expectValue("mail", "Mail1", 1);

			// code under test
			oTable.getBinding("rows").attachEvent("createActivate", onCreateActivate);

			oCreatedContext = oTable.getBinding("rows").create({
				CompanyName : "Initial",
				EmailAddress : "Mail1"
			}, /*bAtEnd*/true, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "ACME", 1);

			assert.strictEqual(oModel.hasPendingChanges(), false);

			// code under test: activation cancelled
			oTable.getRows()[1].getCells()[1].setValue("ACME");

			assert.strictEqual(oModel.hasPendingChanges(), true, "edit in still inactive context is a change");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "Initial", 1); // resetChanges => fall back to initial data

			return Promise.all([
				// code under test: resetChanges removes properties, but not still inactive row
				oModel.resetChanges(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectValue("company", "ACME2", 1)
				.expectValue("mail", "Mail2", 1);

			assert.strictEqual(oTable.getBinding("rows").getLength(), 2, "inactive row not removed by resetChanges");

			// code under test: activation done
			bCancelCreateActivate = false;
			oTable.getRows()[1].getCells()[1].setValue("ACME2");
			oTable.getRows()[1].getCells()[2].setValue("Mail2");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(iCreateActivateCalled, 2);
			assert.strictEqual(oCreatedContext.isInactive(), false);

			that.expectRequest({
					created : true,
					data : {
						__metadata : {type : "GWSAMPLE_BASIC.BusinessPartner"},
						CompanyName : "ACME2",
						EmailAddress : "Mail2"
					},
					method : "POST",
					requestUri : "BusinessPartnerSet"
				}, {
					data : {
						__metadata : {uri : "BusinessPartnerSet('43')"},
						BusinessPartnerID : "43",
						CompanyName : "ACME2",
						EmailAddress : "Mail2"
					},
					statusCode : 201
				})
				.expectValue("id", "43", 1);

			// code under test
			oModel.submitChanges();

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: A navigation property, for example "to_BusinessPartnerCustomer", is expanded via
	// $expand and the target entity has more than 1 key property. For a property, for example
	// "BusinessPartner", a referential constraint for the expanded navigation property is defined.
	// If the user sets the same value as it was before, there are no pending changes and
	// submitChanges does not send a request.
	// BCP: 2380045943
	QUnit.test("Referential constraints: no pending changes if same value is set", function (assert) {
		var oObjectPage,
			oModel = createSpecialCasesModel(),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="BusinessPartner" text="{BusinessPartner}"/>\
	<Text id="Name" text="{to_BusinessPartnerCustomer/Name}"/>\
</FlexBox>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			oObjectPage = that.oView.byId("objectPage");

			that.expectHeadRequest()
				.expectRequest(
					"C_BPAdditionalCustomer(BusinessPartner='pb1',Customer='c1',"
						+ "IsActiveEntity=false)?$expand=to_BusinessPartnerCustomer",
					{
						data: {
							__metadata: {
								uri: "C_BPAdditionalCustomer(BusinessPartner='bp1',Customer='c1',"
									+ "IsActiveEntity=false)"
							},
							BusinessPartner: "bp1",
							Customer: "c1",
							IsActiveEntity: false,
							// eslint-disable-next-line camelcase
							to_BusinessPartnerCustomer: {
								__metadata: {
									uri: "C_BusinessPartnerCustomer(BusinessPartner='bp1',"
										+ "IsActiveEntity=false)"
								},
								BusinessPartner: "bp1",
								IsActiveEntity: false,
								Name: "name"
							}
						},
						statusCode: 201
					})
				.expectValue("BusinessPartner", "bp1")
				.expectValue("Name", "name");

			// code under test: bind object page
			oObjectPage.bindObject({
				path: "/C_BPAdditionalCustomer(BusinessPartner='pb1',Customer='c1',IsActiveEntity=false)",
				parameters: {expand: "to_BusinessPartnerCustomer"}});

			return that.waitForChanges(assert);
		}).then(function () {
			// code under test: set the same property value
			oModel.setProperty("BusinessPartner", "bp1", oObjectPage.getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			assert.notOk(oModel.hasPendingChanges());

			// code under test: no request is triggered
			oModel.submitChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A table using ODataTreeBindingFlat uses the correctly grouped filters in requests.
	// BCP: 2370010564
	QUnit.test("ODataTreeBindingFlat: Filters are correctly grouped", function (assert) {
		var oTable,
			oModel = createHierarchyMaintenanceModel(),
			oNode050 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='050')"},
				CreatedByUser : "user0",
				ErhaOrder : "1",
				ErhaOrderItem : "050",
				ErhaOrderItemName : "node050",
				HierarchyNode : "050",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode100 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='100')"},
				CreatedByUser : "user2",
				ErhaOrder : "1",
				ErhaOrderItem : "100",
				ErhaOrderItemName : "node100",
				HierarchyNode : "100",
				HierarchyParentNode : "",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 0,
				HierarchyDrillState : "collapsed",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode100NoFilter = Object.assign({}, oNode100, {HierarchyPreorderRank : 1, HierarchySiblingRank : 1}),
			oNode200 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='200')"},
				CreatedByUser : "user2",
				ErhaOrder : "1",
				ErhaOrderItem : "200",
				ErhaOrderItemName : "node200",
				HierarchyNode : "200",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 0,
				HierarchySiblingRank : 0
			},
			oNode300 = {
				__metadata : {uri : "ErhaOrderItem(ErhaOrder='1',ErhaOrderItem='300')"},
				CreatedByUser : "user2",
				ErhaOrder : "1",
				ErhaOrderItem : "300",
				ErhaOrderItemName : "node300",
				HierarchyNode : "300",
				HierarchyParentNode : "100",
				HierarchyDescendantCount : 0,
				HierarchyDistanceFromRoot : 1,
				HierarchyDrillState : "leaf",
				HierarchyPreorderRank : 1,
				HierarchySiblingRank : 1
			},
			sView = '\
<t:TreeTable id="table"\
		rows="{\
			path : \'/ErhaOrder(\\\'1\\\')/to_Item\',\
			parameters : {\
				countMode : \'Inline\',\
				numberOfExpandedLevels : 0,\
				restoreTreeStateAfterChange : true\
			},\
			filters : [\
				{path : \'CreatedByUser\', operator : \'EQ\', value1 : \'user0\'},\
				{path : \'CreatedByUser\', operator : \'EQ\', value1 : \'user1\'}\
			]\
		}"\
		visibleRowCount="4">\
	<Text id="itemName" text="{ErhaOrderItemName}" />\
</t:TreeTable>';

		this.expectHeadRequest()
			.expectRequest({
				batchNo : 1,
				requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
					+ "&$filter=HierarchyDistanceFromRoot le 0"
					+ " and (CreatedByUser eq 'user0' or CreatedByUser eq 'user1')"
			}, {
				__count : "1",
				results : [oNode050]
			});

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");

			// don't use expectValue to avoid timing issues causing flaky tests
			assert.deepEqual(getTableContent(oTable), [["node050"], [""], [""], [""]]);

			this.expectRequest({
					batchNo : 2,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
						+ " and (CreatedByUser eq 'user2' or CreatedByUser eq 'user3')"
				}, {
					__count : "1",
					results : [oNode100]
				});

			// code under test
			oTable.getBinding("rows").filter([
				new Filter("CreatedByUser", FilterOperator.EQ, "user2"),
				new Filter("CreatedByUser", FilterOperator.EQ, "user3")
			], FilterType.Application);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["node100"], [""], [""], [""]]);

			this.expectRequest({
					batchNo : 3,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
						+ "&$filter=HierarchyParentNode eq '100'"
						+ " and (CreatedByUser eq 'user2' or CreatedByUser eq 'user3')"
				}, {
					__count : "2",
					results : [oNode200, oNode300]
				});

			oTable.expand(0);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["node100"], ["node200"], ["node300"], [""]]);

			this.expectRequest({
					batchNo : 4,
					requestUri : "ErhaOrder('1')/to_Item?$skip=0&$top=104&$inlinecount=allpages"
						+ "&$filter=HierarchyDistanceFromRoot le 0"
				}, {
					__count : "2",
					results : [oNode050, oNode100NoFilter]
				});

			// code under test
			oTable.getBinding("rows").filter([], FilterType.Application);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["node050"], ["node100"], [""], [""]]);
		});
	});

	//*********************************************************************************************
	// Scenario: On creation of an inactive entity, the createActivate event handler fails due to an Error in its
	// coding. This error is reported on the console and not stifled.
	// JIRA: CPOUI5MODELS-1196
	QUnit.test("Error in createActivate event handler is reported", function (assert) {
		var oTable,
			oModel = createSalesOrdersModel({defaultBindingMode : BindingMode.TwoWay}),
			sView = '\
<t:Table id="table" rows="{/BusinessPartnerSet}" visibleRowCount="2">\
	<Text id="id" text="{BusinessPartnerID}"/>\
	<Input id="company" value="{CompanyName}"/>\
	<Input id="mail" value="{EmailAddress}"/>\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("BusinessPartnerSet?$skip=0&$top=102", {
				results : [{
					__metadata : {uri : "BusinessPartnerSet('42')"},
					BusinessPartnerID : "42",
					CompanyName : "SAP",
					EmailAddress : "Mail0"
				}]
			})
			.expectValue("id", ["42", ""])
			.expectValue("company", ["SAP", ""])
			.expectValue("mail", ["Mail0", ""]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			that.expectValue("mail", "Mail1", 1);

			// code under test
			oTable.getBinding("rows").attachEvent("createActivate", function (/*oEvent*/) {
				throw {
					message : "event handler failure",
					stack : "~stack"
				};
			});

			oTable.getBinding("rows").create({EmailAddress : "Mail1"}, /*bAtEnd*/true, {inactive : true});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("company", "ACME", 1);
			that.oLogMock.expects("error")
				.withExactArgs("The following problem occurred: event handler failure", "~stack",
					"sap.ui.model.odata.v2.ODataListBinding");

			// code under test: set value leads to call of createActivate event handler
			oTable.getRows()[1].getCells()[1].setValue("ACME");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: The expanded list defined in ODataModel#createEntry can be used to create a new
	// ODataContextBinding, if that binding has parameter canonicalRequest set to true.
	// BCP: 2370052919
	QUnit.test("createEntry: expand is usable if canonicalRequests is enabled for context binding", function (assert) {
		var oModel = createSalesOrdersModel({canonicalRequests: false}),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}"/>\
</FlexBox>\
<FlexBox id="objectPage">\
	<Text id="itemPosition" text="{ItemPosition}" />\
	<Text id="productName" text="{ToProduct/Name}" />\
</FlexBox>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')", {
				__metadata: {uri: "SalesOrderSet('1')"},
				SalesOrderID: "1"
			})
			.expectValue("salesOrderID", "1");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					created: true,
					data: {
						__metadata: {type: "GWSAMPLE_BASIC.SalesOrderLineItem"},
						SalesOrderID: "1"
					},
					headers: {"Content-ID": "~key~", "sap-messages": "transientOnly"},
					method: "POST",
					requestUri: "SalesOrderSet('1')/ToLineItems"
				}, {
					data: {
						__metadata: {uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"},
						ItemPosition: "10",
						SalesOrderID: "1"
					},
					statusCode: 201
				})
				.expectRequest("$~key~?$expand=ToProduct&$select=ToProduct", {
					__metadata: {uri: "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"},
					ToProduct: {
						__metadata: {uri: "ProductSet(ProductID='P1')"},
						Name: "Product 1",
						ProductID: "P1"
					}
				});

			// code under test
			oModel.createEntry("/SalesOrderSet('1')/ToLineItems", {
				expand: "ToProduct",
				properties: {}
			});

			oModel.submitChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectValue("itemPosition", "10")
				.expectValue("productName", "Product 1");

			// code under test
			that.oView.byId("objectPage").bindObject({
				path: "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
				parameters: {
					canonicalRequest: true,
					expand: "ToProduct",
					select: "ItemPosition,ToProduct/Name"
				}
			});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: If the server uses server side paging and the OData model uses "Client" mode all
	// data is requested up to the model size limit.
	// BCP: 2380127053
[false, true].forEach(function (bShortRead) {
	QUnit.test("OperationMode.Client: with server side paging, short read:" + bShortRead, function (assert) {
		var oTable,
			iDataReceived = 0,
			iDataRequested = 0,
			iExpectedSize = bShortRead ? 15 : 30,
			oModel = createSalesOrdersModel({defaultOperationMode: "Client"}),
			sView = '\
<t:Table id="table">\
	<Text id="note" text="{Note}"/>\
</t:Table>',
			that = this;

		function dataRequested() {
			iDataRequested += 1;
		}
		function dataReceived(oEvent) {
			var oEventData = oEvent.getParameter("data");

			iDataReceived += 1;
			// responses are merged
			assert.strictEqual(oEventData.results.length, iExpectedSize);
			oEventData.results.forEach((oData, i) => {
				assert.strictEqual(oData.Note, "SO" + (i + 1));
			});
			assert.strictEqual(oEventData.__count, "" + iExpectedSize);
		}

		oModel.setSizeLimit(30);

		return this.createView(assert, sView, oModel).then(function () {
			function createItems(iFrom, iLength) {
				var i,
					aItems = [];

				for (i = 0; i < iLength; i += 1) {
					aItems.push({
						__metadata: {uri : "SalesOrderSet('" + iFrom + "')"},
						Note: "SO" + iFrom,
						SalesOrderID: "" + iFrom
					});
					iFrom += 1;
				}

				return aItems;
			}

			that.expectHeadRequest()
				.expectRequest("SalesOrderSet", {
					__next: "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet?$skiptoken=3",
					results: createItems(1, 3) // whitout $top server returns 3; in real maybe 100
				})
				.expectRequest("SalesOrderSet?$skip=3&$top=27", {
					// if $top is given server limit is used; here 10, in real maybe 5000
					__next: "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderSet?$top=24$skiptoken=13",
					results: createItems(4, 10)
				})
				.expectRequest("SalesOrderSet?$skip=13&$top=17", {
					// no _next link, that means server returned all requestd entries; there may be
					// more on the server but the amount of data exceeds the model size limit
					results: createItems(14, bShortRead ? 2 : 17)
				});

			oTable = that.oView.byId("table");
			// code under test - client mode reads all data
			oTable.bindRows({
					events: {
						dataRequested: dataRequested,
						dataReceived: dataReceived
					},
					filter: [new Filter("GrossAmount", FilterOperator.GT, 500)],
					path: "/SalesOrderSet",
					sorter: [new Sorter("CompanyCode", true)]
				});

			return that.waitForChanges(assert);
		}).then(function () {
			var oBinding = oTable.getBinding("rows");

			assert.strictEqual(oBinding.getLength(), iExpectedSize);
			assert.strictEqual(oBinding.getCount(), iExpectedSize);
			assert.strictEqual(iDataRequested, 1);
			assert.strictEqual(iDataReceived, 1);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Skip server cache for security tokens, so that two services running on different backends behind
	// a reverse proxy can be consumed without a failing $batch due to a token for a different system taken from server
	// cache.
	// JIRA:CPOUI5MODELS-1381
	QUnit.test("Skip server cache for security tokens", function (assert) {
		const sView = '\
<FlexBox binding="{/SalesOrderSet(\'1\')}">\
	<Text id="id0" text="{SalesOrderID}" />\
</FlexBox>\
<FlexBox id="box1">\
	<Text id="id1" text="{model1>ContactCardID}" />\
</FlexBox>';

		function checkServiceCache(aTokens) {
			const oServiceCache = ODataModel.mSharedData.service;
			assert.deepEqual(
				Object.values(oServiceCache).map((oCacheEntry) => oCacheEntry.securityToken).sort(),
				aTokens.sort());
		}

		function clearCaches() {
			ODataModel.mSharedData.server = {};
			ODataModel.mSharedData.service = {};
		}

		clearCaches(); // clear static caches on ODataModel to prevent effects from previous tests
		// create model *after* clearing the caches as the token is lost otherwise
		const oModel0 = createSalesOrdersModel({tokenHandling : "skipServerCache"});
		this.expectRequest({
				deepPath : "",
				headers : {"x-csrf-token" : "Fetch"},
				method : "HEAD",
				requestUri : ""
			}, {}, {"x-csrf-token" : "token0"})
			.expectRequest("SalesOrderSet('1')", {
				SalesOrderID : "1"
			})
			.expectValue("id0", "1");

		// code under test
		return this.createView(assert, sView, oModel0).then(() => {
			checkServiceCache(["token0"]);

			this.expectRequest({
					deepPath : "",
					headers : {"x-csrf-token" : "Fetch"},
					method : "HEAD",
					requestUri : "/special/cases/"
				}, {}, {"x-csrf-token" : "token1"})
				.expectRequest({
					requestUri : "I_UserContactCard('ID')"
				}, {
					ContactCardID : "ID"
				})
				.expectValue("id1", "ID");

			// code under test: request data for second service *after* security token for first has been retrieved
			const oModel1 = createSpecialCasesModel({tokenHandling : "skipServerCache"});
			this.oView.setModel(oModel1, "model1");
			this.oView.byId("box1").bindElement("model1>/I_UserContactCard('ID')");

			assert.deepEqual(ODataModel.mSharedData.server, {}, "server cache for tokens is empty");

			return this.waitForChanges(assert);
		}).then(() => {
			checkServiceCache(["token0", "token1"]);
		}).finally(clearCaches);
	});

	//*********************************************************************************************
	// Scenario: For a table where transient entries have messages, the filter returned by requestFilterForMessages does
	// not refer to these entries. For the BCP incident, check the case that no item loaded from the backend has a
	// message: the filter is Filter.NONE then.
	// BCP: 2370088390
	// When the list is filtered only the transient entry is shown and no entries are requested.
	// JIRA: CPOUI5MODELS-1421
	// BCP: 2380132519; it has to be possible to have control filters even if application filters are set to
	// Filter.NONE and vice versa.
	QUnit.test("Filter table where only transient items have messages", function (assert) {
		let oCreatedContext, oRowsBinding;
		const oModel = createSalesOrdersModel({preliminaryContext : true});
		const sView = '\
<t:Table id="table" rows="{/SalesOrderSet(\'1\')/ToLineItems}" visibleRowCount="2">\
	<Input id="itemPosition" value="{ItemPosition}" />\
	<Input id="note" value="{Note}" />\
</t:Table>';

		this.expectHeadRequest()
			.expectRequest({
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=102"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "20"])
			.expectValue("note", ["Bar", "Baz"]);

		return this.createView(assert, sView, oModel).then(() => {
			this.expectValue("itemPosition", ["", "10"])
				.expectValue("note", ["Foo", "Bar"]);

			// code under test
			oRowsBinding = this.oView.byId("table").getBinding("rows");
			oCreatedContext = oRowsBinding.create({Note : "Foo"}, /*bAtEnd*/ false, {inactive: true});

			return this.waitForChanges(assert);
		}).then(() => {
			const oMessage = { // usually, this message occurs on activation
				message: "Item position is required",
				type: "Error",
				target: oCreatedContext.getPath() + "/ItemPosition",
				fullTarget: oCreatedContext.getDeepPath() + "/ItemPosition",
				processor: oModel
			};
			this.expectMessages(oMessage);

			// code under test
			Messaging.addMessages(new Message(oMessage));

			return Promise.all([
				oRowsBinding.requestFilterForMessages(),
				this.waitForChanges(assert)
			]);
		}).then((aResults) => {
			assert.strictEqual(aResults[0], Filter.NONE, "Filter.NONE message filter, only transient item has message");

			this.expectValue("itemPosition", "", 1)
				.expectValue("note", "", 1);

			oRowsBinding.filter(aResults[0], FilterType.Application);

			return this.waitForChanges(assert);
		}).then(() => {
			// code under test - adding a control filter does not lead to an error and still no request is needed
			oRowsBinding.filter(new Filter("itemPosition", FilterOperator.GE, "10"), FilterType.Control);

			return this.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: For a table where only transient entries have messages, the filter returned by requestFilterForMessages
	// is Filter.NONE. When the list is filtered, only the transient entries are shown and no $filter and no $count
	// request occurs. It is still possible to create new inactive entries. Check that count and length of the binding
	// is always correct.
	// JIRA:CPOUI5MODELS-1421
["Default", "Client"].forEach((sOperationMode) => {
	const sTitle = "Filter table where only transient items have messages: operation mode=" + sOperationMode;
	QUnit.test(sTitle, function (assert) {
		let oMessage, oRowsBinding, oTable;
		let aExpectedMessages = [];
		const oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				defaultCountMode : CountMode.Request,
				defaultOperationMode : sOperationMode,
				preliminaryContext : true
			});
		const sView = '\
<t:Table id="table" rows="{/SalesOrderSet(\'1\')/ToLineItems}" visibleRowCount="3">\
	<Input id="itemPosition" value="{ItemPosition}" />\
	<Input id="note" value="{Note}" />\
</t:Table>';
		const that = this;

		/* Prevents activation of passed inactive context, adds a message to the message model for
		this context, creates another inactive context at the end if ItemPosition is empty.*/
		function onCreateActivate(oEvent) {
			const oCreatedContext = oEvent.getParameter("context");
			if (!oCreatedContext.getObject("").ItemPosition) {
				oMessage = {
					message : "Item position is required",
					type : "Error",
					target : oCreatedContext.getPath() + "/ItemPosition",
					fullTarget : oCreatedContext.getDeepPath() + "/ItemPosition",
					processor : oModel
				};
				aExpectedMessages.push(oMessage);
				that.expectMessages(aExpectedMessages);
				Messaging.addMessages(new Message(oMessage));
				oEvent.preventDefault();
			} else {
				const aCurrentMessages = Messaging.getMessageModel().getObject("/");
				aCurrentMessages.some((oMessage) => {
					if (oMessage.getTargets()[0] === oCreatedContext.getPath() + "/ItemPosition") {
						Messaging.removeMessages(oMessage);
						aExpectedMessages = aExpectedMessages.slice(0, 1);
						return true;
					}
					return false;
				});
				that.expectMessages(aExpectedMessages);

				return; // do not create another inactive row
			}

			// code under test - create works also if binding length is not final but Filter.NONE is set
			oRowsBinding.create({}, /*bAtEnd*/ true, {inactive: true});
		}

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet('1')/ToLineItems/$count", "1")
			.expectRequest({
				requestUri : "SalesOrderSet('1')/ToLineItems"
					+ (sOperationMode === "Default" ? "?$skip=0&$top=103" : "")
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}]
			})
			.expectValue("itemPosition", ["10", "", ""])
			.expectValue("note", ["Bar", "", ""]);

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			oRowsBinding = oTable.getBinding("rows");
			oRowsBinding.attachCreateActivate(onCreateActivate);
			oRowsBinding.create({}, /*bAtEnd*/ true, {inactive: true});

			assert.strictEqual(oRowsBinding.getCount(), 1, "1 active entry - count 1");
			assert.strictEqual(oRowsBinding.getLength(), 2, "length is 2");

			return this.waitForChanges(assert);
		}).then(() => {
			this.expectValue("note", "Foo", 1)
				.expectValueState(oTable.getRows()[0].getCells()[0], "None", "")
				.expectValueState(oTable.getRows()[1].getCells()[0], "Error", "Item position is required")
				.expectValueState(oTable.getRows()[2].getCells()[0], "None", "");

			oTable.getRows()[1].getCells()[1].setValue("Foo");

			return this.waitForChanges(assert);
		}).then(() => {
			assert.strictEqual(oRowsBinding.getCount(), 1, "1 active entry - count 1");
			assert.strictEqual(oRowsBinding.getLength(), 3, "length is 3");

			return Promise.all([
				oRowsBinding.requestFilterForMessages(),
				this.waitForChanges(assert)
			]);
		}).then((aResults) => {
			assert.strictEqual(aResults[0], Filter.NONE, "only transient items have messages");

			this.expectValue("itemPosition", "", 0)
				.expectValue("note", "Foo", 0)
				.expectValue("note", "", 1)
				.expectValueState(oTable.getRows()[0].getCells()[0], "Error", "Item position is required")
				.expectValueState(oTable.getRows()[1].getCells()[0], "None", "")
				.expectValueState(oTable.getRows()[2].getCells()[0], "None", "");

			// code under test - no requests
			oRowsBinding.filter(aResults[0], FilterType.Application);

			assert.strictEqual(oRowsBinding.getCount(), 0, "no active entry - count 0");
			assert.strictEqual(oRowsBinding.getLength(), 2, "length is 2");

			return this.waitForChanges(assert);
		}).then(() => {
			this.expectValue("note", "Bar", 1)
				.expectValueState(oTable.getRows()[0].getCells()[0], "Error", "Item position is required")
				.expectValueState(oTable.getRows()[1].getCells()[0], "Error", "Item position is required")
				.expectValueState(oTable.getRows()[2].getCells()[0], "None", "");

			oTable.getRows()[1].getCells()[1].setValue("Bar");

			return this.waitForChanges(assert);
		}).then(() => {
			this.expectValue("itemPosition", "30", 1)
				.expectValueState(oTable.getRows()[0].getCells()[0], "Error", "Item position is required")
				.expectValueState(oTable.getRows()[1].getCells()[0], "None", "")
				.expectValueState(oTable.getRows()[2].getCells()[0], "None", "");

			oTable.getRows()[1].getCells()[0].setValue("30");

			return this.waitForChanges(assert);
		}).then(() => {
			assert.strictEqual(oRowsBinding.getCount(), 1, "one active entry - count 1");
			assert.strictEqual(oRowsBinding.getLength(), 3, "length is 3");
			if (sOperationMode === "Default" ) {
				this.expectRequest("SalesOrderSet('1')/ToLineItems/$count", "1")
					.expectRequest({
						requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=103"
					}, {
						results : [{
							__metadata : {
								uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
							},
							Note : "Bar",
							ItemPosition : "10",
							SalesOrderID : "1"
						}]
					});
			}
			this.expectValue("itemPosition", ["10", "", "30"])
				.expectValue("note", ["Bar", "Foo", "Bar"]);

			// code under test
			oRowsBinding.filter([], FilterType.Application);

			return this.waitForChanges(assert);
		}).then(() => {
			assert.strictEqual(oRowsBinding.getCount(), 2, "1 active entry - count 1");
			assert.strictEqual(oRowsBinding.getLength(), 4, "length is 4");

			return Promise.all([
				// code under test (filter out all messages)
				oRowsBinding.requestFilterForMessages(() => false),
				this.waitForChanges(assert)
			]);
		}).then((aResults) => {
			assert.strictEqual(aResults[0], null);
		});
	});
});

	//*********************************************************************************************
	// Scenario: The data state of a control in a table needs to be reevaluated if the row context changes but the
	// value of the property binding does not change.
	// JIRA: CPOUI5MODELS-1421
	QUnit.test("Filter table with messages, every line has the correct data state", function (assert) {
		let oRowsBinding, oTable;
		const oModel = createSalesOrdersModel({preliminaryContext : true});
		const oResponseMessage = this.createResponseMessage("(SalesOrderID='1',ItemPosition='20')/Note",
			"~errorMessage");
		const sView = '\
<t:Table id="table" rows="{/SalesOrderSet(\'1\')/ToLineItems}" visibleRowCount="3">\
	<Input id="note" value="{Note}" />\
</t:Table>';

		this.expectHeadRequest()
			.expectRequest({
				requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=103"
			}, {
				results : [{
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='10')"
					},
					Note : "Bar",
					ItemPosition : "10",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
					},
					Note : "Baz",
					ItemPosition : "20",
					SalesOrderID : "1"
				}, {
					__metadata : {
						uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
					},
					Note : "Baz", // same value as for 20
					ItemPosition : "30",
					SalesOrderID : "1"
				}]
			}, {
				"sap-message" : getMessageHeader(oResponseMessage)
			})
			.expectValue("note", ["Bar", "Baz", "Baz"])
			.expectMessage(oResponseMessage, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems");

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			oRowsBinding = oTable.getBinding("rows");

			this.expectValueState(oTable.getRows()[0].getCells()[0], "None", "")
				.expectValueState(oTable.getRows()[1].getCells()[0], "Error", "~errorMessage")
				.expectValueState(oTable.getRows()[2].getCells()[0], "None", "");

			return this.waitForChanges(assert);
		}).then(() => {
			this.expectRequest({
					requestUri : "SalesOrderSet('1')/ToLineItems?$skip=0&$top=103&$filter=ItemPosition gt '10'"
				}, {
					results : [{
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='20')"
						},
						Note : "Baz",
						ItemPosition : "20",
						SalesOrderID : "1"
					}, {
						__metadata : {
							uri : "SalesOrderLineItemSet(SalesOrderID='1',ItemPosition='30')"
						},
						Note : "Baz", // same value as for 20
						ItemPosition : "30",
						SalesOrderID : "1"
					}]
				}, {
					"sap-message" : getMessageHeader(oResponseMessage)
				})
				.expectValue("note", "Baz", 0)
				.expectValue("note", "", 2)
				.expectMessage(oResponseMessage, "/SalesOrderLineItemSet", "/SalesOrderSet('1')/ToLineItems", true)
				.expectValueState(oTable.getRows()[0].getCells()[0], "Error", "~errorMessage")
				.expectValueState(oTable.getRows()[1].getCells()[0], "None", "")
				.expectValueState(oTable.getRows()[2].getCells()[0], "None", "");

			// filter out item 10
			oRowsBinding.filter(new Filter({
					path : "ItemPosition",
					operator : FilterOperator.GT,
					value1 : "10"
				})
			);

			return this.waitForChanges(assert);
		});
	});
	//*********************************************************************************************
	// Scenario: A filter with fractional seconds leads to a request where the fractional seconds are considered
	// when applied to a list binding.
	// JIRA: CPOUI5MODELS-1536
	QUnit.test("ODataListBinding#filter considers additional fractional digits", function (assert) {
		const oModel = createSalesOrdersModel();
		const sView = '\
<Table id="Table" growing="true" growingThreshold="2" items="{/SalesOrderSet}\">\
	<Text id="SalesOrderID" text="{SalesOrderID}" />\
</Table>';

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=2", {
				results : [ {SalesOrderID : "1"}, {SalesOrderID : "2"} ]
			})
			.expectValue("SalesOrderID", ["1", "2"]);

		return this.createView(assert, sView, oModel).then(() => {
			this.expectRequest({
				encodeRequestUri : false,
				requestUri :"SalesOrderSet?$skip=0&$top=2&$filter=" +
					"(ChangedAt%20ge%20datetimeoffset%272024-01-06T14%3a00%3a01.000123Z%27%20and%20"
					+ "ChangedAt%20le%20datetimeoffset%272024-01-08T23%3a59%3a59.4567899Z%27)"
			}, {
				results : [ {SalesOrderID : "42"}, {SalesOrderID : "77"} ]
			})
			.expectValue("SalesOrderID", ["42", "77"]);

			const oFilter = new Filter({path : "ChangedAt", operator : FilterOperator.BT,
				value1 : new Date("2024-01-06T14:00:01Z"), value2 : new Date("2024-01-08T23:59:59.456Z")});
			oFilter.appendFractionalSeconds1("123");
			oFilter.appendFractionalSeconds2("7899");

			// code under test
			this.oView.byId("Table").getBinding("items").filter(oFilter);

			return this.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Custom headers are applied to *all* change requests when the $batch containing them is sent on
	// ODataModel#submitChangesWithChangeHeaders.
	// SNOW: CS20230004859105
	QUnit.test("ODataModel#submitChangesWithChangeHeaders: Custom headers for change requests", function (assert) {
		var oModel = createSalesOrdersModel({
				defaultBindingMode : BindingMode.TwoWay,
				refreshAfterChange : false // suppress GETs on collection after POST to reduce test complexity
			}),
			mModelHeaders = {
				"my-custom0" : "~custom0Global",
				"my-custom1" : "~custom1Global",
				"my-custom2" : "~custom2Global"
			},
			sView = '\
<t:Table id="table" rows="{/SalesOrderSet}" visibleRowCount="2">\
	<Text id="id" text="{SalesOrderID}" />\
	<Input id="note" value="{Note}" />\
</t:Table>',
			that = this;

		this.expectHeadRequest(mModelHeaders)
			.expectRequest({
				headers : mModelHeaders,
				requestUri : "SalesOrderSet?$skip=0&$top=102"
			}, {
				results : [{
					__metadata : { uri : "/SalesOrderSet('1')" },
					SalesOrderID : "1",
					Note : "foo"
				}, {
					__metadata : { uri : "/SalesOrderSet('2')" },
					SalesOrderID : "2",
					Note : "bar"
				}]
			})
			.expectValue("id", ["1", "2"])
			.expectValue("note", ["foo", "bar"]);

		oModel.setHeaders(mModelHeaders); // set global custom headers
		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					data : {
						__metadata : { "uri": "/SalesOrderSet('1')" },
						Note : "baz"
					},
					headers : {
						"my-custom0" : "~custom0Global",
						"my-custom1" : "~custom1Global",
						"my-custom2" : "~custom2Change",
						"my-custom-change" : "~customChange"
					},
					key : "SalesOrderSet('1')",
					method : "MERGE",
					requestUri : "SalesOrderSet('1')"
				}, NO_CONTENT)
				.expectRequest({
					created : true,
					data : {
						__metadata : { type : "GWSAMPLE_BASIC.SalesOrder" }
					},
					headers : {
						"my-create" : "~create",
						"my-custom0" : "~custom0Create",
						"my-custom1" : "~custom1Global",
						"my-custom2" : "~custom2Change",
						"my-custom-change" : "~customChange"
					},
					method : "POST",
					requestUri : "SalesOrderSet"
				}, {
					data : {
						__metadata : { uri : "SalesOrderSet('3')" },
						SalesOrderID : "3"
					},
					statusCode : 201
				})
				.expectRequest({
					headers : {
						"my-remove" : "~remove",
						"my-custom0" : "~custom0Remove",
						"my-custom1" : "~custom1Global",
						"my-custom2" : "~custom2Change",
						"my-custom-change" : "~customChange"
					},
					method : "DELETE",
					requestUri : "SalesOrderSet('2')"
				}, NO_CONTENT)
				.expectValue("id", "", 1)
				.expectValue("note", ["baz", ""]);

			// code under test: update (via two-way binding), createEntry, remove apply headers from
			//   global model headers, headers from API calls and submitChangesWithChangeHeaders in expected prio
			that.oView.byId("table").getRows()[0].getCells()[1].setValue("baz");
			oModel.createEntry("/SalesOrderSet", {
				properties : {},
				headers : {"my-create" : "~create", "my-custom0" : "~custom0Create"}
			});
			oModel.remove("/SalesOrderSet('2')", {
				groupId : "changes", // use same batch group as update and create
				headers : {"my-remove" : "~remove", "my-custom0" : "~custom0Remove"}
			});
			oModel.submitChangesWithChangeHeaders(
				{changeHeaders : {"my-custom-change" : "~customChange", "my-custom2" : "~custom2Change"}}
			);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A table is filtered via a property of a complex type which is addressed via a navigation
	// property. The binding is using the operation mode "Client".
	// SNOW: CS20230006626867
	QUnit.test("Filter via a complex type property addressed via navigation property (client)", function (assert) {
		var oModel = createSalesOrdersModel({defaultOperationMode : "Client"}),
			sView = '\
<t:Table id="Table" rows="{\
			path: \'/SalesOrderSet\',\
			parameters: {\
				expand: \'ToBusinessPartner\',\
				select: \'SalesOrderID,ToBusinessPartner/BusinessPartnerID,ToBusinessPartner/Address\'\
			}\
		}" visibleRowCount="2">\
	<Text id="SalesOrderID" text="{SalesOrderID}" />\
	<Text id="City" text="{ToBusinessPartner/Address/City}" />\
</t:Table>',
			that = this;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$expand=ToBusinessPartner"
					+ "&$select=SalesOrderID,ToBusinessPartner/BusinessPartnerID,ToBusinessPartner/Address", {
				results: [{
					__metadata: {uri: "/SalesOrderSet('1')"},
					SalesOrderID: "1",
					ToBusinessPartner: {
						__metadata: {uri: "/BusinessPartnerSet('42')"},
						BusinessPartnerID: "42",
						Address: {City: "Foo"}
					}
				}, {
					__metadata: {uri: "/SalesOrderSet('2')"},
					SalesOrderID: "2",
					ToBusinessPartner: {
						__metadata: {uri: "/BusinessPartnerSet('43')"},
						BusinessPartnerID: "43",
						Address: {City: "Bar"}
					}
				}]
			})
			.expectValue("SalesOrderID", ["1", "2"])
			.expectValue("City", ["Foo", "Bar"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectValue("SalesOrderID", "", 1)
				.expectValue("City", "", 1);

			// code under test
			that.oView.byId("Table").getBinding("rows").filter(
				new Filter({
					path: "ToBusinessPartner/Address/City",
					operator: FilterOperator.EQ,
					value1: "Foo"
				})
			);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A table is filtered via a property of a complex type which is addressed via a navigation
	// property. The binding is using the operation mode "Server".
	// SNOW: CS20230006626867
	QUnit.test("Filter via a complex type property addressed via navigation property (server)", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<t:Table id="Table" rows="{\
			path: \'/SalesOrderSet\',\
			parameters: {\
				expand: \'ToBusinessPartner\',\
				select: \'SalesOrderID,ToBusinessPartner/BusinessPartnerID,ToBusinessPartner/Address\'\
			},\
			filters : [{path: \'ToBusinessPartner/Address/City\', operator: \'EQ\', value1: \'Foo\'}]\
		}" visibleRowCount="2">\
	<Text id="SalesOrderID" text="{SalesOrderID}" />\
	<Text id="City" text="{ToBusinessPartner/Address/City}" />\
</t:Table>';

		this.expectHeadRequest()
			.expectRequest({
				encodeRequestUri: false, // the / in the filter is not escaped
				requestUri: "SalesOrderSet?$skip=0&$top=102"
					+ "&$filter=ToBusinessPartner/Address/City%20eq%20%27Foo%27"
					+ "&$expand=ToBusinessPartner"
					+ "&$select=SalesOrderID%2cToBusinessPartner%2fBusinessPartnerID%2cToBusinessPartner%2fAddress"
			}, {
				results: [{
					__metadata: {uri: "/SalesOrderSet('1')"},
					SalesOrderID: "1",
					ToBusinessPartner: {
						__metadata: {uri: "/BusinessPartnerSet('42')"},
						BusinessPartnerID: "42",
						Address: {City: "Foo"}
					}
				}]
			})
			.expectValue("SalesOrderID", ["1", ""])
			.expectValue("City", ["Foo", ""]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: If a context of a property binding is changed during an asynchronous validation, the validated value is
	// saved for the correct entity in the model.
	// JIRA: CPOUI5MODELS-1618
	QUnit.test("ODataPropertyBinding with asynchronous type validation", function (assert) {
		const oModel = createSalesOrdersModel({defaultBindingMode: BindingMode.TwoWay});
		const sView = `
<t:Table id="table" rows="{path: '/SalesOrderSet'}" visibleRowCount="2">
	<Input id="Note" value="{path: 'Note', type: 'sap.ui.model.type.String'}"/>
</t:Table>`;
		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=102", {
				results: [{
					__metadata: {uri: "/SalesOrderSet('1')"},
					SalesOrderID: "1",
					Note: "Note1"
				},
				{
					__metadata: {uri: "/SalesOrderSet('2')"},
					SalesOrderID: "2",
					Note: "Note2"
				},
				{
					__metadata: {uri: "/SalesOrderSet('3')"},
					SalesOrderID: "3",
					Note: "Note3"
				},
				{
					__metadata: {uri: "/SalesOrderSet('4')"},
					SalesOrderID: "4",
					Note: "Note4"
				}]
			})
			.expectValue("Note", ["Note1", "Note2"]);
		let fnResolveValidateValue1, fnResolveValidateValue2, oTable, pSetExternalValue1, pSetExternalValue2, oTypeMock;

		return this.createView(assert, sView, oModel).then(() => {
			this.expectValue("Note", "Note2", 1);
			this.expectValue("Note", "Note3", 2);

			oTable = this.oView.byId("table");
			const oBinding = oTable.getRows()[0].getCells()[0].getBinding("value");
			oTypeMock = this.mock(oBinding.getType());
			oTypeMock.expects("validateValue").withExactArgs("NewNote1").returns(new Promise((fnResolve) => {
				fnResolveValidateValue1 = fnResolve;
			}));
			pSetExternalValue1 = oBinding.setExternalValue("NewNote1");
			oTable.setFirstVisibleRow(1);

			return this.waitForChanges(assert, "Change first entry and scroll");
		}).then(() => {
			this.expectValue("Note", "Note3", 2);
			this.expectValue("Note", "Note4", 3);

			const oBinding = oTable.getRows()[0].getCells()[0].getBinding("value");
			oTypeMock.expects("validateValue").withExactArgs("NewNote2").returns(new Promise((fnResolve) => {
				fnResolveValidateValue2 = fnResolve;
			}));
			pSetExternalValue2 = oBinding.setExternalValue("NewNote2");
			oTable.setFirstVisibleRow(2);

			return this.waitForChanges(assert, "Change second entry and scroll again");
		}).then(() => {
			fnResolveValidateValue1();
			fnResolveValidateValue2();

			return Promise.all([pSetExternalValue1, pSetExternalValue2,
				this.waitForChanges(assert, "Validation of the changes finished")]);
		}).then(() => {
			this.expectValue("Note", "NewNote1", 0);
			this.expectValue("Note", "NewNote2", 1);

			oTable.setFirstVisibleRow(0);

			return this.waitForChanges(assert, "Scroll back up and see correct values");
		});
	});

	//*********************************************************************************************
	// Scenario: If a context of a composite binding is changed during an asynchronous validation, the validated value
	// is saved for the correct entity in the model.
	// JIRA: CPOUI5MODELS-1618
	QUnit.test("CompositeBinding with asynchronous type validation", function (assert) {
		const oModel = createSalesOrdersModel({defaultBindingMode: BindingMode.TwoWay});
		const sView = `
<t:Table id="table" rows="{path: '/SalesOrderSet'}" visibleRowCount="2">
<Input id="GrossAmount" value="{
	parts: [{path: 'GrossAmount'}, {path: 'CurrencyCode'}],
	type: 'sap.ui.model.type.Currency'}"/>
</t:Table>`;

		this.expectHeadRequest()
			.expectRequest("SalesOrderSet?$skip=0&$top=102", {
				results: [{
					__metadata: {uri: "/SalesOrderSet('1')"},
					SalesOrderID: "1",
					GrossAmount: "10",
					CurrencyCode: "EUR"
				},
				{
					__metadata: {uri: "/SalesOrderSet('2')"},
					SalesOrderID: "2",
					GrossAmount: "5",
					CurrencyCode: "JPY"
				},
				{
					__metadata: {uri: "/SalesOrderSet('3')"},
					SalesOrderID: "3",
					GrossAmount: "15",
					CurrencyCode: "USD"
				},
				{
					__metadata: {uri: "/SalesOrderSet('4')"},
					SalesOrderID: "4",
					GrossAmount: "20",
					CurrencyCode: "USDN"
				}]
			});

		let fnResolveValidateValue1;
		let fnResolveValidateValue2;
		let oTable;
		let pSetExternalValue1;
		let pSetExternalValue2;
		let oTypeMock;

		return this.createView(assert, sView, oModel).then(() => {
			oTable = this.oView.byId("table");
			assert.deepEqual(getTableContent(oTable), [["10.00\u00a0EUR"], ["5\u00a0JPY"]]);

			const oBinding = oTable.getRows()[0].getCells()[0].getBinding("value");
			oTypeMock = this.mock(oBinding.getType());
			oTypeMock.expects("validateValue").withExactArgs([16, "EUR"]).returns(new Promise((fnResolve) => {
				fnResolveValidateValue1 = fnResolve;
			}));
			pSetExternalValue1 = oBinding.setExternalValue("16 EUR");
			oTable.setFirstVisibleRow(1);

			return this.waitForChanges(assert, "Change first entry and scroll");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["5\u00a0JPY"], ["15.00\u00a0USD"]]);

			const oBinding = oTable.getRows()[0].getCells()[0].getBinding("value");
			oTypeMock.expects("validateValue").withExactArgs([29, "JPY"]).returns(new Promise((fnResolve) => {
				fnResolveValidateValue2 = fnResolve;
			}));
			pSetExternalValue2 = oBinding.setExternalValue("29 JPY");
			oTable.setFirstVisibleRow(2);

			return this.waitForChanges(assert, "Change second entry and scroll again");
		}).then(() => {
			fnResolveValidateValue1();
			fnResolveValidateValue2();

			return Promise.all([pSetExternalValue1, pSetExternalValue2,
				this.waitForChanges(assert, "Validation of the changes finished")]);
		}).then(() => {
			oTable.setFirstVisibleRow(0);

			return this.waitForChanges(assert, "Scroll back up and see correct values");
		}).then(() => {
			assert.deepEqual(getTableContent(oTable), [["16.00\u00a0EUR"], ["29\u00a0JPY"]]);
		});
	});
});
