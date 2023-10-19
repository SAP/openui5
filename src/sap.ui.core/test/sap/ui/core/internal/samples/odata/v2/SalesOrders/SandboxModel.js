/*!
 * ${copyright}
 */
// The SandboxModel is used in the manifest instead of OData V2 model for the following purposes:
// Certain constructor parameters are taken from URL parameters. For the "non-realOData" case, a
// mock server for the back-end requests is set up.
sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (merge, JSONModel, CountMode, OperationMode, ODataModel, TestUtils,
		sinon) {
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
		rContentID = /id(?:-[0-9]+){2}/,
		mContentID2Key = {}, // maps a content ID reference to key identifying the entity
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
	 * parameters from the url and stores it back in the response. If the parameter
	 * <code>$inlinecount=allpages</code> is not part of the url, the count will be removed from the
	 * response.
	 *
	 * @param {object[]} aMatch The match array from the matching URL containing the complete match,
	 *   the values of <code>$skip</code>, <code>$top</code> and optionally
	 *   <code>$inlinecount</code>.
	 * @param {object} oResponse The response which will be sent to the client
	 */
	function applySkipTopCount(aMatch, oResponse) {
		var bCount = aMatch[3] === "allpages",
			oResponseBody = JSON.parse(oResponse.message),
			aLineItems = oResponseBody.d.results,
			iSkip = parseInt(aMatch[1]),
			iTop = parseInt(aMatch[2]);

		if (!bCount) {
			delete oResponseBody.d.__count;
		}
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
				/* Messages: Test Case I */
				"SalesOrderSet('101')" : {
					source : "Messages/TC1/SalesOrderSet.json"
				},
				"SalesOrderSet('101')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
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

				/* Messages: Test Case II */
				"SalesOrderSet('102')" : {
					source : "Messages/TC2/SalesOrderSet.json"
				},
				"SalesOrderSet('102')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
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

				/* Messages: Test Case II Section II */
				"SalesOrderSet('102.2')" : {
					source : "Messages/TC2/SalesOrderSet-2.json",
					headers : getMessageHeader(undefined,
						oCurrentMessages.reset().add("maintenance",
							"ToLineItems(SalesOrderID='102.2',ItemPosition='010')/ToProduct/"
							+ "ProductID")
						.add("error", "ToLineItems(SalesOrderID='102.2',ItemPosition='010')/Note")),
					ifMatch : function (request) {
						iTimesSaved = 0;
						return true;
					}
				},
				"SalesOrderSet('102.2')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
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

				/* Messages: Test Case III */
				/* More responses in the aRegExpFixture! */
				"SalesOrderSet('103')" : {
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("order", "ToLineItems(SalesOrderID='103',ItemPosition='010')/Quantity")
						.add("order", "ToLineItems(SalesOrderID='103',ItemPosition='030')/Quantity")
						.add("order", "ToLineItems(SalesOrderID='103',ItemPosition='050')/Quantity")
					),
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

				/* Messages: Test Case IV */
				/* More responses in the aRegExpFixture! */
				"SalesOrderSet('104')" : {
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

				/* Messages: Test Case V */
				"SalesOrderSet('105')" : {
					headers : getMessageHeader(undefined, oCurrentMessages.reset().add("error",
							"ToLineItems(SalesOrderID='105',ItemPosition='020')/Note")
						.add("info", "ToLineItems(SalesOrderID='105',ItemPosition='030')/Note")),
					source : "Messages/TC5/SalesOrderSet.json"
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					source : "Messages/TC5/SalesOrderSet-ToLineItems.json"
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$filter=(SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27020%27)%20or%20(SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27030%27)&$inlinecount=allpages" : {
					message : getLineItems("Messages/TC5/SalesOrderSet-ToLineItems.json",
						undefined, 1, 2)
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$filter=SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27020%27&$inlinecount=allpages" : {
					message : getLineItems("Messages/TC5/SalesOrderSet-ToLineItems.json",
						undefined, 1, 1)
				},
				"SalesOrderSet('105')/ToLineItems?$skip=0&$top=4&$filter=SalesOrderID%20eq%20%27105%27%20and%20ItemPosition%20eq%20%27030%27&$inlinecount=allpages" : {
					message : getLineItems("Messages/TC5/SalesOrderSet-ToLineItems.json",
						undefined, 2, 1)
				},

				/* Messages: Test Case VI */
				/* More responses in the aRegExpFixture! */
				"SalesOrderSet('106')" : {
					source : "Messages/TC6/SalesOrderSet.json"
				},
				"SalesOrderSet('106')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
					source : "Messages/TC6/SalesOrderSet-ToLineItems-2.json"
				}],
				"SalesOrderSet('106')/ToLineItems?$skip=0&$top=4&$filter=not(SalesOrderID%20eq%20%27106%27%20and%20ItemPosition%20eq%20%27030%27)&$inlinecount=allpages" : [{
					source : "Messages/TC6/SalesOrderSet-ToLineItems-2.json"
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

				/* Messages: Test Case VII */
				"SalesOrderSet('107')" : {
					headers : getMessageHeader(undefined,
						oCurrentMessages.reset().add("system", undefined)),
					source : "Messages/TC7/SalesOrderSet.json"
				},
				"SalesOrderSet('107')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
					source : "Messages/TC7/SalesOrderSet-ToLineItems.json"
				}],

				/* Messages: Test Case VIII */
				"SalesOrderSet('108')" : {
					source : "Messages/TC8/SalesOrderSet.json"
				},
				"SalesOrderSet('108')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
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

				/* Messages: Test Case IX */
				"SalesOrderSet('109')" : {
					source : "Messages/TC9/SalesOrderSet.json"
				},
				"SalesOrderSet('109')?$expand=ToLineItems%2CToLineItems%2FToProduct" : {
					source : "Messages/TC9/SalesOrderSet_expand.json"
				},
				"SalesOrderSet('109')?$select=ChangedAt,GrossAmount,SalesOrderID" : {
					headers : getMessageHeader([0], oCurrentMessages.reset().add("order",
							"ToLineItems(SalesOrderID='109',ItemPosition='010')/Quantity")
						.add("successFix", "")),
					source : "Messages/TC9/SalesOrderSet.json"
				},
				"SalesOrderSet('109')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
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
				/* Messages: Test Case X */
				"SalesOrderSet('110')" : {
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("infoCurrency",
							"ToLineItems(SalesOrderID='110',ItemPosition='010')/CurrencyCode")),
					source : "Messages/TC10/SalesOrderSet.json"
				},
				"SalesOrderSet('110')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					source : "Messages/TC10/SalesOrderSet-ToLineItems.json"
				},

				/* Messages: Test Case XI */
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
				"SalesOrderSet('111')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : [{
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
				},

				/* ODataListBinding#create: Test Case I */
				"SalesOrderSet?$skip=0&$top=4&$orderby=SalesOrderID%20desc&$filter=LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID&$inlinecount=allpages" : [{
					ifMatch : ithCall.bind(null, 0),
					source : "ODLB.create/TC1/SalesOrderSet_desc_0-4.json"
				}, {
					ifMatch : ithCall.bind(null, 1),
					source : "ODLB.create/TC1/SalesOrderSet_desc_0-4_after_save.json"
				}],
				"SalesOrderSet?$skip=0&$top=4&$orderby=SalesOrderID%20asc&$filter=LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID" : [{
					ifMatch : ithCall.bind(null, 0),
					source : "ODLB.create/TC1/SalesOrderSet_asc_0-4.json"
				}, {
					ifMatch : ithCall.bind(null, 1),
					source : "ODLB.create/TC1/SalesOrderSet_asc_0-4_after_save.json"
				}],
				"SalesOrderSet?$skip=0&$top=4&$orderby=SalesOrderID%20desc&$filter=LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID" : {
					source : "ODLB.create/TC1/SalesOrderSet_desc_0-4_noCount.json"
				},
				"SalesOrderSet?$skip=0&$top=4&$orderby=SalesOrderID%20desc&$filter=substringof(%27SAP%27,CustomerName)%20and%20LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID&$inlinecount=allpages" : {
					source : "ODLB.create/TC1/SalesOrderSet_desc_0-4_SAP.json"
				},
				"SalesOrderSet?$skip=0&$top=4&$orderby=SalesOrderID%20desc&$filter=substringof(%27Talpa%27,CustomerName)%20and%20LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID&$inlinecount=allpages" : {
					source : "ODLB.create/TC1/SalesOrderSet_desc_0-4_Talpa.json"
				},
				"POST SalesOrderSet" : [{
					ifMatch : function (oRequest) {
						if (JSON.parse(oRequest.requestBody).Note === "4") {
							// all POST requests are contained in one $batch; increase the save
							// counter only with the last matching POST request
							iTimesSaved += 1;

							return true;
						}

						return false;
					},
					code : 201,
					source : "ODLB.create/TC1/SalesOrderSet_222.json"
				}, {
					ifMatch : function (oRequest) {
						return JSON.parse(oRequest.requestBody).Note === "2";
					},
					code : 201,
					source : "ODLB.create/TC1/SalesOrderSet_221.json"
				}, {
					ifMatch : function (oRequest) {
						return JSON.parse(oRequest.requestBody).Note === "1";
					},
					code : 201,
					source : "ODLB.create/TC1/SalesOrderSet_220.json"
				}, { // used in ODataListBinding#create: Test Case III
					ifMatch : function (oRequest) {
						return JSON.parse(oRequest.requestBody).Note === "C";
					},
					code : 201,
					source : "ODLB.create/TC3/SalesOrderSet_240.json"
				}],
				"SalesOrderSet('222')" : {
					source : "ODLB.create/TC1/SalesOrderSet_222.json"
				},
				"SalesOrderSet('222')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					message : { "d" : {"__count" : "0", "results" : []}}
				},
				"DELETE SalesOrderSet" : {code : 204},
				"GET SalesOrderSet?$skip=0&$top=4&$orderby=SalesOrderID%20desc&$filter=(substringof(%27Talpa%27,CustomerName)%20and%20LifecycleStatus%20eq%20%27N%27)%20and%20not(SalesOrderID%20eq%20%27220%27%20or%20SalesOrderID%20eq%20%27221%27%20or%20SalesOrderID%20eq%20%27222%27)&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID&$inlinecount=allpages" : {
					source : "ODLB.create/TC1/SalesOrderSet_desc_0-4_Talpa.json"
				},
				"SalesOrderSet?$skip=4&$top=3&$orderby=SalesOrderID%20asc&$filter=LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID" : {
					source : "ODLB.create/TC1/SalesOrderSet_asc_4-3_after_save.json"
				},

				/* ODataListBinding#create: Test Case II */
				"SalesOrderSet('230')" : {
					source : "ODLB.create/TC2/SalesOrder('230').json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=2&$orderby=ItemPosition%20desc" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4_desc.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=2&$orderby=ItemPosition%20asc" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4_asc.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=4&$orderby=ItemPosition%20asc&$filter=GrossAmount%20lt%201000m&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4_asc_filter.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=4&$orderby=ItemPosition%20asc&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=2&$top=4&$orderby=ItemPosition%20asc&$inlinecount=allpages" : {
					message : { "d" : {"__count" : "2", "results" : []}}
				},
				"SalesOrderSet('230')/ToLineItems?$skip=1&$top=1&$orderby=ItemPosition%20asc" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_1_1.json"
				},
				"SalesOrderSet('230.1')" : {
					source : "ODLB.create/TC2/SalesOrder('230.1').json"
				},
				"SalesOrderSet('230.1')/ToLineItems?$skip=0&$top=4&$orderby=ItemPosition%20asc&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230.1')_ToLineItems_0_4_count.json"
				},
				"SalesOrderSet('230')?$select=ChangedAt,GrossAmount,SalesOrderID" : [{
					ifMatch : ithCall.bind(null, 0),
					source : "ODLB.create/TC2/SalesOrder('230').json"
				}, {
					ifMatch : ithCall.bind(null, 1),
					source : "ODLB.create/TC2/SalesOrder('230')_after_save.json"
				}],
				"POST SalesOrderSet('230')/ToLineItems" : [{
					ifMatch : function (oRequest) {
						if (JSON.parse(oRequest.requestBody).Note === "4") {
							// all POST requests are contained in one $batch; increase the save
							// counter only with the last matching POST request
							iTimesSaved += 1;
							mContentID2Key[oRequest.requestHeaders["Content-ID"]] =
								"(SalesOrderID='230',ItemPosition='050')";

							return true;
						}

						return false;
					},
					code : 201,
					source : "ODLB.create/TC2/SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='050').json"
				}, {
					ifMatch : function (oRequest) {
						if (JSON.parse(oRequest.requestBody).Note === "2") {
							mContentID2Key[oRequest.requestHeaders["Content-ID"]] =
								"(SalesOrderID='230',ItemPosition='040')";

							return true;
						}

						return false;
					},
					code : 201,
					source : "ODLB.create/TC2/SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='040').json"
				}, {
					ifMatch : function (oRequest) {
						if (JSON.parse(oRequest.requestBody).Note === "1") {
							mContentID2Key[oRequest.requestHeaders["Content-ID"]] =
								"(SalesOrderID='230',ItemPosition='030')";

							return true;
						}

						return false;
					},
					code : 201,
					source : "ODLB.create/TC2/SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='030').json"
				}],
				"SalesOrderSet('230')/ToLineItems?$skip=1&$top=4&$orderby=ItemPosition%20desc&$filter=not((SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27030%27)%20or%20(SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27040%27)%20or%20(SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27050%27))&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_1_4_desc_after_save.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=1&$orderby=ItemPosition%20desc&$filter=not((SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27030%27)%20or%20(SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27040%27))" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_1_desc_after_save.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=1&$orderby=ItemPosition%20asc&$filter=not((SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27030%27)%20or%20(SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27040%27))" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_1.json"
				},
				"DELETE SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='050')" : {
					code : 204
				},
				"SalesOrderSet('230.1')/ToLineItems?$skip=0&$top=4&$orderby=ItemPosition%20desc&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230.1')_ToLineItems_0_4_count.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=4&$orderby=ItemPosition%20desc&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4_desc_after_save.json"
				},
				"SalesOrderSet('230')/ToLineItems?$skip=0&$top=4&$orderby=ItemPosition%20asc&$filter=not((SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27050%27)%20or%20(SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27040%27)%20or%20(SalesOrderID%20eq%20%27230%27%20and%20ItemPosition%20eq%20%27030%27))&$inlinecount=allpages" : {
					source : "ODLB.create/TC2/SalesOrder('230')_ToLineItems_0_4.json"
				},
				"SalesOrderSet('230.1')?$select=ChangedAt,GrossAmount,SalesOrderID" : {
					source : "ODLB.create/TC2/SalesOrder('230.1').json"
				},

				/* ODataListBinding#create: Test Case III */
				"SalesOrderSet?$skip=4&$top=1&$orderby=SalesOrderID%20desc&$filter=LifecycleStatus%20eq%20%27N%27&$select=CurrencyCode%2cCustomerName%2cGrossAmount%2cLifecycleStatus%2cNote%2cSalesOrderID" : {
					source : "ODLB.create/TC3/SalesOrderSet_desc_4-1.json"
				},
				"SalesOrderSet('205')" : {
					source : "ODLB.create/TC3/SalesOrder('205').json"
				},
				"SalesOrderSet('205')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					source : "ODLB.create/TC3/SalesOrder('205')_ToLineItems_0_4_count.json"
				},
				"SalesOrderSet('240')" : {
					source : "ODLB.create/TC3/SalesOrderSet_240.json"
				},
				"SalesOrderSet('240')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					message : { "d" : {"__count" : "0", "results" : []}}
				},

				/* ODataListBinding#create: Test Case IV */
				"SalesOrderSet('245')" : {
					source : "ODLB.create/TC4/SalesOrderSet('245').json"
				},
				"SalesOrderSet('245')/ToLineItems?$skip=0&$top=4&$inlinecount=allpages" : {
					source : "ODLB.create/TC4/SalesOrderSet('245')_ToLineItems_0_4_count.json"
				},
				"POST SalesOrderSet('245')/ToLineItems" : {
					code : 201,
					source : "ODLB.create/TC4/SalesOrderLineItemSet(SalesOrderID='245',ItemPosition='020').json"
				},
				"SalesOrderSet('245')?$select=ChangedAt,GrossAmount,SalesOrderID" : {
					source : "ODLB.create/TC4/SalesOrderSet('245')_after_save.json"
				}
			},
			aRegExpFixture : [{
				regExp : /GET .*\/\$metadata/,
				response : {
					ifMatch : function (request) {
						iTimesSaved = 0; // reset counter with each metadata request

						return true;
					},
					source : "../../../../../../qunit/odata/v2/data/ZUI5_GWSAMPLE_BASIC.metadata.xml"
				}
			}, {
				regExp : /GET .*\/SAP__Currencies\?/,
				response : {
					source : "../../../../../../qunit/odata/v2/data/SAP__Currencies.json"
				}
			}, {
				regExp : /GET .*\/SAP__UnitsOfMeasure\?/,
				response : {
					source : "../../../../../../qunit/odata/v2/data/SAP__UnitsOfMeasure.json"
				}
			}, {
				/* Messages: Test Case III */
				regExp :
					/GET .*\/SalesOrderSet\('103'\)\/ToLineItems\?\$skip=([0-4])&\$top=([0-4])(?:&\$inlinecount=(allpages))?/,
				response : [{
					buildResponse : function (aMatch, oResponse) {
						applySkipTopCount(aMatch, oResponse);
					},
					ifMatch : ithCall.bind(null, 1),
					message : getLineItems("Messages/TC3/SalesOrderSet-ToLineItems.json",
						function (aItems) { aItems[4].Quantity = "2"; })
				}, {
					buildResponse : function (aMatch, oResponse) {
						applySkipTopCount(aMatch, oResponse);
					},
					source : "Messages/TC3/SalesOrderSet-ToLineItems.json"
				}]
			}, {
				regExp : /GET .*\/SalesOrderSet\('103'\)\/ToLineItems\?\$skip=[5-9]&\$top=\d/,
				response : {
					message : { "d" : {"__count" : "0", "results" : []}}
				}
			}, {

				/* Messages: Test Case IV */
				regExp :
					/GET .*\/SalesOrderSet\('104'\)\/ToLineItems\?\$skip=([0-4])&\$top=([0-4])(?:&\$inlinecount=(allpages))?/,
				response : [{
					buildResponse : function (aMatch, oResponse) {
						applySkipTopCount(aMatch, oResponse);
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

						applySkipTopCount(aMatch, oResponse);
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
						applySkipTopCount(aMatch, oResponse);
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
						applySkipTopCount(aMatch, oResponse);
					},
					source : "Messages/TC4/SalesOrderSet-ToLineItems.json"
				}]
			}, {
				regExp : /GET .*\/SalesOrderSet\('104'\)\/ToLineItems\?\$skip=[5-9]&\$top=\d/,
				response : {
					message : { "d" : { "results" : []}}
				}
			}, {

				/* Messages: Test Case VI and XI*/
				regExp :
					/GET .*\$id(?:-[0-9]+){2}\?\$expand=ToProduct%2CToHeader&\$select=ToProduct%2CToHeader/,
				response : [{
					headers : getMessageHeader(undefined, oCurrentMessages.reset()
						.add("note", "Note").add("order", "Quantity")),
					ifMatch : ithCall.bind(null, 3),
					source : "Messages/TC6/SalesOrderLineItem-ToProduct-ToHeader.json"
				}, { // used in Messages: Test Case XI
					headers : Object.assign(
						getMessageHeader(undefined,
							oCurrentMessages.reset().add("order", "Quantity")),
						{
							location : "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/"
								+ "SalesOrderLineItemSet(SalesOrderID='111',ItemPosition='020')"
						}),
					ifMatch : ithCall.bind(null, 111),
					source : "Messages/TC11/SalesOrderLineItem-ToProduct-ToHeader.json"
				}, { // ODataListBinding#create: Test Case II
					ifMatch : function (oRequest) {
						return  mContentID2Key[oRequest.requestLine.match(rContentID)[0]] ===
							"(SalesOrderID='230',ItemPosition='030')";
					},
					source : "ODLB.create/TC2/SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='030')_expand.json"
				}, {
					ifMatch : function (oRequest) {
						return  mContentID2Key[oRequest.requestLine.match(rContentID)[0]] ===
							"(SalesOrderID='230',ItemPosition='040')";
					},
					source : "ODLB.create/TC2/SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='040')_expand.json"
				}, {
					ifMatch : function (oRequest) {
						return  mContentID2Key[oRequest.requestLine.match(rContentID)[0]] ===
							"(SalesOrderID='230',ItemPosition='050')";
					},
					source : "ODLB.create/TC2/SalesOrderLineItemSet(SalesOrderID='230',ItemPosition='050')_expand.json"
				}, { // default match
					code : 424,
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
			var oMockServerFixtures, oModel, sParameter, oSandbox, oUriParameters;

			if (!TestUtils.isRealOData()) {
				oMockServerFixtures = getMockServerFixtures();
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, oMockServerFixtures.mFixture,
					"sap/ui/core/internal/samples/odata/v2/SalesOrders/data",
					"/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/", oMockServerFixtures.aRegExpFixture);
			} else {
				mParameters = Object.assign({}, mParameters);
				oUriParameters = new URLSearchParams(window.location.search);
				sParameter = OperationMode[oUriParameters.get("operationMode")];
				if (sParameter) {
					mParameters.defaultOperationMode = sParameter;
				}
				sParameter = CountMode[oUriParameters.get("countMode")];
				if (sParameter) {
					mParameters.defaultCountMode = sParameter;
				}
			}

			// avoid caching the metadata to reset global counters when the metadata is requested
			ODataModel.mSharedData = {meta: {}, server: {}, service: {}};
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