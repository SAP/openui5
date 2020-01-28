/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/base/util/uid",
	"sap/m/ColumnListItem",
	"sap/m/CustomListItem",
	"sap/m/Text",
	"sap/ui/Device",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/AnnotationHelper",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ValueListType",
	"sap/ui/test/TestUtils",
	'sap/ui/util/XMLHelper',
	// load Table resources upfront to avoid loading times > 1 second for the first test using Table
	"sap/ui/table/Table"
], function (jQuery, Log, uid, ColumnListItem, CustomListItem, Text, Device, SyncPromise,
		Controller, View, ChangeReason, Filter, FilterOperator, Sorter, OperationMode,
		AnnotationHelper, ODataListBinding, ODataModel, ValueListType, TestUtils, XMLHelper) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0, no-sparse-arrays: 0, camelcase: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._V2MetadataConverter",
		sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		sInvalidModel = "/invalid/model/",
		sSalesOrderService = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
		sTeaBusi = "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
		rTransientPredicate = /\(\$uid=[-\w]+\)/g;

	/**
	 * Creates a V4 OData model for <code>serviceroot.svc</code>
	 * (com.odata.v4.mathias.BusinessPartnerTest).
	 *
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {ODataModel} The model
	 */
	function createBusinessPartnerTestModel(mModelParameters) {
		return createModel("/serviceroot.svc/", mModelParameters);
	}

	/**
	 * Creates an error to be used in {@link #expectRequest} similar to _Helper#createError. It is
	 * used to simulate a server error (the server responds with an error JSON) by giving an object
	 * defining the relevant <code>error</code> property of this JSON. It should contain the
	 * properties "code" and "message".
	 *
	 * When used without parameter, the function creates an error that makes the complete $batch
	 * fail with status code 500.
	 *
	 * @param {object} [oErrorResponse]
	 *   The <code>error</code> property of the simulated error response from the server
	 * @returns {Error}
	 *   The error object for {@link #expectRequest}
	 */
	function createError(oErrorResponse) {
		var oError = new Error();

		oError.status = 500;
		oError.statusText = "";
		oError.error = oErrorResponse;
		oError.message = "Communication error: " + oError.status + " " + oError.statusText;
		return oError;
	}

	/**
	 * Creates a V4 OData model.
	 *
	 * @param {string} sServiceUrl The service URL
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {sap.ui.model.odata.v4.ODataModel} The model
	 */
	function createModel(sServiceUrl, mModelParameters) {
		var mDefaultParameters = {
				groupId : "$direct",
				operationMode : OperationMode.Server,
				serviceUrl : sServiceUrl,
				synchronizationMode : "None"
			};

		return new ODataModel(jQuery.extend(mDefaultParameters, mModelParameters));
	}

	/**
	 * Creates a V4 OData model for <code>TEA_BUSI</code>.
	 *
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {sap.ui.model.odata.v4.ODataModel} The model
	 */
	function createTeaBusiModel(mModelParameters) {
		return createModel(sTeaBusi, mModelParameters);
	}

	/**
	 * Creates a V4 OData model for <code>zui5_epm_sample</code>.
	 *
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {ODataModel} The model
	 */
	function createSalesOrdersModel(mModelParameters) {
		return createModel(sSalesOrderService, mModelParameters);
	}

	/**
	 * Creates a V4 OData model for special cases (not backed by Gateway).
	 *
	 * @param {object} [mModelParameters] Map of parameters for model construction to enhance and
	 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
	 *   synchronizationMode which are set by default
	 * @returns {ODataModel} The model
	 */
	function createSpecialCasesModel(mModelParameters) {
		return createModel("/special/cases/", mModelParameters);
	}

	/**
	 *  Create a view with a relative ODataListBinding which is ready to create a new entity.
	 *
	 * @param {object} oTest The QUnit test object
	 * @param {object} assert The QUnit assert object
	 * @returns {Promise} A promise that is resolved when the view is created and ready to create
	 *   a relative entity
	 */
	function prepareTestForCreateOnRelativeBinding(oTest, assert) {
		var oModel = createTeaBusiModel({updateGroupId : "update"}),
			sView = '\
<FlexBox id="form" binding="{path : \'/TEAMS(\\\'42\\\')\',\
	parameters : {$expand : {TEAM_2_EMPLOYEES : {$select : \'ID,Name\'}}}}">\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Text id="id" text="{ID}" />\
			<Text id="text" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		oTest.expectRequest("TEAMS('42')?$expand=TEAM_2_EMPLOYEES($select=ID,Name)", {
				TEAM_2_EMPLOYEES : [
					{ID : "2", Name : "Frederic Fall"}
				]
			})
			.expectChange("id", ["2"])
			.expectChange("text", ["Frederic Fall"]);

		return oTest.createView(assert, sView, oModel);
	}

	/**
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
			'<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:t="sap.ui.table"'
			+ ' xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1">'
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
	QUnit.module("sap.ui.model.odata.v4.ODataModel.integration", {
		beforeEach : function () {
			// We use a formatter to check for property changes. However before the formatter is
			// called, the value is passed through the type's formatValue
			// (see PropertyBinding#_toExternalValue). Ensure that this result is predictable.
			sap.ui.getCore().getConfiguration().setLanguage("en-US");

			// These metadata files are _always_ faked, the query option "realOData" is ignored
			TestUtils.useFakeServer(this._oSandbox, "sap/ui/core/qunit", {
				"/invalid/model/" : {code : 500},
				"/invalid/model/$metadata" : {code : 500},
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata"
					: {source : "model/GWSAMPLE_BASIC.metadata.xml"},
				"/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/annotations.xml"
					: {source : "model/GWSAMPLE_BASIC.annotations.xml"},
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata"
					: {source : "odata/v4/data/metadata.xml"},
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/$metadata?c1=a&c2=b"
					: {source : "odata/v4/data/metadata.xml"},
				"/sap/opu/odata4/IWBEP/TEA/default/iwbep/tea_busi_product/0001/$metadata"
					: {source : "odata/v4/data/metadata_tea_busi_product.xml"},
				"/sap/opu/odata4/IWBEP/TEA/default/iwbep/tea_busi_product/0001/$metadata?c1=a&c2=b"
					: {source : "odata/v4/data/metadata_tea_busi_product.xml"},
				"/sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/$metadata"
					: {source : "model/RMTSAMPLEFLIGHT.metadata.xml"},
				"/sap/opu/odata4/sap/zui5_testv4/default/iwbep/common/0001/$metadata"
					: {source : "odata/v4/data/metadata_codelist.xml"},
				"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/$metadata"
					: {source : "odata/v4/data/metadata_zui5_epm_sample.xml"},
				"/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/$metadata?sap-client=123"
					: {source : "odata/v4/data/metadata_zui5_epm_sample.xml"},
				"/serviceroot.svc/$metadata"
					: {source : "odata/v4/data/BusinessPartnerTest.metadata.xml"},
				"/special/cases/$metadata"
					: {source : "odata/v4/data/metadata_special_cases.xml"},
				"/special/cases/$metadata?sap-client=123"
					: {source : "odata/v4/data/metadata_special_cases.xml"},
				"/special/countryoforigin/$metadata"
					: {source : "odata/v4/data/metadata_countryoforigin.xml"},
				"/special/CurrencyCode/$metadata"
					: {source : "odata/v4/data/metadata_CurrencyCode.xml"},
				"/special/Price/$metadata"
					: {source : "odata/v4/data/metadata_Price.xml"}
			});
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// Counter for batch requests
			this.iBatchNo = 0;
			// {map<string, string[]>}
			// this.mChanges["id"] is a list of expected changes for the property "text" of the
			// control with ID "id"
			this.mChanges = {};
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
			var that = this;

			function getGroupLocks() {
				return (that.oModel && that.oModel.oRequestor.aLockedGroupLocks || [])
					.filter(function (oGroupLock) {
						return oGroupLock.isLocked();
					});
			}

			function cleanup() {
				if (that.oView) {
					// avoid calls to formatters by UI5 localization changes in later tests
					that.oView.destroy();
				}
				if (that.oModel) {
					that.oModel.destroy();
				}
				// reset the language
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}

			if (getGroupLocks().length) {
				return resolveLater(function () {
					getGroupLocks().forEach(function (oGroupLock) {
						assert.ok(false, "GroupLock remained: " + oGroupLock);
					});

					cleanup();
				});
			}

			cleanup();
		},

		/**
		 * Adds a Text control with its text property bound to the given property path to the given
		 * form in the view created by {@link #createView}.
		 * Sets a formatter so that {@link #expectChange} can be used to expect change events on the
		 * text property.
		 *
		 * @param {object} oForm The form control
		 * @param {string} sPropertyPath The property path to bind the text property
		 * @param {object} assert The QUnit assert object
		 * @returns {string} The ID of the text control which can be used for {@link #expectChange}
		 */
		addToForm : function (oForm, sPropertyPath, assert) {
			var sId = "id" + sPropertyPath.replace("/", "_"),
				oText = new Text({
					id : this.oView.createId(sId),
					text : "{" + sPropertyPath + "}"
				});

			// attach formatter to check value for dynamically created control
			this.setFormatter(assert, oText, sId);
			oForm.addItem(oText);

			return sId;
		},

		/**
		 * Adds a cell with a text control with its text property bound to the given property path
		 * to the template control of the given table in the view created by {@link #createView}.
		 * Recreates the list binding as only then changes to the aggregation's template control are
		 * applied.
		 * Sets a formatter so that {@link #expectChange} can be used to expect change events on the
		 * text property.
		 *
		 * @param {object} oTable The table control
		 * @param {string} sPropertyPath The property path to bind the text property
		 * @param {object} assert The QUnit assert object
		 * @returns {string} The ID of the text control which can be used for {@link #expectChange}
		 */
		addToTable : function (oTable, sPropertyPath, assert) {
			var sId = "id" + sPropertyPath.replace("/", "_"),
				bRelative = oTable.getBinding("items").isRelative(),
				oTemplate = oTable.getBindingInfo("items").template,
				oText = new Text({
					id : this.oView.createId(sId),
					text : "{" + sPropertyPath + "}"
				});

			// attach formatter to check value for dynamically created control
			this.setFormatter(assert, oText, sId, true);
			oTemplate.addCell(oText);
			// ensure template control is not destroyed on re-creation of the "items" aggregation
			delete oTable.getBindingInfo("items").template;
			// It is not possible to modify the aggregation's template on an existing binding.
			// Hence, we have to re-create.
			oTable.bindItems(jQuery.extend({}, oTable.getBindingInfo("items"),
				{suspended : !bRelative, template : oTemplate}));

			return sId;
		},

		/**
		 * Checks that the given promise is rejected and the passed result is a cancellation error
		 * and nothing else.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {Promise} oPromise The promise to be checked
		 * @returns {Promise} A promise that resolves after the check is done
		 */
		checkCanceled : function (assert, oPromise) {
			return oPromise.then(function () {
				assert.ok(false, "unexpected success, 'canceled error' expected");
			}, function (oError) {
				assert.strictEqual(oError.canceled, true);
			});
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
					.getObject("/").map(function (oMessage) {
						var sTarget = oMessage.getTarget()
								.replace(rTransientPredicate, "($uid=...)");

						return {
							code : oMessage.getCode(),
							descriptionUrl : oMessage.getDescriptionUrl(),
							message : oMessage.getMessage(),
							persistent : oMessage.getPersistent(),
							target : sTarget,
							technical : oMessage.getTechnical(),
							technicalDetails : oMessage.getTechnicalDetails(),
							type : oMessage.getType()
						};
					}).sort(compareMessages),
				aExpectedMessages = this.aMessages.slice().sort(compareMessages);

			function compareMessages(oMessage1, oMessage2) {
				return oMessage1.message.localeCompare(oMessage2.message);
			}

			// in order to get a complete diff add technicalDetails only if needed
			aExpectedMessages.forEach(function (oExpectedMessage, i) {
				if (i < aCurrentMessages.length && !("technicalDetails" in oExpectedMessage)) {
					delete aCurrentMessages[i].technicalDetails;
				}
			});

			if (this.aMessages.bHasMatcher) {
				var oMatcher = sinon.match(aExpectedMessages);

				assert.ok(oMatcher.test(aCurrentMessages), oMatcher.message);
			} else {
				assert.deepEqual(aCurrentMessages, aExpectedMessages,
					this.aMessages.length + " expected messages in message manager");
			}
		},

		/**
		 * Creates a view with a numeric property, "enters" incorrect text to reach an invalid data
		 * state, calls resetChanges at the given object and checks that the control gets another
		 * change event.
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {function} fnGetResetable The function to determine the object to call
		 *   resetChanges at. The function gets the view as parameter.
		 * @returns {Promise} A promise that is resolved when the change event has been fired
		 */
		checkResetInvalidDataState : function (assert, fnGetResetable) {
			var oModel = createTeaBusiModel({updateGroupId : "update"}),
				sView = '\
<FlexBox id="form" binding="{/EMPLOYEES(\'2\')}">\
	<Text id="age" text="{AGE}" />\
</FlexBox>',
				that = this;

			this.expectRequest("EMPLOYEES('2')", {AGE : 32})
				.expectChange("age", "32");

			return this.createView(assert, sView, oModel).then(function () {
				var oBinding = that.oView.byId("age").getBinding("text"),
					fnFormatter = oBinding.fnFormatter;

				delete oBinding.fnFormatter;
				assert.throws(function () {
					oBinding.setExternalValue("bad");
				});
				assert.ok(oBinding.getDataState().isControlDirty());

				oBinding.fnFormatter = fnFormatter;

				that.expectChange("age", "32");

				// code under test
				// Note: $direct would be an "Invalid group ID" here
				fnGetResetable(that.oView).resetChanges();

				return that.waitForChanges(assert);
			});
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
				aExpectedValues = vRow === undefined
					? this.mChanges[sControlId]
					: this.mListChanges[sControlId] && this.mListChanges[sControlId][vRow],
				sVisibleId = vRow === undefined ? sControlId : sControlId + "[" + vRow + "]";

			if (!aExpectedValues || !aExpectedValues.length) {
				if (!(sControlId in this.mIgnoredChanges && sValue === null)) {
					assert.ok(false, sVisibleId + ": " + JSON.stringify(sValue) + " (unexpected)");
				}
			} else {
				sExpectedValue = aExpectedValues.shift();
				// Note: avoid bad performance of assert.strictEqual(), e.g. DOM manipulation
				if (sValue !== sExpectedValue || vRow === undefined || typeof vRow !== "number"
						|| vRow < 10) {
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
		 * Creates a V4 OData model for V2 service <code>RMTSAMPLEFLIGHT</code>.
		 *
		 * @param {object} mModelParameters Map of parameters for model construction to enhance and
		 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
		 *   synchronizationMode which are set by default
		 * @returns {ODataModel} The model
		 */
		createModelForV2FlightService : function (mModelParameters) {
			var oLogMock = this.oLogMock;

			// The following warnings are logged when the RMTSAMPLEFLIGHT metamodel is loaded
			["semantics", "creatable", "creatable", "semantics", "semantics", "value-list",
				"value-list", "label", "label", "value-list", "value-list", "value-list",
				"value-list", "value-list", "value-list", "value-list", "label", "label",
				"supported-formats", "addressable", "value-list"
			].forEach(function (sAnnotation) {
				oLogMock.expects("warning")
					.withExactArgs("Unsupported annotation 'sap:" + sAnnotation + "'",
						sinon.match.string, sClassName);
			});

			mModelParameters = jQuery.extend({}, {odataVersion : "2.0"}, mModelParameters);

			return createModel("/sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/", mModelParameters);
		},

		/**
		 * Creates a V4 OData model for V2 service <code>GWSAMPLE_BASIC</code>.
		 *
		 * @param {object} mModelParameters Map of parameters for model construction to enhance and
		 *   potentially overwrite the parameters groupId, operationMode, serviceUrl,
		 *   synchronizationMode which are set by default
		 * @returns {ODataModel} The model
		 */
		createModelForV2SalesOrderService : function (mModelParameters) {
			var oLogMock = this.oLogMock;

			// The following warnings are logged when the GWSAMPLE_BASIC metamodel is loaded
			["filterable", "sortable"].forEach(function (sAnnotation) {
				oLogMock.expects("warning")
					.withExactArgs("Unsupported SAP annotation at a complex type in"
						+ " '/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/$metadata'",
						"sap:" + sAnnotation + " at property 'GWSAMPLE_BASIC.CT_String/String'",
						sClassName);
			});

			mModelParameters = jQuery.extend({}, {odataVersion : "2.0"}, mModelParameters);

			return createModel("/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/", mModelParameters);
		},

		/**
		 * Helper to create a third sales order in a table. Performs checks on change events,
		 * requests and $count.
		 *
		 * @returns {sap.ui.model.odata.v4.Context} Context of the created sales order
		 */
		createThird : function () {
			this.expectChange("count", "4")
				.expectChange("id", ["", "44", "43", "42"])
				.expectChange("note", ["New 3", "New 2", "New 1", "First SalesOrder"]);

			return this.oView.byId("table").getBinding("items").create({Note : "New 3"}, true);
		},

		/**
		 * Helper to create two sales orders in a table, saved after each create. Performs checks on
		 * change events, requests and $count.
		 *
		 * @param {object} assert The QUnit assert object
		 * @returns {Promise} Promise resolving when the test is through
		 */
		createTwiceSaveInBetween : function (assert) {
			var oBinding,
				oCreatedContext,
				oModel = createSalesOrdersModel({
					autoExpandSelect : true,
					updateGroupId : "update"
				}),
				sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=100", {
//					"@odata.count" : "1", // short read no $count parameter needed
					value : [{
						Note : "First SalesOrder",
						SalesOrderID : "42"
					}]
				})
				.expectChange("count")
				.expectChange("id", ["42"])
				.expectChange("note", ["First SalesOrder"]);

			return this.createView(assert, sView, oModel).then(function () {
				oBinding = that.oView.byId("table").getBinding("items");

				that.expectChange("count", "1");

				that.oView.byId("count").setBindingContext(oBinding.getHeaderContext());

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectChange("count", "2")
					.expectChange("id", ["", "42"])
					.expectChange("note", ["New 1", "First SalesOrder"]);

				oCreatedContext = oBinding.create({Note : "New 1"}, true);

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectRequest({
						method : "POST",
						url : "SalesOrderList",
						payload : {Note : "New 1"}
					}, {
						Note : "New 1",
						SalesOrderID : "43"
					})
					.expectChange("id", ["43"]);

				return Promise.all([
					oCreatedContext.created(),
					that.oModel.submitBatch("update"),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				that.expectChange("count", "3")
					.expectChange("id", ["", "43", "42"])
					.expectChange("note", ["New 2", "New 1", "First SalesOrder"]);

				oCreatedContext = oBinding.create({Note : "New 2"}, true);

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectRequest({
						method : "POST",
						url : "SalesOrderList",
						payload : {Note : "New 2"}
					}, {
						Note : "New 2",
						SalesOrderID : "44"
					})
					.expectChange("id", ["44"]);

				return Promise.all([
					oCreatedContext.created(),
					that.oModel.submitBatch("update"),
					that.waitForChanges(assert)
				]);
			});
		},

		/**
		 * Creates the view and attaches it to the model. Checks that the expected requests (see
		 * {@link #expectRequest} are fired and the controls got the expected changes (see
		 * {@link #expectChange}).
		 *
		 * @param {object} assert The QUnit assert object
		 * @param {string} sViewXML The view content as XML
		 * @param {sap.ui.model.odata.v4.ODataModel} [oModel] The model; it is attached to the view
		 *   and to the test instance.
		 *   If no model is given, <code>createTeaBusiModel</code> is used.
		 * @param {object} [oController]
		 *   An object defining the methods and properties of the controller
		 * @param {object} [mPreprocessors] A map from the specified preprocessor type (e.g. "xml")
		 *    to a preprocessor configuration, see {@link @sap.ui.core.mvc.View.create}
		 * @returns {Promise} A promise that is resolved when the view is created and all expected
		 *   values for controls have been set
		 */
		createView : function (assert, sViewXML, oModel, oController, mPreprocessors) {
			var fnLockGroup,
				that = this;

			/*
			 * Stub function for _Requestor#sendBatch. Checks that all requests in the batch are as
			 * expected.
			 *
			 * @param {object[]} aRequests The array of requests in a $batch
			 * @returns {Promise} A promise on the array of batch responses
			 */
			function checkBatch(aRequests) {
				/**
				 * Processes a request or a change set within a batch/change set.
				 * @param {number} iChangeSetNo Number of the change set in the current batch
				 *   starting with 1; a value of 0 indicates that the request is not part of a
				 *   change set
				 * @param {object} oRequest The request
				 * @param {number} i The request's position in the batch/change set
				 * @returns {Promise} A promise resolving with an object suitable for visit of
				 *   _Requestor#submitBatch
				 */
				function processRequest(iChangeSetNo, oRequest, i) {
					if (Array.isArray(oRequest)) {
						return processRequests(oRequest, i + 1);
					}
					return checkRequest(oRequest.method, oRequest.url, oRequest.headers,
						oRequest.body, undefined, that.iBatchNo, iChangeSetNo || i + 1
					).catch(function (oError) {
						if (oError.error) {
							// convert the error back to a response
							return {
								headers : {"Content-Type" : "application/json"},
								status : oError.status,
								body : {error : oError.error}
							};
						}
						// a technical error -> let the $batch itself fail
						throw oError;
					}).then(function (oResponse) {
						var mHeaders = oResponse.messages
								? Object.assign({}, oResponse.headers,
									{"sap-messages" : oResponse.messages})
								: oResponse.headers;

						return {
							headers : mHeaders,
							status : oResponse.status || 200,
							responseText : JSON.stringify(oResponse.body)
						};
					});
				}

				/*
				 * @param {object[]} aRequests The array of requests in a $batch or in a change set
				 * @param {number} iChangeSetNo Number of the change set in the current batch
				 *   starting with 1; a value of 0 indicates that the request is not part of a
				 *   change set
				 * @returns {Promise} A promise on the array of batch responses
				 */
				function processRequests(aRequests0, iChangeSetNo) {
					return Promise.all(
						aRequests0.map(processRequest.bind(null, iChangeSetNo))
					).then(function (aResponses) {
						var iErrorIndex = aResponses.findIndex(function (oResponse) {
								return oResponse.status >= 300;
							});

						if (iErrorIndex >= 0) {
							return iChangeSetNo
								? aResponses[iErrorIndex] // only one error for the whole change set
								: aResponses.slice(0, iErrorIndex + 1);
						}
						return aResponses;
					});
				}

				that.iBatchNo += 1;

				return processRequests(aRequests, 0);
			}

			/*
			 * Stub function for _Requestor#sendRequest. Checks that the expected request arrived
			 * and returns a promise for its response.
			 *
			 * @param {string} sMethod The request method
			 * @param {string} sUrl The request URL
			 * @param {object} mHeaders The headers (including various generic headers)
			 * @param {object|string} [vPayload] The payload (string from the requestor, object from
			 *   checkBatch)
			 * @param {string} [sOriginalResourcePath] The path by which the resource has originally
			 *   been requested
			 * @param {number} [iBatchNo] Number of the batch which the request belongs to
			 * @param {number} [iChangeSetNo] Number of the change set in the current batch which
			 *   the request is expected to belong to
			 * @returns {Promise} A promise resolving with an object having following properties:
			 *     {string|object} body - The response body of the matching request
			 *     {string} [messages] - The messages contained in the "sap-messages" response
			 *       header as a JSON string
			 *     {string} resourcePath - The value of "sUrl"
			 *   If the response (see #expectRequest) is of type "Error" the promise rejects with
			 *   the error.
			 */
			function checkRequest(sMethod, sUrl, mHeaders, vPayload, sOriginalResourcePath,
					iBatchNo, iChangeSetNo) {
				var oActualRequest = {
						method : sMethod,
						url : sUrl,
						headers : mHeaders,
						payload : typeof vPayload === "string" ? JSON.parse(vPayload) : vPayload
					},
					oExpectedRequest = that.consumeExpectedRequest(oActualRequest),
					sIfMatchValue,
					oResponse,
					mResponseHeaders,
					bWaitForResponse = true;

				function checkFinish() {
					if (!that.aRequests.length && !that.iPendingResponses) {
						// give some time to process the response
						setTimeout(that.checkFinish.bind(that, assert), 0);
					}
				}

				delete mHeaders["Accept"];
				delete mHeaders["Accept-Language"];
				delete mHeaders["Content-Type"];
				// if "If-Match" is an object the "@odata.etag" property contains the etag
				if (mHeaders["If-Match"] && typeof mHeaders["If-Match"] === "object") {
					sIfMatchValue = mHeaders["If-Match"]["@odata.etag"];
					if (sIfMatchValue === undefined) {
						delete mHeaders["If-Match"];
					} else {
						mHeaders["If-Match"] = sIfMatchValue;
					}
				}
				if (oExpectedRequest) {
					oResponse = oExpectedRequest.response;
					bWaitForResponse = !(oResponse && typeof oResponse.then === "function");
					mResponseHeaders = oExpectedRequest.responseHeaders;
					delete oExpectedRequest.response;
					delete oExpectedRequest.responseHeaders;
					if ("batchNo" in oExpectedRequest) {
						oActualRequest.batchNo = iBatchNo;
					}
					if ("changeSetNo" in oExpectedRequest) {
						oActualRequest.changeSetNo = iChangeSetNo;
					}
					assert.deepEqual(oActualRequest, oExpectedRequest, sMethod + " " + sUrl);
				} else {
					assert.ok(false, sMethod + " " + sUrl + " (unexpected)");
					oResponse = {value : []}; // dummy response to avoid further errors
					mResponseHeaders = {};
				}

				if (bWaitForResponse) {
					that.iPendingResponses += 1;
				} else {
					checkFinish();
				}

				return Promise.resolve(oResponse).then(function (oResponseBody) {
					if (oResponseBody instanceof Error) {
						oResponseBody.requestUrl = that.oModel.sServiceUrl + sUrl;
						oResponseBody.resourcePath = sOriginalResourcePath;
						throw oResponseBody;
					}

					return {
						body : oResponseBody,
						messages : mResponseHeaders["sap-messages"],
						resourcePath : sUrl
					};
				}).finally(function () {
					if (bWaitForResponse) {
						that.iPendingResponses -= 1;
					}
					// Waiting may be over after the promise has been handled
					checkFinish();
				});
			}

			// A wrapper for _Requestor#lockGroup that attaches a stack trace to the lock
			function lockGroup() {
				var oError,
					oLock = fnLockGroup.apply(this, arguments);

				if (!oLock.sStack) {
					oError = new Error();
					if (oError.stack) {
						oLock.sStack = oError.stack.split("\n").slice(2).join("\n");
					}
				}

				return oLock;
			}

			this.oModel = oModel || createTeaBusiModel();
			if (this.oModel.submitBatch) {
				// stub request methods for the requestor prototype to also check requests from
				// "hidden" model instances like the code list model
				this.mock(Object.getPrototypeOf(this.oModel.oRequestor)).expects("sendBatch")
					.atLeast(0).callsFake(checkBatch);
				this.mock(Object.getPrototypeOf(this.oModel.oRequestor)).expects("sendRequest")
					.atLeast(0).callsFake(checkRequest);
				fnLockGroup = this.oModel.oRequestor.lockGroup;
				this.oModel.oRequestor.lockGroup = lockGroup;
			} // else: it's a meta model
			//assert.ok(true, sViewXML); // uncomment to see XML in output, in case of parse issues

			return View.create({
				type : "XML",
				controller : oController && new (Controller.extend(uid(), oController))(),
				definition : xml(sViewXML),
				preprocessors : mPreprocessors
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
		 * values for each row if the control is created via a template in a list. Use a sparse list
		 * if changes are expected for some rows only.
		 *
		 * You must call the function before {@link #createView}, even if you do not expect a change
		 * to the control's value initially. This is necessary because createView must attach a
		 * formatter function to the binding info before the bindings are created in order to see
		 * the change. If you do not expect a value initially, leave out the vValue parameter or use
		 * an empty array.
		 *
		 * Examples:
		 * this.expectChange("foo", "bar"); // expect value "bar" for the control with ID "foo"
		 * this.expectChange("foo"); // listen to changes for the control with ID "foo", but do not
		 *                           // expect a change (in createView)
		 * this.expectChange("foo", []); // listen to changes for the control with ID "foo", but do
		 *                               // not expect a change (in createView). To be used if the
		 *                               // control is a template within a table.
		 * this.expectChange("foo", ["a", "b"]); // expect values for two rows of the control with
		 *                                       // ID "foo"
		 * this.expectChange("foo", ["a",,"b"]); // expect values for the rows 0 and 2 of the
		 *                                       // control with the ID "foo", because this is a
		 *                                       // sparse array in which index 1 is unset
		 * this.expectChange("foo", "d", "/MyEntitySet/ID");
		 *                                 // expect value "d" for control with ID "foo" in a
		 *                                 // metamodel table on "/MyEntitySet/ID"
		 * this.expectChange("foo", "bar").expectChange("foo", "baz"); // expect 2 changes for "foo"
		 * this.expectChange("foo", null, null); // table.Table sets the binding context on an
		 *                                       // existing row to null when scrolling
		 * this.expectChange("foo", null); // row is deleted in table.Table so that its context is
		 *                                 // destroyed
		 *
		 * @param {string} sControlId The control ID
		 * @param {string|string[]|number|number[]} [vValue] The expected value or a list of
		 *   expected values
		 * @param {string} [sRow] (Only for metamodel tests) The path of the binding's parent
		 *   context, in case that a change is expected for a single row of a list; in this case
		 *   <code>vValue</code> must be a string
		 * @returns {object} The test instance for chaining
		 */
		expectChange : function (sControlId, vValue, sRow) {
			var aExpectations;

			// Ensures that oObject[vProperty] is an array and returns it
			function array(oObject, vProperty) {
				oObject[vProperty] = oObject[vProperty] || [];

				return oObject[vProperty];
			}

			if (arguments.length === 3) {
				aExpectations = array(this.mListChanges, sControlId);
				// This may create a sparse array this.mListChanges[sControlId]
				array(aExpectations, sRow).push(vValue);
			} else if (Array.isArray(vValue)) {
				aExpectations = array(this.mListChanges, sControlId);
				vValue.forEach(function (vRowValue, i) {
					array(aExpectations, i).push(vRowValue);
				});
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
		 * {@link #waitForChanges}) is expected to report exactly the given messages. All expected
		 * messages should have a different message text.
		 *
		 * @param {object[]} aExpectedMessages The expected messages (with properties code, message,
		 *   target, persistent, technical and type corresponding the getters of
		 *   sap.ui.core.message.Message)
		 * @param {boolean} [bHasMatcher] Whether the expected messages have a Sinon.JS matcher
		 * @returns {object} The test instance for chaining
		 */
		expectMessages : function (aExpectedMessages, bHasMatcher) {
			this.aMessages = aExpectedMessages.map(function (oMessage) {
				oMessage.descriptionUrl = oMessage.descriptionUrl || undefined;
				oMessage.technical = oMessage.technical || false;
				return oMessage;
			});
			this.aMessages.bHasMatcher = bHasMatcher;

			return this;
		},

		/**
		 * The following code (either {@link #createView} or anything before
		 * {@link #waitForChanges}) is expected to perform the given request. <code>oResponse</code>
		 * describes how to react on the request. Usually you simply give the JSON for the response
		 * and the request will be responded in the next microtask.
		 *
		 * A failure response (with status code 500) is mocked if <code>oResponse</code> is an
		 * Error. This error must be created with {@link #createError}. It is immediately used to
		 * reject the promise of _Requestor#request for a $direct request.
		 *
		 * If the request is part of a $batch, there are two possibilities.
		 * <ul>
		 *   <li> If the error was created with an error object, {@link #checkBatch} converts it to
		 *     a response and inserts it into the $batch response. If the request is part of a
		 *     change set, the error is used as a response for the complete change set (the
		 *     following requests do not need a response). GET requests following an error request
		 *     are rejected automatically and do not need a response.
	     *   <li> If the error was created without an error object, the complete $batch fails with
		 *     status code 500.
		 * </ul>
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
					method : "GET",
					url : vRequest
				};
			}
			// ensure that these properties are defined (required for deepEqual)
			vRequest.headers = vRequest.headers || {};
			vRequest.payload = vRequest.payload || undefined;
			vRequest.responseHeaders = mResponseHeaders || {};
			vRequest.response = oResponse || {/*null object pattern*/};
			vRequest.url = vRequest.url.replace(/ /g, "%20");
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
		 * null. This may happen when the property is part of a list, this list is reset and the
		 * request to deliver the new value is slowed down due to a group lock. (Then the row
		 * context might be destroyed in a prerendering task.)
		 *
		 * @param {string} sControlId The control ID
		 * @returns {object} The test instance for chaining
		 */
		ignoreNullChanges : function (sControlId) {
			this.mIgnoredChanges[sControlId] = true;

			return this;
		},

		/**
		 * Removes the control with the given ID from the given form in the view created by
		 * {@link #createView}.
		 *
		 * @param {object} oForm The form control
		 * @param {string} sControlId The ID of the control to remove
		 */
		removeFromForm : function (oForm, sControlId) {
			oForm.removeItem(this.oView.createId(sControlId));
		},

		/**
		 * Removes the control with the given ID from the given form in the view created by
		 * {@link #createView}.
		 * Recreates the list binding as only then changes to the aggregation's template control are
		 * applied.
		 *
		 * @param {object} oTable The table control
		 * @param {string} sControlId The ID of the control to remove
		 */
		removeFromTable : function (oTable, sControlId) {
			var bRelative = oTable.getBinding("items").isRelative(),
				oTemplate = oTable.getBindingInfo("items").template;

			oTemplate.removeCell(this.oView.byId(sControlId));
			// ensure template control is not destroyed on re-creation of the "items" aggregation
			delete oTable.getBindingInfo("items").template;
			oTable.bindItems(jQuery.extend({}, oTable.getBindingInfo("items"),
				{suspended : !bRelative, template : oTemplate}));
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
					assert.ok(false, oRequest.method + " " + oRequest.url + " (not requested)");
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
	 *   If no model is given, the <code>TEA_BUSI</code> model is created and used.
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

	/**
	 * Test that the template output is as expected.
	 *
	 * @param {sString} sTitle The title of the test case
	 * @param {object} oXMLPreprocessorConfig Holds a preprocessor configuration for type "xml",
	 *    see {@link @sap.ui.core.mvc.View.create}
	 * @param {string} sTemplate The template used to generate the expected view as XML
	 * @param {string} sView The expected resulting view from templating
	 *
	 * @private
	 */
	function testXMLTemplating(sTitle, oXMLPreprocessorConfig, sTemplate, sView) {
		/*
		 * Remove all namespaces and all spaces before tag ends (..."/>) and all tabs from the
		 * given XML string.
		 *
		 * @param {string} sXml
		 *   XML string
		 * @returns {string}
		 *   Normalized XML string
		 */
		function _normalizeXml(sXml) {
			/*jslint regexp: true*/
			sXml = sXml
			// Note: IE > 8 does not add all namespaces at root level, but deeper inside the tree!
			// Note: Chrome adds all namespaces at root level, but before other attributes!
				.replace(/ xmlns.*?=\".*?\"/g, "")
				// Note: browsers differ in whitespace for empty HTML(!) tags
				.replace(/ \/>/g, '/>')
				// Replace all tabulators
				.replace(/\t/g, "");
			if (Device.browser.msie || Device.browser.edge) {
				// Microsoft shuffles attribute order; sort multiple attributes alphabetically:
				// - no escaped quotes in attribute values!
				// - e.g. <In a="..." b="..."/> or <template:repeat a="..." t:b="...">
				sXml = sXml.replace(/<[\w:]+( [\w:]+="[^"]*"){2,}(?=\/?>)/g, function (sMatch) {
					var aParts = sMatch.split(" ");
					// aParts[0] e.g. "<In" or "<template:repeat"
					// sMatch does not contain "/>" or ">" at end!
					return aParts[0] + " " + aParts.slice(1).sort().join(" ");
				});
			}
			return sXml;
		}


		QUnit.test(sTitle, function (assert) {
			var that = this;

			// allow indents in expectation
			sView = sView.replace(/\t/g, "");

			return this.createView(assert, sTemplate, undefined, undefined,
				{xml : oXMLPreprocessorConfig}).then(function () {
					assert.strictEqual(
						_normalizeXml(XMLHelper.serialize(that.oView._xContent)),
						_normalizeXml(XMLHelper.serialize(xml(sView)))
					);
			});
		});
	}

	//*********************************************************************************************
	// verify that error responses are processed correctly for direct requests
	QUnit.test("error response: $direct (framework test)", function (assert) {
		var oError = createError({
				code : "Code",
				message : "Request intentionally failed"
			}),
			sView = '<Text text="{/EMPLOYEES(\'1\')/ID}" />';

		this.oLogMock.expects("error").withArgs("Failed to read path /EMPLOYEES('1')/ID");

		this.expectRequest("EMPLOYEES('1')/ID", oError)
			.expectMessages([{
				code : "Code",
				descriptionUrl : undefined,
				message : "Request intentionally failed",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// verify that error responses are processed correctly for batch requests
	QUnit.test("error response: $batch (framework test)", function (assert) {
		var oError = createError({
				code : "Code",
				message : "Request intentionally failed"
			}),
			sView = '\
<Text text="{/EMPLOYEES(\'1\')/ID}" />\
<Text text="{/EMPLOYEES(\'2\')/Name}" />';

		this.oLogMock.expects("error").withArgs("Failed to read path /EMPLOYEES('1')/ID");
		this.oLogMock.expects("error").withArgs("Failed to read path /EMPLOYEES('2')/Name");

		this.expectRequest("EMPLOYEES('1')/ID", oError)
			.expectRequest("EMPLOYEES('2')/Name") // no response required
			.expectMessages([{
				code : "Code",
				descriptionUrl : undefined,
				message : "Request intentionally failed",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		return this.createView(assert, sView, createTeaBusiModel({groupId : "$auto"}));
	});

	//*********************************************************************************************
	// verify that error responses are processed correctly for change sets
	QUnit.test("error response: $batch w/ change set (framework test)", function (assert) {
		var oModel = createSalesOrdersModel({groupId : "$auto"}),
			sView = '\
<Table id="table" items="{/SalesOrderList}" >\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Input id="note" value="{Note}" />\
	</ColumnListItem>\
</Table>\
<Text id="name" text="{/BusinessPartnerList(\'1\')/CompanyName}" />',
			that = this;

		this.expectRequest("SalesOrderList?$skip=0&$top=100", {
				value : [
					{SalesOrderID : "1", Note : "Note 1"},
					{SalesOrderID : "2", Note : "Note 2"}
				]
			})
			.expectRequest("BusinessPartnerList('1')/CompanyName", {value : "SAP SE"})
			.expectChange("id", ["1", "2"])
			.expectChange("note", ["Note 1", "Note 2"])
			.expectChange("name", "SAP SE");

		return this.createView(assert, sView, oModel).then(function () {
			var aTableRows = that.oView.byId("table").getItems(),
				oError = createError({
					code : "Code",
					message : "Request intentionally failed"
				});

			that.oLogMock.expects("error")
				.withArgs("Failed to update path /SalesOrderList('1')/Note");
			that.oLogMock.expects("error")
				.withArgs("Failed to update path /SalesOrderList('2')/Note");
			that.oLogMock.expects("error")
				.withArgs("Failed to read path /BusinessPartnerList('1')/CompanyName");

			that.expectChange("note", ["Note 1 changed", "Note 2 changed"])
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('1')",
					payload : {Note : "Note 1 changed"}
				}, oError)
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('2')",
					payload : {Note : "Note 2 changed"}
				}) // no response required
				.expectRequest("BusinessPartnerList('1')/CompanyName") // no response required
				.expectChange("name", null)
				.expectMessages([{
					code : "Code",
					descriptionUrl : undefined,
					message : "Request intentionally failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			aTableRows[0].getCells()[1].getBinding("value").setValue("Note 1 changed");
			aTableRows[1].getCells()[1].getBinding("value").setValue("Note 2 changed");
			that.oView.byId("name").getBinding("text").refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Minimal test for an absolute ODataPropertyBinding. This scenario is comparable with
	// "FavoriteProduct" in the SalesOrders application.
	testViewStart("Absolute ODPB",
		'<Text id="text" text="{/EMPLOYEES(\'2\')/Name}" />',
		{"EMPLOYEES('2')/Name" : {value : "Frederic Fall"}},
		{text : "Frederic Fall"}
	);

	//*********************************************************************************************
	// Scenario: Minimal test for an absolute ODataContextBinding without own parameters containing
	// a relative ODataPropertyBinding. The SalesOrders application does not have such a scenario.
	testViewStart("Absolute ODCB w/o parameters with relative ODPB", '\
<FlexBox binding="{/EMPLOYEES(\'2\')}">\
	<Text id="text" text="{Name}" />\
</FlexBox>',
		{"EMPLOYEES('2')" : {Name : "Frederic Fall"}},
		{text : "Frederic Fall"}
	);

	//*********************************************************************************************
	// Scenario: Minimal test for an absolute ODataContextBinding with own parameters containing
	// a relative ODataPropertyBinding. The SalesOrders application does not have such a scenario.
	testViewStart("Absolute ODCB with parameters and relative ODPB", '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'Name\'}}">\
	<Text id="text" text="{Name}" />\
</FlexBox>',
		{"EMPLOYEES('2')?$select=Name" : {Name : "Frederic Fall"}},
		{text : "Frederic Fall"}
	);

	//*********************************************************************************************
	// Scenario: Minimal test for an absolute ODataListBinding without own parameters containing
	// a relative ODataPropertyBinding. This scenario is comparable with the suggestion list for
	// the "Buyer ID" while creating a new sales order in the SalesOrders application.
	// * Start the application and click on "Create sales order" button.
	// * Open the suggestion list for the "Buyer ID"
	testViewStart("Absolute ODLB w/o parameters and relative ODPB", '\
<Table items="{/EMPLOYEES}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
		{"EMPLOYEES?$skip=0&$top=100" :
			{value : [{Name : "Frederic Fall"}, {Name : "Jonathan Smith"}]}},
		{text : ["Frederic Fall", "Jonathan Smith"]}
	);

	//*********************************************************************************************
	// Scenario: Minimal test for an absolute ODataListBinding with own parameters containing
	// a relative ODataPropertyBinding. This scenario is comparable with the "Sales Orders" list in
	// the SalesOrders application.
	testViewStart("Absolute ODLB with parameters and relative ODPB", '\
<Table items="{path : \'/EMPLOYEES\', parameters : {$select : \'Name\'}}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
		{"EMPLOYEES?$select=Name&$skip=0&$top=100" :
			{value : [{Name : "Frederic Fall"}, {Name : "Jonathan Smith"}]}},
		{text : ["Frederic Fall", "Jonathan Smith"]}
	);

	//*********************************************************************************************
	// Scenario: Static and dynamic filters and sorters at absolute ODataListBindings influence
	// the query. This scenario is comparable with the "Sales Orders" list in the SalesOrders
	// application.
	// * Static filters ($filter system query option) are and-combined with dynamic filters (filter
	//   parameter)
	// * Static sorters ($orderby system query option) are appended to dynamic sorters (sorter
	//   parameter)
	testViewStart("Absolute ODLB with Filters and Sorters with relative ODPB", '\
<Table items="{path : \'/EMPLOYEES\', parameters : {\
			$select : \'Name\',\
			$filter : \'TEAM_ID eq 42\',\
			$orderby : \'Name desc\'\
		},\
		filters : {path : \'AGE\', operator : \'GT\', value1 : 21},\
		sorter : {path : \'AGE\'}\
	}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
		{"EMPLOYEES?$select=Name&$filter=AGE gt 21 and (TEAM_ID eq 42)&$orderby=AGE,Name desc&$skip=0&$top=100" :
			{value : [{Name : "Frederic Fall"}, {Name : "Jonathan Smith"}]}},
		{text : ["Frederic Fall", "Jonathan Smith"]}
	);

	//*********************************************************************************************
	// Scenario: Dependent list binding with own parameters causes a second request.
	// This scenario is similar to the "Sales Order Line Items" in the SalesOrders application.
	testViewStart("Absolute ODCB with parameters and relative ODLB with parameters", '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'Name\'}}">\
	<Text id="name" text="{Name}" />\
	<Table items="{path : \'EMPLOYEE_2_EQUIPMENTS\', parameters : {$select : \'Category\'}}">\
		<ColumnListItem>\
			<Text id="category" text="{Category}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
		{
			"EMPLOYEES('2')?$select=Name" : {Name : "Frederic Fall"},
			"EMPLOYEES('2')/EMPLOYEE_2_EQUIPMENTS?$select=Category&$skip=0&$top=100" :
				{value : [{Category : "Electronics"}, {Category : "Furniture"}]}
		},
		{name : "Frederic Fall", category : ["Electronics", "Furniture"]}
	);

	//*********************************************************************************************
	// Scenario: Rebind a table that uses the cache of the form, so that a list binding is created
	// for which the data is already available in the cache. Ensure that it does not deliver the
	// contexts in getContexts for the initial refresh event, but fires an additional change event.
	// BCP: 1980383883
	QUnit.test("Relative ODLB created on a cache that already has its data", function (assert) {
		var sView = '\
<FlexBox id="form"\
		binding="{path : \'/TEAMS(\\\'1\\\')\', parameters : {$expand : \'TEAM_2_EMPLOYEES\'}}">\
	<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', templateShareable : true}">\
		<ColumnListItem>\
			<Text id="name" text="{Name}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			oTable,
			that = this;

		this.expectRequest("TEAMS('1')?$expand=TEAM_2_EMPLOYEES", {
				TEAM_2_EMPLOYEES : [{
					ID : "2",
					Name : "Frederic Fall"
				}]
			})
			.expectChange("name", ["Frederic Fall"]);

		return this.createView(assert, sView).then(function () {
			var oBindingInfo;

			oTable = that.oView.byId("table");
			oBindingInfo = oTable.getBindingInfo("items");
			oTable.unbindAggregation("items");

			assert.strictEqual(oTable.getItems().length, 0);

			that.expectChange("name", ["Frederic Fall"]);

			// code under test
			oTable.bindItems(oBindingInfo);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getItems().length, 1);
		});
	});

	//*********************************************************************************************
	// Scenario: Function import.
	// This scenario is similar to the "Favorite product ID" in the SalesOrders application. In the
	// SalesOrders application the binding context is set programmatically. This example directly
	// triggers the function import.
	testViewStart("FunctionImport", '\
<FlexBox binding="{/GetEmployeeByID(EmployeeID=\'2\')}">\
	<Text id="text" text="{Name}" />\
</FlexBox>',
		{"GetEmployeeByID(EmployeeID='2')" : {Name : "Frederic Fall"}},
		{text : "Frederic Fall"}
	);

	//*********************************************************************************************
	// Scenario: Request contexts from an ODataListBinding not bound to any control
	// JIRA: CPOUI5UISERVICESV3-1396
	QUnit.test("OLDB#requestContexts standalone", function (assert) {
		var oPromise,
			that = this;

		return this.createView(assert, "", createSalesOrdersModel()).then(function () {
			var oBinding = that.oModel.bindList("/SalesOrderList");

			// code under test
			oPromise = oBinding.requestContexts(0, 3, "group").then(function (aContexts) {
				assert.deepEqual(aContexts.map(function (oContext) {
					return oContext.getPath();
				}), [
					"/SalesOrderList('01')",
					"/SalesOrderList('02')",
					"/SalesOrderList('03')"
				]);
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList?$skip=0&$top=3", {
				value : [
					{SalesOrderID : "01"},
					{SalesOrderID : "02"},
					{SalesOrderID : "03"}
				]
			});

			return Promise.all([
				oPromise,
				that.oModel.submitBatch("group"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Request contexts from an ODataListBinding not bound to any control, request
	// creation is async and submitBatch must wait for the request.
	// JIRA: CPOUI5UISERVICESV3-1396
	QUnit.test("OLDB#requestContexts standalone: submitBatch must wait", function (assert) {
		var that = this;

		return this.createView(assert, "").then(function () {
			var oBinding = that.oModel.bindList(
					"/Equipments(Category='C',ID=2)/EQUIPMENT_2_PRODUCT", undefined, undefined,
					[new Filter("Name", FilterOperator.GE, "M")]);

			that.expectRequest("Equipments(Category='C',ID=2)/EQUIPMENT_2_PRODUCT"
				+ "?$filter=Name ge 'M'&$skip=0&$top=3", {
				value : [
					{ID : 1},
					{ID : 2},
					{ID : 3}
				]
			});

			// code under test
			return Promise.all([
				oBinding.requestContexts(0, 3, "group").then(function (aContexts) {
					assert.deepEqual(aContexts.map(function (oContext) {
						return oContext.getPath();
					}), [
						"/Equipments(Category='C',ID=2)/EQUIPMENT_2_PRODUCT(1)",
						"/Equipments(Category='C',ID=2)/EQUIPMENT_2_PRODUCT(2)",
						"/Equipments(Category='C',ID=2)/EQUIPMENT_2_PRODUCT(3)"
					]);
				}),
				that.oModel.submitBatch("group")
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Request contexts from an ODataListBinding bound to a growing sap.m.Table
	// JIRA: CPOUI5UISERVICESV3-1396
[false, true].forEach(function (bGrowing) {
	QUnit.test("OLDB#requestContexts w/ sap.m.Table, growing=" + bGrowing, function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" growing="' + bGrowing + '" growingThreshold="3" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		if (!bGrowing) {
			oModel.setSizeLimit(3);
		}
		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=3", {
				value : [
					{SalesOrderID : "01", Note : "Note 1"},
					{SalesOrderID : "02", Note : "Note 2"},
					{SalesOrderID : "03", Note : "Note 3"}
				]
			})
			.expectChange("note", ["Note 1", "Note 2", "Note 3"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("table").getBinding("items");

			that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=3&$top=9", {
				value : [
					{SalesOrderID : "04", Note : "Note 4"},
					{SalesOrderID : "05", Note : "Note 5"}
				]
			});

			return Promise.all([
				oBinding.requestContexts(2, 10).then(function (aContexts) {
					assert.deepEqual(aContexts.map(function (oContext) {
						return oContext.getPath();
					}), [
						"/SalesOrderList('03')",
						"/SalesOrderList('04')",
						"/SalesOrderList('05')"
					]);
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			if (bGrowing) {
				that.expectChange("note", [,,, "Note 4", "Note 5"]);

				// show more items
				that.oView.byId("table-trigger").firePress();
			}

			return that.waitForChanges(assert);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Request contexts from an ODataListBinding bound to a non-growing sap.ui.table.Table
	// JIRA: CPOUI5UISERVICESV3-1396
	QUnit.test("OLDB#requestContexts w/ sap.ui.table.Table", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}" threshold="0" visibleRowCount="3">\
	<t:Column>\
		<t:template><Text id="note" text="{Note}" /></t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		oModel.setSizeLimit(3);
		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=3", {
				value : [
					{SalesOrderID : "01", Note : "Note 1"},
					{SalesOrderID : "02", Note : "Note 2"},
					{SalesOrderID : "03", Note : "Note 3"}
				]
			})
			.expectChange("note", ["Note 1", "Note 2", "Note 3"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("table").getBinding("rows");

			that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=3&$top=9", {
				value : [
					{SalesOrderID : "04", Note : "Note 4"},
					{SalesOrderID : "05", Note : "Note 5"}
				]
			});

			return Promise.all([
				oBinding.requestContexts(2, 10).then(function (aContexts) {
					assert.deepEqual(aContexts.map(function (oContext) {
						return oContext.getPath();
					}), [
						"/SalesOrderList('03')",
						"/SalesOrderList('04')",
						"/SalesOrderList('05')"
					]);
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("note", [,, "Note 3", "Note 4", "Note 5"]);

			// scroll down
			that.oView.byId("table").setFirstVisibleRow(2);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Absolute ODCB, late property. See that it is requested only once, even when
	// multiple bindings request it parallel. See that is written to the cache. See that it is
	// updated via requestSideEffects.
	// JIRA: CPOUI5UISERVICESV3-1878
	QUnit.test("ODCB: late property", function (assert) {
		var oFormContext,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')/SO_2_BP}">\
	<Text id="city" text="{Address/City}" />\
</FlexBox>\
<Text id="longitude1" text="{Address/GeoLocation/Longitude}"/>\
<Text id="longitude2" text="{Address/GeoLocation/Longitude}"/>\
<Text id="longitude3" text="{Address/GeoLocation/Longitude}"/>',
			that = this;

		this.expectRequest("SalesOrderList('1')/SO_2_BP?$select=Address/City,BusinessPartnerID", {
				"@odata.etag" : "etag",
				Address : {
					City : "Heidelberg"
				},
				BusinessPartnerID : "2"
			})
			.expectChange("city", "Heidelberg")
			.expectChange("longitude1")
			.expectChange("longitude2")
			.expectChange("longitude3");

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error")
				.withArgs("Failed to drill-down into CompanyName, invalid segment: CompanyName");

			that.expectRequest("SalesOrderList('1')/SO_2_BP"
				+ "?$select=Address/GeoLocation/Longitude,BusinessPartnerID", {
					"@odata.etag" : "etag",
					Address : {
						GeoLocation : {
							Longitude : "8.7"
						}
					},
					BusinessPartnerID : "2"
				})
				.expectChange("longitude1", "8.700000000000")
				.expectChange("longitude2", "8.700000000000");

			oFormContext = that.oView.byId("form").getBindingContext();

			// code under test - CompanyName leads to a "failed to drill-down"
			assert.strictEqual(oFormContext.getProperty("CompanyName"), undefined);

			// code under test - Longitude is requested once
			that.oView.byId("longitude1").setBindingContext(oFormContext);
			that.oView.byId("longitude2").setBindingContext(oFormContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.oLogMock.expects("error")
				.withArgs("Failed to drill-down into CompanyName, invalid segment: CompanyName");

			// code under test
			return oFormContext.requestProperty("CompanyName").then(function (sValue) {
				assert.strictEqual(sValue, undefined);
			});
		}).then(function () {
			that.expectChange("longitude3", "8.700000000000");

			// code under test - Longitude is cached now
			that.oView.byId("longitude3").setBindingContext(oFormContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList('1')/SO_2_BP"
				+ "?$select=Address/City,Address/GeoLocation/Longitude", {
					"@odata.etag" : "etag",
					Address : {
						City : "Heidelberg",
						GeoLocation : {
							Longitude : "8.71"
						}
					}
				})
				.expectChange("longitude1", "8.710000000000")
				.expectChange("longitude2", "8.710000000000")
				.expectChange("longitude3", "8.710000000000");

			return Promise.all([
				oFormContext.requestSideEffects([
					{$PropertyPath : "Address"}
				]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: relative ODLB without cache; late property does not attach, but requests the value
	// itself.
	// JIRA: CPOUI5UISERVICESV3-2021
	QUnit.test("ODLB w/o cache: late property", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'1\')}">\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="position" text="{ItemPosition}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<Text id="quantity" text="{Quantity}" />',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=SalesOrderID"
			+ "&$expand=SO_2_SOITEM($select=ItemPosition,SalesOrderID)", {
				SO_2_SOITEM : [
					{ItemPosition : "0010", SalesOrderID : "1"}
				]
			})
			.expectChange("position", ["0010"])
			.expectChange("quantity");

		return this.createView(assert, sView, oModel).then(function () {
			// the late property does not attach, but requests the value itself
			that.expectRequest(
				"SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='0010')/Quantity", {
					value : "5"
				})
				.expectChange("quantity", "5.000");

			// select an item
			that.oView.byId("quantity").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[0]);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: ODLB, late property. See that it is requested only once, even when bound twice. See
	// that it is updated via requestSideEffects called at the parent binding (all visible rows).
	// JIRA: CPOUI5UISERVICESV3-1878
	// JIRA: CPOUI5ODATAV4-23 see that a late property for a nested entity (within $expand) is
	// fetched
	// JIRA: CPOUI5ODATAV4-27 see that two late property requests are merged (group ID "$auto"
	// is required for this)
	QUnit.test("ODLB: late property", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true, groupId : "$auto"}),
			oRowContext,
			sView = '\
<FlexBox id="form" binding="{/TEAMS(\'1\')}">\
	<Table id="table" growing="true" growingThreshold="2"\
			items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$$ownRequest : true,\
				$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
		<ColumnListItem>\
			<Text id="name" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<Input id="age1" value="{AGE}" />\
<Text id="age2" text="{AGE}" />\
<Input id="team" value="{EMPLOYEE_2_TEAM/TEAM_2_MANAGER/TEAM_ID}"/>\
<Input id="budget" value="{EMPLOYEE_2_TEAM/Budget}"/>',
			that = this;

		this.expectRequest("TEAMS('1')/TEAM_2_EMPLOYEES"
				+ "?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=2", {
				value : [
					{"@odata.etag" : "etag0", ID : "2", Name : "Frederic Fall"},
					{"@odata.etag" : "etag0", ID : "3", Name : "Jonathan Smith"}
				]
			})
			.expectChange("name", ["Frederic Fall", "Jonathan Smith"])
			.expectChange("age1")
			.expectChange("age2")
			.expectChange("team")
			.expectChange("budget");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("TEAMS('1')/TEAM_2_EMPLOYEES('2')?$select=AGE,ID"
					+ "&$expand=EMPLOYEE_2_TEAM($select=Team_Id;"
					+ "$expand=TEAM_2_MANAGER($select=ID,TEAM_ID))", {
					"@odata.etag" : "etag0",
					AGE : 42,
					ID : "2",
					EMPLOYEE_2_TEAM : {
						"@odata.etag" : "etag1",
						Team_Id : "1",
						TEAM_2_MANAGER : {
							"@odata.etag" : "ETag",
							ID : "5",
							TEAM_ID : "1"
						}
					}
				})
				.expectChange("age1", "42")
				.expectChange("team", "1");

			// code under test - AGE and Team_Id are requested
			oRowContext = that.oView.byId("table").getItems()[0].getBindingContext();
			that.oView.byId("age1").setBindingContext(oRowContext);
			that.oView.byId("team").setBindingContext(oRowContext);

			return that.waitForChanges(assert);
		}).then(function () {
			// BCP 1980517597
			that.expectChange("age1", "18")
				.expectRequest({
					method : "PATCH",
					headers : {"If-Match" : "etag0"},
					url : "EMPLOYEES('2')",
					payload : {AGE : 18}
				}, {
					"@odata.etag" : "etag23",
					AGE : 18,
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "That is very young",
							numericSeverity : 3,
							target : "AGE",
							transition : false
						}]
					}
				})
				.expectMessages([{
					code : "1",
					descriptionUrl : undefined,
					message : "That is very young",
					persistent : false,
					target : "/TEAMS('1')/TEAM_2_EMPLOYEES('2')/AGE",
					technical : false,
					type : "Warning"
				}]);

			// code under test
			that.oView.byId("age1").getBinding("value").setValue(18);

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("age1"), "Warning", "That is very young");
		}).then(function () {
			that.expectChange("team", "changed")
				.expectRequest({
					method : "PATCH",
					headers : {"If-Match" : "ETag"},
					url : "MANAGERS('5')",
					payload : {TEAM_ID : "changed"}
				});

			// code under test
			that.oView.byId("team").getBinding("value").setValue("changed");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest(
				"TEAMS('1')/TEAM_2_EMPLOYEES('2')/EMPLOYEE_2_TEAM?$select=Budget,Team_Id", {
					"@odata.etag" : "etag1",
					Budget : "12.45",
					Team_Id : "1"
				})
				.expectChange("budget", "12.45");

			// code under test - now the team is in the cache and only the budget is missing
			that.oView.byId("budget").setBindingContext(oRowContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("age2", "18");

			// code under test - AGE is cached now
			that.oView.byId("age2").setBindingContext(oRowContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('1')/TEAM_2_EMPLOYEES"
				+ "?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=2&$top=2", {
					value : [
						{ID : "4", Name : "Peter Burke"}
					]
				})
				.expectChange("name", [,, "Peter Burke"]);

			// code under test - AGE must not be requested when paging
			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('1')/TEAM_2_EMPLOYEES?$select=AGE,ID,Name" +
				"&$filter=ID eq '2' or ID eq '3' or ID eq '4'", {
					value : [
						{AGE : 43, ID : "2", Name : "Frederic Fall *"},
						{AGE : 29, ID : "3", Name : "Jonathan Smith *"},
						{AGE : 0, ID : "4", Name : "Peter Burke *"}
					]
				})
				.expectChange("age1", "43")
				.expectChange("age2", "43")
				.expectChange("name", ["Frederic Fall *", "Jonathan Smith *", "Peter Burke *"]);

			// see that requestSideEffects updates AGE, too
			return Promise.all([
				that.oView.byId("table").getBinding("items").getHeaderContext().requestSideEffects([
					{$PropertyPath : "AGE"},
					{$PropertyPath : "Name"}
				]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("age2", "29");

			// change one Text to the second row - must be cached from requestSideEffects
			oRowContext = that.oView.byId("table").getItems()[1].getBindingContext();
			that.oView.byId("age2").setBindingContext(oRowContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('1')/TEAM_2_EMPLOYEES?$select=AGE,ID,Name" +
				"&$filter=ID eq '2' or ID eq '3' or ID eq '4'", {
					value : [
						{AGE : 44, ID : "2", Name : "Frederic Fall **"},
						{AGE : 30, ID : "3", Name : "Jonathan Smith **"},
						{AGE : -1, ID : "4", Name : "Peter Burke **"}
					]
				})
				.expectChange("age1", "44")
				.expectChange("age2", "30")
				.expectChange("name", ["Frederic Fall **", "Jonathan Smith **", "Peter Burke **"]);

			return Promise.all([
				// code under test: requestSideEffects on ODCB w/o data
				that.oView.byId("form").getBindingContext().requestSideEffects([
					{$PropertyPath : "TEAM_2_EMPLOYEES/AGE"},
					{$PropertyPath : "TEAM_2_EMPLOYEES/Name"}
				]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: ODLB, late property at an entity within $expand.
	// JIRA: CPOUI5ODATAV4-23
	QUnit.test("ODLB: late property at nested entity", function (assert) {
		var oModel = createModel(sSalesOrderService + "?sap-client=123", {autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/SalesOrderList(\'1\')/SO_2_SOITEM}">\
   <ColumnListItem>\
      <Text id="product" text="{SOITEM_2_PRODUCT/Name}"/>\
   </ColumnListItem>\
</Table>\
<Text id="businessPartner" text="{SOITEM_2_PRODUCT/PRODUCT_2_BP/CompanyName}"/>',
			that = this;

		this.expectRequest("SalesOrderList('1')/SO_2_SOITEM?sap-client=123"
			+ "&$select=ItemPosition,SalesOrderID"
			+ "&$expand=SOITEM_2_PRODUCT($select=Name,ProductID)&$skip=0&$top=100", {
			value : [{
				"@odata.etag" : "etag0",
				ItemPosition : "0010",
				SalesOrderID : "1",
				SOITEM_2_PRODUCT : {
					"@odata.etag" : "etag1",
					Name : "Notebook Basic 15",
					ProductID : "HT-1000"
				}
			}]
		})
			.expectChange("product", ["Notebook Basic 15"])
			.expectChange("businessPartner");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(
				"SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='0010')"
				+ "/SOITEM_2_PRODUCT?sap-client=123&$select=ProductID"
				+ "&$expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName)", {
					"@odata.etag" : "etag1",
					ProductID : "HT-1000",
					PRODUCT_2_BP : {
						"@odata.etag" : "etag2",
						BusinessPartnerID : "0100000005",
						CompanyName : "TECUM"
					}
				})
				.expectChange("businessPartner", "TECUM");

			// code under test
			that.oView.byId("businessPartner").setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext());

			that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: ODCB, late property at an entity within $expand.
	// JIRA: CPOUI5ODATAV4-23
	QUnit.test("ODCB: late property at nested entity", function (assert) {
		var oModel = createModel(sSalesOrderService + "?sap-client=123", {autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')/SO_2_SOITEM(\'0010\')}">\
      <Text id="product" text="{SOITEM_2_PRODUCT/Name}"/>\
</FlexBox>\
<Text id="businessPartner" text="{SOITEM_2_PRODUCT/PRODUCT_2_BP/CompanyName}"/>',
			that = this;

		this.expectRequest("SalesOrderList('1')/SO_2_SOITEM('0010')?sap-client=123"
			+ "&$select=ItemPosition,SalesOrderID"
			+ "&$expand=SOITEM_2_PRODUCT($select=Name,ProductID)", {
				ItemPosition : "0010",
				SalesOrderID : "1",
				SOITEM_2_PRODUCT : {
					"@odata.etag" : "ETag",
					Name : "Notebook Basic 15",
					ProductID : "HT-1000"
				}
			})
			.expectChange("product", "Notebook Basic 15")
			.expectChange("businessPartner");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("SalesOrderList('1')/SO_2_SOITEM('0010')/SOITEM_2_PRODUCT"
				+ "?sap-client=123&$select=ProductID"
				+ "&$expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName)", {
					"@odata.etag" : "ETag",
					ProductID : "HT-1000",
					PRODUCT_2_BP : {
						BusinessPartnerID : "0100000005",
						CompanyName : "TECUM"
					}
				})
				.expectChange("businessPartner", "TECUM");

			// code under test
			that.oView.byId("businessPartner").setBindingContext(
				that.oView.byId("form").getBindingContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: ODCB, late property at an entity within $expand fails because ETag or key predicate
	// changed.
	// JIRA: CPOUI5ODATAV4-23
[{
	error : "ETag changed",
	lateETag : "changedETag",
	lateID : "HT-1000"
}, {
	error : "Key predicate changed from ('HT-1000') to ('HT-2000')",
	lateETag : "ETag",
	lateID : "HT-2000"
}].forEach(function (oFixture) {
	QUnit.test("ODCB: late property at nested entity fails: " + oFixture.error, function (assert) {
		var oModel = createModel(sSalesOrderService + "?sap-client=123", {autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')/SO_2_SOITEM(\'0010\')}">\
	<Text id="product" text="{SOITEM_2_PRODUCT/Name}"/>\
</FlexBox>\
<Text id="businessPartner" text="{SOITEM_2_PRODUCT/PRODUCT_2_BP/CompanyName}"/>',
			that = this;

		this.expectRequest("SalesOrderList('1')/SO_2_SOITEM('0010')?sap-client=123"
				+ "&$select=ItemPosition,SalesOrderID"
				+ "&$expand=SOITEM_2_PRODUCT($select=Name,ProductID)", {
				ItemPosition : "0010",
				SalesOrderID : "1",
				SOITEM_2_PRODUCT : {
					"@odata.etag" : "ETag",
					Name : "Notebook Basic 15",
					ProductID : "HT-1000"
				}
			})
			.expectChange("product", "Notebook Basic 15")
			.expectChange("businessPartner");

		return this.createView(assert, sView, oModel).then(function () {
			var sMessage = "GET SalesOrderList('1')/SO_2_SOITEM('0010')/SOITEM_2_PRODUCT?"
				+ "$select=ProductID&$expand=PRODUCT_2_BP($select=BusinessPartnerID,"
				+ "CompanyName): " + oFixture.error;

			that.oLogMock.expects("error")
				.withArgs("Failed to read path /SalesOrderList('1')/SO_2_SOITEM('0010')/"
					+ "SOITEM_2_PRODUCT/PRODUCT_2_BP/CompanyName");

			that.expectRequest("SalesOrderList('1')/SO_2_SOITEM('0010')/SOITEM_2_PRODUCT"
					+ "?sap-client=123&$select=ProductID"
					+ "&$expand=PRODUCT_2_BP($select=BusinessPartnerID,CompanyName)", {
					"@odata.etag" : oFixture.lateEtag,
					ProductID : oFixture.lateID,
					PRODUCT_2_BP : {
						BusinessPartnerID : "0100000005",
						CompanyName : "TECUM"
					}
				})
				.expectMessages([{
					"code" : undefined,
					"descriptionUrl" : undefined,
					"message" : sMessage,
					"persistent" : true,
					"target" : "",
					"technical" : true,
					"technicalDetails" : {},
					"type" : "Error"
				}]);

			// code under test
			that.oView.byId("businessPartner").setBindingContext(
				that.oView.byId("form").getBindingContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity without using a UI and reset it immediately via ODataModel.
	// No request is added to the queue and ODataModel#hasPendingChanges and
	// ODataListBinding#hasPendingChanges work as expected.
	// JIRA: CPOUI5ODATAV4-36
	QUnit.test("create an entity and immediately reset changes (no UI)", function (assert) {
		var // use autoExpandSelect so that the cache is created asynchronously
			oModel = createSalesOrdersModel({autoExpandSelect : true, updateGroupId : "$auto"}),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			var oListBindingWithoutUI = oModel.bindList("/SalesOrderList"),
				oCreatedPromise = oListBindingWithoutUI.create({}, true).created();

			assert.ok(oModel.hasPendingChanges());
			assert.ok(oListBindingWithoutUI.hasPendingChanges());
			assert.strictEqual(oListBindingWithoutUI.getLength(), 1 + 10/*length is not final*/);

			oModel.resetChanges();

			// the changes must disappear synchronously
			assert.notOk(oModel.hasPendingChanges());
			assert.notOk(oListBindingWithoutUI.hasPendingChanges());
			assert.strictEqual(oListBindingWithoutUI.getLength(), 0);

			return oCreatedPromise.catch(function (oError) {
				// create (which ran asynchronously) must not have changed anything
				assert.ok(oError.canceled);

				assert.notOk(oModel.hasPendingChanges());
				assert.notOk(oListBindingWithoutUI.hasPendingChanges());
				assert.strictEqual(oListBindingWithoutUI.getLength(), 0);

				return that.checkCanceled(assert, oCreatedPromise);
			});
		});
	});
});

	//*********************************************************************************************
	// Scenario: ODCB, late property at a binding for a complex type, so that no entity can be found
	// in the cache.
	// JIRA: CPOUI5ODATAV4-23
	QUnit.test("ODCB: late property at complex type", function (assert) {
		var oModel = createModel(sSalesOrderService, {autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/BusinessPartnerList(\'1\')/Address}">\
	<Text id="city" text="{City}"/>\
</FlexBox>\
<Text id="postalCode" text="{PostalCode}"/>',
			that = this;

		// Note: ETag is contained in the response header, but _Requestor copies it to the payload
		this.expectRequest("BusinessPartnerList('1')/Address?$select=City", {
				"@odata.etag" : "etag",
				City : "Heidelberg"
			})
			.expectChange("city", "Heidelberg")
			.expectChange("postalCode");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("BusinessPartnerList('1')/Address?$select=PostalCode", {
					"@odata.etag" : "etag",
					PostalCode : "69190"
				})
				.expectChange("postalCode", "69190");

			// code under test
			that.oView.byId("postalCode").setBindingContext(
				that.oView.byId("form").getBindingContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Failure to read from an ODataContextBinding returning a bound message
	QUnit.test("ODCB: read failure & message", function (assert) {
		var oError = createError({
				code : "CODE",
				message : "Could not read",
				target : "Name"
			}),
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'42\')}">\
	<Input id="text" value="{Name}" />\
</FlexBox>',
			that = this;

		this.oLogMock.expects("error")
			.withExactArgs("Failed to read path /EMPLOYEES('42')", sinon.match(oError.message),
				"sap.ui.model.odata.v4.ODataContextBinding");
		this.oLogMock.expects("error")
			.withExactArgs("Failed to read path /EMPLOYEES('42')/Name", sinon.match(oError.message),
				"sap.ui.model.odata.v4.ODataPropertyBinding");
		this.expectRequest("EMPLOYEES('42')", oError)
			.expectMessages([{
				code : "CODE",
				message : "Could not read",
				persistent : true,
				target : "/EMPLOYEES('42')/Name",
				technical : true,
				technicalDetails : {
					originalMessage : {
						code : "CODE",
						message : "Could not read",
						target : "Name"
					}
				},
				type : "Error"
			}]);

		return this.createView(assert, sView).then(function () {
			return that.checkValueState(assert, "text", "Error", "Could not read");
		});
	});

	//*********************************************************************************************
	// Scenario: Failure to read from an ODataPropertyBinding returning a bound message
	QUnit.test("ODPB: read failure & message", function (assert) {
		var oError = createError({
				code : "CODE",
				message : "Could not read",
				target : ""
			}),
			sView = '<Input id="text" value="{/EMPLOYEES(\'42\')/Name}" />',
			that = this;

		this.oLogMock.expects("error")
			.withExactArgs("Failed to read path /EMPLOYEES('42')/Name", sinon.match(oError.message),
				"sap.ui.model.odata.v4.ODataPropertyBinding");
		this.expectRequest("EMPLOYEES('42')/Name", oError)
			.expectMessages([{
				code : "CODE",
				message : "Could not read",
				persistent : true,
				target : "/EMPLOYEES('42')/Name",
				technical : true,
				type : "Error"
			}]);

		return this.createView(assert, sView).then(function () {
			return that.checkValueState(assert, "text", "Error", "Could not read");
		});
	});

	//*********************************************************************************************
	// Scenario: inherit query options (see ListBinding sample application)
	// If there is a relative binding without an own cache and the parent binding defines $orderby
	// or $filter for that binding, then these values need to be considered if that binding gets
	// dynamic filters or sorters.
	// See ListBinding sample application:
	// * Start the application; the employee list of the team is initially sorted by "City"
	// * Sort by any other column (e.g. "Employee Name" or "Age") and check that the "City" is taken
	//   as a secondary sort criterion
	// In this test dynamic filters are used instead of dynamic sorters
	// Additionally ODLB#getDownloadUrl is tested
	// JIRA: CPOUI5ODATAV4-12
	QUnit.test("Relative ODLB inherits parent OBCB's query options on filter", function (assert) {
		var oBinding,
			oModel = createModel(sTeaBusi + "?c1=a&c2=b"),
			sView = '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'42\\\')\',\
	parameters : {$expand : {EMPLOYEE_2_EQUIPMENTS : {$orderby : \'ID\', $select : \'Name\'}}}}">\
	<Table id="table" items="{EMPLOYEE_2_EQUIPMENTS}">\
		<ColumnListItem>\
			<Text id="text" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('42')?c1=a&c2=b&$expand=EMPLOYEE_2_EQUIPMENTS($orderby=ID"
				+ ";$select=Name)", {
				EMPLOYEE_2_EQUIPMENTS : [
					{Name : "Notebook Basic 15"},
					{Name : "Monitor Basic 24"},
					{Name : "Monitor Basic 28"}
				]
			})
			.expectChange("text", ["Notebook Basic 15", "Monitor Basic 24", "Monitor Basic 28"]);

		return this.createView(assert, sView, oModel).then(function () {
			var sExpectedDownloadUrl = sTeaBusi
					+ "EMPLOYEES('42')/EMPLOYEE_2_EQUIPMENTS?c1=a&c2=b&$orderby=ID&$select=Name";

			oBinding = that.oView.byId("table").getBinding("items");
			assert.strictEqual(oBinding.getDownloadUrl(), sExpectedDownloadUrl);
			return oBinding.requestDownloadUrl().then(function (sDownloadUrl) {
				assert.strictEqual(sDownloadUrl, sExpectedDownloadUrl);
			});
		}).then(function () {
			var sResourceUrl = "EMPLOYEES('42')/EMPLOYEE_2_EQUIPMENTS?$orderby=ID&$select=Name&c1=a"
					+ "&c2=b&$filter=EQUIPMENT_2_PRODUCT/SupplierIdentifier%20eq%202";

			that.expectRequest(sResourceUrl + "&$skip=0&$top=100", {
					value : [
						{Name : "Monitor Basic 24"},
						{Name : "Monitor Basic 28"}
					]
				})
				.expectChange("text", ["Monitor Basic 24", "Monitor Basic 28"]);

			// code under test - filter becomes async because product metadata has to be loaded
			oBinding.filter(
				new Filter("EQUIPMENT_2_PRODUCT/SupplierIdentifier", FilterOperator.EQ, 2));

			assert.throws(function () {
				oBinding.getDownloadUrl();
			}, new Error("Result pending"));
			return Promise.all([
				oBinding.requestDownloadUrl().then(function (sDownloadUrl) {
					assert.strictEqual(sDownloadUrl, sTeaBusi + sResourceUrl);
					assert.strictEqual(oBinding.getDownloadUrl(), sTeaBusi + sResourceUrl);
				}),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Refresh single row after it has been updated with a value which doesn't match the table's
	// filter anymore. In this case we expect the single row to disappear.
	QUnit.test("Context#refresh(undefined, true)", function (assert) {
		var sView = '\
<Table id="table"\
		items="{\
			path : \'/EMPLOYEES\',\
			filters : {path : \'AGE\', operator : \'GT\', value1 : \'42\'},\
			sorter : {path : \'AGE\'},\
			parameters : {foo : \'bar\'}\
		}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
		<Input id="age" value="{AGE}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?foo=bar&$orderby=AGE&$filter=AGE gt 42"
				+ "&$select=AGE,ID,Name&$skip=0&$top=100", {
				value : [
					{"@odata.etag" : "ETag0", ID : "0", Name : "Frederic Fall", AGE : 70},
					{ID : "1", Name : "Jonathan Smith", AGE : 50},
					{ID : "2", Name : "Peter Burke", AGE : 77}
				]
			})
			.expectChange("text", ["Frederic Fall", "Jonathan Smith", "Peter Burke"])
			.expectChange("age", ["70", "50", "77"]);

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}))
			.then(function () {
				that.expectRequest({
						method : "PATCH",
						url : "EMPLOYEES('0')?foo=bar",
						headers : {"If-Match" : "ETag0"},
						payload : {AGE : 10}
					}) // 204 No Content
					.expectChange("age", ["10"]); // caused by setValue

				that.oView.byId("table").getItems()[0].getCells()[1].getBinding("value")
					.setValue(10);

				return that.waitForChanges(assert);
			}).then(function () {
				var oContext = that.oView.byId("table").getItems()[0].getBindingContext();

				that.expectRequest("EMPLOYEES?foo=bar"
						+ "&$filter=(AGE gt 42) and ID eq '0'"
						+ "&$select=AGE,ID,Name", {value : []})
					.expectChange("text", ["Jonathan Smith", "Peter Burke"])
					.expectChange("age", ["50", "77"]);

				// code under test
				oContext.refresh(undefined, true);

				return that.waitForChanges(assert);
			}).then(function () {
				var oContext = that.oView.byId("table").getItems()[0].getBindingContext();

				that.expectRequest("EMPLOYEES?foo=bar"
						+ "&$filter=(AGE gt 42) and ID eq '1'"
						+ "&$select=AGE,ID,Name", {
						value : [{
							ID : "1",
							Name : "Jonathan Smith",
							AGE : 51
						}]
					})
					.expectChange("age", ["51"]);

				// code under test
				oContext.refresh(undefined, true);

				return that.waitForChanges(assert);
			});
	});

	//*********************************************************************************************
	// Refresh a single row with a bound message and check that the message is not duplicated.
	// Refreshing a single line in a collection must not remove messages for other lines.
	QUnit.test("Context#refresh() with messages", function (assert) {
		var sView = '\
<Table id="table"\
		items="{\
			path : \'/EMPLOYEES\',\
			parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}\
		}">\
	<ColumnListItem>\
		<Input id="id" value="{ID}" />\
	</ColumnListItem>\
</Table>',
			oMessage1 = {
				code : "2",
				message : "Another Text",
				persistent : false,
				target : "/EMPLOYEES('1')/ID",
				type : "Warning"
			},
			oResponseMessage0 = {
				code : "1",
				message : "Text",
				numericSeverity : 3,
				target : "ID",
				transition : false
			},
			oResponseMessage0AfterRefresh = {
				code : "1",
				message : "Text after refresh",
				numericSeverity : 3,
				target : "ID",
				transition : false
			},
			oResponseMessage1 = {
				code : "2",
				message : "Another Text",
				numericSeverity : 3,
				target : "ID",
				transition : false
			},
			oTable,
			that = this;

		this.expectRequest("EMPLOYEES?$select=ID,__CT__FAKE__Message/__FAKE__Messages"
					+ "&$skip=0&$top=100", {
				value : [{
					ID : "0",
					__CT__FAKE__Message : {
						__FAKE__Messages : [oResponseMessage0]
					}
				}, {
					ID : "1",
					__CT__FAKE__Message : {
						__FAKE__Messages : [oResponseMessage1]
					}
				}]
			})
			.expectChange("id", ["0", "1"])
			.expectMessages([{
				code : "1",
				message : "Text",
				persistent : false,
				target : "/EMPLOYEES('0')/ID",
				technicalDetails : {
					originalMessage : oResponseMessage0
				},
				type : "Warning"
			}, oMessage1]);

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}))
			.then(function () {
				oTable = that.oView.byId("table");

				return Promise.all([
					that.checkValueState(assert, oTable.getItems()[0].getCells()[0],
						"Warning", "Text"),
					that.checkValueState(assert, oTable.getItems()[1].getCells()[0],
						"Warning", "Another Text")
				]);
			}).then(function () {
				var oContext = oTable.getItems()[0].getBindingContext();

				that.expectRequest("EMPLOYEES('0')"
							+ "?$select=ID,__CT__FAKE__Message/__FAKE__Messages", {
						ID : "0",
						__CT__FAKE__Message : {
							__FAKE__Messages : [oResponseMessage0AfterRefresh]
						}
					})
				.expectMessages([{
					code : "1",
					message : "Text after refresh",
					persistent : false,
					target : "/EMPLOYEES('0')/ID",
					type : "Warning"
				}, oMessage1]);

				// code under test
				oContext.refresh();

				return that.waitForChanges(assert);
			}).then(function () {
				return that.checkValueState(assert, oTable.getItems()[0].getCells()[0],
					"Warning", "Text after refresh");
			}).then(function () {
				return that.checkValueState(assert, oTable.getItems()[1].getCells()[0],
					"Warning", "Another Text");
			});
	});

	//*********************************************************************************************
	// Refresh a single row that has been removed in between. Check the bound message of the error
	// response.
	QUnit.test("Context#refresh() error messages", function (assert) {
		var oError = createError({
				code : "CODE",
				message : "Not found",
				target : "ID"
			}, 404),
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/EMPLOYEES}">\
	<ColumnListItem>\
		<Input value="{ID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$select=ID&$skip=0&$top=100", {
				value : [{ID : "0"}]
			});

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error")
				.withExactArgs("Failed to refresh entity: /EMPLOYEES('0')[0]",
					sinon.match(oError.message), "sap.ui.model.odata.v4.ODataListBinding");
			that.expectRequest("EMPLOYEES('0')?$select=ID", oError)
				.expectMessages([{
					code : "CODE",
					message : "Not found",
					persistent : true,
					target : "/EMPLOYEES('0')/ID",
					technical : true,
					type : "Error"
				}]);

			// code under test
			that.oView.byId("table").getItems()[0].getBindingContext().refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[0], "Error", "Not found");
		});
	});

	//*********************************************************************************************
	// Scenario: Refreshing (a single entry of) a table must not cause "failed to drill-down" errors
	// if data of a dependent binding has been deleted in between.
	// This scenario is similar to the deletion of a sales order line item in the SalesOrders
	// application. Deleting a sales order line item also deletes the corresponding schedule. After
	// the deletion the application automatically refreshes the sales order which the item has
	// belonged to.
	[function (oTable) {
		this.expectRequest("EMPLOYEES('0')?$select=AGE,ID,Name",
				{ID : "0", Name : "Frederic Fall", AGE : 70})
			.expectRequest("EMPLOYEES('0')/EMPLOYEE_2_EQUIPMENTS?"
				+ "$select=Category,ID,Name&$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : "1",
					Name : "Office PC"
				}]
			});

		oTable.getItems()[0].getBindingContext().refresh();
	}, function (oTable) {
		this.expectRequest("EMPLOYEES?$select=AGE,ID,Name&$skip=0&$top=100", {
				value : [{ID : "0", Name : "Frederic Fall", AGE : 70}]
			})
			.expectRequest("EMPLOYEES('0')/EMPLOYEE_2_EQUIPMENTS?"
				+ "$select=Category,ID,Name&$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : "1",
					Name : "Office PC"
				}]
			});
		oTable.getBinding("items").refresh();
	}].forEach(function (fnRefresh, i) {
		QUnit.test("refresh: No drill-down error for deleted data #" + i, function (assert) {
			var sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', templateShareable : false}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
		<Text id="age" text="{AGE}" />\
	</ColumnListItem>\
</Table>\
<Table id="detailTable" items="{path : \'EMPLOYEE_2_EQUIPMENTS\',\
		parameters : {$$ownRequest : true}}">\
	<ColumnListItem>\
		<Text id="equipmentName" text="{Name}" />\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectRequest("EMPLOYEES?$select=AGE,ID,Name&$skip=0&$top=100", {
					value : [{
						ID : "0",
						Name : "Frederic Fall",
						AGE : 70
					}]
				})
				.expectChange("text", ["Frederic Fall"])
				.expectChange("age", ["70"])
				.expectChange("equipmentName", []);

			return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}))
				.then(function () {
					that.expectRequest("EMPLOYEES('0')/EMPLOYEE_2_EQUIPMENTS?"
							+ "$select=Category,ID,Name&$skip=0&$top=100", {
							value : [{
								Category : "Electronics",
								ID : "1",
								Name : "Office PC"
							}, {
								Category : "Electronics",
								ID : "2",
								Name : "Tablet X"
							}]
						})
						.expectChange("equipmentName", ["Office PC", "Tablet X"]);
					that.oView.byId("detailTable").setBindingContext(
						that.oView.byId("table").getItems()[0].getBindingContext());

					return that.waitForChanges(assert);
				}).then(function () {
					fnRefresh.call(that, that.oView.byId("table"));

					return that.waitForChanges(assert);
				});
		});
	});

	//*********************************************************************************************
	// Scenario: Sort a list and select a list entry to see details
	// See SalesOrders application:
	// * Start the application with realOData=true so that sorting by "Gross Amount" is enabled
	// * Sort by "Gross Amount"
	// * Select a sales order and see that sales order details are fitting to the selected sales
	//   order
	// This test is a simplification of that scenario with a different service.
	QUnit.test("Absolute ODLB with sort, relative ODCB resolved on selection", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', parameters : {$expand : \'EMPLOYEE_2_MANAGER\'}}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="form" binding="{EMPLOYEE_2_MANAGER}">\
	<Text id="id" text="{ID}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES?$expand=EMPLOYEE_2_MANAGER&$skip=0&$top=100", {
				value : [
					{Name : "Jonathan Smith", EMPLOYEE_2_MANAGER : {ID : "2"}},
					{Name : "Frederic Fall", EMPLOYEE_2_MANAGER : {ID : "1"}}
				]
			})
			.expectChange("id")
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"]);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES?$expand=EMPLOYEE_2_MANAGER&$orderby=Name&"
					+ "$skip=0&$top=100", {
					value : [
						{Name : "Frederic Fall", EMPLOYEE_2_MANAGER : {ID : "1"}},
						{Name : "Jonathan Smith", EMPLOYEE_2_MANAGER : {ID : "2"}}
					]
				})
				.expectChange("name", ["Frederic Fall", "Jonathan Smith"]);

			// code under test
			that.oView.byId("table").getBinding("items").sort(new Sorter("Name"));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", "2");

			// code under test
			that.oView.byId("form").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[1]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", "1");

			// code under test
			that.oView.byId("form").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[0]);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh an ODataListBinding
	// See SalesOrders application:
	// * Start the application
	// * Click on "Refresh sales orders" button
	// This test is a simplification of that scenario with a different service.
	QUnit.test("Absolute ODLB refresh", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', \
		parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
	<ColumnListItem>\
		<Input id="name" value="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest(
			"EMPLOYEES?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=100", {
				value : [{
					ID : "1",
					Name : "Jonathan Smith",
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Text",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				}, {
					ID : "2",
					Name : "Frederic Fall",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				}]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"])
			.expectMessages([{
				code : "1",
				message : "Text",
				persistent : false,
				target : "/EMPLOYEES('1')/Name",
				type : "Warning"
			}]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[0],
				"Warning", "Text");
		}).then(function () {
			that.expectRequest(
				"EMPLOYEES?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=100", {
					value : [{
						Name : "Frederic Fall",
						__CT__FAKE__Message : {__FAKE__Messages : []}
					}, {
						Name : "Peter Burke",
						__CT__FAKE__Message : {__FAKE__Messages : []}
					}]
				})
				.expectChange("name", ["Frederic Fall", "Peter Burke"])
				.expectMessages([]);

			// code under test
			that.oView.byId("table").getBinding("items").refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[0],
				"None", "");
		});
	});

	//*********************************************************************************************
	// Scenario: Messages for collection entries without key properties
	QUnit.test("Absolute ODLB: messages for entries without key properties", function (assert) {
		var oMessage1 = {
				code : "1",
				message : "Text",
				persistent : false,
				target : "/EMPLOYEES/1/Name",
				type : "Warning"
			},
			oMessage2 = {
				code : "2",
				message : "Text2",
				persistent : false,
				target : "/EMPLOYEES/2/Name",
				type : "Warning"
			},
			oTable,
			sView = '\
<t:Table id="table" rows="{\
			path : \'/EMPLOYEES\',\
			parameters : {$select : \'Name,__CT__FAKE__Message/__FAKE__Messages\'}\
		}"\ threshold="0" visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Input id="name" value="{Name}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest(
			"EMPLOYEES?$select=Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=2", {
				value : [{
					Name : "Jonathan Smith",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				}, {
					Name : "Frederic Fall",
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Text",
							transition : false,
							target : "Name",
							numericSeverity : 3
						}]
					}
				}]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"])
			.expectMessages([oMessage1]);

		return this.createView(assert, sView).then(function () {
			oTable = that.oView.byId("table");

			return that.checkValueState(assert, oTable.getRows()[1].getCells()[0],
				"Warning", "Text");
		}).then(function () {
			that.expectRequest(
				"EMPLOYEES?$select=Name,__CT__FAKE__Message/__FAKE__Messages&$skip=2&$top=1", {
					value : [{
						Name : "Peter Burke",
						__CT__FAKE__Message : {
							__FAKE__Messages : [{
								code : "2",
								message : "Text2",
								transition : false,
								target : "Name",
								numericSeverity : 3
							}]
						}
					}]
				})
				.expectChange("name", null, null)
				.expectChange("name", [, "Frederic Fall", "Peter Burke"])
				.expectMessages([oMessage1, oMessage2]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, oTable.getRows()[0].getCells()[0],
				"Warning", "Text");
		}).then(function () {
			return that.checkValueState(assert, oTable.getRows()[1].getCells()[0],
				"Warning", "Text2");
		});
		//TODO: using an index for a bound message leads to a wrong target if for example
		//      an entity with a lower index gets deleted, see CPOUI5UISERVICESV3-413
	});

	//*********************************************************************************************
	// Scenario: Refresh an ODataContextBinding with a message, the entity is deleted in between
	QUnit.test("Absolute ODCB refresh & message", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{path : \'/EMPLOYEES(\\\'2\\\')\', \
	parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
	<Input id="text" value="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages", {
				ID : "1",
				Name : "Jonathan Smith",
				__CT__FAKE__Message : {
					__FAKE__Messages : [{
						code : "1",
						message : "Text",
						numericSeverity : 3,
						target : "Name",
						transition : false
					}]
				}
			})
			.expectChange("text", "Jonathan Smith")
			.expectMessages([{
				code : "1",
				message : "Text",
				persistent : false,
				target : "/EMPLOYEES('2')/Name",
				type : "Warning"
			}]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert, "text", "Warning", "Text");
		}).then(function () {
			var oError = createError({code : "CODE", message : "Employee does not exist"});

			that.oLogMock.expects("error").withExactArgs("Failed to read path /EMPLOYEES('2')",
				sinon.match(oError.message), "sap.ui.model.odata.v4.ODataContextBinding");
			that.oLogMock.expects("error").withExactArgs("Failed to read path /EMPLOYEES('2')/Name",
				sinon.match(oError.message), "sap.ui.model.odata.v4.ODataPropertyBinding");
			that.expectRequest(
				"EMPLOYEES('2')?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages", oError)
				.expectChange("text", null)
				.expectMessages([{
					code : "CODE",
					message : "Employee does not exist",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			// code under test
			that.oView.byId("form").getObjectBinding().refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh an ODataContextBinding
	// The SalesOrders application does not have such a scenario.
	[false, true].forEach(function (bViaContext) {
		QUnit.test("Absolute ODCB refresh, via bound context " + bViaContext, function (assert) {
			var sView = '\
<FlexBox id="form" binding="{/EMPLOYEES(\'2\')}">\
	<Text id="text" text="{Name}" />\
</FlexBox>',
				that = this;

			this.expectRequest("EMPLOYEES('2')", {Name : "Jonathan Smith"})
				.expectChange("text", "Jonathan Smith");

			return this.createView(assert, sView).then(function () {
				var oBinding = that.oView.byId("form").getObjectBinding();

				that.expectRequest("EMPLOYEES('2')", {Name : "Jonathan Smith"});

				// code under test
				if (bViaContext) {
					oBinding.getBoundContext().refresh();
				} else {
					oBinding.refresh();
				}

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh an ODataPropertyBinding
	// See SalesOrders application:
	// * Start the application
	// * Click on "Refresh favorite product" button
	// This test is a simplification of that scenario with a different service.
	QUnit.test("Absolute ODPB refresh", function (assert) {
		var sView = '<Text id="name" text="{/EMPLOYEES(\'2\')/Name}" />',
			that = this;

		this.expectRequest("EMPLOYEES('2')/Name", {value : "Jonathan Smith"})
			.expectChange("name", "Jonathan Smith");

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES('2')/Name", {value : "Jonathan Schmidt"})
				.expectChange("name", "Jonathan Schmidt");

			// code under test
			that.oView.byId("name").getBinding("text").refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Action Imports
	// See ListBinding application:
	// * Start the application
	// * Click on "Budget" button
	// * In the "Change Team Budget" dialog enter a "Budget" and press "Change" button
	QUnit.test("ActionImport", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{/ChangeTeamBudgetByID(...)}">\
	<Input id="name" value="{Name}" />\
</FlexBox>',
			oModelMessage = {
				code : "1",
				message : "Warning Text",
				persistent : false,
				target : "/ChangeTeamBudgetByID(...)/Name",
				type : "Warning"
			},
			oResponseMessage = {
				code : "1",
				message : "Warning Text",
				numericSeverity : 3,
				target : "Name",
				transition : false
			},
			that = this;

		this.expectChange("name", null);

		return this.createView(assert, sView).then(function () {
			that.expectRequest({
					method : "POST",
					url : "ChangeTeamBudgetByID",
					payload : {
						Budget : "1234.1234",
						TeamID : "TEAM_01"
					}
				}, {
					Name : "Business Suite",
					__CT__FAKE__Message : {
						__FAKE__Messages : [oResponseMessage]
					}
				})
				.expectMessages([oModelMessage])
				.expectChange("name", "Business Suite");

			return Promise.all([
				// code under test
				that.oView.byId("form").getObjectBinding()
					.setParameter("TeamID", "TEAM_01")
					.setParameter("Budget", "1234.1234")
					.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "name", "Warning", "Warning Text");
		});
	});

	//*********************************************************************************************
	// Scenario: Allow binding of operation parameters (see ListBinding application)
	// - automatic type determination
	// JIRA: CPOUI5UISERVICESV3-2010
	QUnit.test("Allow binding of operation parameters: type determination", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{/ChangeTeamBudgetByID(...)}">\
	<Input id="budget" value="{$Parameter/Budget}" />\
	<Input id="teamId" value="{$Parameter/TeamID}" />\
</FlexBox>',
			that = this;

		this.expectChange("budget", null)
			.expectChange("teamId", "");

		return this.createView(assert, sView).then(function () {
			var oBudgetType = that.oView.byId("budget").getBinding("value").getType(),
				oTeamIdType = that.oView.byId("teamId").getBinding("value").getType();

			// verify automatic type determination
			assert.strictEqual(oBudgetType.getName(), "sap.ui.model.odata.type.Decimal");
			assert.deepEqual(oBudgetType.oConstraints, {
				nullable : false,
				precision : 16,
				scale : Infinity
			});
			assert.strictEqual(oTeamIdType.getName(), "sap.ui.model.odata.type.String");
			assert.deepEqual(oTeamIdType.oConstraints, {
				maxLength : 10,
				nullable : false
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Allow binding of operation parameters (see ListBinding application)
	// - parameters appear on UI via binding
	// JIRA: CPOUI5UISERVICESV3-2010
	QUnit.test("Allow binding of operation parameters: OneTime", function (assert) {
		var sView = '\
<FlexBox id="form" >\
	<Input id="budget" value="{Budget}" />\
	<Input id="teamId" value="{TeamID}" />\
</FlexBox>',
			that = this;

		this.expectChange("budget")
			.expectChange("teamId");

		return this.createView(assert, sView).then(function () {
			var oOperationBinding = that.oModel.bindContext("/ChangeTeamBudgetByID(...)");

			oOperationBinding
				.setParameter("Budget", "1234.1234")
				.setParameter("TeamID", "TEAM_01");

			that.expectChange("budget", "1,234.1234")
				.expectChange("teamId", "TEAM_01");

			that.oView.byId("form").setBindingContext(oOperationBinding.getParameterContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Allow binding of operation parameters (see ListBinding application)
	// - parameters appear on UI via binding
	// JIRA: CPOUI5UISERVICESV3-2010
	QUnit.test("Allow binding of operation parameters: OneWay", function (assert) {
		var oOperationBinding,
			sView = '\
<FlexBox id="form" binding="{/ChangeTeamBudgetByID(...)}">\
	<Input id="budget" value="{$Parameter/Budget}" />\
	<Input id="teamId" value="{$Parameter/TeamID}" />\
</FlexBox>',
			that = this;

		this.expectChange("budget", null)
			.expectChange("teamId", "");

		return this.createView(assert, sView).then(function () {
			oOperationBinding = that.oView.byId("form").getObjectBinding();

			that.expectChange("budget", "1,234.1234")
				.expectChange("teamId", "TEAM_01");

			oOperationBinding
				.setParameter("Budget", "1234.1234")
				.setParameter("TeamID", "TEAM_01");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "ChangeTeamBudgetByID",
					payload : {
						Budget : "1234.1234",
						TeamID : "TEAM_01"
					}
				}, {/* response does not matter here */});

			oOperationBinding.execute();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("budget", "56,789");

			oOperationBinding.setParameter("Budget", "56789");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("budget", "98,765");

			return Promise.all([
				oOperationBinding.getParameterContext().setProperty("Budget", "98765"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("budget", "12,345");

			that.oView.byId("budget").getBinding("value").setValue("12345");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("budget", "54,321");

			return Promise.all([
				that.oView.byId("form").getBindingContext()
					.setProperty("$Parameter/Budget", "54321"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("teamId", null);

			// #deregisterChange
			that.oView.byId("teamId").getBinding("value").setContext(null);

			return that.waitForChanges(assert);
		}).then(function () {
			oOperationBinding.setParameter("TeamID", "n/a");
		});
	});

	//*********************************************************************************************
	// Scenario: Allow setting parameters of operations via control property binding
	// - parameters change because of change in property binding
	// JIRA: CPOUI5UISERVICESV3-2010
	// JIRA: CPOUI5ODATAV4-29, check message target for unbound action
	QUnit.test("Allow binding of operation parameters: Changing with controls", function (assert) {
		var oOperation,
			oParameterContext,
			sView = '\
<FlexBox id="operation" binding="{/ChangeTeamBudgetByID(...)}">\
	<FlexBox id="parameter" binding="{$Parameter}">\
		<Input id="budget" value="{Budget}" />\
		<Input id="teamId" value="{TeamID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectChange("budget", null)
			.expectChange("teamId", "");

		return this.createView(assert, sView).then(function () {
			oOperation = that.oView.byId("operation").getObjectBinding();
			oParameterContext = oOperation.getParameterContext();

			that.expectChange("budget", "1,234.1234");

			// code under test - setting the parameter via value binding
			that.oView.byId("budget").getBinding("value").setValue("1234.1234");
			assert.strictEqual(oParameterContext.getProperty("Budget"), "1234.1234");

			return that.waitForChanges(assert);
		}).then(function () {
			var oPromise;

			that.expectChange("budget", "4,321.1234");

			// code under test - setting the parameter via operation
			oPromise = oOperation.getBoundContext().setProperty("$Parameter/Budget", "4321.1234");

			assert.strictEqual(oParameterContext.getProperty("Budget"), "4321.1234");

			return Promise.all([oPromise, that.waitForChanges(assert)]);
		}).then(function () {
			that.expectChange("teamId", "TEAM_01");

			return Promise.all([
				// also test the API for property setting w/o PATCH (CPOUI5ODATAV4-14)
				that.oView.byId("parameter").getBindingContext()
					.setProperty("TeamID", "TEAM_01", /*no PATCH*/null),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
				method : "POST",
				url : "ChangeTeamBudgetByID",
				payload : {
					Budget : "4321.1234",
					TeamID : "TEAM_01"
				}
			}, {/* response does not matter here */});

			// code under test
			oOperation.execute();

			return that.waitForChanges(assert);
		}).then(function () {
			// JIRA: CPOUI5ODATAV4-29
			var oError = createError({
					message : "Invalid Budget",
					target : "Budget"
				});

			that.oLogMock.expects("error")
				.withExactArgs("Failed to execute /ChangeTeamBudgetByID(...)",
				sinon.match(oError.message), "sap.ui.model.odata.v4.ODataContextBinding");
			that.expectRequest({
					method : "POST",
					url : "ChangeTeamBudgetByID",
					payload : {
						Budget : "-42",
						TeamID : "TEAM_01"
					}
				}, oError) // simulates failure
				.expectMessages([{
					code : undefined,
					message : "Invalid Budget",
					persistent : true,
					target : "/ChangeTeamBudgetByID(...)/$Parameter/Budget",
					technical : true,
					type : "Error"
				}])
				.expectChange("budget", "-42");

			return Promise.all([
				oOperation.setParameter("Budget", "-42").execute()
					.then(function () {
						assert.ok(false, "Unexpected success");
					}, function (oError0) {
						assert.strictEqual(oError0, oError);
					}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "budget", "Error", "Invalid Budget");
		});
	});

	//*********************************************************************************************
	// Scenario: As a Fiori Elements developer you template the operation dialog and want to use
	// the AnnotationHelper.format to bind the parameters so that you have the type information
	// already available before the controls are created.
	// JIRA: CPOUI5ODATAV4-28
	testXMLTemplating("Operation parameters with sap.ui.model.odata.v4.AnnotationHelper.format",
		{models : {meta : createTeaBusiModel().getMetaModel()}},
'<template:alias name="format" value="sap.ui.model.odata.v4.AnnotationHelper.format">\
	<FlexBox id="form" binding="{/ChangeTeamBudgetByID(...)}">\
		<FlexBox binding="{$Parameter}">\
			<template:repeat list="{meta>/ChangeTeamBudgetByID/$Action/0/$Parameter}" var="param">\
				<Input id="{param>$Name}" value="{param>@@format}"/>\
			</template:repeat>\
			<Input value="{meta>/ChangeTeamBudgetByID/TeamID@@format}"/>\
		</FlexBox>\
	</FlexBox>\
</template:alias>',
'<FlexBox id="form" binding="{/ChangeTeamBudgetByID(...)}">\
	<FlexBox binding="{$Parameter}">\
		<Input id="TeamID" value="{path:\'TeamID\',type:\'sap.ui.model.odata.type.String\',\
			constraints:{\'maxLength\':10,\'nullable\':false},\
			formatOptions:{\'parseKeepsEmptyString\':true}}"/>\
		<Input id="Budget" value="{path:\'Budget\',type:\'sap.ui.model.odata.type.Decimal\',\
			constraints:{\'precision\':16,\'scale\':\'variable\',\'nullable\':false}}"/>\
		<Input value="{path:\'TeamID\',type:\'sap.ui.model.odata.type.String\',\
			constraints:{\'maxLength\':10,\'nullable\':false},\
			formatOptions:{\'parseKeepsEmptyString\':true}}"/>\
	</FlexBox>\
</FlexBox>');

	//*********************************************************************************************
	// Scenario: Allow setting complex type parameters of operations via property binding
	// - parameters change because of change in the binding.
	// Follow-up on JIRA: CPOUI5ODATAV4-15 (read/write primitive type parameters)
	// JIRA: CPOUI5ODATAV4-52
	QUnit.test("Allow binding of complex operation parameters", function (assert) {
		var oOperation,
			oModel = createSpecialCasesModel(),
			sView = '\
<FlexBox id="operation" binding="{/HirePerson(...)}">\
	<FlexBox id="parameter" binding="{$Parameter}">\
		<FlexBox binding="{Person}" >\
			<Input id="name" value="{Name}"/>\
			<Input id="salary" value="{Salary}"/>\
			<FlexBox binding="{Address}">\
				<Input id="city" value="{City}"/>\
				<Input id="zip" value="{ZIP}"/>\
			</FlexBox>\
		</FlexBox>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectChange("city", "")
			.expectChange("name", "")
			.expectChange("salary", null)
			.expectChange("zip", "");

		return this.createView(assert, sView, oModel).then(function () {
			oOperation = that.oView.byId("operation").getObjectBinding();

			that.expectChange("city", "Tatooine")
				.expectChange("name", "R2D2")
				.expectChange("salary", "12,345,678")
				.expectChange("zip", "12345");

			// code under test - reading parameter values
			oOperation.setParameter("Person", {
				Address : {
					City : "Tatooine",
					ZIP : "12345"
				},
				Name : "R2D2",
				Salary : 12345678
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("city", "")
				.expectChange("name", "")
				.expectChange("salary", "12,345")
				.expectChange("zip", "67890");

			// code under test - set parameter complex value
			oOperation.setParameter("Person", {
				Address : {
					ZIP : "67890"
				},
				Salary : 12345
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("salary", "54,321")
				.expectChange("zip", "");

			// code under test - set parameter complex value
			oOperation.setParameter("Person", {
				Salary : 54321
			});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("name", "C3PO");

			// code under test - Person/Name
			that.oView.byId("name").getBinding("value").setValue("C3PO");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("city", "Kashyyk");

			// code under test - Person/Address/City
			that.oView.byId("city").getBinding("value").setValue("Kashyyk");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("zip", "12345");

			// code under test - Person/Address/ZIP
			that.oView.byId("zip").getBinding("value").setValue("12345");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
				method : "POST",
				url : "HirePerson",
				payload : {
					Person : {
						Address : {
							City : "Kashyyk",
							ZIP : "12345"
						},
						Name : "C3PO",
						Salary : 54321
					}
				}
			}, {/* response does not matter here */});

			// code under test
			return Promise.all([oOperation.execute(), that.waitForChanges(assert)]);
		});
	});

	//*********************************************************************************************
	QUnit.test("ODCB#setParameter with complex type holds the reference", function (assert) {
		var oModel = createSpecialCasesModel(),
			that = this;

		return this.createView(assert, '', oModel).then(function () {
			var oOperation = oModel.bindContext("/HirePerson(...)"),
				oPerson = {
					Address : {
						City : "Tatooine",
						ZIP : "12345"
					},
					Name : "R2D2",
					Salary : 12345678
				};

			oOperation.setParameter("Person", oPerson);
			oPerson.Salary = 54321;
			oPerson.Address.City = "Kashyyk";

			that.expectRequest({
				method : "POST",
				url : "HirePerson",
				payload : {
					Person : {
						Address : {
							City : "Kashyyk",
							ZIP : "12345"
						},
						Name : "R2D2",
						Salary : 54321
					}
				}
			}, {/* response does not matter here */});

			return Promise.all([
				// code under test
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Changing the binding parameters causes a refresh of the table
	// The SalesOrders application does not have such a scenario.
	QUnit.test("Absolute ODLB changing parameters", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', parameters : {$select : \'Name\'}}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$select=Name&$skip=0&$top=100", {
				value : [
					{Name : "Jonathan Smith"},
					{Name : "Frederic Fall"}
				]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"]);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES?$select=ID,Name&$search=Fall&$skip=0&$top=100", {
					value : [{ID : "2", Name : "Frederic Fall"}]
				})
				.expectChange("name", ["Frederic Fall"]);

			// code under test
			that.oView.byId("table").getBinding("items").changeParameters({
				$search : "Fall", $select : "ID,Name"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Changing the binding parameters causes a refresh of the form
	// The SalesOrders application does not have such a scenario.
	QUnit.test("Absolute ODCB changing parameters", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{/EMPLOYEES(\'2\')}">\
	<Text id="text" text="{Name}" />\
</FlexBox>',
			that = this;

		that.expectRequest("EMPLOYEES('2')", {Name : "Jonathan Smith"})
			.expectChange("text", "Jonathan Smith");

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES('2')?$apply=foo", {Name : "Jonathan Schmidt"})
				.expectChange("text", "Jonathan Schmidt");

			// code under test
			that.oView.byId("form").getObjectBinding().changeParameters({$apply : "foo"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario:
	// A table uses the list binding with extended change detection, but not all key properties of
	// the displayed entity are known on the client, so that the key predicate cannot be determined.
	// In 1.44 this caused the problem that the table did not show any row. (Not reproducible with
	// Gateway services, because they always deliver all key properties, selected or not.)
	QUnit.test("Absolute ODLB with ECD, missing key column", function (assert) {
		// Note: The key property of the EMPLOYEES set is 'ID'
		var sView = '\
<Table growing="true" items="{path : \'/EMPLOYEES\', parameters : {$select : \'Name\'}}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("EMPLOYEES?$select=Name&$skip=0&$top=20", {
				value : [
					{Name : "Jonathan Smith"},
					{Name : "Frederic Fall"}
				]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"]);

		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: SalesOrders app
	// * Select a sales order so that items are visible
	// * Filter in the items, so that there are less
	// * See that the count decreases
	// The test simplifies it: It filters in the sales orders list directly
	QUnit.test("ODLB: $count and filter()", function (assert) {
		var sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$select : \'SalesOrderID\'}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"}
				]
			})
			.expectChange("count")
			.expectChange("id", ["0500000001", "0500000002"]);

		return this.createView(assert, sView, createSalesOrdersModel()).then(function () {
			that.expectChange("count", "2");

			// code under test
			that.oView.byId("count").setBindingContext(
				that.oView.byId("table").getBinding("items").getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList?$select=SalesOrderID&$filter=SalesOrderID gt"
					+ " '0500000001'&$skip=0&$top=100",
					{value : [{SalesOrderID : "0500000002"}]}
				)
				.expectChange("count", "1")
				.expectChange("id", ["0500000002"]);

			// code under test
			that.oView.byId("table").getBinding("items")
				.filter(new Filter("SalesOrderID", FilterOperator.GT, "0500000001"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario case-insensitive filtering
	// JIRA: CPOUI5UISERVICESV3-1263
	QUnit.test("OLDB: case insensitive filtering", function (assert) {
		var oListBinding,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/ProductList\'}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("ProductList?$select=Name,ProductID&$skip=0&$top=100", {
				value : [{
					ProductID : "1",
					Name : "Pommes"
				}, {
					ProductID : "2",
					Name : "Salat"
				}
			]})
			.expectChange("name", ["Pommes", "Salat"]);

		return this.createView(assert, sView, oModel).then(function () {
			oListBinding = that.oView.byId("table").getBinding("items");

			that.expectRequest("ProductList?$select=Name,ProductID"
					+ "&$filter=tolower(Name) eq tolower('salat')&$skip=0&$top=100", {
					value : [{
						ProductID : "2",
						Name : "Salat"
					}
				]})
				.expectChange("name", ["Salat"]);

			// code under test
			oListBinding.filter(new Filter({
				filters : [
					new Filter({
						caseSensitive : false,
						operator : FilterOperator.EQ,
						path : "Name",
						value1 : "salat"
					})
				]
			}));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: SalesOrders app
	// * Sort the sales orders
	// * Delete a sales order
	// * See that the count decreases
	// The delete is used to change the count (to see that it is still updated)
	QUnit.test("ODLB: $count and sort()", function (assert) {
		var sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$select : \'SalesOrderID\'}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
		that = this;

		this.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"}
				]
			})
			.expectChange("count") // ensures that count is observed
			.expectChange("id", ["0500000001", "0500000002"]);

		return this.createView(assert, sView, createSalesOrdersModel()).then(function () {
			that.expectChange("count", "2");

			// code under test
			that.oView.byId("count").setBindingContext(
				that.oView.byId("table").getBinding("items").getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList?$select=SalesOrderID&$orderby=SalesOrderID desc"
					+ "&$skip=0&$top=100", {
					value : [
						{SalesOrderID : "0500000002"},
						{SalesOrderID : "0500000001"}
					]
				})
				.expectChange("id", ["0500000002", "0500000001"]);

			// code under test
			that.oView.byId("table").getBinding("items").sort(new Sorter("SalesOrderID", true));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('0500000002')"
				})
				.expectChange("count", "1")
				.expectChange("id", ["0500000001"]);

			return Promise.all([
				// code under test
				that.oView.byId("table").getItems()[0].getBindingContext().delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: (not possible with the SalesOrders app)
	// * Add a filter to the sales orders list using changeParameters(), so that there are less
	// * See that the count decreases
	QUnit.test("ODLB: $count and changeParameters()", function (assert) {
		var sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$select : \'SalesOrderID\'}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"}
				]
			})
			.expectChange("count")
			.expectChange("id", ["0500000001", "0500000002"]);

		return this.createView(assert, sView, createSalesOrdersModel()).then(function () {
			that.expectChange("count", "2");

			// code under test
			that.oView.byId("count").setBindingContext(
				that.oView.byId("table").getBinding("items").getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList?$select=SalesOrderID"
					+ "&$filter=SalesOrderID gt '0500000001'&$skip=0&$top=100",
					{value : [{SalesOrderID : "0500000002"}]}
				)
				.expectChange("count", "1")
				.expectChange("id", ["0500000002"]);

			// code under test
			that.oView.byId("table").getBinding("items")
				.changeParameters({$filter : "SalesOrderID gt '0500000001'"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete multiple entities in a table. Ensure that the request to fill the gap uses
	// the correct index.
	// JIRA: CPOUI5UISERVICESV3-1769
	// BCP:  1980007571
	QUnit.test("multiple delete: index for gap-filling read requests", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" growing="true" growingThreshold="3" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=3", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"},
					{SalesOrderID : "0500000003"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002", "0500000003"]);

		return this.createView(assert, sView, oModel).then(function () {
			var aItems = that.oView.byId("table").getItems();

			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('0500000002')"
				})
				.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('0500000003')"
				})
				.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=1&$top=2", {
					value : [{SalesOrderID : "0500000004"}]
				})
				.expectChange("id", [, "0500000004"]);

			// code under test
			return Promise.all([
				aItems[1].getBindingContext().delete(),
				aItems[2].getBindingContext().delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete in a growing table and then let it grow. Ensure that the gap caused by the
	// delete is filled.
	// JIRA: CPOUI5UISERVICESV3-1769
	// BCP:  1980007571
	QUnit.test("growing while deleting: index for gap-filling read request", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			oTable,
			sView = '\
<Table id="table" growing="true" growingThreshold="3" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=3", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"},
					{SalesOrderID : "0500000003"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002", "0500000003"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oDeletePromise;

			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('0500000002')"
				})
				.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=2&$top=4", {
					value : [{SalesOrderID : "0500000004"}]
				})
				.expectChange("id", [,, "0500000004"]);

			oTable = that.oView.byId("table");

			// code under test
			oDeletePromise = oTable.getItems()[1].getBindingContext().delete();
			that.oView.byId("table-trigger").firePress();

			return Promise.all([
				oDeletePromise,
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.deepEqual(
				oTable.getBinding("items").getCurrentContexts().map(function (oContext) {
					return oContext.getPath();
				}),
				[
					"/SalesOrderList('0500000001')",
					"/SalesOrderList('0500000003')",
					"/SalesOrderList('0500000004')"
				]
			);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete in a growing table and at the same time refresh a row with higher index.
	// JIRA: CPOUI5UISERVICESV3-1829
	QUnit.test("refreshing row while deleting", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			oTable,
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"},
					{SalesOrderID : "0500000003"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002", "0500000003"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oDeletePromise;

			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('0500000002')"
				})
				.expectRequest("SalesOrderList('0500000003')?$select=SalesOrderID", {
					SalesOrderID : "0500000003"
				})
				.expectChange("id", [, "0500000003"]);

			oTable = that.oView.byId("table");

			// code under test
			oDeletePromise = oTable.getItems()[1].getBindingContext().delete();
			oTable.getItems()[2].getBindingContext().refresh();

			return Promise.all([
				oDeletePromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity in a growing table via refresh and let the table grow at the same
	// time.
	// JIRA: CPOUI5UISERVICESV3-1795
	QUnit.test("growing while deleting: adjust the pending read request", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			oTable,
			sView = '\
<Table id="table" growing="true" growingThreshold="3" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=3", {
				value : [
					{SalesOrderID : "0500000001"},
					{SalesOrderID : "0500000002"},
					{SalesOrderID : "0500000003"}
				]
			})
			.expectChange("id", ["0500000001", "0500000002", "0500000003"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("SalesOrderList?$select=SalesOrderID"
					+ "&$filter=SalesOrderID eq '0500000002'", {
					value : []
				})
				.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=3&$top=3", {
					value : [{SalesOrderID : "0500000004"}]
				})
				// this request is sent because the length is not yet known when the change event
				// for the delete is fired (it wouldn't come with $count)
				.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=5&$top=1", {value : []})
				.expectChange("id", null) // from deleting the item '0500000002'
				.expectChange("id", [,, "0500000004"]);

			oTable = that.oView.byId("table");

			// code under test
			oTable.getItems()[1].getBindingContext().refresh(undefined, true);
			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.deepEqual(
				oTable.getBinding("items").getCurrentContexts().map(function (oContext) {
					return oContext.getPath();
				}), [
					"/SalesOrderList('0500000001')",
					"/SalesOrderList('0500000003')",
					"/SalesOrderList('0500000004')"
				]
			);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete multiple entities in a table w/o own cache.
	QUnit.test("Delete multiple entities in a table w/o own cache", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'1\')}" id="form">\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="position" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		that.expectRequest("SalesOrderList('1')?$select=SalesOrderID"
				+ "&$expand=SO_2_SOITEM($select=ItemPosition,SalesOrderID)", {
				// SalesOrderId : "1,
				SO_2_SOITEM : [
					{SalesOrderID : "1", "ItemPosition" : "0010"},
					{SalesOrderID : "1", "ItemPosition" : "0020"},
					{SalesOrderID : "1", "ItemPosition" : "0030"},
					{SalesOrderID : "1", "ItemPosition" : "0040"}
				]
			})
			.expectChange("position", ["0010", "0020", "0030", "0040"]);

		return this.createView(assert, sView, oModel).then(function () {
			var aItems = that.oView.byId("table").getItems();

			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='0020')"
				})
				.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='0030')"
				})
				.expectChange("position", [, "0040"]);

			// code under test
			return Promise.all([
				aItems[1].getBindingContext().delete(),
				aItems[2].getBindingContext().delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: SalesOrders app
	// * Select a sales order
	// * Refresh the sales order list
	// * See that the count of the items is still visible
	// The key point is that the parent of the list is a ContextBinding.
	QUnit.test("ODLB: refresh via parent context binding, shared cache", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{path :\'/SalesOrderList(\\\'0500000001\\\')\', \
		parameters : {$expand : {SO_2_SOITEM : {$select : \'ItemPosition\'}}}}">\
	<Text id="count" text="{headerContext>$count}"/>\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="item" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('0500000001')?$expand=SO_2_SOITEM($select=ItemPosition)",
			{
				SalesOrderID : "0500000001",
				SO_2_SOITEM : [
					{ItemPosition : "0000000010"},
					{ItemPosition : "0000000020"},
					{ItemPosition : "0000000030"}
				]
			})
			.expectChange("count")
			.expectChange("item", ["0000000010", "0000000020", "0000000030"]);

		return this.createView(assert, sView, createSalesOrdersModel()
		).then(function () {
			that.expectChange("count", "3");

			// code under test
			that.oView.setModel(that.oView.getModel(), "headerContext");
			that.oView.byId("count").setBindingContext(
				that.oView.byId("table").getBinding("items").getHeaderContext(),
					"headerContext");

			return that.waitForChanges(assert);
		}).then(function () {
			// Respond with one employee less to show that the refresh must destroy the bindings for
			// the last row. Otherwise the property binding for that row will cause a "Failed to
			// drill down".
			that.expectRequest(
				"SalesOrderList('0500000001')?$expand=SO_2_SOITEM($select=ItemPosition)", {
					SalesOrderID : "0500000001",
					SO_2_SOITEM : [
						{ItemPosition : "0000000010"},
						{ItemPosition : "0000000030"}
					]
				})
				.expectChange("count", "2")
				.expectChange("item", [, "0000000030"]);

			// code under test
			that.oView.byId("form").getObjectBinding().refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh a suspended ODCB with a dependent ODLB having a cache. See that both caches
	// are refreshed when resuming. See CPOUI5UISERVICESV3-1179
	QUnit.test("Refresh a suspended binding hierarchy", function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			bPropertyEvent,
			bTableEvent,
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'0500000001\')}">\
	<Text id="note" text="{Note}"/>\
	<Text id="count" text="{headerContext>$count}"/>\
	<Table id="table" items="{path : \'SO_2_SOITEM\', parameters : {$$ownRequest : true}}">\
		<ColumnListItem>\
			<Text id="item" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('0500000001')?$select=Note,SalesOrderID",
				{SalesOrderID : "0500000001", Note : "initial"})
			.expectRequest("SalesOrderList('0500000001')/SO_2_SOITEM?$select=ItemPosition,"
				+ "SalesOrderID&$skip=0&$top=100", {
					value : [
						{ItemPosition : "0000000010"},
						{ItemPosition : "0000000020"}
					]
			})
			.expectChange("count")
			.expectChange("note", "initial")
			.expectChange("item", ["0000000010", "0000000020"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oCount = that.oView.byId("count");

			that.expectChange("count", "2");

			oCount.setModel(that.oView.getModel(), "headerContext");
			oCount.setBindingContext(
				that.oView.byId("table").getBinding("items").getHeaderContext(),
				"headerContext");

			return that.waitForChanges(assert);
		}).then(function () {
			oBinding = that.oView.byId("form").getObjectBinding();

			// code under test
			oBinding.suspend();
			oBinding.refresh();

			// Do not immediately resume to see that no requests are triggered by refresh
			return resolveLater();
		}).then(function () {
			that.expectRequest("SalesOrderList('0500000001')?$select=Note,SalesOrderID",
					{SalesOrderID : "0500000001", Note : "refreshed"})
				.expectRequest("SalesOrderList('0500000001')/SO_2_SOITEM?$select=ItemPosition,"
					+ "SalesOrderID&$skip=0&$top=100", {
						value : [
							{ItemPosition : "0000000010"},
							{ItemPosition : "0000000020"},
							{ItemPosition : "0000000030"}
						]
				})
				.expectChange("count", "3")
				.expectChange("note", "refreshed")
				.expectChange("item", [,, "0000000030"]);

			// expect event only for ODLB because ODCB doesn't fire a change event
			that.oView.byId("table").getBinding("items")
				.attachEventOnce("refresh", function (oEvent) {
					bTableEvent = true;
					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh,
						"Table change event");
			});

			that.oView.byId("note").getBinding("text")
				.attachEventOnce("change", function (oEvent) {
					bPropertyEvent = true;
					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh,
						"ID property change event");
			});

			// code under test
			oBinding.resume();

			return that.waitForChanges(assert);
		}).then(function () {
			assert.ok(bTableEvent, "got TableEvent");
			assert.ok(bPropertyEvent, "got PropertyEvent");
		});
	});

	//*********************************************************************************************
	// Scenario: Modify a property which does not belong to the parent binding's entity
	QUnit.test("Modify a foreign property", function (assert) {
		var sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Input id="item" value="{SO_2_BP/CompanyName}" />\
	</ColumnListItem>\
</Table>',
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			that = this;

		this.expectRequest("SalesOrderList?$select=SalesOrderID"
				+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=100", {
				value : [{
					SalesOrderID : "0500000002",
					SO_2_BP : {
						"@odata.etag" : "ETag",
						BusinessPartnerID : "42",
						CompanyName : "Foo"
					}
				}]
			})
			.expectChange("item", ["Foo"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "BusinessPartnerList('42')",
					headers : {"If-Match" : "ETag"},
					payload : {CompanyName : "Bar"}
				}, {CompanyName : "Bar"})
				.expectChange("item", ["Bar"]);

			that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value")
				.setValue("Bar");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Modify a property, the server responds with 204 (No Content) on the PATCH request.
	// Sample for this behavior: OData V4 TripPin service from odata.org
	QUnit.test("Modify a property, server responds with 204 (No Content)", function (assert) {
		var sView = '<FlexBox binding="{/EMPLOYEES(\'2\')}">\
						<Input id="text" value="{Name}" />\
					</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')", {Name : "Jonathan Smith"})
			.expectChange("text", "Jonathan Smith");

		return this.createView(assert, sView).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('2')",
					payload : {Name : "Jonathan Schmidt"}
				}) // 204 No Content
				.expectChange("text", "Jonathan Schmidt");

			// code under test
			that.oView.byId("text").getBinding("value").setValue("Jonathan Schmidt");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Read and modify an entity with key aliases
	QUnit.test("Entity with key aliases", function (assert) {
		var sView = '\
<Table id="table" items="{/EntitiesWithComplexKey}">\
	<ColumnListItem>\
		<Input id="item" value="{Value}" />\
	</ColumnListItem>\
</Table>',
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			that = this;

		this.expectRequest("EntitiesWithComplexKey?$select=Key/P1,Key/P2,Value&$skip=0&$top=100", {
				value : [{
					Key : {
						P1 : "foo",
						P2 : 42
					},
					Value : "Old",
					"@odata.etag" : "ETag"
				}]
			})
			.expectChange("item", ["Old"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "EntitiesWithComplexKey(Key1='foo',Key2=42)",
					headers : {"If-Match" : "ETag"},
					payload : {Value : "New"}
				}, {Value : "New"})
				.expectChange("item", ["New"]);

			that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value")
				.setValue("New");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Request Late property with navigation properties in entity with key aliases
	// JIRA: CPOUI5ODATAV4-122
	QUnit.test("Late property in entity with key aliases", function (assert) {
		var oBinding,
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/As(\'1\')}">\
	<Text text="{AValue}"/>\
</FlexBox>\
<Input id="value" value="{AtoEntityWithComplexKey/Value}"/>',
			that = this;

		this.expectRequest("As('1')?$select=AID,AValue", {
				AID : "1",
				AValue : "avalue"
			})
			.expectChange("value");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("As('1')?$select=AID"
				+ "&$expand=AtoEntityWithComplexKey($select=Key/P1,Key/P2,Value)", {
					AID : "1",
					AtoEntityWithComplexKey : {
						Key : {
							P1 : "p1",
							P2 : 2
						},
						Value : "42"
					}
				})
				.expectChange("value", "42");

			oBinding = that.oView.byId("value").getBinding("value");
			oBinding.setContext(
				that.oView.byId("form").getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("value", "changed")
				.expectRequest({
					method : "PATCH",
					url : "EntityWithComplexKey(Key1='p1',Key2=2)",
					payload : {Value : "changed"}
				});

			oBinding.setValue("changed");
			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Test events createSent and createCompleted for success and error cases
	// (CPOUI5UISERVICESV3-1761)
	QUnit.test("createSent and createCompleted", function (assert) {
		var oBinding,
			oCreatedContext,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			fnRejectPost,
			fnResolvePost,
			fnResolveCreateCompleted,
			fnResolveCreateSent,
			oTable,
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="salesOrderID" text="{SalesOrderID}" />\
		<Input id="note" value="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		/*
		 * Event handler for createCompleted event. Checks that "context" and "success" parameters
		 * are as expected and resolves the promise for the createCompleted event.
		 */
		function onCreateCompleted(oEvent) {
			assert.ok(fnResolveCreateCompleted, "expect createCompleted");
			assert.strictEqual(oEvent.getParameter("context"), oCreatedContext);
			assert.strictEqual(oEvent.getParameter("success"), fnResolveCreateCompleted.bSuccess);
			fnResolveCreateCompleted();
			fnResolveCreateCompleted = undefined;
		}

		/*
		 * Event handler for createSent event. Checks that the "context" parameter is as expected
		 * and resolves the promise for the createSent event.
		 */
		function onCreateSent(oEvent) {
			assert.ok(fnResolveCreateSent, "expect createSent");
			assert.strictEqual(oEvent.getParameter("context"), oCreatedContext);
			fnResolveCreateSent();
			fnResolveCreateSent = undefined;
		}

		/*
		 * Creates a pending promise for the createCompleted event. It is resolved when the event
		 * handler for createCompleted is called.
		 * @param {boolean} bSuccess The expected success flag in the createCompleted event payload
		 */
		function expectCreateCompleted(bSuccess) {
			return new Promise(function (resolve) {
				fnResolveCreateCompleted = resolve;
				fnResolveCreateCompleted.bSuccess = bSuccess;
			});
		}

		/*
		 * Creates a pending promise for the createSent event. It is resolved when the event handler
		 * for createSent is called.
		 */
		function expectCreateSent() {
			return new Promise(function (resolve) {
				fnResolveCreateSent = resolve;
			});
		}

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=100", {
				value : [{
					Note : "foo",
					SalesOrderID : "42"
				}]
			})
			.expectChange("note", ["foo"])
			.expectChange("salesOrderID", ["42"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oCreateSentPromise = expectCreateSent();

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			oBinding.attachCreateCompleted(onCreateCompleted);
			oBinding.attachCreateSent(onCreateSent);

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "bar"}
				}, new Promise(function (resolve, reject) {
					fnRejectPost = reject;
				}))
				.expectChange("note", ["bar", "foo"])
				.expectChange("salesOrderID", ["", "42"]);

			oCreatedContext = oBinding.create({Note : "bar"}, /*bSkipRefresh*/ true);

			return Promise.all([
				oCreateSentPromise,
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oCreateCompletedPromise = expectCreateCompleted(false),
				oError = createError({code : "CODE", message : "Failure"});

			that.expectMessages([{
					code : "CODE",
					descriptionUrl : undefined,
					message : "Failure",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);
			that.oLogMock.expects("error")
				.withExactArgs("POST on 'SalesOrderList' failed; will be repeated automatically",
					sinon.match(oError.message), "sap.ui.model.odata.v4.ODataListBinding");

			fnRejectPost(oError);

			return Promise.all([
				oCreateCompletedPromise,
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oCreateSentPromise = expectCreateSent();

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "baz"}
				}, new Promise(function (resolve, reject) {
					fnResolvePost = resolve;
				}))
				.expectChange("note", ["baz"]);

			oTable.getItems()[0].getCells()[1].getBinding("value").setValue("baz");

			return Promise.all([
				oCreateSentPromise,
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oCreateCompletedPromise = expectCreateCompleted(true);

			that.expectChange("salesOrderID", ["43"]);

			fnResolvePost({
				Note : "baz",
				SalesOrderID : "43"
			});

			return Promise.all([
				oCreateCompletedPromise,
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a sales order w/o key properties, enter a note, then submit the batch
	[false, true].forEach(function (bSkipRefresh) {
		QUnit.test("Create with user input - bSkipRefresh: " + bSkipRefresh, function (assert) {
			var oCreatedContext,
				oModel = createSalesOrdersModel({
					autoExpandSelect : true,
					updateGroupId : "update"
				}),
				sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Input id="note" value="{Note}" />\
		<Text id="companyName" binding="{SO_2_BP}" text="{CompanyName}"/>\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectRequest("SalesOrderList?$select=Note,SalesOrderID"
					+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=100", {
					value : [{
						Note : "foo",
						SalesOrderID : "42",
						SO_2_BP : {
							BusinessPartnerID : "123",
							CompanyName : "SAP"
						}
					}]
				})
				.expectChange("note", ["foo"])
				// companyName is embedded in a context binding; index not considered in test
				// framework
				.expectChange("companyName", "SAP");

			return this.createView(assert, sView, oModel).then(function () {
				var oTable = that.oView.byId("table");

				that.expectChange("note", ["bar", "foo"])
					.expectChange("note", ["baz"])
					.expectChange("companyName", null)
					.expectChange("companyName", "SAP");

				oCreatedContext = oTable.getBinding("items").create({Note : "bar"}, bSkipRefresh);
				oTable.getItems()[0].getCells()[0].getBinding("value").setValue("baz");

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectRequest({
						method : "POST",
						url : "SalesOrderList",
						payload : {Note : "baz"}
					}, {
						Note : "from server",
						SalesOrderID : "43"
					})
					.expectChange("note", ["from server"]);
				if (!bSkipRefresh) {
					that.expectRequest("SalesOrderList('43')?$select=Note,SalesOrderID"
							+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)", {
							Note : "fresh from server",
							SalesOrderID : "43",
							SO_2_BP : {
								BusinessPartnerID : "456",
								CompanyName : "ACM"
							}
						})
						.expectChange("note", ["fresh from server"])
						.expectChange("companyName", "ACM");
				}

				return Promise.all([
					oCreatedContext.created(),
					that.oModel.submitBatch("update"),
					that.waitForChanges(assert)
				]);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Create multiple w/o refresh: (2) Create two new entities without save in between,
	// save (CPOUI5UISERVICESV3-1759)
	QUnit.test("Create multiple w/o refresh, with $count: (2)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" items="{path : \'/SalesOrderList\', parameters : {$count : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$count=true&$select=Note,SalesOrderID&$skip=0&$top=100",
			{
				"@odata.count" : "1",
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("count")
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			assert.strictEqual(oBinding.getLength(), 1);

			that.expectChange("count", "1");

			that.oView.byId("count").setBindingContext(oBinding.getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("count", "2")
				.expectChange("id", ["", "42"])
				.expectChange("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			assert.strictEqual(oBinding.getLength(), 2);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("count", "3")
				.expectChange("id", [, "", "42"])
				.expectChange("note", ["New 2", "New 1", "First SalesOrder"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			assert.strictEqual(oBinding.getLength(), 3);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectChange("id", ["44", "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oBinding.getLength(), 3);
		});
	});

	//*********************************************************************************************
	// Scenario: Create multiple w/o refresh: (3) Start with (2), Create third entity, save, delete
	// third created entity, save (CPOUI5UISERVICESV3-1759)
	QUnit.test("Create multiple w/o refresh: (3)", function (assert) {
		var oCreatedContext,
			that = this;

		return this.createTwiceSaveInBetween(assert).then(function () {
			oCreatedContext = that.createThird();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "45"
				})
				.expectChange("id", ["45"]);

			return Promise.all([
				oCreatedContext.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('45')"
				})
				.expectChange("count", "3")
				.expectChange("id", ["44", "43", "42"])
				.expectChange("note", ["New 2", "New 1", "First SalesOrder"]);

			return Promise.all([
				oCreatedContext.delete("$auto"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create multiple w/o refresh: create thrice, then delete last
	// (4a) Start with (2), Create third entity, no save, reset changes via binding, save
	// (4b) Start with (2), Create third entity, no save, reset changes via model, save
	// (5) Start with (2), Create third entity, no save, delete third created entity
	// CPOUI5UISERVICESV3-1759
[
	"Create multiple w/o refresh: (4a)",
	"Create multiple w/o refresh: (4b)",
	"Create multiple w/o refresh: (5)"
].forEach(function (sTitle, i) {
	QUnit.test(sTitle, function (assert) {
		var oCreatedContext,
			that = this;

		function deleteSalesOrder() {
			if (i === 0) {
				that.oView.byId("table").getBinding("items").resetChanges();
			} else if (i === 1) {
				that.oModel.resetChanges();
			} else if (i === 2) {
				return oCreatedContext.delete("$auto");
			}
		}

		return this.createTwiceSaveInBetween(assert).then(function () {
			oCreatedContext = that.createThird();

			return that.waitForChanges(assert);
		}).then(function () {
			// no request
			that.expectChange("count", "3")
				.expectChange("id", ["44", "43", "42"])
				.expectChange("note", ["New 2", "New 1", "First SalesOrder"]);

			return Promise.all([
				oCreatedContext.created().catch(function () {/* avoid uncaught (in promise) */}),
				deleteSalesOrder(),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Create multiple w/o refresh: (6) Start with (2), create third entity, save, delete
	// second entity (CPOUI5UISERVICESV3-1759)
	QUnit.test("Create multiple w/o refresh: (6)", function (assert) {
		var oCreatedContext,
			that = this;

		return this.createTwiceSaveInBetween(assert).then(function () {
			oCreatedContext = that.createThird();

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "45"
				})
				.expectChange("id", ["45"]);

			return Promise.all([
				oCreatedContext.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('44')"
				})
				.expectChange("count", "3")
				.expectChange("id", [, "43", "42"])
				.expectChange("note", [, "New 1", "First SalesOrder"]);

			return Promise.all([
				that.oView.byId("table").getItems()[1].getBindingContext().delete("$auto"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create multiple w/o refresh: (7) Create thrice without save, delete second entity,
	// check remaining contexts are still transient and reference the expected data. Read next
	// elements from server.
	// CPOUI5UISERVICESV3-1759, CPOUI5UISERVICESV3-1784
	QUnit.test("Create multiple w/o refresh, with $count: (7)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<Text id="count" text="{$count}"/>\
<Table id="table" growing="true" growingThreshold="2"\
		items="{path : \'/SalesOrderList\', parameters : {$count : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$count=true&$select=Note,SalesOrderID&$skip=0&$top=2", {
				"@odata.count" : "3",
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}, {
					Note : "Second SalesOrder",
					SalesOrderID : "43"
				}]
			})
			.expectChange("count")
			.expectChange("id", ["42", "43"])
			.expectChange("note", ["First SalesOrder", "Second SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			that.expectChange("count", "3");

			that.oView.byId("count").setBindingContext(oBinding.getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("count", "4")
				.expectChange("id", [""])
				.expectChange("note", ["New 1"]);

			// never persisted or deleted
			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("count", "5")
				.expectChange("id", [""])
				.expectChange("note", ["New 2"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("count", "6")
				.expectChange("id", [""])
				.expectChange("note", ["New 3"]);

			// never persisted or deleted
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("count", "5")
				.expectChange("note", [, "New 1"]);

			return Promise.all([
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(oCreatedContext2.getProperty("Note"), "New 3");
			// ensure consistency of cached data;
			// when using key predicate, it does not matter, if the object is contained in the array
			// of the collection or not, as long as it is contained in $byPredicate map, that object
			// is used. Only with index path it is possible to see a potential mismatch between
			// the array of contexts in the ODataListBinding and the collection in the cache.
			assert.strictEqual(oCreatedContext2.getProperty("/SalesOrderList/-2/Note"), "New 3");

			assert.strictEqual(oCreatedContext0.isTransient(), true);
			assert.strictEqual(oCreatedContext0.getProperty("Note"), "New 1");
			assert.strictEqual(oCreatedContext0.getProperty("/SalesOrderList/-1/Note"), "New 1");

			that.expectChange("id", [,, "42", "43"])
				.expectChange("note", [,, "First SalesOrder", "Second SalesOrder"]);

			// show more items
			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList?$count=true&$select=Note,SalesOrderID"
					+ "&$skip=2&$top=1", {
					"@odata.count" : "3",
					value : [{
						Note : "Third SalesOrder",
						SalesOrderID : "44"
					}]
				})
				.expectChange("id", "44", 4)
				.expectChange("note", "Third SalesOrder", 4);

			// show more items - ensure correct server side index for reading more elements
			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (1)
	//  List binding: relative without cache
	//  Number of transient: 0
	//  Delete: Context.delete as Context.refresh(bAllowRemoval=true) is not possible
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (1)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true" items="{BP_2_SO}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
				+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", ["", "", ""])
				.expectChange("note", ["New 3", "New 2", "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "45"
				})
				.expectChange("id", ["45", "44", "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('44')"
				});

			return Promise.all([
				oTable.getItems()[1].getBindingContext().delete("$auto"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (2)
	//  List binding: absolute
	//  Number of transient: 2
	//  Delete: Context.delete
	//  Table control: sap.ui.table.Table
	//  Additional tests: update last, transient: update of POST payload expected
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (2)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}" visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{SalesOrderID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Input id="note" value="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=102", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", ["", "42"])
				.expectChange("note", ["New 1", "First SalesOrder"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectChange("id", ["43"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			// check row here because table calls getContexts for event ChangeReason.Add async.
			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext1);

			that.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", [, "43"])
				.expectChange("note", [, "New 1"]);

			return Promise.all([
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			that.expectChange("id", [, "43", "42"])
				.expectChange("note", [, "New 1", "First SalesOrder"]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", ["", "43"])
				.expectChange("note", ["New 3", "New 1"]);

			oTable.setFirstVisibleRow(0);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			// table calls getContexts after setFirstVisibleRow asynchronously
			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2, "1");
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0, "2");
			assert.strictEqual(oCreatedContext0.isTransient(), false);

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 3 - Changed"}
				}, {
					Note : "New 3 - Changed",
					SalesOrderID : "44"
				})
				.expectChange("id", ["44"])
				.expectChange("note", ["New 3 - Changed"]);

			aRows[0].getCells()[1].getBinding("value").setValue("New 3 - Changed");

			return Promise.all([
				oCreatedContext2.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2, "1");
			assert.strictEqual(oCreatedContext2.isTransient(), false);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0, "2");
			assert.strictEqual(oCreatedContext0.isTransient(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (3)
	//  List binding: relative with cache
	//  Number of transient: 0
	//  Delete: Context.delete
	//  Table control: sap.ui.table.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (3)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<t:Table id="table" rows="{path : \'BP_2_SO\', parameters : {$$ownRequest : true}}"\
			threshold="0" visibleRowCount="2">\
		<t:Column>\
			<t:template>\
				<Text id="id" text="{SalesOrderID}" />\
			</t:template>\
		</t:Column>\
		<t:Column>\
			<t:template>\
				<Text id="note" text="{Note}" />\
			</t:template>\
		</t:Column>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')/BP_2_SO?$select=Note,SalesOrderID"
				+ "&$skip=0&$top=2", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "45"
				})
				.expectChange("id", ["45", "44"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oTable.getRows()[1].getBindingContext(), oCreatedContext1);

			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('44')"
				})
				.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", [, "43"])
				.expectChange("note", [, "New 1"]);

			return Promise.all([
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), false);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);

			that.expectChange("id", [, "43", "42"])
				.expectChange("note", [, "New 1", "First SalesOrder"]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aRows[1].getBindingContext().isTransient(), undefined);
		}).then(function () {
			that.expectChange("id", ["45", "43"])
				.expectChange("note", ["New 3", "New 1"]);

			oTable.setFirstVisibleRow(0);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), false);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (4)
	//  List binding: relative with cache
	//  Number of transient: 1
	//  Delete: Context.delete
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (4)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect: true,
				updateGroupId: "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true"\
		items="{path : \'BP_2_SO\', parameters : {$$ownRequest : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')/BP_2_SO?$select=Note,SalesOrderID"
				+ "&$skip=0&$top=20", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 2", "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectChange("id", ["44", "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", [""])
				.expectChange("note", ["New 3"]);

			// never persisted or deleted
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('44')"
				});
			// no change event: getContexts with E.C.D. returns a diff containing one delete only

			oCreatedContext1.delete("$auto");

			return that.waitForChanges(assert);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 3);
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[2].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (5)
	//  List binding: absolute
	//  Number of transient: 0
	//  Delete: Context.delete
	//  Table control: sap.m.Table
	//  Additional tests: update last, persisted: PATCH expected
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (5)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<Table id="table" growing="true" growingThreshold="2"\
	items="{parameters : {$filter : \'contains(Note,\\\'SalesOrder\\\')\'},\
		path : \'/SalesOrderList\'}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Input id="note" value="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$filter=contains(Note,'SalesOrder')"
					+ "&$select=Note,SalesOrderID&$skip=0&$top=2", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}, {
					Note : "Second SalesOrder",
					SalesOrderID : "43"
				}]
			})
			.expectChange("id", ["42", "43"])
			.expectChange("note", ["First SalesOrder", "Second SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "44"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "45"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "46"
				})
				.expectChange("id", ["46", "45"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('45')"
				})
				// next row "scrolls into view"
				.expectChange("id", [, "44"])
				.expectChange("note", [, "New 1"]);

			return Promise.all([
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('46')",
					payload : {Note : "New 3 - Changed"}
				}, {
					Note : "New 3 - Changed",
					SalesOrderID : "46"
				})
				.expectChange("note", ["New 3 - Changed"]);

			oTable.getItems()[0].getCells()[1].getBinding("value").setValue("New 3 - Changed");

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 2, "growingThreshold=2");
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), false);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
		}).then(function () {
			that.expectChange("id", [,, "42", "43"])
				.expectChange("note", [,, "First SalesOrder", "Second SalesOrder"]);

			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList?$filter=(contains(Note,'SalesOrder'))"
					+ " and not (SalesOrderID eq '46' or SalesOrderID eq '44')"
					+ "&$select=Note,SalesOrderID&$skip=2&$top=2", {
					value : []
				});

			that.oView.byId("table-trigger").firePress();

			return that.waitForChanges(assert);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 4);
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), false);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[2].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aItems[3].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (6)
	//  List binding: absolute
	//  Number of transient: 1
	//  Delete: Context.refresh(bAllowRemoval=true)
	//  Table control: sap.ui.table.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (6)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}" visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{SalesOrderID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="note" text="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=102", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("note", ["New 2", "New 1"])
				.expectChange("id", ["", ""]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectChange("id", ["44", "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", ["", "44"])
				.expectChange("note", ["New 3", "New 2"]);

			// never persisted or deleted
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getRows()[1].getBindingContext(), oCreatedContext1);

			that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&"
						+ "$filter=SalesOrderID eq '44'", {
					value : []
				})
				.expectChange("id", null) // for the deleted row
				.expectChange("note", null)
				.expectChange("id", [, "43"])
				.expectChange("note", [, "New 1"]);

			return Promise.all([
				oCreatedContext1.refresh("$auto", true/*bAllowRemoval*/),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			that.expectChange("id", [, "43", "42"])
				.expectChange("note", [, "New 1", "First SalesOrder"]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", ["", "43"])
				.expectChange("note", ["New 3", "New 1"]);

			oTable.setFirstVisibleRow(0);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (7)
	//  List binding: relative without cache
	//  Number of transient: 3
	//  Delete: ODataModel.resetChanges
	//  Table control: sap.ui.table.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (7)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect: true,
				updateGroupId: "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<t:Table id="table" rows="{BP_2_SO}" visibleRowCount="2">\
		<t:Column>\
			<t:template>\
				<Text id="id" text="{SalesOrderID}" />\
			</t:template>\
		</t:Column>\
		<t:Column>\
			<t:template>\
				<Text id="note" text="{Note}" />\
			</t:template>\
		</t:Column>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
				+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}, { // Second sales order to avoid an empty row in table after resetChanges();
					 // an empty row results in not deterministic change event, e.g. id[null] = null
					Note : "Second SalesOrder",
					SalesOrderID : "43"
				}]
			})
			.expectChange("id", ["42", "43"])
			.expectChange("note", ["First SalesOrder", "Second SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", ["42", "43"])
				.expectChange("note", ["First SalesOrder", "Second SalesOrder"]);

			oModel.resetChanges();

			return Promise.all([
				oCreatedContext0.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext2.created().catch(function () {/* avoid uncaught (in promise) */}),
				that.waitForChanges(assert, true)
			]);
			// scrolling not possible: only one entry
		});
	});


	//*********************************************************************************************
	// Scenario: All pairs test for multi create (8)
	//  List binding: relative with cache
	//  Number of transient: 2
	//  Delete: ODataListBinding.resetChanges
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (8)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true"\
		items="{path : \'BP_2_SO\', parameters : {$$ownRequest : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')/BP_2_SO?$select=Note,SalesOrderID"
				+ "&$skip=0&$top=20", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", [""])
				.expectChange("note", ["New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectChange("id", ["43"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 4);
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext1);
			assert.strictEqual(oCreatedContext1.isTransient(), true);
			assert.strictEqual(aItems[2].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[3].getBindingContext().isTransient(), undefined);

			// no change event: getContexts with E.C.D. returns a diff containing one delete only

			return Promise.all([
				oBinding.resetChanges(),
				that.checkCanceled(assert, oCreatedContext1.created()),
				that.checkCanceled(assert, oCreatedContext2.created())
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 2);
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[1].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (9)
	//  List binding: relative without cache
	//  Number of transient: 3
	//  Delete: Context.delete
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (9)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true" items="{BP_2_SO}">\
		<ColumnListItem>\
			<Text id="id" text="{SalesOrderID}" />\
			<Text id="note" text="{Note}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
				+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", ["", "", ""])
				.expectChange("note", ["New 3", "New 2", "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			// no change event: getContexts with E.C.D. returns a diff containing one delete only

			return Promise.all([
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), true);
			assert.strictEqual(aItems[2].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (10)
	//  List binding: absolute
	//  Number of transient: 3
	//  Delete: ODataListBinding.resetChanges
	//  Table control: sap.ui.table.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (10)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}" visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{SalesOrderID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="note" text="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=102", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}, { // Second sales order to avoid an empty row in table after resetChanges();
					// an empty row results in not deterministic change event, e.g. id[null] = null
					Note : "Second SalesOrder",
					SalesOrderID : "41"
				}]
			})
			.expectChange("id", ["42", "41"])
			.expectChange("note", ["First SalesOrder", "Second SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("note", ["New 3", "New 2"])
				.expectChange("id", ["", ""]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", ["42", "41"])
				.expectChange("note", ["First SalesOrder", "Second SalesOrder"]);

			return Promise.all([
				oBinding.resetChanges(),
				oCreatedContext0.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext2.created().catch(function () {/* avoid uncaught (in promise) */}),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aRows[1].getBindingContext().isTransient(), undefined);
		});
		// scrolling not possible: only one entry
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (11)
	//  List binding: relative without cache
	//  Number of transient: 2
	//  Delete: ODataListBinding.resetChanges
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (11)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true" items="{BP_2_SO}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
				+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", [""])
				.expectChange("note", ["New 1"]);

			oCreatedContext0 = oTable.getBinding("items").create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectChange("id", ["43"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			// no change event: getContexts with E.C.D. returns a diff containing two deletes only

			return Promise.all([
				oBinding.resetChanges(),
				that.checkCanceled(assert, oCreatedContext1.created()),
				that.checkCanceled(assert, oCreatedContext2.created()),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[1].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (12)
	//  List binding: relative with cache
	//  Number of transient: 3
	//  Delete: ODataModel.resetChanges
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (12)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true"\
		items="{path : \'BP_2_SO\', parameters : {$$ownRequest : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')/BP_2_SO?$select=Note,SalesOrderID"
				+ "&$skip=0&$top=20", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", ["", "", ""])
				.expectChange("note", ["New 3", "New 2", "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 4);
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext1);
			assert.strictEqual(oCreatedContext1.isTransient(), true);
			assert.strictEqual(aItems[2].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), true);
			assert.strictEqual(aItems[3].getBindingContext().isTransient(), undefined);

			// no change event: getContexts with E.C.D. returns a diff containing three deletes only
			oModel.resetChanges();

			return Promise.all([
				that.checkCanceled(assert, oCreatedContext0.created()),
				that.checkCanceled(assert, oCreatedContext1.created()),
				that.checkCanceled(assert, oCreatedContext2.created())
			]);
		}).then(function () {
			assert.strictEqual(oTable.getItems()[0].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (13)
	//  List binding: absolute
	//  Number of transient: 2
	//  Delete: ODataModel.resetChanges
	//  Table control: sap.ui.table.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (13)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}" visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{SalesOrderID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="note" text="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=102", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("note", ["New 1", "First SalesOrder"])
				.expectChange("id", ["", "42"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectChange("id", ["43"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("note", ["New 1", "First SalesOrder"])
				.expectChange("id", ["43", "42"]);

			oModel.resetChanges();

			return Promise.all([
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */}),
				oCreatedContext2.created().catch(function () {/* avoid uncaught (in promise) */}),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aRows[1].getBindingContext().isTransient(), undefined);
		});
		// scrolling not possible: only two entries
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (14)
	//  List binding: relative without cache
	//  Number of transient: 1
	//  Delete: Context.delete
	//  Table control: sap.ui.table.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (14)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<t:Table id="table" rows="{BP_2_SO}" visibleRowCount="2">\
		<t:Column>\
			<t:template>\
				<Text id="id" text="{SalesOrderID}" />\
			</t:template>\
		</t:Column>\
		<t:Column>\
			<t:template>\
				<Text id="note" text="{Note}" />\
			</t:template>\
		</t:Column>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
					+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", ["", ""])
				.expectChange("note", ["New 2", "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectChange("id", ["44"])
				.expectChange("id", [, "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", ["", "44"])
				.expectChange("note", ["New 3", "New 2"]);

			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('44')"
				})
				.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", [, "43"])
				.expectChange("note", [, "New 1"]);

			return Promise.all([
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
		}).then(function () {
			that.expectChange("id", [, "43", "42"])
				.expectChange("note", [, "New 1", "First SalesOrder"]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aRows[1].getBindingContext().isTransient(), undefined);
		}).then(function () {
			that.expectChange("id", ["", "43"])
				.expectChange("note", ["New 3", "New 1"]);

			oTable.setFirstVisibleRow(0);

			return that.waitForChanges(assert);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (15)
	//  List binding: absolute
	//  Number of transient: 0
	//  Delete: Context.refresh(bAllowRemoval=true)
	//  Table control: sap.m.Table
	//  Create at: start
	// CPOUI5UISERVICESV3-1792
	QUnit.test("All pairs test for multi create (15)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<Table id="table" growing="true" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=20", {
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", ["", "", ""])
				.expectChange("note", ["New 3", "New 2", "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "45"
				})
				.expectChange("id", ["45", "44", "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&"
					+ "$filter=SalesOrderID eq '44'", {
					value : []
				});

			return Promise.all([
				oCreatedContext1.refresh("$auto", true/*bAllowRemoval*/),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 3);
			assert.strictEqual(aItems[0].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), false);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[2].getBindingContext().isTransient(), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (16)
	//  List binding: absolute
	//  Number of transient: 3
	//  Delete: Context.delete
	//  Table control: sap.ui.table.Table
	//  Create at: end
	// CPOUI5UISERVICESV3-1818
	QUnit.test("All pairs test for multi create (16)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<t:Table id="table" rows="{path : \'/SalesOrderList\', parameters : {$count : true}}"\
		visibleRowCount="3">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{SalesOrderID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="note" text="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderList"
				+ "?$count=true&$select=Note,SalesOrderID&$skip=0&$top=103", {
				"@odata.count" : "1",
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", [, "", ""])
				.expectChange("note", [, "New 1", "New 2"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("note", [,, "New 3"]);

			return Promise.all([
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */
				}),
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(aRows.length, 3);
			assert.strictEqual(aRows[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(aRows[2].getBindingContext(), oCreatedContext2);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (17)
	//  List binding: relative without cache
	//  Number of transient: 2
	//  Delete: ODataModel.resetChanges
	//  Table control: sap.m.Table
	//  Create at: end
	// CPOUI5UISERVICESV3-1818
	QUnit.test("All pairs test for multi create (17)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true" items="{path : \'BP_2_SO\', parameters : {$count : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
			+ "&$expand=BP_2_SO($count=true;$select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				"BP_2_SO@odata.count" : "1",
				BP_2_SO : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", [, ""])
				.expectChange("note", [, "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectChange("id", [, "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", [,, "", ""])
				.expectChange("note", [,, "New 2", "New 3"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			// no change event: getContexts with E.C.D. returns a diff containing two deletes only
			that.oModel.resetChanges();

			return Promise.all([
				that.checkCanceled(assert, oCreatedContext1.created()),
				that.checkCanceled(assert, oCreatedContext2.created()),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext1.isTransient(), false);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (18)
	//  List binding: absolute
	//  Number of transient: 0
	//  Delete: Context.refresh(bAllowRemoval=true)
	//  Table control: sap.m.Table
	//  Create at: end
	// CPOUI5UISERVICESV3-1818
	QUnit.test("All pairs test for multi create (18)", function (assert) {
		var oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<Table id="table" growing="true" items="{path : \'/SalesOrderList\',\
		parameters : {$count : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList"
			+ "?$count=true&$select=Note,SalesOrderID&$skip=0&$top=20", {
				"@odata.count" : "1",
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding;

			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", [, "", "", ""])
				.expectChange("note", [, "New 1", "New 2", "New 3"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 3"}
				}, {
					Note : "New 3",
					SalesOrderID : "45"
				})
				.expectChange("id", [, "43", "44", "45"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				oCreatedContext2.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oTable.getItems()[2].getBindingContext(), oCreatedContext1);

			that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&"
				+ "$filter=SalesOrderID eq '44'", {
					value : []
				});

			return Promise.all([
				oCreatedContext1.refresh("$auto", true/*bAllowRemoval*/),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 3);
			assert.strictEqual(aItems[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(aItems[2].getBindingContext(), oCreatedContext2);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (19)
	//  List binding: relative with cache
	//  Number of transient: 2
	//  Delete: ODataListBinding.resetChanges
	//  Table control: sap.m.Table
	//  Create at: end
	// CPOUI5UISERVICESV3-1818
	QUnit.test("All pairs test for multi create (19)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" growing="true"\
		items="{path : \'BP_2_SO\', parameters : {$$ownRequest : true, $count : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
		<Text id="note" text="{Note}" />\
	</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')/BP_2_SO?$count=true"
			+ "&$select=Note,SalesOrderID&$skip=0&$top=20", {
				"@odata.count" : "1",
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("items");

			that.expectChange("id", [, ""])
				.expectChange("note", [, "New 1"]);

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "BusinessPartnerList('4711')/BP_2_SO",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectChange("id", [, "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("id", [,, "", ""])
				.expectChange("note", [,, "New 2", "New 3"]);

			oCreatedContext1 = oBinding.create({Note : "New 2"}, true, true);
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 4);
			assert.strictEqual(aItems[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);
			assert.strictEqual(aItems[2].getBindingContext(), oCreatedContext1);
			assert.strictEqual(oCreatedContext1.isTransient(), true);
			assert.strictEqual(aItems[3].getBindingContext(), oCreatedContext2);
			assert.strictEqual(oCreatedContext2.isTransient(), true);

			// no change event: getContexts with E.C.D. returns a diff containing three deletes only

			return Promise.all([
				oBinding.resetChanges(),
				that.checkCanceled(assert, oCreatedContext1.created()),
				that.checkCanceled(assert, oCreatedContext2.created())
			]);
		}).then(function () {
			var aItems = oTable.getItems();

			assert.strictEqual(aItems.length, 2);
			assert.strictEqual(aItems[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(aItems[1].getBindingContext(), oCreatedContext0);
		});
	});

	//*********************************************************************************************
	// Scenario: All pairs test for multi create (20)
	//  List binding: absolute
	//  Number of transient: 1
	//  Delete: Context.refresh(bAllowRemoval=true)
	//  Table control: sap.ui.table.Table
	//  Create at: end
	// CPOUI5UISERVICESV3-1818
	QUnit.test("All pairs test for multi create (20)", function (assert) {
		var oBinding,
			oCreatedContext0,
			oCreatedContext1,
			oCreatedContext2,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<t:Table id="table" rows="{path : \'/SalesOrderList\', parameters : {$count : true}}"\
		visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{SalesOrderID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="note" text="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("SalesOrderList"
			+ "?$count=true&$select=Note,SalesOrderID&$skip=0&$top=102", {
				"@odata.count" : "1",
				value : [{
					Note : "First SalesOrder",
					SalesOrderID : "42"
				}]
			})
			.expectChange("id", ["42"])
			.expectChange("note", ["First SalesOrder"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", [, ""])
				.expectChange("note", [, "New 1"]); // "New 2" is  invisible as visibleRowCount is 2

			oCreatedContext0 = oBinding.create({Note : "New 1"}, true, true);
			oCreatedContext1 = oBinding.create({Note : "New 2"}, true, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 1"}
				}, {
					Note : "New 1",
					SalesOrderID : "43"
				})
				.expectRequest({
					batchNo : 1,
					method : "POST",
					url : "SalesOrderList",
					payload : {Note : "New 2"}
				}, {
					Note : "New 2",
					SalesOrderID : "44"
				})
				.expectChange("id", [, "43"]);

			return Promise.all([
				oCreatedContext0.created(),
				oCreatedContext1.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// never persisted or deleted, new entry not visible
			oCreatedContext2 = oBinding.create({Note : "New 3"}, true, true);

			assert.strictEqual(oTable.getRows()[0].getBindingContext().isTransient(), undefined);
			assert.strictEqual(oTable.getRows()[1].getBindingContext(), oCreatedContext0);
			assert.strictEqual(oCreatedContext0.isTransient(), false);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", [, "43", "44"])
				.expectChange("note", [,"New 1", "New 2"]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "SalesOrderList('44')"
				})
				.expectChange("id", null)
				.expectChange("note", null)
				.expectChange("id", [,, ""])
				.expectChange("note", [,, "New 3"]);

			return Promise.all([
				oCreatedContext1.created().catch(function () {/* avoid uncaught (in promise) */
				}),
				oCreatedContext1.delete("$auto"),
				that.waitForChanges(assert, true)
			]);
		}).then(function () {
			var aRows = oTable.getRows();

			assert.strictEqual(oTable.getFirstVisibleRow(), 1);
			assert.strictEqual(aRows.length, 2);
			assert.strictEqual(aRows[0].getBindingContext(), oCreatedContext0);
			assert.strictEqual(aRows[1].getBindingContext(), oCreatedContext2);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a business partner w/o key properties, enter an address (complex property),
	// then submit the batch
	QUnit.test("Create with default value in a complex property", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<Table id="table" items="{/BusinessPartnerList}">\
	<ColumnListItem>\
		<Input id="city" value="{Address/City}" />\
		<Input id="longitude" value="{Address/GeoLocation/Longitude}" />\
	</ColumnListItem>\
</Table>',

			that = this;

		this.expectRequest("BusinessPartnerList?$select=Address/City,Address/GeoLocation/Longitude,"
					+ "BusinessPartnerID&$skip=0&$top=100", {
				value : [{
					Address : {
						City : "Walldorf",
						GeoLocation : null
					},
					BusinessPartnerID : "42"
				}]
			})
			.expectChange("city", ["Walldorf"])
			.expectChange("longitude", [null]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("city", ["", "Walldorf"])
				.expectChange("longitude", ["0.000000000000", null]);

			oTable = that.oView.byId("table");
			oTable.getBinding("items").create();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("city", ["Heidelberg"])
				.expectChange("longitude", ["8.700000000000"]);

			oTable.getItems()[0].getCells()[0].getBinding("value").setValue("Heidelberg");
			oTable.getItems()[0].getCells()[1].getBinding("value").setValue("8.7");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList",
					payload : {
						Address : {
							City : "Heidelberg",
							GeoLocation : {Longitude : "8.7"}
						}
					}
				}, {
					Address : {
						City : "Heidelberg",
						GeoLocation : {Longitude : "8.69"}
					},
					BusinessPartnerID : "43"
				})
				// Note: This additional request will be eliminated by CPOUI5UISERVICESV3-1436
				.expectRequest("BusinessPartnerList('43')?$select=Address/City,"
						+ "Address/GeoLocation/Longitude,BusinessPartnerID", {
					Address : {
						City : "Heidelberg",
						GeoLocation : {Longitude : "8.69"}
					},
					BusinessPartnerID : "43"
				})
				.expectChange("longitude", ["8.690000000000"]);

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a sales order line item, enter a quantity, then submit the batch. Expect the
	// quantity unit to be sent, too.
	QUnit.test("Create with default value in a currency/unit", function (assert) {
		var sView = '\
<Table id="table" items="{/SalesOrderList(\'42\')/SO_2_SOITEM}">\
	<ColumnListItem>\
		<Input id="quantity" value="{Quantity}" />\
		<Text id="unit" text="{QuantityUnit}" />\
	</ColumnListItem>\
</Table>',
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			that = this;

		this.expectRequest("SalesOrderList('42')/SO_2_SOITEM?$select=ItemPosition,Quantity,"
			+ "QuantityUnit,SalesOrderID&$skip=0&$top=100", {
				value : [{
					SalesOrderID : "42",
					ItemPosition : "0010",
					Quantity : "1.000",
					QuantityUnit : "DZ"
				}]
			})
			.expectChange("quantity", ["1.000"])
			.expectChange("unit", ["DZ"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("quantity", [null, "1.000"])
				.expectChange("unit", ["EA", "DZ"]);

			oTable = that.oView.byId("table");
			oTable.getBinding("items").create();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("quantity", ["2.000"]);

			oTable.getItems()[0].getCells()[0].getBinding("value").setValue("2.000");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('42')/SO_2_SOITEM",
					payload : {
						Quantity : "2.000",
						QuantityUnit : "EA"
					}
				}, {
					SalesOrderID : "42",
					ItemPosition : "0020",
					Quantity : "2.000",
					QuantityUnit : "EA"
				})
				// Note: This additional request will be eliminated by CPOUI5UISERVICESV3-1436
				.expectRequest("SalesOrderList('42')/SO_2_SOITEM(SalesOrderID='42',"
						+ "ItemPosition='0020')?$select=ItemPosition,Quantity,QuantityUnit,"
						+ "SalesOrderID", {
					SalesOrderID : "42",
					ItemPosition : "0020",
					Quantity : "2.000",
					QuantityUnit : "EA"
				});

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Failure when creating a sales order line item. Observe the message.
	QUnit.test("Create error", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text text="{ItemPosition}" />\
			<Input value="{ProductID}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=SalesOrderID"
			+ "&$expand=SO_2_SOITEM($select=ItemPosition,ProductID,SalesOrderID)", {
				SalesOrderID : "42",
				SO_2_SOITEM : []
			});

		return this.createView(assert, sView, oModel).then(function () {
			var oError = createError({
					code : "CODE",
					message : "Enter a product ID",
					target : "ProductID"
				});

			that.oLogMock.expects("error")
				.withExactArgs("POST on 'SalesOrderList('42')/SO_2_SOITEM' failed; "
					+ "will be repeated automatically", sinon.match(oError.message),
					"sap.ui.model.odata.v4.ODataListBinding");
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('42')/SO_2_SOITEM",
					payload : {}
				}, oError)
				.expectMessages([{
					code : "CODE",
					message : "Enter a product ID",
					persistent : true,
					target : "/SalesOrderList('42')/SO_2_SOITEM($uid=...)/ProductID",
					technical : true,
					type : "Error"
				}]);

			return Promise.all([
				that.oView.byId("table").getBinding("items").create(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[1] , "Error",
				"Enter a product ID");
		});
	});

	//*********************************************************************************************
	// Scenario: Read a sales order line item via a navigation property, enter an invalid quantity.
	// Expect an error response with a bound and unbound error in the details, and that existing
	// messages are not deleted.
	// The navigation property is necessary so that read path and patch path are different.
	QUnit.test("Read a sales order line item, enter an invalid quantity", function (assert) {
		var oError = createError({
				code : "top",
				message : "Error occurred while processing the request",
				details : [{
					code : "bound",
					message : "Value must be greater than 0",
					"@Common.longtextUrl" : "../Messages(1)/LongText",
					"@Common.numericSeverity" : 4,
					target : "Quantity"
				}, {
					code : "unbound",
					message : "Some unbound warning",
					"@Common.numericSeverity" : 3
				}]
			}),
			oExpectedMessage = {
				code : "23",
				message : "Enter a minimum quantity of 2",
				persistent : false,
				target : "/BusinessPartnerList('1')/BP_2_SO('42')/SO_2_SOITEM('0010')/Quantity",
				technical : false,
				type : "Warning"
			},
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{\
		path : \'/BusinessPartnerList(\\\'1\\\')/BP_2_SO(\\\'42\\\')/SO_2_SOITEM(\\\'0010\\\')\',\
		parameters : {$select : \'Messages\'}}">\
	<Input id="quantity" value="{Quantity}"/>\
	<Text id="unit" text="{QuantityUnit}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('1')/BP_2_SO('42')/SO_2_SOITEM('0010')"
			+ "?$select=ItemPosition,Messages,Quantity,QuantityUnit,SalesOrderID", {
				SalesOrderID : "42",
				ItemPosition : "0010",
				Quantity : "1.000",
				QuantityUnit : "DZ",
				Messages : [{
					code : "23",
					message : "Enter a minimum quantity of 2",
					numericSeverity : 3,
					target : "Quantity"
				}]
			})
			.expectChange("quantity", "1.000")
			.expectChange("unit", "DZ")
			.expectMessages([oExpectedMessage]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert, "quantity", "Warning",
				"Enter a minimum quantity of 2");
		}).then(function () {
			that.oLogMock.expects("error").twice() // Note: twice, w/ different class name :-(
				.withArgs("Failed to update path /BusinessPartnerList('1')/BP_2_SO('42')"
					+ "/SO_2_SOITEM('0010')/Quantity", sinon.match(oError.message));
			that.expectChange("quantity", "0.000")
				.expectRequest({
						method : "PATCH",
						url : "SalesOrderList('42')/SO_2_SOITEM('0010')",
						payload : {
							Quantity : "0.000",
							QuantityUnit : "DZ"
						}
					}, oError)
				.expectMessages([
					oExpectedMessage, {
						code : "top",
						message : "Error occurred while processing the request",
						persistent : true,
						target : "",
						technical : true,
						technicalDetails : {
							originalMessage : {
								code : "top",
								details : [{
									code : "bound",
									message : "Value must be greater than 0",
									"@Common.longtextUrl" : "../Messages(1)/LongText",
									"@Common.numericSeverity" : 4,
									target : "Quantity"
								}, {
									code : "unbound",
									message : "Some unbound warning",
									"@Common.numericSeverity" : 3
								}],
								message : "Error occurred while processing the request"
							}
						},
						type : "Error"
					}, {
						code : "unbound",
						message : "Some unbound warning",
						persistent : true,
						target : "",
						technicalDetails : {
							originalMessage : {
								"@Common.numericSeverity" : 3,
								code : "unbound",
								message : "Some unbound warning"
							}
						},
						type : "Warning"
					}, {
						code : "bound",
						descriptionUrl : sSalesOrderService + "Messages(1)/LongText",
						message : "Value must be greater than 0",
						persistent : true,
						target :
							"/BusinessPartnerList('1')/BP_2_SO('42')/SO_2_SOITEM('0010')/Quantity",
						technicalDetails : {
							originalMessage : {
								"@Common.longtextUrl" : "../Messages(1)/LongText",
								"@Common.numericSeverity" : 4,
								code : "bound",
								message : "Value must be greater than 0",
								target : "Quantity"
							}
						},
						type : "Error"
					}]);

			that.oView.byId("quantity").getBinding("value").setValue("0.000");

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, "quantity", "Error",
				"Value must be greater than 0");
		});
	});

	//*********************************************************************************************
	// Scenario: Modify two properties of a sales order, then submit the batch
	QUnit.test("Merge PATCHes", function (assert) {
		var sEtag = "ETag",
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<Input id="note" value="{Note}"/>\
	<Input id="amount" value="{GrossAmount}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=GrossAmount,Note,SalesOrderID", {
				"@odata.etag" : sEtag,
				GrossAmount : "1000.00",
				Note : "Note",
				SalesOrderID : "42"
			})
			.expectChange("note", "Note")
			.expectChange("amount", "1,000.00");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : sEtag},
					payload : {
						GrossAmount : "1234.56",
						Note : "Changed Note"
					}
				}, {
					GrossAmount : "1234.56",
					Note : "Changed Note From Server"
				})
				.expectChange("amount", "1,234.56")
				.expectChange("note", "Changed Note")
				.expectChange("note", "Changed Note From Server");

			that.oView.byId("amount").getBinding("value").setValue("1234.56");
			that.oView.byId("note").getBinding("value").setValue("Changed Note");

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Merge PATCHes for different entities even if there are other changes in between
	QUnit.test("Merge PATCHes for different entities", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Input id="amount" value="{GrossAmount}"/>\
		<Input id="note" value="{Note}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest(
			"SalesOrderList?$select=GrossAmount,Note,SalesOrderID&$skip=0&$top=100", {
				value : [{
					"@odata.etag" : "ETag0",
					GrossAmount : "1000.00",
					Note : "Note0",
					SalesOrderID : "41"
				},{
					"@odata.etag" : "ETag1",
					GrossAmount : "150.00",
					Note : "Note1",
					SalesOrderID : "42"
				}]
			})
			.expectChange("amount", ["1,000.00", "150.00"])
			.expectChange("note", ["Note0", "Note1"]);

		return this.createView(assert, sView, oModel).then(function () {
			var aTableItems = that.oView.byId("table").getItems(),
				oBindingAmount0 = aTableItems[0].getCells()[0].getBinding("value"),
				oBindingAmount1 = aTableItems[1].getCells()[0].getBinding("value"),
				oBindingNote0 = aTableItems[0].getCells()[1].getBinding("value"),
				oBindingNote1 = aTableItems[1].getCells()[1].getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('41')",
					headers : {"If-Match" : "ETag0"},
					payload : {
						GrossAmount : "123.45",
						Note : "Note02"
					}
				}, {
					GrossAmount : "123.45",
					Note : "Note02"
				})
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag1"},
					payload : {
						GrossAmount : "456.78",
						Note : "Note12"
					}
				}, {
					GrossAmount : "456.78",
					Note : "Note12"
				})
				.expectChange("amount", ["123.45", "456.78"])
				.expectChange("note", ["Note01", "Note11"])
				.expectChange("note", ["Note02", "Note12"]);

			// Code under test
			oBindingAmount0.setValue("123.45");
			oBindingAmount1.setValue("456.78");
			oBindingNote0.setValue("Note01");
			oBindingNote1.setValue("Note11");
			oBindingNote1.setValue("Note12");
			oBindingNote0.setValue("Note02");

			return Promise.all([
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Error response for a change set without contend-ID
	// Without target $<content-ID> in the error response we can not assign the error to the
	// right request -> all requests in the change set are rejected with the same error;
	// the error is logged for each request in the change set, but it is reported only once to
	// the message model
	QUnit.test("Error response for a change set w/o content-ID", function (assert) {
		var oError = createError({code : "CODE", message : "Value 4.22 not allowed"}),
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Input id="amount" value="{GrossAmount}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest(
			"SalesOrderList?$select=GrossAmount,SalesOrderID&$skip=0&$top=100", {
				value : [{
					"@odata.etag" : "ETag0",
					GrossAmount : "4.1",
					SalesOrderID : "41"
				},{
					"@odata.etag" : "ETag1",
					GrossAmount : "4.2",
					SalesOrderID : "42"
				}]
			})
			.expectChange("amount", ["4.10", "4.20"]);

		return this.createView(assert, sView, oModel).then(function () {
			var aTableItems = that.oView.byId("table").getItems(),
				oBindingAmount0 = aTableItems[0].getCells()[0].getBinding("value"),
				oBindingAmount1 = aTableItems[1].getCells()[0].getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('41')",
					headers : {"If-Match" : "ETag0"},
					payload : {GrossAmount : "4.11"}
				}) // no response required since the 2nd request fails
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag1"},
					payload : {GrossAmount : "4.22"}
				}, oError)
				.expectChange("amount", ["4.11", "4.22"])
				.expectMessages([{
					code : "CODE",
					message : "Value 4.22 not allowed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error")
				.withExactArgs("Failed to update path /SalesOrderList('41')/GrossAmount",
					sinon.match("Value 4.22 not allowed"),
					"sap.ui.model.odata.v4.Context");
			that.oLogMock.expects("error")
				.withExactArgs("Failed to update path /SalesOrderList('42')/GrossAmount",
					sinon.match("Value 4.22 not allowed"),
					"sap.ui.model.odata.v4.Context");

			// Code under test
			oBindingAmount0.setValue("4.11");
			oBindingAmount1.setValue("4.22");

			return Promise.all([
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Modify a property while an update request is not yet resolved. Determine the ETag
	// as late as possible
	QUnit.test("Lazy determination of ETag while PATCH", function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			fnRespond,
			oSubmitBatchPromise,
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<Input id="note" value="{Note}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
				"@odata.etag" : "ETag0",
				Note : "Note",
				SalesOrderID : "42"
			})
			.expectChange("note", "Note");

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("note").getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag0"},
					payload : {Note : "Changed Note"}
				}, new Promise(function (resolve, reject) {
					fnRespond = resolve.bind(null, {
						"@odata.etag" : "ETag1",
						Note : "Changed Note From Server"
					});
				}))
				.expectChange("note", "Changed Note");

			oBinding.setValue("Changed Note");
			oSubmitBatchPromise = that.oModel.submitBatch("update");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag1"},
					payload : {Note : "Changed Note while $batch is running"}
				}, {
					"@odata.etag" : "ETag2",
					Note : "Changed Note From Server - 2"
				})
				.expectChange("note", "Changed Note while $batch is running")
				// TODO as long as there are PATCHes in the queue, don't overwrite user input
				.expectChange("note", "Changed Note From Server")
				.expectChange("note", "Changed Note From Server - 2");

			oBinding.setValue("Changed Note while $batch is running");

			fnRespond();

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert),
				oSubmitBatchPromise
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Execute a bound action while an update request for the entity is not yet
	// resolved. Determine the ETag as late as possible.
	QUnit.test("Lazy determination of ETag while ODataContextBinding#execute", function (assert) {
		var sAction = "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
			oBinding,
			oExecutePromise,
			oModel = createTeaBusiModel({updateGroupId : "update"}),
			fnRespond,
			oSubmitBatchPromise,
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'1\')}">\
	<Input id="name" value="{Name}" />\
	<FlexBox id="action" \
			binding="{' + sAction + '(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="teamId" text="{TEAM_ID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('1')", {
				Name : "Jonathan Smith",
				"@odata.etag" : "ETag0"
			})
			.expectChange("name", "Jonathan Smith")
			.expectChange("teamId", null);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("name").getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('1')",
					headers : {"If-Match" : "ETag0"},
					payload : {Name : "Jonathan Mueller"}
				}, new Promise(function (resolve, reject) {
					fnRespond = resolve.bind(null, {
						"@odata.etag" : "ETag1",
						Name : "Jonathan Mueller"
					});
				}))
				.expectChange("name", "Jonathan Mueller"); // triggered by setValue

			oBinding.setValue("Jonathan Mueller");

			oSubmitBatchPromise = that.oModel.submitBatch("update");

			return that.waitForChanges(assert);
		}).then(function () {
			oExecutePromise = that.oView.byId("action").getObjectBinding()
				.setParameter("TeamID", "42").execute("update");

			fnRespond();

			return Promise.all([
				oSubmitBatchPromise,
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					headers : {"If-Match" : "ETag1"},
					url : "EMPLOYEES('1')/" + sAction,
					payload : {TeamID : "42"}
				}, {TEAM_ID : "42"})
				.expectChange("teamId", "42");

			return Promise.all([
				that.oModel.submitBatch("update"),
				oExecutePromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Modify a property while an update request is not yet resolved. The second PATCH
	// request must wait for the first one to finish and use the eTag returned in its response.
	// A third PATCH request which also waits goes into a separate change set when submitBatch
	// has been called before it was created (CPOUI5UISERVICESV3-1531).
	QUnit.test("PATCH entity, two subsequent PATCHes on this entity wait", function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel({
				updateGroupId : "update"
			}),
			aPromises = [],
			fnRespond,
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<Input id="note" value="{Note}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')", {
				"@odata.etag" : "ETag0",
				Note : "Note",
				SalesOrderID : "42"
			})
			.expectChange("note", "Note");

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("note").getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag0"},
					payload : {Note : "Changed Note"}
				}, new Promise(function (resolve, reject) {
					fnRespond = resolve.bind(null, {
						"@odata.etag" : "ETag1",
						Note : "Changed Note From Server"
					});
				}))
				.expectChange("note", "Changed Note");

			oBinding.setValue("Changed Note");
			aPromises.push(that.oModel.submitBatch("update"));

			return that.waitForChanges(assert);
		}).then(function () {
			var oMetaModel = oModel.getMetaModel(),
				fnFetchObject = oMetaModel.fetchObject,
				oMetaModelMock = that.mock(oMetaModel);

			that.expectChange("note", "(1) Changed Note while $batch is running");

			// enforce delayed creation of PATCH request for setValue: submitBatch is called
			// *before* this request is created, but the request is in the change set which is
			// the current one before the submitBatch
			oMetaModelMock.expects("fetchObject")
				.withExactArgs("/SalesOrderList/Note")
				.callsFake(function () {
					return resolveLater(fnFetchObject.bind(oMetaModel, "/SalesOrderList/Note"));
				});

			oBinding.setValue("(1) Changed Note while $batch is running");
			aPromises.push(that.oModel.submitBatch("update"));

			oMetaModelMock.restore();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("note", "(2) Changed Note while $batch is running");

			oBinding.setValue("(2) Changed Note while $batch is running");
			aPromises.push(that.oModel.submitBatch("update"));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("note", "Changed Note From Server")
				.expectRequest({
					changeSetNo : 1,
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag1"},
					payload : {Note : "(1) Changed Note while $batch is running"}
				}, {
					"@odata.etag" : "ETag2",
					Note : "(1) Changed Note From Server - 2"
				})
				.expectRequest({
					changeSetNo : 2,
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag1"},
					payload : {Note : "(2) Changed Note while $batch is running"}
				}, {
					"@odata.etag" : "ETag2",
					Note : "(2) Changed Note From Server - 2"
				})
				.expectChange("note", "(1) Changed Note From Server - 2")
				.expectChange("note", "(2) Changed Note From Server - 2");

			fnRespond();
			aPromises.push(that.waitForChanges(assert));

			return Promise.all(aPromises);
		});
	});

	//*********************************************************************************************
	// Scenario: While update for entity1 is on the wire (request1), update both entity1 and entity2
	// in one batch (request2). Then update entity2 (request3).
	// request2 and request3 wait for request1 to return *and* apply the response to the cache;
	// the PATCHes of request2 and request3 are merged and use the ETag from the response to
	// request1.
	QUnit.test("1=PATCH e1, 2=PATCH(e1,e2), 3=PATCH e2: request sequence 1,2,3", function (assert) {
		var oBinding42,
			oBinding77,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			aPromises = [],
			fnRespond42,
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<Input id="note42" value="{Note}"/>\
</FlexBox>\
<FlexBox binding="{/SalesOrderList(\'77\')}">\
	<Input id="note77" value="{Note}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
				"@odata.etag" : "42ETag0",
				Note : "Note42",
				SalesOrderID : "42"
			})
			.expectChange("note42", "Note42")
			.expectRequest("SalesOrderList('77')?$select=Note,SalesOrderID", {
				"@odata.etag" : "77ETag0",
				Note : "Note77",
				SalesOrderID : "77"
			})
			.expectChange("note77", "Note77");

		return this.createView(assert, sView, oModel).then(function () {
			oBinding42 = that.oView.byId("note42").getBinding("value");
			oBinding77 = that.oView.byId("note77").getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "42ETag0"},
					payload : {Note : "42Changed Note"}
				}, new Promise(function (resolve, reject) {
					fnRespond42 = resolve.bind(null, {
						"@odata.etag" : "42ETag1",
						Note : "42Changed Note From Server"
					});
				}))
				.expectChange("note42", "42Changed Note");

			oBinding42.setValue("42Changed Note");
			aPromises.push(that.oModel.submitBatch("update"));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("note42", "(1) 42Changed Note while $batch is running")
				.expectChange("note77", "(1) 77Changed Note while $batch is running");

			oBinding42.setValue("(1) 42Changed Note while $batch is running");
			oBinding77.setValue("(1) 77Changed Note while $batch is running");
			aPromises.push(that.oModel.submitBatch("update"));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("note77", "77Changed Note");

			oBinding77.setValue("77Changed Note");
			aPromises.push(that.oModel.submitBatch("update"));

			return that.waitForChanges(assert);
		}).then(function () {
			//TODO suppress change event for outdated value "42Changed Note From Server"
			that.expectChange("note42", "42Changed Note From Server")
				.expectRequest({
					changeSetNo : 1,
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "42ETag1"},
					payload : {Note : "(1) 42Changed Note while $batch is running"}
				}, {
					"@odata.etag" : "42ETag2",
					Note : "42Changed Note From Server - 1"
				})
				.expectRequest({
					changeSetNo : 1,
					method : "PATCH",
					url : "SalesOrderList('77')",
					headers : {"If-Match" : "77ETag0"},
					payload : {Note : "(1) 77Changed Note while $batch is running"}
				}, {
					"@odata.etag" : "77ETag1",
					Note : "(1) 77Changed Note From Server - 1"
				})
				.expectRequest({
					changeSetNo : 2,
					method : "PATCH",
					url : "SalesOrderList('77')",
					headers : {"If-Match" : "77ETag0"},
					payload : {Note : "77Changed Note"}
				}, {
					"@odata.etag" : "77ETag1",
					Note : "(2) 77Changed Note From Server - 1"
				})
				.expectChange("note42", "42Changed Note From Server - 1")
				.expectChange("note77", "(1) 77Changed Note From Server - 1")
				.expectChange("note77", "(2) 77Changed Note From Server - 1");

			fnRespond42();
			aPromises.push(that.waitForChanges(assert));

			return Promise.all(aPromises);
		});
	});

	//*********************************************************************************************
	// Scenario: Support of Draft: Test eventing for PATCH requests
	["update", "$auto"].forEach(function (sUpdateGroupId) {
		var sTitle = "Support of Draft: Test eventing for PATCH requests; updateGroupId = "
				+ sUpdateGroupId;

		QUnit.test(sTitle, function (assert) {
			var fnAfterPatchCompleted,
				oBatchPromise0,
				oBatchPromise1,
				oModel = createSalesOrdersModel({
					autoExpandSelect : true,
					updateGroupId : sUpdateGroupId
				}),
				oParentBinding,
				iPatchCompleted = 0,
				iPatchSent = 0,
				fnReject,
				fnRespond,
				sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}" id="parent">\
	<Input id="lifecycleStatus" value="{LifecycleStatus}"/>\
	<Input id="note" value="{Note}"/>\
</FlexBox>',
				that = this;

			function getWaitForPatchCompletedPromise() {
				return new Promise(function (resolve) {
					fnAfterPatchCompleted = resolve;
				});
			}

			this.expectRequest("SalesOrderList('42')?$select=LifecycleStatus,Note,SalesOrderID", {
					"@odata.etag" : "ETag0",
					LifecycleStatus : "N",
					Note : "Note",
					SalesOrderID : "42"
				})
				.expectChange("lifecycleStatus", "N")
				.expectChange("note", "Note");

			return this.createView(assert, sView, oModel).then(function () {
				oParentBinding = that.oView.byId("parent").getElementBinding();

				oParentBinding.attachPatchCompleted(function (oEvent) {
					assert.strictEqual(oEvent.getSource(), oParentBinding);
					iPatchCompleted += 1;
					if (fnAfterPatchCompleted) {
						fnAfterPatchCompleted();
						fnAfterPatchCompleted = undefined;
					}
				});
				oParentBinding.attachPatchSent(function (oEvent) {
					assert.strictEqual(oEvent.getSource(), oParentBinding);
					iPatchSent += 1;
				});

				that.expectRequest({
						method : "PATCH",
						url : "SalesOrderList('42')",
						headers : {"If-Match" : "ETag0"},
						payload : {Note : "Changed Note"}
					}, new Promise(function (resolve, reject) {
						fnReject = reject;
					}))
					.expectChange("note", "Changed Note");

				that.oView.byId("note").getBinding("value").setValue("Changed Note");
				if (sUpdateGroupId === "update") {
					oBatchPromise0 = that.oModel.submitBatch(sUpdateGroupId);
				}

				return that.waitForChanges(assert);
			}).then(function () {
				var oPromise = getWaitForPatchCompletedPromise();

				assert.strictEqual(iPatchSent, 1, "patchSent 1");
				assert.strictEqual(iPatchCompleted, 0, "patchCompleted 0");

				// don't care about other parameters
				that.oLogMock.expects("error")
					.withArgs("Failed to update path /SalesOrderList('42')/Note");

				fnReject(createError({code : "CODE", message : "Patch failed"}));

				return oPromise;
			}).then(function () {
				assert.strictEqual(iPatchSent, 1, "patchSent 1");
				assert.strictEqual(iPatchCompleted, 1, "patchCompleted 1");

				that.expectMessages([{
						code : "CODE",
						message : "Patch failed",
						persistent : true,
						target : "",
						technical : true,
						technicalDetails : {
							originalMessage : {
								code : "CODE",
								message : "Patch failed"
							}
						},
						type : "Error"
					}])
					.expectChange("lifecycleStatus", "P")
					.expectRequest({
						method : "PATCH",
						url : "SalesOrderList('42')",
						headers : {"If-Match" : "ETag0"},
						payload : {
							LifecycleStatus : "P",
							Note : "Changed Note"
						}
					}, new Promise(function (resolve, reject) {
						fnRespond = resolve.bind(null, {
							"@odata.etag" : "ETag1",
							LifecycleStatus : "P",
							Note : "Changed Note From Server"
						});
					}));

				that.oView.byId("lifecycleStatus").getBinding("value").setValue("P");

				if (sUpdateGroupId === "update") {
					oBatchPromise1 = that.oModel.submitBatch(sUpdateGroupId);
				}

				return that.waitForChanges(assert);
			}).then(function () {
				var oPromise = getWaitForPatchCompletedPromise();

				assert.strictEqual(iPatchSent, 2, "patchSent 2");
				assert.strictEqual(iPatchCompleted, 1, "patchCompleted 1");

				that.expectChange("note", "Changed Note From Server");

				fnRespond();
				return Promise.all([
					oBatchPromise0,
					oBatchPromise1,
					oPromise,
					that.waitForChanges(assert)
				]);
			}).then(function () {
				assert.strictEqual(iPatchSent, 2, "patchSent 2");
				assert.strictEqual(iPatchCompleted, 2, "patchCompleted 2");
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect mode for an ODataContextBinding with relative
	// ODataPropertyBindings
	// The SalesOrders application does not have such a scenario.
	QUnit.test("Auto-$expand/$select: Absolute ODCB with relative ODPB", function (assert) {
		var sView = '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'AGE,ROOM_ID\'}}">\
	<Text id="name" text="{Name}" />\
	<Text id="city" text="{LOCATION/City/CITYNAME}" />\
</FlexBox>';

		this.expectRequest("EMPLOYEES('2')?$select=AGE,ID,LOCATION/City/CITYNAME,Name,ROOM_ID", {
				Name : "Frederic Fall",
				LOCATION : {City : {CITYNAME : "Walldorf"}}
			})
			.expectChange("name", "Frederic Fall")
			.expectChange("city", "Walldorf");

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}));
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect mode for an ODataContextBinding with relative
	// ODataPropertyBindings. Refreshing the view is also working.
	// The SalesOrders application does not have such a scenario.
	QUnit.test("Auto-$expand/$select: Absolute ODCB, refresh", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'AGE\'}}">\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')?$select=AGE,ID,Name", {Name : "Jonathan Smith"})
			.expectChange("name", "Jonathan Smith");

		return this.createView(
			assert, sView, createTeaBusiModel({autoExpandSelect : true})
		).then(function () {
			that.expectRequest("EMPLOYEES('2')?$select=AGE,ID,Name", {Name : "Jonathan Schmidt"})
				.expectChange("name", "Jonathan Schmidt");

			// code under test
			that.oView.byId("form").getObjectBinding().refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Enter an invalid value for worker-age for an ODataPropertyBinding and check that
	// ODatePropertyBinding.resetChanges() restores the value before.
	// The Types application does NOT have such a scenario.
	//*********************************************************************************************
	QUnit.test("reset invalid data state via property binding", function (assert) {
		return this.checkResetInvalidDataState(assert, function (oView) {
			return oView.byId("age").getBinding("text");
		});
	});

	//*********************************************************************************************
	// Scenario: Enter an invalid value for worker-age for an ODataPropertyBinding and check that
	// parent ODataContextBinding.resetChanges() restores the value before.
	// The Types application does have such a scenario (within the V4 view).
	//*********************************************************************************************
	QUnit.test("reset invalid data state via context binding", function (assert) {
		return this.checkResetInvalidDataState(assert, function (oView) {
			return oView.byId("form").getObjectBinding();
		});
	});

	//*********************************************************************************************
	// Scenario: Enter an invalid value for worker-age for an ODataPropertyBinding and check that
	// ODataModel.resetChanges() restores the value before.
	// The Types application does have such a scenario (within the V4 view).
	//*********************************************************************************************
	QUnit.test("reset invalid data state via model", function (assert) {
		return this.checkResetInvalidDataState(assert, function (oView) {
			return oView.getModel();
		});
	});

	//*********************************************************************************************
	// Scenario: Metadata access to MANAGERS which is not loaded yet.
	QUnit.test("Metadata access to MANAGERS which is not loaded yet", function (assert) {
		var sView = '\
<Table id="table" items="{/MANAGERS}">\
	<ColumnListItem>\
		<Text id="item" text="{@sapui.name}" />\
	</ColumnListItem>\
</Table>',
			oModel = createTeaBusiModel().getMetaModel();

		this.expectChange("item", "ID", "/MANAGERS/ID")
			.expectChange("item", "TEAM_ID", "/MANAGERS/TEAM_ID")
			.expectChange("item", "Manager_to_Team", "/MANAGERS/Manager_to_Team");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Metadata property access to product name. It should be updated via one change
	// event.
	QUnit.test("Metadata: Product name", function (assert) {
		var sView = '<Text id="product" text="{/Equipments/EQUIPMENT_2_PRODUCT/@sapui.name}" />',
			oModel = createTeaBusiModel().getMetaModel();

		this.expectChange("product",
			"com.sap.gateway.default.iwbep.tea_busi_product.v0001.Product");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Metadata property access to product name. It should be updated via one change
	// event.
	QUnit.test("Metadata: Product name via form", function (assert) {
		var sView = '\
<FlexBox binding="{/Equipments/EQUIPMENT_2_PRODUCT/}">\
	<Text id="product" text="{@sapui.name}" />\
</FlexBox>',
			oModel = createTeaBusiModel().getMetaModel();

		this.expectChange("product",
			"com.sap.gateway.default.iwbep.tea_busi_product.v0001.Product");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Metadata access to Managers which is not loaded yet. The binding is unresolved
	// initially and gets a context later. Then switch to Products (becoming asynchronous again).
	QUnit.test("Metadata: Manager -> Product", function (assert) {
		var sView = '\
<Table id="table" items="{}">\
	<ColumnListItem>\
		<Text id="item" text="{@sapui.name}" />\
	</ColumnListItem>\
</Table>',
			oModel = createTeaBusiModel().getMetaModel(),
			that = this;

		this.expectChange("item", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("item", "ID", "/MANAGERS/ID")
				.expectChange("item", "TEAM_ID", "/MANAGERS/TEAM_ID")
				.expectChange("item", "Manager_to_Team", "/MANAGERS/Manager_to_Team");

			that.oView.byId("table").setBindingContext(oModel.getContext("/MANAGERS"));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("item", "ID", "/Equipments/EQUIPMENT_2_PRODUCT/ID")
				.expectChange("item", "Name", "/Equipments/EQUIPMENT_2_PRODUCT/Name")
				.expectChange("item", "SupplierIdentifier",
					"/Equipments/EQUIPMENT_2_PRODUCT/SupplierIdentifier")
				.expectChange("item", "ProductPicture",
					"/Equipments/EQUIPMENT_2_PRODUCT/ProductPicture")
				.expectChange("item", "PRODUCT_2_CATEGORY",
					"/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_CATEGORY")
				.expectChange("item", "PRODUCT_2_SUPPLIER",
					"/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER");

			that.oView.byId("table")
				.setBindingContext(oModel.getContext("/Equipments/EQUIPMENT_2_PRODUCT"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Avoid duplicate call to computed annotation
	QUnit.test("Avoid duplicate call to computed annotation", function (assert) {
		var oModel = createTeaBusiModel().getMetaModel(),
			sView = '\
<Text id="text"\
	text="{/MANAGERS/TEAM_ID@@sap.ui.model.odata.v4.AnnotationHelper.getValueListType}"/>';

		this.mock(AnnotationHelper).expects("getValueListType").returns("foo");
		this.expectChange("text", "foo");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect mode for an ODataContextBinding with relative
	// ODataPropertyBindings where the paths of the relative bindings lead to a $expand
	// The SalesOrders application does not have such a scenario.
	QUnit.test("Auto-$expand/$select: Absolute ODCB with relative ODPB, $expand required",
			function (assert) {
		var sView = '\
<FlexBox id="form" binding="{path : \'/EMPLOYEES(\\\'2\\\')\',\
			parameters : {\
				$expand : {\
					EMPLOYEE_2_TEAM : {$select : \'Team_Id\'}\
				},\
				$select : \'AGE\'\
			}\
		}">\
	<Text id="name" text="{EMPLOYEE_2_TEAM/Name}" />\
	<Text id="TEAM_ID" text="{EMPLOYEE_2_TEAM/TEAM_2_MANAGER/TEAM_ID}" />\
</FlexBox>';

		this.expectRequest("EMPLOYEES('2')?$expand=EMPLOYEE_2_TEAM($select=Name,Team_Id"
				+ ";$expand=TEAM_2_MANAGER($select=ID,TEAM_ID))&$select=AGE,ID", {
				AGE : 32,
				EMPLOYEE_2_TEAM : {
					Name : "SAP NetWeaver Gateway Content",
					Team_Id : "TEAM_03",
					TEAM_2_MANAGER : {TEAM_ID : "TEAM_03"}
				}
			})
			.expectChange("name", "SAP NetWeaver Gateway Content")
			.expectChange("TEAM_ID", "TEAM_03");

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}));
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect mode for dependent ODataContextBindings. The inner
	// ODataContextBinding can use its parent binding's cache => it creates no own request.
	QUnit.test("Auto-$expand/$select: Dependent ODCB",
			function (assert) {
		var sView = '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'2\\\')\',\
			parameters : {\
				$expand : {\
					EMPLOYEE_2_MANAGER : {$select : \'ID\'}\
				},\
				$select : \'AGE\'\
			}\
		}">\
	<FlexBox binding="{EMPLOYEE_2_TEAM}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="name" text="{Name}" />\
	</FlexBox>\
</FlexBox>';

		this.expectRequest("EMPLOYEES('2')?$expand=EMPLOYEE_2_MANAGER"
				+ "($select=ID),EMPLOYEE_2_TEAM($select=Name,Team_Id)&$select=AGE,ID", {
				AGE : 32,
				EMPLOYEE_2_MANAGER : {ID : "2"},
				EMPLOYEE_2_TEAM : {Name : "SAP NetWeaver Gateway Content"}
			})
			.expectChange("name", "SAP NetWeaver Gateway Content");

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}));
	});

	//*********************************************************************************************
	// Scenario: create an entity on a relative binding without an own cache and check that
	// hasPendingChanges is working
	// None of our applications has such a scenario.
	QUnit.test("Create on a relative binding; check hasPendingChanges()", function (assert) {
		var oTeam2EmployeesBinding,
			oTeamBinding,
			that = this;

		return prepareTestForCreateOnRelativeBinding(this, assert).then(function () {
			oTeam2EmployeesBinding = that.oView.byId("table").getBinding("items");
			oTeamBinding = that.oView.byId("form").getObjectBinding();
			// insert new employee at first row
			that.expectChange("id", ["", "2"])
				.expectChange("text", ["John Doe", "Frederic Fall"]);
			oTeam2EmployeesBinding.create({ID : null, Name : "John Doe"});

			// code under test
			assert.ok(oTeam2EmployeesBinding.hasPendingChanges(), "pending changes; new entity");
			assert.ok(oTeamBinding.hasPendingChanges(), "pending changes; new entity");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "TEAMS('42')/TEAM_2_EMPLOYEES",
					payload : {
						ID : null,
						Name : "John Doe"
					}
				}, {
					ID : "7",
					Name : "John Doe"
				})
				.expectRequest("TEAMS('42')/TEAM_2_EMPLOYEES('7')?$select=ID,Name", {
					ID : "7",
					Name : "The real John Doe"
				})
				.expectChange("id", ["7"])
				.expectChange("text", ["The real John Doe"]);

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// code under test
			assert.notOk(oTeam2EmployeesBinding.hasPendingChanges(), "no more pending changes");
			assert.notOk(oTeamBinding.hasPendingChanges(), "no more pending changes");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario:
	QUnit.test("setContext on relative binding is forbidden", function (assert) {
		var oTeam2EmployeesBinding,
			that = this;

		return prepareTestForCreateOnRelativeBinding(this, assert).then(function () {
			oTeam2EmployeesBinding = that.oView.byId("table").getBinding("items");
			that.oView.byId("form").getObjectBinding();
			// insert new employee at first row
			that.expectChange("id", ["", "2"])
				.expectChange("text", ["John Doe", "Frederic Fall"]);
			oTeam2EmployeesBinding.create({ID : null, Name : "John Doe"});

			return that.waitForChanges(assert);
		}).then(function () {
			assert.throws(function () {
				that.oView.byId("form").bindElement("/TEAMS('43')",
					{$expand : {TEAM_2_EMPLOYEES : {$select : 'ID,Name'}}});
			}, new Error("setContext on relative binding is forbidden if a transient entity exists"
				+ ": sap.ui.model.odata.v4.ODataListBinding: /TEAMS('42')|TEAM_2_EMPLOYEES"));

			// Is needed for afterEach, to avoid that destroy is called twice
			that.oView.byId("form").getObjectBinding().destroy = function () {};
		});
	});

	//*********************************************************************************************
	// Scenario: create an entity on a relative binding without an own cache and reset changes or
	// delete the newly created entity again
	// None of our applications has such a scenario.
	[true, false].forEach(function (bUseReset) {
		var sTitle = "Create on a relative binding; " + (bUseReset ? "resetChanges()" : "delete");

		QUnit.test(sTitle, function (assert) {
			var oNewContext,
				oTeam2EmployeesBinding,
				oTeamBinding,
				that = this;

			return prepareTestForCreateOnRelativeBinding(this, assert).then(function () {
				oTeam2EmployeesBinding = that.oView.byId("table").getBinding("items");
				oTeamBinding = that.oView.byId("form").getObjectBinding();

				that.expectChange("id", ["", "2"])
					.expectChange("text", ["John Doe", "Frederic Fall"]);

				oNewContext = oTeam2EmployeesBinding.create({ID : null, Name : "John Doe"});
				oNewContext.created().catch(function (oError) {
					assert.ok(true, oError); // promise rejected because request is canceled below
				});
				assert.ok(oTeam2EmployeesBinding.hasPendingChanges(),
					"binding has pending changes");
				assert.ok(oTeamBinding.hasPendingChanges(), "parent has pending changes");

				return that.waitForChanges(assert);
			}).then(function () {
				var oPromise;

				that.expectChange("id", ["2"])
					.expectChange("text", ["Frederic Fall"]);

				// code under test
				oPromise = bUseReset
					? oTeam2EmployeesBinding.resetChanges()
					: oNewContext.delete("$direct");

				assert.notOk(oTeam2EmployeesBinding.hasPendingChanges(), "no pending changes");
				assert.notOk(oTeamBinding.hasPendingChanges(), "parent has no pending changes");

				return Promise.all([
					oPromise,
					that.waitForChanges(assert)
				]);
			}).then(function () {
				return oNewContext.created().then(function () {
					assert.notOk("unexpected success");
				}, function (oError) {
					assert.strictEqual(oError.canceled, true, "Create canceled");
				});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: bound action (success and failure)
	// JIRA: CPOUI5ODATAV4-29 (bound action parameter and error with message target)
	QUnit.test("Bound action", function (assert) {
		var sView = '\
<FlexBox binding="{/EMPLOYEES(\'1\')}">\
	<Text id="name" text="{Name}" />\
	<Input id="status" value="{STATUS}" />\
	<FlexBox id="action" \
			binding="{com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Input id="parameterTeamId" value="{$Parameter/TeamID}" />\
		<Text id="teamId" text="{TEAM_ID}" />\
	</FlexBox>\
</FlexBox>',
			sUrl = "EMPLOYEES('1')/com.sap.gateway.default.iwbep.tea_busi.v0001"
				+ ".AcChangeTeamOfEmployee",
			that = this;

		this.expectRequest("EMPLOYEES('1')", {
				Name : "Jonathan Smith",
				STATUS : "",
				"@odata.etag" : "ETag"
			})
			.expectChange("name", "Jonathan Smith")
			.expectChange("status", "")
			.expectChange("parameterTeamId", "")
			.expectChange("teamId", null);

		return this.createView(assert, sView).then(function () {
			that.expectChange("parameterTeamId", "42");

			that.oView.byId("parameterTeamId").getBinding("value").setValue("42");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					headers : {"If-Match" : "ETag"},
					url : sUrl,
					payload : {TeamID : "42"}
				}, {TEAM_ID : "42"})
				.expectChange("teamId", "42");

			return Promise.all([
				that.oView.byId("action").getObjectBinding().execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oError = createError({
					message : "Missing team ID",
					target : "TeamID", // error targeting a parameter
					details : [{
						message : "Illegal Status",
						"@Common.numericSeverity" : 4,
						target : "EMPLOYEE/STATUS" // error targeting part of binding parameter
					}, {
						message : "Target resolved to ''",
						"@Common.numericSeverity" : 4,
						target : "EMPLOYEE" // error targeting the complete binding parameter
					}, {
						message : "Unexpected Error w/o target",
						"@Common.numericSeverity" : 4,
						target : ""
					} ]
				});

			that.oLogMock.expects("error").withExactArgs("Failed to execute /" + sUrl + "(...)",
				sinon.match(oError.message), "sap.ui.model.odata.v4.ODataContextBinding");
			that.oLogMock.expects("error").withExactArgs(//TODO: prevent log -> CPOUI5ODATAV4-127
				"Failed to read path /" + sUrl + "(...)/TEAM_ID", sinon.match(oError.message),
				"sap.ui.model.odata.v4.ODataPropertyBinding");
			that.expectRequest({
					method : "POST",
					headers : {"If-Match" : "ETag"},
					url : sUrl,
					payload : {TeamID : ""}
				}, oError) // simulates failure
				.expectMessages([{
					code : undefined,
					message : "Missing team ID",
					persistent : true,
					target : "/EMPLOYEES('1')/com.sap.gateway.default.iwbep.tea_busi.v0001"
						+ ".AcChangeTeamOfEmployee(...)/$Parameter/TeamID",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "Illegal Status",
					persistent : true,
					target : "/EMPLOYEES('1')/STATUS",
					type : "Error"
				}, {
					code : undefined,
					message : "Target resolved to ''",
					persistent : true,
					// Note: checkValueState not possible for whole entity, but it is nice to know
					// how this target : "EMPLOYEE" is meant to be handled
					target : "/EMPLOYEES('1')",
					type : "Error"
				}, {
					code : undefined,
					message : "Unexpected Error w/o target",
					persistent : true,
					target : "",
					type : "Error"
				}])
				.expectChange("parameterTeamId", "")
				.expectChange("teamId", null); // reset to initial state

			return Promise.all([
				that.oView.byId("action").getObjectBinding().setParameter("TeamID", "").execute()
					.then(function () {
						assert.ok(false, "Unexpected success");
					}, function (oError0) {
						assert.strictEqual(oError0, oError);
					}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return Promise.all([
				that.checkValueState(assert, "status", "Error", "Illegal Status"),
				that.checkValueState(assert, "parameterTeamId", "Error", "Missing team ID")
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Call an overloaded bound function to get defaults (CPOUI5UISERVICESV3-1873)
	// then call a bound action on a collection and check that return value context has right path
	// and messages are reported as expected. Refreshing the return value context updates also
	// messages properly. (CPOUI5UISERVICESV3-1674)
	// Return value context can be used with v4.Context#setProperty (CPOUI5UISERVICESV3-1874).
	QUnit.test("Bound action on collection", function (assert) {
		var oHeaderContext,
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			oReturnValueContext,
			sView = '\
<Table id="table" items="{path : \'/Artists\', parameters : {$select : \'Messages\'}}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>\
<Input id="nameCreated" value="{Name}" />',
			that = this;

		this.expectRequest("Artists?$select=ArtistID,IsActiveEntity,Messages,Name&$skip=0&$top=100",
			{
				value : [{
					"@odata.etag" : "ETag",
					ArtistID : "XYZ",
					IsActiveEntity : true,
					Messages : [],
					Name : "Missy Eliot"
				}]
			})
			.expectChange("name", "Missy Eliot")
			.expectChange("nameCreated", []);

		return this.createView(assert, sView, oModel).then(function () {
			oHeaderContext = that.oView.byId("table").getBinding("items").getHeaderContext();
			that.expectRequest("Artists/special.cases.GetDefaults()", {
					ArtistID : "ABC",
					IsActiveEntity : false,
					Name : "DefaultName"
				});

			return Promise.all([
				// code under test
				that.oModel.bindContext("special.cases.GetDefaults(...)", oHeaderContext).execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aResults) {
			var oAction,
				oDefaults = aResults[0];

			that.expectRequest({
					method : "POST",
					headers : {},
					url : "Artists/special.cases.Create?"
						+ "$select=ArtistID,IsActiveEntity,Messages,Name",
					payload : {
						ArtistID : "ABC",
						IsActiveEntity : false,
						Name : "DefaultName"
					}
				}, {
					"@odata.etag" : "ETagAfterCreate",
					ArtistID : "ABC",
					IsActiveEntity : false,
					Messages : [{
						code : "23",
						message : "Just A Message",
						numericSeverity : 1,
						transition : false,
						target : "Name"
					}],
					Name : "Queen"
				}).expectMessages([{
					code : "23",
					message : "Just A Message",
					target : "/Artists(ArtistID='ABC',IsActiveEntity=false)/Name",
					persistent : false,
					type : "Success"
				}]);

			oAction = that.oModel.bindContext("special.cases.Create(...)", oHeaderContext,
					{$$inheritExpandSelect : true})
				.setParameter("ArtistID", oDefaults.getObject("ArtistID"))
				.setParameter("IsActiveEntity", oDefaults.getObject("IsActiveEntity"))
				.setParameter("Name", oDefaults.getObject("Name"));

			return Promise.all([
				oAction.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aPromiseResults) {
			oReturnValueContext = aPromiseResults[0];

			that.expectChange("nameCreated", "Queen");

			that.oView.byId("nameCreated").setBindingContext(oReturnValueContext);

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, "nameCreated", "Success", "Just A Message");
		}).then(function () {
			that.expectRequest("Artists(ArtistID='ABC',IsActiveEntity=false)?"
					+ "$select=ArtistID,IsActiveEntity,Messages,Name", {
					"@odata.etag" : "ETagAfterRefresh",
					ArtistID : "ABC",
					IsActiveEntity : false,
					Messages : [{
						code : "23",
						message : "Just Another Message",
						numericSeverity : 1,
						transition : false,
						target : "Name"
					}],
					Name : "After Refresh"
				})
				.expectChange("nameCreated", "After Refresh")
				.expectMessages([{
					code : "23",
					message : "Just Another Message",
					target : "/Artists(ArtistID='ABC',IsActiveEntity=false)/Name",
					persistent : false,
					type : "Success"
				}]);

			oReturnValueContext.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, "nameCreated", "Success", "Just Another Message");
		}).then(function () {
			that.expectChange("nameCreated", "TAFKAP")
				.expectRequest({
					headers : {"If-Match" : "ETagAfterRefresh"},
					method : "PATCH",
					payload : {Name : "TAFKAP"},
					url : "Artists(ArtistID='ABC',IsActiveEntity=false)"
				}, {
					// "@odata.etag" : "ETagAfterPatch",
					ArtistID : "ABC",
					IsActiveEntity : false,
					Messages : [{
						code : "CODE",
						message : "What a nice acronym!",
						numericSeverity : 1,
						transition : false,
						target : "Name"
					}],
					Name : "T.A.F.K.A.P."
				})
				.expectChange("nameCreated", "T.A.F.K.A.P.")
				.expectMessages([{
					code : "CODE",
					message : "What a nice acronym!",
					target : "/Artists(ArtistID='ABC',IsActiveEntity=false)/Name",
					persistent : false,
					type : "Success"
				}]);

			return Promise.all([
				// code under test
				oReturnValueContext.setProperty("Name", "TAFKAP"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "nameCreated", "Success", "What a nice acronym!");
		});
	});

	//*********************************************************************************************
	// Scenario: Call bound action on a context of a relative ListBinding
	QUnit.test("Read entity for a relative ListBinding, call bound action", function (assert) {
		var oModel = createTeaBusiModel(),
			that = this,
			sView = '\
<FlexBox id="form" binding="{path : \'/TEAMS(\\\'42\\\')\',\
	parameters : {$expand : {TEAM_2_EMPLOYEES : {$select : \'ID\'}}}}">\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Text id="id" text="{ID}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest("TEAMS('42')?$expand=TEAM_2_EMPLOYEES($select=ID)", {
				TEAM_2_EMPLOYEES : [{ID : "2"}]
			})
			.expectChange("id", ["2"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oEmployeeContext = that.oView.byId("table").getItems()[0].getBindingContext(),
				oAction = that.oModel.bindContext(
					"com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee(...)",
					oEmployeeContext);

			that.expectRequest({
					method : "POST",
					url : "TEAMS('42')/TEAM_2_EMPLOYEES('2')/"
						+ "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
					payload : {TeamID : "TEAM_02"}
				}, {ID : "2"});
			oAction.setParameter("TeamID", "TEAM_02");

			return Promise.all([
				// code under test
				oAction.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Execute a bound action for an entity in a list binding and afterwards call refresh
	// with bAllowRemoval=true for the context the entity is pointing to. If the entity is gone from
	// the list binding no error should happen because of the just deleted context.
	// TODO Test with a created binding parameter, too. This failed in an OPA test previously.
	QUnit.test("Bound action with context refresh which removes the context", function (assert) {
		var oAction,
			oContext,
			oExecutionPromise,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table"\
		items="{\
			path : \'/EMPLOYEES\',\
			filters : {path : \'TEAM_ID\', operator : \'EQ\', value1 : \'77\'},\
			parameters : {$count : true}\
		}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
		<Text id="teamId" text="{TEAM_ID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$count=true&$filter=TEAM_ID eq '77'&$select=ID,Name,TEAM_ID"
				+ "&$skip=0&$top=100", {
				"@odata.count" : 3,
				value : [
					{ID : "0", Name : "Frederic Fall", TEAM_ID : "77"},
					{ID : "1", Name : "Jonathan Smith", TEAM_ID : "77"},
					{ID : "2", Name : "Peter Burke", TEAM_ID : "77"}
				]
			})
			.expectChange("text", ["Frederic Fall", "Jonathan Smith", "Peter Burke"])
			.expectChange("teamId", ["77", "77", "77"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "POST",
					url : "EMPLOYEES('0')/com.sap.gateway.default.iwbep.tea_busi.v0001"
						+ ".AcChangeTeamOfEmployee",
					payload : {TeamID : "42"}
				}, {TEAM_ID : "42"})
				.expectRequest("EMPLOYEES?$filter=(TEAM_ID eq '77') and ID eq '0'"
					+ "&$select=ID,Name,TEAM_ID", {value : []})
				.expectChange("text", ["Jonathan Smith", "Peter Burke"]);

			oContext = that.oView.byId("table").getItems()[0].getBindingContext();
			oAction = oModel.bindContext("com.sap.gateway.default.iwbep.tea_busi.v0001"
				+ ".AcChangeTeamOfEmployee(...)", oContext);

			// code under test
			oExecutionPromise = oAction.setParameter("TeamID", "42").execute();
			oContext.refresh(undefined, true);

			return Promise.all([
				oExecutionPromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: overloaded bound action
	// Note: there are 3 binding types for __FAKE__AcOverload, but only Worker has Is_Manager
	QUnit.test("Bound action w/ overloading", function (assert) {
		var sView = '\
<FlexBox binding="{/EMPLOYEES(\'1\')}">\
	<Text id="name" text="{Name}" />\
	<FlexBox id="action" \
			binding="{com.sap.gateway.default.iwbep.tea_busi.v0001.__FAKE__AcOverload(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="isManager" text="{Is_Manager}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('1')", {
				Name : "Jonathan Smith",
				"@odata.etag" : "ETag"
			})
			.expectChange("name", "Jonathan Smith")
			.expectChange("isManager", null);

		return this.createView(assert, sView).then(function () {
			that.expectRequest({
					method : "POST",
					headers : {"If-Match" : "ETag"},
					url : "EMPLOYEES('1')/com.sap.gateway.default.iwbep.tea_busi.v0001"
						+ ".__FAKE__AcOverload",
					payload : {Message : "The quick brown fox jumps over the lazy dog"}
				}, {Is_Manager : true})
				.expectChange("isManager", "Yes");

			return Promise.all([
				// code under test
				that.oView.byId("action").getObjectBinding()
					.setParameter("Message", "The quick brown fox jumps over the lazy dog")
					.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect on an operation
	QUnit.test("Auto-$expand/$select: Function import", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="function" binding="{/GetEmployeeByID(...)}">\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectChange("name", null);
		return this.createView(assert, sView, oModel).then(function () {
//TODO the query options for the function import are not enhanced
//			that.expectRequest("GetEmployeeByID(EmployeeID='1')?$select=ID,Name", {
			that.expectRequest("GetEmployeeByID(EmployeeID='1')", {Name : "Jonathan Smith"})
				.expectChange("name", "Jonathan Smith");

			return Promise.all([
				// code under test
				that.oView.byId("function").getObjectBinding()
					.setParameter("EmployeeID", "1")
					.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Instance annotation in child path
	QUnit.test("Auto-$expand/$select: Instance annotation in child path", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'2\')}">\
	<Text id="ETag" text="{\
		path : \'@odata.etag\',\
		type : \'sap.ui.model.odata.type.String\'}" />\
</FlexBox>';

		this.expectRequest("EMPLOYEES('2')", {"@odata.etag" : "ETagValue"})
			.expectChange("ETag", "ETagValue");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect mode for dependent ODataContextBindings. The inner
	// ODataContextBinding *cannot* use its parent binding's cache due to conflicting query options
	// => it creates an own cache and request.
	QUnit.test("Auto-$expand/$select: Dependent ODCB with own request", function (assert) {
		var sView = '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'2\\\')\',\
			parameters : {\
				$expand : {\
					EMPLOYEE_2_MANAGER : {$select : \'ID\'},\
					EMPLOYEE_2_TEAM : {\
						$expand : {\
							TEAM_2_EMPLOYEES : {\
								$orderby : \'AGE\'\
							}\
						}\
					}\
				}\
			}\
		}">\
	<FlexBox binding="{path : \'EMPLOYEE_2_TEAM\',\
				parameters : {\
					$expand : {\
						TEAM_2_EMPLOYEES : {\
							$orderby : \'AGE desc\'\
						}\
					}\
				}\
			}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="name" text="{Name}" />\
	</FlexBox>\
	<Text id="age" text="{AGE}" />\
</FlexBox>';

		this.expectRequest("EMPLOYEES('2')/EMPLOYEE_2_TEAM"
				+ "?$expand=TEAM_2_EMPLOYEES($orderby=AGE desc)&$select=Name,Team_Id", {
				Name : "SAP NetWeaver Gateway Content",
				TEAM_2_EMPLOYEES : [
					{AGE : 32},
					{AGE : 29}
				]
			})
			.expectRequest("EMPLOYEES('2')?$expand=EMPLOYEE_2_MANAGER($select=ID),"
				+ "EMPLOYEE_2_TEAM($expand=TEAM_2_EMPLOYEES($orderby=AGE))&$select=AGE,ID", {
				AGE : 32,
				EMPLOYEE_2_MANAGER : {ID : "2"},
				EMPLOYEE_2_TEAM : {
					TEAM_2_EMPLOYEES : [
						{AGE : 29},
						{AGE : 32}
					]
				}
			})
			.expectChange("name", "SAP NetWeaver Gateway Content")
			.expectChange("age", "32");

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}));
	});

	//*********************************************************************************************
	// Scenario: Auto-$expand/$select: Absolute ODataListBinding considers $filter set via API,
	// i.e. it changes the initially aggregated query options. Note: It is also possible to remove
	// a filter which must lead to removal of the $filter option.
	QUnit.test("Absolute ODLB with auto-$expand/$select: filter via API", function (assert) {
		var sView = '\
<Table id="table"\
		items="{\
			path : \'/EMPLOYEES\',\
			filters : {path : \'AGE\', operator : \'LT\', value1 : \'77\'},\
			parameters : {$orderby : \'Name\', $select : \'AGE\'}\
		}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$orderby=Name&$select=AGE,ID,Name&$filter=AGE lt 77"
				+ "&$skip=0&$top=100", {
				value : [
					{Name : "Frederic Fall"},
					{Name : "Jonathan Smith"},
					{Name : "Peter Burke"}
				]
			})
			.expectChange("text", ["Frederic Fall", "Jonathan Smith", "Peter Burke"]);

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}))
			.then(function () {
				that.expectRequest("EMPLOYEES?$orderby=Name&$select=AGE,ID,Name"
						+ "&$filter=AGE gt 42&$skip=0&$top=100", {
						value : [
							{Name : "Frederic Fall"},
							{Name : "Peter Burke"}
						]
					})
					.expectChange("text", [, "Peter Burke"]);

				// code under test
				that.oView.byId("table").getBinding("items")
					.filter(new Filter("AGE", FilterOperator.GT, 42));

				return that.waitForChanges(assert);
			})
			.then(function () {
				that.expectRequest("EMPLOYEES?$orderby=Name&$select=AGE,ID,Name&$skip=0&$top=100", {
						value : [
							{Name : "Frederic Fall"},
							{Name : "Jonathan Smith"},
							{Name : "Peter Burke"}
						]
					})
					.expectChange("text", [, "Jonathan Smith", "Peter Burke"]);

				// code under test
				that.oView.byId("table").getBinding("items").filter(/*no filter*/);

				return that.waitForChanges(assert);
			});
	});

	//*********************************************************************************************
	// Scenario: Auto-$expand/$select: Relative ODataListBinding considers $filter set via API, i.e.
	// it changes the initially aggregated query options and creates a separate cache/request.
	QUnit.test("ODLB with auto-$expand/$select below ODCB: filter via API", function (assert) {
		var sView = '\
<FlexBox binding="{/TEAMS(\'2\')}">\
	<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$orderby : \'Name\'}}">\
		<ColumnListItem>\
			<Text id="text" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('2')?$select=Name,Team_Id"
				+ "&$expand=TEAM_2_EMPLOYEES($orderby=Name;$select=ID,Name)", {
				Name : "Team 2",
				Team_Id : "2",
				TEAM_2_EMPLOYEES : [
					{Name : "Frederic Fall"},
					{Name : "Jonathan Smith"},
					{Name : "Peter Burke"}
				]
			})
			.expectChange("name", "Team 2")
			.expectChange("text", ["Frederic Fall", "Jonathan Smith", "Peter Burke"]);

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}))
			.then(function () {
				that.expectRequest("TEAMS('2')/TEAM_2_EMPLOYEES?$orderby=Name&$select=ID,Name"
						+ "&$filter=AGE gt 42&$skip=0&$top=100", {
						value : [
							{Name : "Frederic Fall"},
							{Name : "Peter Burke"}
						]
					})
					.expectChange("text", [, "Peter Burke"]);

				// code under test
				that.oView.byId("table").getBinding("items")
					.filter(new Filter("AGE", FilterOperator.GT, 42));

				return that.waitForChanges(assert);
			});
	});

	//*********************************************************************************************
	// Scenario: child binding has $apply and would need $expand therefore it cannot use its
	// parent binding's cache
	testViewStart("Auto-$expand/$select: no $apply inside $expand", '\
<FlexBox binding="{/TEAMS(\'42\')}">\
	<Table items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$apply : \'filter(AGE lt 42)\'}}">\
		<ColumnListItem>\
			<Text id="text" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>', {
		"TEAMS('42')/TEAM_2_EMPLOYEES?$apply=filter(AGE lt 42)&$select=ID,Name&$skip=0&$top=100" : {
			value : [
				{Name : "Frederic Fall"},
				{Name : "Peter Burke"}
			]
		}
	}, {text : ["Frederic Fall", "Peter Burke"]}, createTeaBusiModel({autoExpandSelect : true}));

	//*********************************************************************************************
	// Scenario: child binding cannot use its parent list binding's cache (for whatever reason)
	// but must not compute the canonical path for the virtual context
	QUnit.test("Auto-$expand/$select: no canonical path for virtual context", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table items="{/TEAMS}">\
	<ColumnListItem>\
		<List items="{path : \'TEAM_2_EMPLOYEES\',\
			parameters : {$apply : \'filter(AGE lt 42)\'}, templateShareable : false}">\
			<CustomListItem>\
				<Text id="text" text="{Name}" />\
			</CustomListItem>\
		</List>\
	</ColumnListItem>\
</Table>';

		this.expectRequest("TEAMS?$select=Team_Id&$skip=0&$top=100", {
				value : [{Team_Id : "TEAM_01"}]
			})
			.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$apply=filter(AGE lt 42)"
				+ "&$select=ID,Name&$skip=0&$top=100", {
				value : [
					{Name : "Frederic Fall"},
					{Name : "Peter Burke"}
				]
			})
			.expectChange("text", ["Frederic Fall", "Peter Burke"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: master/detail where the detail does not need additional $expand/$select and thus
	// should reuse its parent's cache
	QUnit.test("Auto-$expand/$select: simple master/detail", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="master" items="{/TEAMS}">\
	<ColumnListItem>\
		<Text id="text0" text="{Team_Id}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="detail" binding="{}">\
	<Text id="text1" text="{Team_Id}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS?$select=Team_Id&$skip=0&$top=100", {
				value : [{Team_Id : "TEAM_01"}]
			})
			.expectChange("text0", ["TEAM_01"])
			.expectChange("text1"); // expect a later change

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("master").getItems()[0].getBindingContext();

			that.expectChange("text1", "TEAM_01");

			that.oView.byId("detail").setBindingContext(oContext);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: master/detail where the detail needs additional $expand/$select and thus causes
	// late property requests
	// JIRA: CPOUI5ODATAV4-27 see that two late property requests are merged (group ID "$auto"
	// is required for this)
	QUnit.test("Auto-$expand/$select: master/detail with separate requests", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true, groupId : "$auto"}),
			sView = '\
<Table id="master" items="{/TEAMS}">\
	<ColumnListItem>\
		<Text id="text0" text="{Team_Id}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="detail" binding="{}">\
	<Text id="text1" text="{Name}" />\
	<Text id="text2" text="{Budget}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS?$select=Team_Id&$skip=0&$top=100", {
				value : [{Team_Id : "TEAM_01"}]
			})
			.expectChange("text0", ["TEAM_01"])
			.expectChange("text1") // expect a later change
			.expectChange("text2");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("master").getItems()[0].getBindingContext();

			// 'Budget' and 'Name' are added to the table row
			that.expectRequest("TEAMS('TEAM_01')?$select=Budget,Name,Team_Id",
					{Budget : "456", Name : "Team #1", Team_Id : "TEAM_01"})
				.expectChange("text1", "Team #1")
				.expectChange("text2", "456");

			that.oView.byId("detail").setBindingContext(oContext);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Enable autoExpandSelect mode for use with factory function to create a listBinding
	QUnit.test("Auto-$expand/$select: use factory function", function (assert) {
		var that = this,
			sView = '\
<Table id="table" items="{\
		factory : \'.employeesListFactory\',\
		parameters : {\
			$select : \'AGE,ID\'\
		},\
		path : \'/EMPLOYEES\'\
	}">\
	<columns><Column/></columns>\
</Table>',
			oController = {
				employeesListFactory : function (sID, oContext) {
					var sAge,
						oListItem;

					sAge = oContext.getProperty("AGE");
					if (sAge > 30) {
						oListItem = new Text(sID, {text : "{AGE}"});
					} else {
						oListItem = new Text(sID, {text : "{ID}"});
					}
					that.setFormatter(assert, oListItem, "text", true);

					return new ColumnListItem({cells : [oListItem]});
				}
			};

		this.expectRequest("EMPLOYEES?$select=AGE,ID&$skip=0&$top=100", {
				value : [
					{AGE : 29, ID : "R2D2"},
					{AGE : 36, ID : "C3PO"}
				]
			})
			.expectChange("text", ["R2D2", "36"]);

		return this.createView(assert, sView, createTeaBusiModel({autoExpandSelect : true}),
			oController);
	});

	//*********************************************************************************************
	// Scenario: trying to call submitBatch() synchronously after delete(), but there is no way...
	QUnit.test("submitBatch() after delete()", function (assert) {
		var sView = '\
<FlexBox binding="{/TEAMS(\'42\')}" id="form">\
	<Text id="text" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('42')", {
				Team_Id : "TEAM_01",
				Name : "Team #1"
			})
			.expectChange("text", "Team #1");

		return this.createView(assert, sView).then(function () {
			var oContext = that.oView.byId("form").getBindingContext(),
				oPromise;

			that.expectRequest({
					method : "DELETE",
					url : "TEAMS('42')"
				})
				.expectChange("text", null);

			// Note: "the resulting group ID must be '$auto' or '$direct'"
			// --> no way to call submitBatch()!
			oPromise = oContext.delete(/*sGroupId*/);
			assert.throws(function () {
				oContext.getModel().submitBatch("$direct");
			});

			return Promise.all([
				oPromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: call submitBatch() synchronously after changeParameters (BCP 1770236987)
	[false, true].forEach(function (bAutoExpandSelect) {
		var sTitle = "submitBatch after changeParameters, autoExpandSelect = " + bAutoExpandSelect;

		QUnit.test(sTitle, function (assert) {
			var mFrederic = {
					ID : "2",
					Name : "Frederic Fall"
				},
				mJonathan = {
					ID : "3",
					Name : "Jonathan Smith"
				},
				oModel = createTeaBusiModel({autoExpandSelect : bAutoExpandSelect}),
				sUrlPrefix = bAutoExpandSelect
					? "EMPLOYEES?$select=ID,Name&"
					: "EMPLOYEES?",
				sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', parameters : {$$groupId : \'group\'}}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectChange("text", []);

			return this.createView(assert, sView, oModel).then(function () {
				that.expectRequest({
						method : "GET",
						url : sUrlPrefix + "$skip=0&$top=100"
					}, {value : [mFrederic, mJonathan]})
					.expectChange("text", ["Frederic Fall", "Jonathan Smith"]);

				return Promise.all([
					oModel.submitBatch("group"),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				var oListBinding = that.oView.byId("table").getBinding("items");

				that.expectRequest({
						method : "GET",
						url : sUrlPrefix + "$orderby=Name desc&$skip=0&$top=100"
					}, {value : [mJonathan, mFrederic]})
					.expectChange("text", ["Jonathan Smith", "Frederic Fall"]);

				oListBinding.changeParameters({$orderby : "Name desc"});

				return Promise.all([
					oModel.submitBatch("group"),
					that.waitForChanges(assert)
				]);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: call submitBatch() synchronously after resume w/ auto-$expand/$select
	QUnit.test("submitBatch after resume w/ auto-$expand/$select", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table"\
		items="{path : \'/EMPLOYEES\', parameters : {$$groupId : \'group\'}, suspended : true}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("text", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "GET",
					url : "EMPLOYEES?$select=ID,Name&$skip=0&$top=100"
				}, {
					value : [
						{ID : "2", Name : "Frederic Fall"},
						{ID : "3", Name : "Jonathan Smith"}
					]
				})
				.expectChange("text", ["Frederic Fall", "Jonathan Smith"]);

			that.oView.byId("table").getBinding("items").resume();

			return Promise.all([
				oModel.submitBatch("group"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Change a property in a dependent binding below a list binding with an own cache and
	// change the list binding's row (-> the dependent binding's context)
	// TODO hasPendingChanges does work properly with changes in hidden caches if dependency between
	// bindings get lost e.g. if context of a dependent binding is reset (set to null or undefined).
	QUnit.test("Pending change in hidden cache", function (assert) {
		var oListBinding,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="teamSet" items="{/TEAMS}">\
	<ColumnListItem>\
		<Text id="teamId" text="{Team_Id}" />\
	</ColumnListItem>\
</Table>\
<Table id="employeeSet" items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$orderby : \'Name\'}}">\
	<ColumnListItem>\
		<Text id="employeeId" text="{ID}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="objectPage" binding="{path : \'\', parameters : {$$updateGroupId : \'update\'}}">\
	<Input id="employeeName" value="{Name}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS?$select=Team_Id&$skip=0&$top=100", {
				value : [
					{Team_Id : "1"},
					{Team_Id : "2"}
				]
			})
			.expectChange("teamId", ["1", "2"])
			.expectChange("employeeId", [])
			.expectChange("employeeName");

		return this.createView(assert, sView, oModel).then(function () {
			oListBinding = that.oView.byId("teamSet").getBinding("items");

			that.expectRequest(
				"TEAMS('1')/TEAM_2_EMPLOYEES?$orderby=Name&$select=ID&$skip=0&$top=100", {
					value : [
						{ID : "01"},
						{ID : "02"}
					]
				})
				.expectChange("employeeId", ["01", "02"]);

			// "select" the first row in the team table
			that.oView.byId("employeeSet").setBindingContext(
				that.oView.byId("teamSet").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('1')/TEAM_2_EMPLOYEES('01')?$select=ID,Name", {
					ID : "01",
					Name : "Frederic Fall",
					"@odata.etag" : "ETag"
				})
				.expectChange("employeeName", "Frederic Fall");

			// "select" the first row in the employee table
			that.oView.byId("objectPage").setBindingContext(
				that.oView.byId("employeeSet").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("employeeName", "foo");

			// Modify the employee name in the object page
			that.oView.byId("employeeName").getBinding("value").setValue("foo");
			assert.ok(oListBinding.hasPendingChanges());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest(
				"TEAMS('2')/TEAM_2_EMPLOYEES?$orderby=Name&$select=ID&$skip=0&$top=100", {
					value : [
						{ID : "03"},
						{ID : "04"}
					]
				})
				.expectChange("employeeId", ["03", "04"])
				.expectChange("employeeName", null);

			// "select" the second row in the team table
			that.oView.byId("employeeSet").setBindingContext(
				that.oView.byId("teamSet").getItems()[1].getBindingContext());
			assert.notOk(oListBinding.hasPendingChanges(),
				"Binding lost context -> no pending changes");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('2')/TEAM_2_EMPLOYEES('03')?$select=ID,Name", {
					ID : "03",
					Name : "Jonathan Smith",
					"@odata.etag" : "ETag"
				})
				.expectChange("employeeName", "Jonathan Smith");

			// "select" the first row in the employee table
			that.oView.byId("objectPage").setBindingContext(
				that.oView.byId("employeeSet").getItems()[0].getBindingContext());
			assert.ok(oListBinding.hasPendingChanges(),
				"Binding hierarchy restored -> has pending changes");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					headers : {"If-Match" : "ETag"},
					method : "PATCH",
					payload : {Name : "foo"},
					url : "EMPLOYEES('01')"
				});

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// no requests because cache is reused
			that.expectChange("employeeId", ["01", "02"])
				.expectChange("employeeName", null);

			// code under test
			that.oView.byId("employeeSet").setBindingContext(
				that.oView.byId("teamSet").getItems()[0].getBindingContext());

			assert.notOk(oListBinding.hasPendingChanges(), "no pending changes after submitBatch");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("employeeName", "foo");
			that.oView.byId("objectPage").setBindingContext(
				that.oView.byId("employeeSet").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Usage of Any/All filter values on the list binding
	[{
		filter : new Filter({
			condition : new Filter("soitem/GrossAmount", FilterOperator.GT, "1000"),
			operator : FilterOperator.Any,
			path : "SO_2_SOITEM",
			variable : "soitem"
		}),
		request : "SO_2_SOITEM/any(soitem:soitem/GrossAmount gt 1000)"
	}, {
		filter : new Filter({
			condition : new Filter({
				and : true,
				filters : [
					new Filter("soitem/GrossAmount", FilterOperator.GT, "1000"),
					new Filter("soitem/NetAmount", FilterOperator.LE, "3000")
				]
			}),
			operator : FilterOperator.Any,
			path : "SO_2_SOITEM",
			variable : "soitem"
		}),
		request : "SO_2_SOITEM/any(soitem:soitem/GrossAmount gt 1000 and"
			+ " soitem/NetAmount le 3000)"
	}, {
		filter : new Filter({
			condition : new Filter({
				filters : [
					new Filter("soitem/GrossAmount", FilterOperator.GT, "1000"),
					new Filter({operator : FilterOperator.Any, path : "soitem/SOITEM_2_SCHDL"})
				]
			}),
			operator : FilterOperator.Any,
			path : "SO_2_SOITEM",
			variable : "soitem"
		}),
		request : "SO_2_SOITEM/any(soitem:soitem/GrossAmount gt 1000 or"
			+ " soitem/SOITEM_2_SCHDL/any())"
	}, {
		filter : new Filter({
			condition : new Filter({
				filters : [
					new Filter("soitem/GrossAmount", FilterOperator.GT, "1000"),
					new Filter({
						condition : new Filter({
							and : true,
							filters : [
								new Filter("schedule/DeliveryDate", FilterOperator.LT,
									"2017-01-01T05:50Z"),
								new Filter("soitem/GrossAmount", FilterOperator.LT, "2000")
							]
						}),
						operator : FilterOperator.All,
						path : "soitem/SOITEM_2_SCHDL",
						variable : "schedule"
					})
				]
			}),
			operator : FilterOperator.Any,
			path : "SO_2_SOITEM",
			variable : "soitem"
		}),
		request : "SO_2_SOITEM/any(soitem:soitem/GrossAmount gt 1000 or"
			+ " soitem/SOITEM_2_SCHDL/all(schedule:schedule/DeliveryDate lt 2017-01-01T05:50Z"
			+ " and soitem/GrossAmount lt 2000))"
	}].forEach(function (oFixture) {
		QUnit.test("filter all/any on list binding " + oFixture.request, function (assert) {
			var sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="text" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectRequest("SalesOrderList?$skip=0&$top=100", {
					value : [
						{SalesOrderID : "0"},
						{SalesOrderID : "1"},
						{SalesOrderID : "2"}
					]
				})
				.expectChange("text", ["0", "1", "2"]);

			return this.createView(assert, sView, createSalesOrdersModel()).then(function () {
				that.expectRequest("SalesOrderList?$filter=" + oFixture.request
						+ "&$skip=0&$top=100", {
						value : [
							{SalesOrderID : "0"},
							{SalesOrderID : "2"}
						]
					})
					.expectChange("text", [, "2"]);

				// code under test
				that.oView.byId("table").getBinding("items").filter(oFixture.filter);

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Check that the context paths use key predicates if the key properties are delivered
	// in the response. Check that an expand spanning a complex type does not lead to failures.
	QUnit.test("Context Paths Using Key Predicates", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\',\
		parameters : {$expand : {\'LOCATION/City/EmployeesInCity\' : {$select : [\'Name\']}}, \
		$select : [\'ID\', \'Name\']}}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$expand=LOCATION/City/EmployeesInCity($select=Name)"
				+ "&$select=ID,Name&$skip=0&$top=100", {
				value : [{
					ID : "1",
					Name : "Frederic Fall",
					LOCATION : {
						City : {
							EmployeesInCity : [
								{Name : "Frederic Fall"},
								{Name : "Jonathan Smith"}
							]
						}
					}
				}, {
					ID : "2",
					Name : "Jonathan Smith",
					LOCATION : {
						City : {
							EmployeesInCity : [
								{Name : "Frederic Fall"},
								{Name : "Jonathan Smith"}
							]
						}
					}
				}]
			})
			.expectChange("text", ["Frederic Fall", "Jonathan Smith"]);

		return this.createView(assert, sView).then(function () {
			assert.deepEqual(that.oView.byId("table").getItems().map(function (oItem) {
				return oItem.getBindingContext().getPath();
			}), ["/EMPLOYEES('1')", "/EMPLOYEES('2')"]);
		});
	});

	//*********************************************************************************************
	// Scenario: stream property with @odata.mediaReadLink
	QUnit.test("stream property with @odata.mediaReadLink", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Equipments(\'1\')/EQUIPMENT_2_PRODUCT}">\
	<Text id="url" text="{ProductPicture/Picture}"/>\
</FlexBox>';

		this.expectRequest(
			"Equipments('1')/EQUIPMENT_2_PRODUCT?$select=ID,ProductPicture/Picture", {
				"@odata.context" : "../$metadata#Equipments('1')/EQUIPMENT_2_PRODUCT",
				ID : "42",
				ProductPicture : {"Picture@odata.mediaReadLink" : "ProductPicture('42')"}
			})
			.expectChange("url",
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/ProductPicture('42')");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: update a quantity. The corresponding unit of measure must be sent, too.
	QUnit.test("Update quantity", function (assert) {
		var sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')/SO_2_SOITEM(\'10\')}">\
	<Input id="quantity" value="{Quantity}"/>\
	<Text id="quantityUnit" text="{QuantityUnit}"/>\
</FlexBox>',
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			that = this;

		this.expectRequest("SalesOrderList('42')/SO_2_SOITEM('10')?"
				+ "$select=ItemPosition,Quantity,QuantityUnit,SalesOrderID", {
				"@odata.etag" : "ETag",
				Quantity : "10.000",
				QuantityUnit : "EA"
			})
			.expectChange("quantity", "10.000")
			.expectChange("quantityUnit", "EA");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')/SO_2_SOITEM('10')",
					headers : {"If-Match" : "ETag"},
					payload : {
						Quantity : "11.000",
						QuantityUnit : "EA"
					}
				}, {
					"@odata.etag" : "changed",
					Quantity : "11.000",
					QuantityUnit : "EA"
				})
				.expectChange("quantity", "11.000");

			that.oView.byId("quantity").getBinding("value").setValue("11.000");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: PATCH an entity which is read via navigation from a complex type
	QUnit.test("PATCH entity below a complex type", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'1\')}">\
	<Table id="table" items="{LOCATION/City/EmployeesInCity}">\
		<ColumnListItem>\
			<Input id="room" value="{ROOM_ID}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('1')?$select=ID"
				+ "&$expand=LOCATION/City/EmployeesInCity($select=ID,ROOM_ID)", {
				ID : "1",
				LOCATION : {
					City : {
						EmployeesInCity : [{
							ID : "1",
							ROOM_ID : "1.01",
							"@odata.etag" : "ETag"
						}]
					}
				}
			})
			.expectChange("room", ["1.01"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('1')",
					headers : {"If-Match" : "ETag"},
					payload : {ROOM_ID : "1.02"}
				})
				.expectChange("room", ["1.02"]);

			that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value")
				.setValue("1.02");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: test conversion of $select and $expand for V2 Adapter
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("V2 Adapter: select in expand", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{path :\'/SalesOrderSet(\\\'0500000001\\\')\', \
		parameters : {\
			$expand : {ToLineItems : {$select : \'ItemPosition\'}}, \
			$select : \'SalesOrderID\'\
		}}">\
	<Text id="id" text="{path : \'SalesOrderID\', type : \'sap.ui.model.odata.type.String\'}" />\
	<Table id="table" items="{ToLineItems}">\
		<ColumnListItem>\
			<Text id="item" text="{path : \'ItemPosition\',\
				type : \'sap.ui.model.odata.type.String\'}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			oModel = this.createModelForV2SalesOrderService({
				annotationURI : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/annotations.xml"
			});

		this.expectRequest("SalesOrderSet('0500000001')?$expand=ToLineItems"
				+ "&$select=ToLineItems/ItemPosition,SalesOrderID", {
				d : {
					__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
					SalesOrderID : "0500000001",
					ToLineItems : {
						results : [{
							__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"},
							ItemPosition : "0000000010"
						}, {
							__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"},
							ItemPosition : "0000000020"
						}, {
							__metadata : {type : "GWSAMPLE_BASIC.SalesOrderLineItem"},
							ItemPosition : "0000000030"
						}]
					}
				}
			})
			.expectChange("id", "0500000001")
			.expectChange("item", ["0000000010", "0000000020", "0000000030"]);

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			assert.deepEqual(
				oModel.getMetaModel().getObject(
					"/SalesOrderSet/NetAmount@Org.OData.Measures.V1.ISOCurrency"),
				{$Path : "CurrencyCode"});
		});
	});

	//*********************************************************************************************
	// Scenario: test conversion of $orderby for V2 Adapter
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("V2 Adapter: $orderby", function (assert) {
		var sView = '\
<Table id="table" items="{path :\'/SalesOrderSet\',\
		parameters : {\
			$select : \'SalesOrderID\',\
			$orderby : \'SalesOrderID\'\
		}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			oModel = this.createModelForV2SalesOrderService({
				annotationURI : "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/annotations.xml"
			});

		this.expectRequest("SalesOrderSet?$orderby=SalesOrderID&$select=SalesOrderID"
				+ "&$skip=0&$top=100", {
				d : {
					results : [{
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						SalesOrderID : "0500000001"
					}, {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						SalesOrderID : "0500000002"
					}, {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						SalesOrderID : "0500000003"
					}]
				}
			})
			.expectChange("id", ["0500000001", "0500000002", "0500000003"]);

		// code under test
		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	[{
		binding : "CreatedAt ge 2017-05-23T00:00:00Z",
		request : "CreatedAt ge datetime'2017-05-23T00:00:00'"
	}, {
		binding : "Note eq null",
		request : "Note eq null"
	}, {
		binding : "2017-05-23T00:00:00Z ge CreatedAt",
		request : "datetime'2017-05-23T00:00:00' ge CreatedAt"
	}, {
		binding : "Note eq null and 2017-05-23T00:00:00Z ge CreatedAt",
		request : "Note eq null and datetime'2017-05-23T00:00:00' ge CreatedAt"
	}, {
		binding : "Note eq null or 2017-05-23T00:00:00Z ge CreatedAt",
		request : "Note eq null or datetime'2017-05-23T00:00:00' ge CreatedAt"
	}, {
		binding : "Note eq null or not (2017-05-23T00:00:00Z ge CreatedAt)",
		request : "Note eq null or not (datetime'2017-05-23T00:00:00' ge CreatedAt)"
	}].forEach(function (oFixture) {
		// Scenario: test conversion of $filter for V2 Adapter
		// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
		QUnit.test("V2 Adapter: $filter=" + oFixture.binding, function (assert) {
			var sView = '\
<Table id="table" items="{path :\'/SalesOrderSet\',\
		parameters : {\
			$select : \'SalesOrderID\',\
			$filter : \'' + oFixture.binding + '\'\
		}}">\
	<ColumnListItem>\
		<Text id="id" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>';

			this.expectRequest("SalesOrderSet?$filter=" + oFixture.request + "&$select=SalesOrderID"
					+ "&$skip=0&$top=100", {
					d : {
						results : [{
							__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
							SalesOrderID : "0500000001"
						}, {
							__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
							SalesOrderID : "0500000002"
						}, {
							__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
							SalesOrderID : "0500000003"
						}]
					}
				})
				.expectChange("id", ["0500000001", "0500000002", "0500000003"]);

			// code under test
			return this.createView(assert, sView, this.createModelForV2SalesOrderService());
		});
	});

	//*********************************************************************************************
	// Scenario: Minimal test for two absolute ODataPropertyBindings using different direct groups.
	QUnit.test("Absolute ODPBs using different $direct groups", function (assert) {
		var sView = '\
<Text id="text1" text="{\
	path : \'/EMPLOYEES(\\\'2\\\')/Name\',\
	parameters : {$$groupId : \'group1\'}}" />\
<Text id="text2" text="{\
	path : \'/EMPLOYEES(\\\'3\\\')/Name\',\
	parameters : {$$groupId : \'group2\'}}"\
/>';

		this.expectRequest({
				url : "EMPLOYEES('2')/Name",
				method : "GET"
			}, {value : "Frederic Fall"})
			.expectRequest({
				url : "EMPLOYEES('3')/Name",
				method : "GET"
			}, {value : "Jonathan Smith"})
			.expectChange("text1", "Frederic Fall")
			.expectChange("text2", "Jonathan Smith");

		return this.createView(assert, sView,
			createTeaBusiModel({
				groupProperties : {
					group1 : {submit : "Direct"},
					group2 : {submit : "Direct"}
				}
			})
		);
	});

	//*********************************************************************************************
	// Scenario: Minimal test for two absolute ODataPropertyBindings using different auto groups.
	// For group Ids starting with name "$auto." the submit mode will be set to auto automatically.
	QUnit.test("Absolute ODPBs using different '$auto.X' groups", function (assert) {
		var sView = '\
<Text id="text1" text="{\
	path : \'/EMPLOYEES(\\\'2\\\')/Name\',\
	parameters : {$$groupId : \'$auto.1\'}}" />\
<Text id="text2" text="{\
	path : \'/EMPLOYEES(\\\'3\\\')/Name\',\
	parameters : {$$groupId : \'$auto.2\'}}"\
/>';

		this.expectRequest({
				url : "EMPLOYEES('2')/Name",
				method : "GET",
				batchNo : 1
			}, {value : "Frederic Fall"})
			.expectRequest({
				url : "EMPLOYEES('3')/Name",
				method : "GET",
				batchNo : 2
			}, {value : "Jonathan Smith"})
			.expectChange("text1", "Frederic Fall")
			.expectChange("text2", "Jonathan Smith");

		return this.createView(assert, sView, createTeaBusiModel({}));
	});

	//*********************************************************************************************
	// Scenario: sap.ui.table.Table with VisibleRowCountMode="Auto" only calls ODLB.getContexts()
	// after rendering (via setTimeout). This must not lead to separate requests for each table
	// cell resp. console errors due to data access via virtual context.
	// BCP 1770367083
	// Also tests that key properties are $select'ed for a sap.ui.table.Table with query options
	// different from $expand and $select in the binding parameters of the rows aggregation.
	QUnit.test("sap.ui.table.Table with VisibleRowCountMode='Auto'", function (assert) {
		var sView = '\
<t:Table id="table" rows="{path : \'/EMPLOYEES\', parameters : {$filter : \'AGE gt 42\'}}"\
		visibleRowCountMode="Auto">\
	<t:Column>\
		<t:label>\
			<Label text="Name"/>\
		</t:label>\
		<t:template>\
			<Text id="text" text="{Name}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			oModel = createTeaBusiModel({autoExpandSelect : true});

		this.expectRequest("EMPLOYEES?$filter=AGE gt 42&$select=ID,Name&$skip=0&$top=140", {
				value : [
					{Name : "Frederic Fall"},
					{Name : "Jonathan Smith"}
				]
			})
			.expectChange("text", ["Frederic Fall", "Jonathan Smith"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: a ManagedObject instance with a relative object binding (using
	// cross-service navigation) and a property binding (maybe even at the same time)
	// Note: ID will not fail, it is also present on EQUIPMENT! SupplierIdentifier is "unique"
	QUnit.test("Relative object binding & property binding: separate control", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oText = new Text(),
			sView = '\
<FlexBox binding="{/Equipments(Category=\'Electronics\',ID=1)}">\
	<FlexBox binding="{EQUIPMENT_2_PRODUCT}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="text" text="{SupplierIdentifier}" />\
	</FlexBox>\
</FlexBox>';

		this.expectRequest("Equipments(Category='Electronics',ID=1)?$select=Category,ID"
				+ "&$expand=EQUIPMENT_2_PRODUCT($select=ID,SupplierIdentifier)", {
				Category : "Electronics",
				ID : 1,
				EQUIPMENT_2_PRODUCT : {
					ID : 2, // Edm.Int32
					SupplierIdentifier : 42 // Edm.Int32
				}
			})
			// Note: sap.m.Text#text turns value into string!
			.expectChange("text", oText.validateProperty("text", 42));

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	QUnit.test("Relative object binding & property binding: same control", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oText = new Text(),
			sView = '\
<FlexBox binding="{/Equipments(Category=\'Electronics\',ID=1)}">\
	<Text binding="{EQUIPMENT_2_PRODUCT}" id="text" text="{SupplierIdentifier}" />\
</FlexBox>';

		this.expectRequest("Equipments(Category='Electronics',ID=1)?$select=Category,ID"
				+ "&$expand=EQUIPMENT_2_PRODUCT($select=ID,SupplierIdentifier)", {
				Category : "Electronics",
				ID : 1,
				EQUIPMENT_2_PRODUCT : {
					ID : 2, // Edm.Int32
					SupplierIdentifier : 42 // Edm.Int32
				}
			})
			// Note: sap.m.Text#text turns value into string!
			.expectChange("text", oText.validateProperty("text", 42));

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: a ManagedObject instance with a relative object binding
	// *using cross-service navigation*
	// and a property binding at the same time, inside a list binding
	// Note: ID will not fail, it is also present on EQUIPMENT! SupplierIdentifier is "unique"
	QUnit.test("Relative object binding & property binding within a list (1)", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oText = new Text(),
			sView = '\
<Table items="{/Equipments}">\
	<ColumnListItem>\
		<Text binding="{EQUIPMENT_2_PRODUCT}" id="text" text="{SupplierIdentifier}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("Equipments?$select=Category,ID&"
				+ "$expand=EQUIPMENT_2_PRODUCT($select=ID,SupplierIdentifier)"
				+ "&$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : 1,
					EQUIPMENT_2_PRODUCT : {
						ID : 2, // Edm.Int32
						SupplierIdentifier : 42 // Edm.Int32
					}
				}]
			})
			.expectChange("text", oText.validateProperty("text", 42));

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: a ManagedObject instance with a relative object binding
	// *w/o cross-service navigation*
	// and a property binding at the same time, inside a list binding
	// Note: ID will not fail, it is also present on EQUIPMENT! AGE is "unique"
	QUnit.test("Relative object binding & property binding within a list (2)", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oText = new Text(),
			sView = '\
<Table items="{/Equipments}">\
	<ColumnListItem>\
		<Text binding="{EQUIPMENT_2_EMPLOYEE}" id="text" text="{AGE}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("Equipments?$select=Category,ID&"
				+ "$expand=EQUIPMENT_2_EMPLOYEE($select=AGE,ID)"
				+ "&$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : 1,
					EQUIPMENT_2_EMPLOYEE : {
						ID : "0815", // Edm.String
						AGE : 42 // Edm.Int16
					}
				}]
			})
			// Note: change does not appear inside a list binding, it's inside the context binding!
			.expectChange("text", oText.validateProperty("text", 42));

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: a ManagedObject instance with a relative object binding (w/o
	// cross-service navigation) and a property binding at the same time, inside a list binding
	// Note: ID will not fail, it is also present on EQUIPMENT! AGE is "unique"
	QUnit.test("Relative object binding & property binding within a list (3)", function (assert) {
		var oText = new Text(),
			sView = '\
<Table items="{/Equipments}">\
	<ColumnListItem>\
		<Text binding="{EQUIPMENT_2_EMPLOYEE}" id="text" text="{AGE}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("Equipments?$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : 1,
					EQUIPMENT_2_EMPLOYEE : {
						ID : "0815", // Edm.String
						AGE : 42 // Edm.Int16
					}
				}]
			})
			// Note: change does not appear inside a list binding, it's inside the context binding!
			.expectChange("text", oText.validateProperty("text", 42));

		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: Object binding provides access to some collection and you then want to filter on
	//   that collection; inspired by https://github.com/SAP/openui5/issues/1763
	QUnit.test("Filter collection provided via object binding", function (assert) {
		var sView = '\
<FlexBox id="form" binding="{parameters : {$expand : \'TEAM_2_EMPLOYEES\'},\
		path : \'/TEAMS(\\\'42\\\')\'}">\
	<Table items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Text id="id" text="{ID}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		// Note: for simplicity, autoExpandSelect : false but still most properties are omitted
		this.expectRequest("TEAMS('42')?$expand=TEAM_2_EMPLOYEES", {
				TEAM_2_EMPLOYEES : [
					{ID : "1"},
					{ID : "2"},
					{ID : "3"}
				]
			})
			.expectChange("id", ["1", "2", "3"]);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("TEAMS('42')?$expand=TEAM_2_EMPLOYEES($filter=ID eq '2')", {
					TEAM_2_EMPLOYEES : [{ID : "2"}]
				})
				.expectChange("id", ["2"]);

			that.oView.byId("form").getObjectBinding()
				.changeParameters({$expand : "TEAM_2_EMPLOYEES($filter=ID eq '2')"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Behaviour of a deferred bound function
	QUnit.test("Bound function", function (assert) {
		var sView = '\
<FlexBox binding="{/EMPLOYEES(\'1\')}">\
	<FlexBox id="function" \
		binding="{com.sap.gateway.default.iwbep.tea_busi.v0001.FuGetEmployeeSalaryForecast(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="status" text="{STATUS}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectChange("status", null);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES('1')/com.sap.gateway.default.iwbep.tea_busi.v0001"
					+ ".FuGetEmployeeSalaryForecast()", {
					STATUS : "42"
				})
				.expectChange("status", "42");

			return Promise.all([
				// code under test
				that.oView.byId("function").getObjectBinding().execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Operation binding for a function, first it is deferred, later is has been executed.
	//   Show interaction of setParameter(), execute() and refresh().
	QUnit.test("Function binding: setParameter, execute and refresh", function (assert) {
		var oFunctionBinding,
			sView = '\
<FlexBox id="function" binding="{/GetEmployeeByID(...)}">\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectChange("name", null);

		return this.createView(assert, sView).then(function () {
			oFunctionBinding = that.oView.byId("function").getObjectBinding();

			oFunctionBinding.refresh(); // MUST NOT trigger a request!

			that.expectRequest("GetEmployeeByID(EmployeeID='1')", {Name : "Jonathan Smith"})
				.expectChange("name", "Jonathan Smith");

			return Promise.all([
				oFunctionBinding.setParameter("EmployeeID", "1").execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("GetEmployeeByID(EmployeeID='1')", {Name : "Frederic Fall"})
				.expectChange("name", "Frederic Fall");
			oFunctionBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			oFunctionBinding.setParameter("EmployeeID", "2");

			oFunctionBinding.refresh(); // MUST NOT trigger a request!

			that.expectRequest("GetEmployeeByID(EmployeeID='2')", {Name : "Peter Burke"})
				.expectChange("name", "Peter Burke");

			return Promise.all([
				oFunctionBinding.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("GetEmployeeByID(EmployeeID='2')", {Name : "Jonathan Smith"})
				.expectChange("name", "Jonathan Smith");
			oFunctionBinding.refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Operation binding for a function, first it is deferred, later is has been executed.
	//   Show interaction of setParameter(), execute() and changeParameters().
	QUnit.test("Function binding: setParameter, execute and changeParameters", function (assert) {
		var oFunctionBinding,
			sView = '\
<FlexBox id="function" binding="{/GetEmployeeByID(...)}">\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectChange("name", null);

		return this.createView(assert, sView).then(function () {
			oFunctionBinding = that.oView.byId("function").getObjectBinding();

			oFunctionBinding.changeParameters({$select: "Name"}); // MUST NOT trigger a request!

			that.expectRequest("GetEmployeeByID(EmployeeID='1')?$select=Name", {
					Name : "Jonathan Smith"
				})
				.expectChange("name", "Jonathan Smith");

			return Promise.all([
				oFunctionBinding.setParameter("EmployeeID", "1").execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("GetEmployeeByID(EmployeeID='1')?$select=ID,Name", {
					Name : "Frederic Fall"
				})
				.expectChange("name", "Frederic Fall");
			oFunctionBinding.changeParameters({$select: "ID,Name"});

			return that.waitForChanges(assert);
		}).then(function () {
			oFunctionBinding.setParameter("EmployeeID", "2");

			// MUST NOT trigger a request!
			oFunctionBinding.changeParameters({$select: "Name"});

			that.expectRequest("GetEmployeeByID(EmployeeID='2')?$select=Name", {
					Name : "Peter Burke"
				})
				.expectChange("name", "Peter Burke");

			return Promise.all([
				oFunctionBinding.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("GetEmployeeByID(EmployeeID='2')?$select=ID,Name", {
					Name : "Jonathan Smith"
				})
				.expectChange("name", "Jonathan Smith");
			oFunctionBinding.changeParameters({$select : "ID,Name"});

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: ODataListBinding contains ODataContextBinding contains ODataPropertyBinding;
	//   only one cache; refresh()
	QUnit.test("refresh on dependent bindings", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sUrl = "TEAMS('42')?$select=Team_Id&$expand=TEAM_2_MANAGER($select=ID)",
			sView = '\
<FlexBox binding="{/TEAMS(\'42\')}">\
	<FlexBox binding="{TEAM_2_MANAGER}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="id" text="{ID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest(sUrl, {
				Team_Id : "42",
				TEAM_2_MANAGER : {ID : "1"}
			})
			.expectChange("id", "1");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(sUrl, {
					Team_Id : "42",
					TEAM_2_MANAGER : {ID : "2"}
				})
				.expectChange("id", "2");

			oModel.refresh();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: sap.chart.Chart wants to read all data w/o paging
	QUnit.test("no paging", function (assert) {
		var fnGetContexts = ODataListBinding.prototype.getContexts,
			sView = '\
<Table id="table" items="{/TEAMS}">\
	<ColumnListItem>\
		<Text id="id" text="{Team_Id}" />\
	</ColumnListItem>\
</Table>';

		this.mock(ODataListBinding.prototype).expects("getContexts").atLeast(1).callsFake(
			function (iStart, iLength, iMaximumPrefetchSize) {
				// this is how the call by sap.chart.Chart should look like --> GET w/o $top!
				return fnGetContexts.call(this, iStart, iLength, Infinity);
			});
		this.expectRequest("TEAMS", {
				value : [{
					Team_Id : "TEAM_00"
				}, {
					Team_Id : "TEAM_01"
				}, {
					Team_Id : "TEAM_02"
				}]
			})
			.expectChange("id", ["TEAM_00", "TEAM_01", "TEAM_02"]);

		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: some custom control wants to read all data, and it gets a lot
	QUnit.test("read all data", function (assert) {
		var i, n = 5000,
			aIDs = new Array(n),
			aValues = new Array(n),
			sView = '\
<List id="list">\
</List>',
			that = this;

		for (i = 0; i < n; i += 1) {
			aIDs[i] = "TEAM_" + i;
			aValues[i] = {Team_Id : aIDs[i]};
		}

		return this.createView(assert, sView).then(function () {
			var oText = new Text("id", {text : "{Team_Id}"});

			that.setFormatter(assert, oText, "id", true);
			that.expectRequest("TEAMS", {value : aValues})
				.expectChange("id", aIDs);

			that.oView.byId("list").bindItems({
				length : Infinity, // code under test
				path : "/TEAMS",
				template : new CustomListItem({content : [oText]})
			});

			// Increase the timeout for this test to 12 seconds to run also in IE
			return that.waitForChanges(assert, undefined, 12000);
		});
	});

	//*********************************************************************************************
	// Scenario: read all data w/o a control on top
	QUnit.test("read all data w/o a control on top", function (assert) {
		var i, n = 10000,
			aIDs = new Array(n),
			aValues = new Array(n),
			that = this;

		for (i = 0; i < n; i += 1) {
			aIDs[i] = "TEAM_" + i;
			aValues[i] = {Team_Id : aIDs[i]};
		}

		return this.createView(assert, "").then(function () {
			var fnDone,
				oListBinding = that.oModel.bindList("/TEAMS");

			that.expectRequest("TEAMS", {value : aValues});

			oListBinding.getContexts(0, Infinity);
			oListBinding.attachEventOnce("change", function () {
				oListBinding.getContexts(0, Infinity).forEach(function (oContext, i) {
					var sId = oContext.getProperty("Team_Id");

					// Note: avoid bad performance of assert.strictEqual(), e.g. DOM manipulation
					if (sId !== aIDs[i]) {
						assert.strictEqual(sId, aIDs[i]);
					}
				});
				fnDone();
			});


			return Promise.all([
				// wait until change event is processed
				new Promise(function (resolve, reject) {
					fnDone = resolve;
				}),
				// Increase the timeout for this test to 12 seconds to run also in IE
				that.waitForChanges(assert, undefined, 12000)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: ODataListBinding contains ODataContextBinding contains ODataPropertyBinding;
	//   only one cache; hasPendingChanges()
	QUnit.test("hasPendingChanges on dependent bindings", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sUrl = "SalesOrderList?$select=SalesOrderID"
				+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)&$skip=0&$top=100",
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Input binding="{SO_2_BP}" value="{CompanyName}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest(sUrl, {
				value : [{
					SalesOrderID : "42",
					SO_2_BP : {
						BusinessPartnerID : "1",
						CompanyName : "Foo, Inc",
						"@odata.etag" : "ETag"
					}
				}]
			});

		return this.createView(assert, sView, oModel).then(function () {
			var oText = that.oView.byId("table").getItems()[0].getCells()[0];

			that.expectRequest({
					method : "PATCH",
					url : "BusinessPartnerList('1')",
					headers : {"If-Match" : "ETag"},
					payload : {CompanyName : "Bar, Inc"}
				}, {});

			oText.getBinding("value").setValue("Bar, Inc");

			// code under test
			assert.strictEqual(oText.getElementBinding().hasPendingChanges(), true);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Support expression binding in ODataModel.integration.qunit
	testViewStart("Expression binding",
		'<Text id="text" text="{= \'Hello, \' + ${/EMPLOYEES(\'2\')/Name} }" />',
		{"EMPLOYEES('2')/Name" : {value : "Frederic Fall"}},
		{text : "Hello, Frederic Fall"}
	);

	//*********************************************************************************************
	// Scenario: Support expression binding on a list in ODataModel.integration.qunit
	// Note: Use "$\{Name}" to avoid that Maven replaces "${Name}"
	testViewStart("Expression binding in a list", '\
<Table items="{/EMPLOYEES}">\
	<ColumnListItem>\
		<Text id="text" text="{= \'Hello, \' + $\{Name} }" />\
	</ColumnListItem>\
</Table>',
		{"EMPLOYEES?$skip=0&$top=100" :
			{value : [{Name : "Frederic Fall"}, {Name : "Jonathan Smith"}]}},
		{text : ["Hello, Frederic Fall", "Hello, Jonathan Smith"]}
	);

	//*********************************************************************************************
	// Scenario: Enable auto-$expand/$select mode for an ODataContextBinding with relative
	// ODataPropertyBindings to a advertised action
	testViewStart("Auto-$expand/$select: relative ODPB to advertised action",'\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'2\\\')\', parameters : {$select : \'AGE\'}}">\
	<Text id="name" text="{Name}" />\
	<Text id="adAction1"\
		text="{= %{#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsOccupied}\
			? \'set to occupied\' : \'\'}" />\
	<Text id="adAction2"\
		text="{= %{#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable}\
			? \'set to available\' : \'\'}" />\
</FlexBox>', {
			"EMPLOYEES('2')?$select=AGE,ID,Name,com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable,com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsOccupied" : {
				"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {},
				AGE : 32,
				Name : "Frederic Fall"
			}
		}, [{
			adAction1 : "",
			adAction2 : "set to available",
			name : "Frederic Fall"
		}], createTeaBusiModel({autoExpandSelect : true})
	);

	//*********************************************************************************************
	// Scenario: updates for advertised action's title caused by: refresh, side effect of edit,
	// bound action
	// CPOUI5UISERVICESV3-905, CPOUI5UISERVICESV3-1714
	//
	// TODO automatic type determination cannot handle #com...AcSetIsAvailable/title
	// TODO neither can autoExpandSelect
	QUnit.test("Advertised actions: title updates", function (assert) {
		var oModel = createTeaBusiModel(),
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'2\')}" id="form">\
	<Input id="name" value="{Name}" />\
	<Text id="title" text="{\
		path : \'#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable/title\',\
		type : \'sap.ui.model.odata.type.String\'}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')", {
				"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {
					title : "First Title"
				},
				ID : "2",
				Name : "Frederic Fall"
			})
			.expectChange("name", "Frederic Fall")
			.expectChange("title", "First Title");

		return this.createView(assert, sView, oModel).then(function () {
			var oContextBinding = that.oView.byId("form").getObjectBinding();

			that.expectRequest("EMPLOYEES('2')", {
					"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {
						title : "Second Title"
					},
					ID : "2",
					Name : "Frederic Fall"
				})
				.expectChange("title", "Second Title");

			// code under test
			oContextBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					payload : {Name : "Frederic Spring"},
					url : "EMPLOYEES('2')"
				}, {
					"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {
						title : "Third Title"
					}
//					ID : "2",
//					Name : "Frederic Spring"
				})
				.expectChange("name", "Frederic Spring")
				.expectChange("title", "Third Title");

			// code under test
			that.oView.byId("name").getBinding("value").setValue("Frederic Spring");

			return that.waitForChanges(assert);
		}).then(function () {
			var sActionName = "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
				oContext = that.oView.byId("form").getObjectBinding().getBoundContext(),
				oActionBinding = oModel.bindContext(sActionName + "(...)", oContext);

			that.expectRequest({
					method : "POST",
					payload : {TeamID : "TEAM_02"},
					url : "EMPLOYEES('2')/" + sActionName
				}, {
					"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {
						title : "Fourth Title"
					},
					ID : "2",
					Name : "Frederic Winter"
				})
				.expectChange("name", "Frederic Winter")
				.expectChange("title", "Fourth Title");

			// code under test
			oActionBinding.setParameter("TeamID", "TEAM_02").execute();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: updates for advertised action (as an object) caused by: refresh, side effect of
	// edit, bound action
	// CPOUI5UISERVICESV3-905, CPOUI5UISERVICESV3-1714
	QUnit.test("Advertised actions: object updates", function (assert) {
		var oModel = createTeaBusiModel(),
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'2\')}" id="form">\
	<Text id="enabled"\
		text="{= %{#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable} ? 1 : 0 }" />\
	<Input id="name" value="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')", {
				"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {},
				ID : "2",
				Name : "Frederic Fall"
			})
			.expectChange("enabled", 1)
			.expectChange("name", "Frederic Fall");

		return this.createView(assert, sView, oModel).then(function () {
			var oContextBinding = that.oView.byId("form").getObjectBinding();

			that.expectRequest("EMPLOYEES('2')", {
					"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : null,
					ID : "2",
					Name : "Frederic Fall"
				})
				// Note: "<code>false</code> to enforce listening to a template control" --> use 0!
				.expectChange("enabled", 0);

			// code under test
			oContextBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					payload : {Name : "Frederic Spring"},
					url : "EMPLOYEES('2')"
				}, {
					"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {}
//					ID : "2",
//					Name : "Frederic Spring"
				})
				.expectChange("enabled", 1)
				.expectChange("name", "Frederic Spring");

			// code under test
			that.oView.byId("name").getBinding("value").setValue("Frederic Spring");

			return that.waitForChanges(assert);
		}).then(function () {
			var sActionName = "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
				oContext = that.oView.byId("form").getObjectBinding().getBoundContext(),
				oActionBinding = oModel.bindContext(sActionName + "(...)", oContext);

			that.expectRequest({
					method : "POST",
					payload : {TeamID : "TEAM_02"},
					url : "EMPLOYEES('2')/" + sActionName
				}, {
					ID : "2",
					Name : "Frederic Winter"
				})
				.expectChange("enabled", 0)
				.expectChange("name", "Frederic Winter");

			// code under test
			oActionBinding.setParameter("TeamID", "TEAM_02").execute();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: updates for advertised action (as an object) incl. its title caused by bound action
	// (refresh for sure works, side effect of edit works the same as bound action)
	// CPOUI5UISERVICESV3-905, CPOUI5UISERVICESV3-1714
	QUnit.test("Advertised actions: object & title updates", function (assert) {
		var oActionBinding,
			sActionName = "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
			oModel = createTeaBusiModel(),
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'2\')}" id="form">\
	<Text id="enabled"\
		text="{= %{#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable} ? 1 : 0 }" />\
	<Text id="title" text="{\
		path : \'#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable/title\',\
		type : \'sap.ui.model.odata.type.String\'}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')", {
				"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {
					title : "First Title"
				},
				ID : "2"
			})
			.expectChange("enabled", 1)
			.expectChange("title", "First Title");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("form").getObjectBinding().getBoundContext();

			oActionBinding = oModel.bindContext(sActionName + "(...)", oContext);
			that.expectRequest({
					method : "POST",
					payload : {},
					url : "EMPLOYEES('2')/" + sActionName
				}, {ID : "2"})
				.expectChange("enabled", 0)
				.expectChange("title", null);

			// code under test
			oActionBinding.execute();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					payload : {},
					url : "EMPLOYEES('2')/" + sActionName
				}, {
					"#com.sap.gateway.default.iwbep.tea_busi.v0001.AcSetIsAvailable" : {
						title : "Second Title"
					},
					ID : "2"
				})
				.expectChange("enabled", 1)
				.expectChange("title", "Second Title");

			// code under test
			oActionBinding.execute();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: master/detail with V2 adapter where the detail URI must be adjusted for V2
	// Additionally properties of a contained complex type are used with auto-$expand/$select
	QUnit.test("V2 adapter: master/detail", function (assert) {
		var oModel = this.createModelForV2FlightService({autoExpandSelect : true}),
			sView = '\
<Table id="master" items="{/FlightCollection}">\
	<ColumnListItem>\
		<Text id="carrid" text="{carrid}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="detail" binding="{}">\
	<Text id="cityFrom" text="{flightDetails/cityFrom}" />\
	<Text id="cityTo" text="{flightDetails/cityTo}" />\
</FlexBox>',
			that = this;

		this.expectRequest("FlightCollection?$select=carrid,connid,fldate&$skip=0&$top=100", {
				d : {
					results : [{
						__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
						carrid : "AA",
						connid : "0017",
						fldate : "/Date(1502323200000)/"
					}]
				}
			})
			.expectChange("carrid", ["AA"])
			.expectChange("cityFrom") // expect a later change
			.expectChange("cityTo"); // expect a later change

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("master").getItems()[0].getBindingContext();

			// 'flightDetails' is added to the table row
			that.expectRequest("FlightCollection(carrid='AA',connid='0017',fldate=datetime"
					+ "'2017-08-10T00%3A00%3A00')?$select=carrid,connid,fldate,flightDetails", {
					d : {
						__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
						carrid : "AA",
						connid : "0017",
						fldate : "/Date(1502323200000)/",
						flightDetails : {
							__metadata : {type : "RMTSAMPLEFLIGHT.FlightDetails"},
							cityFrom : "New York",
							cityTo : "Los Angeles"
						}
					}
				})
				.expectChange("cityFrom", "New York")
				.expectChange("cityTo", "Los Angeles");

			that.oView.byId("detail").setBindingContext(oContext);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="GET"> in V2 Adapter
	// Usage of service: /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
	QUnit.test("V2 Adapter: FunctionImport", function (assert) {
		var oModel = this.createModelForV2FlightService(),
			that = this;

		// code under test
		return this.createView(assert, '', oModel).then(function () {
			var oContextBinding = oModel.bindContext("/GetAvailableFlights(...)");

			that.expectRequest("GetAvailableFlights?fromdate=datetime'2017-08-10T00:00:00'"
					+ "&todate=datetime'2017-08-10T23:59:59'"
					+ "&cityfrom='new york'&cityto='SAN FRANCISCO'", {
					d : {
						results : [{
							__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
							carrid : "AA",
							connid : "0017",
							fldate : "/Date(1502323200000)/"
						}, {
							__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
							carrid : "DL",
							connid : "1699",
							fldate : "/Date(1502323200000)/"
						}, {
							__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
							carrid : "UA",
							connid : "3517",
							fldate : "/Date(1502323200000)/"
						}]
					}
				});

			return Promise.all([
				oContextBinding
					.setParameter("fromdate", "2017-08-10T00:00:00Z")
					.setParameter("todate", "2017-08-10T23:59:59Z")
					.setParameter("cityfrom", "new york")
					.setParameter("cityto", "SAN FRANCISCO")
					.execute(),
				that.waitForChanges(assert)
			]).then(function () {
				var oListBinding = oModel.bindList("value", oContextBinding.getBoundContext()),
					aContexts = oListBinding.getContexts(0, Infinity);

				aContexts.forEach(function (oContext, i) {
					// Note: This just illustrates the status quo. It is not meant to say this must
					// be kept stable.
					assert.strictEqual(oContext.getPath(), "/GetAvailableFlights(...)/value/" + i);
					assert.strictEqual(oContext.getProperty("fldate"), "2017-08-10T00:00:00Z");
				});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="GET" ReturnType="Edm.DateTime"> in V2 Adapter
	QUnit.test("V2 Adapter: bound function returns primitive", function (assert) {
		var oModel = this.createModelForV2FlightService(),
			sView = '\
<FlexBox binding="{/NotificationCollection(\'foo\')}">\
	<Text id="updated" text="{= %{updated} }" />\
	<FlexBox id="function" binding="{RMTSAMPLEFLIGHT.__FAKE__FunctionImport(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="value" text="{= %{value} }" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("NotificationCollection('foo')", {
				d : {
					__metadata : {type : "RMTSAMPLEFLIGHT.Notification"},
					ID : "foo",
					updated : "/Date(1502323200000)/"
				}
			})
			.expectChange("updated", "2017-08-10T00:00:00Z")
			.expectChange("value", undefined);

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("__FAKE__FunctionImport?ID='foo'", {
					d : { // Note: DataServiceVersion : 1.0
						__FAKE__FunctionImport : "/Date(1502323200000)/"
					}
				})
				.expectChange("value", "2017-08-10T00:00:00Z");

			return Promise.all([
				that.oView.byId("function").getObjectBinding().execute(),
				that.waitForChanges(assert)
			]);
		});
	});
	//TODO support also "version 2.0 JSON representation of a property"?

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="GET" ReturnType="Collection(Edm.DateTime)"> in V2
	// Adapter
	// Usage of service: /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
	QUnit.test("V2 Adapter: FunctionImport returns Collection(Edm.DateTime)", function (assert) {
		var oModel = this.createModelForV2FlightService(),
			that = this;

		// code under test
		return this.createView(assert, '', oModel).then(function () {
			var oContextBinding = oModel.bindContext("/__FAKE__GetAllFlightDates(...)");

			that.expectRequest("__FAKE__GetAllFlightDates", {
					d : { // Note: DataServiceVersion : 2.0
						results : [
							"/Date(1502323200000)/",
							"/Date(1502323201000)/",
							"/Date(1502323202000)/"
						]
					}
				});

			return Promise.all([
				oContextBinding.execute(),
				that.waitForChanges(assert)
			]).then(function () {
				var oListBinding = oModel.bindList("value", oContextBinding.getBoundContext()),
					aContexts = oListBinding.getContexts(0, Infinity);

				aContexts.forEach(function (oContext, i) {
					// Note: This just illustrates the status quo. It is not meant to say this must
					// be kept stable.
					assert.strictEqual(oContext.getPath(),
						"/__FAKE__GetAllFlightDates(...)/value/" + i);
					assert.strictEqual(oContext.getProperty(""), "2017-08-10T00:00:0" + i + "Z");
				});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="GET" ReturnType="Collection(FlightDetails)"> in V2
	// Adapter
	// Usage of service: /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
	QUnit.test("V2 Adapter: FunctionImport returns Collection(ComplexType)", function (assert) {
		var oModel = this.createModelForV2FlightService(),
			that = this;

		// code under test
		return this.createView(assert, '', oModel).then(function () {
			var oContextBinding = oModel.bindContext("/__FAKE__GetFlightDetailsByCarrier(...)");

			that.expectRequest("__FAKE__GetFlightDetailsByCarrier?carrid='AA'", {
					d : { // Note: DataServiceVersion : 2.0
						results : [{
							__metadata : { // just like result of GetFlightDetails
								type : "RMTSAMPLEFLIGHT.FlightDetails"
							},
							arrivalTime : "PT14H00M00S",
							departureTime : "PT11H00M00S"
						}, {
							__metadata : {type : "RMTSAMPLEFLIGHT.FlightDetails"},
							arrivalTime : "PT14H00M01S",
							departureTime : "PT11H00M01S"
						}, {
							__metadata : {type : "RMTSAMPLEFLIGHT.FlightDetails"},
							arrivalTime : "PT14H00M02S",
							departureTime : "PT11H00M02S"
						}]
					}
				});

			return Promise.all([
				oContextBinding.setParameter("carrid", "AA").execute(),
				that.waitForChanges(assert)
			]).then(function () {
				var oListBinding = oModel.bindList("value", oContextBinding.getBoundContext()),
					aContexts = oListBinding.getContexts(0, Infinity);

				aContexts.forEach(function (oContext, i) {
					// Note: This just illustrates the status quo. It is not meant to say this must
					// be kept stable.
					assert.strictEqual(oContext.getPath(),
						"/__FAKE__GetFlightDetailsByCarrier(...)/value/" + i);
					assert.strictEqual(oContext.getProperty("arrivalTime"), "14:00:0" + i);
					assert.strictEqual(oContext.getProperty("departureTime"), "11:00:0" + i);
				});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="GET" sap:action-for="..."> in V2 Adapter
	// Usage of service: /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
	//TODO $metadata of <FunctionImport> is broken, key properties and parameters do not match!
	// --> server expects GetFlightDetails?airlineid='AA'&connectionid='0017'&fldate=datetime'...'
	QUnit.test("V2 Adapter: bound function", function (assert) {
		var oModel = this.createModelForV2FlightService(),
			sView = '\
<FlexBox binding="{/FlightCollection(carrid=\'AA\',connid=\'0017\',fldate=2017-08-10T00:00:00Z)}">\
	<Text id="carrid" text="{carrid}" />\
	<FlexBox id="function" binding="{RMTSAMPLEFLIGHT.GetFlightDetails(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="distance" text="{distance}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("FlightCollection(carrid='AA',connid='0017'"
				+ ",fldate=datetime'2017-08-10T00%3A00%3A00')", {
				d : {
					__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
					carrid : "AA",
					connid : "0017",
					fldate : "/Date(1502323200000)/"
				}
			})
			.expectChange("carrid", "AA")
			.expectChange("distance", null);

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("GetFlightDetails?carrid='AA'&connid='0017'"
					+ "&fldate=datetime'2017-08-10T00:00:00'", {
					d : {
						GetFlightDetails : {
							__metadata : {type : "RMTSAMPLEFLIGHT.FlightDetails"},
							countryFrom : "US",
							cityFrom : "new york",
							airportFrom : "JFK",
							countryTo : "US",
							cityTo : "SAN FRANCISCO",
							airportTo : "SFO",
							flightTime : 361,
							departureTime : "PT11H00M00S",
							arrivalTime : "PT14H01M00S",
							distance : "2572.0000",
							distanceUnit : "SMI",
							flightType : "",
							period : 0
						}
					}
				})
				.expectChange("distance", "2,572.0000");

			return Promise.all([
				that.oView.byId("function").getObjectBinding().execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="POST"> in V2 Adapter
	QUnit.test("V2 Adapter: ActionImport", function (assert) {
		var oContextBinding,
			oModel = this.createModelForV2FlightService(),
			that = this;

		// code under test
		return this.createView(assert, '', oModel).then(function () {
			oContextBinding = oModel.bindContext("/__FAKE__ActionImport(...)");

			that.expectRequest({
					method : "POST",
					url : "__FAKE__ActionImport?carrid='AA'"
						+ "&guid=guid'0050568D-393C-1ED4-9D97-E65F0F3FCC23'"
						+ "&fldate=datetime'2017-08-10T00:00:00'&flightTime=42"
				}, {
					d : {
						__metadata : {type : "RMTSAMPLEFLIGHT.Flight"},
						carrid : "AA",
						connid : "0017",
						fldate : "/Date(1502323200000)/",
						PRICE : "2222.00",
						SEATSMAX : 320
					}
				});

			return Promise.all([
				oContextBinding
					.setParameter("carrid", "AA")
					.setParameter("guid", "0050568D-393C-1ED4-9D97-E65F0F3FCC23")
					.setParameter("fldate", "2017-08-10T00:00:00Z")
					.setParameter("flightTime", 42)
					.execute(),
				that.waitForChanges(assert)]);
		}).then(function () {
			var oContext = oContextBinding.getBoundContext();

			assert.strictEqual(oContext.getProperty("carrid"), "AA");
			assert.strictEqual(oContext.getProperty("connid"), "0017");
			assert.strictEqual(oContext.getProperty("fldate"), "2017-08-10T00:00:00Z");
			assert.strictEqual(oContext.getProperty("SEATSMAX"), 320);

			// Note: this is async due to type retrieval
			return oContext.requestProperty("PRICE", true).then(function (sValue) {
				assert.strictEqual(sValue, "2,222.00");
			});
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="POST" sap:action-for="..."> in V2 Adapter
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.test("V2 Adapter: bound action", function (assert) {
		var oModel = this.createModelForV2SalesOrderService(),
			sView = '\
<FlexBox binding="{/SalesOrderSet(\'0815\')}">\
	<Text id="id0" text="{SalesOrderID}" />\
	<FlexBox id="action" binding="{GWSAMPLE_BASIC.SalesOrder_Confirm(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="id1" text="{SalesOrderID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderSet('0815')", {
				d : {
					__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
					SalesOrderID : "0815"
				}
			})
			.expectChange("id0", "0815")
			.expectChange("id1", null);

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			var oContextBinding = that.oView.byId("action").getObjectBinding();

			that.expectRequest({
					method : "POST",
					url : "SalesOrder_Confirm?SalesOrderID='0815'"
				}, {
					d : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						SalesOrderID : "08/15",
						CreatedAt : "/Date(1502323200000)/"
					}
				})
				.expectChange("id1", "08/15");

			return Promise.all([
				oContextBinding.execute(),
				that.waitForChanges(assert)
			]).then(function () {
				assert.strictEqual(
					oContextBinding.getBoundContext().getProperty("CreatedAt"),
					"2017-08-10T00:00:00.0000000Z");
			});
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="POST" sap:action-for="..."> in V2 Adapter (w/o
	// reading binding parameter first!)
	// Usage of service: /sap/opu/odata/IWBEP/GWSAMPLE_BASIC/
	QUnit.skip("V2 Adapter: bound action on context w/o read", function (assert) {
		var oModel = this.createModelForV2SalesOrderService(),
			oParentContext = oModel.bindContext("/SalesOrderLineItemSet(\'0815\',\'10\')/ToHeader")
				.getBoundContext(),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			//TODO In the V2 adapter case a function import is used instead of a bound action. So we
			// need the key predicates which sometimes cannot be parsed from the URL. Trigger this
			// request and wait for the result before calling the function import.
			//TODO What about the ETag which might be got from this fresh request? Really use it?
			that.expectRequest("SalesOrderLineItemSet(\'0815\',\'10\')/ToHeader", {
					d : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						SalesOrderID : "0815"
					}
				})
				.expectRequest({
					method : "POST",
					url : "SalesOrder_Confirm?SalesOrderID='0815'"
				}, {
					d : {
						__metadata : {type : "GWSAMPLE_BASIC.SalesOrder"},
						SalesOrderID : "08/15"
					}
				});

			return Promise.all([
				// code under test
				oModel.bindContext("GWSAMPLE_BASIC.SalesOrder_Confirm(...)", oParentContext)
					.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: <FunctionImport m:HttpMethod="PUT" sap:action-for="..."> in V2 Adapter
	// Usage of service: /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
	//TODO $metadata of <FunctionImport> is broken, key properties and parameters do not match!
	// --> server expects UpdateAgencyPhoneNo?agency_id='...'
	QUnit.test("V2 Adapter: bound action w/ PUT", function (assert) {
		var oModel = this.createModelForV2FlightService(),
			sView = '\
<FlexBox binding="{/TravelAgencies(\'00000061\')}">\
	<Text id="oldPhone" text="{TELEPHONE}" />\
	<FlexBox id="action" binding="{RMTSAMPLEFLIGHT.UpdateAgencyPhoneNo(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="newPhone" text="{TELEPHONE}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("TravelAgencies('00000061')", {
				d : {
					__metadata : {type : "RMTSAMPLEFLIGHT.Travelagency"},
					agencynum : "00000061",
					NAME : "Fly High",
					TELEPHONE : "+49 2102 69555"
				}
			})
			.expectChange("oldPhone", "+49 2102 69555")
			.expectChange("newPhone", null);

		// code under test
		return this.createView(assert, sView, oModel).then(function () {
			var oContextBinding = that.oView.byId("action").getObjectBinding();

			that.expectRequest({
					method : "PUT",
					url : "UpdateAgencyPhoneNo?agencynum='00000061'"
						+ "&telephone='%2B49 (0)2102 69555'"
				}, {
					d : {
						__metadata : {type : "RMTSAMPLEFLIGHT.Travelagency"},
						agencynum : "00000061",
						NAME : "Fly High",
						TELEPHONE : "+49 (0)2102 69555"
					}
				})
				.expectChange("newPhone", "+49 (0)2102 69555");

			return Promise.all([
				oContextBinding.setParameter("telephone", "+49 (0)2102 69555").execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Initially suspended context binding is resumed w/ or w/o refresh
	[true, false].forEach(function (bRefresh) {
		var sTitle = "suspend/resume: suspended context binding, refresh=" + bRefresh;

		QUnit.test(sTitle, function (assert) {
			var oModel = createTeaBusiModel({autoExpandSelect : true}),
				sView = '\
<FlexBox id="form" binding="{path : \'/Equipments(Category=\\\'Electronics\\\',ID=1)\', \
		suspended : true}">\
	<Text id="text" text="{Category}" />\
</FlexBox>',
				that = this;

			this.expectChange("text"); // expect no change initially

			return this.createView(assert, sView, oModel).then(function () {
				var oBinding = that.oView.byId("form").getObjectBinding();

				that.expectRequest("Equipments(Category='Electronics',ID=1)"
						+ "?$select=Category,ID", {
						Category : "Electronics",
						ID : 1
					})
					.expectChange("text", "Electronics");

				if (bRefresh) {
					oBinding.refresh();
				}
				oBinding.resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: FlexBox with initially suspended context binding is changed by adding and removing
	//   a form field. After resume, one request reflecting the changes is sent and the added field
	//   is updated.
	[false, true].forEach(function (bRefresh) {
		var sTitle = "suspend/resume: changes for suspended context binding, refresh=" + bRefresh;

		QUnit.test(sTitle, function (assert) {
			var oModel = createTeaBusiModel({autoExpandSelect : true}),
				sView = '\
<FlexBox id="form" binding="{path : \'/Equipments(Category=\\\'Electronics\\\',ID=1)\', \
		suspended : true}">\
	<Text id="idCategory" text="{Category}" />\
	<Text id="idEmployeeId" text="{EmployeeId}" />\
</FlexBox>',
				that = this;

			this.expectChange("idCategory"); // expect no change initially

			return this.createView(assert, sView, oModel).then(function () {
				var oForm = that.oView.byId("form"),
					sId;

				sId = that.addToForm(oForm, "Name", assert);
				that.removeFromForm(oForm, "idEmployeeId");
				that.expectRequest("Equipments(Category='Electronics',ID=1)?"
						+ "$select=Category,ID,Name", {
						Category : "Electronics",
						ID : 1,
						Name : "Office PC"
					})
					.expectChange("idCategory", "Electronics")
					.expectChange(sId, "Office PC");

				if (bRefresh) {
					oForm.getObjectBinding().refresh();
				}
				oForm.getObjectBinding().resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Minimal test for an absolute ODataPropertyBinding. This scenario is comparable with
	// "FavoriteProduct" in the SalesOrders application.
	testViewStart("V2 Adapter: Absolute ODataPropertyBinding",
		'<Text id="text" text="{= %{/ProductSet(\'HT-1000\')/CreatedAt} }" />',
		{"ProductSet('HT-1000')/CreatedAt" : {d : {CreatedAt : "/Date(1502323200000)/"}}},
		{text : "2017-08-10T00:00:00.0000000Z"},
		"createModelForV2SalesOrderService"
	);

	//*********************************************************************************************
	// Scenario: Absolute ODataPropertyBinding with custom query options. CPOUI5UISERVICESV3-1590.
	testViewStart("Absolute ODataPropertyBinding with custom query options",
		'<Text id="text" text="{path: \'/TEAMS(\\\'42\\\')/Name\',\
			parameters : {custom : \'foo\', c2 : \'x\'}}"/>',
		{"TEAMS('42')/Name?c1=a&c2=x&custom=foo" : {value : "Business Suite"}},
		{text : "Business Suite"},
		createModel(sTeaBusi + "?c1=a&c2=b")
	);

	//*********************************************************************************************
	// Scenario: Relative ODataPropertyBinding with parameters like custom query options or
	// $$groupId never sends own request. CPOUI5UISERVICESV3-1590.
	testViewStart("Relative ODataPropertyBinding with parameters",
		'<FlexBox binding="{/TEAMS(\'42\')}">\
			<Text id="text" text="{path: \'Name\',\
				parameters : {custom : \'foo\', $$groupId : \'binding\'}}" />\
		</FlexBox>',
		{"TEAMS('42')" : {Name : "Business Suite"}},
		{text : "Business Suite"},
		createTeaBusiModel()
	);

	//*********************************************************************************************
	// Scenario: Table with suspended list binding is changed by adding and removing a column. After
	//   resume, a request reflecting the changes is sent.
	[false, true].forEach(function (bRefresh) {
		var sTitle = "suspend/resume: suspended list binding, refresh=" + bRefresh;

		QUnit.test(sTitle, function (assert) {
			var oModel = createTeaBusiModel({autoExpandSelect : true}),
				sView = '\
<Table id="table" items="{path : \'/Equipments\', suspended : true, templateShareable : false}">\
	<ColumnListItem>\
		<Text id="idCategory" text="{Category}" />\
		<Text id="idEmployeeId" text="{EmployeeId}" />\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectChange("idCategory", [])
				.expectChange("idEmployeeId", []);

			return this.createView(assert, sView, oModel).then(function () {
				var sId0,
					sId1,
					oTable = that.oView.byId("table");

				sId0 = that.addToTable(oTable, "Name", assert);
				sId1 = that.addToTable(oTable, "EQUIPMENT_2_EMPLOYEE/Name", assert);
				that.removeFromTable(oTable, "idEmployeeId");

				that.expectRequest("Equipments?$select=Category,ID,Name"
						+ "&$expand=EQUIPMENT_2_EMPLOYEE($select=ID,Name)&$skip=0&$top=100", {
						value : [{
							Category : "Electronics",
							ID : 1,
							Name : "Office PC",
							EQUIPMENT_2_EMPLOYEE : {
								ID : "2",
								Name : "Frederic Fall"
							}
						}, {
							Category : "Vehicle",
							ID : 2,
							Name : "VW Golf 2.0",
							EQUIPMENT_2_EMPLOYEE : {
								ID : "3",
								Name : "Jonathan Smith"
							}
						}]
					})
					.expectChange("idCategory", ["Electronics", "Vehicle"])
					.expectChange(sId0, ["Office PC", "VW Golf 2.0"])
					.expectChange(sId1, ["Frederic Fall", "Jonathan Smith"]);

				if (bRefresh) {
					oTable.getBinding("items").refresh();
				}
				oTable.getBinding("items").resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: FlexBox with context binding is suspended after initialization and then changed by
	//   adding and removing a form field. After resume, a new request reflecting the changes is
	//   sent and the added field is updated.
	[false, true].forEach(function (bRefresh) {
		var sTitle = "suspend/resume: *not* suspended context binding, refresh=" + bRefresh;

		QUnit.test(sTitle, function (assert) {
			var oModel = createTeaBusiModel({autoExpandSelect : true}),
				sView = '\
<FlexBox id="form" binding="{/Equipments(Category=\'Electronics\',ID=1)}">\
	<Text id="idCategory" text="{Category}" />\
	<Text id="idEmployeeId" text="{EmployeeId}" />\
</FlexBox>',
				that = this;

			this.expectRequest("Equipments(Category='Electronics',ID=1)"
					+ "?$select=Category,EmployeeId,ID", {
					Category : "Electronics",
					EmployeeId : "0001",
					ID : 1
				})
				.expectChange("idCategory", "Electronics")
				.expectChange("idEmployeeId", "0001");

			return this.createView(assert, sView, oModel).then(function () {
				var oForm = that.oView.byId("form"),
					sId;

				oForm.getObjectBinding().suspend();
				sId = that.addToForm(oForm, "Name", assert);
				that.removeFromForm(oForm, "idEmployeeId");
				that.expectRequest("Equipments(Category='Electronics',ID=1)?$select=Category,ID,Name", {
						Category : "Electronics",
						ID : 1,
						Name : "Office PC"
					})
					.expectChange(sId, "Office PC");

				if (bRefresh) {
					oForm.getObjectBinding().refresh();
				}
				oForm.getObjectBinding().resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Table with list binding is suspended after initialization and then changed by
	//   adding and removing a column. After resume, a new request reflecting the changes is
	//   sent and the added column is updated.
	[false, true].forEach(function (bRefresh) {
		QUnit.test("suspend/resume: *not* suspended list binding", function (assert) {
			var oModel = createTeaBusiModel({autoExpandSelect : true}),
				sView = '\
<Table id="table" items="{path : \'/Equipments\', templateShareable : false}">\
	<ColumnListItem>\
		<Text id="idCategory" text="{Category}" />\
		<Text id="idEmployeeId" text="{EmployeeId}" />\
	</ColumnListItem>\
</Table>',
				that = this;

			this.expectRequest("Equipments?$select=Category,EmployeeId,ID&$skip=0&$top=100", {
					value : [{
						Category : "Electronics",
						EmployeeId : "0001",
						ID : 1
					}, {
						Category : "Vehicle",
						EmployeeId : "0002",
						ID : 2
					}]
				})
				.expectChange("idCategory", ["Electronics", "Vehicle"])
				.expectChange("idEmployeeId", ["0001", "0002"]);

			return this.createView(assert, sView, oModel).then(function () {
				var sId0,
					sId1,
					oTable = that.oView.byId("table");

				sId0 = that.addToTable(oTable, "Name", assert);
				sId1 = that.addToTable(oTable, "EQUIPMENT_2_EMPLOYEE/Name", assert);
				that.removeFromTable(oTable, "idEmployeeId");

				that.expectRequest("Equipments?$select=Category,ID,Name"
						+ "&$expand=EQUIPMENT_2_EMPLOYEE($select=ID,Name)&$skip=0&$top=100", {
						value : [{
							Category : "Electronics",
							ID : 1,
							Name : "Office PC",
							EQUIPMENT_2_EMPLOYEE : {
								ID : "2",
								Name : "Frederic Fall"
							}
						}, {
							Category : "Vehicle",
							ID : 2,
							Name : "VW Golf 2.0",
							EQUIPMENT_2_EMPLOYEE : {
								ID : "3",
								Name : "Jonathan Smith"
							}
						}]
					})
					.expectChange("idCategory", ["Electronics", "Vehicle"])
					.expectChange(sId0, ["Office PC", "VW Golf 2.0"])
					.expectChange(sId1, ["Frederic Fall", "Jonathan Smith"]);

				if (bRefresh) {
					oTable.getBinding("items").refresh();
				}
				oTable.getBinding("items").resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Outer form with context binding is suspended after initialization; outer form
	//   contains inner form. Both forms are then changed by adding and removing a form field.
	//   After resume, a new request reflecting the changes is sent and the added fields are
	//   updated.
	[false, true].forEach(function (bRefresh) {
		var sTitle = "suspend/resume: dependent context bindings, refresh=" + bRefresh;

		QUnit.test(sTitle, function (assert) {
			var oModel = createTeaBusiModel({autoExpandSelect : true}),
				sView = '\
<FlexBox id="outerForm" binding="{/Equipments(Category=\'Electronics\',ID=1)}">\
	<Text id="idEquipmentName" text="{Name}" />\
	<FlexBox id="innerForm" binding="{EQUIPMENT_2_EMPLOYEE}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="idEmployeeName" text="{Name}" />\
		<Text id="idManagerId" text="{MANAGER_ID}" />\
	</FlexBox>\
</FlexBox>',
				that = this;

			this.expectRequest("Equipments(Category='Electronics',ID=1)?$select=Category,ID,Name"
					+ "&$expand=EQUIPMENT_2_EMPLOYEE($select=ID,MANAGER_ID,Name)", {
					Category : "Electronics",
					ID : 1,
					Name : "Office PC",
					EQUIPMENT_2_EMPLOYEE : {
						ID : "2",
						MANAGER_ID : "5",
						Name : "Frederic Fall"
					}
				})
				.expectChange("idEquipmentName", "Office PC")
				.expectChange("idEmployeeName", "Frederic Fall")
				.expectChange("idManagerId", "5");

			return this.createView(assert, sView, oModel).then(function () {
				var oOuterForm = that.oView.byId("outerForm"),
					oInnerForm = that.oView.byId("innerForm"),
					sIdEmployeeId,
					sIdAge;

				oOuterForm.getObjectBinding().suspend();
				sIdEmployeeId = that.addToForm(oOuterForm, "EmployeeId", assert);
				that.removeFromForm(oOuterForm, "idEquipmentName");
				sIdAge = that.addToForm(oInnerForm, "AGE", assert);
				that.removeFromForm(oInnerForm, "idManagerId");
				that.expectRequest("Equipments(Category='Electronics',ID=1)"
						+ "?$select=Category,EmployeeId,ID"
						+ "&$expand=EQUIPMENT_2_EMPLOYEE($select=AGE,ID,Name)", {
						Category : "Electronics",
						EmployeeId : "0002",
						ID : "1",
						EQUIPMENT_2_EMPLOYEE : {
							AGE : 32,
							ID : "2",
							Name : "Frederic Fall"
						}
					})
					.expectChange(sIdEmployeeId, "0002")
					.expectChange(sIdAge, "32");

				if (bRefresh) {
					oOuterForm.getObjectBinding().refresh();
				}
				oOuterForm.getObjectBinding().resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Outer form with context binding is suspended after initialization; outer form
	//   contains inner table. Both form and table are then changed by adding and removing a form
	//   field resp. a table column.
	//   After resume, a new request reflecting the changes is sent and the added field/column is
	//   updated.
	QUnit.test("suspend/resume: context binding with dependent list binding", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/TEAMS(\'TEAM_01\')}">\
	<Text id="idMemberCount" text="{MEMBER_COUNT}" />\
	<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', templateShareable : false}">\
		<ColumnListItem>\
			<Text id="idAge" text="{AGE}" />\
			<Text id="idName" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('TEAM_01')?$select=MEMBER_COUNT,Team_Id"
				+ "&$expand=TEAM_2_EMPLOYEES($select=AGE,ID,Name)", {
				Team_Id : "TEAM_01",
				MEMBER_COUNT : 2,
				TEAM_2_EMPLOYEES : [{
					ID : "1",
					Name : "Frederic Fall",
					AGE : 52
				}, {
					ID : "3",
					Name : "Jonathan Smith",
					AGE : 56
				}]
			})
			.expectChange("idMemberCount", "2")
			.expectChange("idAge", ["52", "56"])
			.expectChange("idName", ["Frederic Fall", "Jonathan Smith"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oForm = that.oView.byId("form"),
				sIdManagerId,
				sIdStatus,
				oTable = that.oView.byId("table");

			oForm.getObjectBinding().suspend();
			sIdManagerId = that.addToForm(oForm, "MANAGER_ID", assert);
			that.removeFromForm(oForm, "idMemberCount");
			sIdStatus = that.addToTable(oTable, "STATUS", assert);
			that.removeFromTable(oTable, "idAge");
			that.expectRequest("TEAMS('TEAM_01')?$select=MANAGER_ID,Team_Id"
					+ "&$expand=TEAM_2_EMPLOYEES($select=ID,Name,STATUS)", {
					Team_Id : "TEAM_01",
					MANAGER_ID : "3",
					TEAM_2_EMPLOYEES : [{
						ID : "1",
						Name : "Frederic Fall",
						STATUS : "Available"
					}, {
						ID : "3",
						Name : "Jonathan Smith",
						STATUS : "Occupied"
					}]
				})
				.expectChange(sIdManagerId, "3")
				.expectChange("idName", ["Frederic Fall", "Jonathan Smith"])
				.expectChange(sIdStatus, ["Available", "Occupied"]);

			oForm.getObjectBinding().resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Outer form with context binding is suspended after initialization; outer form
	// contains inner table. The inner table is sorted resulting in a different order.
	QUnit.test("suspend/resume: sort dependent list binding", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/TEAMS(\'TEAM_01\')}">\
	<Text id="idMemberCount" text="{MEMBER_COUNT}" />\
	<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', templateShareable : false,\
			parameters : {$$ownRequest : true}}">\
		<ColumnListItem>\
			<Text id="idAge" text="{AGE}" />\
			<Text id="idName" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('TEAM_01')?$select=MEMBER_COUNT,Team_Id", {
				Team_Id : "TEAM_01",
				MEMBER_COUNT : 2
			})
			.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=AGE,ID,Name"
				+ "&$skip=0&$top=100", {
				value : [{
					ID : "1",
					Name : "Frederic Fall",
					AGE : 56
				}, {
					ID : "3",
					Name : "Jonathan Smith",
					AGE : 52
				}]
			})
			.expectChange("idMemberCount", "2")
			.expectChange("idAge", ["56", "52"])
			.expectChange("idName", ["Frederic Fall", "Jonathan Smith"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oFormBinding = that.oView.byId("form").getObjectBinding();

			that.expectRequest("TEAMS('TEAM_01')?$select=MEMBER_COUNT,Team_Id", {
					Team_Id : "TEAM_01",
					MEMBER_COUNT : 2
				})
				.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=AGE,ID,Name&$orderby=AGE"
					+ "&$skip=0&$top=100", {
					value : [{
						ID : "3",
						Name : "Jonathan Smith",
						AGE : 52
					}, {
						ID : "1",
						Name : "Frederic Fall",
						AGE : 56
					}]
				})
				.expectChange("idAge", ["52", "56"])
				.expectChange("idName", ["Jonathan Smith", "Frederic Fall"]);

			oFormBinding.suspend();
			that.oView.byId("table").getBinding("items").sort(new Sorter("AGE"));
			oFormBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: List binding of a table is suspended and then resumed with no change to the table,
	//    so that the list binding is not re-created. Property bindings from existing rows must not
	//    call checkUpdate in resumeInternal while the list binding is "empty" as it has not yet
	//    fired a change event. This would lead to "Failed to drill-down" errors.
	QUnit.test("suspend/resume: no checkUpdate for existing property bindings in a list binding",
			function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/Equipments\', templateShareable : false}">\
	<ColumnListItem>\
		<Text id="idEquipmentName" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("Equipments?$select=Category,ID,Name&$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : 1,
					Name : "Office PC"
				}, {
					Category : "Electronics",
					ID : 2,
					Name : "Tablet X"
				}]
			})
			.expectChange("idEquipmentName", ["Office PC", "Tablet X"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oListBinding = that.oView.byId("table").getBinding("items");

			oListBinding.suspend();

			that.expectRequest("Equipments?$select=Category,ID,Name&$skip=0&$top=100", {
					value : [{
						Category : "Electronics",
						ID : 1,
						Name : "Office PC"
					}, {
						Category : "Electronics",
						ID : 2,
						Name : "Tablet X"
					}]
				});

			oListBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Operation binding for a function, first it is deferred, later is has been executed.
	//   Show interaction of execute() and suspend()/resume(); setParameter() has been tested
	//   for refresh() already, see test "Function binding: setParameter, execute and refresh".
	QUnit.test("Function binding: execute and suspend/resume", function (assert) {
		var oEmployeeBinding,
			sFunctionName = "com.sap.gateway.default.iwbep.tea_busi.v0001"
				+ ".FuGetEmployeeSalaryForecast",
			sView = '\
<FlexBox id="employee" binding="{/EMPLOYEES(\'2\')}">\
	<Text id="salary" text="{SALARY/YEARLY_BONUS_AMOUNT}" />\
	<FlexBox id="function" binding="{' + sFunctionName + '(...)}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="forecastSalary" text="{SALARY/YEARLY_BONUS_AMOUNT}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')", {
				SALARY : {YEARLY_BONUS_AMOUNT : 100}
			})
			.expectChange("salary", "100")
			.expectChange("forecastSalary", null);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES('2')", {
					SALARY : {YEARLY_BONUS_AMOUNT : 100}
				});

			oEmployeeBinding = that.oView.byId("employee").getObjectBinding();
			oEmployeeBinding.suspend();
			oEmployeeBinding.resume(); // MUST NOT trigger a request for the bound function!

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("EMPLOYEES('2')/" + sFunctionName + "()", {
					SALARY : {YEARLY_BONUS_AMOUNT : 142}
				})
				.expectChange("forecastSalary", "142");

			return Promise.all([
				that.oView.byId("function").getObjectBinding().execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("EMPLOYEES('2')", {
					SALARY : {YEARLY_BONUS_AMOUNT : 110}
				})
				.expectRequest("EMPLOYEES('2')/" + sFunctionName + "()", {
					SALARY : {YEARLY_BONUS_AMOUNT : 150}
				})
				.expectChange("salary", "110")
				.expectChange("forecastSalary", "150");

			oEmployeeBinding.suspend();
			oEmployeeBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Master table with list binding is suspended after initialization. Detail form for
	//   "selected" context from table is then changed by adding and removing a form field; table
	//   remains unchanged.
	//   After resume, *separate* new requests for the master table and the details form are sent;
	//   the request for the form reflects the changes. The field added to the form is updated.
	// JIRA bug 1169
	// Ensure separate requests for master-detail scenarios with auto-$expand/$select and
	// suspend/resume
	QUnit.test("suspend/resume: master list binding with details context binding, only context"
			+ " binding is adapted", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/Equipments\', templateShareable : false}">\
	<ColumnListItem>\
		<Text id="idEquipmentName" text="{Name}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="form" binding="{path : \'EQUIPMENT_2_EMPLOYEE\', parameters : {$$ownRequest : true}}">\
	<Text id="idName" text="{Name}" />\
	<Text id="idAge" text="{AGE}" />\
</FlexBox>',
			that = this;

		this.expectRequest("Equipments?$select=Category,ID,Name&$skip=0&$top=100", {
				value : [{
					Category : "Electronics",
					ID : 1,
					Name : "Office PC"
				}, {
					Category : "Electronics",
					ID : 2,
					Name : "Tablet X"
				}]
			})
			.expectChange("idEquipmentName", ["Office PC", "Tablet X"])
			.expectChange("idName")
			.expectChange("idAge");

		return this.createView(assert, sView, oModel).then(function () {
			var oForm = that.oView.byId("form");

			oForm.setBindingContext(that.oView.byId("table").getBinding("items")
				.getCurrentContexts()[0]);

			that.expectRequest("Equipments(Category='Electronics',ID=1)/EQUIPMENT_2_EMPLOYEE"
					+ "?$select=AGE,ID,Name", {
					AGE : 52,
					ID : "2",
					Name : "Frederic Fall"
				})
				.expectChange("idName", "Frederic Fall")
				.expectChange("idAge", "52");

			return that.waitForChanges(assert).then(function () {
				var sIdManagerId;

				// no change in table, only in contained form
				oForm.getObjectBinding().getRootBinding().suspend();
				sIdManagerId = that.addToForm(oForm, "MANAGER_ID", assert);
				that.removeFromForm(oForm, "idAge");

				that.expectRequest("Equipments?$select=Category,ID,Name&$skip=0&$top=100", {
						value : [{
							Category : "Electronics",
							ID : 1,
							Name : "Office PC"
						}, {
							Category : "Electronics",
							ID : 2,
							Name : "Tablet X"
						}]
					})
					.expectRequest("Equipments(Category='Electronics',ID=1)/EQUIPMENT_2_EMPLOYEE"
						+ "?$select=ID,MANAGER_ID,Name", {
						ID : "2",
						Name : "Frederic Fall",
						MANAGER_ID : "1"
					})
					.expectChange(sIdManagerId, "1");

				oForm.getObjectBinding().getRootBinding().resume();

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: call filter, sort, changeParameters on a suspended ODLB
	QUnit.test("suspend/resume: call read APIs on a suspended ODLB", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/BusinessPartnerList\', suspended : true}">\
	<ColumnListItem>\
		<Text id="id" text="{BusinessPartnerID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("id", []);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("table").getBinding("items");

			oBinding.filter(new Filter("BusinessPartnerRole", FilterOperator.EQ, "01"))
				.sort(new Sorter("CompanyName"))
				.changeParameters({$filter : "BusinessPartnerID gt '0100000001'"});

			that.expectRequest("BusinessPartnerList?$filter=BusinessPartnerRole eq '01' "
				+ "and (BusinessPartnerID gt '0100000001')&$orderby=CompanyName"
				+ "&$select=BusinessPartnerID&$skip=0&$top=100", {
					value : [{
						BusinessPartnerID : "0100000002"
					}, {
						BusinessPartnerID : "0100000003"
					}]
				})
				.expectChange("id", [
					"0100000002",
					"0100000003"
				]);

			oBinding.attachEventOnce("change", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Filter);
			});

			// code under test
			oBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: ODM#refresh ignores suspended bindings
	// A suspended binding should not be considered when refreshing via ODM#refresh
	QUnit.test("ODM#refresh ignores suspended bindings", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/BusinessPartnerList\', suspended : true}">\
	<ColumnListItem>\
		<Text id="id" text="{BusinessPartnerID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("id", []);

		return this.createView(assert, sView, oModel).then(function () {

			// code under test
			that.oModel.refresh("foo");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: call setAggregation on a suspended ODLB
	QUnit.test("suspend/resume: call setAggregation on a suspended ODLB", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/BusinessPartnerList\', suspended : true}">\
	<ColumnListItem>\
		<Text id="id" text="{BusinessPartnerID}" />\
		<Text id="role" text="{BusinessPartnerRole}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("id", []);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("table").getBinding("items");

			oBinding.setAggregation({groupLevels : ["BusinessPartnerRole"]});

			that.expectRequest("BusinessPartnerList?$apply=groupby((BusinessPartnerRole))"
				+ "&$select=BusinessPartnerID,BusinessPartnerRole&$count=true"
				+ "&$skip=0&$top=100", {
					value : [{
						BusinessPartnerID : "0100000000",
						BusinessPartnerRole : "01"
					}, {
						BusinessPartnerID : "0100000001",
						BusinessPartnerRole : "02"
					}]
				})
				.expectChange("id", [
					"0100000000",
					"0100000001"
				]);

			oBinding.attachEventOnce("change", function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Change);
			});

			// code under test
			oBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: call changeParameters on a suspended ODCB
	QUnit.test("suspend/resume: call changeParameters on a suspended ODCB", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'42\')}">\
	<Text id="id" text="{SalesOrderID}"/>\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="pos" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=SalesOrderID"
			+ "&$expand=SO_2_SOITEM($select=ItemPosition,SalesOrderID)", {
				SalesOrderID : "42",
				SO_2_SOITEM : [{SalesOrderID : "42", ItemPosition : "10"}]
			})
			.expectChange("id", "42")
			.expectChange("pos", ["10"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("form").getElementBinding();

			oBinding.suspend();
			oBinding.changeParameters({custom : "invalid"}); // just to call it twice
			oBinding.changeParameters({custom : "option"});

			that.expectRequest("SalesOrderList('42')?custom=option&$select=SalesOrderID"
				+ "&$expand=SO_2_SOITEM($select=ItemPosition,SalesOrderID)", {
					SalesOrderID : "42",
					SO_2_SOITEM : [{SalesOrderID : "42", ItemPosition : "10"}]
				});

			// code under test
			oBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Deferred operation binding returns a collection. A dependent list binding for
	// "value" with auto-$expand/$select displays the result.
	QUnit.test("Deferred operation returns collection, auto-$expand/$select", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/GetSOContactList(...)}" id="function">\
	<Table items="{value}">\
		<ColumnListItem>\
			<Text id="nickname" text="{Nickname}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectChange("nickname", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("GetSOContactList(SalesOrderID='0500000001')", {
					value : [
						{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c591d177", Nickname : "a"},
						{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c591f177", Nickname : "b"},
						{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c5921177", Nickname : "c"}
					]
				})
				.expectChange("nickname", ["a", "b", "c"]);

			return Promise.all([
				// code under test
				that.oView.byId("function").getObjectBinding()
					.setParameter("SalesOrderID", "0500000001")
					.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: List binding for non-deferred function call which returns a collection, with
	// auto-$expand/$select.
	QUnit.test("List: function returns collection, auto-$expand/$select", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table items="{/GetSOContactList(SalesOrderID=\'0500000001\')}">\
	<ColumnListItem>\
		<Text id="nickname" text="{Nickname}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("GetSOContactList(SalesOrderID='0500000001')"
				+ "?$select=ContactGUID,Nickname&$skip=0&$top=100", {
				value : [
					{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c591d177", Nickname : "a"},
					{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c591f177", Nickname : "b"},
					{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c5921177", Nickname : "c"}
				]
			})
			.expectChange("nickname", ["a", "b", "c"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: ODataContextBinding for non-deferred function call which returns a collection. A
	// dependent list binding for "value" with auto-$expand/$select displays the result.
	// github.com/SAP/openui5/issues/1727
	QUnit.test("Context: function returns collection, auto-$expand/$select", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/GetSOContactList(SalesOrderID=\'0500000001\')}" id="function">\
	<Table items="{value}">\
		<ColumnListItem>\
			<Text id="nickname" text="{Nickname}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest("GetSOContactList(SalesOrderID='0500000001')"
			+ "?$select=ContactGUID,Nickname", {
				value : [
					{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c591d177", Nickname : "a"},
					{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c591f177", Nickname : "b"},
					{ContactGUID : "fa163e7a-d4f1-1ee8-84ac-11f9c5921177", Nickname : "c"}
				]
			})
			.expectChange("nickname", ["a", "b", "c"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: ODataContextBinding for non-deferred bound function call which returns a
	// collection. A dependent list binding for "value" with auto-$expand/$select displays the
	// result.
	QUnit.test("Context: bound function returns coll., auto-$expand/$select", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sFunctionName = "com.sap.gateway.default.iwbep.tea_busi.v0001"
				+ ".__FAKE__FuGetEmployeesByManager",
			sView = '\
<FlexBox binding="{/MANAGERS(\'1\')/' + sFunctionName + '()}" id="function">\
	<Table items="{value}">\
		<ColumnListItem>\
			<Text id="id" text="{ID}" />\
			<Text id="name" text="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest("MANAGERS('1')/" + sFunctionName + "()?$select=ID,Name", {
				value : [{
					ID : "3",
					Name : "Jonathan Smith"
				}, {
					ID : "6",
					Name : "Susan Bay"
				}]
			})
			.expectChange("id", ["3", "6"])
			.expectChange("name", ["Jonathan Smith", "Susan Bay"]);

		return this.createView(assert, sView, oModel);
	});
	//TODO Gateway says "Expand/Select not supported for functions"!
	//TODO Gateway says "System query options not supported for functions"!
	// --> TripPinRESTierService is OK with both!
	// http://services.odata.org/TripPinRESTierService/(S(...))/People('russellwhyte')/Trips(1)/
	// Microsoft.OData.Service.Sample.TrippinInMemory.Models.GetInvolvedPeople()
	// ?$count=true&$select=UserName&$skip=1

	//*********************************************************************************************
	// Scenario: Delete an entity via a context binding and check that bindings to properties of
	// this entity are notified even if they have a child path of the context binding without being
	// dependent to it.
	QUnit.test("notify non-dependent bindings after deletion", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'0500000000\')}" id="form">\
	<FlexBox binding="{SO_2_BP}" id="businessPartner">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="phoneNumber" text="{PhoneNumber}"/>\
	</FlexBox>\
	<Text id="companyName" text="{SO_2_BP/CompanyName}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('0500000000')?$select=SalesOrderID"
				+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName,PhoneNumber)", {
				SalesOrderID : "0500000000",
				SO_2_BP : {
					"@odata.etag" : "ETag",
					BusinessPartnerID : "0100000000",
					CompanyName : "SAP",
					PhoneNumber : "06227747474"
				}
			})
			.expectChange("companyName", "SAP")
			.expectChange("phoneNumber", "06227747474");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("businessPartner").getBindingContext();

			that.expectRequest({
					headers : {"If-Match" : "ETag"},
					method : "DELETE",
					url : "BusinessPartnerList('0100000000')"
				})
				// Note: The value of the property binding is undefined because there is no
				// explicit cache value for it, but the type's formatValue converts this to null.
				.expectChange("companyName", null)
				.expectChange("phoneNumber", null);

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity via a context binding with an empty path and $$ownRequest. The
	// binding hierarchy is ODCB - ODCB. The top binding may or may not have read data on its own.
	// BCP 1980308439
	// JIRA CPOUI5UISERVICESV3-1917
[true, false].forEach(function (bParentHasData) {
	QUnit.test("delete context of binding with empty path and $$ownRequest (" + bParentHasData
			+ ")", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'0500000000\')}" id="form">' +
	(bParentHasData ? '<Text id="netAmount" text="{NetAmount}" />' : '') +
'	<FlexBox binding="{path : \'\', parameters: {$$ownRequest : true}}" id="blackBinding">\
		<Text id="note" text="{Note}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		if (bParentHasData) {
			this.expectRequest("SalesOrderList('0500000000')?$select=NetAmount,SalesOrderID", {
					"@odata.etag" : "n/a",
					NetAmount : "10",
					SalesOrderID : "0500000000"
				})
				.expectChange("netAmount", "10.00");
		}
		this.expectRequest("SalesOrderList('0500000000')?$select=Note,SalesOrderID", {
				"@odata.etag" : "ETag",
				Note : "Test",
				SalesOrderID : "0500000000"
			})
			.expectChange("note", "Test");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("blackBinding").getBindingContext();

			that.expectRequest({
					headers : {"If-Match" : "ETag"},
					method : "DELETE",
					url : "SalesOrderList('0500000000')"
				})
			// Note: The value of the property binding is undefined because there is no
			// explicit cache value for it, but the type's formatValue converts this to null.
				.expectChange("note", null);
			if (bParentHasData) {
				that.expectChange("netAmount", null);
			}

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Delete an entity via a context binding with an empty path and $$ownRequest. The
	// hierarchy is ODLB - ODCB - ODCB both ODCB with empty path. The deletion has to use the ETag
	// of the context for which Context#delete is called.
	// JIRA CPOUI5UISERVICESV3-1917
	QUnit.test("delete context of binding with empty path, delegate to ODLB", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}">\
	<t:Column>\
		<t:template>\
			<Text id="note" text="{Note}" />\
		</t:template>\
	</t:Column>\
</t:Table>\
<FlexBox binding="{path : \'\', parameters: {$$ownRequest : true}}" id="form">\
	<Text id="netAmount" text="{NetAmount}" />\
	<FlexBox binding="{path : \'\', parameters: {$$ownRequest : true}}" id="form2">\
		<Text id="salesOrderID" text="{SalesOrderID}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=110", {
				value : [{
					"@odata.etag" : "ETag1",
					SalesOrderID : "0500000000",
					Note : "Row1"
				}, {
					"@odata.etag" : "ETag2",
					SalesOrderID : "0500000001",
					Note : "Row2"
				}]
			})
			.expectChange("note", ["Row1", "Row2"])
			.expectChange("netAmount", [])
			.expectChange("salesOrderID", []);

		return this.createView(assert, sView, oModel).then(function () {
			var oContextBinding = that.oView.byId("form").getElementBinding(),
				oListBinding = that.oView.byId("table").getBinding("rows");

			that.expectRequest("SalesOrderList('0500000000')?$select=NetAmount,SalesOrderID", {
					"@odata.etag" : "ETag3",
					SalesOrderID : "0500000000",
					NetAmount : "10"
				})
				.expectRequest("SalesOrderList('0500000000')?$select=SalesOrderID", {
					"@odata.etag" : "ETag4",
					SalesOrderID : "0500000000"
				})
				.expectChange("netAmount", "10.00")
				.expectChange("salesOrderID", "0500000000");

			oContextBinding.setContext(oListBinding.getCurrentContexts()[0]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					headers : {"If-Match" : "ETag4"},
					method : "DELETE",
					url : "SalesOrderList('0500000000')"
				})
				// "note" temporarily loses its binding context and thus fires a change event
				.expectChange("note", null, null)
				.expectChange("note", ["Row2"])
				.expectChange("netAmount", null, null)
				.expectChange("salesOrderID", null, null);

			return Promise.all([
				// code under test
				that.oView.byId("form2").getBindingContext().delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: BCP 1870017061
	// Master/Detail, object page with a table.Table: When changing the entity for the object page
	// the property bindings below the table's list binding complained about an invalid path in
	// deregisterChange. This scenario only simulates the object page, the contexts from the master
	// list are hardcoded to keep the test small.
	QUnit.test("deregisterChange", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '\
<FlexBox id="form">\
	<t:Table rows="{path : \'SO_2_SOITEM\', parameters : {$$updateGroupId : \'update\'}}">\
		<t:Column>\
			<t:template>\
				<Text id="position" text="{ItemPosition}" />\
			</t:template>\
		</t:Column>\
	</t:Table>\
</FlexBox>',
			that = this;

		this.expectChange("position", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("SalesOrderList('0500000000')/SO_2_SOITEM?$skip=0&$top=110", {
					value : [{
						ItemPosition : "10",
						SalesOrderID : "0500000000"
					}]
				})
				.expectChange("position", ["10"]);

			that.oView.byId("form").bindElement("/SalesOrderList('0500000000')");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList('0500000001')/SO_2_SOITEM?$skip=0&$top=110", {
					value : [{
						ItemPosition : "20",
						SalesOrderID : "0500000001"
					}]
				})
				// "position" temporarily loses its binding context and thus fires a change event
				.expectChange("position", null, null)
				.expectChange("position", ["20"]);

			that.oView.byId("form").bindElement("/SalesOrderList('0500000001')");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	QUnit.test("delayed create", function (assert) {
		var oModel = createSalesOrdersModel(),
			sView = '<FlexBox id="form" binding="{/SalesOrderList(\'0500000000\')}"/>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			var oParentBinding = that.oView.byId("form").getElementBinding(),
				oListBinding = that.oModel.bindList("SO_2_SOITEM", oParentBinding.getBoundContext(),
					undefined, undefined, {$$updateGroupId : "update"});

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('0500000000')/SO_2_SOITEM",
					payload : {}
				}, {
					SalesOrderID : "0500000000",
					ItemPosition : "0010"
				})
				.expectRequest("SalesOrderList('0500000000')"
					+ "/SO_2_SOITEM(SalesOrderID='0500000000',ItemPosition='0010')", {
					SalesOrderID : "0500000000",
					ItemPosition : "0010"
				});

			oListBinding.create();

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("delayed execute", function (assert) {
		var sAction = "SalesOrderList('0500000000')/"
				+ "com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrder_Cancel",
			oModel = createSalesOrdersModel(),
			sView = '<FlexBox id="form" binding="{/' + sAction + '(...)}"/>',
			that = this;

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "POST",
					url : sAction,
					payload : {}
				}, {SalesOrderID : "0500000000"});

			return Promise.all([
				that.oView.byId("form").getElementBinding().execute("update"),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh using a group with submit mode 'API'. The view contains one context binding
	// without children. Hence the binding doesn't trigger a request, but its lock must be released.
	QUnit.test("ODCB: delayed refresh", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/BusinessPartnerList(\'0100000000\')}">\
	<Text id="company" text="{CompanyName}"/>\
</FlexBox>\
<FlexBox binding="{/SalesOrderList}"/>',
			that = this;

		this.expectRequest("BusinessPartnerList('0100000000')"
				+ "?$select=BusinessPartnerID,CompanyName", {
				BusinessPartnerID : "0100000000",
				CompanyName : "SAP AG"
			})
			.expectChange("company", "SAP AG");

		return this.createView(assert, sView, oModel).then(function () {

			that.expectRequest("BusinessPartnerList('0100000000')"
					+ "?$select=BusinessPartnerID,CompanyName", {
					BusinessPartnerID : "0100000000",
					CompanyName : "SAP SE"
				})
				.expectChange("company", "SAP SE");

			that.oModel.refresh("update");

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Refresh using a group with submit mode 'API'. The model contains one list binding
	// without a control. Hence getContexts() is not called and no request is triggered. But the
	// lock must be released.
	QUnit.test("ODLB: delayed refresh", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="note" text="{Note}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=100", {
				value : [{
					Note : "Note",
					SalesOrderID : "0500000000"
				}]
			})
			.expectChange("note", ["Note"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.oModel.bindList("/BusinessPartnerList"); // a list binding w/ no control behind

			that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=100", {
					value : [{
						Note : "Note updated",
						SalesOrderID : "0500000000"
					}]
				})
				.expectChange("note", ["Note updated"]);

			that.oModel.refresh("update");

			return Promise.all([
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: change the filter on a list binding with submit group 'API' and immediately call
	// submitBatch. The resulting GET request becomes asynchronous because it requires additional
	// metadata. Check that the request is sent with this batch nevertheless.
	// In a second step call filter on a list binding w/o control. Verify that the queue does not
	// remain blocked, although there is no getContexts and no GET request.
	QUnit.test("ODLB: delayed filter", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/Equipments\', parameters : {$$groupId : \'api\'}}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("name", []);

		return this.createView(assert, sView).then(function () {

			that.expectRequest("Equipments?$skip=0&$top=100", {
					value : [{
						Category : "1",
						ID : "2",
						Name : "Foo"
					}]
				})
				.expectChange("name", ["Foo"]);

			return Promise.all([
				that.oModel.submitBatch("api"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Equipments?"
					+ "$filter=EQUIPMENT_2_PRODUCT/ID eq 42&$skip=0&$top=100", {
					value : [{Name : "Bar"}]
				})
				.expectChange("name", ["Bar"]);

			that.oView.byId("table").getBinding("items")
				.filter(new Filter("EQUIPMENT_2_PRODUCT/ID", "EQ", 42));

			return Promise.all([
				that.oModel.submitBatch("api"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oListBinding = that.oModel.bindList("/Equipments", undefined, undefined, undefined,
					{$$groupId : 'api'});

			that.expectRequest("Equipments?$skip=0&$top=100", {
					value : [{Name : "Foo"}]
				})
				// The field is reset first, because the filter request is delayed until the next
				// prerendering task
				.ignoreNullChanges("name")
				.expectChange("name", ["Foo"]);

			// This binding has no control -> no request, but timeout of group lock expected
			oListBinding.filter(new Filter("Name", "GT", "M"));
			that.oView.byId("table").getBinding("items").filter(null);

			return Promise.all([
				that.oModel.submitBatch("api"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: sap.ui.table.Table with VisibleRowCountMode="Auto" and submit group 'API'
	// In the first step resume and immediately call submitBatch.
	// In the second step synchronously refresh with another group ID, change the filter and call
	// submitBatch. Check that the filter request is sent with this batch nevertheless.
	// Two issues have to be solved: the lock for the filter must win over the one for refresh and
	// the lock must not be removed again before the table becomes active.
	//
	//TODO enable this test again once the following issue is fixed: table calls ODLB#getContexts
	// while binding is still suspended, which is currently forbidden
	//ODataListBinding.getContexts (ODataListBinding.js?eval:1004)
	//Table._getContexts (Table.js?eval:2154)
	//Table._getRowContexts (Table.js?eval:2233)
	//Table._updateRows (Table.js?eval:3511)
	//Table._updateTableSizes (Table.js?eval:1503)
	//Promise.then (async)
	//Table.onAfterRendering (Table.js?eval:1402)
	QUnit.skip("ODLB: resume/refresh/filter w/ submitBatch on a table.Table", function (assert) {
		var oListBinding,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<t:Table id="table" visibleRowCountMode="Auto"\
		rows="{path : \'/Equipments\', parameters : {$$groupId : \'api\'}, suspended : true}">\
	<t:Column>\
		<t:label>\
			<Label text="Name"/>\
		</t:label>\
		<t:template>\
			<Text id="name" text="{Name}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectChange("name", []);

		return this.createView(assert, sView, oModel).then(function () {
			oListBinding = that.oView.byId("table").getBinding("rows");

			that.expectRequest("Equipments?$select=Category,ID,Name&$skip=0&$top=105", {
					value : [{
						Category : "1",
						ID : "2",
						Name : "Foo"
					}]
				})
				.expectChange("name", ["Foo"]);

			oListBinding.resume();

			return Promise.all([
				that.oModel.submitBatch("api"),
				that.waitForChanges(assert)
			]);
		}).then(function () {

			that.expectRequest("Equipments?$select=Category,ID,Name"
					+ "&$filter=EQUIPMENT_2_PRODUCT/ID eq 42&$skip=0&$top=105", {
					value : [{
						Category : "1",
						ID : "2",
						Name : "Bar"
					}]
				})
				.expectChange("name", ["Bar"]);

			oListBinding.refresh("foo");
			oListBinding.filter(new Filter("EQUIPMENT_2_PRODUCT/ID", "EQ", 42));

			return Promise.all([
				that.oModel.submitBatch("api"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Binding-specific parameter $$aggregation is used (CPOUI5UISERVICESV3-1195)
	//TODO support $filter : \'GrossAmount gt 0\',\
	QUnit.test("Analytics by V4: $$aggregation w/ groupLevels", function (assert) {
		var sView = '\
<t:Table id="table" rows="{path : \'/SalesOrderList\',\
		parameters : {\
			$$aggregation : {\
				aggregate : {\
					GrossAmount : {subtotals : true},\
					NetAmount : {}\
				},\
				group : {\
					CurrencyCode : {},\
					LifecycleStatus : {}\
				},\
				groupLevels : [\'LifecycleStatus\']\
			},\
			$orderby : \'LifecycleStatus desc,ItemPosition asc\'\
		}}" threshold="0" visibleRowCount="3">\
	<t:Column>\
		<t:template>\
			<Text id="isExpanded" text="{= %{@$ui5.node.isExpanded} }" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="isTotal" text="{= %{@$ui5.node.isTotal} }" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="level" text="{= %{@$ui5.node.level} }" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="lifecycleStatus" text="{LifecycleStatus}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="grossAmount" text="{= %{GrossAmount}}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			oModel = createSalesOrdersModel(),
			that = this;

		this.expectRequest("SalesOrderList?$apply=groupby((LifecycleStatus),aggregate(GrossAmount))"
				+ "/orderby(LifecycleStatus desc)&$count=true&$skip=0&$top=3", {
				"@odata.count" : "26",
				value : [
					{GrossAmount : 1, LifecycleStatus : "Z"},
					{GrossAmount : 2, LifecycleStatus : "Y"},
					{GrossAmount : 3, LifecycleStatus : "X"}
				]
			})
			.expectChange("isExpanded", [false, false, false])
			.expectChange("isTotal", [true, true, true])
			.expectChange("level", [1, 1, 1])
			.expectChange("grossAmount", [1, 2, 3])
			.expectChange("lifecycleStatus", ["Z", "Y", "X"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oTable = that.oView.byId("table"),
				oListBinding = oTable.getBinding("rows");

			oListBinding.getCurrentContexts().forEach(function (oContext, i) {
				assert.strictEqual(oContext.getPath(),
					"/SalesOrderList(LifecycleStatus='" + "ZYX"[i] + "')");
			});

			that.expectRequest("SalesOrderList?"
					+ "$apply=groupby((LifecycleStatus),aggregate(GrossAmount))"
					+ "/orderby(LifecycleStatus desc)&$count=true&$skip=7&$top=3", {
					"@odata.count" : "26",
					value : [
						{GrossAmount : 7, LifecycleStatus : "T"},
						{GrossAmount : 8, LifecycleStatus : "S"},
						{GrossAmount : 9, LifecycleStatus : "R"}
					]
				});
			for (var i = 0; i < 3; i += 1) {
				that.expectChange("isExpanded", undefined, null)
					.expectChange("isTotal", undefined, null)
					.expectChange("level", undefined, null)
					.expectChange("grossAmount", undefined, null)
					.expectChange("lifecycleStatus", null, null);
			}
			that.expectChange("isExpanded", [,,,,,,, false, false, false])
				.expectChange("isTotal", [,,,,,,, true, true, true])
				.expectChange("level", [,,,,,,, 1, 1, 1])
				.expectChange("grossAmount", [,,,,,,, 7, 8, 9])
				.expectChange("lifecycleStatus", [,,,,,,, "T", "S", "R"]);

			that.oView.byId("table").setFirstVisibleRow(7);

			return that.waitForChanges(assert).then(function () {
				that.expectRequest("SalesOrderList?$apply=groupby((LifecycleStatus))"
						+ "/orderby(LifecycleStatus desc)&$count=true&$skip=7&$top=3", {
						"@odata.count" : "26",
						value : [
							{LifecycleStatus : "T"},
							{LifecycleStatus : "S"},
							{LifecycleStatus : "R"}
						]
					})
					.expectChange("isExpanded", [,,,,,,, false, false, false])
					.expectChange("isTotal", [,,,,,,, true, true, true])
					.expectChange("level", [,,,,,,, 1, 1, 1])
					.expectChange("lifecycleStatus", [,,,,,,, "T", "S", "R"]);

				oTable.removeColumn(4).destroy(); // GrossAmount
				oListBinding.setAggregation({groupLevels : ["LifecycleStatus"]});

				return that.waitForChanges(assert).then(function () {
					assert.throws(function () {
						oListBinding.changeParameters({$apply : "groupby((LifecycleStatus))"});
					}, new Error("Cannot combine $$aggregation and $apply"));
					assert.throws(function () {
						oListBinding.setAggregation({
							aggregate : {
								GrossAmount : {grandTotal : true}
							},
							groupLevels : ["LifecycleStatus"]
						});
					}, new Error("Cannot combine visual grouping with grand total"));
					// Note: oListBinding is now in an undefined state, do not use anymore!
				});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Binding-specific parameter $$aggregation is used; no visual grouping,
	// but a grand total row (CPOUI5UISERVICESV3-1418) which is fixed at the top; first visible
	// row starts at 1 and then we scroll up; headerContext>$count is also used
	[false, true].forEach(function (bCount) {
		var sTitle = "Analytics by V4: $$aggregation grandTotal w/o groupLevels; $count : "
				+ bCount;

		QUnit.test(sTitle, function (assert) {
			var sBasicPath
					= "BusinessPartners?$apply=groupby((Country,Region),aggregate(SalesNumber))"
					+ "/filter(SalesNumber%20gt%200)/orderby(Region%20desc)",
				oGrandTotalRow = {
					SalesNumber : 351,
					"SalesNumber@odata.type" : "#Decimal"
				},
				oListBinding,
				oTable,
				sView = '\
<Text id="count" text="{$count}"/>\
<t:Table fixedRowCount="1" firstVisibleRow="1" id="table" rows="{path : \'/BusinessPartners\',\
		parameters : {\
			$$aggregation : {\
				aggregate : {\
					SalesNumber : {grandTotal : true}\
				},\
				group : {\
					Country : {},\
					Region : {}\
				}\
			},\
			$count : ' + bCount + ',\
			$filter : \'SalesNumber gt 0\',\
			$orderby : \'Region desc\'\
		}}" threshold="0" visibleRowCount="5">\
	<t:Column>\
		<t:template>\
			<Text id="country" text="{Country}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="region" text="{Region}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="salesNumber" text="{SalesNumber}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
				that = this;

			if (bCount) {
				oGrandTotalRow["UI5__count"] =  "26";
				oGrandTotalRow["UI5__count@odata.type"] = "#Decimal";
			}
			this.expectRequest(sBasicPath + "/concat(aggregate(SalesNumber"
					+ (bCount ? ",$count as UI5__count" : "") + "),top(0))", {
					value : [oGrandTotalRow]
				})
				.expectRequest(sBasicPath + "/skip(1)/top(4)", {
					value : [
						{Country : "b", Region : "Y", SalesNumber : 2},
						{Country : "c", Region : "X", SalesNumber : 3},
						{Country : "d", Region : "W", SalesNumber : 4},
						{Country : "e", Region : "V", SalesNumber : 5}
					]
				})
				.expectChange("count")
				.expectChange("country", ["",, "b", "c", "d", "e"])
				.expectChange("region", ["",, "Y", "X", "W", "V"])
				.expectChange("salesNumber", ["351",, "2", "3", "4", "5"]);

			return this.createView(assert, sView, createBusinessPartnerTestModel())
			.then(function () {
				oTable = that.oView.byId("table");
				oListBinding = oTable.getBinding("rows");

				if (bCount) {
					assert.strictEqual(oListBinding.isLengthFinal(), true, "length is final");
					assert.strictEqual(oListBinding.getLength(), 27,
						"length includes grand total row");

					// Note: header context gives count of leaves (w/o grand total)
					that.expectChange("count", "26");
				} else {
					assert.strictEqual(oListBinding.isLengthFinal(), false, "length unknown");
					assert.strictEqual(oListBinding.getLength(), 1 + 5 + 10, "estimated length");

					that.oLogMock.expects("error").withExactArgs(
						"Failed to drill-down into $count, invalid segment: $count",
						// Note: toString() shows realistic (first) request w/o skip/top
						"/serviceroot.svc/" + sBasicPath + "/concat(aggregate(SalesNumber"
							+ (bCount ? ",$count%20as%20UI5__count" : "") + "),identity)",
						"sap.ui.model.odata.v4.lib._Cache");
				}

				that.oView.byId("count").setBindingContext(oListBinding.getHeaderContext());

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectRequest(sBasicPath + "/top(1)", {
						value : [
							{Country : "a", Region : "Z", SalesNumber : 1}
						]
					})
					.expectChange("country", null, null)
					.expectChange("region", null, null)
					.expectChange("salesNumber", null, null)
					.expectChange("country", [, "a", "b", "c", "d"])
					.expectChange("region", [, "Z", "Y", "X", "W"])
					.expectChange("salesNumber", [, "1", "2", "3", "4"]);

				oTable.setFirstVisibleRow(0);

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Binding-specific parameter $$aggregation is used; no visual grouping,
	// but a grand total row (CPOUI5UISERVICESV3-1418) which is not fixed at the top; first visible
	// row starts at 1 and then we scroll up; headerContext>$count is also used
	[false, true].forEach(function (bCount) {
		var sTitle = "Analytics by V4: $$aggregation grandTotal w/o groupLevels; $count : "
				+ bCount + "; grandTotal row not fixed";

		QUnit.test(sTitle, function (assert) {
			var sBasicPath
					= "BusinessPartners?$apply=groupby((Country,Region),aggregate(SalesNumber))"
					+ "/filter(SalesNumber%20gt%200)/orderby(Region%20desc)",
				oListBinding,
				oTable,
				aValues = [
					{Country : "a", Region : "Z", SalesNumber : 1},
					{Country : "b", Region : "Y", SalesNumber : 2},
					{Country : "c", Region : "X", SalesNumber : 3},
					{Country : "d", Region : "W", SalesNumber : 4},
					{Country : "e", Region : "V", SalesNumber : 5}
				],
				sView = '\
<Text id="count" text="{$count}"/>\
<t:Table fixedRowCount="0" firstVisibleRow="1" id="table" rows="{path : \'/BusinessPartners\',\
		parameters : {\
			$$aggregation : {\
				aggregate : {\
					SalesNumber : {grandTotal : true}\
				},\
				group : {\
					Country : {},\
					Region : {}\
				}\
			},\
			$count : ' + bCount + ',\
			$filter : \'SalesNumber gt 0\',\
			$orderby : \'Region desc\'\
		}}" threshold="0" visibleRowCount="5">\
	<t:Column>\
		<t:template>\
			<Text id="country" text="{Country}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="region" text="{Region}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="salesNumber" text="{SalesNumber}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
				that = this;

			if (bCount) {
				aValues.unshift({UI5__count : "26", "UI5__count@odata.type" : "#Decimal"});
			}
			this.expectRequest(
					sBasicPath + (bCount
						? "/concat(aggregate($count as UI5__count),top(5))"
						: "/top(5)"),
					{value : aValues})
				.expectChange("count")
				.expectChange("country", [, "a", "b", "c", "d", "e"])
				.expectChange("region", [, "Z", "Y", "X", "W", "V"])
				.expectChange("salesNumber", [, "1", "2", "3", "4", "5"]);

			return this.createView(assert, sView, createBusinessPartnerTestModel())
			.then(function () {
				oTable = that.oView.byId("table");
				oListBinding = oTable.getBinding("rows");

				if (bCount) {
					assert.strictEqual(oListBinding.isLengthFinal(), true, "length is final");
					assert.strictEqual(oListBinding.getLength(), 27,
						"length includes grand total row");

					// Note: header context gives count of leaves (w/o grand total)
					that.expectChange("count", "26");
				} else {
					assert.strictEqual(oListBinding.isLengthFinal(), false, "length unknown");
					assert.strictEqual(oListBinding.getLength(), 1 + 5 + 10, "estimated length");

					that.oLogMock.expects("error").withExactArgs(
						"Failed to drill-down into $count, invalid segment: $count",
						// Note: toString() shows realistic (first) request w/o skip/top
						"/serviceroot.svc/" + sBasicPath + "/concat(aggregate(SalesNumber"
							+ (bCount ? ",$count%20as%20UI5__count" : "") + "),identity)",
						"sap.ui.model.odata.v4.lib._Cache");
				}

				that.oView.byId("count").setBindingContext(oListBinding.getHeaderContext());

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectRequest(sBasicPath + "/concat(aggregate(SalesNumber),top(0))", {
						value : [{
							SalesNumber : 351,
							"SalesNumber@odata.type" : "#Decimal"
						}]
					})
					.expectChange("country", null, null)
					.expectChange("region", null, null)
					.expectChange("salesNumber", null, null)
					.expectChange("country", ["", "a", "b", "c", "d"])
					.expectChange("region", ["", "Z", "Y", "X", "W"])
					.expectChange("salesNumber", ["351", "1", "2", "3", "4"]);

				oTable.setFirstVisibleRow(0);

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Binding-specific parameter $$aggregation is used; no visual grouping,
	// but a grand total row using with/as (CPOUI5UISERVICESV3-1418)
	QUnit.test("Analytics by V4: $$aggregation grandTotal w/o groupLevels using with/as",
			function (assert) {
		var sView = '\
<t:Table rows="{path : \'/BusinessPartners\',\
		parameters : {\
			$$aggregation : {\
				aggregate : {\
					SalesAmountSum : {\
						grandTotal : true,\
						name : \'SalesAmount\',\
						with : \'sap.unit_sum\'\
					},\
					SalesNumber : {}\
				},\
				group : {\
					Region : {}\
				}\
			},\
			$filter : \'SalesAmountSum gt 0\',\
			$orderby : \'SalesAmountSum asc\'\
		}}" threshold="0" visibleRowCount="5">\
	<t:Column>\
		<t:template>\
			<Text id="region" text="{Region}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="salesNumber" text="{SalesNumber}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="salesAmountSum" text="{= %{SalesAmountSum} }" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="salesAmountCurrency"\
				text="{= %{SalesAmountSum@Analytics.AggregatedAmountCurrency} }" />\
		</t:template>\
	</t:Column>\
</t:Table>';

		this.expectRequest("BusinessPartners?$apply=groupby((Region)"
				+ ",aggregate(SalesAmount with sap.unit_sum as SalesAmountSum,SalesNumber))"
				+ "/filter(SalesAmountSum gt 0)/orderby(SalesAmountSum asc)"
				+ "/concat(aggregate(SalesAmountSum with sap.unit_sum as "
				+ "UI5grand__SalesAmountSum),top(4))", {
				value : [{
						UI5grand__SalesAmountSum : 351,
						"UI5grand__SalesAmountSum@Analytics.AggregatedAmountCurrency" : "EUR",
						//TODO this should be used by auto type detection
						"UI5grand__SalesAmountSum@odata.type" : "#Decimal"
					}, {
						Region : "Z",
						SalesNumber : 1,
						SalesAmountSum : 1,
						"SalesAmountSum@Analytics.AggregatedAmountCurrency" : "EUR"
					}, {
						Region : "Y",
						SalesNumber : 2,
						SalesAmountSum : 2,
						"SalesAmountSum@Analytics.AggregatedAmountCurrency" : "EUR"
					}, {
						Region : "X",
						SalesNumber : 3,
						SalesAmountSum : 3,
						"SalesAmountSum@Analytics.AggregatedAmountCurrency" : "EUR"
					}, {
						Region : "W",
						SalesNumber : 4,
						SalesAmountSum : 4,
						"SalesAmountSum@Analytics.AggregatedAmountCurrency" : "EUR"
					}
				]
			})
			.expectChange("region", ["", "Z", "Y", "X", "W"])
			.expectChange("salesNumber", [null, "1", "2", "3", "4"])
			.expectChange("salesAmountSum", [351, 1, 2, 3, 4])
			.expectChange("salesAmountCurrency", ["EUR", "EUR", "EUR", "EUR", "EUR"]);

		return this.createView(assert, sView, createBusinessPartnerTestModel());
	});

	//*********************************************************************************************
	// Scenario: Binding-specific parameter $$aggregation is used without group or groupLevels
	// Note: usage of min/max simulates a Chart, which would actually call ODLB#updateAnalyticalInfo
	[false, true].forEach(function (bCount) {
		var sTitle = "Analytics by V4: $$aggregation, aggregate but no group; $count : " + bCount;

		QUnit.test(sTitle, function (assert) {
			var oMinMaxElement = {
					UI5min__AGE : 42,
					UI5max__AGE : 77
				},
				sView = '\
<t:Table id="table" rows="{path : \'/SalesOrderList\',\
		parameters : {\
			$$aggregation : {\
				aggregate : {\
					GrossAmount : {\
						min : true,\
						max : true\
					}\
				}\
			},\
			$count : ' + bCount + '\
		}}" threshold="0" visibleRowCount="1">\
	<t:Column>\
		<t:template>\
			<Text id="grossAmount" text="{= %{GrossAmount}}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
				oModel = createSalesOrdersModel(),
				that = this;

			if (bCount) {
				oMinMaxElement["UI5__count"] = "1";
				oMinMaxElement["UI5__count@odata.type"] = "#Decimal";
			}
			this.expectRequest("SalesOrderList?$apply=aggregate(GrossAmount)"
					+ "/concat(aggregate(GrossAmount with min as UI5min__GrossAmount,"
					+ "GrossAmount with max as UI5max__GrossAmount"
					+ (bCount ? ",$count as UI5__count" : "") + "),top(1))", {
					value : [oMinMaxElement, {GrossAmount : 1}]
				})
				.expectChange("grossAmount", 1);

			return this.createView(assert, sView, oModel).then(function () {
				var oTable = that.oView.byId("table"),
					oListBinding = oTable.getBinding("rows");

				// w/o min/max: no _AggregationCache, system query options are used
				that.expectRequest("SalesOrderList?" + (bCount ? "$count=true&" : "")
					+ "$apply=aggregate(GrossAmount)&$skip=0&$top=1", {
						"@odata.count" : "1",
						value : [{GrossAmount : 2}]
					})
					.expectChange("grossAmount", 2);

				oListBinding.setAggregation({
					aggregate : {GrossAmount : {}}
				});
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Application tries to overwrite client-side instance annotations.
	QUnit.test("@$ui5.* is write-protected", function (assert) {
		var oModel = createTeaBusiModel(),
			sView = '\
<FlexBox binding="{/MANAGERS(\'1\')}" id="form">\
	<Input id="foo" value="{= %{@$ui5.foo} }" />\
	<Text id="id" text="{ID}" />\
</FlexBox>',
			that = this;

		this.expectRequest("MANAGERS('1')", {
				"@$ui5.foo" : 42,
				ID : "1"
			})
			.expectChange("foo", 42)
			.expectChange("id", "1");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("form").getBindingContext(),
				oMatcher = sinon.match(
					"/MANAGERS('1')/@$ui5.foo: Not a (navigation) property: @$ui5.foo"),
				oPropertyBinding = that.oView.byId("foo").getBinding("value");

			assert.strictEqual(oPropertyBinding.getValue(), 42);
			that.oLogMock.expects("error")
				.withExactArgs("Not a (navigation) property: @$ui5.foo", oMatcher,
					"sap.ui.model.odata.v4.ODataMetaModel");
			that.oLogMock.expects("error")
				.withExactArgs("Failed to update path /MANAGERS('1')/@$ui5.foo", oMatcher,
					"sap.ui.model.odata.v4.ODataPropertyBinding");

			that.expectMessages([{
				code : undefined,
				descriptionUrl : undefined,
				message : "/MANAGERS('1')/@$ui5.foo: Not a (navigation) property: @$ui5.foo",
				persistent : true,
				target : "",
				technical : true,
				technicalDetails : {}, // we do NOT expect technicalDetails for JS Errors
				type : "Error"
			}]);

			// code under test
			oPropertyBinding.setValue(0);

			return that.waitForChanges(assert).then(function () {
				// code under test
				oContext.getObject()["@$ui5.foo"] = 1; // just changing a clone

				assert.strictEqual(oContext.getProperty("@$ui5.foo"), 42);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Application tries to create client-side instance annotations via ODLB#create.
	QUnit.test("@$ui5.* is write-protected for ODLB#create", function (assert) {
		var sView = '\
<Table id="table" items="{path : \'/Equipments\', parameters : {$$updateGroupId : \'never\'}}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("Equipments?$skip=0&$top=100", {
				value : [{
					ID : "2",
					Name : "Foo"
				}]
			})
			.expectChange("name", ["Foo"]);

		return this.createView(assert, sView).then(function () {
			var oContext,
				oListBinding = that.oView.byId("table").getBinding("items"),
				oInitialData = {
					ID : "99",
					Name : "Bar",
					"@$ui5.foo" : "baz"
				};

			that.expectChange("name", ["Bar", "Foo"]);

			// code under test
			oContext = oListBinding.create(oInitialData);

			// code under test
			assert.strictEqual(oContext.getProperty("@$ui5.foo"), undefined);
		});
	});

	//*********************************************************************************************
	// Scenario: Application tries to read private client-side instance annotations.
	QUnit.test("@$ui5._ is read-protected", function (assert) {
		var oModel = createTeaBusiModel(),
			sView = '\
<FlexBox binding="{/MANAGERS(\'1\')}" id="form">\
	<Text id="predicate" text="{= %{@$ui5._/predicate} }" />\
	<Text id="id" text="{ID}" />\
</FlexBox>',
			that = this;

		this.expectRequest("MANAGERS('1')", {ID : "1"})
			.expectChange("predicate", undefined) // binding itself is "code under test"
			.expectChange("id", "1");
		this.oLogMock.expects("error").withExactArgs(
				"Failed to drill-down into @$ui5._/predicate, invalid segment: @$ui5._",
				"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/MANAGERS('1')",
				"sap.ui.model.odata.v4.lib._Cache")
			.thrice(); // binding, getProperty, requestProperty

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("form").getBindingContext();

			// code under test
			assert.notOk("@$ui5._" in oContext.getObject());

			// code under test
			assert.strictEqual(oContext.getProperty("@$ui5._/predicate"), undefined);

			// code under test
			return oContext.requestProperty("@$ui5._/predicate").then(function (vResult) {
				assert.strictEqual(vResult, undefined);

				// code under test
				return oContext.requestObject().then(function (oParent) {
					assert.notOk("@$ui5._" in oParent);
				});
			});
		});
	});

	//*********************************************************************************************
	[
		// Scenario: flat list with aggregated data via $apply, can be combined with $count,
		// $filter, $orderby and system query options are still used (also for $skip, $top)
		"Flat list with aggregated data",
		// Scenario: same as before, but via ODLB#updateAnalyticalInfo; in other words:
		// a hypothetical chart w/ paging, but w/o min/max; initial $skip > 0!
		"ODLB#updateAnalyticalInfo without min/max"
	].forEach(function (sTitle, i) {
		QUnit.test(sTitle, function (assert) {
			var aAggregation = [{ // dimension
					grouped : false,
					inResult : true,
					name : "LifecycleStatus"
				}, { // measure
					name : "GrossAmount",
					total : false
				}],
				sBasicPath = "SalesOrderList?$count=true&$filter=GrossAmount lt 42"
					+ "&$orderby=LifecycleStatus desc"
					+ "&$apply=groupby((LifecycleStatus),aggregate(GrossAmount))",
				sView = '\
<Text id="count" text="{$count}"/>\
<t:Table firstVisibleRow="1" id="table" rows="{path : \'/SalesOrderList\',\
		parameters : {\
			$count : true,\
			$filter : \'GrossAmount lt 42\',\
			$orderby : \'LifecycleStatus desc\'\
' + (i === 0 ? ",$apply : 'groupby((LifecycleStatus),aggregate(GrossAmount))'" : "") + '\
		}}" threshold="0" visibleRowCount="4">\
	<t:Column>\
		<t:template>\
			<Text id="lifecycleStatus" text="{LifecycleStatus}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="grossAmount" text="{GrossAmount}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
				that = this;

			if (i > 0) {
				// for simulating Chart, call #updateAnalyticalInfo _before_ #getContexts
				this.mock(ODataListBinding.prototype)
					.expects("getContexts")
					.withExactArgs(1, 4, 0)
					.callsFake(function () {
						this.updateAnalyticalInfo(aAggregation);
						ODataListBinding.prototype.getContexts.restore();

						return this.getContexts.apply(this, arguments);
					});
			}
			this.expectRequest(sBasicPath + "&$skip=1&$top=4", {
					"@odata.count" : "26",
					value : [
						{GrossAmount : 2, LifecycleStatus : "Y"},
						{GrossAmount : 3, LifecycleStatus : "X"},
						{GrossAmount : 4, LifecycleStatus : "W"},
						{GrossAmount : 5, LifecycleStatus : "V"}
					]
				})
				.expectChange("count")
				.expectChange("grossAmount", [, "2.00", "3.00", "4.00", "5.00"])
				.expectChange("lifecycleStatus", [, "Y", "X", "W", "V"]);

			return this.createView(assert, sView, createSalesOrdersModel()).then(function () {
				that.expectChange("count", "26");

				that.oView.byId("count").setBindingContext(
					that.oView.byId("table").getBinding("rows").getHeaderContext());

				return that.waitForChanges(assert);
			}).then(function () {
				// no additional request for same aggregation data
				that.oView.byId("table").getBinding("rows").updateAnalyticalInfo(aAggregation);

				return that.waitForChanges(assert);
			}).then(function () {
				that.expectRequest(sBasicPath + "&$skip=0&$top=1", {
						"@odata.count" : "26",
						value : [{
							GrossAmount : 1,
							LifecycleStatus : "Z"
						}]
					});
				that.expectChange("grossAmount", null, null)
					.expectChange("lifecycleStatus", null, null);
				that.expectChange("grossAmount", ["1.00", "2.00", "3.00", "4.00"])
					.expectChange("lifecycleStatus", ["Z", "Y", "X", "W"]);

				that.oView.byId("table").setFirstVisibleRow(0);

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Simulate a chart that requests minimum and maximum values for a measure via
	// #updateAnalyticalInfo; initial $skip > 0!
	//
	//TODO this should work the same for an initially suspended binding where #updateAnalyticalInfo
	// is called before #resume, see CPOUI5UISERVICESV3-1754 (PS2 of the change contains that test);
	// currently sap.ui.table.Table interferes with suspend/resume, see skipped test
	// "ODLB: resume/refresh/filter w/ submitBatch on a table.Table"
	QUnit.test("ODLB#updateAnalyticalInfo with min/max", function (assert) {
		var aAggregation = [{ // dimension
				grouped : false,
				inResult : true,
				name : "Name"
			}, { // measure
				max : true,
				min : true,
				name : "AGE",
				total : false
			}],
			oMeasureRangePromise,
			sView = '\
<Text id="count" text="{$count}"/>\
<t:Table firstVisibleRow="1" id="table" rows="{\
			path : \'/EMPLOYEES\',\
			parameters : {$count : true},\
			filters : {path : \'AGE\', operator : \'GE\', value1 : 30},\
			sorter : {path : \'AGE\'}\
		}" threshold="0" visibleRowCount="3">\
	<t:Column>\
		<t:template>\
			<Text id="text" text="{Name}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="age" text="{AGE}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		// for simulating Chart, call #updateAnalyticalInfo _before_ #getContexts
		this.mock(ODataListBinding.prototype)
			.expects("getContexts")
			.withExactArgs(1, 3, 0)
			.callsFake(function () {
				oMeasureRangePromise = this.updateAnalyticalInfo(aAggregation)
					.measureRangePromise.then(function (mMeasureRange) {
						assert.deepEqual(mMeasureRange, {
							AGE : {
								max : 77,
								min : 42
							}
						});
					});
				ODataListBinding.prototype.getContexts.restore();

				return this.getContexts.apply(this, arguments);
			});
		this.expectRequest("EMPLOYEES?$apply=groupby((Name),aggregate(AGE))"
				+ "/filter(AGE ge 30)/orderby(AGE)"
				+ "/concat(aggregate(AGE with min as UI5min__AGE,"
				+ "AGE with max as UI5max__AGE,$count as UI5__count)"
				+ ",skip(1)/top(3))", {
				value : [{
						// the server response may contain additional data for example @odata.id or
						// type information "UI5min__AGE@odata.type" : "#Int16"
						"@odata.id" : null,
						"UI5min__AGE@odata.type" : "#Int16",
						UI5min__AGE : 42,
						UI5max__AGE : 77,
						UI5__count : "4",
						"UI5__count@odata.type" : "#Decimal"
					},
					{ID : "1", Name : "Jonathan Smith", AGE : 50},
					{ID : "0", Name : "Frederic Fall", AGE : 70},
					{ID : "2", Name : "Peter Burke", AGE : 77}
				]
			})
			.expectChange("count")
			.expectChange("text", [, "Jonathan Smith", "Frederic Fall", "Peter Burke"])
			.expectChange("age", [, "50", "70", "77"]);

		return this.createView(assert, sView).then(function () {
			that.expectChange("count", "4");

			that.oView.byId("count").setBindingContext(
				that.oView.byId("table").getBinding("rows").getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			// no additional request for same aggregation data
			that.oView.byId("table").getBinding("rows").updateAnalyticalInfo(aAggregation);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("EMPLOYEES?$apply=groupby((Name),aggregate(AGE))"
					// Note: for consistency, we prefer filter() over $filter here
					// (same for orderby() vs. $orderby and skip/top)
					+ "/filter(AGE ge 30)/orderby(AGE)/top(1)", {
					value : [{
						ID : "3",
						Name : "John Field",
						AGE : 42
					}]
				})
				.expectChange("text", null, null)
				.expectChange("age", null, null)
				.expectChange("text", ["John Field", "Jonathan Smith", "Frederic Fall"])
				.expectChange("age", ["42", "50", "70"]);

			that.oView.byId("table").setFirstVisibleRow(0);

			return that.waitForChanges(assert);
		}).then(function () {
			return oMeasureRangePromise; // no child left behind :-)
		});
	});

	//*********************************************************************************************
	// Scenario: Simulate a chart that requests minimum and maximum values for a measure via
	// #updateAnalyticalInfo on a suspended binding
	// JIRA: CPOUI5UISERVICESV3-1754
	QUnit.test("ODLB#updateAnalyticalInfo with min/max while suspended", function (assert) {
		var aAggregation = [{ // dimension
				grouped : false,
				inResult : true,
				name : "Name"
			}, { // measure
				max : true,
				min : true,
				name : "AGE",
				total : false
			}],
			sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', suspended : true}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
		<Text id="age" text="{AGE}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("text", [])
			.expectChange("age", []);

		return this.createView(assert, sView).then(function () {
			var oListBinding = that.oView.byId("table").getBinding("items"),
				oMeasureRangePromise;

			that.expectRequest("EMPLOYEES?$apply=groupby((Name),aggregate(AGE))"
					+ "/concat(aggregate(AGE with min as UI5min__AGE,AGE with max as UI5max__AGE)"
					+ ",top(100))", {
					value : [{
							// the server response may contain additional data for example
							// @odata.id or type information "UI5min__AGE@odata.type" : "#Int16"
							"@odata.id" : null,
							"UI5min__AGE@odata.type" : "#Int16",
							UI5min__AGE : 42,
							UI5max__AGE : 77
						},
						{ID : "1", Name : "Jonathan Smith", AGE : 50},
						{ID : "0", Name : "Frederic Fall", AGE : 70},
						{ID : "2", Name : "Peter Burke", AGE : 77}
					]
				})
				.expectChange("text", ["Jonathan Smith", "Frederic Fall", "Peter Burke"])
				.expectChange("age", ["50", "70", "77"]);

			// code under test
			oMeasureRangePromise
				= oListBinding.updateAnalyticalInfo(aAggregation).measureRangePromise;

			// code under test
			oListBinding.resume();

			return Promise.all([oMeasureRangePromise, that.waitForChanges(assert)]);
		}).then(function (aResults) {
			var mMeasureRange = aResults[0];

			assert.deepEqual(mMeasureRange, {
				AGE : {
					max : 77,
					min : 42
				}
			});
		});
	});

	//*********************************************************************************************
	// Scenario: bindElement is called twice for the items aggregation of a sap.m.Table.
	// ManagedObject#bindObject (which is the same as #bindElement) first unbinds and then binds
	// the element again if an element binding exists. The second bindElement on "unbind" calls
	// ODLB#getContexts which must reset the previous data needed for ECD so that the diff is
	// properly computed.
	// BCP 1870081505
	QUnit.test("bindElement called twice on table", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oTable,
			// Note: table must be "growing" otherwise it does not use ECD
			sView = '\
<Table id="table" items="{TEAM_2_EMPLOYEES}" growing="true">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("name", []);

		return this.createView(assert, sView, oModel).then(function () {
			// Here it is essential that createView renders the table, as
			// GrowingEnablement#updateItems only performs ECD if the associated control's method
			// getItemsContainerDomRef returns a truthy value
			oTable = that.oView.byId("table");
			that.expectRequest("TEAMS('TEAM_01')?$select=Team_Id"
					+ "&$expand=TEAM_2_EMPLOYEES($select=ID,Name)", {
					Team_Id : "TEAM_01",
					TEAM_2_EMPLOYEES : [{
						ID : "3",
						Name : "Jonathan Smith"
					}]
				})
				.expectChange("name", ["Jonathan Smith"]);

			// code under test
			oTable.bindElement("/TEAMS('TEAM_01')");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('TEAM_01')?$select=Team_Id"
					+ "&$expand=TEAM_2_EMPLOYEES($select=ID,Name)", {
					Team_Id : "TEAM_01",
					TEAM_2_EMPLOYEES : [{
						ID : "3",
						Name : "Jonathan Smith"
					}]
				})
				.expectChange("name", ["Jonathan Smith"]);

			// code under test
			oTable.bindElement("/TEAMS('TEAM_01')");

			return that.waitForChanges(assert);
		}).then(function () {
			assert.strictEqual(oTable.getItems().length, 1, "The one entry is still displayed");
		});
	});

	//*********************************************************************************************
	// Scenario: Update a property via a control and check that the control contains the value
	// afterwards. Reason: ManagedObject#updateModelProperty fetches the updated model value and
	// sets it in the control after setting it in the model. ODataPropertyBinding#setValue must not
	// become asynchronous in this case; otherwise the control gets the old value.
	//
	// We need two text fields: The one used to observe change events cannot be used for setText
	// because our test framework attaches a formatter.
	QUnit.test("Update model property via control", function (assert) {
		var oModel = createTeaBusiModel(),
			sView = '\
<FlexBox binding="{/TEAMS(\'1\')}" id="form">\
	<Text id="Team_Id" text="{Team_Id}" />\
	<Text id="Name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('1')", {
				Team_Id : "1",
				Name : "Old Name"
			})
			.expectChange("Team_Id", "1");

		return this.createView(assert, sView, oModel).then(function () {
			var oText = that.oView.byId("Name");

			that.expectRequest({
					method : "PATCH",
					url : "TEAMS('1')",
					payload : {Name : "New Name"}
				}, {
					Team_Id : "1",
					Name : "New Name"
				});

			oText.setText("New Name");
			assert.strictEqual(oText.getText(), "New Name");
		});
	});

	//*********************************************************************************************
	// Scenario: Object page bound to active entity: Call the "Edit" bound action on an active
	// entity which responds with the inactive entity. The execute for the "Edit" operation binding
	// resolves with the context for the inactive entity. Data for the inactive entity is displayed
	// when setting this context on the object page. It can be edited and side effects can be
	// requested. The controls on the object page bound to the return value context are cleared when
	// the return value context is destroyed by e.g. resetting the context of the operation binding.
	// The second test uses a bound function instead of an action to check that the different
	// access to the cache also works.
	[{
		operation : "EditAction",
		method : "POST"
	}, {
		operation : "GetDraft",
		method : "GET"
	}].forEach(function (oFixture, i) {
		QUnit.test("bound operation: execute resolves with V4 context, " + i, function (assert) {
			var oModel = createSpecialCasesModel({autoExpandSelect : true}),
				oOperation,
				sRequestPath = "Artists(ArtistID='42',IsActiveEntity=true)/special.cases."
					+ oFixture.operation + (oFixture.method === "GET" ? "()" : ""),
				sView = '\
<FlexBox id="objectPage">\
	<Text id="city" text="{Address/City}" />\
	<Text id="id" text="{ArtistID}" />\
	<Text id="isActive" text="{IsActiveEntity}" />\
	<Input id="name" value="{Name}" />\
</FlexBox>',
				that = this;

			this.expectChange("city")
				.expectChange("id")
				.expectChange("isActive")
				.expectChange("name");

			return this.createView(assert, sView, oModel).then(function () {
				that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?"
						+ "$select=Address/City,ArtistID,IsActiveEntity,Name", {
						Address : {City : "Liverpool"},
						ArtistID : "42",
						IsActiveEntity : true,
						Name : "Hour Frustrated"
					})
					.expectChange("city", "Liverpool")
					.expectChange("id", "42")
					.expectChange("isActive", "Yes")
					.expectChange("name", "Hour Frustrated");

				that.oView.setBindingContext(
					oModel.bindContext("/Artists(ArtistID='42',IsActiveEntity=true)")
						.getBoundContext());

				return that.waitForChanges(assert);
			}).then(function () {
				oOperation = that.oModel.bindContext("special.cases." + oFixture.operation
					+ "(...)", that.oView.getBindingContext(), {
						$select : "Address/City,ArtistID,IsActiveEntity,Name,Messages"
					});

				that.expectRequest({
					method : oFixture.method,
					url : sRequestPath
						+ "?$select=Address/City,ArtistID,IsActiveEntity,Messages,Name",
					payload : oFixture.method === "GET" ? undefined : {}
				}, {
					Address : {City : "Liverpool"},
					ArtistID : "42",
					IsActiveEntity : false,
					Name : "Hour Frustrated",
					Messages : [{
						code : "23",
						message : "Just A Message",
						numericSeverity : 1,
						transition : true,
						target : "Name"
					}]
				}).expectMessages([{
					code : "23",
					message : "Just A Message",
					target : "/Artists(ArtistID='42',IsActiveEntity=false)/Name",
					persistent : true,
					type : "Success"
				}]);

				// code under test
				return Promise.all([
					oOperation.execute(),
					that.waitForChanges(assert)
				]);
			}).then(function (aPromiseResults) {
				var oInactiveArtistContext = aPromiseResults[0];

				that.expectChange("isActive", "No");

				that.oView.byId("objectPage").setBindingContext(oInactiveArtistContext);

				return that.waitForChanges(assert);
			}).then(function () {
				return that.checkValueState(assert, "name", "Success", "Just A Message");
			}).then(function () {
				that.expectRequest({
						method : "PATCH",
						url : "Artists(ArtistID='42',IsActiveEntity=false)",
						headers : {},
						payload : {Name : "foo"}
					}, {Name : "foo"})
					.expectChange("name", "foo");

				// code under test: editing values is possible on the returned entity
				that.oView.byId("name").getBinding("value").setValue("foo");

				return that.waitForChanges(assert);
			}).then(function () {
				var oInactiveArtistContext = that.oView.byId("objectPage").getBindingContext();

				that.expectRequest("Artists(ArtistID='42',IsActiveEntity=false)"
						+ "?$select=Address/City,Name", {
						Address : {City : "London"},
						Name : "bar" // unrealistic side effect
					})
					.expectChange("city", "London")
					.expectChange("name", "bar");

				return Promise.all([
					// code under test
					oInactiveArtistContext.requestSideEffects([{
						$PropertyPath : "Address/City"
					}, {
						$PropertyPath : "Name"
					}]),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				that.expectChange("city", null)
					.expectChange("id", null)
					.expectChange("isActive", null)
					.expectChange("name", null);

				// code under test: destroy return value context
				oOperation.setContext(undefined);

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Object page bound to active entity: Call the "Edit" bound action on an active
	// entity which responds with the inactive entity. The execute for the "Edit" operation binding
	// resolves with the context for the inactive entity. Data for the inactive entity is displayed
	// when setting this context on the object page. Then call the "Activate" bound action to switch
	// back to the active entity. The actions are part of the form.
	// CPOUI5UISERVICESV3-1712
	QUnit.test("bound operation: switching between active and inactive entity", function (assert) {
		var oHiddenBinding, // to be kept in the controller
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			mNames = {
				23 : "The Rolling Stones",
				42 : "The Beatles"
			},
			mPrices = {
				23 : "12.99",
				42 : "9.99"
			},
			oObjectPage,
			sView = '\
<Table id="table" items="{path : \'/Artists\', parameters : {$filter : \'IsActiveEntity\'}}">\
	<ColumnListItem>\
		<Text id="listId" text="{ArtistID}"/>\
	</ColumnListItem>\
</Table>\
<FlexBox id="objectPage" binding="{}">\
	<Text id="id" text="{ArtistID}" />\
	<Text id="isActive" text="{IsActiveEntity}" />\
	<Input id="name" value="{Name}" />\
	<Table items="{path : \'_Publication\', parameters : {$$ownRequest : true}}">\
		<ColumnListItem>\
			<Input id="price" value="{Price}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		function expectArtistRequest(sId, bIsActive) {
			that.expectRequest("Artists(ArtistID='" + sId + "',IsActiveEntity=" + bIsActive
				+ ")?$select=ArtistID,IsActiveEntity,Name", {
					ArtistID : sId,
					IsActiveEntity : bIsActive,
					Name : mNames[sId]
				})
				.expectChange("id", sId)
				.expectChange("isActive", bIsActive ? "Yes" : "No")
				.expectChange("name", mNames[sId]);
		}

		function expectPublicationRequest(sId, bIsActive) {
			that.expectRequest("Artists(ArtistID='" + sId + "',IsActiveEntity=" + bIsActive
				+ ")/_Publication?$select=Price,PublicationID&$skip=0&$top=100", {
					value : [{
						Price : mPrices[sId],
						PublicationID : "42-0"
					}]
				})
				.expectChange("price", [mPrices[sId]]);
		}

		/*
		 * Fires the given action on the given entity, set the object page to its return value
		 * context and wait for the expected changes.
		 *
		 * @param {string} sAction - The name of the action
		 * @param {string} sId - The artist ID
		 * @param {string} [sName] - The resulting artist's name if it differs from the default
		 * @returns {Promise} - A promise that waits for the expected changes
 		 */
		function action(sAction, sId, sName) {
			var bIsActive = sAction === "ActivationAction", // The resulting artist's bIsActive
				// TODO The object page's parent context may be the return value context of the
				//   previous operation. By using it as parent for the new operation we build a long
				//   chain of bindings that we never release as long as we switch between draft and
				//   active entity. -> CPOUI5UISERVICESV3-1746
				oEntityContext = oObjectPage.getObjectBinding().getContext(),
				oAction = that.oModel.bindContext("special.cases." + sAction + "(...)",
					oEntityContext, {$$inheritExpandSelect : true});

			that.expectRequest({
					method : "POST",
					url : "Artists(ArtistID='" + sId + "',IsActiveEntity=" + !bIsActive
						+ ")/special.cases." + sAction + "?$select=ArtistID,IsActiveEntity,Name",
					payload : {}
				}, {
					ArtistID : sId,
					IsActiveEntity : bIsActive,
					Name : sName || mNames[sId]
				});

			// code under test
			return Promise.all([
				oAction.execute(),
				that.waitForChanges(assert)
			]).then(function (aPromiseResults) {
				var oReturnValueContext = aPromiseResults[0];

				that.expectChange("isActive", bIsActive ? "Yes" : "No");
				expectPublicationRequest(sId, bIsActive);

				return bindObjectPage(oReturnValueContext, true);
			});
		}

		/*
		 * Binds the object page. A return value context directly becomes the binding context of the
		 * object page. Everything else becomes the parent context of the hidden binding, which
		 * itself becomes the parent binding of the object page.
		 *
		 * @param {string|sap.ui.model.odata.v4.Context} vSource
		 *   The source, either a path or a list context or a return value context
		 * @param {boolean} bIsReturnValueContext
		 *   Whether vSource is a return value context
		 * @returns {Promise}
		 *   A promise that waits for the expected changes
		 */
		function bindObjectPage(vSource, bIsReturnValueContext) {
			var oInnerContext,
				oOuterContext;

			if (bIsReturnValueContext) {
				oInnerContext = vSource;
			} else {
				oOuterContext = typeof vSource === "string"
					? that.oModel.createBindingContext(vSource)
					: vSource;
				oHiddenBinding.setContext(oOuterContext);
				oInnerContext = oHiddenBinding.getBoundContext();
			}
			oObjectPage.setBindingContext(oInnerContext);

			if (vSource) {
				assert.ok(oObjectPage.getObjectBinding().isPatchWithoutSideEffects(),
					oObjectPage.getObjectBinding() + " has $$patchWithoutSideEffects");
			}
			return that.waitForChanges(assert);
		}

		// start here :-)
		this.expectRequest("Artists?$filter=IsActiveEntity&$select=ArtistID,IsActiveEntity"
			+ "&$skip=0&$top=100", {
				value : [{ArtistID : "42", IsActiveEntity : true}]
			})
			.expectChange("listId", ["42"])
			.expectChange("id")
			.expectChange("isActive")
			.expectChange("name")
			.expectChange("price", []);

		return this.createView(assert, sView, oModel).then(function () {
			var oRowContext;

			// create the hidden binding when creating the controller
			oHiddenBinding = that.oModel.bindContext("", undefined,
				{$$patchWithoutSideEffects : true});
			oObjectPage = that.oView.byId("objectPage"); // just to keep the test shorter

			expectArtistRequest("42", true);
			expectPublicationRequest("42", true);

			// first start with the list
			oRowContext = that.oView.byId("table").getItems()[0].getBindingContext();
			return bindObjectPage(oRowContext, false);
		}).then(function () {
			return action("EditAction", "42");
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "Artists(ArtistID='42',IsActiveEntity=false)",
					payload : {Name : "The Beatles (modified)"}
				}) // 204 No Content
				.expectChange("name", "The Beatles (modified)");

			that.oView.byId("name").getBinding("value").setValue("The Beatles (modified)");
			return that.waitForChanges(assert);
		}).then(function () {
			return action("ActivationAction", "42", "The Beatles (modified)");
		}).then(function () {
			expectArtistRequest("23", false);
			expectPublicationRequest("23", false);

			// now start directly with the entity
			return bindObjectPage("/Artists(ArtistID='23',IsActiveEntity=false)");
		}).then(function () {
			return action("ActivationAction", "23");
		}).then(function () {
			return action("EditAction", "23");
		}).then(function () {
			var oRowContext;

			that.expectChange("id", "42")
				.expectChange("isActive", "Yes")
				.expectChange("name", "The Beatles");
			expectPublicationRequest("42", true);

			// Now return to the artist from the list.
			// There is no request for the artist; its cache is reused.
			// The publication is requested again, it was relative to a return value context before
			// and the return value context ID changed.
			// The list must be updated manually.
			oRowContext = that.oView.byId("table").getItems()[0].getBindingContext();
			return bindObjectPage(oRowContext, false);
		}).then(function () {
			// clear the object page
			that.expectChange("id", null)
				.expectChange("isActive", null)
				.expectChange("name", null);

			return bindObjectPage(null, false);
		});
	});

	//*********************************************************************************************
	// Scenario: Object page bound to an active entity and its navigation property is $expand'ed via
	// an own request. Trigger "Edit" bound action to start editing using a return value context and
	// modify a property in the entity referenced by the navigation property. Activate the inactive
	// entity via a bound action using another return value context.
	// The elements referenced via the navigation property must not be taken from the cache.
	// See CPOUI5UISERVICESV3-1686.
	QUnit.test("return value contexts: don't reuse caches if context changed", function (assert) {
		var oActiveArtistContext,
			oInactiveArtistContext,
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="id" text="{ArtistID}" />\
	<Text id="isActive" text="{IsActiveEntity}" />\
	<Input id="name" value="{Name}" />\
	<Table id="table" items="{\
			path : \'_Publication\',\
			parameters : {$$ownRequest : true}\
		}">\
		<ColumnListItem>\
			<Input id="price" value="{Price}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;
		this.expectChange("id")
			.expectChange("isActive")
			.expectChange("name")
			.expectChange("price", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/_Publication"
					+ "?$select=Price,PublicationID&$skip=0&$top=100", {
					value : [{
						Price : "9.99",
						PublicationID : "42-0"
					}]
				})
				.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
					+ "?$select=ArtistID,IsActiveEntity,Name", {
					ArtistID : "42",
					IsActiveEntity : true,
					Name : "Hour Frustrated"
				})
				.expectChange("id", "42")
				.expectChange("isActive", "Yes")
				.expectChange("name", "Hour Frustrated")
				.expectChange("price", ["9.99"]);

			oActiveArtistContext = oModel.bindContext("/Artists(ArtistID='42',IsActiveEntity=true)")
				.getBoundContext();
			that.oView.setBindingContext(oActiveArtistContext);

			return that.waitForChanges(assert);
		}).then(function () {
			var oOperation = that.oModel.bindContext("special.cases.EditAction(...)",
					that.oView.getBindingContext(), {$$inheritExpandSelect : true});

			that.expectRequest({
					method : "POST",
					url : "Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction"
						+ "?$select=ArtistID,IsActiveEntity,Name",
					payload : {}
				}, {
					ArtistID : "42",
					IsActiveEntity : false,
					Name : "Hour Frustrated"
				});

			return Promise.all([
				// code under test
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aPromiseResults) {
			oInactiveArtistContext = aPromiseResults[0];

			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=false)/_Publication"
					+ "?$select=Price,PublicationID&$skip=0&$top=100", {
					value : [{
						Price : "9.99",
						PublicationID : "42-0"
					}]
				})
				.expectChange("isActive", "No")
				.expectChange("price", ["9.99"]);

			that.oView.setBindingContext(oInactiveArtistContext);

			return that.waitForChanges(assert);
		}).then(function () {
			var oBinding = that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "Artists(ArtistID='42',IsActiveEntity=false)/_Publication('42-0')",
					payload : {Price : "8.88"}
				}, {
					"@odata.etag" : "ETag1",
					Price : "8.88"
				})
				.expectChange("price", ["8.88"]);

			oBinding.setValue("8.88");

			return that.waitForChanges(assert);
		}).then(function () {
			// switching back to active context takes values from cache
			that.expectChange("isActive", "Yes")
				.expectChange("price", ["9.99"]);

			that.oView.setBindingContext(oActiveArtistContext);

			return that.waitForChanges(assert);
		}).then(function () {
			// switching back to inactive context takes values also from cache
			that.expectChange("isActive", "No")
				.expectChange("price", ["8.88"]);

			that.oView.setBindingContext(oInactiveArtistContext);

			return that.waitForChanges(assert);
		}).then(function () {
			var oOperation = that.oModel.bindContext("special.cases.ActivationAction(...)",
					that.oView.getBindingContext(), {$$inheritExpandSelect : true});

			that.expectRequest({
					method : "POST",
					url : "Artists(ArtistID='42',IsActiveEntity=false)"
						+ "/special.cases.ActivationAction?$select=ArtistID,IsActiveEntity,Name",
					payload : {}
				}, {
					ArtistID : "42",
					IsActiveEntity : true,
					Name : "Hour Frustrated"
				});

			return Promise.all([
				// code under test
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aPromiseResults) {
			var oNewActiveArtistContext = aPromiseResults[0];

			// new active artist context causes dependent binding to reload data
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/_Publication"
					+ "?$select=Price,PublicationID&$skip=0&$top=100", {
					value : [{
						Price : "8.88",
						PublicationID : "42-0"
					}]
				})
				.expectChange("isActive", "Yes")
				.expectChange("price", ["8.88"]);

			that.oView.setBindingContext(oNewActiveArtistContext);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Master list and details containing a dependent table with an own request. Use
	// cached values in dependent table if user switches between entries in the master list.
	// See CPOUI5UISERVICESV3-1686.
	QUnit.test("Reuse caches in dependent tables w/ own request while switching master list entry",
			function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/EMPLOYEES}">\
	<ColumnListItem>\
		<Text id="name" text="{Name}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="form" binding="{path : \'\', parameters : {$$ownRequest : true}}">\
	<Text id="managerId" text="{EMPLOYEE_2_MANAGER/ID}" />\
	<Table items="{path : \'EMPLOYEE_2_EQUIPMENTS\', parameters : {$$ownRequest : true}}">\
		<ColumnListItem>\
			<Text id="equipmentId" text="{ID}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES?$select=ID,Name&$skip=0&$top=100", {
				value : [
					{ID : "42", Name : "Jonathan Smith"},
					{ID : "43", Name : "Frederic Fall"}
				]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"])
			.expectChange("managerId")
			.expectChange("equipmentId", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("EMPLOYEES('42')?$select=ID&$expand=EMPLOYEE_2_MANAGER($select=ID)",
				{
					ID : "42",
					EMPLOYEE_2_MANAGER : {ID : "1"}
				})
				.expectRequest("EMPLOYEES('42')/EMPLOYEE_2_EQUIPMENTS?$select=Category,ID"
					+ "&$skip=0&$top=100", {
					value : [
						{Category : "Electronics", ID : 99},
						{Category : "Electronics", ID : 98}
					]
				})
				.expectChange("managerId", "1")
				.expectChange("equipmentId", ["99", "98"]);

			// code under test
			that.oView.byId("form").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[0]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("EMPLOYEES('43')/EMPLOYEE_2_EQUIPMENTS?$select=Category,ID"
					+ "&$skip=0&$top=100", {
					value : [
						{Category : "Electronics", ID : 97},
						{Category : "Electronics", ID : 96}
					]
				})
				.expectRequest("EMPLOYEES('43')?$select=ID&$expand=EMPLOYEE_2_MANAGER($select=ID)",
				{
					ID : "43",
					EMPLOYEE_2_MANAGER : {ID : "2"}
				})
				.expectChange("managerId", "2")
				.expectChange("equipmentId", ["97", "96"]);

			// code under test
			that.oView.byId("form").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[1]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("managerId", "1")
				.expectChange("equipmentId", ["99", "98"]);

			// code under test - no request!
			that.oView.byId("form").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[0]);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Object page bound to active entity with a navigation property $expand'ed via
	// auto-$expand/$select. The "Edit" bound action on the active entity has the binding parameter
	// $$inheritExpandSelect set so that it triggers the POST request with the same $expand and
	// $select parameters used for loading the active entity. This way, all fields in the object
	// page can be populated from the bound action response.
	// Read side effects which include navigation properties while there are pending changes.
	QUnit.test("bound operation: $$inheritExpandSelect", function (assert) {
		var fnDataReceived = this.spy(),
			fnDataRequested = this.spy(),
			oJustAMessage = {
				code : "23",
				message : "Just A Message",
				target : "/Artists(ArtistID='42',IsActiveEntity=false)/Name",
				persistent : true,
				type : "Success"
			},
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="id" text="{ArtistID}" />\
	<Text id="isActive" text="{IsActiveEntity}" />\
	<Input id="name" value="{Name}" />\
	<Text id="inProcessByUser" text="{DraftAdministrativeData/InProcessByUser}" />\
</FlexBox>',
			that = this;

		this.expectChange("id")
			.expectChange("isActive")
			.expectChange("name")
			.expectChange("inProcessByUser");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?custom=foo"
					+ "&$select=ArtistID,IsActiveEntity,Messages,Name"
					+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)", {
					ArtistID : "42",
					DraftAdministrativeData : null,
					IsActiveEntity : true,
					Name : "Hour Frustrated"
				})
				.expectChange("id", "42")
				.expectChange("isActive", "Yes")
				.expectChange("name", "Hour Frustrated");

			that.oView.setBindingContext(
				oModel.bindContext("/Artists(ArtistID='42',IsActiveEntity=true)", null,
						{custom : "foo", $select : "Messages"})
					.getBoundContext());

			return that.waitForChanges(assert);
		}).then(function () {
			var oOperation = that.oModel.bindContext("special.cases.EditAction(...)",
					that.oView.getBindingContext(), {$$inheritExpandSelect : true});

			oOperation.attachDataReceived(fnDataReceived);
			oOperation.attachDataRequested(fnDataRequested);
			that.expectRequest({
					method : "POST",
					url : "Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction"
						+ "?$select=ArtistID,IsActiveEntity,Messages,Name"
						+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)",
					payload : {}
				}, {
					"@odata.etag" : "ETag0",
					ArtistID : "42",
					DraftAdministrativeData : {
						DraftID : "1",
						InProcessByUser : "JOHNDOE"
					},
					IsActiveEntity : false,
					Messages : [{
						code : "23",
						message : "Just A Message",
						numericSeverity : 1,
						target : "Name",
						transition : true
					}],
					Name : "Hour Frustrated"
				})
				.expectMessages([oJustAMessage]);

			return Promise.all([
				// code under test
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aPromiseResults) {
			var oInactiveArtistContext = aPromiseResults[0];

			that.expectChange("isActive", "No")
				.expectChange("inProcessByUser", "JOHNDOE");

			that.oView.setBindingContext(oInactiveArtistContext);

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, "name", "Success", "Just A Message");
		}).then(function () {
			var oInactiveArtistContext = that.oView.getBindingContext();

			that.expectChange("name", "TAFKAP")
				.expectRequest({
					method : "PATCH",
					url : "Artists(ArtistID='42',IsActiveEntity=false)",
					headers : {"If-Match" : "ETag0"},
					payload : {Name : "TAFKAP"}
				}, {/* response does not matter here */});

			that.oView.byId("name").getBinding("value").setValue("TAFKAP");

			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=false)"
				+ "?$select=DraftAdministrativeData"
				+ "&$expand=DraftAdministrativeData($select=InProcessByUser)", {
					DraftAdministrativeData : {InProcessByUser : "bar"}
				})
				.expectChange("inProcessByUser", "bar");
				// no change in messages

			return Promise.all([
				// code under test
				oInactiveArtistContext.requestSideEffects([{
					$PropertyPath : "DraftAdministrativeData/InProcessByUser"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(fnDataReceived.callCount, 0, "no dataReceived");
			assert.strictEqual(fnDataRequested.callCount, 0, "no dataRequested");

			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=false)"
					+ "?$select=ArtistID,IsActiveEntity,Messages,Name"
					+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)", {
					ArtistID : "42",
					DraftAdministrativeData : {
						DraftID : "1",
						InProcessByUser : "JOHNDOE"
					},
					IsActiveEntity : false,
					Messages : [],
					Name : "Changed"
				})
				.expectChange("name", "Changed")
				.expectChange("inProcessByUser", "JOHNDOE");
				// no change in messages

			// code under test
			that.oView.getBindingContext().refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			var oOperation = that.oModel.bindContext("special.cases.ActivationAction(...)",
					that.oView.getBindingContext(), {$$inheritExpandSelect : true});

			assert.strictEqual(fnDataReceived.callCount, 1, "dataReceived");
			assert.strictEqual(fnDataRequested.callCount, 1, "dataRequested");
			that.expectRequest({
					method : "POST",
					url : "Artists(ArtistID='42',IsActiveEntity=false)"
						+ "/special.cases.ActivationAction"
						+ "?$select=ArtistID,IsActiveEntity,Messages,Name"
						+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)",
					payload : {}
				}, {
					ArtistID : "42",
					DraftAdministrativeData : {
						DraftID : "1",
						InProcessByUser : ""
					},
					IsActiveEntity : true,
					Messages : [],
					Name : "Hour Frustrated"
				});
				// no change in messages

			return Promise.all([
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Call an action which returns the binding parameter as return value. Expect that
	// the result is copied back to the binding parameter.
	QUnit.test("bound operation: copy result into context", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<Text id="id" text="{SalesOrderID}" />\
	<Text id="LifecycleStatusDesc" text="{LifecycleStatusDesc}" />\
	<FlexBox id="action"\
		binding="{com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrder_Confirm(...)}">\
		<layoutData><FlexItemData/></layoutData>\
	</FlexBox>\
</FlexBox>',
			that = this;

		that.expectRequest("SalesOrderList('42')?$select=LifecycleStatusDesc,SalesOrderID", {
				SalesOrderID : "42",
				LifecycleStatusDesc : "New"
			})
			.expectChange("id", "42")
			.expectChange("LifecycleStatusDesc", "New");

		return this.createView(assert, sView, oModel).then(function () {
			var oOperation = that.oView.byId("action").getObjectBinding();

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('42')/"
							+ "com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrder_Confirm",
					payload : {}
				}, {
					SalesOrderID : "42",
					LifecycleStatusDesc : "Confirmed"
				})
				.expectChange("LifecycleStatusDesc", "Confirmed");

			return Promise.all([
				// code under test
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete return value context obtained from bound action execute.
	QUnit.test("bound operation: delete return value context", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="objectPage">\
	<Text id="id" text="{ArtistID}" />\
	<Text id="isActive" text="{IsActiveEntity}" />\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectChange("id")
			.expectChange("isActive")
			.expectChange("name");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
					+ "?$select=ArtistID,IsActiveEntity,Name", {
					ArtistID : "42",
					IsActiveEntity : true,
					Name : "Hour Frustrated"
				})
				.expectChange("id", "42")
				.expectChange("isActive", "Yes")
				.expectChange("name", "Hour Frustrated");

			that.oView.setBindingContext(
				oModel.bindContext("/Artists(ArtistID='42',IsActiveEntity=true)")
					.getBoundContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction",
					payload : {}
				}, {
					ArtistID : "42",
					IsActiveEntity : false,
					Name : "Hour Frustrated"
				});

			return Promise.all([
				that.oModel
					.bindContext("special.cases.EditAction(...)", that.oView.getBindingContext())
					.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aPromiseResults) {
			var oInactiveArtistContext = aPromiseResults[0];

			that.expectChange("isActive", "No");

			that.oView.byId("objectPage").setBindingContext(oInactiveArtistContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "Artists(ArtistID='42',IsActiveEntity=false)"
				})
				.expectChange("id", null)
				.expectChange("isActive", null)
				.expectChange("name", null);

			return Promise.all([
				// code under test
				that.oView.byId("objectPage").getBindingContext().delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Execute bound action with context for which no data has been read yet.
	QUnit.test("bound operation: execute bound action on context w/o read", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			oParentContext = oModel.bindContext("/Artists(ArtistID='42',IsActiveEntity=true)")
				.getBoundContext(),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			that.expectRequest({
					method: "POST",
					url: "Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction",
					payload: {}
				}, {
					ArtistID : "42",
					IsActiveEntity : false
				});

			return Promise.all([
				// code under test
				oModel.bindContext("special.cases.EditAction(...)", oParentContext).execute(),
				that.waitForChanges(assert)
			]);
		}).then(function (aPromiseResults) {
			var oInactiveArtistContext = aPromiseResults[0];

			assert.strictEqual(oInactiveArtistContext.getProperty("IsActiveEntity"), false);
		});
	});

	//*********************************************************************************************
	// Scenario: Create entity for an absolute ListBinding, save the new entity and call a bound
	// action for the new non-transient entity
	QUnit.test("Create absolute, save and call action", function (assert) {
		var oCreatedContext,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			that = this,
			sView = '\
<Table id="table" items="{/TEAMS}">\
	<ColumnListItem>\
		<Text id="Team_Id" text="{Team_Id}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("TEAMS?$select=Team_Id&$skip=0&$top=100", {
				value : [{Team_Id : "42"}]
			})
			.expectChange("Team_Id", ["42"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "POST",
					url : "TEAMS",
					payload : {Team_Id : "new"}
				}, {Team_Id : "newer"})
				.expectChange("Team_Id", ["new"])
				.expectChange("Team_Id", ["newer", "42"])
				.expectRequest("TEAMS('newer')?$select=Team_Id", {Team_Id : "newer"});

			oCreatedContext =  that.oView.byId("table").getBinding("items").create({
				Team_Id : "new"
			});

			return Promise.all([oCreatedContext.created(), that.waitForChanges(assert)]);
		}).then(function () {
			var oAction = oModel.bindContext("com.sap.gateway.default.iwbep.tea_busi.v0001."
					+ "AcChangeManagerOfTeam(...)", oCreatedContext);

			assert.strictEqual(oCreatedContext.getPath(), "/TEAMS('newer')");

			that.expectRequest({
					method : "POST",
					url : "TEAMS('newer')/com.sap.gateway.default.iwbep.tea_busi.v0001."
						+ "AcChangeManagerOfTeam",
					payload : {ManagerID : "01"}
			});
			oAction.setParameter("ManagerID", "01");


			return Promise.all([
				// code under test
				oAction.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create entity for a relative ListBinding, save the new entity and call action
	// import for the new non-transient entity
	QUnit.test("Create relative, save and call action", function (assert) {
		var oCreatedContext,
			oModel = createTeaBusiModel(),
			oTeam2EmployeesBinding,
			that = this,
			sView = '\
<FlexBox id="form" binding="{path : \'/TEAMS(\\\'42\\\')\',\
	parameters : {$expand : {TEAM_2_EMPLOYEES : {$select : \'ID\'}}}}">\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Text id="id" text="{ID}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest("TEAMS('42')?$expand=TEAM_2_EMPLOYEES($select=ID)", {
				TEAM_2_EMPLOYEES : [{ID : "2"}]
			})
			.expectChange("id", ["2"]);

		return this.createView(assert, sView, oModel).then(function () {
			// create new relative entity
			that.expectRequest({
					method : "POST",
					url : "TEAMS('42')/TEAM_2_EMPLOYEES",
					payload : {ID : null}
				}, {ID : "7"})
				.expectRequest("TEAMS('42')/TEAM_2_EMPLOYEES('7')?$select=ID", {ID : "7"})
				.expectChange("id", [""]) // from setValue(null)
				.expectChange("id", ["7", "2"]);
			oTeam2EmployeesBinding = that.oView.byId("table").getBinding("items");
			oCreatedContext = oTeam2EmployeesBinding.create({ID : null});

			return Promise.all([oCreatedContext.created(), that.waitForChanges(assert)]);
		}).then(function () {
			var oAction = that.oModel.bindContext(
					"com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee(...)",
					oCreatedContext);

			assert.strictEqual(oCreatedContext.getPath(), "/TEAMS('42')/TEAM_2_EMPLOYEES('7')");

			that.expectRequest({
					method : "POST",
					url : "TEAMS('42')/TEAM_2_EMPLOYEES('7')/"
						+ "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
					payload : {TeamID : "TEAM_02"}
				}, {ID : "7"});
			oAction.setParameter("TeamID", "TEAM_02");

			return Promise.all([
				// code under test
				oAction.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity on an absolute ListBinding, save the new entity and call bound
	// action for the new non-transient entity
	// Afterwards create a new entity on a containment relative to the just saved absolute entity,
	// save the containment and call a bound function on the new non-transient contained entity
	QUnit.test("Create absolute and contained entity, save and call bound action/function",
			function (assert) {
		var oCreatedItemContext,
			oCreatedSOContext,
			oItemBinding,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			that = this,
			sView = '\
<Table id="SalesOrders" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="SalesOrderID" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>\
<Table id="LineItems" items="{SO_2_SOITEM}">\
	<ColumnListItem>\
		<Text id="ItemSalesOrderID" text="{SalesOrderID}" />\
		<Text id="ItemPosition" text="{ItemPosition}" />\
	</ColumnListItem>\
</Table>';

		this.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [{SalesOrderID : "42"}]
			})
			.expectChange("SalesOrderID", ["42"])
			.expectChange("ItemPosition", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {SalesOrderID : "newID"}
				}, {SalesOrderID : "43"})
				.expectChange("SalesOrderID", ["newID"]) // from create()
				.expectChange("SalesOrderID", ["43", "42"])
				.expectRequest("SalesOrderList('43')?$select=SalesOrderID", {SalesOrderID : "43"});

			oCreatedSOContext = that.oView.byId("SalesOrders").getBinding("items").create({
				SalesOrderID : "newID"
			});

			return Promise.all([oCreatedSOContext.created(), that.waitForChanges(assert)]);
		}).then(function () {
			// set context for line items after sales order is created
			that.expectRequest("SalesOrderList('43')/SO_2_SOITEM?$select=ItemPosition,"
					+ "SalesOrderID&$skip=0&$top=100", {
					value : []
				});
			oItemBinding = that.oView.byId("LineItems").getBinding("items");
			oItemBinding.setContext(oCreatedSOContext);

			return that.waitForChanges(assert);
		}).then(function () {
			// create a sales order line item
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('43')/SO_2_SOITEM",
					payload : {
						SalesOrderID : "43",
						ItemPosition : "newPos"
					}
				}, {
					SalesOrderID : "43",
					ItemPosition : "10"
				})
				.expectRequest("SalesOrderList('43')"
					+ "/SO_2_SOITEM(SalesOrderID='43',ItemPosition='10')"
					+ "?$select=ItemPosition,SalesOrderID", {
					SalesOrderID : "43",
					ItemPosition : "10"
				})
				.expectChange("ItemPosition", ["newPos"])
				.expectChange("ItemPosition", ["10"]);

			oCreatedItemContext =  oItemBinding.create({
				SalesOrderID : "43",
				ItemPosition : "newPos"
			});

			return Promise.all([oCreatedItemContext.created(), that.waitForChanges(assert)]);
		}).then(function () {
			// confirm created sales order (call action on created context)
			var oAction = oModel.bindContext("com.sap.gateway.default.zui5_epm_sample"
					+ ".v0002.SalesOrder_Confirm(...)", oCreatedSOContext);

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('43')/com.sap.gateway.default.zui5_epm_sample"
						+ ".v0002.SalesOrder_Confirm",
					payload : {}
				}, {SalesOrderID : "43"});

			return Promise.all([
				// code under test
				oAction.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// check availability (call function on created containment)
			var oFunction = oModel.bindContext("com.sap.gateway.default.zui5_epm_"
					+ "sample.v0002.SalesOrderLineItem_CheckAvailability(...)",
					oCreatedItemContext);

			that.expectRequest({
					method : "GET",
					url : "SalesOrderList('43')/SO_2_SOITEM(SalesOrderID='43'"
						+ ",ItemPosition='10')/com.sap.gateway.default.zui5_epm_"
						+ "sample.v0002.SalesOrderLineItem_CheckAvailability()"
				}, {value : "5.0"});

			return Promise.all([
				// code under test
				oFunction.execute(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	["$direct", "$auto"].forEach(function (sGroupId) {
		QUnit.test("Unbound messages in response: " + sGroupId, function (assert) {
			var aMessages = [{
					code : "foo-42",
					longtextUrl : "../Messages(1)/LongText/$value",
					message : "text0",
					numericSeverity : 3
				}, {
					code : "foo-77",
					message : "text1",
					numericSeverity : 2
				}],
				oModel = createTeaBusiModel({groupId : sGroupId}),
				sView = '\
<FlexBox binding="{path : \'/TEAMS(\\\'42\\\')/TEAM_2_MANAGER\',\
	parameters : {custom : \'foo\'}}">\
	<Text id="id" text="{ID}" />\
</FlexBox>';

			this.expectRequest("TEAMS('42')/TEAM_2_MANAGER?custom=foo", {ID : "23"}, {
					"sap-messages" : JSON.stringify(aMessages)
				})
				.expectMessages([{
					code : "foo-42",
					descriptionUrl : sTeaBusi + "Messages(1)/LongText/$value",
					message : "text0",
					persistent : true,
					target : "",
					technicalDetails : {
						originalMessage : aMessages[0]
					},
					type : "Warning"
				}, {
					code : "foo-77",
					message : "text1",
					persistent : true,
					target : "",
					technicalDetails : {
						originalMessage : aMessages[1]
					},
					type : "Information"
				}])
				.expectChange("id", "23");

			return this.createView(assert, sView, oModel);
		});
	});

	//*********************************************************************************************
	// Scenario: Master/detail. Select the first row in the master table, the detail list returns
	// an item with a message. Select the second row in the master table, the message remains
	// although the item is no longer displayed. Now sort the detail table (which refreshes it) and
	// the message is gone.
	QUnit.test("Master/Detail & messages", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/TEAMS\', templateShareable : false}">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>\
<Table id="detailTable" items="{\
			path : \'TEAM_2_EMPLOYEES\',\
			parameters : {\
				$select : \'__CT__FAKE__Message/__FAKE__Messages\'\
			}\
		}">\
	<ColumnListItem>\
		<Input id="Name" value="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("TEAMS?$select=Name,Team_Id&$skip=0&$top=100", {
				value : [
					{Team_Id : "Team_01", Name : "Team 01"},
					{Team_Id : "Team_02", Name : "Team 02"}
				]
			})
			.expectChange("text", ["Team 01", "Team 02"])
			.expectChange("Name", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("TEAMS('Team_01')/TEAM_2_EMPLOYEES"
					+ "?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=100", {
					value : [{
						ID : "1",
						Name : "Peter Burke",
						__CT__FAKE__Message : {
							__FAKE__Messages : [{
								code : "1",
								message : "Text",
								numericSeverity : 3,
								target : "Name",
								transition : false
							}]
						}
					}]
				})
				.expectChange("Name", ["Peter Burke"])
				.expectMessages([{
					code : "1",
					message : "Text",
					persistent : false,
					target : "/TEAMS('Team_01')/TEAM_2_EMPLOYEES('1')/Name",
					type : "Warning"
				}]);

			that.oView.byId("detailTable").setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("detailTable").getItems()[0].getCells()[0],
				"Warning", "Text");
		}).then(function () {
			that.expectRequest("TEAMS('Team_02')/TEAM_2_EMPLOYEES"
					+ "?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=100", {
					value : []
				})
				.expectChange("Name", []);
				// no change in messages

			that.oView.byId("detailTable").setBindingContext(
				that.oView.byId("table").getItems()[1].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("TEAMS('Team_02')/TEAM_2_EMPLOYEES"
					+ "?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages"
					+ "&$orderby=Name&$skip=0&$top=100", {
					value : []
				})
				.expectMessages([]); // message is gone

			that.oView.byId("detailTable").getBinding("items").sort(new Sorter("Name"));

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario:
	// Two Master/Detail binding hierarchies for sales orders and sales order line items. When
	// refreshing a single sales order, line items requests are triggered and messages are updated
	// only for this single sales order and its dependent sales order line items. For other sales
	// orders and their dependent sales order line items cached data is not discarded and messages
	// are kept untouched. If there are unresolved bindings, their cached data which depends on the
	// refreshed sales order is discarded and the corresponding messages are removed. Resolved
	// bindings for other binding hierarchies are not affected. (CPOUI5UISERVICESV3-1575)
	QUnit.test("sap.ui.model.odata.v4.Context#refresh: caches and messages", function (assert) {
		var sView = '\
<Table id="tableSalesOrder" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="salesOrder" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>\
<Table id="tableSOItems" items="{\
			path : \'SO_2_SOITEM\',\
			parameters : {\
				$$ownRequest : true,\
				$select : \'Messages\'\
			}}">\
	<ColumnListItem>\
		<Input id="note" value="{Note}" />\
	</ColumnListItem>\
</Table>\
<!-- same paths in different control hierarchies -->\
<Table id="tableSalesOrder2" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="salesOrder2" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>\
<!-- to determine which request is fired the second table requests only 5 entries -->\
<Table id="tableSOItems2" growing="true" growingThreshold="5" items="{SO_2_SOITEM}">\
	<ColumnListItem>\
		<Input id="note2" value="{Note}" />\
	</ColumnListItem>\
</Table>',
			oExpectedMessage0 = {
				code : "1",
				message : "Message0",
				persistent : false,
				target : "/SalesOrderList('0500000347')"
					+ "/SO_2_SOITEM(SalesOrderID='0500000347',ItemPosition='0')/Note",
				type : "Warning"
			},
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			that = this;

		that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
					value : [
						{SalesOrderID : "0500000347"},
						{SalesOrderID : "0500000348"}
					]
				})
			.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
					value : [
						{SalesOrderID : "0500000347"},
						{SalesOrderID : "0500000348"}
					]
				})
			.expectChange("salesOrder", ["0500000347", "0500000348"])
			.expectChange("note", [])
			.expectChange("salesOrder2", ["0500000347", "0500000348"])
			.expectChange("note2", []);

		return this.createView(assert, sView, oModel).then(function () {
			// Select the first sales order in both hierarchies to get their items and messages
			that.expectRequest("SalesOrderList('0500000347')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Note,SalesOrderID&$skip=0&$top=5", {
					value : [
						{ItemPosition : "0", Note : "Test1", SalesOrderID : "0500000347"},
						{ItemPosition : "1", Note : "Test2", SalesOrderID : "0500000347"}
					]
				})
				.expectRequest("SalesOrderList('0500000347')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Note,SalesOrderID&$skip=0&$top=100", {
					value : [{
						ItemPosition : "0",
						Messages : [{
							code : "1",
							message : "Message0",
							numericSeverity : 3,
							target : "Note",
							transition : false
						}],
						Note : "Test1",
						SalesOrderID : "0500000347"
					}, {
						ItemPosition : "1",
						Messages : [],
						Note : "Test2",
						SalesOrderID : "0500000347"
					}]
				})
				.expectChange("note", ["Test1", "Test2"])
				.expectChange("note2", ["Test1", "Test2"])
				.expectMessages([oExpectedMessage0]);

			that.oView.byId("tableSOItems").setBindingContext(
				that.oView.byId("tableSalesOrder").getItems()[0].getBindingContext());
			that.oView.byId("tableSOItems2").setBindingContext(
				that.oView.byId("tableSalesOrder2").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			// Note: the message target addresses both fields!
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			// Select the second sales order to get its items and messages
			that.expectRequest("SalesOrderList('0500000348')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Note,SalesOrderID&$skip=0&$top=100", {
					value : [{
						ItemPosition : "0",
						Messsages : [],
						Note : "Test3",
						SalesOrderID : "0500000348"
					}, {
						ItemPosition : "1",
						Messages : [{
							code : "1",
							message : "Message1",
							numericSeverity : 3,
							target : "Note",
							transition : false
						}],
						Note : "Test4",
						SalesOrderID : "0500000348"
					}]
				})
				.expectChange("note", ["Test3", "Test4"])
				.expectMessages([oExpectedMessage0, {
					code : "1",
					message : "Message1",
					persistent : false,
					target : "/SalesOrderList('0500000348')"
						+ "/SO_2_SOITEM(SalesOrderID='0500000348',ItemPosition='1')/Note",
					type : "Warning"
				}]);

			// code under test
			that.oView.byId("tableSOItems").setBindingContext(
				that.oView.byId("tableSalesOrder").getItems()[1].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems").getItems()[1].getCells()[0],
				"Warning", "Message1");
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			// refresh the second sales order; the message for the first sales order is kept
			that.expectRequest("SalesOrderList('0500000348')?$select=SalesOrderID", {
					SalesOrderID : "0500000348"})
				.expectRequest("SalesOrderList('0500000348')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Note,SalesOrderID&$skip=0&$top=100", {
					value : [{
						ItemPosition : "0",
						Messages : [],
						Note : "Test3a",
						SalesOrderID : "0500000348"
					}, {
						ItemPosition : "1",
						Messages : [],
						Note : "Test4a",
						SalesOrderID : "0500000348"
					}]
				})
				.expectChange("note", ["Test3a", "Test4a"])
				.expectMessages([oExpectedMessage0]);

			// code under test
			that.oView.byId("tableSalesOrder").getItems()[1].getBindingContext().refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems").getItems()[1].getCells()[0],
				"None", "");
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			// select the first sales order again; no requests, the cache for the items is still
			// alive
			that.expectChange("note", ["Test1", "Test2"]);
				// no change in messages

			// code under test
			that.oView.byId("tableSOItems").setBindingContext(
				that.oView.byId("tableSalesOrder").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			// remove the binding context for the sales order items to get an unresolved binding
			// with caches
			that.expectChange("note", []);
				// no change in messages

			that.oView.byId("tableSOItems").setBindingContext(null);

			return that.waitForChanges(assert);
		}).then(function () {
			// refresh the first sales order, caches and messages of unresolved bindings for this
			// sales order are discarded
			that.expectRequest("SalesOrderList('0500000347')?$select=SalesOrderID", {
					SalesOrderID : "0500000347"})
				.expectMessages([]);

			that.oView.byId("tableSalesOrder").getItems()[0].getBindingContext().refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			// Note: "tableSOItems" currently unresolved
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"None", "");
		}).then(function () {
			// select the first sales order to get its items and messages, request is
			// triggered because the cache for the sales order line items is discarded
			that.expectRequest("SalesOrderList('0500000347')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Note,SalesOrderID&$skip=0&$top=100", {
					value : [{
						ItemPosition : "0",
						Messages : [{
							code : "1",
							message : "Message0",
							numericSeverity : 3,
							target : "Note",
							transition : false
						}],
						Note : "Test1",
						SalesOrderID : "0500000347"
					}, {
						ItemPosition : "1",
						Messages : [],
						Note : "Test2",
						SalesOrderID : "0500000347"
					}]
				})
				.expectChange("note", ["Test1", "Test2"])
				.expectMessages([oExpectedMessage0]);

			// code under test
			that.oView.byId("tableSOItems").setBindingContext(
				that.oView.byId("tableSalesOrder").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			// select the second sales order again; no requests, cache is still alive
			that.expectChange("note", ["Test3a", "Test4a"]);
				// no change in messages

			// code under test
			that.oView.byId("tableSOItems").setBindingContext(
				that.oView.byId("tableSalesOrder").getItems()[1].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems").getItems()[0].getCells()[0],
				"None", "");
		}).then(function () {
			// remove the binding context for the items of the second binding hierarchy
			that.expectChange("note2", []);
				// no change in messages

			that.oView.byId("tableSOItems2").setBindingContext(null);

			return that.waitForChanges(assert);
		}).then(function () {
			// select the same sales order again in the second binding hierarchy; no requests, cache
			// is still alive; cache was not affected by refreshing sales order "0500000347" in the
			// first binding hierarchy
			that.expectChange("note2", ["Test1", "Test2"]);
				// no change in messages

			that.oView.byId("tableSOItems2").setBindingContext(
				that.oView.byId("tableSalesOrder2").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"Warning", "Message0");
		}).then(function () {
			// remove the binding context for the items of the binding hierarchy
			that.expectChange("note", []);
				// no change in messages

			that.oView.byId("tableSOItems").setBindingContext(null);

			return that.waitForChanges(assert);
		}).then(function () {
			// Refresh the whole binding
			that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
					value : [
						{SalesOrderID : "0500000347"},
						{SalesOrderID : "0500000348"}
					]
				})
				.expectMessages([]);

			that.oView.byId("tableSalesOrder").getBinding("items").refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("tableSOItems2").getItems()[0].getCells()[0],
				"None", "");
		}).then(function () {
			// select the same sales order again in the binding hierarchy, new request is sent;
			//TODO if Binding.refresh considers unbound bindings this request is expected.
			// Will be fixed with CPOUI5UISERVICESV3-1701
/*			that.expectRequest("SalesOrderList('0500000347')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Note,SalesOrderID&$skip=0&$top=100", {
					value : [
						{ItemPosition : "0", Note : "Test1", SalesOrderID : "0500000347"},
						{ItemPosition : "1", Note : "Test2", SalesOrderID : "0500000347"}
					]
				})
*/
			that.expectChange("note", ["Test1", "Test2"]);

			that.oView.byId("tableSOItems").setBindingContext(
				that.oView.byId("tableSalesOrder").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Change a property in a dependent binding with an own cache below a list binding.
	// Unset the binding context for the dependent binding and expect that there are still pending
	// changes for the formerly set context. Set the binding context to the second entry of the
	// equipments table and refresh the context of the second entry and expect that refresh is
	// possible. (CPOUI5UISERVICESV3-1575)
	QUnit.test("Context: Pending change in a hidden cache", function (assert) {
		var oContext0,
			oContext1,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="equipments" items="{/Equipments}">\
	<ColumnListItem>\
		<Text id="id" text="{ID}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="employeeDetails"\
		binding="{path : \'EQUIPMENT_2_EMPLOYEE\', parameters : {$$updateGroupId : \'foo\'\}}">\
	<Input id="employeeName" value="{Name}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("Equipments?$select=Category,ID&$skip=0&$top=100", {
				value : [
					{Category : "Electronics", ID : 23},
					{Category : "Vehicle", ID : 42}
				]
			})
			.expectChange("id", ["23", "42"])
			.expectChange("employeeName");

		return this.createView(assert, sView, oModel).then(function () {
			oContext0 = that.oView.byId("equipments").getItems()[0].getBindingContext();

			that.expectRequest("Equipments(Category='Electronics',ID=23)/EQUIPMENT_2_EMPLOYEE?"
					+ "$select=ID,Name", {
					ID : "1",
					Name : "John Smith"
				})
				.expectChange("employeeName", "John Smith");

			// select the first row in the equipments table
			that.oView.byId("employeeDetails").setBindingContext(oContext0);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("employeeName", "Peter Burke");

			// change the name of the employee
			that.oView.byId("employeeName").getBinding("value").setValue("Peter Burke");

			assert.ok(oContext0.hasPendingChanges());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("employeeName", null);

			that.oView.byId("employeeDetails").setBindingContext(null);

			assert.ok(oContext0.hasPendingChanges());
			assert.throws(function () {
				oContext0.refresh();
			}, /Cannot refresh entity due to pending changes:/);

			//TODO: hasPendingChanges on binding will be fixed with CPOUI5UISERVICESV3-1701
//			assert.ok(that.oView.byId("equipments").getBinding("items").hasPendingChanges());

			return that.waitForChanges(assert);
		}).then(function () {
			oContext1 = that.oView.byId("equipments").getItems()[1].getBindingContext();

			that.expectRequest("Equipments(Category='Vehicle',ID=42)/EQUIPMENT_2_EMPLOYEE?"
					+ "$select=ID,Name", {
					ID : "2",
					Name : "Frederic Fall"
				})
				.expectChange("employeeName", "Frederic Fall");

			// select the second row in the equipments table
			that.oView.byId("employeeDetails").setBindingContext(oContext1);

			// code under test
			assert.ok(that.oView.byId("equipments").getBinding("items").hasPendingChanges());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Equipments(Category='Vehicle',ID=42)?$select=Category,ID", {
					Category : "Vehicle",
					ID : 42
				})
				.expectRequest("Equipments(Category='Vehicle',ID=42)/EQUIPMENT_2_EMPLOYEE?"
					+ "$select=ID,Name", {
					ID : "2",
					Name : "Frederic Fall"
				});

			// refresh the second row in the equipments table
			oContext1.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("employeeName", "Peter Burke");

			// select the first row in the equipments table
			that.oView.byId("employeeDetails").setBindingContext(oContext0);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity with messages from an ODataListBinding
	QUnit.test("Delete an entity with messages from an ODataListBinding", function (assert) {
		var oDeleteMessage = {
				code : "occupied",
				message : "Cannot delete occupied worker",
				persistent : true,
				target : "/EMPLOYEES('1')/STATUS",
				technical : true,
				type : "Error"
			},
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			oReadMessage = {
				code : "1",
				message : "Text",
				persistent : false,
				target : "/EMPLOYEES('1')/Name",
				type : "Warning"
			},
			sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', \
		parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
	<ColumnListItem>\
		<Input id="name" value="{Name}" />\
		<Input id="status" value="{STATUS}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$select=ID,Name,STATUS,__CT__FAKE__Message/__FAKE__Messages"
				+ "&$skip=0&$top=100", {
				value : [{
					ID : "1",
					Name : "Jonathan Smith",
					STATUS : "Occupied",
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Text",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				}, {
					ID : "2",
					Name : "Frederic Fall",
					STATUS : "Available",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				}]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"])
			.expectChange("status", ["Occupied", "Available"])
			.expectMessages([oReadMessage]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[0],
				"Warning", "Text");
		}).then(function () {
			var oContext = that.oView.byId("table").getItems()[0].getBindingContext(),
				oError = createError({
					code : "occupied",
					message : "Cannot delete occupied worker",
					target : "STATUS"
				});

			that.oLogMock.expects("error")
				.withExactArgs("Failed to delete /EMPLOYEES('1')[0]", sinon.match(oError.message),
					"sap.ui.model.odata.v4.Context");
			that.expectRequest({method : "DELETE", url : "EMPLOYEES('1')"}, oError)
				.expectMessages([oReadMessage, oDeleteMessage]);

			return Promise.all([
				// code under test
				oContext.delete().catch(function () {}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[1],
				"Error", "Cannot delete occupied worker");
		}).then(function () {
			var oContext = that.oView.byId("table").getItems()[0].getBindingContext();

			that.expectRequest({
					method : "DELETE",
					url : "EMPLOYEES('1')"
				})
				.expectChange("name", ["Frederic Fall"])
				.expectChange("status", ["Available"])
				.expectMessages([oDeleteMessage]);

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity with messages from an ODataContextBinding
	QUnit.test("Delete an entity with messages from an ODataContextBinding", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{path : \'/EMPLOYEES(\\\'2\\\')\', \
	parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
	<Input id="text" value="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('2')?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages", {
				ID : "1",
				Name : "Jonathan Smith",
				__CT__FAKE__Message : {
					__FAKE__Messages : [{
						code : "1",
						message : "Text",
						numericSeverity : 3,
						target : "Name",
						transition : false
					}]
				}
			})
			.expectChange("text", "Jonathan Smith")
			.expectMessages([{
				code : "1",
				message : "Text",
				persistent : false,
				target : "/EMPLOYEES('2')/Name",
				type : "Warning"
			}]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert, "text", "Warning", "Text");
		}).then(function () {
			var oContext = that.oView.byId("form").getBindingContext();

			that.expectRequest({
					method : "DELETE",
					url : "EMPLOYEES('2')"
				})
				.expectChange("text", null)
				.expectMessages([]);

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity with messages from an relative ODLB w/o cache
	QUnit.test("Delete an entity with messages from an relative ODLB w/o cache", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="detail" binding="{/TEAMS(\'TEAM_01\')}">\
	<Text id="Team_Id" text="{Team_Id}" />\
	<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', \
			parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
		<ColumnListItem>\
			<Input id="name" value="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('TEAM_01')?$select=Team_Id"
				+ "&$expand=TEAM_2_EMPLOYEES($select=ID,Name,"
				+ "__CT__FAKE__Message/__FAKE__Messages)", {
				Team_Id : "TEAM_01",
				TEAM_2_EMPLOYEES : [{
					ID : "1",
					Name : "Jonathan Smith",
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Text",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				}, {
					ID : "2",
					Name : "Frederic Fall",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				}]
			})
			.expectChange("Team_Id", "TEAM_01")
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"])
			.expectMessages([{
				code : "1",
				message : "Text",
				persistent : false,
				target : "/TEAMS('TEAM_01')/TEAM_2_EMPLOYEES('1')/Name",
				type : "Warning"
			}]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[0],
				"Warning", "Text");
		}).then(function () {
			var oContext = that.oView.byId("table").getItems()[0].getBindingContext();

			that.expectRequest({
					method : "DELETE",
					url : "EMPLOYEES('1')"
				})
				.expectChange("name", ["Frederic Fall"])
				.expectMessages([]);

			return Promise.all([
				// code under test
				oContext.delete(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity from a relative ODLB with pending changes (POST) in siblings
	// CPOUI5UISERVICESV3-1799
	QUnit.test("Delete entity from rel. ODLB with pending changes in siblings", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true, updateGroupId : "update"}),
			sView = '\
<FlexBox id="detail" binding="{/TEAMS(\'TEAM_01\')}">\
	<Text id="Team_Id" text="{Team_Id}"/>\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Text id="name" text="{Name}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('TEAM_01')?$select=Team_Id"
				+ "&$expand=TEAM_2_EMPLOYEES($select=ID,Name)", {
				Team_Id : "TEAM_01",
				TEAM_2_EMPLOYEES : [{
					ID : "1",
					Name : "Jonathan Smith"
				}, {
					ID : "2",
					Name : "Frederic Fall"
				}]
			})
			.expectChange("Team_Id", "TEAM_01")
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("name", ["John Doe", "Jonathan Smith", "Frederic Fall"]);

			that.oView.byId("table").getBinding("items").create({Name : "John Doe"});

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "EMPLOYEES('1')"
				})
				.expectChange("name", [, "Frederic Fall"]);

			return Promise.all([
				// code under test
				that.oView.byId("table").getItems()[1].getBindingContext().delete("$auto"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Navigate to a detail page (e.g. by passing an entity key via URL parameter),
	// delete the root element and navigate back to the master page. When navigating again to the
	// detail page with the same entity key (e.g. via browser forward/back) no obsolte caches must
	// be used and all bindings shall fail while trying to read the data.
	// BCP: 1970282109
	QUnit.test("Delete removes dependent caches", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="detail" binding="">\
	<Text id="Team_Id" text="{Team_Id}"/>\
	<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$$ownRequest : true}}">\
		<ColumnListItem>\
			<Text id="name" text="{Name}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectChange("Team_Id")
			.expectChange("name", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("TEAMS('TEAM_01')?$select=Team_Id", {
					Team_Id : "TEAM_01"
				})
				.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100", {
					value : [{
						ID : "1",
						Name : "Jonathan Smith"
					}, {
						ID : "2",
						Name : "Frederic Fall"
					}]
				})
				.expectChange("Team_Id", "TEAM_01")
				.expectChange("name", ["Jonathan Smith", "Frederic Fall"]);

			// simulate navigation to a detail page if only a key property is given
			that.oView.byId("detail").setBindingContext(
				that.oModel.bindContext("/TEAMS('TEAM_01')").getBoundContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "DELETE",
					url : "TEAMS('TEAM_01')"
				})
				.expectChange("Team_Id", null);

			return Promise.all([
				// code under test
				that.oView.byId("detail").getBindingContext().delete("$auto"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// simulate failing read of data that has been deleted before
			var oError1 = new Error("404 Not Found"),
				oError2 = new Error("404 Not Found");

			that.oLogMock.expects("error").twice()
				.withExactArgs("Failed to read path /TEAMS('TEAM_01')/Team_Id",
					sinon.match.string, "sap.ui.model.odata.v4.ODataPropertyBinding");
			that.oLogMock.expects("error")
				.withExactArgs("Failed to read path /TEAMS('TEAM_01')",
					sinon.match.string, "sap.ui.model.odata.v4.ODataContextBinding");
			that.oLogMock.expects("error")
				.withExactArgs("Failed to get contexts for "
						+ "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/TEAMS('TEAM_01')/"
						+ "TEAM_2_EMPLOYEES with start index 0 and length 100",
					sinon.match.string, "sap.ui.model.odata.v4.ODataListBinding");
			that.expectRequest("TEAMS('TEAM_01')?$select=Team_Id", oError1)
				.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100", oError2)
				.expectMessages([{
					code : undefined,
					message : "404 Not Found",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "404 Not Found",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);


			// simulate navigation to a detail page if only a key property is given which belongs
			// to a deleted entity; all bindings have to read data again and fail because entity is
			// deleted
			that.oView.byId("detail").setBindingContext(
				that.oModel.bindContext("/TEAMS('TEAM_01')").getBoundContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Delete an entity with messages from a relative ODataContextBinding w/o cache
	QUnit.test("Delete an entity with messages from a relative ODCB w/o cache", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Equipments(Category=\'foo\',ID=\'0815\')}">\
	<FlexBox id="form" binding="{path : \'EQUIPMENT_2_EMPLOYEE\', \
		parameters : {$select : \'__CT__FAKE__Message/__FAKE__Messages\'}}">\
		<layoutData><FlexItemData/></layoutData>\
		<Input id="text" value="{Name}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Equipments(Category='foo',ID='0815')?$select=Category,ID&"
				+ "$expand=EQUIPMENT_2_EMPLOYEE($select=ID,Name,"
				+ "__CT__FAKE__Message/__FAKE__Messages)", {
				Category : "foo",
				ID : "0815",
				EQUIPMENT_2_EMPLOYEE : {
					ID : "1",
					Name : "Jonathan Smith",
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Text",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				}
			})
			.expectChange("text", "Jonathan Smith")
			.expectMessages([{
				code : "1",
				message : "Text",
				persistent : false,
				target : "/Equipments(Category='foo',ID='0815')/EQUIPMENT_2_EMPLOYEE/Name",
				type : "Warning"
			}]);

		return this.createView(assert, sView, oModel).then(function () {
			return that.checkValueState(assert, "text", "Warning", "Text");
		}).then(function () {
			var oContext = that.oView.byId("form").getBindingContext();

			that.expectRequest({
					method : "DELETE",
					url : "EMPLOYEES('1')"
				})
				.expectChange("text", null)
				.expectMessages([]);

			// code under test
			return oContext.delete().then(function () {
				// Wait for the delete first, because it immediately clears the field and then the
				// messages are checked before the response can remove.
				that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Update property within an absolute binding and get bound messages in response
	QUnit.test("Update property (in absolute binding), getting bound messages", function (assert) {
		var oBinding,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{path : \'/EMPLOYEES(\\\'1\\\')\', \
		parameters : {\
			$select : \'__CT__FAKE__Message/__FAKE__Messages\',\
			$$updateGroupId : \'foo\'\
		}}" id="form">\
	<Text id="id" text="{ID}" />\
	<Input id="name" value="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('1')?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages", {
				ID : "1",
				Name : "Jonathan Smith",
				__CT__FAKE__Message : {__FAKE__Messages : []}
			})
			.expectChange("id", "1")
			.expectChange("name", "Jonathan Smith");

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("name").getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('1')",
					payload : {Name : ""}
				}, {
					ID : "1",
					Name : "",
					// unrealistic scenario for OData V4.0 because a PATCH request does not contain
					// selects and Gateway will not return message properties; OData 4.01 feature;
					// if other server implementations send messages, process them anyway
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Enter a name",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				})
				.expectChange("name", "") // triggered by setValue
				.expectMessages([{
					code : "1",
					message : "Enter a name",
					persistent : false,
					target : "/EMPLOYEES('1')/Name",
					type : "Warning"
				}]);

			// code under test
			oBinding.setValue("");

			return Promise.all([
				oModel.submitBatch("foo"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "name", "Warning", "Enter a name");
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('1')",
					payload : {Name : "Hugo"}
				}, {
					ID : "1",
					Name : "Hugo",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				})
				.expectChange("name", "Hugo") // triggered by setValue
				.expectMessages([]);

			// code under test
			oBinding.setValue("Hugo");

			return Promise.all([
				oModel.submitBatch("foo"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "name", "None", "");
		});
	});

	//*********************************************************************************************
	// Scenario: Update property within a relative binding and get bound messages in response
	QUnit.test("Update property (in relative binding), getting bound messages", function (assert) {
		var oBinding,
			oContext,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sPathToMessages = "TEAM_2_EMPLOYEES('1')/__CT__FAKE__Message/__FAKE__Messages",
			sView = '\
<FlexBox binding="{path : \'/TEAMS(\\\'TEAM_01\\\')\', \
		parameters : {\
			$expand : {\
				\'TEAM_2_EMPLOYEES\' : {\
					$select : \'__CT__FAKE__Message/__FAKE__Messages\'\
				}\
			},\
			$$updateGroupId : \'foo\'\
		}}" id="form">\
	<Text id="teamId" text="{Team_Id}" />\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Input id="name" value="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest(
			"TEAMS('TEAM_01')?"
				+ "$expand=TEAM_2_EMPLOYEES($select=ID,Name,__CT__FAKE__Message/__FAKE__Messages)"
				+ "&$select=Team_Id", {
				Team_Id : "TEAM_01",
				TEAM_2_EMPLOYEES : [{
					ID : "1",
					Name : "Jonathan Smith",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				}]
			})
			.expectChange("teamId", "TEAM_01")
			.expectChange("name", ["Jonathan Smith"])
			.expectMessages([]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value");
			oContext = that.oView.byId("form").getBindingContext();

			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('1')",
					payload : {Name : ""}
				}, {
					ID : "1",
					Name : "",
					// unrealistic scenario for OData V4.0 because a PATCH request does not contain
					// selects and Gateway will not return message properties; OData 4.01 feature;
					// if other server implementations send messages, process them anyway
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Enter a name",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				})
				.expectChange("name", [""]) // triggered by setValue
				.expectMessages([{
					code : "1",
					message : "Enter a name",
					persistent : false,
					target : "/TEAMS('TEAM_01')/TEAM_2_EMPLOYEES('1')/Name",
					type : "Warning"
				}]);

			// there are no messages for employee 1
			assert.strictEqual(oContext.getObject(sPathToMessages).length, 0);
			assert.strictEqual(oContext.getObject(sPathToMessages + "/$count"), 0);

			// code under test
			oBinding.setValue("");

			return Promise.all([
				oModel.submitBatch("foo"),
				that.waitForChanges(assert)
			]).then(function () {
				// after the patch there is one message for employee 1
				assert.strictEqual(oContext.getObject(sPathToMessages).length, 1);
				assert.strictEqual(oContext.getObject(sPathToMessages)[0].message, "Enter a name");
				assert.strictEqual(oContext.getObject(sPathToMessages + "/$count"), 1);

				return that.checkValueState(assert,
					that.oView.byId("table").getItems()[0].getCells()[0],
					"Warning", "Enter a name");
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Update property within an entity in a collection and get bound messages in response
	QUnit.test("Update property (in collection), getting bound messages", function (assert) {
		var oBinding,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/EMPLOYEES\', \
		parameters : {\
			$select : \'__CT__FAKE__Message/__FAKE__Messages\',\
			$$updateGroupId : \'foo\'\
		}}">\
	<ColumnListItem>\
		<Input id="name" value="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest(
			"EMPLOYEES?$select=ID,Name,__CT__FAKE__Message/__FAKE__Messages&$skip=0&$top=100", {
				value : [{
					ID : "1",
					Name : "Jonathan Smith",
					__CT__FAKE__Message : {__FAKE__Messages : []}
				}]
			})
			.expectChange("name", ["Jonathan Smith"])
			.expectMessages([]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value");

			that.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('1')",
					payload : {Name : ""}
				}, {
					ID : "1",
					Name : "",
					// unrealistic scenario for OData V4.0 because a PATCH request does not contain
					// selects and Gateway will not return message properties; OData 4.01 feature;
					// if other server implementations send messages, process them anyway
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "1",
							message : "Enter a name",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				})
				.expectChange("name", [""]) // triggered by setValue
				.expectMessages([{
					code : "1",
					message : "Enter a name",
					persistent : false,
					target : "/EMPLOYEES('1')/Name",
					type : "Warning"
				}]);

			// code under test
			oBinding.setValue("");

			return Promise.all([
				oModel.submitBatch("foo"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getItems()[0].getCells()[0],
				"Warning", "Enter a name");
		});
	});

	//*********************************************************************************************
	// Scenario: Modify a property without side effects, i.e. the PATCH request's response is
	// ignored; read the side effects later on via API Context#requestSideEffects and check that the
	// corresponding fields on the UI change. This must work the same way if a first PATCH/GET
	// $batch fails.
	QUnit.test("$$patchWithoutSideEffects, then requestSideEffects", function (assert) {
		var oModel = createModel(sSalesOrderService + "?sap-client=123", {
				autoExpandSelect : true,
				groupId : "$direct", // GET should not count for batchNo
				updateGroupId : "update"
			}),
			sView = '\
<FlexBox binding="{\
			path : \'/SalesOrderList(\\\'42\\\')\',\
			parameters : {$$patchWithoutSideEffects : true}\
		}"\
		id="form">\
	<Input id="netAmount" value="{NetAmount}"/>\
	<Text id="grossAmount" text="{GrossAmount}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?sap-client=123"
					+ "&$select=GrossAmount,NetAmount,SalesOrderID", {
				"@odata.etag" : "ETag0",
				GrossAmount : "119.00",
				NetAmount : "100.00"
//				SalesOrderID : "42"
			})
			.expectChange("netAmount", "100.00")
			.expectChange("grossAmount", "119.00");

		return this.createView(assert, sView, oModel).then(function () {
			var oPromise;

			// don't care about other parameters
			that.oLogMock.expects("error")
				.withArgs("Failed to update path /SalesOrderList('42')/NetAmount");
			that.oLogMock.expects("error")
				.withArgs("Failed to request side effects");

			that.expectChange("netAmount", "-1.00")
				.expectRequest({
					batchNo : 1,
					method : "PATCH",
					url : "SalesOrderList('42')?sap-client=123",
					headers : {"If-Match" : "ETag0"},
					payload : {NetAmount : "-1"}
				}, createError({code : "CODE", message : "Value -1 not allowed"}))
				.expectRequest({
					batchNo : 1,
					method : "GET",
					url : "SalesOrderList('42')?sap-client=123&$select=GrossAmount"
				}) // no response required since the PATCH fails
				.expectMessages([{
					code : "CODE",
					descriptionUrl : undefined,
					message : "Value -1 not allowed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			that.oView.byId("netAmount").getBinding("value").setValue("-1");

			// code under test
			oPromise = that.oView.byId("form").getBindingContext().requestSideEffects([{
				$PropertyPath : "GrossAmount"
			}]).catch(function (oError0) {
				assert.strictEqual(oError0.message,
					"HTTP request was not processed because the previous request failed");
			});

			return Promise.all([
					oPromise,
					oModel.submitBatch("update"),
					that.waitForChanges(assert)
				]);
		}).then(function () {
			// remove persistent, technical messages from above
			sap.ui.getCore().getMessageManager().removeAllMessages();

			that.expectMessages([]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("netAmount", "200.00")
				.expectRequest({
					batchNo : 2,
					method : "PATCH",
					url : "SalesOrderList('42')?sap-client=123",
					headers : {"If-Match" : "ETag0"},
					payload : {NetAmount : "200"}
				}, {
					"@odata.etag" : "ETag1",
					GrossAmount : "238.00", // side effect
					NetAmount : "200.00" // "side effect": decimal places added
//					SalesOrderID : "42"
				});

			that.oView.byId("netAmount").getBinding("value").setValue("200");

			return Promise.all([
					oModel.submitBatch("update"),
					that.waitForChanges(assert)
				]);
		}).then(function () {
			var oPromise;

			that.expectChange("netAmount", "0.00"); // external value: 200.00 -> 0.00

			that.oView.byId("netAmount").getBinding("value").setValue("0");

			// code under test
			oPromise = that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "NetAmount" // order MUST not matter
				}, {
					$PropertyPath : "GrossAmount"
				}, {
					$PropertyPath : "TaxAmount" // must be ignored due to intersection
				}]).then(function (vResult) {
					assert.strictEqual(vResult, undefined);
				});

			that.expectRequest({
					batchNo : 3,
					method : "PATCH",
					url : "SalesOrderList('42')?sap-client=123",
					headers : {"If-Match" : "ETag1"}, // new ETag is used!
					payload : {NetAmount : "0"}
				}, {
//					"@odata.etag" : "ETag2", // not ignored, but unused by the rest of this test
					GrossAmount : "0.00", // side effect
					NetAmount : "0.00", // "side effect": decimal places added
					Messages : [{ // "side effect": ignored by $$patchWithoutSideEffects
						code : "n/a",
						message : "n/a",
						numericSeverity : 3,
						target : "NetAmount"
					}]
//					SalesOrderID : "42"
				})
				.expectRequest({
					batchNo : 3,
					method : "GET",
					url : "SalesOrderList('42')?sap-client=123&$select=GrossAmount,NetAmount"
				}, {
//					"@odata.etag" : "ETag2",
					GrossAmount : "0.00", // side effect
					NetAmount : "0.00", // "side effect": decimal places added
					Messages : [{ // side effect: reported, even if not selected
						code : "23",
						message : "Enter a minimum amount of 1",
						numericSeverity : 3,
						target : "NetAmount"
					}]
				})
				.expectChange("grossAmount", "0.00")
				.expectChange("netAmount", "0.00") // internal value has changed: 0 -> 0.00
				.expectMessages([{
					code : "23",
					message : "Enter a minimum amount of 1",
					persistent : false,
					target : "/SalesOrderList('42')/NetAmount",
					technical : false,
					type : "Warning"
				}]);

			return Promise.all([
				oModel.submitBatch("update"),
				oPromise,
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "TaxAmount" // must be ignored due to intersection
				}]), // no GET request, no issue with locks!
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "netAmount",
				"Warning", "Enter a minimum amount of 1");
		});
	});

	//*********************************************************************************************
	// Scenario: Modify a property within a list binding with $$patchWithoutSideEffects, then modify
	// in a context binding that inherits the parameter
	// CPOUI5UISERVICESV3-1684
	QUnit.test("$$patchWithoutSideEffects in list binding and inherited", function (assert) {
		var oModel = createModel(sSalesOrderService, {autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{path : \'/SalesOrderList\',\
		parameters : {$$patchWithoutSideEffects : true}}">\
	<ColumnListItem>\
		<Input id="listNote" value="{Note}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="form" binding="{path : \'\', parameters : {$$ownRequest : true}}">\
	<Input id="formNote" value="{Note}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=100", {
				value : [{
					"@odata.etag" : "ETag0",
					Note : "Note",
					SalesOrderID : "42"
				}]
			})
			.expectChange("listNote", ["Note"])
			.expectChange("formNote");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("listNote", ["Note (entered)"])
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag0"},
					payload : {Note : "Note (entered)"}
				}, {
					"@odata.etag" : "ETag1",
					Note : "Note (from server)", // side effect
					SalesOrderID : "42"
				});

			that.oView.byId("table").getItems()[0].getCells()[0].getBinding("value")
				.setValue("Note (entered)");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
					"@odata.etag" : "ETag1",
					Note : "Note (from server)",
					SalesOrderID : "42"
				})
				.expectChange("formNote", "Note (from server)");

			that.oView.byId("form").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[0]
			);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("formNote", "Note (entered)")
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('42')",
					headers : {"If-Match" : "ETag1"},
					payload : {Note : "Note (entered)"}
				}, {
					"@odata.etag" : "ETag2",
					Note : "Note (from server)", // side effect
					SalesOrderID : "42"
				});

			that.oView.byId("formNote").getBinding("value").setValue("Note (entered)");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Read side effects which include navigation properties while there are pending
	// changes.
	QUnit.test("requestSideEffects with navigation properties", function (assert) {
		var oModel = createSpecialCasesModel({
				autoExpandSelect : true,
				groupId : "$direct", // GET should not count for batchNo
				updateGroupId : "update"
			}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Input id="id" value="{ArtistID}" />\
	<Text id="inProcessByUser" text="{DraftAdministrativeData/InProcessByUser}" />\
	<Text binding="{DraftAdministrativeData}" id="inProcessByUser2" text="{InProcessByUser}" />\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity"
				+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)", {
				"@odata.etag" : "ETag0",
				ArtistID : "42",
				DraftAdministrativeData : {
					DraftID : "23",
					InProcessByUser : "foo"
				}
//				IsActiveEntity : true
			})
			.expectChange("id", "42")
			.expectChange("inProcessByUser", "foo")
			.expectChange("inProcessByUser2", "foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("id", "TAFKAP");

			that.oView.byId("id").getBinding("value").setValue("TAFKAP");

			that.expectRequest({
					batchNo : 1,
					method : "PATCH",
					url : "Artists(ArtistID='42',IsActiveEntity=true)",
					headers : {"If-Match" : "ETag0"},
					payload : {ArtistID : "TAFKAP"}
				}, {/* response does not matter here */})
				.expectRequest({
					batchNo : 1,
					method : "GET",
					url : "Artists(ArtistID='42',IsActiveEntity=true)"
						+ "?$select=DraftAdministrativeData"
						+ "&$expand=DraftAdministrativeData($select=InProcessByUser)"
				}, {
					DraftAdministrativeData : {InProcessByUser : "bar"}
				})
				.expectChange("inProcessByUser", "bar")
				.expectChange("inProcessByUser2", "bar");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "DraftAdministrativeData/InProcessByUser"
				}]),
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Read side effects via $NavigationPropertyPath. The dependent binding must be
	// refreshed.
	QUnit.test("requestSideEffects with $NavigationPropertyPath", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{}" id="section">\
		<Text binding="{path : \'DraftAdministrativeData\', parameters : {$$ownRequest : true}}"\
			id="inProcessByUser" text="{InProcessByUser}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/DraftAdministrativeData"
				+ "?$select=DraftID,InProcessByUser", {
//				DraftID : "23",
				InProcessByUser : "foo"
			})
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity", {
				ArtistID : "42"
//				IsActiveEntity : true
			})
			.expectChange("id", "42")
			.expectChange("inProcessByUser", "foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
					+ "?$select=ArtistID,IsActiveEntity", {
					ArtistID : "42"
//					IsActiveEntity : true
				})
				.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/DraftAdministrativeData"
					+ "?$select=DraftID,InProcessByUser", {
//					DraftID : "23",
					InProcessByUser : "bar"
				})
				.expectChange("inProcessByUser", "bar");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$NavigationPropertyPath : ""
				}, { // Note: this makes no difference, "" wins
					$NavigationPropertyPath : "DraftAdministrativeData"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/DraftAdministrativeData"
					+ "?$select=DraftID,InProcessByUser", {
//					DraftID : "23",
					InProcessByUser : "foo"
				})
				.expectChange("inProcessByUser", "foo");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$NavigationPropertyPath : "DraftAdministrativeData"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: requestSideEffects delivers a new entity. See that it can be patched later on.
	// JIRA: CPOUI5UISERVICESV3-1992
	QUnit.test("requestSideEffects delivers a new entity", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'1\')}" id="form">\
	<Input id="company" value="{SO_2_BP/CompanyName}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=SalesOrderID"
			+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)", {
				SalesOrderID : "1",
				SO_2_BP : null
			})
			.expectChange("company", null);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("SalesOrderList('1')?$select=SO_2_BP"
				+ "&$expand=SO_2_BP($select=BusinessPartnerID,CompanyName)", {
					SO_2_BP : {
						"@odata.etag" : "ETag",
						BusinessPartnerID : "42",
						CompanyName : "Company"
					}
				})
				.expectChange("company", "Company");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$NavigationPropertyPath : "SO_2_BP"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("company", "changed")
				.expectRequest({
					headers : {"If-Match" : "ETag"},
					method : "PATCH",
					payload : {CompanyName : "changed"},
					url : "BusinessPartnerList('42')"
				});

			that.oView.byId("company").getBinding("value").setValue("changed");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: read side effects which affect dependent bindings.
	QUnit.test("requestSideEffects: dependent bindings #1", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{}" id="section">\
		<Text binding="{\
				path : \'DraftAdministrativeData\',\
				parameters : {$$ownRequest : true}\
			}" id="inProcessByUser" text="{InProcessByUser}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/DraftAdministrativeData"
				+ "?$select=DraftID,InProcessByUser", {
				DraftID : "23",
				InProcessByUser : "foo"
			})
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity", {
				ArtistID : "42"
//				IsActiveEntity : true
			})
			.expectChange("id", "42")
			.expectChange("inProcessByUser", "foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/DraftAdministrativeData"
					+ "?$select=InProcessByUser", {
					InProcessByUser : "bar"
				})
				.expectChange("inProcessByUser", "bar");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "DraftAdministrativeData/InProcessByUser"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: read side effects which affect dependent bindings; add some unnecessary context
	// bindings
	QUnit.test("requestSideEffects: dependent bindings #2", function (assert) {
		var sDraftAdministrativeData = "Artists(ArtistID='42',IsActiveEntity=true)"
				+ "/BestFriend/BestFriend/DraftAdministrativeData",
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{BestFriend}" id="section">\
		<FlexBox binding="{BestFriend}" id="section2">\
			<Text binding="{\
					path : \'DraftAdministrativeData\',\
					parameters : {$$ownRequest : true}\
				}" id="inProcessByUser" text="{InProcessByUser}" />\
		</FlexBox>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest(sDraftAdministrativeData + "?$select=DraftID,InProcessByUser", {
				DraftID : "23",
				InProcessByUser : "foo"
			})
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity"
				//TODO CPOUI5UISERVICESV3-1677: Avoid unnecessary $expand
				+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity"
					+ ";$expand=BestFriend($select=ArtistID,IsActiveEntity))", {
				ArtistID : "42"
//				IsActiveEntity : true
			})
			.expectChange("id", "42")
			.expectChange("inProcessByUser", "foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(sDraftAdministrativeData + "?$select=InProcessByUser", {
					InProcessByUser : "bar"
				})
				.expectChange("inProcessByUser", "bar");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestFriend/BestFriend/DraftAdministrativeData/InProcessByUser"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: read side effects which affect dependent bindings; add some unnecessary context
	// bindings
	//TODO Enable autoExpandSelect once CPOUI5UISERVICESV3-1677 has been solved!
	QUnit.test("requestSideEffects: dependent bindings #3", function (assert) {
		var sDraftAdministrativeData = "Artists(ArtistID='42',IsActiveEntity=true)"
				+ "/BestFriend/_Friend(ArtistID='42',IsActiveEntity=true)/DraftAdministrativeData",
			oModel = createSpecialCasesModel({autoExpandSelect : false}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{BestFriend}" id="section">\
		<FlexBox binding="{_Friend(ArtistID=\'42\',IsActiveEntity=true)}" id="section2">\
			<Text binding="{\
					path : \'DraftAdministrativeData\',\
					parameters : {$$ownRequest : true}\
				}" id="inProcessByUser" text="{InProcessByUser}" />\
		</FlexBox>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				/*+ "?$select=ArtistID,IsActiveEntity"*/, {
				ArtistID : "42"
//				IsActiveEntity : true
			})
			.expectRequest(sDraftAdministrativeData/* + "?$select=DraftID,InProcessByUser"*/, {
				DraftID : "23",
				InProcessByUser : "foo"
			})
			.expectChange("id", "42")
			.expectChange("inProcessByUser", "foo");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest(sDraftAdministrativeData + "?$select=InProcessByUser", {
					InProcessByUser : "bar"
				})
				.expectChange("inProcessByUser", "bar");

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestFriend/_Friend/DraftAdministrativeData/InProcessByUser"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Read side effects via collection-valued $NavigationPropertyPath.
	// There is a child binding w/o own cache for the collection-valued navigation property affected
	// by the side effect; the whole collection is refreshed using $expand; eventing is OK to update
	// the UI.
	// Note: This works the same with a grid table, except for CPOUI5UISERVICESV3-1685.
	[false, true].forEach(function (bGrowing) {
		var sTitle = "requestSideEffects with collection-valued navigation; growing = " + bGrowing;

		QUnit.test(sTitle, function (assert) {
			var oModel = createSpecialCasesModel({autoExpandSelect : true}),
				sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{BestFriend}" id="section">\
		<Table growing="' + bGrowing + '" id="table" items="{_Publication}">\
			<ColumnListItem>\
				<Text id="price" text="{Price}" />\
			</ColumnListItem>\
		</Table>\
	</FlexBox>\
</FlexBox>',
				that = this;

			this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
					+ "?$select=ArtistID,IsActiveEntity"
					+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity"
						+ ";$expand=_Publication($select=Price,PublicationID))", {
					ArtistID : "42",
//					IsActiveEntity : true,
					BestFriend : {
						ArtistID : "23",
//						IsActiveEntity : true,
						_Publication : [{
							Price : "9.99"
//							"PublicationID" "42-0":
						}]
					}
				})
				.expectChange("id", "42")
				.expectChange("price", ["9.99"]);

			return this.createView(assert, sView, oModel).then(function () {
				that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?$select=BestFriend"
						+ "&$expand=BestFriend($select=_Publication"
							+ ";$expand=_Publication($select=Price,PublicationID))", {
						BestFriend : {
							_Publication : [{
								Price : "7.77"
//								"PublicationID" "42-0":
							}]
						}
					})
					.expectChange("price", ["7.77"]);

				return Promise.all([
					// code under test
					that.oView.byId("form").getBindingContext().requestSideEffects([{
						$NavigationPropertyPath : "BestFriend/_Publication"
					}]),
					that.waitForChanges(assert)
				]);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Read side effects for a collection-valued navigation property where only a single
	// property is affected. There is a child binding with own cache for the collection affected
	// by the side effect; instead of refreshing the whole collection, an efficient request is sent.
	QUnit.test("requestSideEffects for a single property of a collection", function (assert) {
		var oModel = createModel("/special/cases/?sap-client=123", {autoExpandSelect : true}),
			sView = '\
<Text id="count" text="{$count}"/>\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{BestFriend}" id="section">\
		<t:Table firstVisibleRow="1" id="table"\
				rows="{path : \'_Publication\', parameters : {$count : true,\
					$filter : \'CurrencyCode eq \\\'EUR\\\'\', $orderby : \'PublicationID\',\
					$$ownRequest : true}}"\
			threshold="0" visibleRowCount="2">\
			<t:Column>\
				<t:template>\
					<Input id="price" value="{Price}" />\
				</t:template>\
			</t:Column>\
			<t:Column>\
				<t:template>\
					<Text id="currency" text="{CurrencyCode}" />\
				</t:template>\
			</t:Column>\
			<t:Column>\
				<t:template>\
					<Text id="inProcessByUser" text="{DraftAdministrativeData/InProcessByUser}" />\
				</t:template>\
			</t:Column>\
			<t:Column>\
				<t:template>\
					<Text id="name" text="{_Artist/Name}" />\
				</t:template>\
			</t:Column>\
		</t:Table>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?sap-client=123&$select=ArtistID,IsActiveEntity"
				//TODO CPOUI5UISERVICESV3-1677: Avoid unnecessary $expand
				+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity)", {
				ArtistID : "42"
//					IsActiveEntity : true
			})
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
				+ "?sap-client=123&$count=true&$filter=CurrencyCode eq 'EUR'"
				+ "&$orderby=PublicationID&$select=CurrencyCode,Price,PublicationID"
				+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)"
				+ ",_Artist($select=ArtistID,IsActiveEntity,Name)&$skip=1&$top=2", {
				"@odata.count" : "10",
				value : [{
					_Artist : {
						ArtistID : "42",
//						IsActiveEntity : true,
						Name : "Hour Frustrated"
					},
					CurrencyCode : "EUR",
					DraftAdministrativeData : null,
					Price : "9.11", // Note: 9.ii for old value at index i, 7.ii for new value
					PublicationID : "42-1"
				}, {
					_Artist : null,
					CurrencyCode : "EUR",
					DraftAdministrativeData : null,
					Price : "9.22",
					PublicationID : "42-2"
				}]
			})
			.expectChange("count")
			.expectChange("id", "42")
			.expectChange("price", [, "9.11", "9.22"])
			.expectChange("currency", [, "EUR", "EUR"])
			.expectChange("inProcessByUser")
			.expectChange("name", [, "Hour Frustrated"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("count", "10"); // must not be affected by side effects below!

			that.oView.byId("count").setBindingContext(
				that.oView.byId("table").getBinding("rows").getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
					+ "?sap-client=123"
					+ "&$filter=PublicationID eq '42-1' or PublicationID eq '42-2'"
					+ "&$select=Price,PublicationID&$expand=_Artist($select=Name)", {
					value : [{
						_Artist : null, // side effect
						Price : "7.11", // side effect
						PublicationID : "42-1"
					}, {
						_Artist : { // side effect
							ArtistID : "42a",
//							IsActiveEntity : true,
							Name : "Minute Frustrated"
						},
						Messages : [{ // side effect: reported, even if not selected
							code : "23",
							message : "This looks pretty cheap now",
							numericSeverity : 2,
							target : "Price"
						}],
						Price : "7.22", // side effect
						PublicationID : "42-2"
					}]
				})
				.expectChange("price", [, "7.11", "7.22"])
				.expectChange("name", [, null, "Minute Frustrated"])
				.expectMessages([{
					code : "23",
					message : "This looks pretty cheap now",
					persistent : false,
					target : "/Artists(ArtistID='42',IsActiveEntity=true)/BestFriend"
						+ "/_Publication('42-2')/Price",
					technical : false,
					type : "Information"
				}]);

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestFriend/_Publication/Price"
				}, {
					$PropertyPath : "BestFriend/_Publication/_Artist/Name"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert,
				that.oView.byId("table").getRows()[1].getCells()[0],
				"Information", "This looks pretty cheap now");
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
					+ "?sap-client=123&$count=true&$filter=CurrencyCode eq 'EUR'"
					+ "&$orderby=PublicationID&$select=CurrencyCode,Price,PublicationID"
					+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)"
					+ ",_Artist($select=ArtistID,IsActiveEntity,Name)&$skip=7&$top=2", {
					"@odata.count" : "10",
					value : [{
						_Artist : null,
						CurrencyCode : "EUR",
						DraftAdministrativeData : null,
						Price : "7.77",
						PublicationID : "42-7"
					}, {
						_Artist : null,
						CurrencyCode : "EUR",
						DraftAdministrativeData : null,
						Price : "7.88",
						PublicationID : "42-8"
					}]
				})
				// "price" temporarily loses its binding context and thus fires a change event
				.expectChange("price", null, null)
				.expectChange("price", null, null)
				// "currency" temporarily loses its binding context and thus fires a change event
				.expectChange("currency", null, null)
				.expectChange("currency", null, null)
				// "name" temporarily loses its binding context and thus fires a change event
				.expectChange("name", null, null)
				.expectChange("price", [,,,,,,, "7.77", "7.88"])
				.expectChange("currency", [,,,,,,, "EUR", "EUR"]);

			that.oView.byId("table").setFirstVisibleRow(7);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
					+ "?sap-client=123"
					+ "&$filter=PublicationID eq '42-7' or PublicationID eq '42-8'"
					+ "&$select=Price,PublicationID", {
					value : [{ // Note: different order than before!
						Price : "5.88", // side effect
						PublicationID : "42-8"
					}, {
						Price : "5.77", // side effect
						PublicationID : "42-7"
					}]
				})
				.expectChange("price", [,,,,,,, "5.77",  "5.88"]);

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestFriend/_Publication/Price"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
					+ "?sap-client=123&$count=true&$filter=CurrencyCode eq 'EUR'"
					+ "&$orderby=PublicationID&$select=CurrencyCode,Price,PublicationID"
					+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)"
					+ ",_Artist($select=ArtistID,IsActiveEntity,Name)&$skip=1&$top=2", {
					"@odata.count" : "10",
					value : [{
						_Artist : null,
						CurrencyCode : "EUR",
						DraftAdministrativeData : null,
						Price : "5.11",
						PublicationID : "42-1"
					}, {
						_Artist : null,
						CurrencyCode : "EUR",
						DraftAdministrativeData : null,
						Price : "5.22",
						PublicationID : "42-2"
					}]
				})
				.expectChange("price", [, "5.11", "5.22"]);
				// Note: "currency" cells do not change

			// Note: invisible, cached data was not updated and thus must be read again
			that.oView.byId("table").setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Read side effects for a collection-valued navigation property where only a single
	// property is affected. There is a child binding with own cache for the collection affected
	// by the side effect; instead of refreshing the whole collection, an efficient request is sent.
	// Additionally, there are detail "views" (form and table) which send their own requests and are
	// affected by the side effect.
	// Finally, read a side effect that affects a single row, refreshing it completely.
	QUnit.test("requestSideEffects: collection & master/detail", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{BestFriend}" id="section">\
		<Table id="table" items="{path : \'_Publication\', parameters : {$$ownRequest : true}}">\
			<ColumnListItem>\
				<Text id="price" text="{Price}" />\
				<Text id="currency" text="{CurrencyCode}" />\
			</ColumnListItem>\
		</Table>\
	</FlexBox>\
</FlexBox>\
<FlexBox binding="{path : \'\', parameters : {$$ownRequest : true}}" id="detail">\
	<Text id="priceDetail" text="{Price}" />\
	<Text id="currencyDetail" text="{CurrencyCode}" />\
	<Text id="inProcessByUser" text="{DraftAdministrativeData/InProcessByUser}" />\
</FlexBox>\
<Table id="detailTable" items="{_Artist/_Friend}">\
	<ColumnListItem>\
		<Text id="idDetail" text="{ArtistID}" />\
		<Text id="nameDetail" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
				+ "?$select=CurrencyCode,Price,PublicationID&$skip=0&$top=100", {
				value : [{
					CurrencyCode : "EUR",
					Price : "9.00", // Note: 9.ii for old value at index i, 7.ii for new value
					PublicationID : "42-0"
				}, {
					CurrencyCode : "EUR",
					Price : "9.11",
					PublicationID : "42-1"
				}]
			})
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity"
				//TODO CPOUI5UISERVICESV3-1677: Avoid unnecessary $expand
				+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity)", {
				ArtistID : "42"
//					IsActiveEntity : true
			})
			.expectChange("id", "42")
			.expectChange("price", ["9.00", "9.11"])
			.expectChange("currency", ["EUR", "EUR"])
			.expectChange("priceDetail")
			.expectChange("currencyDetail")
			.expectChange("inProcessByUser")
			.expectChange("idDetail", [])
			.expectChange("nameDetail", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend"
					+ "/_Publication('42-0')?$select=CurrencyCode,Price,PublicationID"
					+ "&$expand=DraftAdministrativeData($select=DraftID,InProcessByUser)", {
					CurrencyCode : "EUR",
					DraftAdministrativeData : {
						DraftID : "1",
						InProcessByUser : "JOHNDOE"
					},
					Price : "9.00",
					PublicationID : "42-0"
				})
				.expectChange("priceDetail", "9.00")
				.expectChange("currencyDetail", "EUR")
				.expectChange("inProcessByUser", "JOHNDOE");

			that.oView.byId("detail").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[0]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
					+ "?$select=Price,PublicationID"
					+ "&$filter=PublicationID eq '42-0' or PublicationID eq '42-1'", {
					value : [{
						Price : "7.11", // side effect
						PublicationID : "42-1"
					}, {
						Price : "7.00", // side effect
						PublicationID : "42-0"
					}]
				})
				.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend"
					+ "/_Publication('42-0')?$select=Price"
					+ "&$expand=DraftAdministrativeData($select=InProcessByUser)", {
					DraftAdministrativeData : {InProcessByUser : "JANEDOE"},
					Price : "7.00"
				})
				.expectChange("priceDetail", "7.00")
				.expectChange("inProcessByUser", "JANEDOE")
				.expectChange("price", ["7.00", "7.11"]);

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestFriend/_Publication/Price"
				}, {
					$PropertyPath : "BestFriend/_Publication/DraftAdministrativeData/InProcessByUser"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend"
					+ "/_Publication('42-1')/_Artist/_Friend?$select=ArtistID,IsActiveEntity,Name"
					+ "&$skip=0&$top=100", {
					value : [{
						ArtistID : "0",
						IsActiveEntity : true,
						Name : "TAFKAP"
					}, {
						ArtistID : "1",
						IsActiveEntity : false,
						Name : "John & Jane"
					}]
				})
				.expectChange("idDetail", ["0", "1"])
				.expectChange("nameDetail", ["TAFKAP", "John & Jane"]);

			that.oView.byId("detailTable").setBindingContext(
				that.oView.byId("table").getBinding("items").getCurrentContexts()[1]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend"
					+ "/_Publication('42-1')/_Artist/_Friend?$select=ArtistID,IsActiveEntity,Name"
					+ "&$filter=ArtistID eq '0' and IsActiveEntity eq true"
					+ " or ArtistID eq '1' and IsActiveEntity eq false", {
					value : [{
						ArtistID : "0",
						IsActiveEntity : true,
						Name : "TAFKAP (1)"
					}, {
						ArtistID : "1",
						IsActiveEntity : false,
						Name : "John | Jane"
					}]
				})
				.expectChange("nameDetail", ["TAFKAP (1)", "John | Jane"]);

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestFriend/_Publication/_Artist/_Friend/Name"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var o2ndRowContext
					= that.oView.byId("table").getBinding("items").getCurrentContexts()[1];

			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend"
				+ "/_Publication('42-1')?$select=CurrencyCode,Price,PublicationID", {
					CurrencyCode : "JPY",
					Price : "123", // side effect
					PublicationID : "42-1"
				})
				.expectChange("price", [, "123"])
				.expectChange("currency", [, "JPY"]);

			//TODO @see CPOUI5UISERVICESV3-1832: open issue with autoExpandSelect, detailTable
			// would not send own request anymore because master table's oCachePromise becomes
			// pending again (see PS1 of POC #4122940); workaround by removing binding context
			that.oView.byId("detailTable").setBindingContext(null);

			return Promise.all([
				// code under test
				o2ndRowContext.requestSideEffects([{
					$NavigationPropertyPath : ""
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Read side effects on a single row of a table with a row context. We expect that
	// this
	//  (a) only loads side effects for the corresponding single context, not all current contexts
	//  (b) does not invalidate the other contexts, esp. the contexts belonging to currently not
	//     visible rows
	//  (c) can be called on both a non-transient, created entity and an entity loaded from the
	//     server
	// Load side effects for the complete table using the header context.
	// CPOUI5UISERVICESV3-1765
	QUnit.test("requestSideEffects on context of a list binding", function (assert) {
		var oBinding,
			oCreatedContext0,
			oModel = createSpecialCasesModel({autoExpandSelect : true, updateGroupId : "update"}),
			oTable,
			sView = '\
<t:Table id="table" rows="{/Artists(\'42\')/_Publication}" threshold="0" visibleRowCount="2">\
	<t:Column>\
		<t:template>\
			<Text id="id" text="{PublicationID}" />\
		</t:template>\
	</t:Column>\
	<t:Column>\
		<t:template>\
			<Text id="price" text="{Price}" />\
		</t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("Artists('42')/_Publication?$select=Price,PublicationID"
				+ "&$skip=0&$top=2", {
				value : [{
					Price : "1.11",
					PublicationID : "42-1"
				}, {
					Price : "2.22",
					PublicationID : "42-2"
				}]
			})
			.expectChange("id", ["42-1", "42-2"])
			.expectChange("price", ["1.11", "2.22"]);

		return this.createView(assert, sView, oModel).then(function () {
			oTable = that.oView.byId("table");
			oBinding = oTable.getBinding("rows");

			that.expectChange("id", ["New 1", "42-1"])
				.expectChange("price", [null, "1.11"]);

			oCreatedContext0 = oBinding.create({PublicationID : "New 1"}, true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "Artists('42')/_Publication",
					payload : {PublicationID : "New 1"}
				}, {
					Price : "3.33",
					PublicationID : "New 1"
				})
				.expectChange("price", ["3.33"]);

			return Promise.all([
				oCreatedContext0.created(),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Artists('42')/_Publication"
					+ "?$select=Price,PublicationID"
					+ "&$filter=PublicationID eq '42-1'", {
					value : [{
						Price : "1.12",
						PublicationID : "42-1"
					}]
				})
				.expectChange("price", [,"1.12"]);

			return Promise.all([
				// code under test: request side effects on "not-created" entity from server
				oTable.getRows()[1].getBindingContext().requestSideEffects([{
					$PropertyPath : "Price"
				}]),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Artists('42')/_Publication('New 1')"
					+ "?$select=Price,PublicationID", {
					Price : "3.34",
					PublicationID : "New 1"
					})
				.expectChange("price", ["3.34"]);

			return Promise.all([
				// code under test: request side effects on non-transient created entity
				oTable.getRows()[0].getBindingContext().requestSideEffects([{
					$NavigationPropertyPath : ""
				}]),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// Note: no data invalidation by requestSideEffects => no request expected
			that.expectChange("id", [, "42-1", "42-2"])
				.expectChange("price", [, "1.12", "2.22"]);

			oTable.setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Artists('42')/_Publication"
					+ "?$select=Price,PublicationID"
					+ "&$filter=PublicationID eq 'New 1' or "
					+ "PublicationID eq '42-1' or PublicationID eq '42-2'", {
						value : [{
							Price : "3.35",
							PublicationID : "New 1"
						}, {
							Price : "1.13",
							PublicationID : "42-1"
						}, {
							Price : "2.23",
							PublicationID : "42-2"
						}]
				})
				.expectChange("price", [, "1.13", "2.23"]);

			return Promise.all([
				// code under test: call on header context loads side effects for the whole binding
				oTable.getBinding("rows").getHeaderContext().requestSideEffects([{
					$PropertyPath : "Price"
				}]),
				that.oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects on a context binding without an own cache, relative to a
	// context binding with a cache.
	// CPOUI5UISERVICESV3-1707
	QUnit.test("requestSideEffects: relative to a context binding", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="form">\
	<FlexBox binding="{BestFriend}" id="bestFriend">\
		<Text id="name" text="{Name}" />\
		<FlexBox binding="{BestPublication}" id="bestPublication">\
			<Text id="bestPublication::currency" text="{CurrencyCode}" />\
		</FlexBox>\
		<Table id="publication" \
				items="{path : \'_Publication\', parameters : {$$ownRequest : true}}">\
			<ColumnListItem>\
				<Text id="currency" text="{CurrencyCode}" />\
			</ColumnListItem>\
		</Table>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity"
				+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity,Name;"
					+ "$expand=BestPublication($select=CurrencyCode,PublicationID))", {
				ArtistID : "42",
				IsActiveEntity : true,
				BestFriend : {
					ArtistID : "23",
					BestPublication : {
						CurrencyCode : "JPY",
						PublicationID : "13"
					},
					IsActiveEntity : true,
					Name : "Best Friend"
				}
			})
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
				+ "?$select=CurrencyCode,PublicationID&$skip=0&$top=100", {
				value : [{
					CurrencyCode : "EUR",
					PublicationID : "1"
				}, {
					CurrencyCode : "USD",
					PublicationID : "2"
				}]
			})
			.expectChange("currency", ["EUR",  "USD"])
			.expectChange("bestPublication::currency", "JPY")
			.expectChange("name", "Best Friend");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?$select=BestFriend"
					+ "&$expand=BestFriend($select=Name;"
						+ "$expand=BestPublication($select=CurrencyCode))", {
					BestFriend : {
						BestPublication : {
							CurrencyCode : "JPY2"
						},
						Name : "Best Friend2"
					}
				})
				.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)/BestFriend/_Publication"
					+ "?$select=CurrencyCode,PublicationID&$skip=0&$top=100", {
					value : [{
						CurrencyCode : "EUR2",
						PublicationID : "1"
					}, {
						CurrencyCode : "USD2",
						PublicationID : "2"
					}]
				})
				.expectChange("currency", ["EUR2",  "USD2"])
				.expectChange("bestPublication::currency", "JPY2")
				.expectChange("name", "Best Friend2");

			return Promise.all([
				// code under test
				that.oView.byId("bestFriend").getBindingContext().requestSideEffects([{
					$PropertyPath : "BestPublication/CurrencyCode"
				}, {
					$PropertyPath : "Name"
				}, {
					$NavigationPropertyPath : "_Publication"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?$select=BestFriend"
					+ "&$expand=BestFriend($select=BestPublication;"
						+ "$expand=BestPublication($select=CurrencyCode))", {
					BestFriend : {
						BestPublication : {
							CurrencyCode : "USD"
						}
					}
				})
				.expectChange("bestPublication::currency", "USD");

			return Promise.all([
				// code under test
				that.oView.byId("bestPublication").getBindingContext().requestSideEffects([{
					$PropertyPath : "CurrencyCode"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects on a context binding without an own cache, relative to a list
	// binding with a cache.
	// CPOUI5UISERVICESV3-1707
	QUnit.test("requestSideEffects: relative to a list binding", function (assert) {
		var oBestFriendBox,
			oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/Artists}">\
	<ColumnListItem>\
		<FlexBox binding="{BestFriend}"> \
			<Text id="name" text="{Name}" />\
			<FlexBox binding="{BestPublication}" id="bestPublication">\
				<Text id="currency" text="{CurrencyCode}" />\
			</FlexBox>\
		</FlexBox>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("Artists"
				+ "?$select=ArtistID,IsActiveEntity"
				+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity,Name;"
					+ "$expand=BestPublication($select=CurrencyCode,PublicationID))"
				+ "&$skip=0&$top=100", {
				value : [{
					ArtistID : "23",
					BestFriend : {
						ArtistID : "43",
						BestPublication : {
							CurrencyCode : "GBP",
							PublicationID : "13"
						},
						IsActiveEntity : true,
						Name : "Best Friend of 23"
					},
					IsActiveEntity : true
				}, {
					ArtistID : "24",
					BestFriend : {
						ArtistID : "44",
						BestPublication : {
							CurrencyCode : "JPY",
							PublicationID : "14"
						},
						IsActiveEntity : true,
						Name : "Best Friend of 24"
					},
					IsActiveEntity : true
				}]
			})
			.expectChange("currency", "GBP")
			.expectChange("currency", "JPY")
			.expectChange("name", "Best Friend of 23")
			.expectChange("name", "Best Friend of 24");

		return this.createView(assert, sView, oModel).then(function () {
			oBestFriendBox = that.oView.byId("table").getItems()[1].getCells()[0];

			that.expectRequest("Artists?$select=ArtistID,IsActiveEntity"
					+ "&$expand=BestFriend($select=Name;"
						+ "$expand=BestPublication($select=CurrencyCode))"
					+ "&$filter=ArtistID eq '24' and IsActiveEntity eq true", {
					value : [{
						ArtistID : "24",
						BestFriend : {
							BestPublication : {
								CurrencyCode : "JPY2"
							},
							Name : "New Best Friend of 24"
						},
						IsActiveEntity : true
					}]
				})
				.expectChange("currency", "JPY2")
				.expectChange("name", "New Best Friend of 24");

			return Promise.all([
				// code under test
				oBestFriendBox.getBindingContext()
					.requestSideEffects([{
						$PropertyPath : "BestPublication/CurrencyCode"
					}, {
						$PropertyPath : "Name"
					}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oBestPublicationBox = oBestFriendBox.getItems()[1];

			that.expectRequest("Artists?$select=ArtistID,IsActiveEntity"
					+ "&$expand=BestFriend($select=BestPublication;"
						+ "$expand=BestPublication($select=CurrencyCode))"
					+ "&$filter=ArtistID eq '24' and IsActiveEntity eq true", {
					value : [{
						ArtistID : "24",
						BestFriend : {
							BestPublication : {
								CurrencyCode : "JPY3"
							}
						},
						IsActiveEntity : true
					}]
				})
				.expectChange("currency", "JPY3");

			return Promise.all([
				// code under test
				oBestPublicationBox.getBindingContext().requestSideEffects([{
					$PropertyPath : "CurrencyCode"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects on a context binding with an empty path and cache, relative to
	// a context binding with a cache. Side effects are requested on the parent binding.
	// CPOUI5UISERVICESV3-1984
	QUnit.test("requestSideEffects: skip empty path", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}" id="outer">\
	<Text id="outerName" text="{Name}" />\
	<FlexBox id="inner" binding="{path : \'\', parameters : {$$ownRequest : true}}"> \
		<Text id="innerName" text="{Name}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
					+ "?$select=ArtistID,IsActiveEntity,Name", {
				ArtistID : "42",
				IsActiveEntity : true,
				Name : "Cher"
			})
			.expectChange("outerName", "Cher")
			.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
					+ "?$select=ArtistID,IsActiveEntity,Name", {
				ArtistID : "42",
				IsActiveEntity : true,
				Name : "Cher"
			})
			.expectChange("innerName", "Cher");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?$select=Name", {
					Name : "Cherilyn"
				})
				.expectChange("innerName", "Cherilyn")
				.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)?$select=Name", {
					Name : "Cherilyn"
				})
				.expectChange("outerName", "Cherilyn");

			return Promise.all([
				// code under test
				that.oView.byId("innerName").getBindingContext().requestSideEffects([{
					$PropertyPath : "Name"
				}]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Check that the failure to refresh a complete table using requestSideEffects leads
	// to a rejected promise, but no changes in data.
	// JIRA: CPOUI5UISERVICESV3-1828
	QUnit.test("ODLB: refresh within requestSideEffects fails", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<Table id="master" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="salesOrderID" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [{SalesOrderID : "42"}]
			})
			.expectChange("salesOrderID", ["42"])
			.expectChange("note", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error"); // don't care about console here
			that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100",
					createError({code : "CODE", message : "Request intentionally failed"}))
				.expectMessages([{
					code : "CODE",
					descriptionUrl : undefined,
					message : "Request intentionally failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			oTable = that.oView.byId("master");
			return Promise.all([
				oTable.getBinding("items").getHeaderContext()
					.requestSideEffects([{$NavigationPropertyPath : ""}]).then(
						function () {
							assert.ok(false, "unexpected success");
						}, function () {
							assert.ok(true, "requestSideEffects failed as expected");
						}),
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oTable.getBinding("items").getCurrentContexts()[0].getPath(),
				"/SalesOrderList('42')");
		});
	});

	//*********************************************************************************************
	// Scenario: Check that the failure to refresh a complete table using requestSideEffects leads
	// to a rejected promise, but no changes in data.
	// JIRA: CPOUI5UISERVICESV3-1828
	QUnit.test("ODLB+ODCB: refresh within requestSideEffects fails", function (assert) {
		var oContext,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oTable,
			sView = '\
<Table id="master" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Text id="salesOrderID" text="{SalesOrderID}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="detail" binding="{path : \'\', parameters : {$$ownRequest : true}}">\
	<Text id="note" text="{Note}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100", {
				value : [{SalesOrderID : "42"}]
			})
			.expectChange("salesOrderID", ["42"])
			.expectChange("note", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
					SalesOrderID : "42",
					Note : "Note 42"
				})
				.expectChange("note", "Note 42");

			oTable = that.oView.byId("master");
			oContext = oTable.getItems()[0].getBindingContext();

			that.oView.byId("detail").setBindingContext(oContext);
			return that.waitForChanges(assert);
		}).then(function () {
			that.oLogMock.expects("error").twice(); // don't care about console here
			that.expectRequest("SalesOrderList?$select=SalesOrderID&$skip=0&$top=100",
					createError({code : "CODE", message : "Request intentionally failed"}))
				.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID") // no reponse req.
				.expectMessages([{
					code : "CODE",
					descriptionUrl : undefined,
					message : "Request intentionally failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			return Promise.all([
				oTable.getBinding("items").getHeaderContext()
					.requestSideEffects([{$NavigationPropertyPath : ""}]).then(
						function () {
							assert.ok(false, "unexpected success");
						}, function () {
							assert.ok(true, "requestSideEffects failed as expected");
						}),
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oDetailContext = that.oView.byId("detail").getElementBinding().getBoundContext();

			assert.strictEqual(oTable.getBinding("items").getCurrentContexts()[0].getPath(),
				"/SalesOrderList('42')");
			assert.strictEqual(oDetailContext.getPath(), "/SalesOrderList('42')");
		});
	});

	//*********************************************************************************************
	// Scenario: Check that the failure to refresh a complete form using requestSideEffects leads
	// to a rejected promise, but no changes in data.
	// JIRA: CPOUI5UISERVICESV3-1828
	QUnit.test("ODCB+ODLB: refresh within requestSideEffects fails", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'42\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Table id="table" items="{path : \'SO_2_SOITEM\', parameters : {$$ownRequest : true}, \
			templateShareable : false}">\
		<ColumnListItem>\
			<Text id="position" text="{ItemPosition}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=SalesOrderID", {SalesOrderID : "42"})
			.expectRequest("SalesOrderList('42')/SO_2_SOITEM?$select=ItemPosition,SalesOrderID"
				+ "&$skip=0&$top=100", {
				value : [{
					SalesOrderID : "42",
					ItemPosition : "0010"
				}]
			})
			.expectChange("salesOrderID", "42")
			.expectChange("position", ["0010"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error").thrice(); // don't care about console here
			that.expectRequest("SalesOrderList('42')/SO_2_SOITEM?$select=ItemPosition,SalesOrderID"
					+ "&$skip=0&$top=100",
					createError({code : "CODE1", message : "Request 1 intentionally failed"}))
				.expectRequest("SalesOrderList('42')?$select=SalesOrderID",
					createError({code : "CODE2", message : "Request 2 intentionally failed"}))
				.expectMessages([{
					code : "CODE1",
					descriptionUrl : undefined,
					message : "Request 1 intentionally failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			return Promise.all([
				that.oView.byId("form").getElementBinding().getBoundContext()
					.requestSideEffects([{$NavigationPropertyPath : ""}]).then(
					function () {
						assert.ok(false, "unexpected success");
					}, function (oError) {
						assert.strictEqual(oError.message,
							"HTTP request was not processed because the previous request failed");
						assert.strictEqual(oError.cause.error.message,
							"Request 1 intentionally failed");
					}),
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oFormContext = that.oView.byId("form").getElementBinding().getBoundContext(),
				oRowContext = that.oView.byId("table").getBinding("items").getCurrentContexts()[0];

			assert.strictEqual(oFormContext.getPath(), "/SalesOrderList('42')");
			assert.strictEqual(oRowContext.getPath(),
				"/SalesOrderList('42')/SO_2_SOITEM(SalesOrderID='42',ItemPosition='0010')");
		});
	});

	//*********************************************************************************************
	// Scenario: Check that the failure to refresh a complete form using requestSideEffects leads
	// to a rejected promise.
	// JIRA: CPOUI5UISERVICESV3-1828
	QUnit.test("ODCB: failed requestSideEffects & changeParameters", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'42\')}">\
	<Text id="note" text="{Note}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
				SalesOrderID : "42",
				Note : "Note"
			})
			.expectChange("note", "Note");

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("form").getElementBinding(),
				oPromise;

			that.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID&foo=bar", {
					SalesOrderID : "42",
					Note : "Note updated"
				})
				.expectChange("note", "Note updated");

			oPromise = oBinding.getBoundContext()
				.requestSideEffects([{$NavigationPropertyPath : ""}]);
			oBinding.changeParameters({foo : "bar"});

			return Promise.all([
				oPromise,
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects in a different batch group, and show the danger of pending
	// changes.
	// JIRA: CPOUI5UISERVICESV3-1921
	QUnit.test("Request side effects in a different batch group", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oPromise,
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'42\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
				"@odata.etag" : "ETag",
				Note : "Note",
				SalesOrderID : "42"
			})
			.expectChange("note", "Note");

		return this.createView(assert, sView, oModel).then(function () {
			var oInput = that.oView.byId("note");

			that.expectChange("note", "User input");

			oInput.getBinding("value").setValue("User input");

			oPromise = oInput.getBindingContext().requestSideEffects([{
					$PropertyPath : "Note"
				}], "differentBatchGroup");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList('42')?$select=Note", {
					Note : "Side effect"
				})
				.expectChange("note", "Side effect"); // side effect wins over user input!

			return Promise.all([
				oPromise,
				oModel.submitBatch("differentBatchGroup"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					headers : {"If-Match" : "ETag"},
					method : "PATCH",
					payload : {Note : "User input"},
					url : "SalesOrderList('42')"
				}, {
					Note : "Server response",
					SalesOrderID : "42"
				})
				.expectChange("note", "Server response");

			return Promise.all([
				oModel.submitBatch("update"),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Automatic retry of failed PATCHes, along the lines of
	// MIT.SalesOrderCreateRelative.html, but with $auto group
	[function () {
		var oStatusBinding = this.oView.byId("status").getBinding("value");

		this.expectChange("status", "Busy")
			.expectRequest({
				method : "PATCH",
				url : "EMPLOYEES('3')",
				headers : {"If-Match" : "ETag0"},
				payload : {
					ROOM_ID : "42", // <-- retry
					STATUS : "Busy"
				}
			}, {/* don't care */});

		oStatusBinding.setValue("Busy"); // a different field is changed
	}, function () {
		var oRoomIdBinding = this.oView.byId("roomId").getBinding("value");

		this.expectChange("roomId", "23")
			.expectRequest({
				method : "PATCH",
				url : "EMPLOYEES('3')",
				headers : {"If-Match" : "ETag0"},
				payload : {
					ROOM_ID : "23" // <-- new change wins over retry
				}
			}, {/* don't care */});

		oRoomIdBinding.setValue("23"); // the same field is changed again
	}, function () {
		var sAction = "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
			oRoomIdBinding = this.oView.byId("roomId").getBinding("value");

		this.expectRequest({
				method : "PATCH",
				url : "EMPLOYEES('3')",
				headers : {"If-Match" : "ETag0"},
				payload : {
					ROOM_ID : "42" // <-- retry
				}
			}, {/* don't care */})
			.expectRequest({
				method : "POST",
				headers : {"If-Match" : "ETag0"},
				url : "EMPLOYEES('3')/" + sAction,
				payload : {TeamID : "23"}
			}, {/* don't care */});

		// bound action also triggers retry
		return this.oModel.bindContext(sAction + "(...)", oRoomIdBinding.getContext())
			.setParameter("TeamID", "23")
			.execute("$auto");
//
// Note: "Cannot delete due to pending changes" --> this scenario is currently impossible
//
//	}, function () {
//		var oRoomIdBinding = this.oView.byId("roomId").getBinding("text");
//
//		this.expectRequest({
//				method : "PATCH",
//				url : "EMPLOYEES('3')",
//				headers : {"If-Match" : "ETag0"},
//				payload : {
//					ROOM_ID : "42" // <-- retry
//				}
//			}, {/* don't care */})
//			.expectRequest({
//				method : "DELETE",
//				url : "EMPLOYEES('3')",
//				headers : {"If-Match" : "ETag0"}
//			});
//
//		return oRoomIdBinding.getContext().delete(); // DELETE also triggers retry
	}, function (assert) {
		this.expectRequest({
			method : "PATCH",
			url : "EMPLOYEES('3')",
			headers : {"If-Match" : "ETag0"},
			payload : {
				ROOM_ID : "42" // <-- retry
			}
		}, {/* don't care */});

		assert.strictEqual(this.oModel.hasPendingChanges(), true);
		assert.strictEqual(this.oView.byId("form").getObjectBinding().hasPendingChanges(), true);

		return this.oModel.submitBatch("$auto");
	}, function (assert) {
		assert.strictEqual(this.oModel.hasPendingChanges(), true);
		assert.strictEqual(this.oView.byId("form").getObjectBinding().hasPendingChanges(), true);

		this.expectChange("roomId", "2");

		// code under test
		this.oModel.resetChanges("$auto");

		assert.strictEqual(this.oModel.hasPendingChanges(), false);
		assert.strictEqual(this.oView.byId("form").getObjectBinding().hasPendingChanges(), false);

		return this.oModel.submitBatch("$auto");
	}, function (assert) {
		// failed PATCH is retried within the same $batch as the side effect
		var oEmployeeBinding = this.oView.byId("form").getObjectBinding();

		this.expectRequest({
				batchNo : 2,
				headers : {"If-Match" : "ETag0"},
				method : "PATCH",
				payload : {
					ROOM_ID : "42" // <-- retry
				},
				url : "EMPLOYEES('3')"
			}, {/* don't care */})
			.expectRequest({
				batchNo : 2,
				method : "GET",
				url : "EMPLOYEES('3')?$select=STATUS"
			}, {
				STATUS : "Busy"
			})
			.expectChange("status", "Busy");

		assert.strictEqual(this.oModel.hasPendingChanges(), true);
		assert.strictEqual(oEmployeeBinding.hasPendingChanges(), true);

		return Promise.all([
			oEmployeeBinding.getBoundContext().requestSideEffects([{$PropertyPath : "STATUS"}]),
			this.oModel.submitBatch("$auto")
		]);
	}].forEach(function (fnCodeUnderTest, i) {
		QUnit.test("Later retry failed PATCHes for $auto, " + i, function (assert) {
			var oModel = createTeaBusiModel({updateGroupId : "$auto"}),
				sView = '\
<FlexBox binding="{/EMPLOYEES(\'3\')}" id="form">\
	<Input id="roomId" value="{ROOM_ID}" />\
	<Input id="status" value="{STATUS}" />\
</FlexBox>',
				that = this;

			this.expectRequest("EMPLOYEES('3')", {
					"@odata.etag" : "ETag0",
					ID : "3",
					ROOM_ID : "2",
					STATUS : "Occupied"
				})
				.expectChange("roomId", "2")
				.expectChange("status", "Occupied");

			return this.createView(assert, sView, oModel).then(function () {
				var oRoomIdBinding = that.oView.byId("roomId").getBinding("value");

				that.expectChange("roomId", "42")
					.expectRequest({
						method : "PATCH",
						url : "EMPLOYEES('3')",
						headers : {"If-Match" : "ETag0"},
						payload : {ROOM_ID : "42"}
					}, createError({code : "CODE", message : "Request intentionally failed"}))
					.expectMessages([{
						code : "CODE",
						message : "Request intentionally failed",
						persistent : true,
						target : "",
						technical : true,
						type : "Error"
					}]);
				that.oLogMock.expects("error"); // don't care about console here

				oRoomIdBinding.setValue("42");

				return that.waitForChanges(assert);
			}).then(function () {
				return Promise.all([
					fnCodeUnderTest.call(that, assert),
					that.waitForChanges(assert)
				]);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Immediate retry of failed PATCHes; make sure that order is preserved
	["$auto", "group"].forEach(function (sUpdateGroupId) {
		QUnit.test("Immediately retry failed PATCHes for " + sUpdateGroupId, function (assert) {
			var oAgeBinding,
				oModel = createTeaBusiModel({updateGroupId : sUpdateGroupId}),
				oPromise,
				fnReject,
				oRoomIdBinding,
				sView = '\
<FlexBox binding="{/EMPLOYEES(\'3\')}">\
	<Input id="age" value="{AGE}" />\
	<Input id="roomId" value="{ROOM_ID}" />\
	<Input id="status" value="{STATUS}" />\
</FlexBox>',
				that = this;

			this.expectRequest("EMPLOYEES('3')", {
					"@odata.etag" : "ETag0",
					ID : "3",
					AGE : 66,
					ROOM_ID : "2",
					STATUS : "Occupied"
				})
				.expectChange("age", "66")
				.expectChange("roomId", "2")
				.expectChange("status", "Occupied");

			return this.createView(assert, sView, oModel).then(function () {
				oAgeBinding = that.oView.byId("age").getBinding("value");
				oRoomIdBinding = that.oView.byId("roomId").getBinding("value");

				that.expectChange("age", "67")
					.expectChange("roomId", "42")
					.expectRequest({
						method : "PATCH",
						url : "EMPLOYEES('3')",
						headers : {"If-Match" : "ETag0"},
						payload : {
							AGE : 67,
							ROOM_ID : "42"
						}
					}, new Promise(function (resolve, reject) {
						fnReject = reject;
					}));

				oAgeBinding.setValue(67); // Happy Birthday!
				oRoomIdBinding.setValue("42");
				oPromise = oModel.submitBatch("group");

				return that.waitForChanges(assert);
			}).then(function () {
				var oError = createError({code : "CODE", message : "Request intentionally failed"});

				that.expectChange("roomId", "23")
					.expectRequest({
						method : "PATCH",
						url : "EMPLOYEES('3')",
						headers : {"If-Match" : "ETag0"},
						payload : {
							AGE : 67,
							ROOM_ID : "23"
						}
					}, {
						"@odata.etag" : "ETag1",
						AGE : 67,
						ROOM_ID : "23"
					}).expectMessages([{
						code : "CODE",
						message : "Request intentionally failed",
						persistent : true,
						target : "",
						technical : true,
						type : "Error"
					}]);
				that.oLogMock.expects("error").twice(); // don't care about console here

				oRoomIdBinding.setValue("23");
				fnReject(oError);

				return Promise.all([
					oPromise.catch(function (oError0) {
						assert.strictEqual(oError0, oError);
					}),
					oModel.submitBatch("group"),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				var oStatusBinding = that.oView.byId("status").getBinding("value");

				that.expectChange("status", "Busy")
					.expectRequest({
						method : "PATCH",
						url : "EMPLOYEES('3')",
						headers : {"If-Match" : "ETag1"},
						payload : {STATUS : "Busy"}
					}, {/* don't care */});

				oStatusBinding.setValue("Busy"); // a different field is changed

				return Promise.all([
					oModel.submitBatch("group"),
					that.waitForChanges(assert)
				]);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: ODCB#execute waits until PATCHes are back and happens inside same $batch as retry
	// (CPOUI5UISERVICESV3-1451)
	QUnit.test("CPOUI5UISERVICESV3-1451: ODCB#execute after all PATCHes", function (assert) {
		var oModel = createTeaBusiModel({updateGroupId : "$auto"}),
			fnReject,
			oRoomIdBinding,
			sView = '\
<FlexBox binding="{/EMPLOYEES(\'3\')}">\
	<Input id="age" value="{AGE}" />\
	<Input id="roomId" value="{ROOM_ID}" />\
</FlexBox>',
			that = this;

		this.expectRequest("EMPLOYEES('3')", {
				"@odata.etag" : "ETag0",
				ID : "3",
				AGE : 66,
				ROOM_ID : "2"
			})
			.expectChange("age", "66")
			.expectChange("roomId", "2");

		return this.createView(assert, sView, oModel).then(function () {
			oRoomIdBinding = that.oView.byId("roomId").getBinding("value");

			that.expectChange("age", "67")
				.expectChange("roomId", "42")
				.expectRequest({
					method : "PATCH",
					url : "EMPLOYEES('3')",
					headers : {"If-Match" : "ETag0"},
					payload : {
						AGE : 67,
						ROOM_ID : "42"
					}
				}, new Promise(function (resolve, reject) {
					fnReject = reject;
				}));

			that.oView.byId("age").getBinding("value").setValue(67); // Happy Birthday!
			oRoomIdBinding.setValue("42");

			return that.waitForChanges(assert);
		}).then(function () {
			var sAction = "com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeTeamOfEmployee",
				oPromise;

			function reject() {
				that.expectMessages([{
					code : "CODE",
					message : "Request intentionally failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);
				that.oLogMock.expects("error").twice(); // don't care about console here

				fnReject(createError({code : "CODE", message : "Request intentionally failed"}));
			}

			that.expectRequest({
					batchNo : 2,
					method : "PATCH",
					url : "EMPLOYEES('3')",
					headers : {"If-Match" : "ETag0"},
					payload : {
						AGE : 67,
						ROOM_ID : "42"
					}
				}, {/* don't care */})
				.expectRequest({
					batchNo : 2,
					method : "POST",
					headers : {"If-Match" : "ETag0"},
					url : "EMPLOYEES('3')/" + sAction,
					payload : {TeamID : "23"}
				}, {/* don't care */});

			// bound action waits for PATCHes and triggers retry
			oPromise = that.oModel.bindContext(sAction + "(...)", oRoomIdBinding.getContext())
				.setParameter("TeamID", "23")
				.execute("$auto");

			return Promise.all([
				oPromise,
				resolveLater(reject),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create entity for a ListBinding relative to a newly created entity
	[false, true].forEach(function (bKeepTransientPath) {
		var sTitle = "Create relative, on newly created entity, keep transient path: "
				+ bKeepTransientPath;

		QUnit.test(sTitle, function (assert) {
			var oEmployeeCreatedContext,
				oModel = createTeaBusiModel(),
				sNestedTransientPath,
				oTeamCreatedContext,
				sTransientPath,
				sView = '\
<FlexBox binding="{path : \'\',\
		parameters : {\
			$expand : {\
				\'TEAM_2_EMPLOYEES\' : {\
					$select : \'__CT__FAKE__Message/__FAKE__Messages,ID\'\
				}\
			}\
		}}" id="form">\
	<Table id="table" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Input id="id" value="{ID}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
				that = this;

			this.expectChange("id", []);

			return this.createView(assert, sView, oModel).then(function () {
				// create a new team
				that.expectRequest({
						method : "POST",
						url : "TEAMS",
						payload : {}
					}, {Team_Id : "23"});

				oTeamCreatedContext = oModel.bindList("/TEAMS").create({
						// private annotation, not to be used unless explicitly adviced to do so
						"@$ui5.keepTransientPath" : bKeepTransientPath
					}, true);
				sTransientPath = oTeamCreatedContext.getPath();

				return Promise.all([
					oTeamCreatedContext.created(),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				assert.strictEqual(
					oTeamCreatedContext.getPath().replace(rTransientPredicate, "($uid=...)"),
					bKeepTransientPath ? "/TEAMS($uid=...)" : "/TEAMS('23')");
				if (bKeepTransientPath) {
					assert.strictEqual(oTeamCreatedContext.getPath(), sTransientPath);
				}

				that.expectRequest("TEAMS('23')?$expand=TEAM_2_EMPLOYEES("
						+ "$select=__CT__FAKE__Message/__FAKE__Messages,ID)", {
						Team_Id : "23",
						TEAM_2_EMPLOYEES : [{
							ID : "3",
							__CT__FAKE__Message : {__FAKE__Messages : []}
						}]
					})
					.expectChange("id", ["3"])
					.expectMessages([]);

				that.oView.byId("form").setBindingContext(oTeamCreatedContext);

				return that.waitForChanges(assert);
			}).then(function () {
				// create new relative entity
				that.expectRequest({
						method : "POST",
						url : "TEAMS('23')/TEAM_2_EMPLOYEES",
						payload : {ID : null}
					}, {
						ID : "7",
						__CT__FAKE__Message : {
							__FAKE__Messages : [{
								code : "1",
								message : "Enter an ID",
								numericSeverity : 3,
								target : "ID",
								transition : false
							}]
						}
					})
					.expectChange("id", [""]) // from setValue(null)
					.expectChange("id", ["7", "3"])
					.expectMessages([{
						code : "1",
						message : "Enter an ID",
						persistent : false,
						target : bKeepTransientPath
							? "/TEAMS($uid=...)/TEAM_2_EMPLOYEES($uid=...)/ID"
							: "/TEAMS('23')/TEAM_2_EMPLOYEES('7')/ID",
						type : "Warning"
					}]);

				oEmployeeCreatedContext = that.oView.byId("table").getBinding("items").create({
						// private annotation, not to be used unless explicitly adviced to do so
						"@$ui5.keepTransientPath" : bKeepTransientPath,
						ID : null
					}, true);
				sNestedTransientPath = oEmployeeCreatedContext.getPath();

				return Promise.all([
					oEmployeeCreatedContext.created(),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				// the new one is at the top
				var oInput = that.oView.byId("table").getItems()[0].getCells()[0];

				assert.strictEqual(oEmployeeCreatedContext.getPath(),
					bKeepTransientPath
					? sNestedTransientPath
					: "/TEAMS('23')/TEAM_2_EMPLOYEES('7')");
				assert.strictEqual(oInput.getBindingContext().getPath(),
					oEmployeeCreatedContext.getPath(), "we got the right input control");

				return that.checkValueState(assert, oInput, "Warning", "Enter an ID");
			});
		});
	});

	//*********************************************************************************************
	// Scenario: if a 1 to n navigation occurs we use the deep path for this case instead of the
	// canonical path; the app can opt-out of this behavior with a binding specific parameter
	// CPOUI5UISERVICESV3-1567
	// Delete and Patch still use the canonical path. Messages have to be reported with the deep
	// path.
	// CPOUI5UISERVICESV3-1813
	[false, true].forEach(function (bUseCanonicalPath) {
		QUnit.test("read with deep path, $$canonicalPath: " + bUseCanonicalPath, function (assert) {
			var sEntityPath = bUseCanonicalPath
					? "BusinessPartnerList('23')"
					: "SalesOrderList('0500000000')/SO_2_BP",
				oModel = createSalesOrdersModel({autoExpandSelect : true}),
				sParameters = bUseCanonicalPath
					? "parameters : {$$canonicalPath : true}"
					: "parameters : {$$ownRequest : true}",
				sView = '\
<FlexBox binding="{/SalesOrderList(\'0500000000\')/SO_2_BP}">\
	<Text text="{BusinessPartnerID}" />\
	<FlexBox binding="{path : \'\',\
		' + sParameters + '\
		}">\
		<layoutData><FlexItemData/></layoutData>\
		<Text id="street" text="{Address/Street}" />\
	</FlexBox>\
	<Table id="table" items="{path : \'BP_2_PRODUCT\',\
		' + sParameters + '\
		}">\
		<ColumnListItem>\
			<Text text="{ProductID}" />\
			<Input value="{Name}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
				that = this;

			this.expectRequest("SalesOrderList('0500000000')/SO_2_BP?$select=BusinessPartnerID", {
					BusinessPartnerID : "23"
				})
				.expectRequest(sEntityPath + "?$select=Address/Street,BusinessPartnerID", {
					Address : {Street : "Bakerstreet"},
					BusinessPartnerID : "23"
				})
				.expectRequest(sEntityPath + "/BP_2_PRODUCT?$select=Name,ProductID&$skip=0&"
						+ "$top=100", {
					value : [{
						"@odata.etag" : "ETag",
						ProductID : "1",
						Name : "NoName"
					}]
				});

			return this.createView(assert, sView, oModel).then(function () {
				var oError = createError({
						code : "top_patch",
						message : "Error occurred while processing the request",
						details : [{
							code : "bound_patch",
							message : "Must not change mock data",
							"@Common.longtextUrl" : "Messages(1)/LongText",
							"@Common.numericSeverity" : 4,
							target : "Name"
						}]
					});

				that.oLogMock.expects("error").twice() // Note: twice, w/ different class name :-(
					.withArgs("Failed to update path /SalesOrderList('0500000000')/SO_2_BP/"
						+ "BP_2_PRODUCT('1')/Name", sinon.match(oError.message));
				that.expectRequest({
						method : "PATCH",
						url : "ProductList('1')",
						headers : {"If-Match" : "ETag"},
						payload : {Name : "A product with no name"}
					}, oError)
					.expectMessages([{
						code : "top_patch",
						descriptionUrl : undefined,
						message : "Error occurred while processing the request",
						persistent : true,
						target : "",
						technical : true,
						type : "Error"
					}, {
						code : "bound_patch",
						descriptionUrl : sSalesOrderService + "Messages(1)/LongText",
						message : "Must not change mock data",
						persistent : true,
						target : "/SalesOrderList('0500000000')/SO_2_BP/BP_2_PRODUCT('1')/Name",
						technical : false,
						type : "Error"
					}]);

				// code under test
				that.oView.byId("table").getItems("items")[0].getCells()[1].getBinding("value")
					.setValue("A product with no name");

				return that.waitForChanges(assert);
			}).then(function () {
				var oInput = that.oView.byId("table").getItems("items")[0].getCells()[1];

				return that.checkValueState(assert, oInput, "Error", "Must not change mock data");
			}).then(function () {
				var oError = createError({
						code : "top_delete",
						message : "Error occurred while processing the request",
						details : [{
							code : "bound_delete",
							message : "Must not delete mock data",
							"@Common.longtextUrl" : "./Messages(1)/LongText",
							"@Common.numericSeverity" : 4,
							target : ""
						}]
					});

				that.oLogMock.expects("error")
					.withExactArgs("Failed to delete /SalesOrderList('0500000000')/SO_2_BP/"
							+ "BP_2_PRODUCT('1')[0]", sinon.match(oError.message),
						"sap.ui.model.odata.v4.Context");
				that.expectRequest({
						method : "DELETE",
						url : "ProductList('1')",
						headers : {"If-Match" : "ETag"}
					}, oError)
					.expectMessages([{
						code : "top_delete",
						descriptionUrl : undefined,
						message : "Error occurred while processing the request",
						persistent : true,
						target : "",
						technical : true,
						type : "Error"
					}, {
						code : "bound_delete",
						descriptionUrl : sSalesOrderService + "Messages(1)/LongText",
						message : "Must not delete mock data",
						persistent : true,
						target : "/SalesOrderList('0500000000')/SO_2_BP/BP_2_PRODUCT('1')",
						technical : false,
						type : "Error"
					}]);

				sap.ui.getCore().getMessageManager().removeAllMessages();

				return Promise.all([
					// code under test
					that.oView.byId("table").getBinding("items").getCurrentContexts()[0].delete()
						.catch(function (oError0) {
							assert.strictEqual(oError0, oError);
						}),
					that.waitForChanges(assert)
				]);
			}).then(function () {
				that.expectRequest({
						method : "PATCH",
						url : "ProductList('1')",
						headers : {"If-Match" : "ETag"},
						payload : {Name : "A product name leads to PATCH success with a message"}
					}, {
						// "@odata.etag" : "ETag2",
						Name : "A product name (from server)",
						Messages : [{
							code : "23",
							message : "Enter a product name",
							numericSeverity : 3,
							target : "Name"
						}]
					})
					.expectMessages([{
						code : "23",
						descriptionUrl : undefined,
						message : "Enter a product name",
						persistent : false,
						target : "/SalesOrderList('0500000000')/SO_2_BP/BP_2_PRODUCT('1')/Name",
						technical : false,
						type : "Warning"
					}]);

				sap.ui.getCore().getMessageManager().removeAllMessages();

				// code under test
				that.oView.byId("table").getItems("items")[0].getCells()[1].getBinding("value")
					.setValue("A product name leads to PATCH success with a message");

				return that.waitForChanges(assert);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Dependent binding uses $$canonicalPath; hasPendingChanges and refresh consider
	// caches of the dependent binding.
	// CPOUI5UISERVICESV3-1706
	QUnit.test("hasPendingChanges and refresh with $$canonicalPath", function (assert) {
		var oBusinessPartnerContext,
			oBusinessPartnerList,
			oForm,
			oModel = createSalesOrdersModel({autoExpandSelect : true, updateGroupId : "update"}),
			sView = '\
<Table id="businessPartnerList" items="{/BusinessPartnerList}">\
	<ColumnListItem>\
		<Text id="businessPartnerID" text="{BusinessPartnerID}" />\
	</ColumnListItem>\
</Table>\
<FlexBox id="form" binding="{BP_2_SO(\'42\')}">\
	<Text id="salesOrderID" text="{SalesOrderID}" />\
	<Table id="table" items="{path : \'SO_2_SOITEM\', parameters : {$$canonicalPath : true}}">\
		<ColumnListItem>\
			<Text id="productID" text="{ProductID}" />\
			<Input id="note" value="{Note}" />\
		</ColumnListItem>\
	</Table>\
	<FlexBox binding="{path : \'SO_2_BP/BP_2_SO(\\\'23\\\')\',\
			parameters : {$$canonicalPath : true}}">\
		<Input id="billingStatus" value="{BillingStatus}" />\
	</FlexBox>\
</FlexBox>',
			that = this;

		function checkPendingChanges() {
			assert.strictEqual(oBusinessPartnerList.getBinding("items").hasPendingChanges(), true);
			assert.strictEqual(oBusinessPartnerContext.hasPendingChanges(), true);
		}

		function clearDetails() {
			that.expectChange("billingStatus", null)
				.expectChange("note", [])
				.expectChange("productID", [])
				.expectChange("salesOrderID", null);

			oForm.setBindingContext(null);
		}

		function expectDetailRequests() {
			// Note: this is requested anyway by autoExpandSelect, thus we might as well show it
			that.expectRequest("BusinessPartnerList('0500000000')/BP_2_SO('42')"
					+ "?$select=SalesOrderID", {
					SalesOrderID : "42"
				})
				.expectRequest("SalesOrderList('42')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Note,ProductID,SalesOrderID&$skip=0&$top=100", {
					value : [{
						ItemPosition : "10",
						Note : "Notebook Basic 15",
						ProductID : "HT-1000",
						SalesOrderID : "42"
					}, {
						ItemPosition : "20",
						Messages : [{
							code : "23",
							message : "Just a test",
							numericSeverity : 3,
							target : "Note"
						}],
						Note : "ITelO Vault",
						ProductID : "HT-1007",
						SalesOrderID : "42"
					}]
				})
				.expectRequest("SalesOrderList('42')/SO_2_BP/BP_2_SO('23')"
					+ "?$select=BillingStatus,SalesOrderID", {
					BillingStatus : "UNKNOWN",
					Messages : [{
						code : "00",
						message : "Unknown billing status",
						numericSeverity : 3,
						target : "BillingStatus"
					}],
					SalesOrderID : "23"
				})
				.expectMessages([{
					code : "23",
					message : "Just a test",
					persistent : false,
					target : "/BusinessPartnerList('0500000000')/BP_2_SO('42')"
						+ "/SO_2_SOITEM(SalesOrderID='42',ItemPosition='20')/Note",
					technical : false,
					type : "Warning"
				}, {
					code : "00",
					message : "Unknown billing status",
					persistent : false,
					target : "/BusinessPartnerList('0500000000')/BP_2_SO('42')"
						+ "/SO_2_BP/BP_2_SO('23')/BillingStatus",
					technical : false,
					type : "Warning"
				}]);
		}

		function selectFirst() {
			that.expectChange("billingStatus", "UNKNOWN")
				.expectChange("note", ["Notebook Basic 15", "ITelO Vault"])
				.expectChange("productID", ["HT-1000", "HT-1007"])
				.expectChange("salesOrderID", "42");

			oForm.setBindingContext(oBusinessPartnerContext);
		}

		this.expectRequest("BusinessPartnerList?$select=BusinessPartnerID&$skip=0&$top=100", {
				value : [{BusinessPartnerID : "0500000000"}]
			})
			.expectChange("billingStatus")
			.expectChange("businessPartnerID", ["0500000000"])
			.expectChange("note", [])
			.expectChange("productID", [])
			.expectChange("salesOrderID");

		return this.createView(assert, sView, oModel).then(function () {
			oForm = that.oView.byId("form");
			oBusinessPartnerList = that.oView.byId("businessPartnerList");
			oBusinessPartnerContext = oBusinessPartnerList.getItems()[0].getBindingContext();

			expectDetailRequests();
			selectFirst();

			return that.waitForChanges(assert);
		}).then(function () {
			var oInput = that.oView.byId("table").getItems()[1].getCells()[1];

			return that.checkValueState(assert, oInput, "Warning", "Just a test");
		}).then(function () {
			return that.checkValueState(assert, "billingStatus", "Warning",
				"Unknown billing status");
		}).then(function () {
			clearDetails();

			return that.waitForChanges(assert);
		}).then(function () {
			// set context for details again - take values from cache
			selectFirst();

			return that.waitForChanges(assert);
		}).then(function () {
			clearDetails();

			return that.waitForChanges(assert);
		}).then(function () {
			// refresh business partner
			that.expectRequest("BusinessPartnerList('0500000000')?$select=BusinessPartnerID", {
					BusinessPartnerID : "0500000000"
				})
				.expectMessages([]);

			oBusinessPartnerContext.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			// set context for details again - don't use cached data
			expectDetailRequests();
			selectFirst();

			return that.waitForChanges(assert);
		}).then(function () {
			// change value in details
			that.expectChange("note", ["Foo"]);

			// Note: cannot call Input#setValue because of that.setFormatter
			that.oView.byId("table").getItems()[0].getCells()[1].getBinding("value")
				.setValue("Foo");

			checkPendingChanges();

			return that.waitForChanges(assert);
		}).then(function () {
			// clear details and check pending changes
			clearDetails();
			checkPendingChanges();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: unnecessary context bindings to confuse auto-$expand/$select
	QUnit.skip("CPOUI5UISERVICESV3-1677: Avoid unnecessary $expand", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{BestFriend}">\
		<FlexBox binding="{_Friend(ArtistID=\'42\',IsActiveEntity=true)}">\
		</FlexBox>\
	</FlexBox>\
</FlexBox>';

		//TODO avoid the following $expand
//		+ "&$expand=BestFriend($select=ArtistID,IsActiveEntity"
//		+ ";$expand=_Friend($select=ArtistID,IsActiveEntity))"
		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity", {
				ArtistID : "42"
//				IsActiveEntity : true
			})
			.expectChange("id", "42");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: context binding for :N navigation property using key predicate
	QUnit.skip("CPOUI5UISERVICESV3-1679: nav.prop. using key predicate", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}">\
	<Text id="id" text="{ArtistID}" />\
	<FlexBox binding="{_Friend(ArtistID=\'23\',IsActiveEntity=true)}">\
		<Text id="friend" text="{ArtistID}" />\
	</FlexBox>\
</FlexBox>';

		//TODO Failed to drill-down into _Friend(ArtistID='23',IsActiveEntity=true)/ArtistID
		// --> "friend" binding would need to send its own request!
		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity"
				//TODO CPOUI5UISERVICESV3-1677: Avoid unnecessary $expand
				+ "&$expand=_Friend($select=ArtistID,IsActiveEntity)", {
				ArtistID : "42"
//				IsActiveEntity : true
			})
			.expectChange("id", "42")
			.expectChange("id", "23");

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: A grid table shows a collection which completely resides in the parent binding's
	// cache. Auto-$expand/$select does not properly handle this case: "Price" is not selected.
	QUnit.skip("CPOUI5UISERVICESV3-1685: autoExpandSelect with grid table", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Artists(ArtistID=\'42\',IsActiveEntity=true)}">\
	<Text id="id" text="{ArtistID}" />\
	<t:Table rows="{_Publication}">\
		<t:Column>\
			<t:template>\
				<Text id="price" text="{Price}" />\
			</t:template>\
		</t:Column>\
	</t:Table>\
</FlexBox>';

		this.expectRequest("Artists(ArtistID='42',IsActiveEntity=true)"
				+ "?$select=ArtistID,IsActiveEntity"
				+ "&$expand=_Publication($select=Price,PublicationID)", {
				ArtistID : "42",
//				IsActiveEntity : true,
				_Publication : [{
					Price : "9.99"
//						"PublicationID" "42-0":
				}]
			})
			.expectChange("id", "42")
			.expectChange("price", ["9.99"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: property binding with "##"-path pointing to a metamodel property.
	// CPOUI5UISERVICESV3-1676
	testViewStart("Property binding with metapath", '\
<FlexBox binding="{/Artists(\'42\')}">\
	<Text id="label0" text="{Name##@com.sap.vocabularies.Common.v1.Label}" />\
	<Text id="name" text="{Name}" />\
</FlexBox>\
<Text id="insertable"\
	text="{/Artists##@Org.OData.Capabilities.V1.InsertRestrictions/Insertable}" />\
<Text id="label1" text="{/Artists##/@com.sap.vocabularies.Common.v1.Label}" />',
		{"Artists('42')?$select=ArtistID,IsActiveEntity,Name" : {
			//ArtistID : ..., IsActiveEntity : ...
			Name : "Foo"}},
		{label0 : "Artist Name", name : "Foo", insertable : true, label1 : "Artist"},
		createSpecialCasesModel({autoExpandSelect : true})
	);

	//*********************************************************************************************
	// Scenario: Metadata property binding with target type any represented as a part %{...}
	// in an expression binding where the property binding has an object value.
	// CPOUI5UISERVICESV3-1676
	testViewStart("Metadata property binding with object value", '\
<Text id="insertable"\
	text="{:= %{/Artists##@Org.OData.Capabilities.V1.InsertRestrictions}.Insertable }" />',
		/* no data request*/ undefined,
		{insertable : true},
		createSpecialCasesModel({autoExpandSelect : true})
	);

	//*********************************************************************************************
	// Scenario: Relative data property binding with target type any represented as a part %{...}
	// in an expression binding where the property binding refers to a navigation property and thus
	// has an object value.
	// CPOUI5UISERVICESV3-1676
	testViewStart("Relative data property binding with object value", '\
<FlexBox binding="{/Artists(\'42\')}">\
	<Text id="publicationCount" text="{:= %{_Publication}.length }" />\
</FlexBox>',
		{"Artists('42')?$select=ArtistID,IsActiveEntity&$expand=_Publication($select=PublicationID)" : {
			//ArtistID : ..., IsActiveEntity : ...
			_Publication : [{/*PublicationID : ...*/}, {}, {}]
		}},
		{publicationCount : 3},
		createSpecialCasesModel({autoExpandSelect : true})
	);

	//*********************************************************************************************
	// Scenario: list binding with auto-$expand/$select and filter (so that metadata is required to
	// build the query string), but the metadata could not be loaded (CPOUI5UISERVICESV3-1723)
	QUnit.test("Auto-$expand/$select with dynamic filter, but no metadata", function (assert) {
		var oModel = createModel(sInvalidModel, {autoExpandSelect : true}),
			sView = '\
<Table items="{path : \'/Artists\', \
		filters : {path : \'IsActiveEntity\', operator : \'EQ\', value1 : \'true\'}}">\
	<ColumnListItem>\
		<Text id="id" text="{path : \'ID\', type : \'sap.ui.model.odata.type.String\'}"/>\
	</ColumnListItem>\
</Table>';

		this.oLogMock.restore();
		this.stub(Log, "error"); // the exact errors do not interest
		this.expectMessages([{
			code : undefined,
			descriptionUrl : undefined,
			message : "Could not load metadata: 500 Internal Server Error",
			persistent : true,
			target : "",
			technical : true,
			type : "Error"
		}]);

		return this.createView(assert, sView, oModel).then(function () {
			// check that the first error message complains about the metadata access
			sinon.assert.calledWithExactly(Log.error.firstCall, "GET /invalid/model/$metadata",
				"Could not load metadata: 500 Internal Server Error",
				"sap.ui.model.odata.v4.lib._MetadataRequestor");
		});
	});

	//*********************************************************************************************
	// Scenario: Display a measure with unit using the customizing loaded from the backend
	// based on the "com.sap.vocabularies.CodeList.v1.UnitsOfMeasure" on the service's entity
	// container.
	// CPOUI5UISERVICESV3-1711
	QUnit.test("OData Unit type considering unit customizing", function (assert) {
		var oControl,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/ProductList(\'HT-1000\')}">\
	<Input id="weight" value="{parts: [\'WeightMeasure\', \'WeightUnit\',\
					{path : \'/##@@requestUnitsOfMeasure\',\
						mode : \'OneTime\', targetType : \'any\'}],\
				mode : \'TwoWay\',\
				type : \'sap.ui.model.odata.type.Unit\'}" />\
	<Text id="weightMeasure" text="{WeightMeasure}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("ProductList(\'HT-1000\')?$select=ProductID,WeightMeasure,WeightUnit", {
				"@odata.etag" : "ETag",
				ProductID : "HT-1000",
				WeightMeasure : "12.34",
				WeightUnit : "KG"
			})
			.expectRequest("UnitsOfMeasure?$select=ExternalCode,DecimalPlaces,Text,ISOCode", {
				value : [{
					DecimalPlaces : 5,
					ExternalCode : "KG",
					ISOCode : "KGM",
					Text : "Kilogramm",
					UnitCode : "KG"
				}]
			})
			.expectChange("weightMeasure", "12.340")  // Scale=3 in property metadata => 3 decimals
			.expectChange("weight", "12.34000 KG");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("weight", "23.40000 KG")
				.expectChange("weightMeasure", "23.400")
				.expectRequest({
					method : "PATCH",
					url : "ProductList('HT-1000')",
					headers : {"If-Match" : "ETag"},
					payload : {WeightMeasure : "23.4", WeightUnit : "KG"}
				});

			that.oView.byId("weight").getBinding("value").setRawValue(["23.4", "KG"]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("weightMeasure", "0.000")
				.expectRequest({
					method : "PATCH",
					url : "ProductList('HT-1000')",
					headers : {"If-Match" : "ETag"},
					payload : {WeightMeasure : "0", WeightUnit : "KG"}
				});

			oControl = that.oView.byId("weight");
			// remove the formatter so that we can call setValue at the control
			oControl.getBinding("value").setFormatter(null);

			// code under test
			oControl.setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			// Check that the previous setValue led to the correct result
			assert.strictEqual(oControl.getValue(), "0.00000 KG");

			that.expectMessages([{
				code : undefined,
				descriptionUrl : undefined,
				message : "Enter a number with a maximum of 5 decimal places",
				persistent : false,
				target : oControl.getId() + "/value",
				technical : false,
				type : "Error"
			}]);

			// code under test
			oControl.setValue("12.123456 KG");

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, oControl, "Error",
				"Enter a number with a maximum of 5 decimal places");
		});
	});

	//*********************************************************************************************
	// Scenario: Display an amount with currency using the customizing loaded from the backend
	// based on the "com.sap.vocabularies.CodeList.v1.CurrencyCodes" on the service's entity
	// container.
	// CPOUI5UISERVICESV3-1733
	QUnit.test("OData Currency type considering currency customizing", function (assert) {
		var oControl,
			oModel = createSalesOrdersModel({autoExpandSelect : true, updateGroupId : "$auto"}),
			sView = '\
<FlexBox binding="{/ProductList(\'HT-1000\')}">\
	<Input id="price" value="{parts: [\'Price\', \'CurrencyCode\',\
					{path : \'/##@@requestCurrencyCodes\',\
						mode : \'OneTime\', targetType : \'any\'}],\
				mode : \'TwoWay\',\
				type : \'sap.ui.model.odata.type.Currency\'}" />\
	<Text id="amount" text="{Price}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("ProductList(\'HT-1000\')?$select=CurrencyCode,Price,ProductID", {
				"@odata.etag" : "ETag",
				ProductID : "HT-1000",
				Price : "12.3",
				CurrencyCode : "EUR"
			})
			.expectRequest("Currencies?$select=CurrencyCode,DecimalPlaces,Text,ISOCode", {
				value : [{
					CurrencyCode : "EUR",
					DecimalPlaces : 2,
					ISOCode : "EUR",
					Text : "Euro"
				}, {
					CurrencyCode : "JPY",
					DecimalPlaces : 0,
					ISOCode : "JPY",
					Text : "Yen"
				}]
			})
			.expectChange("amount", "12.3")
			.expectChange("price", "EUR\u00a012.30"); // "\u00a0" is a non-breaking space

		return this.createView(assert, sView, oModel).then(function () {
			//TODO get rid of first change event which is due to using setRawValue([...]) on the
			//  composite binding. Solution idea: change integration test framework to not use
			//  formatters but overwrite formatValue on the binding's type if ever possible. Without
			//  formatters, one can then set the value on the control.
			that.expectChange("price", "EUR\u00a042.00")
				.expectChange("price", "JPY\u00a042")
				.expectChange("amount", "42")
				.expectRequest({
					method : "PATCH",
					url : "ProductList('HT-1000')",
					headers : {"If-Match" : "ETag"},
					payload : {Price : "42", CurrencyCode : "JPY"}
				});

			that.oView.byId("price").getBinding("value").setRawValue(["42", "JPY"]);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("amount", "0")
				.expectRequest({
					method : "PATCH",
					url : "ProductList('HT-1000')",
					headers : {"If-Match" : "ETag"},
					payload : {Price : "0", CurrencyCode : "JPY"}
				});

			oControl = that.oView.byId("price");
			// remove the formatter so that we can call setValue at the control
			oControl.getBinding("value").setFormatter(null);

			// code under test
			oControl.setValue("");

			return that.waitForChanges(assert);
		}).then(function () {
			// Check that the previous setValue led to the correct result
			assert.strictEqual(oControl.getValue(), "JPY\u00a00");

			that.expectMessages([{
				code : undefined,
				descriptionUrl : undefined,
				message : "Enter a number with no decimal places",
				persistent : false,
				target : oControl.getId() + "/value",
				technical : false,
				type : "Error"
			}]);

			// code under test
			oControl.setValue("12.1");

			return that.waitForChanges(assert);
		}).then(function () {
			return that.checkValueState(assert, oControl, "Error",
				"Enter a number with no decimal places");
		});
	});
	//TODO With updateGroupId $direct, changing *both* parts of a composite binding (amount and
	//  currency) in one step triggers *two* PATCH requests:
	//  The first request contains the new amount and also the old currency as PATCHes for amounts
	//  are always sent with currency.
	//  The second request only contains the new currency.
	//  Solution idea: Only execute $direct requests in prerendering task
	//  Is this critical? - Productive scenario runs with $batch. However: What if amount and
	//  currency are in two different fields in draft scenario (no save button)?

	//*********************************************************************************************
	// Scenario: Request value list information for an action's parameter.
	// BCP: 1970116818
	// JIRA: CPOUI5UISERVICESV3-1744
	QUnit.test("Value help at action parameter", function (assert) {
		var oModel = createSpecialCasesModel(),
			sPropertyPath = "/Artists/special.cases.Create/Countryoforigin";

		return oModel.getMetaModel().requestValueListType(sPropertyPath)
			.then(function (sValueListType) {
				assert.strictEqual(sValueListType, ValueListType.Fixed);

				return oModel.getMetaModel().requestValueListInfo(sPropertyPath);
			}).then(function (mQualifier2ValueList) {
				assert.strictEqual(mQualifier2ValueList[""].$model.toString(),
					"sap.ui.model.odata.v4.ODataModel: /special/countryoforigin/");
				delete mQualifier2ValueList[""].$model;
				assert.deepEqual(mQualifier2ValueList, {
					"" : {
						CollectionPath : "I_AIVS_CountryCode",
						Label : "Country Code Value Help",
						Parameters : [{
							$Type : "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
							LocalDataProperty : {
								$PropertyPath : "Countryoforigin"
							},
							ValueListProperty : "CountryCode"
						}]
					}
				});
			});
	});

	//*********************************************************************************************
	// Scenario: Request value list information for a parameter of a bound action via annotations
	// with targets in 4.01 syntax and ValueListType.Fixed.
	// JIRA: CPOUI5ODATAV4-54
	QUnit.test("Value help at bound action parameter, 4.01 syntax, fixed", function (assert) {
		var oModel = createSpecialCasesModel(),
			oOperationBinding
				= oModel.bindContext("/Artists('42')/_Publication/special.cases.Create(...)"),
			oPropertyBinding
				= oModel.bindProperty("CurrencyCode", oOperationBinding.getParameterContext());

		return oModel.getMetaModel().requestData().then(function () {
			assert.strictEqual(oPropertyBinding.getValueListType(), ValueListType.Fixed);

			return oPropertyBinding.requestValueListInfo();
		}).then(function (mQualifier2ValueList) {
			assert.strictEqual(mQualifier2ValueList[""].$model.toString(),
				"sap.ui.model.odata.v4.ODataModel: /special/CurrencyCode/");
			delete mQualifier2ValueList[""].$model;
			assert.deepEqual(mQualifier2ValueList, {
				"" : {
					Label : "Publication's Currency"
				}
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Request value list information for a parameter of a bound action via annotations
	// with targets both in 4.0 and 4.01 syntax.
	// JIRA: CPOUI5ODATAV4-54
	QUnit.test("Value help at bound action parameter, 4.01 syntax, standard", function (assert) {
		var oModel = createSpecialCasesModel(),
			oOperationBinding
				= oModel.bindContext("/Artists('42')/_Publication/special.cases.Create(...)"),
			oPropertyBinding
				= oModel.bindProperty("Price", oOperationBinding.getParameterContext());

		return oModel.getMetaModel().requestData().then(function () {
			assert.strictEqual(oPropertyBinding.getValueListType(), ValueListType.Standard);

			return oPropertyBinding.requestValueListInfo();
		}).then(function (mQualifier2ValueList) {
			assert.strictEqual(mQualifier2ValueList[""].$model.toString(),
				"sap.ui.model.odata.v4.ODataModel: /special/Price/");
			delete mQualifier2ValueList[""].$model;
			assert.strictEqual(mQualifier2ValueList.A.$model.toString(),
				"sap.ui.model.odata.v4.ODataModel: /special/Price/");
			delete mQualifier2ValueList.A.$model;
			assert.strictEqual(mQualifier2ValueList.B.$model.toString(),
				"sap.ui.model.odata.v4.ODataModel: /special/Price/");
			delete mQualifier2ValueList.B.$model;
			assert.deepEqual(mQualifier2ValueList, {
				"" : {
					Label : "Price #"
				},
				"A" : {
					Label : "Price #A"
				},
				"B" : {
					Label : "Price #B"
				}
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Execute a bound action on the target of a navigation property. That action returns
	// its binding parameter which is thus updated ("cache synchronization") and is the target of
	// messages.
	// CPOUI5UISERVICESV3-1587
	QUnit.test("bound action on navigation property updates binding parameter", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sResourcePath = "Artists(ArtistID='42',IsActiveEntity=true)/BestPublication",
			sView = '\
<FlexBox binding="{\
		path : \'/Artists(ArtistID=\\\'42\\\',IsActiveEntity=true)/BestPublication\',\
		parameters : {$select : \'Messages\'}\
	}" id="form">\
	<Input id="price" value="{Price}" />\
</FlexBox>',
			that = this;

		this.expectRequest(sResourcePath + "?$select=Messages,Price,PublicationID", {
				PublicationID : "42-0",
				Price : "9.99"
			})
			.expectChange("price", "9.99");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("form").getObjectBinding().getBoundContext(),
				oOperation = that.oModel.bindContext("special.cases.PreparationAction(...)",
					oContext, {$$inheritExpandSelect : true});

			that.expectRequest({
				method : "POST",
				url : sResourcePath + "/special.cases.PreparationAction"
					+ "?$select=Messages,Price,PublicationID",
				payload : {}
			}, {
				Messages : [{
					code : "23",
					message : "Just A Message",
					numericSeverity : 1,
					transition : true,
					target : "Price"
				}],
				PublicationID : "42-0",
				Price : "3.33"
			})
			.expectChange("price", "3.33")
			.expectMessages([{
				code : "23",
				message : "Just A Message",
				// Note: We cannot know whether PreparationAction changed the target of
				// BestPublication, but as long as the form still displays "42-0", we might as well
				// keep it up-to-date and show messages there...
				target : "/Artists(ArtistID='42',IsActiveEntity=true)/BestPublication/Price",
				persistent : true,
				type : "Success"
			}]);

			// code under test
			return Promise.all([
				oOperation.execute(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "price", "Success", "Just A Message");
		});
	});

	//*********************************************************************************************
	// Scenario: Request side effects at a return value context leads to "duplicate" requests.
	// (Note: This is as expected, because two caches need to be updated!)
	// Avoid this by using the bound context of the binding with the empty path (a workaround by FE
	// for missing support of $expand at action POSTs). No fix required.
	// BCP: 1980108040
	QUnit.test("BCP: 1980108040", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			oReturnValueContext,
			sView = '\
<FlexBox id="objectPage" binding="{path : \'\', parameters : {$$ownRequest : true}}">\
	<Text id="id" text="{ArtistID}" />\
	<Text id="name" text="{Name}" />\
</FlexBox>',
			that = this;

		this.expectChange("id")
			.expectChange("name");

		return this.createView(assert, sView, oModel).then(function () {
			var oListBinding = that.oModel.bindList("/Artists"),
				oHeaderContext = oListBinding.getHeaderContext(),
				oOperationBinding = that.oModel.bindContext("special.cases.Create(...)",
					oHeaderContext, {$$patchWithoutSideEffects: true});

			that.expectRequest({
				method : "POST",
				payload : {},
				url : "Artists/special.cases.Create"
			}, {
				ArtistID : "42",
				IsActiveEntity : false
			});

			return oOperationBinding.execute();
		}).then(function (oReturnValueContext0) {
			oReturnValueContext = oReturnValueContext0;

			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=false)"
					+ "?$select=ArtistID,IsActiveEntity,Name", {
					ArtistID : "42",
					IsActiveEntity : false,
					Name : ""
				})
				.expectChange("id", "42")
				.expectChange("name", "");

			that.oView.byId("objectPage").setBindingContext(oReturnValueContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("Artists(ArtistID='42',IsActiveEntity=false)?$select=Name", {
					ArtistID : "42",
					IsActiveEntity : false,
					Name : "Hour Frustrated"
				})
				.expectChange("name", "Hour Frustrated");

			// Note: do not use oReturnValueContext, it would trigger duplicate requests
			that.oView.byId("objectPage").getObjectBinding().getBoundContext()
				// code under test
				.requestSideEffects([{$PropertyPath : "Name"}]);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: List binding is destroyed while request is in flight. Gracefully ignore response.
	// Note: No such problem for context or property binding.
	// BCP: 1980173241
	QUnit.test("BCP: 1980173241", function (assert) {
		var fnRespond,
			sView = '\
<Table items="{/EMPLOYEES}">\
	<ColumnListItem>\
		<Text text="{ID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$skip=0&$top=100", new Promise(function (resolve, reject) {
				fnRespond = resolve.bind(null, {value : []});
			}));

		return this.createView(assert, sView).then(function () {
			that.oView.destroy();
			delete that.oView;

			fnRespond();
		});
	});

	//*********************************************************************************************
	// Scenario: POST is "in flight", GET request should wait for the POST's response because
	// exclusive $filter needs to be adjusted. Similarly, side effects should update the created
	// entity and thus must also wait.
	// JIRA: CPOUI5UISERVICESV3-1845
[function () {
	this.expectRequest("BusinessPartnerList?$select=BusinessPartnerID,CompanyName"
			+ "&$filter=not (BusinessPartnerID eq '4710')"
			+ "&$skip=2&$top=1", {
			value : [{
				BusinessPartnerID : "4713",
				CompanyName : "FooBar"
			}]
		})
		.expectChange("id", [,, "4712", "4713"])
		.expectChange("name", [,, "Bar", "FooBar"]);
	// show more items while POST is still pending
	this.oView.byId("table-trigger").firePress();
}, function () {
	// Note: 4712 is discarded because it is currently not visible
	this.expectRequest("BusinessPartnerList?$select=BusinessPartnerID,CompanyName"
			+ "&$filter=BusinessPartnerID eq '4710' or BusinessPartnerID eq '4711'", {
			value : [{
				BusinessPartnerID : "4710",
					CompanyName : "Baz*"
			}, {
				BusinessPartnerID : "4711",
					CompanyName : "Foo*"
			}]
		})
		.expectChange("name", ["Baz*", "Foo*"]);
	// request side effects while POST is still pending
	return Promise.all([
		this.oView.byId("table").getBinding("items").getHeaderContext()
			.requestSideEffects([{$PropertyPath : "CompanyName"}]),
		this.oModel.submitBatch("update")
	]);
}].forEach(function (fnCodeUnderTest, i) {
	QUnit.test("JIRA: CPOUI5UISERVICESV3-1845 - POST still pending, " + i, function (assert) {
		var oContext,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			fnRespond,
			oSubmitBatchPromise,
			sView = '\
<Table growing="true" growingThreshold="2" id="table" items="{/BusinessPartnerList}">\
	<ColumnListItem>\
		<Text id="id" text="{BusinessPartnerID}" />\
		<Text id="name" text="{CompanyName}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("BusinessPartnerList?$select=BusinessPartnerID,CompanyName"
				+ "&$skip=0&$top=2", {
				value : [{
					BusinessPartnerID : "4711",
					CompanyName : "Foo"
				}, {
					BusinessPartnerID : "4712",
					CompanyName : "Bar"
				}]
			})
			.expectChange("id", ["4711", "4712"])
			.expectChange("name", ["Foo", "Bar"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "POST",
					payload : {},
					url : "BusinessPartnerList"
				}, new Promise(function (resolve, reject) {
					fnRespond = resolve.bind(null, {
						BusinessPartnerID : "4710",
						CompanyName : "Baz"
					});
				}))
				.expectChange("id", [""])
				.expectChange("name", [""]);
			oContext = that.oView.byId("table").getBinding("items").create({}, true);
			oSubmitBatchPromise = that.oModel.submitBatch("update");

			return that.waitForChanges(assert);
		}).then(function () {
			var oPromise;

			that.expectChange("id", ["4710"])
				.expectChange("name", ["Baz"]);
			oPromise = fnCodeUnderTest.call(that);
			fnRespond();

			return Promise.all([
				oPromise,
				oSubmitBatchPromise,
				oContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});
});

	//*********************************************************************************************
	// Scenario: GET request is triggered before POST, but ends up inside same $batch and thus
	// could return the newly created entity.
	// JIRA: CPOUI5UISERVICESV3-1825
	QUnit.skip("JIRA: CPOUI5UISERVICESV3-1825 - GET & POST in same $batch", function (assert) {
		var oBinding,
			oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			sView = '\
<Text id="count" text="{$count}"/>\
<Table growing="true" growingThreshold="2" id="table"\
		items="{path : \'/BusinessPartnerList\', parameters : {$count : true}}">\
	<ColumnListItem>\
		<Text id="id" text="{BusinessPartnerID}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("BusinessPartnerList?$count=true&$select=BusinessPartnerID"
				+ "&$skip=0&$top=2", {
				"@odata.count" : "3",
				value : [{
					BusinessPartnerID : "4711"
				}, {
					BusinessPartnerID : "4712"
				}]
			})
			.expectChange("count")
			.expectChange("id", ["4711", "4712"]);

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("table").getBinding("items");

			that.expectChange("count", "3");
			that.oView.byId("count").setBindingContext(oBinding.getHeaderContext());

			return that.waitForChanges(assert);
		}).then(function () {
			var oContext;

			that.expectRequest({
					batchNo : 2,
					changeSetNo : 2,
					method : "GET",
					url : "BusinessPartnerList?$count=true&$select=BusinessPartnerID"
						+ "&$filter=not (BusinessPartnerID eq '4710')" //TODO this is missing!
						+ "&$skip=2&$top=1"
				}, {
					"@odata.count" : "3",
					value : [{BusinessPartnerID : "4713"}]
				});
			// show more items before POST is even triggered
			that.oView.byId("table-trigger").firePress();

			that.expectChange("count", "4")
				.expectRequest({
					batchNo : 2,
					changeSetNo : 1, //TODO maybe this "reordering" is wrong (here)?
					method : "POST",
					payload : {},
					url : "BusinessPartnerList"
				}, {BusinessPartnerID : "4710"})
				.expectChange("id", ["4710",,, "4713"]);
			oContext = oBinding.create({}, true);

			return Promise.all([
				oContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Annotation target with parentheses to specify action overload
	// JIRA: CPOUI5UISERVICESV3-1844
	QUnit.test("Annotation target with parentheses to specify action overload", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true});

		return this.createView(assert, '', oModel).then(function () {
			return oModel.getMetaModel().requestData();
		}).then(function (oMetaData) {
			assert.deepEqual(
				oMetaData.$Annotations
					["special.cases.Create(Collection(special.cases.ArtistsType))/Countryoforigin"],
				{"@com.sap.vocabularies.Common.v1.Label" : "Country of Origin"});

			assert.strictEqual(oModel.getMetaModel().getObject("/Artists/special.cases.Create"
					+ "/Countryoforigin@com.sap.vocabularies.Common.v1.Label"),
				"Country of Origin", "specific overload wins");
			assert.strictEqual(oModel.getMetaModel().getObject("/Artists/special.cases.Create"
					+ "/Countryoforigin@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"),
				true, "fallback to annotation for all overloads");
			assert.deepEqual(oModel.getMetaModel().getObject("/Artists/special.cases.Create"
					+ "/Countryoforigin@com.sap.vocabularies.Common.v1.ValueListReferences"),
				["../countryoforigin/$metadata"]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create on a relative binding with $expand refreshes the newly created entity so
	// that navigation properties are available. Context#refresh is then used.
	// JIRA: CPOUI5UISERVICESV3-1814
	QUnit.test("Create on a relative binding with $expand", function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				groupId : "$auto",
				updateGroupId : "$auto"
			}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'1\')}">\
	<Text id="count" text="{headerContext>$count}"/>\
	<Table id="table" items="{path : \'SO_2_SOITEM\', parameters : {$select : \'Messages\'}}">\
		<ColumnListItem>\
			<Text id="position" text="{ItemPosition}"/>\
			<Input id="quantity" value="{Quantity}"/>\
			<Input id="product" value="{SOITEM_2_PRODUCT/ProductID}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest({
				batchNo : 1,
				method : "GET",
				url : "SalesOrderList('1')?$select=SalesOrderID"
					+ "&$expand=SO_2_SOITEM($select=ItemPosition,Messages,Quantity,SalesOrderID;"
						+ "$expand=SOITEM_2_PRODUCT($select=ProductID))"
			}, {
				SalesOrderID : "1",
				SO_2_SOITEM : [{
					ItemPosition : "10",
					Messages : [],
					Quantity : "7",
					SalesOrderID : "1",
					SOITEM_2_PRODUCT : {ProductID : "2"}
				}]
			})
			.expectChange("count")
			.expectChange("position", ["10"])
			.expectChange("quantity", ["7.000"])
			.expectChange("product", ["2"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("table").getBinding("items");

			that.expectChange("count", "1");

			that.oView.setModel(that.oView.getModel(), "headerContext");
			that.oView.byId("count")
				.setBindingContext(oBinding.getHeaderContext(), "headerContext");

			return that.waitForChanges(assert);
		}).then(function () {
			var oBinding = that.oView.byId("table").getBinding("items");

			that.expectRequest({
					batchNo : 2,
					method : "POST",
					url : "SalesOrderList('1')/SO_2_SOITEM",
					payload : {}
				}, {
					SalesOrderID : "1",
					ItemPosition : "20"
				})
				.expectRequest({
					batchNo : 3,
					method : "GET",
					url : "SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='20')"
						+ "?$select=ItemPosition,Messages,Quantity,SalesOrderID"
						+ "&$expand=SOITEM_2_PRODUCT($select=ProductID)"
				}, {
					ItemPosition : "20",
					Messages : [{
						code : "23",
						message : "Enter a minimum quantity of 2",
						numericSeverity : 3,
						target : "Quantity"
					}],
					Quantity : "0",
					SalesOrderID : "1",
					SOITEM_2_PRODUCT : {ProductID : "3"}
				})
				.expectChange("count", "2")
				// position becomes "" and product null, as _Cache#drillDown resolves with
				// null for ItemPosition and undefined for SOITEM_2_PRODUCT/ProductID. These values
				// are formatted differently by sap.ui.model.odata.type.String#formatValue
				.expectChange("position", ["", "10"])
				.expectChange("quantity", [null, "7.000"])
				.expectChange("product", [null, "2"])
				.expectChange("position", ["20"])
				.expectChange("quantity", ["0.000"])
				.expectChange("product", ["3"])
				.expectMessages([{
					code : "23",
					message : "Enter a minimum quantity of 2",
					persistent : false,
					target : "/SalesOrderList('1')"
						+ "/SO_2_SOITEM(SalesOrderID='1',ItemPosition='20')/Quantity",
					technical : false,
					type : "Warning"
				}]);

			// code under test
			oCreatedContext = oBinding.create();

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oQuantityField = that.oView.byId("table").getItems()[0].getCells()[1];

			return that.checkValueState(assert, oQuantityField, "Warning",
				"Enter a minimum quantity of 2");
		}).then(function () {
			that.expectRequest("SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='20')"
					+ "?$select=ItemPosition,Messages,Quantity,SalesOrderID"
					+ "&$expand=SOITEM_2_PRODUCT($select=ProductID)", {
					ItemPosition : "20",
					Messages : [{
						code : "0815",
						message : "Best Product Ever",
						numericSeverity : 2,
						target : "SOITEM_2_PRODUCT/ProductID"
					}],
					Quantity : "2",
					SalesOrderID : "1",
					SOITEM_2_PRODUCT : {ProductID : "42"}
				})
				.expectChange("quantity", ["2.000"])
				.expectChange("product", ["42"])
				.expectMessages([{
					code : "0815",
					message : "Best Product Ever",
					persistent : false,
					target : "/SalesOrderList('1')"
						+ "/SO_2_SOITEM(SalesOrderID='1',ItemPosition='20')"
						+ "/SOITEM_2_PRODUCT/ProductID",
					technical : false,
					type : "Information"
				}]);

			return Promise.all([
				// code under test
				oCreatedContext.refresh("$auto", false),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oProductField = that.oView.byId("table").getItems()[0].getCells()[2];

			return that.checkValueState(assert, oProductField, "Information", "Best Product Ever");
		}).then(function () {
			that.expectRequest("SalesOrderList('1')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Quantity,SalesOrderID"
					+ "&$expand=SOITEM_2_PRODUCT($select=ProductID)"
					+ "&$filter=SalesOrderID%20eq%20'1'", {
					value: [{ // simulate that entity still matches list's filter
						ItemPosition : "20",
						Messages : [{
							code : "0123",
							message : "Keep on buying!",
							numericSeverity : 1,
							target : "SOITEM_2_PRODUCT/ProductID"
						}],
						Quantity : "3",
						SalesOrderID : "1",
						SOITEM_2_PRODUCT : {ProductID : "42"}
					}]
				})
				.expectChange("quantity", ["3.000"])
				.expectMessages([{
					code : "0123",
					message : "Keep on buying!",
					persistent : false,
					target : "/SalesOrderList('1')"
						+ "/SO_2_SOITEM(SalesOrderID='1',ItemPosition='20')"
						+ "/SOITEM_2_PRODUCT/ProductID",
					technical : false,
					type : "Success"
				}]);

			return Promise.all([
				// code under test
				oCreatedContext.refresh("$auto", true),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oProductField = that.oView.byId("table").getItems()[0].getCells()[2];

			return that.checkValueState(assert, oProductField, "Success", "Keep on buying!");
		}).then(function () {
			that.expectRequest("SalesOrderList('1')/SO_2_SOITEM"
					+ "?$select=ItemPosition,Messages,Quantity,SalesOrderID"
					+ "&$expand=SOITEM_2_PRODUCT($select=ProductID)"
					+ "&$filter=SalesOrderID%20eq%20'1'", {
					value : [] // simulate that entity does not match list's filter anymore
				})
				.expectChange("count", "1")
				.expectChange("position", ["10"])
				.expectChange("quantity", ["7.000"])
				.expectChange("product", ["2"])
				.expectMessages([]); // message for removed row must disappear!

			return Promise.all([
				// code under test
				oCreatedContext.refresh("$auto", true),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: View contains a form for an entity. Context#setProperty is called. Property binding
	// is updated and PATCH request is sent via update group ID. Server returns a bound message.
	// JIRA: CPOUI5UISERVICESV3-1790
	QUnit.test("Context#setProperty: read/write", function (assert) {
		var oModel = createTeaBusiModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			oPromise,
			sView = '\
<FlexBox id="form" binding="{/TEAMS(\'TEAM_01\')}">\
	<Text id="id" text="{Team_Id}" />\
	<Input id="name" value="{Name}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('TEAM_01')?$select=Name,Team_Id", {
				Name : "Team #1",
				Team_Id : "TEAM_01"
			})
			.expectChange("id", "TEAM_01")
			.expectChange("name", "Team #1");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("form").getObjectBinding().getBoundContext();

			that.expectChange("name", "Best Team Ever");

			// code under test
			oPromise = oContext.setProperty("Name", "Best Team Ever");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					payload : {Name : "Best Team Ever"},
					url : "TEAMS('TEAM_01')"
				}, {
					Name : "Best Team Ever",
					Team_Id : "TEAM_01",
					__CT__FAKE__Message : {
						__FAKE__Messages : [{
							code : "CODE",
							message : "What a stupid name!",
							numericSeverity : 3,
							target : "Name",
							transition : false
						}]
					}
				}).expectMessages([{
					code : "CODE",
					message : "What a stupid name!",
					persistent : false,
					target : "/TEAMS('TEAM_01')/Name",
					type : "Warning"
				}]);

			return Promise.all([
				that.oModel.submitBatch("update"),
				oPromise,
				that.waitForChanges(assert)
			]);
		}).then(function () {
			return that.checkValueState(assert, "name", "Warning", "What a stupid name!");
		});
	});

	//*********************************************************************************************
	// Scenario: Create a context binding for an entity and call setProperty at its bound context
	// w/o reading before. A PATCH request for the property should be sent.
	// JIRA: CPOUI5UISERVICESV3-1790
	QUnit.test("Context#setProperty: write only", function (assert) {
		var iNoPatchCompleted = 0,
			iNoPatchSent = 0,
			that = this;

		return this.createView(assert).then(function () {
			var oContextBinding = that.oModel.bindContext("/TEAMS('TEAM_01')"),
				oContext = oContextBinding.getBoundContext();

			oContextBinding.attachPatchCompleted(function (oEvent) {
				iNoPatchCompleted += 1;
				assert.strictEqual(oEvent.getParameter("success"), true);
			});
			oContextBinding.attachPatchSent(function () {
				iNoPatchSent += 1;
			});
			that.expectRequest({
					headers : {"If-Match" : "*"},
					method : "PATCH",
					payload : {Name : "Best Team Ever"},
					url : "TEAMS('TEAM_01')"
				});

			return Promise.all([
				// code under test
				oContext.setProperty("Name", "Best Team Ever"),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(iNoPatchCompleted, 1);
			assert.strictEqual(iNoPatchSent, 1);
		});
	});

	//*********************************************************************************************
	// Scenario: Declarative event handlers can refer to property bindings.
	// JIRA: CPOUI5UISERVICESV3-1912
	QUnit.test("Declarative event handlers", function (assert) {
		var done = assert.async(),
			oController = {
				onPress : function (sNetAmount) {
					assert.strictEqual(sNetAmount, "2,000.00");
					done();
				}
			},
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/SalesOrderList}">\
	<ColumnListItem>\
		<Button id="button" press=".onPress(${path : \'NetAmount\', targetType : \'string\'})"\
			text="{NetAmount}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList?$select=NetAmount,SalesOrderID&$skip=0&$top=100", {
				value : [{
					NetAmount : "2000",
					SalesOrderID : "4711"
				}, {
					NetAmount : "4000",
					SalesOrderID : "4712"
				}]
			})
			.expectChange("button", ["2,000.00", "4,000.00"]);

		this.createView(assert, sView, oModel, oController).then(function () {
			that.oView.byId("table").getItems()[0].getCells()[0].firePress();
		});
	});

	//*********************************************************************************************
	// Scenario: Use list binding programmatically.
	// JIRA: CPOUI5UISERVICESV3-1871
	QUnit.test("Use list binding programmatically", function (assert) {
		var done = assert.async(),
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			that = this;

		this.createView(assert, "", oModel).then(function () {
			var oBinding = oModel.bindList("/SalesOrderList");

			that.expectRequest("SalesOrderList?$skip=0&$top=10", {
				value : [{
					SalesOrderID : "4711"
				}, {
					SalesOrderID : "4712"
				}]
			});

			oBinding.attachChange(function (oEvent) {
				var aContexts = oBinding.getContexts(0, 10);

				if (!oEvent.getParameter("detailedReason")) {
					assert.strictEqual(aContexts.length, 2);
					assert.strictEqual(aContexts[0].getProperty("SalesOrderID"), "4711");
					assert.strictEqual(aContexts[1].getProperty("SalesOrderID"), "4712");
					done();
				}
			});
			oBinding.attachRefresh(function () {
				oBinding.getContexts(0, 10);
			});
			oBinding.initialize();
		});
	});

	//*********************************************************************************************
	// Scenario: Reduce path by removing partner attributes SO_2_SOITEM and SOITEM_2_SO, so that
	// "SOITEM_2_SO/CurrencyCode" is not expanded, but taken from the parent sales order in the same
	// cache and written back to it.
	// JIRA: CPOUI5UISERVICESV3-1877
	QUnit.test("Reduce path: property in same cache", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'1\')}">\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="note" text="{Note}"/>\
			<Input id="soCurrencyCode" value="{SOITEM_2_SO/CurrencyCode}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=CurrencyCode,SalesOrderID"
					+ "&$expand=SO_2_SOITEM($select=ItemPosition,Note,SalesOrderID)", {
				"@odata.etag" : "ETag",
				CurrencyCode : "EUR",
				SalesOrderID : "1",
				SO_2_SOITEM : [{
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", ["Foo"])
			.expectChange("soCurrencyCode", ["EUR"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oBinding = that.oView.byId("table").getItems()[0].getCells()[1].getBinding("value");

			that.expectChange("soCurrencyCode", ["USD"])
				.expectRequest({
					method : "PATCH",
					headers : {"If-Match" : "ETag"},
					url : "SalesOrderList('1')",
					payload : {CurrencyCode : "USD"}
				}, {
					CurrencyCode : "USD",
					SalesOrderID : "1"
				});

			oBinding.setValue("USD");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Reduce path by removing partner attributes SO_2_SOITEM and SOITEM_2_SO. Simulate an
	// In-Parameter of a value help for which the value is cached in the parent binding. Do this for
	// a creation row, too.
	// JIRA: CPOUI5UISERVICESV3-1877
	// JIRA: CPOUI5UISERVICESV3-1942
	QUnit.test("Reduce path: property in parent cache", function (assert) {
		var oCreationRowContext,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')}">\
	<Text id="soCurrencyCode" text="{CurrencyCode}"/>\
	<Table id="table" items="{path: \'SO_2_SOITEM\', parameters: {$$ownRequest: true}}">\
		<ColumnListItem>\
			<Text id="note" text="{Note}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<FlexBox id="creationRow">\
	<Text id="creationRow::note" text="{Note}"/>\
</FlexBox>\
<FlexBox id="valueHelp">\
	<Input id="valueHelp::currencyCode" value="{SOITEM_2_SO/CurrencyCode}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=CurrencyCode,SalesOrderID", {
				CurrencyCode : "EUR",
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderList('1')/SO_2_SOITEM?$select=ItemPosition,Note,SalesOrderID"
					+ "&$skip=0&$top=100", {
				value : [{
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", ["Foo"])
			.expectChange("soCurrencyCode", "EUR")
			.expectChange("valueHelp::currencyCode");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("valueHelp::currencyCode", "EUR");

			// start value help
			that.oView.byId("valueHelp").setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("valueHelp::currencyCode", null);

			// stop value help
			that.oView.byId("valueHelp").setBindingContext(null);

			return that.waitForChanges(assert);
		}).then(function () {
			var oCreationRowListBinding, oTableBinding;

			that.expectChange("valueHelp::currencyCode", "EUR");

			// create and initialize creation row
			oTableBinding = that.oView.byId("table").getBinding("items");
			oCreationRowListBinding = that.oModel.bindList(oTableBinding.getPath(),
				oTableBinding.getContext(), undefined, undefined,
				{$$updateGroupId : "doNotSubmit"});
			oCreationRowContext = oCreationRowListBinding.create();
			that.oView.byId("creationRow").setBindingContext(oCreationRowContext);

			// start value help on creation row
			that.oView.byId("valueHelp").setBindingContext(oCreationRowContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("soCurrencyCode", "USD")
				.expectChange("valueHelp::currencyCode", "USD");

			// the PATCH must not be sent!
			that.oView.byId("valueHelp::currencyCode").getBinding("value").setValue("USD");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("valueHelp::currencyCode", null);

			// delete creation row to avoid errors in destroy
			oCreationRowContext.created().catch(function () {/* avoid "Uncaught (in promise)" */});
			oCreationRowContext.delete("$auto");
		});
	});

	//*********************************************************************************************
	// Scenario: Reduce path by removing multiple pairs of partner attributes.
	// JIRA: CPOUI5UISERVICESV3-1877
	QUnit.test("Reduce path by removing multiple pairs of partner attributes", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/As(1)}">\
	<FlexBox binding="{AtoB}">\
		<Table id="table" items="{BtoDs}">\
			<ColumnListItem>\
				<Text id="aValue" text="{DtoB/BtoA/AValue}"/>\
			</ColumnListItem>\
		</Table>\
	</FlexBox>\
</FlexBox>';

		this.expectRequest("As(1)?$select=AID,AValue"
			+ "&$expand=AtoB($select=BID;$expand=BtoDs($select=DID))", {
				AID : 1,
				AValue : 42,
				AtoB : {
					BID : 2,
					BtoDs : [{
						DID : 3
					}]
				}
			})
			.expectChange("aValue", ["42"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Reduce path by removing multiple pairs of partner attributes. See that AValue is
	// taken from two caches above.
	// JIRA: CPOUI5UISERVICESV3-1877
	QUnit.test("Reduce path and step up multiple caches", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/As(1)}">\
	<FlexBox binding="{path : \'AtoB\', parameters : {$$ownRequest : true}}">\
		<Text text="{BValue}"/>\
		<Table id="table" items="{path : \'BtoDs\', parameters : {$$ownRequest : true}}">\
			<ColumnListItem>\
				<Text text="{DValue}"/>\
				<Text id="aValue" text="{DtoB/BtoA/AValue}"/>\
			</ColumnListItem>\
		</Table>\
	</FlexBox>\
</FlexBox>';

		this.expectRequest("As(1)?$select=AID,AValue", {
				AID : 1,
				AValue : 42
			})
			.expectRequest("As(1)/AtoB?$select=BID,BValue", {
				BID : 2,
				BValue : 102
			})
			.expectRequest("As(1)/AtoB/BtoDs?$select=DID,DValue&$skip=0&$top=100", {
				value : [
					{DID : 3, DValue : 103},
					{DID : 4, DValue : 104}
				]
			})
			.expectChange("aValue", ["42", "42"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Reduced path must not be shorter than root binding's path.
	// JIRA: CPOUI5UISERVICESV3-1877
	QUnit.test("Reduced path must not be shorter than root binding's path", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/As(1)/AtoB}">\
	<Text id="aValue" text="{BtoA/AValue}"/>\
	<Table id="table" items="{BtoDs}">\
		<ColumnListItem>\
			<Text id="table::aValue" text="{DtoB/BtoA/AValue}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest("As(1)/AtoB?$select=BID"
				+ "&$expand=BtoA($select=AID,AValue),BtoDs($select=DID)", {
				BID : 2,
				BtoA : {
					AID : 1,
					AValue : 42
				},
				BtoDs : [{
					DID : 3
				}]
			})
			.expectChange("aValue", "42")
			.expectChange("table::aValue", ["42"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Operation on reduceable path. The operation path will not be reduced, but the
	// reduced path must be used to access the binding parameter.
	// JIRA: CPOUI5UISERVICESV3-1877
	QUnit.test("Operation on reduceable path", function (assert) {
		var sAction = "com.sap.gateway.default.zui5_epm_sample.v0002.SalesOrder_Confirm",
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'1\')}">\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="note" text="{Note}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<FlexBox id="form" binding="{SOITEM_2_SO/' + sAction + '(...)}">\
	<Text id="status" text="{LifecycleStatus}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=SalesOrderID"
			+ "&$expand=SO_2_SOITEM($select=ItemPosition,Note,SalesOrderID)", {
				"@odata.etag" : "ETag",
				SalesOrderID : "1",
				SO_2_SOITEM : [{
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", ["Foo"])
			.expectChange("status");

		return this.createView(assert, sView, oModel).then(function () {
			var oForm = that.oView.byId("form");

			that.expectRequest({
					method : "POST",
					url : "SalesOrderList('1')/SO_2_SOITEM(SalesOrderID='1',ItemPosition='10')"
						+ "/SOITEM_2_SO/" + sAction, // TODO reduce operation path
					headers : {"If-Match" : "ETag"},
					payload : {}
				}, {
					LifecycleStatus : "C",
					SalesOrderID : "1"
				})
				.expectChange("status", "C");

			oForm.setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext());
			oForm.getElementBinding().execute();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Partner attributes are in the path to a collection. Ensure that the path is reduced
	// and all properties including $count can be accessed. Check also that it does not clash with
	// unreduced list bindings.
	// JIRA: CPOUI5UISERVICESV3-1877
	QUnit.test("Partner attributes in path to collection", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/Bs(1)}">\
	<Table id="table" items="{BtoA/AtoB/BtoDs}">\
		<ColumnListItem>\
			<Text id="bValue" text="{DtoB/BValue}"/>\
			<Text id="dValue" text="{DValue}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("Bs(1)?$select=BID,BValue&$expand=BtoA($select=AID"
			+ ";$expand=AtoB($select=BID;$expand=BtoDs($select=DID,DValue)))", {
				BID : 1,
				BValue : 101,
				BtoA : {
					AtoB : {
						BtoDs : [
							{DID : 2, DValue : 99},
							{DID : 3, DValue : 98}
						]
					}
				}
			})
			.expectChange("bValue", ["101", "101"])
			.expectChange("dValue", ["99", "98"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("Bs(1)/BtoA/AtoB/BtoDs?$select=DID,DValue&$orderby=DValue"
				+ "&$skip=0&$top=100", {
					value : [
						{DID : 3, DValue : 98},
						{DID : 2, DValue : 99}
					],
					"BtoDs@odata.count" : "2"
				})
				.expectChange("dValue", ["98", "99"]);

			// code under test
			that.oView.byId("table").getBinding("items").sort(new Sorter("DValue"));
		});
	});

	//*********************************************************************************************
	// Scenario: Partner attributes are in the path to a property, but reduction is impossible
	// because the parent binding has a different update group with submit mode API.
	// JIRA: CPOUI5UISERVICESV3-1877
	// JIRA: CPOUI5UISERVICESV3-1944
	QUnit.test("Partner attributes in path to collection, other updateGroupId", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true, updateGroupId : 'update'}),
			sView = '\
<FlexBox binding="{/Bs(1)}">\
	<Text id="bValue" text="{BValue}"/>\
	<Table items="{BtoDs}">\
		<ColumnListItem>\
			<Text id="bValue::table1" text="{DtoB/BValue}"/>\
		</ColumnListItem>\
	</Table>\
	<Table items="{path : \'BtoDs\', parameters : {$$updateGroupId : \'$auto\'}}">\
		<ColumnListItem>\
			<Text id="bValue::table2" text="{DtoB/BValue}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>';

		this.expectRequest("Bs(1)?$select=BID,BValue&$expand=BtoDs($select=DID)", {
				BID : 1,
				BValue : 101,
				BtoDs : [
					{DID : 2},
					{DID : 3}
				]
			})
			.expectRequest("Bs(1)/BtoDs?$select=DID&$expand=DtoB($select=BID,BValue)"
				+ "&$skip=0&$top=100", {
				value : [{
					DID : 2,
					DtoB : {BID : 1, BValue : 101}
				}, {
					DID : 3,
					DtoB : {BID : 1, BValue : 101}
				}]
			})
			.expectChange("bValue", "101")
			.expectChange("bValue::table1", ["101", "101"])
			.expectChange("bValue::table2", ["101", "101"]);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Request data from property binding
	QUnit.test("ODPrB access value async via API", function (assert) {
		var oModel = createSalesOrdersModel(),
			oPropertyBinding = oModel.bindProperty("/SalesOrderList('1')/NetAmount"),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			that.expectRequest("SalesOrderList('1')/NetAmount", {value : 42});

			// code under test
			return oPropertyBinding.requestValue().then(function (vValue) {
				assert.strictEqual(vValue, 42);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Request data from context binding
	QUnit.test("ODCB access value async via API", function (assert) {
		var oModel = createSalesOrdersModel(),
			oContextBinding = oModel.bindContext("/SalesOrderList('1')"),
			oSalesOrder = {
				NetAmount : 42,
				SalesOrderID : "1",
				TaxAmount : 117
			},
			oSalesOrderResponse = Object.assign({}, oSalesOrder),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			that.expectRequest("SalesOrderList('1')", oSalesOrderResponse);

			// code under test
			return oContextBinding.requestObject().then(function (oResponse) {
				assert.deepEqual(oResponse, oSalesOrder);
				assert.notStrictEqual(oResponse, oSalesOrderResponse);

				return oContextBinding.requestObject("TaxAmount").then(function (vValue) {
					assert.strictEqual(vValue, 117);
				});

			});
		});
	});

	//*********************************************************************************************
	// Scenario: requestSideEffects must not refresh a dependent list binding in case it is a
	// "creation row" which means it only contains transient contexts.
	// JIRA: CPOUI5UISERVICESV3-1943
	QUnit.test("requestSideEffects does not refresh creation row", function (assert) {
		var oCreationRowContext,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			oTableBinding,
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')}">\
	<Input id="soCurrencyCode" value="{CurrencyCode}"/>\
	<Table id="table" items="{path: \'SO_2_SOITEM\', parameters: {$$ownRequest: true}}">\
		<ColumnListItem>\
			<Text id="note" text="{Note}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<FlexBox id="creationRow">\
	<Input id="creationRow::note" value="{Note}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=CurrencyCode,SalesOrderID", {
				CurrencyCode : "EUR",
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderList('1')/SO_2_SOITEM?$select=ItemPosition,Note,SalesOrderID"
					+ "&$skip=0&$top=100", {
				value : [{
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", ["Foo"])
			.expectChange("soCurrencyCode", "EUR")
			.expectChange("creationRow::note");

		return this.createView(assert, sView, oModel).then(function () {
			var oCreationRowListBinding;

			oTableBinding = that.oView.byId("table").getBinding("items");
			oCreationRowListBinding = oModel.bindList(oTableBinding.getPath(),
				oTableBinding.getContext(), undefined, undefined,
				{$$updateGroupId : "doNotSubmit"});

			that.expectChange("creationRow::note", "New item note");

			// initialize creation row
			oCreationRowContext = oCreationRowListBinding.create({Note : "New item note"});
			that.oView.byId("creationRow").setBindingContext(oCreationRowContext);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("SalesOrderList('1')/SO_2_SOITEM"
						+ "?$select=ItemPosition,Note,SalesOrderID&$skip=0&$top=100", {
					value : [{
						ItemPosition : "10",
						Note : "Foo - side effect",
						SalesOrderID : "1"
					}]
				})
				.expectChange("note", ["Foo - side effect"]);

			// code under test: requestSideEffects promise resolves, "creationRow::note" unchanged
			return Promise.all([
				oTableBinding.getContext().requestSideEffects([{
					$NavigationPropertyPath : "SO_2_SOITEM"
				}]),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("creationRow::note", "Changed item note");

			// code under test: no error on edit in transient context after requestSideEffects
			that.oView.byId("creationRow::note").getBinding("value").setValue("Changed item note");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("creationRow::note", null);

			return Promise.all([
				// cleanup: delete creation row to avoid error on view destruction
				oCreationRowContext.delete("$auto"),
				oCreationRowContext.created()
					.catch(function () {/* avoid "Uncaught (in promise)" */}),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: ODataModel#hasPendingChanges works synchronously as expected:
	//  - it detects pending parked changes
	//  - it considers reset changes
	//  - changing a value and immediately resetting it
	//  - in combination with creation row and late property bindings
	// JIRA: CPOUI5UISERVICESV3-1946 ODataModel#hasPendingChanges with group ID
	// JIRA: CPOUI5UISERVICESV3-1955 ODataModel#hasPendingChanges does also work for new entities
	QUnit.test("ODataModel#hasPendingChanges: late properties and creation row", function (assert) {
		var oCreationRowContext,
			oCreationRowListBinding,
			oFormBinding,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "$auto"
			}),
			oTableBinding,
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')}">\
	<Input id="soCurrencyCode" value="{CurrencyCode}"/>\
	<Table id="table" items="{path: \'SO_2_SOITEM\', parameters: {$$ownRequest: true}}">\
		<ColumnListItem>\
			<Text id="note" text="{Note}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>\
<FlexBox id="creationRow">\
	<Input id="creationRow::note" value="{Note}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=CurrencyCode,SalesOrderID", {
				CurrencyCode : "EUR",
				SalesOrderID : "1"
			})
			.expectRequest("SalesOrderList('1')/SO_2_SOITEM?$select=ItemPosition,Note,SalesOrderID"
					+ "&$skip=0&$top=100", {
				value : [{
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", ["Foo"])
			.expectChange("soCurrencyCode", "EUR")
			.expectChange("creationRow::note");

		return this.createView(assert, sView, oModel).then(function () {
			var oError = createError({
					code : "Code",
					message : "Invalid currency code"
				});

			oFormBinding = that.oView.byId("form").getObjectBinding();
			that.oLogMock.expects("error")
				.withArgs("Failed to update path /SalesOrderList('1')/CurrencyCode");
			that.expectRequest({
					method : "PATCH",
					payload : {CurrencyCode : "invalid"},
					url : "SalesOrderList('1')"
				}, oError)
				.expectChange("soCurrencyCode", "invalid")
				.expectMessages([{
					code : "Code",
					descriptionUrl : undefined,
					message : "Invalid currency code",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			// trigger error to see that hasPendingChanges finds also parked changes
			that.oView.byId("soCurrencyCode").getBinding("value").setValue("invalid");

			assert.ok(oModel.hasPendingChanges());
			assert.ok(oModel.hasPendingChanges("$auto"));
			assert.ok(oFormBinding.hasPendingChanges(), "form is dirty");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("soCurrencyCode", "EUR");

			// remove parked changes
			oModel.resetChanges("$auto");

			assert.notOk(oModel.hasPendingChanges());
			assert.notOk(oModel.hasPendingChanges("$auto"));

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("soCurrencyCode", "USD")
				.expectChange("soCurrencyCode", "EUR");

			that.oView.byId("soCurrencyCode").getBinding("value").setValue("USD");

			assert.ok(oModel.hasPendingChanges());
			assert.ok(oModel.hasPendingChanges("$auto"));

			oModel.resetChanges("$auto");

			assert.notOk(oModel.hasPendingChanges());
			assert.notOk(oModel.hasPendingChanges("$auto"));

			return that.waitForChanges(assert);
		}).then(function () {
			oTableBinding = that.oView.byId("table").getBinding("items");
			oCreationRowListBinding = oModel.bindList(oTableBinding.getPath(),
				oTableBinding.getContext(), undefined, undefined,
				{$$updateGroupId : "doNotSubmit"});

			that.expectChange("creationRow::note", "New item note");

			// initialize creation row
			oCreationRowContext = oCreationRowListBinding.create({Note : "New item note"});
			that.oView.byId("creationRow").setBindingContext(oCreationRowContext);

			assert.ok(oFormBinding.hasPendingChanges());
			assert.ok(oCreationRowListBinding.hasPendingChanges());
			assert.ok(oModel.hasPendingChanges(), "consider all groups");
			assert.notOk(oModel.hasPendingChanges("$auto"));
			assert.ok(oModel.hasPendingChanges("doNotSubmit"), "creation row has changes");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("creationRow::note", null);

			return Promise.all([
				// cleanup: delete creation row to avoid error on view destruction
				oCreationRowContext.delete("$auto"),
				oCreationRowContext.created()
					.catch(function () {/* avoid "Uncaught (in promise)" */}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.notOk(oFormBinding.hasPendingChanges());
			assert.notOk(oCreationRowListBinding.hasPendingChanges());
			assert.notOk(oModel.hasPendingChanges(), "consider all groups");
			assert.notOk(oModel.hasPendingChanges("$auto"));
			assert.notOk(oModel.hasPendingChanges("doNotSubmit"), "creation row has changes");
		});
	});

	//*********************************************************************************************
	// Scenario: Create a row. See that the city (a nested property inside the address) is removed,
	// when the POST response nulls the address (the complex property containing it).
	// JIRA: CPOUI5UISERVICESV3-1878
	// Also checks that setting properties with group ID null on a transient context is not
	// reflected in the POST payload.
	// JIRA: CPOUI5ODATAV4-114
	QUnit.test("create removes a nested property", function (assert) {
		var oCreatedContext,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "update"
			}),
			sView = '\
<Table id="table" items="{/BusinessPartnerList}">\
	<ColumnListItem>\
		<Text id="city" text="{Address/City}"/>\
		<Text id="type" text="{Address/AddressType}"/>\
		<Text id="company" text="{CompanyName}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("BusinessPartnerList?$select=Address/AddressType,Address/City"
			+ ",BusinessPartnerID,CompanyName&$skip=0&$top=100",
				{value : []})
			.expectChange("city", [])
			.expectChange("type", [])
			.expectChange("company", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("city", ["Heidelberg"])
				// CPOUI5ODATAV4-114
				.expectChange("type", ["42"])
				.expectChange("company", ["Nestle"]);

			oCreatedContext = that.oView.byId("table").getBinding("items").create({
				Address : {City : "Heidelberg"}
			}, true);

			return Promise.all([
				// code under test (CPOUI5ODATAV4-14)
				oCreatedContext.setProperty("Address/City", "St. Ingbert", "$direct")
					.then(function () {
						assert.ok(false);
					}, function (oError) {
						assert.strictEqual(oError.message, "The entity will be created via group"
							+ " 'update'. Cannot patch via group '$direct'");
					}),
				// code under test (CPOUI5ODATAV4-114)
				oCreatedContext.setProperty("Address/AddressType", "42", null),
				oCreatedContext.setProperty("CompanyName", "Nestle", null),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest({
					method : "POST",
					url : "BusinessPartnerList",
					payload : {Address : {City : "Heidelberg"}}
				}, {
					Address : null,
					BusinessPartnerId : "1",
					CompanyName : "SAP"
				})
				.expectChange("city", [null])
				.expectChange("type", [null])
				.expectChange("company", ["SAP"]);

			return Promise.all([
				oModel.submitBatch("update"),
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Creation of an entity fails due to a network error. A subsequent call to
	// requestSideEffects repeats the failed POST in the same $batch.
	// JIRA: CPOUI5UISERVICESV3-1936
[{
	expectations : function () {
		this.expectRequest({
				batchNo : 3,
				method : "POST",
				payload : {Note : "Created"},
				url : "BusinessPartnerList('4711')/BP_2_SO"
			}, {
				Note : "Created",
				SalesOrderID : "43"
			})
			.expectRequest({
				batchNo : 3,
				method : "GET",
				url : "BusinessPartnerList('4711')?$select=BP_2_SO"
					+ "&$expand=BP_2_SO($select=Note,SalesOrderID)"
			}, {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "Unrealistic",
					SalesOrderID : "43"
				}, {
					Note : "Side Effect",
					SalesOrderID : "0500000001"
				}]
			})
			//.expectChange("id", ["43"]);
			.expectChange("id", "43", -1) //TODO fix Context#getIndex to not return -1;
			// this is caused by ODLB#reset which sets iCreatedContexts = 0 and parks all
			// contexts without changing the index;
			// this conflicts with the _Cache#create success handler that changes values
			// corresponding to the context with iIndex === -1
			.expectChange("note", ["Unrealistic", "Side Effect"]);
	},
	text : "Repeated POST succeeds"
}, {
	expectations : function () {
		var oCausingError = createError(); // a technical error -> let the $batch itself fail

		this.oLogMock.expects("error").withArgs("POST on 'BusinessPartnerList('4711')/BP_2_SO'"
			+ " failed; will be repeated automatically");
		this.oLogMock.expects("error").withArgs("$batch failed");
		this.oLogMock.expects("error").withArgs("Failed to request side effects");

		this.expectRequest({
				batchNo : 3,
				method : "POST",
				payload : {Note : "Created"},
				url : "BusinessPartnerList('4711')/BP_2_SO"
			}, oCausingError)
			.expectRequest({
				batchNo : 3,
				method : "GET",
				url : "BusinessPartnerList('4711')?$select=BP_2_SO"
					+ "&$expand=BP_2_SO($select=Note,SalesOrderID)"
			})  // no response required
			.expectMessages([{
				code : undefined,
				message : "Communication error: 500 ",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}, {
				code : undefined,
				message : "HTTP request was not processed because $batch failed",
				persistent : true,
				target : "",
				technical : true,
				type : "Error"
			}]);

		return oCausingError;
	},
	text : "Repeated POST fails"
}].forEach(function (oFixture) {
	QUnit.test("requestSideEffects repeats failed POST -" + oFixture.text, function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			oTableBinding,
			sView = '\
<FlexBox id="form" binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" items="{BP_2_SO}">\
		<ColumnListItem>\
			<Text id="id" text="{SalesOrderID}" />\
			<Text id="note" text="{Note}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		that.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
				+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "Test",
					SalesOrderID : '0500000001'
				}]
			})
			.expectChange("id", ["0500000001"])
			.expectChange("note", ["Test"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error").withArgs("POST on 'BusinessPartnerList('4711')/BP_2_SO'"
				+ " failed; will be repeated automatically");
			that.oLogMock.expects("error").withArgs("$batch failed");

			that.expectRequest({
					method : "POST",
					payload : {Note : "Created"},
					url : "BusinessPartnerList('4711')/BP_2_SO"
				}, createError()) // a technical error -> let the $batch itself fail
				.expectMessages([{
					code : undefined,
					message : "Communication error: 500 ",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "HTTP request was not processed because $batch failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}])
				.expectChange("id", ["", "0500000001"])
				.expectChange("note", ["Created", "Test"]);

			oTableBinding = that.oView.byId("table").getBinding("items");
			oTableBinding.create({Note : "Created"}, /*bSkipRefresh*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			var oCausingError;

			assert.equal(oTableBinding.getLength(), 2);

			// remove persistent, technical messages from above
			sap.ui.getCore().getMessageManager().removeAllMessages();
			that.expectMessages([]);

			oCausingError = oFixture.expectations.call(that);

			return Promise.all([
				// code under test
				that.oView.byId("form").getBindingContext().requestSideEffects([{
					$NavigationPropertyPath : "BP_2_SO"
				}]).catch(function (oError) {
					if (!(oCausingError && oError.cause === oCausingError)) {
						throw oError;
					}
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.equal(oTableBinding.getLength(), 2);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Creation of an entity fails due to a network error. A subsequent call to
	// requestSideEffects repeats the failed POST in the same $batch but fails again. All transient
	// contexts are kept, even if not visible.
	// JIRA: CPOUI5UISERVICESV3-1764
	QUnit.skip("requestSideEffects keeps invisible transient contexts", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			oTableBinding,
			sView = '\
<t:Table id="table" rows="{/SalesOrderList}" threshold="0" visibleRowCount="2">\
	<t:Column>\
		<t:template><Text id="id" text="{SalesOrderID}" /></t:template>\
	</t:Column>\
	<t:Column>\
		<t:template><Text id="note" text="{Note}" /></t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		that.expectRequest("SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=2", {
				value : [
					{Note : "Test 1", SalesOrderID : '0500000001'},
					{Note : "Test 2", SalesOrderID : '0500000002'}
				]
			})
			.expectChange("id", ["0500000001", "0500000002"])
			.expectChange("note", ["Test 1", "Test 2"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error").withArgs("POST on 'SalesOrderList' failed; will be"
				+ " repeated automatically");
			that.oLogMock.expects("error").withArgs("$batch failed");

			that.expectRequest({
					method : "POST",
					payload : {Note : "Created"},
					url : "SalesOrderList"
				}, createError()) // a technical error -> let the $batch itself fail
				.expectMessages([{
					code : undefined,
					message : "Communication error: 500 ",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "HTTP request was not processed because $batch failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}])
				.expectChange("id", ["", "0500000001"])
				.expectChange("note", ["Created", "Test 1"]);

			oTableBinding = that.oView.byId("table").getBinding("rows");
			oTableBinding.create({Note : "Created"}, /*bSkipRefresh*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("id", [, "0500000001", "0500000002"])
				.expectChange("note", [, "Test 1", "Test 2"]);

			// scroll down
			that.oView.byId("table").setFirstVisibleRow(1);

			return that.waitForChanges(assert);
		}).then(function () {
			var oCausingError = createError(); // a technical error -> let the $batch itself fail

			// remove persistent, technical messages from above
			sap.ui.getCore().getMessageManager().removeAllMessages();

			that.oLogMock.expects("error").withArgs("POST on 'SalesOrderList' failed; will be"
				+ " repeated automatically");
			that.oLogMock.expects("error").withArgs("Failed to get contexts for "
				+ "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/SalesOrderList"
				+ " with start index 1 and length 2");
			that.oLogMock.expects("error").withArgs("$batch failed");
			that.oLogMock.expects("error").withArgs("Failed to request side effects");

			that.expectRequest({
					batchNo : 3,
					method : "POST",
					payload : {Note : "Created"},
					url : "SalesOrderList"
				}, oCausingError)
				.expectRequest({
					batchNo : 3,
					method : "GET",
					// Because of the transient row in the first context the skip has to be adapted
					// to 0 => CPOUI5UISERVICESV3-1764
					url : "SalesOrderList?$select=Note,SalesOrderID&$skip=0&$top=2"
				})  // no response required
				.expectMessages([{
					code : undefined,
					message : "Communication error: 500 ",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "HTTP request was not processed because $batch failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);

			return Promise.all([
				// code under test
				oTableBinding.getHeaderContext().requestSideEffects([{
					$NavigationPropertyPath : ""
				}]).catch(function (oError) {
					if (!(oCausingError && oError.cause === oCausingError)) {
						throw oError;
					}
				}),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Creating an entity and POST is still pending while requestSideEffects is called.
	// requestSideEffect must wait for the POST.
	// JIRA: CPOUI5UISERVICESV3-1936
	QUnit.test("requestSideEffects waits for pending POST", function (assert) {
		var oCreatedRowContext,
			oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			oRequestSideEffectsPromise,
			fnRespond,
			oTableBinding,
			sView = '\
<FlexBox id="form" binding="{/BusinessPartnerList(\'4711\')}">\
	<Table id="table" items="{BP_2_SO}">\
		<ColumnListItem>\
			<Text id="id" text="{SalesOrderID}" />\
			<Text id="note" text="{Note}" />\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID"
				+ "&$expand=BP_2_SO($select=Note,SalesOrderID)", {
				BusinessPartnerID : "4711",
				BP_2_SO : [{
					Note : "Test",
					SalesOrderID : '0500000001'
				}]
			})
			.expectChange("id", ["0500000001"])
			.expectChange("note", ["Test"]);

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error")
				.withExactArgs("POST on 'BusinessPartnerList('4711')/BP_2_SO' failed; "
					+ "will be repeated automatically", sinon.match.string,
					"sap.ui.model.odata.v4.ODataListBinding");
			that.oLogMock.expects("error")
				.withExactArgs("$batch failed", sinon.match.string,
					"sap.ui.model.odata.v4.ODataModel");

			that.expectRequest({
					method : "POST",
					payload : {Note : "Created"},
					url : "BusinessPartnerList('4711')/BP_2_SO"
				}, new Promise(function (resolve, reject) {
					fnRespond = reject.bind(null, createError()); // take care of timing
				}))
				.expectChange("id", ["", "0500000001"])
				.expectChange("note", ["Created", "Test"]);

			oTableBinding = that.oView.byId("table").getBinding("items");
			oCreatedRowContext = oTableBinding.create({Note : "Created"}, /*bSkipRefresh*/true);

			return that.waitForChanges(assert);
		}).then(function () {
			var oFormContext = that.oView.byId("form").getBindingContext();

			// expect no requests as fnRespond not invoked yet

			// code under test - requestSideEffects has to wait for POST to finish
			oRequestSideEffectsPromise = oFormContext.requestSideEffects([{
				$NavigationPropertyPath : "BP_2_SO"
			}]);

			return that.waitForChanges(assert); // no real changes but for sake of consistency
		}).then(function () {
			that.expectMessages([{
					code : undefined,
					message : "Communication error: 500 ",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "HTTP request was not processed because $batch failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}])
				.expectRequest({
					batchNo : 3,
					method : "POST",
					payload : {Note : "Created"},
					url : "BusinessPartnerList('4711')/BP_2_SO"
				}, {
					Note : "Created",
					SalesOrderID : "43"
				})
				.expectRequest({
					batchNo : 3,
					method : "GET",
					url : "BusinessPartnerList('4711')?$select=BP_2_SO"
						+ "&$expand=BP_2_SO($select=Note,SalesOrderID)"
				}, {
					BusinessPartnerID : "4711",
					BP_2_SO : [{
						Note : "Created",
						SalesOrderID : "43"
					}, {
						Note : "Test",
						SalesOrderID : "0500000001"
					}]
				})
				//.expectChange("id", ["43"]);
				.expectChange("id", "43", -1); //TODO see test above

			// invocation here shall trigger all requests
			fnRespond();

			return Promise.all([
				// code under test
				oRequestSideEffectsPromise,
				oCreatedRowContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Change an entity and PATCH is still pending while requestSideEffects is called.
	// requestSideEffect must wait for the PATCH.
	// JIRA: CPOUI5UISERVICESV3-1936
	QUnit.test("requestSideEffects waits for pending PATCH", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			oName,
			oRequestSideEffectsPromise,
			fnRespond,
			sView = '\
<FlexBox id="form" binding="{/BusinessPartnerList(\'4711\')}">\
	<Input id="name" value="{CompanyName}" />\
</FlexBox>',
			that = this;

		this.expectRequest("BusinessPartnerList('4711')?$select=BusinessPartnerID,CompanyName", {
				BusinessPartnerID : "4711",
				CompanyName : "SAP AG"
			})
			.expectChange("name", "SAP AG");

		return this.createView(assert, sView, oModel).then(function () {
			that.oLogMock.expects("error").withArgs("Failed to update path "
				+ "/BusinessPartnerList('4711')/CompanyName");
			that.oLogMock.expects("error").withArgs("$batch failed");

			that.expectRequest({
					method : "PATCH",
					payload : {CompanyName : "SAP SE"},
					url : "BusinessPartnerList('4711')"
				}, new Promise(function (resolve, reject) {
					fnRespond = reject.bind(null, createError()); // take care of timing
				}))
				.expectChange("name", "SAP SE");

			oName = that.oView.byId("name");
			oName.getBinding("value").setValue("SAP SE");

			return that.waitForChanges(assert);
		}).then(function () {
			var oFormContext = that.oView.byId("form").getBindingContext();

			// expect no requests as fnRespond not invoked yet

			// code under test - requestSideEffects has to wait for POST to finish
			oRequestSideEffectsPromise = oFormContext.requestSideEffects([{
				$NavigationPropertyPath : ""
			}]);

			return that.waitForChanges(assert); // no real changes but for sake of consistency
		}).then(function () {
			that.expectMessages([{
					code : undefined,
					message : "Communication error: 500 ",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}, {
					code : undefined,
					message : "HTTP request was not processed because $batch failed",
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}])
				.expectRequest({
					batchNo : 3,
					method : "PATCH",
					payload : {CompanyName : "SAP SE"},
					url : "BusinessPartnerList('4711')"
				}, {/* response does not matter here */})
				.expectRequest({
					batchNo : 3,
					method : "GET",
					url : "BusinessPartnerList('4711')?$select=BusinessPartnerID,CompanyName"
				}, {
					BusinessPartnerID : "4711",
					CompanyName : "SAP SE"
				});

			// invocation here shall trigger all requests
			fnRespond();

			return Promise.all([
				// code under test
				oRequestSideEffectsPromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: requestSideEffects refreshes properties at the parent entity with the help of path
	// reduction via partner attributes. See that bubbling up is necessary again when processing the
	// reduced path in the parent context.
	// JIRA: CPOUI5ODATAV4-103
	QUnit.test("requestSideEffects: path reduction", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/SalesOrderList(\'42\')}">\
	<FlexBox binding="{}">\
		<Text id="note" text="{Note}" />\
		<Table id="table" items="{path : \'SO_2_SOITEM\', parameters : {$$ownRequest : true}}">\
			<ColumnListItem>\
				<Text id="position" text="{ItemPosition}" />\
				<Text id="amount" text="{GrossAmount}" />\
			</ColumnListItem>\
		</Table>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('42')?$select=Note,SalesOrderID", {
				Note : "Note",
				SalesOrderID : "42"
			})
			.expectRequest("SalesOrderList('42')/SO_2_SOITEM?$select=GrossAmount,ItemPosition"
				+ ",SalesOrderID&$skip=0&$top=100", {
				value : [
					{GrossAmount : "3.14", ItemPosition : "0010", SalesOrderID : "42"},
					{GrossAmount : "2.72", ItemPosition : "0020", SalesOrderID : "42"}
				]
			})
			.expectChange("note", "Note")
			.expectChange("position", ["0010", "0020"])
			.expectChange("amount", ["3.14", "2.72"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("table").getItems()[0].getBindingContext();

			that.expectRequest("SalesOrderList('42')?$select=Note", {Note : "refreshed Note"})
				.expectRequest("SalesOrderList('42')/SO_2_SOITEM?"
					+ "$select=GrossAmount,ItemPosition,SalesOrderID"
					+ "&$filter=SalesOrderID eq '42' and ItemPosition eq '0010'", {
					value : [
						{GrossAmount : "1.41", ItemPosition : "0010", SalesOrderID : "42"}
					]
				})
				.expectChange("note", "refreshed Note")
				.expectChange("amount", ["1.41"]);

			return Promise.all([
				// code under test
				oContext.requestSideEffects([
					{$PropertyPath : "SOITEM_2_SO/Note"},
					{$PropertyPath : "GrossAmount"}
				]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: requestSideEffects is called at a binding w/o cache and has to delegate to a
	// context of the parent binding. Additionally it requests a property from this parent binding
	// with the help of path reduction via partner attributes. See that only one request is
	// necessary.
	// JIRA: CPOUI5ODATAV4-103
	QUnit.test("requestSideEffects: path reduction and bubble up", function (assert) {
		var oModel = createSpecialCasesModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/As(1)}">\
	<Text id="aValue" text="{AValue}" />\
	<FlexBox id="bInstance" binding="{AtoB}">\
		<Text id="bValue" text="{BValue}"/>\
	</FlexBox>\
</FlexBox>',
			that = this;

		this.expectRequest("As(1)?$select=AID,AValue&$expand=AtoB($select=BID,BValue)", {
				AID : 1,
				AValue : 11,
				AtoB : {
					BID : 2,
					BValue : 12
				}
			})
			.expectChange("aValue", "11")
			.expectChange("bValue", "12");

		return this.createView(assert, sView, oModel).then(function () {
			var oContext = that.oView.byId("bInstance").getElementBinding().getBoundContext();

			that.expectRequest("As(1)?$select=AValue&$expand=AtoB($select=BValue)", {
					AValue : 111,
					AtoB : {
						BValue : 112
					}
				})
				.expectChange("aValue", "111")
				.expectChange("bValue", "112");

			return Promise.all([
				// code under test
				oContext.requestSideEffects([
					{$PropertyPath : "BtoA/AValue"},
					{$PropertyPath : "BValue"}
				]),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: hasPendingChanges and resetChanges work even while late child bindings are trying
	// to reuse the parent binding's cache.
	// JIRA: CPOUI5UISERVICESV3-1981, CPOUI5UISERVICESV3-1994
	QUnit.test("hasPendingChanges + resetChanges work for late child bindings", function (assert) {
		var oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "$auto"
			}),
			sView = '\
<Table id="orders" items="{path: \'/SalesOrderList\', parameters: {\
		$expand : {\
			SO_2_SOITEM : {\
				$select : [\'ItemPosition\',\'Note\',\'SalesOrderID\']\
			}\
		},\
		$select : \'Note\'\
	}}">\
	<ColumnListItem>\
		<Input id="note" value="{Note}"/>\
	</ColumnListItem>\
</Table>\
<Table id="items" items="{SO_2_SOITEM}">\
	<ColumnListItem>\
		<Text id="itemNote" text="{Note}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("SalesOrderList"
			+ "?$expand=SO_2_SOITEM($select=ItemPosition,Note,SalesOrderID)"
			+ "&$select=Note,SalesOrderID"
			+ "&$skip=0&$top=100", {
				value : [{
					Note : "SO_1",
					SalesOrderID : "1",
					SO_2_SOITEM : [{
						ItemPosition : "10",
						Note : "Item_10",
						SalesOrderID : "1"
					}]
				}]
			})
			.expectChange("note", ["SO_1"])
			.expectChange("itemNote", []);

		return this.createView(assert, sView, oModel).then(function () {
			var oOrdersTable = that.oView.byId("orders"),
				oOrdersBinding = oOrdersTable.getBinding("items");

			that.expectChange("note", ["SO_1 changed"])
				.expectChange("note", ["SO_1"]);

			oOrdersTable.getItems()[0].getCells()[0].getBinding("value").setValue("SO_1 changed");

			// code under test
			assert.ok(oOrdersBinding.hasPendingChanges());

			that.expectChange("itemNote", ["Item_10"]);

			// Observe hasPendingChanges while the child binding is checking whether it can use the
			// parent cache
			that.oView.byId("items").setBindingContext(oOrdersBinding.getCurrentContexts()[0]);

			// code under test
			assert.ok(oOrdersBinding.hasPendingChanges());

			return Promise.all([
				oOrdersBinding.resetChanges().then(function() {
					// code under test
					assert.notOk(oOrdersBinding.hasPendingChanges());
				}),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity without using a UI and persist it.
	// ODataModel#hasPendingChanges and ODataListBinding#hasPendingChanges work as expected even if
	// late properties below a list binding want to reuse the parent binding's cache. Relative list
	// binding without an own cache is necessary because determination whether cache can be used or
	// not is async.
	// Resetting pending changes works synchronously.
	// JIRA: CPOUI5UISERVICESV3-1981, CPOUI5UISERVICESV3-1994
[
	// late dependent binding does not influence hasPendingChanges for a parent list binding with a
	// persisted created entity.
	function (assert, oModel, oBinding, oCreatedContext) {
		this.expectChange("note", "New");

		this.oView.byId("form").setBindingContext(oCreatedContext);

		// code under test
		assert.notOk(oModel.hasPendingChanges());
		assert.notOk(oBinding.hasPendingChanges());

		return this.waitForChanges(assert);
	},
	// modify a persisted created entity; hasPendingChanges is not influenced by late properties;
	// resetChanges reverts changes asynchronously
	function (assert, oModel, oBinding, oCreatedContext) {
		var oPropertyBinding = oModel.bindProperty("Note", oCreatedContext);

		this.expectChange("note", "Modified");

		oPropertyBinding.initialize();
		oPropertyBinding.setValue("Modified"); // change event; reset is done asynchronously
		this.oView.byId("form").setBindingContext(oCreatedContext);

		// code under test
		assert.ok(oModel.hasPendingChanges());
		assert.ok(oBinding.hasPendingChanges());

		this.expectChange("note", "New");

		return Promise.all([
			// code under test
			oBinding.resetChanges().then(function() {
				// code under test
				assert.notOk(oModel.hasPendingChanges());
				assert.notOk(oBinding.hasPendingChanges());
			}),
			this.waitForChanges(assert)
		]);
	}
].forEach(function (fnTest, i) {
	var sTitle = "hasPendingChanges/resetChanges: late properties for a list binding without a UI"
			+ " and with a persisted created entity, #" + i;

	QUnit.test(sTitle, function (assert) {
		var oCreatedContext,
			oListBindingWithoutUI,
			oModel = createSalesOrdersModel({
				autoExpandSelect : true,
				updateGroupId : "$auto"
			}),
			sView = '\
<FlexBox id="form">\
	<Text id="note" text="{Note}"/>\
	<Table id="items" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="itemNote" text="{Note}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		oListBindingWithoutUI = oModel.bindList("/SalesOrderList");

		this.expectChange("note")
			.expectChange("itemNote", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest({
					method : "POST",
					url : "SalesOrderList",
					payload : {SO_2_SOITEM : null}
				}, {
					Note : "New",
					SalesOrderID : "43"
				});

			oCreatedContext = oListBindingWithoutUI.create({SO_2_SOITEM : null}, true);

			// code under test
			assert.ok(oModel.hasPendingChanges());
			assert.ok(oListBindingWithoutUI.hasPendingChanges());

			return Promise.all([
				oCreatedContext.created(),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// code under test
			assert.notOk(oModel.hasPendingChanges());
			assert.notOk(oListBindingWithoutUI.hasPendingChanges());

			return fnTest.call(that, assert, oModel, oListBindingWithoutUI, oCreatedContext);
		});
	});
});

	//*********************************************************************************************
	// Scenario: Create a new entity without using a UI and reset it immediately. No request is
	// added to the queue and ODataModel#hasPendingChanges and ODataListBinding#hasPendingChanges
	// work as expected.
	// JIRA: CPOUI5UISERVICESV3-1994
	QUnit.test("create an entity and immediately reset changes (no UI)", function (assert) {
		var // use autoExpandSelect so that the cache is created asynchronously
			oModel = createSalesOrdersModel({autoExpandSelect : true, updateGroupId : "$auto"}),
			that = this;

		return this.createView(assert, "", oModel).then(function () {
			var oListBindingWithoutUI = oModel.bindList("/SalesOrderList"),
				oCreatedPromise = oListBindingWithoutUI.create({}, true).created();

			assert.ok(oModel.hasPendingChanges());
			assert.ok(oListBindingWithoutUI.hasPendingChanges());
			assert.strictEqual(oListBindingWithoutUI.getLength(), 1 + 10/*length is not final*/);

			return oListBindingWithoutUI.resetChanges().then(function ( ) {
				assert.notOk(oModel.hasPendingChanges());
				assert.notOk(oListBindingWithoutUI.hasPendingChanges());
				assert.strictEqual(oListBindingWithoutUI.getLength(), 0);

				return that.checkCanceled(assert, oCreatedPromise);
			});
		});
	});

	//*********************************************************************************************
	// Scenario: Create a new entity within a relative binding which is created via controller
	// code. Verify that ODataBinding#resetChanges works properly even if the cache for the list
	// binding is not yet available.
	// JIRA: CPOUI5UISERVICESV3-1994
	QUnit.test("Create relative via controller + resetChanges on parent", function (assert) {
		var oFormBinding,
			oModel = createSalesOrdersModel({autoExpandSelect : true}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'1\')}">\
	<Table id="table" items="{SO_2_SOITEM}">\
		<ColumnListItem>\
			<Text id="note" text="{Note}"/>\
		</ColumnListItem>\
	</Table>\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('1')?$select=SalesOrderID"
			+ "&$expand=SO_2_SOITEM($select=ItemPosition,Note,SalesOrderID)", {
				SalesOrderID : "1",
				SO_2_SOITEM : [{
					ItemPosition : "10",
					Note : "Foo",
					SalesOrderID : "1"
				}]
			})
			.expectChange("note", ["Foo"]);

		return this.createView(assert, sView, oModel).then(function () {
			var oCreatedPromise;

			oFormBinding = that.oView.byId("form").getObjectBinding();
			oCreatedPromise = oModel.bindList("SO_2_SOITEM",
				oFormBinding.getBoundContext(), undefined, undefined,
				{$$updateGroupId : "doNotSubmit"}).create({}, true).created();

			return Promise.all([
				// code under test
				oFormBinding.resetChanges(),
				oCreatedPromise.catch(function (oError) {
					assert.strictEqual(oError.message,
						"Request canceled: POST SalesOrderList('1')/SO_2_SOITEM; group: doNotSubmit"
					);
					assert.ok(oError.canceled);
				})
			]);
		}).then(function () {
			assert.notOk(oFormBinding.hasPendingChanges());
		});
	});

	//*********************************************************************************************
	// Scenario: Unpark a failed patch while requesting side effects. See that the PATCH response is
	// processed before the GET response.
	// JIRA: CPOUI5UISERVICESV3-1878
	QUnit.test("unpark keeps response processing order", function (assert) {
		var oModel = createSalesOrdersModel({autoExpandSelect : true, groupId : "$auto"}),
			sView = '\
<FlexBox id="form" binding="{/SalesOrderList(\'4711\')}">\
	<Input id="note" value="{Note}" />\
</FlexBox>',
			that = this;

		this.expectRequest("SalesOrderList('4711')?$select=Note,SalesOrderID", {
				Note : "original",
				SalesOrderID : "4711"
			})
			.expectChange("note", "original");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectChange("note", "modified")
				.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('4711')",
					payload : {Note : "modified"}
				}, createError({
					code : "CODE",
					message : "MESSAGE",
					target : "Note"
				}))
				.expectMessages([{
					code : "CODE",
					descriptionUrl : undefined,
					message : "MESSAGE",
					persistent : true,
					target : "/SalesOrderList('4711')/Note",
					technical : true,
					type : "Error"
				}]);

			that.oLogMock.expects("error");

			that.oView.byId("note").getBinding("value").setValue("modified");

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest({
					method : "PATCH",
					url : "SalesOrderList('4711')",
					payload : {Note : "modified"}
				}, {
					Note : "modified",
					SalesOrderID : "4711"
				})
				.expectRequest("SalesOrderList('4711')?$select=Note", {
					Note : "side effect"
				})
				.expectChange("note", "side effect");

			that.oView.byId("form").getObjectBinding().getBoundContext()
				.requestSideEffects([{$PropertyPath : "Note"}]);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// The application sets a custom header via model API and the following request contains the
	// custom header. Note that the integration test framework only allows for observing headers for
	// individual requests inside the $batch but not for the $batch itself.
	QUnit.test("ODataModel#changeHttpHeaders", function (assert) {
		var mHeaders = {Authorization : "Bearer xyz"},
			oModel = createTeaBusiModel({groupId : "$auto", autoExpandSelect : true}),
			sView = '<Text id="name" text="{/EMPLOYEES(0)/Name}" />',
			that = this;

		this.expectRequest("EMPLOYEES(0)/Name", {value : "Frederic Fall"})
			.expectChange("name", "Frederic Fall");

		return this.createView(assert, sView, oModel)
			.then(function () {
				that.expectRequest({
						headers : mHeaders,
						method : "GET",
						url : "EMPLOYEES(0)/Name"
					}, {value : "Frederic Fall"});

				// code under test
				oModel.changeHttpHeaders(mHeaders);

				that.oView.byId("name").getBinding("text").refresh();

				return that.waitForChanges(assert);
			});
	});

	//*********************************************************************************************
	// Scenario: Server-driven paging with m.Table
	// We expect a "growing" table to only load data when triggered by the end-user via the "More"
	// button: There are no repeated requests in case the server-side page size is 2 and thus
	// smaller than the table's growing threshold and just the first page is displayed with less
	// data. The next request is only sent when the end user wants to see "More".
	// JIRA: CPOUI5UISERVICESV3-1908
	QUnit.test("Server-driven paging with m.Table", function (assert) {
		var sView = '\
<Table id="table" items="{/EMPLOYEES}" growing="true" growingThreshold="10">\
	<ColumnListItem>\
		<Text id="text" text="{Name}" />\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$skip=0&$top=10", {
				value : [
					{ID : "1", Name : "Peter Burke"},
					{ID : "2", Name : "Frederic Fall"}
				],
				"@odata.nextLink" : "~nextLink"
			})
			.expectChange("text", ["Peter Burke", "Frederic Fall"]);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES?$skip=2&$top=18", {
					value : [
						{ID : "3", Name : "John Field"},
						{ID : "4", Name : "Susan Bay"}
					],
					"@odata.nextLink" : "~nextLink1"
				})
				.expectChange("text", [,, "John Field", "Susan Bay"]);

			that.oView.byId("table-trigger").firePress(); // press "More" button in table

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Server-driven paging with table.Table
	// Read with server-driven paging in "gaps" does not remove elements behind the gap
	// JIRA: CPOUI5UISERVICESV3-1908
	QUnit.test("Server-driven paging with table.Table: no remove behind gap", function (assert) {
		var sView = '\
<t:Table id="table" rows="{/EMPLOYEES}" threshold="0" visibleRowCount="3">\
	<t:Column>\
		<t:template><Text id="text" text="{Name}" /></t:template>\
	</t:Column>\
</t:Table>',
			that = this;

		this.expectRequest("EMPLOYEES?$skip=0&$top=3", {
				value : [
					{ID : "1", Name : "Peter Burke"},
					{ID : "2", Name : "Frederic Fall"}
				],
				"@odata.nextLink" : "~nextLink"
			})
			.expectRequest("EMPLOYEES?$skip=2&$top=1", {
				value : [
					{ID : "3", Name : "Carla Blue"}
				]
			})
			.expectChange("text", ["Peter Burke", "Frederic Fall", "Carla Blue"]);

		return this.createView(assert, sView).then(function () {
			that.expectRequest("EMPLOYEES?$skip=7&$top=3", {
					value : [
						{ID : "8", Name : "John Field"},
						{ID : "9", Name : "Susan Bay"}
					],
					"@odata.nextLink" : "~nextLink1"
				})
				.expectRequest("EMPLOYEES?$skip=9&$top=1", {
					value : [
						{ID : "10", Name : "Daniel Red"}
					]
				})
				.expectChange("text", null, null)
				.expectChange("text", null, null)
				.expectChange("text", null, null)
				.expectChange("text", [,,,,,,, "John Field", "Susan Bay", "Daniel Red"]);

			that.oView.byId("table").setFirstVisibleRow(7);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectRequest("EMPLOYEES?$skip=3&$top=3", {
					value : [
						{ID : "3", Name : "Alice Grey"},
						{ID : "4", Name : "Bob Green"}
					],
					"@odata.nextLink" : "~nextLink2"
				})
				.expectRequest("EMPLOYEES?$skip=5&$top=1", {
					value : [
						{ID : "5", Name : "Erica Brown"}
					]
				})
				.expectChange("text", null, null)
				.expectChange("text", null, null)
				.expectChange("text", null, null)
				.expectChange("text", [,,, "Alice Grey", "Bob Green", "Erica Brown"]);

			that.oView.byId("table").setFirstVisibleRow(3);

			return that.waitForChanges(assert);
		}).then(function () {
			that.expectChange("text", [,,,,,,, "John Field", "Susan Bay", "Daniel Red"]);

			that.oView.byId("table").setFirstVisibleRow(7);

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Server-driven paging with table.Table
	// Requests following the first request which returned an @odata.nextLink do not request
	//   the prefetch size to avoid server load.
	// JIRA: CPOUI5UISERVICESV3-2018
	QUnit.test("Server-driven paging with table.Table: do not read prefetch", function (assert) {
		var sView = '\
<t:Table id="table" rows="{/EMPLOYEES}" visibleRowCount="3">\
	<t:Column>\
		<t:template><Text id="text" text="{Name}" /></t:template>\
	</t:Column>\
</t:Table>';

		this.expectRequest("EMPLOYEES?$skip=0&$top=103", {
				value : [
					{ID : "1", Name : "Peter Burke"},
					{ID : "2", Name : "Frederic Fall"}
				],
				"@odata.nextLink" : "~nextLink"
			})
			// request after response with @odata.nextLink does not consider prefetch size
			.expectRequest("EMPLOYEES?$skip=2&$top=1", {
				value : [
					{ID : "3", Name : "John Field"}
				]
			})
			.expectChange("text", ["Peter Burke", "Frederic Fall", "John Field"]);

		return this.createView(assert, sView);
	});

	//*********************************************************************************************
	// Scenario: Server-driven paging with requestContexts iterates @odata.nextLink until the
	// originally requested number of entities has been read.
	// JIRA: CPOUI5UISERVICESV3-1908
	//TODO Enhance test to cover the following cases distinguished regarding number of entities
	// requested by requestContexts
	// 1. server has less entities
	// 2. server has more entities
	// 3. @odata.nextLink sequence from responses results in (a) less or (b) more entities than
	//    requested
	QUnit.skip("Server-driven paging with OLDB#requestContexts", function (assert) {
		var that = this;

		return this.createView(assert, "").then(function () {
			var oBinding = that.oModel.bindList("/EMPLOYEES"),
				oPromise;

			that.expectRequest("EMPLOYEES?$skip=0&$top=3", {
					value : [
						{ID : "1", Name : "Peter Burke"},
						{ID : "2", Name : "Frederic Fall"}
					],
					"@odata.nextLink" : "~nextLink"
				})
				.expectRequest("~nextLink", {
					value : [
						{ID : "3", Name : "John Field"}
					]
				});

			// code under test
			oPromise = oBinding.requestContexts(0, 3).then(function (aContexts) {
				assert.deepEqual(aContexts.map(function (oContext) {
					return oContext.getPath();
				}), [
					"/EMPLOYEES('1')",
					"/EMPLOYEES('2')",
					"/EMPLOYEES('3')"
				]);
			});

			return Promise.all([
				oPromise,
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: A property binding with a path using a collection navigation property must not
	// cause an invalid late property request.
	QUnit.test("BCP 1970517588: invalid property path", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/TEAMS(\'TEAM_01\')}">\
	<Text id="teamId" text="{Team_Id}"/>\
	<Text id="name" text="{TEAM_2_EMPLOYEES/Name}"/>\
</FlexBox>';

		// once from initialize and once from the context's checkUpdate
		this.oLogMock.expects("error").twice()
			.withArgs("Failed to drill-down into TEAM_2_EMPLOYEES/Name, invalid segment: Name");

		this.expectRequest("TEAMS('TEAM_01')?$select=Team_Id"
				+ "&$expand=TEAM_2_EMPLOYEES($select=ID,Name)", {
				Team_Id : "TEAM_01",
				TEAM_2_EMPLOYEES : []
			})
			.expectChange("teamId", "TEAM_01")
			.expectChange("name", null);

		return this.createView(assert, sView, oModel);
	});

	//*********************************************************************************************
	// Scenario: Cache is immutable although oCachePromise becomes pending again. The list binding
	// inside the details must not prevent other bindings from sending their own request.
	// JIRA: CPOUI5UISERVICESV3-2025
	QUnit.test("CPOUI5UISERVICESV3-2025", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{/TEAMS}">\
	<ColumnListItem>\
		<Text id="teamId" text="{Team_Id}"/>\
	</ColumnListItem>\
</Table>\
<FlexBox id="detail">\
	<Table id="employees" items="{TEAM_2_EMPLOYEES}">\
		<ColumnListItem>\
			<Text id="name" text="{Name}"/>\
		</ColumnListItem>\
	</Table>\
	<Text id="managerId" text="{MANAGER_ID}" />\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS?$select=Team_Id&$skip=0&$top=100", {
				value : [{
					Team_Id : "TEAM_01"
				}]
			})
			.expectChange("teamId", ["TEAM_01"])
			.expectChange("name", [])
			.expectChange("managerId");

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name&$skip=0&$top=100",
					{value : [{ID : "2", Name : "Frederic Fall"}]})
				.expectChange("name", ["Frederic Fall"])
				.expectRequest("TEAMS('TEAM_01')?$select=MANAGER_ID,Team_Id",
					{MANAGER_ID : "5", Team_Id : "TEAM_01"})
				.expectChange("managerId", "5");

			// code under test: bindings inside "detail" form need to send their own requests
			that.oView.byId("detail").setBindingContext(
				that.oView.byId("table").getItems()[0].getBindingContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A list binding is used by a control, has already delivered its virtual context and
	// is about to remove it again. In between these two "change" events, #suspend and #resume is
	// used (say by controller code).
	// Avoid "Uncaught Error: Must not call method when the binding's root binding is suspended:
	// sap.ui.model.odata.v4.ODataListBinding: /|TEAMS"
	// JIRA: CPOUI5UISERVICESV3-2033
	QUnit.test("CPOUI5UISERVICESV3-2033", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<Table id="table" items="{TEAMS}">\
	<ColumnListItem>\
		<Text id="teamId" text="{Team_Id}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("teamId", []);

		return this.createView(assert, sView, oModel).then(function () {
			var oRootContext = that.oModel.createBindingContext("/"),
				oTable = that.oView.byId("table"),
				oListBinding = oTable.getBinding("items");

			that.expectRequest("TEAMS?$select=Team_Id&$orderby=Team_Id&$filter=Budget gt 42"
					+ "&$skip=0&$top=100", {
					value : [{
						Team_Id : "TEAM_01"
					}]
				})
				.expectChange("teamId", ["TEAM_01"]);

			oTable.setBindingContext(oRootContext);
			oListBinding.suspend();
			oListBinding.filter(new Filter("Budget", FilterOperator.GT, 42));
			oListBinding.sort(new Sorter("Team_Id"));
			oListBinding.resume();

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: Controller code sets a field control property, but needs to avoid a PATCH request.
	// Later on, that property is overwritten again by some server response.
	// A (context) binding that did not yet read its data does not allow setting a property w/o a
	// PATCH request.
	// JIRA: CPOUI5ODATAV4-14
	QUnit.test("CPOUI5ODATAV4-14", function (assert) {
		var oBinding,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{/TEAMS(\'42\')}" id="form">\
	<Input id="name" value="{Name}"/>\
</FlexBox>',
			that = this;

		this.expectRequest("TEAMS('42')?$select=Name,Team_Id", {
				Name : "Team #1",
				Team_Id : "42"
			})
			.expectChange("name", "Team #1");

		return this.createView(assert, sView, oModel).then(function () {
			oBinding = that.oView.byId("form").getObjectBinding();

			that.expectChange("name", "changed");
			// expect no PATCH request!

			return Promise.all([
				// code under test
				oBinding.getBoundContext().setProperty("Name", "changed", null),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectRequest("TEAMS('42')?$select=Name,Team_Id", {
					Name : "Team #1",
					Team_Id : "42"
				})
				.expectChange("name", "Team #1");

			oBinding.refresh();

			return that.waitForChanges(assert);
		}).then(function () {
			var oContextBinding = oModel.bindContext("/TEAMS('42')");

			return Promise.all([
				oContextBinding.getBoundContext().setProperty("Name", "changed", null)
					.then(function () {
						assert.ok(false);
					}, function (oError) {
						assert.strictEqual(oError.message,
							"Unexpected request: GET TEAMS('42')");
					}),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: Use v4.Context#setProperty to update a property value in a way which becomes async,
	// change the binding's parent context in the meantime. Check that setting the property value
	// fails instead of changing the wrong data or so.
	// JIRA: CPOUI5ODATAV4-14
	QUnit.test("CPOUI5ODATAV4-108 what if context has changed in the meantime", function (assert) {
		var that = this;

		return this.createView(assert).then(function () {
			var oModel = that.oModel,
				oContextBinding = oModel.bindContext("Manager_to_Team"),
				fnRespond;

			oContextBinding.setContext(
				oModel.bindContext("/MANAGERS('1')", null, {$expand : "Manager_to_Team"})
					.getBoundContext());

			that.expectRequest("MANAGERS('1')?$expand=Manager_to_Team",
					new Promise(function (resolve, reject) {
						fnRespond = resolve.bind(null, {
							ID : "1",
							Manager_to_Team : {
								Name : "Team #1",
								Team_Id : "Team_01"
							}
						});
					})
				);

			return Promise.all([
				oContextBinding.getBoundContext().setProperty("Name", "Darth Vader")
					.then(function () {
						assert.ok(false);
					}, function () {
						// TypeError: Cannot read property 'resolve' of undefined
						// --> setProperty fails somehow because the old bound context has already
						// been destroyed; this is OK and better than changing the wrong data or so
						assert.ok(true);
					}),
				resolveLater(function () {
					oContextBinding.setContext(
						oModel.bindContext("/MANAGERS('2')", null, {$expand : "Manager_to_Team"})
							.getBoundContext());
					fnRespond();
				}, 100),
				that.waitForChanges(assert)
			]);
		});
	});

	//*********************************************************************************************
	// Scenario: A PATCH (not shown here) triggers a side effect for the whole object page, while
	// a paginator switches to another item. The side effect's GET is thus ignored because the
	// cache for the old item is already inactive; thus the promise fails. Due to this failure, the
	// old cache was restored, which was wrong. Timing is essential!
	// BCP: 1970600374
	QUnit.test("BCP: 1970600374", function (assert) {
		var oInput,
			oModel = createTeaBusiModel({autoExpandSelect : true}),
			sView = '\
<FlexBox binding="{path : \'\', parameters : {$$ownRequest : true}}" id="detail">\
	<Input id="name" value="{Name}"/>\
</FlexBox>',
			that = this;

		this.expectChange("name");

		return this.createView(assert, sView, oModel).then(function () {
			oInput = that.oView.byId("name");

			that.expectRequest("TEAMS('TEAM_01')?$select=Name,Team_Id", {
					Name : "Team #1",
					Team_Id : "TEAM_01"
				})
				.expectChange("name", "Team #1");
			that.oView.byId("detail").setBindingContext(
				oModel.bindContext("/TEAMS('TEAM_01')").getBoundContext());

			return that.waitForChanges(assert);
		}).then(function () {
			var oPromise, fnRespond;

			// 1st, request side effects
			that.expectRequest("TEAMS('TEAM_01')?$select=Name,Team_Id",
					new Promise(function (resolve, reject) {
						fnRespond = resolve.bind(null, {
							Name : "Team #1",
							Team_Id : "TEAM_01"
						});
					}));

			oPromise
				= oInput.getBindingContext().requestSideEffects([{$NavigationPropertyPath : ""}]);

			// 2nd, switch to different context
			that.expectRequest("TEAMS('TEAM_02')?$select=Name,Team_Id", {
					Name : "Team #2",
					Team_Id : "TEAM_02"
				})
				.expectChange("name", "Team #2");

			setTimeout(function () {
				// pagination triggered by separate event --> new task
				that.oView.byId("detail").setBindingContext(
					oModel.bindContext("/TEAMS('TEAM_02')").getBoundContext());
				setTimeout(fnRespond, 0);
			}, 0);

			return Promise.all([
				oPromise.catch(function (oError) {
					assert.strictEqual(oError.message, "Response discarded: cache is inactive");
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			that.expectChange("name", "Palpatine")
				.expectRequest({
					method : "PATCH",
					payload : {Name : "Palpatine"},
					url : "TEAMS('TEAM_02')"
				}, {/* response does not matter here */});
			oInput.getBinding("value").setValue("Palpatine");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A PATCH (not shown here) triggers a side effect for the whole list, while a
	// paginator switches to another item. The side effect's GET is thus ignored because the cache
	// for the old item is already inactive; thus the promise fails. Due to this failure, the old
	// cache was restored, which was wrong. Timing is essential!
	// Follow-up to BCP: 1970600374 with an ODCB instead of an ODLB.
	// JIRA: CPOUI5ODATAV4-34
	QUnit.test("CPOUI5ODATAV4-34", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oTable,
			sView = '\
<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$$ownRequest : true}}">\
	<ColumnListItem>\
		<Input id="name" value="{Name}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("name", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100", {
					value : [{ID : "1", Name : "Jonathan Smith"}]
				})
				.expectChange("name", ["Jonathan Smith"]);
			oTable = that.oView.byId("table");
			oTable.setBindingContext(oModel.bindContext("/TEAMS('TEAM_01')").getBoundContext());

			return that.waitForChanges(assert);
		}).then(function () {
			var oPromise, fnRespond;

			// 1st, request side effects
			that.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100",
					new Promise(function (resolve, reject) {
						fnRespond = resolve.bind(null, {
							value : [{ID : "1", Name : "Jonathan Smith"}]
						});
					}));

			oPromise = oTable.getBinding("items").getHeaderContext()
				.requestSideEffects([{$NavigationPropertyPath : ""}]);

			// 2nd, switch to different context
			that.expectRequest("TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100", {
					value : [{ID : "2", Name : "Frederic Fall"}]
				})
				.expectChange("name", ["Frederic Fall"]);

			setTimeout(function () {
				// pagination triggered by separate event --> new task
				oTable.setBindingContext(oModel.bindContext("/TEAMS('TEAM_02')").getBoundContext());
				setTimeout(fnRespond, 0);
			}, 0);

			return Promise.all([
				oPromise.catch(function (oError) {
					assert.strictEqual(oError.message, "Response discarded: cache is inactive");
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			var oInput = oTable.getItems()[0].getCells()[0]; // Note: different instance now!

			that.expectChange("name", ["Palpatine"])
				.expectRequest({
					method : "PATCH",
					payload : {Name : "Palpatine"},
					url : "EMPLOYEES('2')"
				}, {/* response does not matter here */});
			oInput.getBinding("value").setValue("Palpatine");

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A PATCH (not shown here) triggers a side effect for the whole list, while a
	// paginator switches to another item. The side effect's GET is thus ignored because the cache
	// for the old item is already inactive. Then we switch back to the old item and the cache is
	// reused. Show that the side effect was not ignored.
	// JIRA: CPOUI5ODATAV4-34
	QUnit.test("CPOUI5ODATAV4-34: Response discarded: cache is inactive", function (assert) {
		var oModel = createTeaBusiModel({autoExpandSelect : true}),
			oTable,
			sView = '\
<Table id="table" items="{path : \'TEAM_2_EMPLOYEES\', parameters : {$$ownRequest : true}}">\
	<ColumnListItem>\
		<Input id="name" value="{Name}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectChange("name", []);

		return this.createView(assert, sView, oModel).then(function () {
			that.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100", {
					value : [{ID : "1", Name : "Jonathan Smith"}]
				})
				.expectChange("name", ["Jonathan Smith"]);
			oTable = that.oView.byId("table");
			oTable.setBindingContext(oModel.bindContext("/TEAMS('TEAM_01')").getBoundContext());

			return that.waitForChanges(assert);
		}).then(function () {
			var oPromise, fnRespond;

			// 1st, request side effects
			that.expectRequest("TEAMS('TEAM_01')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100",
					new Promise(function (resolve, reject) {
						fnRespond = resolve.bind(null, {
							value : [{ID : "1", Name : "Darth Vader"}]
						});
					}));

			oPromise = oTable.getBinding("items").getHeaderContext()
				.requestSideEffects([{$NavigationPropertyPath : ""}]);

			// 2nd, switch to different context
			that.expectRequest("TEAMS('TEAM_02')/TEAM_2_EMPLOYEES?$select=ID,Name"
					+ "&$skip=0&$top=100", {
					value : [{ID : "2", Name : "Frederic Fall"}]
				})
				.expectChange("name", ["Frederic Fall"]);

			setTimeout(function () {
				// pagination triggered by separate event --> new task
				oTable.setBindingContext(oModel.bindContext("/TEAMS('TEAM_02')").getBoundContext());
				fnRespond();
			}, 0);

			return Promise.all([
				oPromise.catch(function (oError) {
					assert.strictEqual(oError.message, "Response discarded: cache is inactive");
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			// 3rd, switch back again
			that.expectChange("name", ["Darth Vader"]);

			oTable.setBindingContext(oModel.bindContext("/TEAMS('TEAM_01')").getBoundContext());

			return that.waitForChanges(assert);
		});
	});

	//*********************************************************************************************
	// Scenario: A list binding refreshes itself completely due to a side effect, but that GET fails
	// and thus the old cache is restored. Check that transient contexts are properly preserved.
	// JIRA: CPOUI5ODATAV4-34
	QUnit.test("CPOUI5ODATAV4-34: bKeepCacheOnError & transient rows", function (assert) {
		var oListBinding,
			oModel = createTeaBusiModel({autoExpandSelect : true, updateGroupId : "update"}),
			oNewContext,
			sView = '\
<Table id="table" items="{/TEAMS}">\
	<ColumnListItem>\
		<Input id="name" value="{Name}"/>\
	</ColumnListItem>\
</Table>',
			that = this;

		this.expectRequest("TEAMS?$select=Name,Team_Id&$skip=0&$top=100", {
				value : [
					{Name : "Team 01", Team_Id : "Team_01"},
					{Name : "Team 02", Team_Id : "Team_02"}
				]
			})
			.expectChange("name", ["Team 01", "Team 02"]);

		return this.createView(assert, sView, oModel).then(function () {
			// create a transient row
			that.expectChange("name", ["Team 00", "Team 01", "Team 02"]);

			oListBinding = that.oView.byId("table").getBinding("items");
			oNewContext = oListBinding.create({Name : "Team 00", Team_Id : "Team_00"}, true);

			assert.strictEqual(oNewContext.getIndex(), 0);

			return that.waitForChanges(assert);
		}).then(function () {
			var oError = new Error("418 I'm a teapot"),
				oSideEffectsPromise;

			// refresh via side effect fails
			that.expectRequest("TEAMS?$select=Name,Team_Id&$skip=0&$top=100", oError)
				.expectMessages([{
					code : undefined,
					message : oError.message,
					persistent : true,
					target : "",
					technical : true,
					type : "Error"
				}]);
			that.oLogMock.expects("error")
				.withExactArgs("Failed to get contexts for "
						+ "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/TEAMS"
						+ " with start index 0 and length 100",
					sinon.match.string, "sap.ui.model.odata.v4.ODataListBinding");

			oSideEffectsPromise = oListBinding.getHeaderContext()
				.requestSideEffects([{$NavigationPropertyPath : ""}], "$direct");

			//TODO fix Context#getIndex to not return -1; [...]
//			assert.strictEqual(oNewContext.getIndex(), 0);

			return Promise.all([
				oSideEffectsPromise.catch(function (oError0) {
					assert.strictEqual(oError0, oError);
				}),
				that.waitForChanges(assert)
			]);
		}).then(function () {
			assert.strictEqual(oNewContext.getIndex(), 0);

			that.expectRequest({
					method : "POST",
					url : "TEAMS",
					payload : {Name : "Team 00", Team_Id : "Team_00"}
				}, {Name : "Team 00", Team_Id : "Team_00"});

			oModel.submitBatch("update");

			return Promise.all([
				oNewContext.created(),
				that.waitForChanges(assert)
			]);
		});
	});
});
