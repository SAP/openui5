/*global sinon */

sap.ui.define([
	"./TableQUnitUtils",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel",
	"sap/ui/core/sample/odata/v4/DataAggregation/SandboxModel"
], function(
	TableQUnitUtils,
	ODataModel,
	TestUtils,
	HierarchySandboxModel,
	DataAggregationSandboxModel
) {
	"use strict";

	let iCount;

	function createData(iStartIndex, iLength) {
		const aData = [];

		if (iStartIndex + iLength > iCount) {
			iLength = iCount - iStartIndex;
		}

		for (let i = iStartIndex; i < iStartIndex + iLength; i++) {
			aData.push({
				Name: "Test Product (" + i + ")"
			});
		}

		return aData;
	}

	function createResponse(iStartIndex, iLength, iPageSize) {
		const mResponse = {};
		const bPageLimitReached = iPageSize != null && iPageSize > 0 && iLength > iPageSize;

		if (bPageLimitReached) {
			const sSkipTop = "$skip=" + iStartIndex + "&$top=" + iLength;
			const sSkipToken = "&$skiptoken=" + iPageSize;
			mResponse.message = {value: createData(iStartIndex, iPageSize)};
			mResponse.message["@odata.nextLink"] = "http://localhost:8088/MyServiceWithPaging/Products?" + sSkipTop + sSkipToken;
		} else {
			mResponse.message = {value: createData(iStartIndex, iLength)};
		}

		return mResponse;
	}

	function setupODataV4Server() {
		const oSandbox = sinon.sandbox.create();

		TestUtils.setupODataV4Server(oSandbox, {}, null, null, [{
			regExp: /^GET \/MyService(WithPaging)?\/\$metadata$/,
			response: {
				source: "metadata_tea_busi_product.xml"
			}
		}, {
			regExp: /^GET \/MyService(WithPaging)?\/Products\?(\$count=true&)?\$skip=(\d+)\&\$top=(\d+)$/,
			response: {
				buildResponse: function(aMatches, oResponse) {
					const iPageSize = aMatches[1] ? 50 : 0;
					const bWithCount = !!aMatches[2];
					const iSkip = parseInt(aMatches[3]);
					const iTop = parseInt(aMatches[4]);
					const mResponse = createResponse(iSkip, iTop, iPageSize);

					if (bWithCount) {
						mResponse.message["@odata.count"] = iCount;
					}

					oResponse.message = JSON.stringify(mResponse.message);
				}
			}
		}]);
	}

	const TableQUnitUtilsODataV4 = Object.assign({}, TableQUnitUtils);

	/**
	 * Creates an ODataModel for a service that provides list data.
	 *
	 * Data structure (entities and their properties):
	 *
	 * - Products
	 *   - Name
	 *
	 * @param {object} mOptions Configuration options
	 * @param {boolean} [mOptions.paging=false] Whether to enable service-side paging
	 * @param {int} [mOptions.count=400] The number of entries the service returns
	 * @param {object} [mOptions.modelParameters] Parameters that are passed to the model constructor
	 * @returns {sap.ui.model.odata.v4.ODataModel} The created ODataModel
	 */
	TableQUnitUtilsODataV4.createModelForListDataService = function(mOptions) {
		mOptions = {
			paging: false,
			count: 400,
			...mOptions
		};
		iCount = mOptions.count;

		const oSandbox = setupODataV4Server();
		const oModel = new ODataModel({
			serviceUrl: mOptions.paging ? "/MyServiceWithPaging/" : "/MyService/",
			...mOptions.modelParameters
		});

		oModel.destroy = function() {
			oSandbox.restore();
			return ODataModel.prototype.destroy.apply(this, arguments);
		};

		return oModel;
	};

	/**
	 * Creates an ODataModel for a service that provides hierarchical data.
	 *
	 * The BindingInfo should be as follows:
	 * <pre><code>
	 * {
	 *   path: '/EMPLOYEES',
	 *	 parameters: {$count: false, $orderby: 'AGE', $$aggregation: {hierarchyQualifier: "OrgChart", expandTo: 3}},
	 *	 suspended: true
	 * }
	 * </code></pre>
	 *
	 * The Binding is initially suspended and should be resumed after the table is created.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataModel} The created ODataModel
	 */
	TableQUnitUtilsODataV4.createModelForHierarchyDataService = function() {
		return new HierarchySandboxModel({
			serviceUrl: "/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/",
			autoExpandSelect: true
		});
	};

	/**
	 * Creates an ODataModel for a service that provides data aggregation.
	 *
	 * If the V4Aggregation plugin is applied, the BindingInfo should be as follows:
	 * <pre><code>
	 * {
	 *   path: '/BusinessPartners',
	 *   parameters: {
	 *     $count: false,
	 *     $orderby: 'Country desc,Region desc,Segment,AccountResponsible'
	 *   },
	 *   suspended: true
	 * }
	 * </code></pre>
	 *
	 * Otherwise:
	 * <pre><code>
	 * {
	 *   path: '/BusinessPartners',
	 *   parameters: {
	 *     $count: false,
	 *     $orderby: 'Country desc,Region desc,Segment,AccountResponsible',
	 *     $$aggregation: {
	 *       aggregate: {
	 *         SalesAmountLocalCurrency: {
	 *           grandTotal: true,
	 *           subtotals: true,
	 *           unit: "LocalCurrency"
	 *         },
	 *         SalesNumber: {}
	 *       },
	 *       group: {
	 *         AccountResponsible: {},
	 *         Country_Code: {additionally: ["Country"]}
	 *       },
	 *       groupLevels: ["Country_Code", "Region", "Segment"]
	 *     }
	 *   },
	 *   suspended: true
	 * }
	 * </code></pre>
	 *
	 * The Binding is initially suspended and should be resumed after the table is created.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataModel} The created ODataModel
	 */
	TableQUnitUtilsODataV4.createModelForDataAggregationService = function() {
		return new DataAggregationSandboxModel({
			serviceUrl: "/odata/v4/sap.fe.managepartners.ManagePartnersService/"
		});
	};

	return TableQUnitUtilsODataV4;
});