/*!
 * ${copyright}
 */
// SandboxModelHelper functions used within sap.ui.core.sample.common namespace
sap.ui.define([
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon-4"
], function (ODataModel, TestUtils, sinon) {
	"use strict";

	var SandboxModelHelper = {
			/**
			 * Adapts OData V4 Model parameters taking certain constructor parameters from URL
			 * parameters.
			 *
			 * @param {object} mParameters
			 *   The original OData V4 model's constructor parameters
			 * @param {string} [sUpdateGroupId]
			 *   Replaces mParameter.updateGroupId, - win's over URI parameter <code>updateGroupId
			 *   </code> if supplied
			 * @returns {object} The adapted model parameters as a clone
			 */
			adaptModelParameters : function (mParameters, sUpdateGroupId) {
				var oUriParameters = new URLSearchParams(window.location.search);

				// clone: do not modify constructor call parameter
				return Object.assign({}, mParameters, {
					earlyRequests : oUriParameters.get("earlyRequests") !== "false",
					groupId : oUriParameters.get("$direct") ? "$direct" : mParameters.groupId,
					serviceUrl : mParameters.serviceUrl,
					updateGroupId : sUpdateGroupId || oUriParameters.get("updateGroupId")
						|| mParameters.updateGroupId
				});
			},
			/**
			 * Adapts the given OData V4 Model parameters (see {@link #adaptModelParameters}),
			 * creates (see {@link #createModel}) and returns the created OData V4 Model.
			 *
			 * @param {object} mModelParameters
			 *   The original OData V4 model's constructor parameters
			 * @param {object} oMockData
			 *   The mock data used to setup a mock server, see {@link #createModel}
			 * @returns {sap.ui.model.odata.v4.ODataModel}
			 *   The created OData V4 Model
			 */
			adaptModelParametersAndCreateModel : function (mModelParameters, oMockData) {
				return SandboxModelHelper.createModel(
					SandboxModelHelper.adaptModelParameters(mModelParameters), oMockData);
			},
			/**
			 * Creates the OData V4 Model. For the "non-realOData" case, a mock server for the
			 * back-end requests is set up. Takes care about restoring the mock server once the
			 * model is destroyed.
			 *
			 * @param {object} mModelParameters
			 *   The (already adapted) OData V4 model parameters (see {@link #adaptModelParameters})
			 * @param {object} oMockData
			 *   The mock data used to setup a mock server
			 * @param {string} oMockData.mFixture
			 *   The fixture, - see {@link sap.ui.test.TestUtils.setupODataV4Server}
			 * @param {string} oMockData.sFilterBase
			 *   The base path for relative filter URLs in <code>oMockData.mFixture</code>, see
			 *   {@link sap.ui.test.TestUtils.setupODataV4Server}
			 * @param {object[]} [oMockData.aRegExps]
			 *   The regular expression array for {@link sap.ui.test.TestUtils.setupODataV4Server}
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
					oMockData.aRegExps ??= [{
						regExp : /^GET [\w\/.]+\$metadata([\w?&\-=]+sap-language=..|)$/,
						response : {source : "metadata.xml"}
					}];
					oSandbox = sinon.sandbox.create();
					TestUtils.setupODataV4Server(oSandbox, oMockData.mFixture,
						oMockData.sSourceBase, oMockData.sFilterBase, oMockData.aRegExps);
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
