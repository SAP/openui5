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
			infoCurrency : {
				code : "ZUI5TEST/009",
				message : "Avoid currency 'JPY'",
				severity : "info"
			},
			maintenance : {
				code : "ZUI5TEST/004",
				message : "Product HT-1110 is out of maintenance",
				severity : "warning"
			},
			note : {
				code : "ZUI5TEST/001",
				message : "Enter an Item Note",
				severity : "warning"
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
			successFix : {
				code : "ZUI5TEST/008",
				message : "Successfully updated the quantity",
				severity : "success",
				transition : true
			},
			successFixAll : {
				code : "ZUI5TEST/010",
				message : "Fixed quantity to 2 EA",
				severity : "success",
				transition : true
			},
			system : {
				code : "ZUI5TEST/006",
				message : "System maintenance starts in 2 hours",
				severity : "warning",
				transition : true
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
			aMessages : [],
			/**
			 * Adds a new message.
			 *
			 * @param {string} sMessage
			 *   An identifier which gets the message from the <code>MessageKey2MessageData</code>
			 *   map
			 * @param {string|string[]} vTarget
			 *   The path to the message target
			 * @returns {object}
			 *   this, to allow chaining
			 */
			add : function (sMessage, vTarget) {
				var oMessageData = mMessageKey2MessageData[sMessage],
					aTargets = Array.isArray(vTarget) ? vTarget : [vTarget];
				this.aMessages.push({
					additionalTargets : aTargets.slice(1),
					code : oMessageData.code,
					id : sMessage,
					message : oMessageData.message.includes(":")
						? oMessageData.message.split(": ")[1]
						: oMessageData.message,
					severity : oMessageData.severity,
					target : aTargets[0],
					transition : oMessageData.transition ? true : false
				});

				return this;
			},
			/**
			 * Builds a string of the current array of messages.
			 *
			 * @param {array} aNeededMessages
			 *   The indices of the needed messages; if not given all current messages are used
			 * @returns {string}
			 *   The message object as string
			 */
			buildString : function (aNeededMessages) {
				var aMessages = aNeededMessages
						? aNeededMessages.map(function (i) { return this.aMessages[i]; }, this)
						: this.aMessages,
					oMessages = Object.assign({}, aMessages[0]);
				oMessages.details = aMessages.slice(1);

				return JSON.stringify(oMessages);
			},
			/**
			 * Resets the message object. Needs to be called once when building messages for a new
			 * sales order.
			 *
			 * @returns {object} this, to allow chaining
			 */
			reset : function () {
				this.aMessages = [];
				return this;
			}
		},
		oLineItemsModel,
		iTimesSaved = 0;

	/**
	 * Gets the line items from the response, applies the <code>$skip</code> and <code>$top</code>
	 * parameters from the url and stores it back in the response.
	 *
	 * @param {object[]} aMatch The match array from the matching URL
	 * @param {object} oResponse The response which will be sent to the client
	 */
	function applySkipTop(aMatch, oResponse) {
		var oResponseBody = JSON.parse(oResponse.message),
			aLineItems = oResponseBody.d.results,
			iSkip = parseInt(aMatch[1]),
			iTop = parseInt(aMatch[2]);

		oResponseBody.d.results = aLineItems.slice(iSkip, iSkip + iTop);
		oResponse.message = JSON.stringify(oResponseBody);
	}

	/**
	 * Reads and returns the line items, each one has the specific note added.
	 *
	 * @param {string} sFilePath
	 *   The path to the file in the data folder
	 * @param {function} [fnModifyData]
	 *   Function which modifies the data to fit the current testcase. Gets passed an array with
	 *   the line items
	 * @param {number} [iSkip=0]
	 *   The number of skipped line items
	 * @param {number} [iTop=4]
	 *   The maximum number of returned line items
	 * @return {object}
	 *   The OData response for the SalesOrderLineItemSet considering the given skip and top
	 */
	function getLineItems(sFilePath, fnModifyData, iSkip, iTop) {
		var oLineItems,
			sPrefix = "test-resources/sap/ui/core/internal/samples/odata/v2/SalesOrders/data/";

		if (!oLineItemsModel || oLineItemsModel.getProperty("/path") !== sFilePath) {
			oLineItemsModel = new JSONModel();
			oLineItemsModel.loadData(sPrefix + sFilePath, "", false);
			oLineItemsModel.setProperty("/path", sFilePath);
		}
		oLineItems = merge({}, oLineItemsModel.getObject("/"));

		if (fnModifyData) {
			fnModifyData(oLineItems.d.results);
		}

		if (iSkip || iTop) {
			iSkip = iSkip || 0;
			iTop = iSkip + (iTop || 4);
			oLineItems.d.results = oLineItems.d.results.slice(iSkip, iTop);
		}
		return oLineItems;
	}

	/**
	 * Creates a response header object containing only a <code>sap-message</code> property for
	 * the given messages.
	 *
	 * @param {number[]} [aMessageIndices]
	 *   The indices of messages to be used in the <code>sap-message</code> header; if not given,
	 *   all current messages are used
	 * @param {object} [oMessageObject=oCurrentMessages]
	 *   The current oMessageObject
	 * @returns {object}
	 *   A response header object containing the <code>sap-message</code> property for the given
	 *   messages
	 */
	function getMessageHeader(aMessageIndices, oMessageObject) {
		oMessageObject = oMessageObject || oCurrentMessages;
		return {
			"sap-message" : oMessageObject.buildString(aMessageIndices)
		};
	}

	/**
	 * Gets the fixtures for the mock server.
	 *
	 * @returns {object} The fixture and the RegExp fixture for the mock server
	 */
	function getMockServerFixtures() {
		return {
			mFixture : {
				"$metadata" : {
					source : "metadata.xml"
				},
				"$metadata?sap-language=EN" : {
					source : "metadata.xml"
				},

				/* Test Case I */
				"SalesOrderSet('101')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC1/SalesOrderSet.json"
				},
				"SalesOrderSet('101')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["error"].message;
						})
				}, {
					ifMatch : ithCall.bind(null, 2),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = "No message";
						})
				}, {
					ifMatch : ithCall.bind(null, 3),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["warning"].message;
						})
				}, {
					ifMatch : ithCall.bind(null, 4),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = "No message";
						})
				}, {
					ifMatch : ithCall.bind(null, 5),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["info"].message;
						})
				}, {
					ifMatch : ithCall.bind(null, 6),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = "No message";
						})
				}, {
					ifMatch : ithCall.bind(null, 7),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["success"].message;
						})
				}, {
					ifMatch : ithCall.bind(null, 8),
					message : getLineItems("Messages/TC1/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = "No message";
						})
				}, {
					source : "Messages/TC1/SalesOrderSet-ToLineItems.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='101',ItemPosition='010')" :
					getSaveResponseIncreasingCallCount(),
				"SalesOrderSet('101')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : getMessageHeader([0], oCurrentMessages.reset().add("error",
							"ToLineItems(SalesOrderID='101',ItemPosition='010')/Note")
						.add("warning",
							"ToLineItems(SalesOrderID='101',ItemPosition='010')/Note")
						.add("info",
							"ToLineItems(SalesOrderID='101',ItemPosition='010')/Note")
						.add("success",
							"ToLineItems(SalesOrderID='101',ItemPosition='010')/Note")),
					ifMatch : ithCall.bind(null, 1),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					ifMatch : ithCall.bind(null, 2),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					headers : getMessageHeader([1]),
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					ifMatch : ithCall.bind(null, 4),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					headers : getMessageHeader([2]),
					ifMatch : ithCall.bind(null, 5),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					ifMatch : ithCall.bind(null, 6),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					headers : getMessageHeader([3]),
					ifMatch : ithCall.bind(null, 7),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					ifMatch : ithCall.bind(null, 8),
					source : "Messages/TC1/SalesOrderSet.json"
				}, {
					ifMatch : function (request) {
						return true;
					},
					source : "Messages/TC1/SalesOrderSet.json"
				}],

				/* Test Case II */
				"SalesOrderSet('102')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC2/SalesOrderSet.json"
				},
				"SalesOrderSet('102')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC2/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["info"].message;
						})
				}, {
					ifMatch : ithCall.bind(null, 2),
					message : getLineItems("Messages/TC2/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["info"].message;
							aItems[1].Quantity = "1";
						})
				}, {
					ifMatch : ithCall.bind(null, 3),
					message : getLineItems("Messages/TC2/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["info"].message;
							aItems[1].Quantity = "1";
							aItems[1].Note = mMessageKey2MessageData["error"].message;
						})
				}, {
					source : "Messages/TC2/SalesOrderSet-ToLineItems.json"
				}],
				"SalesOrderSet('102')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					ifMatch : ithCall.bind(null, 1),
					source : "Messages/TC2/SalesOrderSet.json",
					headers : getMessageHeader([1], oCurrentMessages.reset().add("order",
							"ToLineItems(SalesOrderID='102',ItemPosition='020')/Quantity")
						.add("info", "ToLineItems(SalesOrderID='102',ItemPosition='010')/Note")
						.add("error", "ToLineItems(SalesOrderID='102',ItemPosition='020')/Note"))
				}, {
					ifMatch : ithCall.bind(null, 2),
					source : "Messages/TC2/SalesOrderSet.json",
					headers : getMessageHeader([0, 1])
				}, {
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC2/SalesOrderSet.json",
					headers : getMessageHeader()
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='102',ItemPosition='010')" :
					getSaveResponseIncreasingCallCount(),
				"MERGE SalesOrderLineItemSet(SalesOrderID='102',ItemPosition='020')" :
					getSaveResponseIncreasingCallCount(),

				/* Test Case II Section II */
				"SalesOrderSet('102.2')" : {
					source : "Messages/TC2/SalesOrderSet-2.json",
					headers : getMessageHeader(undefined, oCurrentMessages.reset().add("maintenance",
							"ToLineItems(SalesOrderID='102.2',ItemPosition='010')/ToProduct/ProductID"
						).add("error",
							"ToLineItems(SalesOrderID='102.2',ItemPosition='010')/Note"
						)),
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					}
				},
				"SalesOrderSet('102.2')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC2/SalesOrderSet-ToLineItems-2.json",
						function (aItems) {
							aItems[0].Note = "My error Message";
						})
				}, {
					source : "Messages/TC2/SalesOrderSet-ToLineItems-2.json"
				}],
				"SalesOrderSet('102.2')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : getMessageHeader([0]),
					ifMatch : ithCall.bind(null, 1),
					source : "Messages/TC2/SalesOrderSet-2.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='102.2',ItemPosition='010')" :
					getSaveResponseIncreasingCallCount(),

				/* Test Case III */
				/* More responses in the aRegExpFixture! */
				"SalesOrderSet('103')" : {
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("order", "ToLineItems(SalesOrderID='103',ItemPosition='010')/Quantity")
						.add("order", "ToLineItems(SalesOrderID='103',ItemPosition='030')/Quantity")
						.add("order", "ToLineItems(SalesOrderID='103',ItemPosition='050')/Quantity")
					),
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC3/SalesOrderSet-0.json"
				},
				"SalesOrder_FixQuantities?SalesOrderID='103'" : {
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("successFixAll", "(SalesOrderID='103',ItemPosition='010')/Quantity")
						.add("successFixAll", "(SalesOrderID='103',ItemPosition='030')/Quantity")
						.add("successFixAll", "(SalesOrderID='103',ItemPosition='050')/Quantity")
					),
					ifMatch : increaseSaveCount.bind(),
					message : getLineItems("Messages/TC3/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems.splice(3, 1);
							aItems.splice(1, 1);
							aItems.forEach(function (oItem) {
								oItem.GrossAmount = "2261.00";
								oItem.Quantity = "2";
							});
						})
				},
				"SalesOrderSet('103')?$select=ChangedAt,GrossAmount,SalesOrderID" : {
					source : "Messages/TC3/SalesOrderSet-1.json"
				},

				/* Test Case IV */
				/* More responses in the aRegExpFixture! */
				"SalesOrderSet('104')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC4/SalesOrderSet.json"
				},
				"SalesOrderSet('104')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : getMessageHeader([0], oCurrentMessages.reset().add("error",
							"ToLineItems(SalesOrderID='104',ItemPosition='010')/Note")
						.add("error", "(SalesOrderID='104',ItemPosition='010')/Note")
						.add("warning", "ToLineItems(SalesOrderID='104',ItemPosition='050')/Note")
						.add("warning", "(SalesOrderID='104',ItemPosition='050')/Note")),
					ifMatch : ithCall.bind(null, 1),
					source : "Messages/TC4/SalesOrderSet.json"
				}, {
					headers : getMessageHeader([0, 2]),
					ifMatch : ithCall.bind(null, 2),
					source : "Messages/TC4/SalesOrderSet.json"
				}, {
					source : "Messages/TC4/SalesOrderSet.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='104',ItemPosition='010')" :
					getSaveResponseIncreasingCallCount(),
				"MERGE SalesOrderLineItemSet(SalesOrderID='104',ItemPosition='050')" :
					getSaveResponseIncreasingCallCount(),

				/* Test Case V */
				"SalesOrderSet('105')" : {
					headers : getMessageHeader(undefined, oCurrentMessages.reset().add("error",
							"ToLineItems(SalesOrderID='105',ItemPosition='020')/Note")
						.add("info", "ToLineItems(SalesOrderID='105',ItemPosition='030')/Note")),
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC5/SalesOrderSet.json"
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4" : {
					source : "Messages/TC5/SalesOrderSet-ToLineItems.json"
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$filter=(SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27020%27)%20or%20(SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27030%27)" : {
					message : getLineItems("Messages/TC5/SalesOrderSet-ToLineItems.json",
						undefined, 1, 2)
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$filter=SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27020%27" : {
					message : getLineItems("Messages/TC5/SalesOrderSet-ToLineItems.json",
						undefined, 1, 1)
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$filter=SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27030%27" : {
					message : getLineItems("Messages/TC5/SalesOrderSet-ToLineItems.json",
						undefined, 2, 1)
				},

				/* Test Case VI */
				/* More responses in the aRegExpFixture! */
				"SalesOrderSet('106')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC6/SalesOrderSet.json"
				},
				"SalesOrderSet('106')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC6/SalesOrderSet-ToLineItems.json"
				}, {
					message : getLineItems("Messages/TC6/SalesOrderSet-ToLineItems.json",
						undefined, 0, 2)
				}],
				"SalesOrderSet('106')?$select=ChangedAt,GrossAmount,SalesOrderID" : {
					source : "Messages/TC6/SalesOrderSet.json"
				},
				"DELETE SalesOrderLineItemSet(SalesOrderID='106',ItemPosition='030')" : {
					code : 204,
					ifMatch : increaseSaveCount.bind()
				},
				"POST SalesOrderSet('106')/ToLineItems" : [{
					code : 400,
					ifMatch : function (oRequest) {
						iTimesSaved += 1;
						return iTimesSaved < 3;
					},
					source : "Messages/TC6/error-0.json"
				}, {
					code : 201,
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC6/SalesOrderLineItem.json"
				}],

				/* Test Case VII */
				"SalesOrderSet('107')" : {
					headers : getMessageHeader(undefined,
						oCurrentMessages.reset().add("system", undefined)),
					source : "Messages/TC7/SalesOrderSet.json"
				},
				"SalesOrderSet('107')/ToLineItems?$skip=0&$top=4" : [{
					source : "Messages/TC7/SalesOrderSet-ToLineItems.json"
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
					ifMatch : ithCall.bind(null, 1),
					source : "Messages/TC8/SalesOrderSet-ToLineItems-1.json"
				}, {
					ifMatch : ithCall.bind(null, 2),
					source : "Messages/TC8/SalesOrderSet-ToLineItems-2.json"
				}, {
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC8/SalesOrderSet-ToLineItems-3.json"
				}, {
					source : "Messages/TC8/SalesOrderSet-ToLineItems-0.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='108',ItemPosition='010')" : [{
					code : 204,
					ifMatch : increaseSaveCount.bind(),
					message : "no content"
				}],
				"SalesOrderSet('108')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : getMessageHeader(undefined, oCurrentMessages.reset().add(
							"warningMultiTarget",
							["ToLineItems(SalesOrderID='108',ItemPosition='010')/Quantity",
							"ToLineItems(SalesOrderID='108',ItemPosition='010')/Note"])),
					ifMatch : ithCall.bind(null, 2),
					source : "Messages/TC8/SalesOrderSet.json"
				}, {
					source : "Messages/TC8/SalesOrderSet.json"
				}],

				/* Test Case IX */
				"SalesOrderSet('109')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					source : "Messages/TC9/SalesOrderSet.json"
				},
				"SalesOrderSet('109')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					headers : getMessageHeader([0], oCurrentMessages.reset().add("order",
							"ToLineItems(SalesOrderID='109',ItemPosition='010')/Quantity")
						.add("successFix", "")),
					ifMatch : ithCall.bind(null, 1),
					source : "Messages/TC9/SalesOrderSet.json"
				}, {
					source : "Messages/TC9/SalesOrderSet.json"
				}],
				"SalesOrderSet('109')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC9/SalesOrderSet-ToLineItems.json",
						function (aItems) { aItems[0].Quantity = "1"; })
				}, {
					source : "Messages/TC9/SalesOrderSet-ToLineItems.json"
				}],
				"MERGE SalesOrderLineItemSet(SalesOrderID='109',ItemPosition='010')" :
					getSaveResponseIncreasingCallCount(),
				"POST SalesOrderItem_FixQuantity?ItemPosition='010'&SalesOrderID='109'" : {
					code : 200,
					headers : Object.assign(getMessageHeader([1]), {
						location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderLineItemSet"
							+ "(SalesOrderID='109',ItemPosition='010')"
					}),
					ifMatch : increaseSaveCount.bind(),
					source : "Messages/TC9/SalesOrderSet-ToLineItems.json"
				},
				/* Test Case X */
				"SalesOrderSet('110')" : {
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					},
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("infoCurrency",
							"ToLineItems(SalesOrderID='110',ItemPosition='010')/CurrencyCode")),
					source : "Messages/TC10/SalesOrderSet.json"
				},
				"SalesOrderSet('110')/ToLineItems?$skip=0&$top=4" : {
					source : "Messages/TC10/SalesOrderSet-ToLineItems.json"
				},

				/* Test Case XI */
				"SalesOrderSet('111')" : {
					ifMatch : function (request) {
						// start with 110 to be able respond properly for the GET request with the
						// content ID as resource path
						iTimesSaved = 110;
						return true;
					},
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("order",
							"ToLineItems(SalesOrderID='111',ItemPosition='010')/Quantity")),
					source : "Messages/TC11/SalesOrderSet.json"
				},
				"SalesOrderSet('111')/ToLineItems?$skip=0&$top=4" : [{
					ifMatch : ithCall.bind(null, 111),
					source : "Messages/TC11/SalesOrderSet-ToLineItems-2.json"
				}, {
					source : "Messages/TC11/SalesOrderSet-ToLineItems.json"
				}],
				"POST SalesOrderItem_Clone?ItemPosition='010'&SalesOrderID='111'" : {
					code : 200,
					ifMatch : increaseSaveCount.bind(),
					headers : {
						location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/SalesOrderLineItemSet"
							+ "(SalesOrderID='111',ItemPosition='020')"
					},
					source : "Messages/TC11/SalesOrderItem_Clone.json"
				}
			},
			aRegExpFixture : [{

				/* Test Case III */
				regExp :
					/GET .*\/SalesOrderSet\('103'\)\/ToLineItems\?\$skip=([0-4])&\$top=([0-4])/,
				response : [{
					buildResponse : function (aMatch, oResponse) {
						applySkipTop(aMatch, oResponse);
					},
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC3/SalesOrderSet-ToLineItems.json",
						function (aItems) { aItems[4].Quantity = "2"; })
				}, {
					buildResponse : function (aMatch, oResponse) {
						applySkipTop(aMatch, oResponse);
					},
					source : "Messages/TC3/SalesOrderSet-ToLineItems.json"
				}]
			}, {
				regExp : /GET .*\/SalesOrderSet\('103'\)\/ToLineItems\?\$skip=[5-9]&\$top=\d/,
				response : {
					message : { "d" : { "results" : []}}
				}
			}, {

				/* Test Case IV */
				regExp :
					/GET .*\/SalesOrderSet\('104'\)\/ToLineItems\?\$skip=([0-4])&\$top=([0-4])/,
				response : [{
					buildResponse : function (aMatch, oResponse) {
						applySkipTop(aMatch, oResponse);
					},
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC4/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["error"].message;
						})
				}, {
					buildResponse : function (aMatch, oResponse) {
						var oMessages = JSON.parse(oResponse["headers"]["sap-message"]),
							iSkip = parseInt(aMatch[1]);

						if (iSkip) {
							oResponse["headers"]["sap-message"] =
								JSON.stringify(oMessages.details[0]);
						} else {
							oMessages.details = [];
							oResponse["headers"]["sap-message"] = JSON.stringify(oMessages);
						}

						applySkipTop(aMatch, oResponse);
					},
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
								.add("error", "(SalesOrderID='104',ItemPosition='010')/Note")
								.add("warning", "(SalesOrderID='104',ItemPosition='050')/Note")),
					ifMatch : function (request) {
						var transientOnly =
							request["requestHeaders"]["sap-messages"] === "transientOnly";
						return iTimesSaved == 2 && !transientOnly;
					},
					message : getLineItems("Messages/TC4/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["error"].message;
							aItems[4].Note = mMessageKey2MessageData["warning"].message;
						})
				}, {
					buildResponse : function (aMatch, oResponse) {
						applySkipTop(aMatch, oResponse);
					},
					ifMatch : function (request) {
						var transientOnly =
							request["requestHeaders"]["sap-messages"] === "transientOnly";
						return iTimesSaved == 2 && transientOnly;
					},
					message : getLineItems("Messages/TC4/SalesOrderSet-ToLineItems.json",
						function (aItems) {
							aItems[0].Note = mMessageKey2MessageData["error"].message;
							aItems[4].Note = mMessageKey2MessageData["warning"].message;
						})
				}, {
					buildResponse : function (aMatch, oResponse) {
						applySkipTop(aMatch, oResponse);
					},
					source : "Messages/TC4/SalesOrderSet-ToLineItems.json"
				}]
			}, {
				regExp : /GET .*\/SalesOrderSet\('104'\)\/ToLineItems\?\$skip=[5-9]&\$top=\d/,
				response : {
					message : { "d" : { "results" : []}}
				}
			}, {

				/* Test Case VI and XI*/
				regExp :
					/GET .*\$id(?:-[0-9]+){2}\?\$expand=ToProduct%2CToHeader&\$select=ToProduct%2CToHeader/,
				response : [{
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("note", "Note").add("order", "Quantity")),
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC6/SalesOrderLineItem-ToProduct-ToHeader.json"
				}, { // used in Test Case XI
					headers : Object.assign(
						getMessageHeader(undefined,
							oCurrentMessages.reset().add("order", "Quantity")),
						{
							location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/"
								+ "SalesOrderLineItemSet(SalesOrderID='111',ItemPosition='020')"
						}),
					ifMatch : ithCall.bind(null, 111),
					source : "Messages/TC11/SalesOrderLineItem-ToProduct-ToHeader.json"
				}, {
					code : 400,
					source : "Messages/TC6/error-1.json"
				}]
			}]
		};
	}

	/**
	 * Gets the response object for a <code>MERGE</code> request and increments the current save
	 * counter if the request matches.
	 *
	 * @returns {object} The response object for a "save" button click
	 */
	function getSaveResponseIncreasingCallCount() {
		return {
			code : 204,
			ifMatch : increaseSaveCount.bind(),
			message : "no content"
		};
	}

	/**
	 * Increments the save counter and returns <code>true</code>; used as value for the
	 * <code>ifMatch</code> property of a mockserver fixture.
	 *
	 * @returns {boolean} <code>true</code>
	 */
	function increaseSaveCount() {
		iTimesSaved += 1;
		return true;
	}

	/**
	 * Whether the given call count matches the current save count; used as value for the
	 * <code>ifMatch</code> property of a mockserver fixture.
	 *
	 * @param {number} iCallCount
	 *   The number of the current response
	 * @returns {boolean}
	 *   Whether the call count is the same as the number of saves in the current
	 *   testcase
	 */
	function ithCall(iCallCount) {
		return iTimesSaved === iCallCount;
	}

	return ODataModel.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.SandboxModel", {
		constructor : function (mParameters) {
			var oMockServerFixtures, oModel, oSandbox;

			if (!TestUtils.isRealOData()) {
				oMockServerFixtures = getMockServerFixtures();
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, oMockServerFixtures.mFixture,
					"sap/ui/core/internal/samples/odata/v2/SalesOrders/data",
					"/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/", oMockServerFixtures.aRegExpFixture);
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