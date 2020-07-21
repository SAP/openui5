sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	'sap/ui/test/Opa5'
], function(Helper, EnterText, Press, Opa5) {
	"use strict";

	var iCurrentMessageCount,
		mMessageShort2Message = {
			empty : "",
			error : "Error: My error message",
			errorNoPrefix : "My error message",
			info : "Info: My info message",
			infoNoPrefix : "My info message",
			none : "No message",
			success : "Success: My success message",
			successNoPrefix : "My success message",
			warning : "Warning: My warning message",
			warningNoPrefix : "My warning message"
		},
		sViewName = "sap.ui.core.internal.samples.odata.v2.SalesOrders.Main";

	function pressButton(oOpa5, sId, bSearchOpenDialogs) {
		return Helper.pressButton(oOpa5, sViewName, sId, bSearchOpenDialogs);
	}

	Opa5.createPageObjects({
		onMainPage : {
			actions : {
				/*
				 * Changes the note of the item at the given position to a message from
				 * <code>mMessageShort2Message</code>.
				 *
				 * @param {number} iRow
				 *   The item position in the table, with the top being 0
				 * @param {string} sNewNote
				 *   A message shortcut refering to <code>mMessageShort2Message</code>
				 */
				changeItemNote : function (iRow, sNewNote) {
					return this.waitFor({
						id : "ToLineItems",
						matchers : function (oTable) {
							return oTable.getRows()[iRow].getCells()[7];
						},
						actions : new EnterText({text : mMessageShort2Message[sNewNote]}),
						viewName : sViewName
					});
				},
				/*
				 * Presses the Save button at the bottom of the page.
				 */
				pressSalesOrderSaveButton : function () {
					return pressButton(this, "saveSalesOrder");
				},
				/*
				 * Reads and stores the number of current messages shown on the message popover
				 * button.
				 */
				rememberCurrentMessageCount : function () {
					return this.waitFor({
						id : "messagePopoverButton",
						success : function (oButton) {
							iCurrentMessageCount = parseInt(oButton.getText());
						},
						viewName : sViewName
					});
				},
				/*
				 * Loads the specified sales order.
				 *
				 * @param {string} sSalesOrderId The sales order id
				 */
				showSalesOrder : function (sSalesOrderId) {
					return this.waitFor({
						id : "salesOrderID",
						actions : new EnterText({clearTextFirst : true, text : sSalesOrderId}),
						success : function () {
							pressButton(this, "selectSalesOrder");
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				},
				/*
				 * Opens or closes the Message Popover, respectively.
				 */
				toggleMessagePopover : function () {
					return pressButton(this, "messagePopoverButton");
				}
			},
			assertions : {
				/*
				 * Checks, if the message count has changed by a specified amount.
				 *
				 * @param {number} iX Amount by which the message count should be changed
				 */
				checkMessageCountHasChangedByX : function (iCount) {
					return this.waitFor({
						id : "messagePopoverButton",
						success : function (oButton) {
							var iNewMessageCount = parseInt(oButton.getText());
							Opa5.assert.equal(iCurrentMessageCount + iCount, iNewMessageCount,
								"The message count has been changed by " + iCount);
							iCurrentMessageCount += iCount;
						},
						viewName : sViewName
					});
				},
				/*
				 * Searches for the item position and a part of the message. Asserts ok if exactly
				 * one match has been found.
				 *
				 * @param {string} sItemPosition
				 *   The position of the item which will be searched for
				 * @param {string} sMessage
				 *   The whole message or a part of it, will be searched for
				 */
				checkMessageInPopover : function (sItemPosition, sMessage) {
					return this.waitFor({
						id : "messagePopover",
						success : function (oPopover) {
							var aMessages = oPopover._oMessageView.mAggregations.items;

							aMessages = (aMessages || []).filter(function (oMessage) {
								return oMessage.mProperties.title
									=== mMessageShort2Message[sMessage]
									&& oMessage.mProperties.subtitle.includes(sItemPosition);
							});

							switch (aMessages.length) {
								case 0:
									Opa5.assert.ok(false, "No fitting message displayed");
									break;
								case 1:
									Opa5.assert.ok(
										aMessages[0].mProperties.subtitle.includes(sItemPosition),
										"A message is displayed");
									break;
								default:
									Opa5.assert.ok(false, "Too many messages fit arguments");
									break;
							}
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if a specific message is not in the popover. Does so by looking for a
				 * combination of item position and a message string.
				 *
				 * @param {string} sItemPosition The item position property
				 * @param {string} sMessage The key of a message in
				 *   <code>mMessageShort2Message</code> which should not be shown
				 */
				checkMessageNotInPopover : function (sItemPosition, sMessageShort) {
					return this.waitFor({
						id : "messagePopover",
						success : function (oPopover) {
							var aMessages = oPopover._oMessageView.mAggregations.items;

							aMessages = (aMessages || []).filter(function (x) {
								return x.mProperties.title === mMessageShort2Message[sMessageShort]
									&& x.mProperties.subtitle.includes(sItemPosition);
							});

							switch (aMessages.length) {
								case 0:
									Opa5.assert.ok(true,
										"No message displayed for item " + sItemPosition);
									break;
								case 1:
									Opa5.assert.notOk(
										aMessages[0].mProperties.subtitle.includes(sItemPosition),
										"A message is displayed for item " + sItemPosition);
									break;
								default:
									Opa5.assert.ok(false, "Too many messages fit arguments");
									break;
							}
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the message popover has been opened.
				 */
				checkMessagePopoverOpen : function () {
					return this.waitFor({
						id : "messagePopover",
						success : function () {
							Opa5.assert.ok(true, "The message popover has opened");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the line items to the given sales order have been loaded. Does that by
				 * comparing the first line items <code>SalesOrderID</code> property in the table.
				 *
				 * @param {string} sSalesOrderId
				 *   The id of the sales order which is supposed to load
				 */
				checkSalesOrderItemsLoaded : function (sSalesOrderId) {
					return this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var sValue = oTable.getRows()[0].getCells()[0].getValue();

							Opa5.assert.strictEqual(sValue, sSalesOrderId,
								"The sales order items have been loaded");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the given sales order has been loaded.
				 *
				 * @param {string} sSalesOrderId
				 *   The id of the sales order which is supposed to load
				 */
				checkSalesOrderLoaded : function (sSalesOrderId) {
					return this.waitFor({
						id : "salesOrderID::objectPage",
						success : function (oField) {
							Opa5.assert.strictEqual(oField.getValue(), sSalesOrderId,
								"The sales order has been loaded");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the given row is highlighted in the correct color.
				 *
				 * @param {number} iRow The position of the item in the table
				 * @param {string} sExpectedValueState The expected value state of the note field
				 */
				checkTableRowHighlight : function (iRow, sExpectedValueState) {
					return this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var oRow = oTable.getRows()[iRow],
								//Row doesn't have a method getValueState(), is there a better way
								//to get the value state than the following?
								sValueState =
									oRow.mAggregations._settings.mProperties["highlight"];

							//Does testing for the valueState suffice? Or should the css classes
							//or similar be checked?
							Opa5.assert.equal(sValueState, sExpectedValueState,
								"The table row is highlighted in the correct color");
						},
						viewName : sViewName
					});
				},
				/*
				 * Checks if the note field has the correct value state. If it has, the border
				 * color and correct message will be displayed.
				 *
				 * @param {number} iRow The position of the item in the table
				 * @param {string} sExpectedValueState The expected value state of the note field
				 * @param {string} sMessageShort Key in <code>mMessageShort2Message</code> for the
				 *   expected text below the note field
				 */
				checkValueStateOfNoteField : function (iRow, sExpectedValueState,
					sMessageShort) {
					return this.waitFor({
						id : "ToLineItems",
						success : function (oTable) {
							var oNoteField = oTable.getRows()[iRow].getCells()[7];
							Opa5.assert.equal(oNoteField.getValueState(), sExpectedValueState,
								"The note field has the correct value state");
							Opa5.assert.equal(oNoteField.getValueStateText(),
								mMessageShort2Message[sMessageShort],
								"The note field has the correct value state");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});