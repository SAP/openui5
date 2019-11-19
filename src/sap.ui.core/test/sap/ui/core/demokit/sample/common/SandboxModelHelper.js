/*!
 * ${copyright}
 */
// SandboxModelHelper functions used within sap.ui.core.sample.common namespace
sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon-4"
], function (UriParameters, ODataModel, TestUtils, sinon) {
	"use strict";

	var SandboxModelHelper = {
			/**
			 * Adapts OData V4 Model parameters. For the "realOData" case, the serviceUrl is adapted
			 * to a proxy Url and certain constructor parameters are taken from URL parameters.
			 *
			 * @param {object} mParameters
			 *   The original OData V4 model's constructor parameters
			 * @param {string} [sUpdateGroupId]
			 *   Replaces mParameter.updateGroupId, - win's over URI parameter <code>updateGroupId
			 *   </code> if supplied
			 * @returns {object} The adapted model parameters as a clone
			 */
			adaptModelParameters : function (mParameters, sUpdateGroupId) {
				var oUriParameters = UriParameters.fromQuery(window.location.search);

				// clone: do not modify constructor call parameter
				return Object.assign({}, mParameters, {
					earlyRequests : oUriParameters.get("earlyRequests") !== "false",
					groupId : oUriParameters.get("$direct") ? "$direct" : mParameters.groupId,
					serviceUrl : TestUtils.proxy(mParameters.serviceUrl),
					updateGroupId : sUpdateGroupId || oUriParameters.get("updateGroupId")
						|| mParameters.updateGroupId
				});
			},
			/**
			 * Adapts the given OData V4 Model parameters {@see #adaptModelParameter}, - creates
			 * {@see #createModel} and returns the created OData V4 Model.
			 *
			 * @param {object} mModelParameters
			 *   The original OData V4 model's constructor parameters
			 * @param {object} oMockData
			 *   The mock data used to setup a mock server, {@see #createModel}
			 * @returns {sap.ui.model.odata.v4.ODataModel}
			 *   The created OData V4 Model
			 */
			adaptModelParametersAndCreateModel : function (mModelParameters, oMockData) {
				return SandboxModelHelper.createModel(
					SandboxModelHelper.adaptModelParameters(mModelParameters), oMockData);
			},
			/**
			 * Creates the OData V4 Model. For the "non-realOData" case, a mock server for the
			 * backend requests is set up. Takes care about restoring the mock server once the model
			 * is destroyed.
			 *
			 * @param {object} mModelParameters
			 *   The (already adapted) OData V4 model parameters {@see #adaptModelParameters}
			 * @param {object} oMockData
			 *   The mock data used to setup a mock server
			 * @param {string} oMockData.mFixture
			 *   The fixture, - see {@link sap.ui.test.TestUtils.setupODataV4Server}
			 * @param {string} oMockData.sFilterBase
			 *   The base path for relative filter URLs in <code>oMockData.mFixture</code>, see
			 *   {@link sap.ui.test.TestUtils.setupODataV4Server}
			 * @param {string} oMockData.sSourceBase
			 *   The base path for <code>source</code> values in the <code>oMockData.mFixture</code>
			 *   , see {@link sap.ui.test.TestUtils.setupODataV4Server}
			 * @returns {sap.ui.model.odata.v4.ODataModel}
			 *   The created OData V4 Model
			 */
			createModel : function (mModelParameters, oMockData) {
				var oModel,
					oSandbox;

				if (!TestUtils.isRealOData()) {
					oSandbox = sinon.sandbox.create();
					TestUtils.setupODataV4Server(oSandbox, oMockData.mFixture,
						oMockData.sSourceBase, oMockData.sFilterBase);
				}
				oModel = new ODataModel(mModelParameters);
				if (oSandbox) {
					oModel.destroy = function () {
						if (oSandbox) { // may be called twice
							oSandbox.restore();
							oSandbox = undefined;
						}
						return ODataModel.prototype.destroy.apply(this, mModelParameters);
					};
				}
				return oModel;
			}
		};

	return SandboxModelHelper;
});