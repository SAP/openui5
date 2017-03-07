/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/Sorter",
	"sap/ui/test/TestUtils"
], function (jQuery, Filter, FilterOperator, OperationMode, ODataModel, Sorter, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

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
				serviceUrl : TestUtils.proxy(sServiceUrl),
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
		return createModel("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			mModelParameters);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataModel.integration", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			TestUtils.setupODataV4Server(this.oSandbox, {
				"$metadata" : {source : "metadata.xml"}
			}, undefined, "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/");
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// {map<string, string[]>}
			// this.mChanges["id"] is a list of expected changes for the property "text" of the
			// control with ID "id"
			this.mChanges = {};
			// {map<string, string[][]>}
			// this.mListChanges["id"][i] is a list of expected changes for the property "text" of
			// the control with ID "id" in row i
			this.mListChanges = {};
			// A list of expected requests with the properties method, url, headers, response
			this.aRequests = [];
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
			// avoid calls to formatters by UI5 localization changes in later tests
			this.oView.destroy();
			this.oModel.destroy();
		},

		/**
		 * Finishes the test if no pending changes are left.
		 */
		checkFinish : function () {
			var sControlId, i;

			for (sControlId in this.mChanges) {
				if (this.mChanges[sControlId].length) {
					return;
				}
			}
			for (sControlId in this.mListChanges) {
				// Note: This may be a sparse array
				for (i in this.mListChanges[sControlId]) {
					if (this.mListChanges[sControlId][i].length) {
						return;
					}
				}
			}
			if (this.resolve) {
				this.resolve();
			}
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
		 *   If no model is given, the <code>TEA_BUSI</code> model is created and used.
		 * @returns {Promise} A promise that is resolved when the view is created and all expected
		 *   values for controls have been set
		 */
		createView : function (assert, sViewXML, oModel) {
			var that = this;

			/*
			 * Stub function for _Requestor.request. Checks that the expected request arrived and
			 * returns a promise for its response.
			 */
			function checkRequest(sMethod, sUrl, sGroupId, mHeaders, oPayload) {
				var oActualRequest = {
						method : sMethod,
						url : sUrl,
						headers : mHeaders,
						payload : oPayload
					},
					oExpectedRequest = that.aRequests.shift(),
					oResponse;

				if (!oExpectedRequest) {
					assert.ok(false, sMethod + " " + sUrl + " (unexpected)");
				} else {
					oResponse = oExpectedRequest.response;
					delete oExpectedRequest.response;
					assert.deepEqual(oActualRequest, oExpectedRequest, sMethod + " " + sUrl);
				}
				return Promise.resolve(oResponse);
			}

			/*
			 * Checks that the given value is the expected one for the control.
			 */
			function checkValue(sValue, sControlId, i) {
				var aExpectedValues = i === undefined ? that.mChanges[sControlId]
						: that.mListChanges[sControlId][i],
					sVisibleId = i === undefined ? sControlId : sControlId + "[" + i + "]";

				if (!aExpectedValues.length) {
					assert.ok(false, sVisibleId + ": " + JSON.stringify(sValue) + " (unexpected)");
				} else  {
					assert.strictEqual(sValue, aExpectedValues.shift(),
						sVisibleId + ": " + JSON.stringify(sValue));
				}
				that.checkFinish();
			}

			this.oModel = oModel || createTeaBusiModel();
			this.stub(this.oModel.oRequestor, "request", checkRequest);
			//assert.ok(true, sViewXML); // uncomment to see XML in output, in case of parse issues
			this.oView = sap.ui.xmlview({
				viewContent : '<mvc:View xmlns="sap.m" xmlns:form="sap.ui.layout.form" '
					+ 'xmlns:mvc="sap.ui.core.mvc">'
					+ sViewXML
					+ '</mvc:View>'
			});
			Object.keys(this.mChanges).forEach(function (sControlId) {
				that.oView.byId(sControlId).getBindingInfo("text").formatter = function (sValue) {
					checkValue(sValue, sControlId);
				};
			});
			Object.keys(this.mListChanges).forEach(function (sControlId) {
				that.oView.byId(sControlId).getBindingInfo("text").formatter = function (sValue) {
					checkValue(sValue, sControlId, this.getBindingContext().getIndex());
				};
			});

			this.oView.setModel(that.oModel);
			return this.waitForChanges(assert);
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
		 * the change. If you do not expect a value initially, leave out the vValue parameter.
		 *
		 * Examples:
		 * this.expectChange("foo", "bar"); // expect value "bar" for the control with id "foo"
		 * this.expectChange("foo"); // listen to changes for the control with id "foo", but do not
		 *                           // expect a change (in createView)
		 * this.expectChange("foo", ["a", "b"]); // expect values for two rows of the control with
		 *                                       // id "foo"
		 * this.expectChange("foo", "c", 2); // expect value "c" for control with id "foo" in row 2
		 * this.expectChange("foo", "bar").expectChange("foo", "baz"); // expect 2 changes for "foo"
		 *
		 * @param {string} sControlId The control ID
		 * @param {string|string[]} [vValue] The expected value or a list of expected values
		 * @param {number} [iRow] The row index in case that a change is expected for a single row
		 *   of a list (in this case <code>vValue</code> must be a string)
		 * @returns {object} The test instance for chaining
		 */
		expectChange : function (sControlId, vValue, iRow) {
			var aExpectations, i;

			// Ensures that oObject[vProperty] is an array and returns it
			function array(oObject, vProperty) {
				oObject[vProperty] = oObject[vProperty] || [];
				return oObject[vProperty];
			}

			if (Array.isArray(vValue)) {
				aExpectations = array(this.mListChanges, sControlId);
				for (i = 0; i < vValue.length; i += 1) {
					array(aExpectations, i).push(vValue[i]);
				}
			} else if (arguments.length === 3) {
				// This may create a sparse array this.mListChanges[sControlId]
				array(array(this.mListChanges, sControlId), iRow).push(vValue);
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
		 * {@link #waitForChanges}) is expected to perform the given request.
		 *
		 * @param {string|object} vRequest The request with the properties "method", "url" and
		 *   "headers". A string is interpreted as URL with method "GET".
		 * @param {object} [oResponse] The response message to be returned from the requestor.
		 * @returns {object} The test instance for chaining
		 */
		expectRequest : function (vRequest, oResponse) {
			if (typeof vRequest === "string") {
				vRequest = {
					method : "GET",
					url : vRequest
				};
			}
			// ensure that these properties are defined (required for deepEqual)
			vRequest.headers = vRequest.headers || undefined;
			vRequest.payload = vRequest.payload || undefined;
			vRequest.response = oResponse;
			this.aRequests.push(vRequest);
			return this;
		},

		/**
		 * Waits for the expected changes.
		 *
		 * @param {object} assert The QUnit assert object
		 * @returns {Promise} A promise that is resolved when all expected values for controls have
		 *   been set
		 */
		waitForChanges : function (assert) {
			var that = this;

			return new Promise(function (resolve) {
				that.resolve = resolve;
				// After one second everything should have run through
				// Resolve to have the missing requests and changes reported
				window.setTimeout(resolve, 1000);
				that.checkFinish();
			}).then(function () {
				var sControlId, i, j;

				// Report missing requests
				that.aRequests.forEach(function (oRequest) {
					assert.ok(false, oRequest.method + " " + oRequest.url + " (not requested)");
				});
				// Report missing changes
				for (sControlId in that.mChanges) {
					for (i in that.mChanges[sControlId]) {
						assert.ok(false, sControlId + ": " + that.mChanges[sControlId][i]
							+ " (not set)");
					}
				}
				for (sControlId in that.mListChanges) {
					// Note: This may be a sparse array
					for (i in that.mListChanges[sControlId]) {
						for (j in that.mListChanges[sControlId][i]) {
							assert.ok(false, sControlId + "[" + i + "]: "
								+ that.mListChanges[sControlId][i][j] + " (not set)");
						}
					}
				}
			});
		}
	});

	//*********************************************************************************************
	// Scenario:
	// A table uses the list binding with extended change detection, but not all key properties of
	// the displayed entity are known on the client, so that the key predicate cannot be determined.
	// Ensure that the table shows the rows. (Not reproducible with Gateway services, because they
	// always deliver all key properties, selected or not.)
	QUnit.test("Absolute ODLB with ECD, missing key column", function (assert) {
		var sView = '\
<Table growing="true" items="{path : \'/EMPLOYEES\', parameters : {$select : \'Name\'}}">\
	<items>\
		<ColumnListItem>\
			<cells>\
				<Text id="name" text="{Name}" />\
			</cells>\
		</ColumnListItem>\
	</items>\
</Table>';

		this.oLogMock.expects("warning")
			.withExactArgs("Disable extended change detection as diff computation failed: "
				+ "sap.ui.model.odata.v4.ODataListBinding: /EMPLOYEES",
				"Missing key(s): ID",
				"sap.ui.model.odata.v4.ODataListBinding");
		this.expectRequest("EMPLOYEES?$select=Name&$skip=0&$top=20", {
				"value" : [
					{"Name" : "Jonathan Smith"},
					{"Name" : "Frederic Fall"}
				]
			})
			.expectChange("name", ["Jonathan Smith", "Frederic Fall"]);

		return this.createView(assert, sView);
	});
});
