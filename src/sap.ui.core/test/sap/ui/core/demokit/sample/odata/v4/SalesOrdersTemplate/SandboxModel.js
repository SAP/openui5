/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// For the "realOData" case, the URL is adapted to a proxy URL and certain constructor parameters
// are taken from URL parameters.
// For the "non-realOData" case, a mock server for the backend requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	var oMockData = {
			mFixture : {
				"$metadata" : {source : "metadata.xml"},
				"BusinessPartnerList?$skip=0&$top=5" : {source : "BusinessPartnerList.json"},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.CURRENCY_CODE%27/$metadata"
					: {source : "metadata_tcurc.xml"},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/h_tcurc-sh/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.CURRENCY_CODE%27/H_TCURC_SH_Set?$select=LTEXT,WAERS&$skip=0&$top=20"
					: {source : "CurrencyList.json"},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_bp_role-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.BP_ROLE%27/$metadata"
					: {source : "metadata_bp_role.xml"},
				"/sap/opu/odata4/sap/zui5_testv4/f4/sap/d_bp_role-fv/0001;ps=%27default-zui5_epm_sample-0002%27;va=%27com.sap.gateway.default.zui5_epm_sample.v0002.ET-BUSINESSPARTNER.BP_ROLE%27/D_BP_ROLE_FV_Set?$select=FIELD_VALUE&$skip=0&$top=100"
					: {source : "RoleList.json"}
			},
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			sSourceBase : "sap/ui/core/sample/odata/v4/SalesOrdersTemplate/data"
		};

	return ODataModel.extend("sap.ui.core.sample.odata.v4.SalesOrdersTemplate.SandboxModel", {
		constructor : function (mParameters) {
			return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, oMockData);
		}
	});
});