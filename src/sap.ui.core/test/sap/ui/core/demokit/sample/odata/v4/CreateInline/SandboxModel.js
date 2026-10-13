/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V4 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/ui/core/sample/common/SandboxModelHelper",
	"sap/ui/model/odata/v4/ODataModel"
], function (SandboxModelHelper, ODataModel) {
	"use strict";

	const aData = [{
		BuyerID : "0100000000",
		CurrencyCode : "EUR",
		GrossAmount : "25867.03",
		LifecycleStatus : "N",
		LifecycleStatusDesc : "New",
		Note : "Deliver as fast as possible",
		SalesOrderID : "0500000000",
		SO_2_BP : {
			BusinessPartnerID : "0100000000",
			CompanyName : "SAP"
		}
	}, {
		BuyerID : "0100000004",
		CurrencyCode : "USD",
		GrossAmount : "250.73",
		LifecycleStatus : "N",
		LifecycleStatusDesc : "New",
		Note : "Deliver as fast as possible",
		SalesOrderID : "0500000001",
		SO_2_BP : {
			BusinessPartnerID : "0100000004",
			CompanyName : "Panorama Studios"
		}
	}, {
		BuyerID : "0100000001",
		CurrencyCode : "EUR",
		GrossAmount : "12345.67",
		LifecycleStatus : "P",
		LifecycleStatusDesc : "In Process",
		Note : "Please handle with care",
		SalesOrderID : "0500000002",
		SO_2_BP : {
			BusinessPartnerID : "0100000001",
			CompanyName : "Becker Berlin"
		}
	}, {
		BuyerID : "0100000002",
		CurrencyCode : "USD",
		GrossAmount : "9876.54",
		LifecycleStatus : "C",
		LifecycleStatusDesc : "Completed",
		Note : "Standard shipping is fine",
		SalesOrderID : "0500000003",
		SO_2_BP : {
			BusinessPartnerID : "0100000002",
			CompanyName : "DelBont Industries"
		}
	}, {
		BuyerID : "0100000003",
		CurrencyCode : "GBP",
		GrossAmount : "4200.00",
		LifecycleStatus : "N",
		LifecycleStatusDesc : "New",
		Note : "Urgent - express delivery",
		SalesOrderID : "0500000004",
		SO_2_BP : {
			BusinessPartnerID : "0100000003",
			CompanyName : "Talpa"
		}
	}, {
		BuyerID : "0100000001",
		CurrencyCode : "EUR",
		GrossAmount : "760.10",
		LifecycleStatus : "P",
		LifecycleStatusDesc : "In Process",
		Note : "Deliver as fast as possible",
		SalesOrderID : "0500000005",
		SO_2_BP : {
			BusinessPartnerID : "0100000001",
			CompanyName : "Becker Berlin"
		}
	}];
	const mIdToCompanyName = {
		"0100000000" : "SAP",
		"0100000001" : "Becker Berlin",
		"0100000002" : "DelBont Industries",
		"0100000003" : "Talpa",
		"0100000004" : "Panorama Studios"
	};
	let iLastUsedId = 500000005;

	/**
	 * Creates a sandbox model that mocks the back-end requests for the "CreateInline" sample.
	 *
	 * @param {object} mParameters - The model parameters, partially taken from URL parameters
	 * @returns {sap.ui.model.odata.v4.ODataModel} The created model
	 */
	function SandboxModel(mParameters) {
		return SandboxModelHelper.adaptModelParametersAndCreateModel(mParameters, {
			sFilterBase : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/",
			mFixture : {},
			aRegExps : [{
				regExp : /^GET [\w\/]+\/SalesOrderList\('([^']*)'\)/,
				response : {buildResponse : buildSingleEntityResponse}
			}, {
				regExp : /^GET [\w\/]+\/SalesOrderList(?:\?|$)/,
				response : {buildResponse : buildListResponse}
			}, {
				regExp : /^POST [\w\/]+\/SalesOrderList/,
				response : {buildResponse : buildPostResponse}
			}, {
				regExp : /^PATCH [\w\/]+\/SalesOrderList\('([^']*)'\)$/,
				response : {buildResponse : buildPatchResponse}
			}, {
				regExp : /^DELETE [\w\/]+\/SalesOrderList\('([^']*)'\)$/,
				response : {buildResponse : buildDeleteResponse, code : 204}
			}],
			sSourceBase : "sap/ui/core/sample/odata/v4/CreateInline/data"
		});
	}

	/**
	 * Builds a response for a GET request on the "SalesOrderList" collection, honoring the $filter
	 * (BuyerID eq) and $orderby query options so that the Search and Sort toolbar actions have a
	 * visible effect against the mocked back-end.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildListResponse(aMatches, oResponse) {
		const sUrl = decodeURIComponent(aMatches.input || aMatches[0] || "");
		let aResult = aData.slice();

		const aFilterMatch = /\$filter=([^&]+)/.exec(sUrl);
		if (aFilterMatch) {
			const aEqMatch = /BuyerID eq '([^']+)'/.exec(decodeURIComponent(aFilterMatch[1]));
			if (aEqMatch) {
				aResult = aResult.filter((oRow) => oRow.BuyerID === aEqMatch[1]);
			}
		}

		const aOrderMatch = /\$orderby=([^&]+)/.exec(sUrl);
		if (aOrderMatch) {
			const bDesc = aOrderMatch[1].includes("desc");
			aResult = aResult.sort((oEntity0, oEntity1) => {
				let iOrder = 0;

				if (oEntity0.SalesOrderID < oEntity1.SalesOrderID) {
					iOrder = -1;
				} else if (oEntity0.SalesOrderID > oEntity1.SalesOrderID) {
					iOrder = 1;
				}

				return bDesc ? -iOrder : iOrder;
			});
		}

		oResponse.message
			= JSON.stringify({"@odata.count" : String(aResult.length), value : aResult});
	}

	/**
	 * Builds a response for a GET request on a single "SalesOrder" instance addressed by its key
	 * predicate. The OData V4 model sends this request (with autoExpandSelect) to read the
	 * SO_2_BP navigation property of a freshly created row, whose POST response intentionally does
	 * not contain it. The entity is served from aData, which keeps SO_2_BP (see buildPostResponse).
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 */
	function buildSingleEntityResponse(aMatches, oResponse) {
		const sSalesOrderID = aMatches[1];
		const oEntity = aData.find((oRow) => oRow.SalesOrderID === sSalesOrderID);

		// For simplicity the mock returns the full entity and does not evaluate the $select and
		// $expand query options; this is sufficient for the sample.
		oResponse.message = JSON.stringify(oEntity);
	}

	/**
	 * Builds a response for any POST request on the "SalesOrderList" collection.
	 *
	 * @param {string[]} _aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 * @param {object} oRequest - Request object to get POST body from
	 */
	function buildPostResponse(_aMatches, oResponse, oRequest) {
		const oRequestBody = JSON.parse(oRequest.requestBody);
		if (!(oRequestBody.BuyerID in mIdToCompanyName)) {
			const oError
				= new Error(`Business Partner with key '${oRequestBody.BuyerID}' does not exist`);
			oError.target = "BuyerID";
			throw oError;
		}

		iLastUsedId += 1;
		const oNewSalesOrder = {
			BuyerID : oRequestBody.BuyerID,
			CurrencyCode : oRequestBody.CurrencyCode ?? "EUR",
			GrossAmount : "0.00",
			LifecycleStatus : "N",
			LifecycleStatusDesc : "New",
			Note : oRequestBody.Note ?? "",
			SalesOrderID : "0" + iLastUsedId
		};
		aData.push(oNewSalesOrder);
		oResponse.message = JSON.stringify(oNewSalesOrder);
		oNewSalesOrder.SO_2_BP = {
			BusinessPartnerID : oRequestBody.BuyerID,
			CompanyName : mIdToCompanyName[oRequestBody.BuyerID]
		};
	}

	/**
	 * Builds a response for a PATCH request on a specific "SalesOrder" instance.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 * @param {object} oResponse - Response object to fill
	 * @param {object} oRequest - Request object to get PATCH body from
	 */
	function buildPatchResponse(aMatches, oResponse, oRequest) {
		const sSalesOrderID = aMatches[1];
		const oRequestBody = JSON.parse(oRequest.requestBody);
		const oEntity = aData.find((oRow) => oRow.SalesOrderID === sSalesOrderID);

		Object.assign(oEntity, oRequestBody);
		oResponse.message = JSON.stringify(oEntity);
	}

	/**
	 * Builds a response for a DELETE request on a specific "SalesOrder" instance by removing the
	 * entity from the mocked back-end data so that it does not reappear on refresh. No response
	 * body is built here: the fixture declares <code>code : 204</code> (No Content), which is the
	 * standard OData response for a successful DELETE, so the response object is not needed.
	 *
	 * @param {string[]} aMatches - The matches against the RegExp
	 */
	function buildDeleteResponse(aMatches) {
		const sSalesOrderID = aMatches[1];
		const iIndex = aData.findIndex((oRow) => oRow.SalesOrderID === sSalesOrderID);

		if (iIndex >= 0) {
			aData.splice(iIndex, 1);
		}
	}

	SandboxModel.getMetadata = ODataModel.getMetadata;

	return SandboxModel;
});
