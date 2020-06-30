/*!
 * ${copyright}
 */

/* Provides a sandbox for this component:
 * For the "realOData" (realOData=true/proxy) case when the component runs with
 * backend, the v2.ODataModel constructor is wrapped so that the URL is adapted to a proxy URL
 * For the case realOData=false a mockserver will be set up. Unknown values default to false.
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (merge, JSONModel, ODataModel, TestUtils, sinon) {
	"use strict";

	var mMessageKey2MessageData = {
			error : {
				code : "ZUI5TEST/001",
				message : "Error: My error message",
				severity : "error"
			},
			info : {
				code : "ZUI5TEST/001",
				message : "Info: My info message",
				severity : "info"
			},
			order : {
				code : "ZUI5TEST/003",
				message : "Order at least 2 EA of product 'HT-1000'",
				severity : "warning"
			},
			success : {
				code : "ZUI5TEST/001",
				message : "Success: My success message",
				severity : "success"
			},
			warning : {
				code : "ZUI5TEST/001",
				message : "Warning: My warning message",
				severity : "warning"
			},
			warningMultiTarget : {
				code : "ZUI5TEST/007",
				message : "For a quantity greater than 1 you need an approval reason",
				severity : "warning"
			}
		},
		oCurrentMessages = {
			create : function (vTarget, sMessage) {
				var oMessageData = mMessageKey2MessageData[sMessage],
					aTargets = Array.isArray(vTarget) ? vTarget : [vTarget];
				this.oMessage = {
					additionalTargets : aTargets.slice(1),
					code : oMessageData.code,
					details : [],
					id : sMessage,
					message : oMessageData.message,
					severity : oMessageData.severity,
					target : aTargets[0]
				};
				return this;
			},
			oMessage : {},
			add : function (sTarget, sMessage) {
				var oMessageData = mMessageKey2MessageData[sMessage];
				this.oMessage.details.push({
					code : oMessageData.code,
					id : sMessage,
					message : oMessageData.message,
					severity : oMessageData.severity,
					target : sTarget
				});
				return this;
			},
			remove : function (sMessage) {
				var aDetails, iIndex;
				if (this.oMessage.id === sMessage) {
					aDetails = this.oMessage.details;
					this.oMessage = this.oMessage.details.shift();
					this.oMessage.details = aDetails;
				} else {
					iIndex = this.oMessage.details.findIndex(function (oMessage) {
						return oMessage.id === sMessage;
					});
					this.oMessage.details.splice(iIndex, 1);
				}
				return this;
			},
			buildString : function () {
				return JSON.stringify(this.oMessage);
			}
		},
		oLineItemsModel,
		iTimesSaved = 0,
		oMockData = {
			mFixture : {
				"$metadata" : {
					source : "metadata.xml"
				},
				"$metadata?sap-language=EN" : {
					source : "metadata.xml"
				},
				"SalesOrderSet('0500000001')" : {
					headers : {
						"sap-message" : oCurrentMessages.create(
							"ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000100')/Quantity",
							"order"
						).buildString()
					},
					source : "tc1-salesOrder.json"
				},
				"SalesOrderSet('0500000001')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : function (request) {
						return iTimesSaved === 1;
					},
					message : getLineItems("error", 0)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 2;
					},
					message : getLineItems("none", 0)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 3;
					},
					message : getLineItems("warning", 1)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 4;
					},
					message : getLineItems("none", 1)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 5;
					},
					message : getLineItems("info", 2)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 6;
					},
					message : getLineItems("none", 2)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 7;
					},
					message : getLineItems("success", 3)
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 8;
					},
					message : getLineItems("none", 3)
				}, {
					ifMatch : function (request) {
						return true;
					},
					source : "tc1-lineItems.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"MERGE SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000020')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"MERGE SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000040')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"MERGE SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000050')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"POST SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000010')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"POST SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000020')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"POST SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000040')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"POST SalesOrderLineItemSet(SalesOrderID='0500000001',ItemPosition='0000000050')" : {
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				},
				"SalesOrderSet('0500000001')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : {
						"sap-message" : oCurrentMessages.add(
							"ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000010')/Note",
							"error"
						).buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 1;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.remove("error").buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 2;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.add(
							"ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000020')/Note",
							"warning"
						).buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 3;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.remove("warning1").buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 4;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.add(
							"ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000040')/Note",
							"info"
						).buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 5;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.remove("info").buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 6;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.add(
							"ToLineItems(SalesOrderID='0500000001',ItemPosition='0000000050')/Note",
							"success"
						).buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 7;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.remove("success").buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 8;
					},
					source : "tc1-setUpdated.json"
				}, {
					headers : {
						"sap-message" : oCurrentMessages.buildString()
					},
					ifMatch : function (request) {
						return true;
					},
					source : "tc1-setUpdated.json"
				}],

				/* Test Case VIII */
				"SalesOrderSet('108')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC8/SalesOrderSet.json"
				},
				"SalesOrderSet('108')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : function (request) {
						return iTimesSaved === 1;
					},
					source : "Messages/TC8/SalesOrderSet-ToLineItems-1.json"
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 2;
					},
					source : "Messages/TC8/SalesOrderSet-ToLineItems-2.json"
				}, {
					ifMatch : function (request) {
						return iTimesSaved === 3;
					},
					source : "Messages/TC8/SalesOrderSet-ToLineItems-3.json"
				}, {
					source : "Messages/TC8/SalesOrderSet-ToLineItems-0.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='108',ItemPosition='010')" : [{
					code : 204,
					ifMatch : function (request) {
						iTimesSaved++;
						return true;
					},
					message : "no content"
				}],
				"SalesOrderSet('108')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : {
						"sap-message" : oCurrentMessages.create([
							"ToLineItems(SalesOrderID='108',ItemPosition='010')/Quantity",
							"ToLineItems(SalesOrderID='108',ItemPosition='010')/Note"
						], "warningMultiTarget").buildString()
					},
					ifMatch : function (request) {
						return iTimesSaved === 2;
					},
					source : "Messages/TC8/SalesOrderSet.json"
				}, {
					ifMatch : function (request) {
						return true;
					},
					source : "Messages/TC8/SalesOrderSet.json"
				}]
			},
			sFilterBase : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/",
			sSourceBase : "sap/ui/core/internal/samples/odata/v2/SalesOrders/data"
		};

	/**
	 * Reads and returns the line items, each one has the specific note added.
	 * @param {string} sSeverity The severity of the message at the current item
	 * @param {number} iCurrentItem The current item from the line items
	 * @return {object} The line items
	 */
	function getLineItems(sSeverity, iCurrentItem) {
		var i, oLineItems;
		if (!oLineItemsModel) {
			oLineItemsModel = new JSONModel();
			oLineItemsModel.loadData("data/tc1-lineItems.json", "", false);
		}
		oLineItems = merge({}, oLineItemsModel.getObject("/"));

		for (i = 0; i <= iCurrentItem - 1; i += 1) {
			oLineItems.d.results[i].Note = "No message";
		}
		oLineItems.d.results[iCurrentItem].Note = mMessageKey2MessageData[sSeverity] ?
			mMessageKey2MessageData[sSeverity].message : "No message";
		return oLineItems;
	}

	return ODataModel.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.SandboxModel", {
		constructor : function (mParameters) {
			var oModel, oSandbox;

			if (!TestUtils.isRealOData()) {
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, oMockData.mFixture, oMockData.sSourceBase,
					oMockData.sFilterBase);
			} else {
				mParameters = Object.assign({}, mParameters, {
					serviceUrl : TestUtils.proxy(mParameters.serviceUrl)
				});
			}

			oModel = new ODataModel(mParameters);
			oModel.destroy = function () {
				if (oSandbox) {
					oSandbox.restore();
					oSandbox = undefined;
				}
				return ODataModel.prototype.destroy.apply(this, arguments);
			};
			return oModel;
		}
	});
});