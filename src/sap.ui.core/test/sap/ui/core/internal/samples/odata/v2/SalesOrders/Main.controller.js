/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/message/Message",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/odata/ODataUtils"
], function (Log, encodeURL, MessageBox, MessageToast, coreLibrary, Core, Element, Message,
		Controller, Filter, FilterOperator, Sorter, ODataUtils) {
	"use strict";
	var sClassname = "sap.ui.core.internal.samples.odata.v2.SalesOrders.Main.controller",
		MessageType = coreLibrary.MessageType;

	return Controller.extend("sap.ui.core.internal.samples.odata.v2.SalesOrders.Main", {
		/**
		 * Clears persistent or technical messages from the message model.
		 *
		 * @param {boolean} bUnboundOnly Whether only unbound messages are removed
		 */
		clearPersistentMessages : function (bUnboundOnly) {
			var aMessages = this.getView().getModel("messages").getObject("/");

			Core.getMessageManager().removeMessages(aMessages.filter(function (oMessage) {
				return (oMessage.technical || oMessage.persistent)
					&& (!bUnboundOnly || !oMessage.target);
			}));
		},

		handleMessageChange : function (oEvent) {
			var aMessages = oEvent.getParameter("newMessages"),
				sMessageText,
				aPersistentMessages = aMessages.filter(function (oMessage) {
					return oMessage.getPersistent()
						// don't show success messages in a popup dialog
						&& oMessage.getType() !== MessageType.Success;
				}).sort(Message.compare);

			if (!aPersistentMessages.length) {
				return;
			}

			sMessageText = aPersistentMessages.map(function (oMessage) {
				return oMessage.getMessage();
			}).join(";\n");
			MessageBox[aPersistentMessages[0].getType().toLowerCase()](sMessageText);
		},

		onCloneItem : function (oEvent) {
			var oView = this.getView(),
				oModel = oView.getModel(),
				oTable = oView.byId("ToLineItems"),
				oSelectedItem = oTable.getContextByIndex(oTable.getSelectedIndex()).getObject(),
				sSalesOrderID = oSelectedItem.SalesOrderID,
				sSalesOrderItemPosition = oSelectedItem.ItemPosition,
				sItem = "\"" + sSalesOrderID + " / " + sSalesOrderItemPosition + "\"";

			oModel.callFunction("/SalesOrderItem_Clone", {
				adjustDeepPath : function (mParameters) {
					var aPathSegments = mParameters.response.headers.location.split("/"),
						sEntityKey = aPathSegments[aPathSegments.length - 1],
						sKeyPredicate = sEntityKey.slice(sEntityKey.indexOf("("));

					return "/SalesOrderSet('" + sSalesOrderID + "')/ToLineItems" + sKeyPredicate;
				},
				expand : "ToProduct,ToHeader",
				method : "POST",
				success : MessageToast.show.bind(null, "Successfully cloned item " + sItem),
				urlParameters : {
					ItemPosition : encodeURL(sSalesOrderItemPosition),
					SalesOrderID : encodeURL(sSalesOrderID)
				}
			});
		},

		onCloseCreatedItemDialog : function () {
			this.byId("createSalesOrderItemDialog").close();
		},

		onCloseMessageDetails : function (oEvent) {
			var oMessageDetails = this.byId("messageDetails");

			oMessageDetails.setBindingContext(null);
			oMessageDetails.close();
		},

		onCloseProductDetails : function () {
			this.byId("productDetailsDialog").close();
		},

		onCreateItem : function () {
			var oBindingContext = this.byId("objectPage").getBindingContext(),
				oCreatedContext,
				oCreateDialog = this.byId("createSalesOrderItemDialog");

			oCreatedContext = this.byId("ToLineItems").getBinding("rows").create({
				DeliveryDate : new Date(Date.now() + 14 * 24 * 3600000),
				Note : "Created by OData V2 Sales Orders App",
				ProductID : "HT-1000",
				Quantity : "1",
				QuantityUnit : "EA",
				SalesOrderID : oBindingContext.getProperty("SalesOrderID")
			}, /*bAtEnd*/false, {
				error : function (oError) {
					Log.info("Error Handler: Failed to created sales order item",
						JSON.stringify(oError), sClassname);
				},
				expand : "ToProduct,ToHeader",
				success : function (/*oData, oResponse*/) {
					Log.info("Success Handler: Sales order item creation was successful",
						oCreatedContext.getPath(), sClassname);
				}
			});

			oCreatedContext.created().then(function () {
				var sMessage = "Created sales order item '"
						+ oCreatedContext.getProperty("ItemPosition") + "'";

				Log.info(sMessage, oCreatedContext.getPath(), sClassname);
				MessageBox.success(sMessage);
			}, function () {
				var sMessage = "Discarded sales order item creation";

				Log.info(sMessage, oCreatedContext.getPath(), sClassname);
				MessageToast.show(sMessage);
			}).finally(function () {
				oCreateDialog.close();
			});
			oCreateDialog.setBindingContext(oCreatedContext);
			oCreateDialog.open();
		},

		onCreateSalesOrder : function () {
			var oCreatedContext = this.byId("SalesOrderSet").getBinding("items").create({
					CustomerID : "0100000000",
					LifecycleStatus : "N"
				}, /*bAtEnd*/false);

			oCreatedContext.created().then(function () {
				MessageToast.show("Created sales order "
					+ oCreatedContext.getProperty("SalesOrderID"));
			}, function (oError) {
				MessageToast.show("Deleted transient sales order");
			});
		},

		onDeleteItem : function () {
			var sSalesOrderLineItem,
				oTable = this.byId("ToLineItems"),
				oItemContext = oTable.getContextByIndex(oTable.getSelectedIndex()),
				that = this;

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}

				if (oItemContext.isTransient()) {
					oItemContext.getModel().resetChanges([oItemContext.getPath()], undefined, true);
				} else {
					oItemContext.getModel().remove("", {
						context : oItemContext,
						success : function () {
							MessageToast.show("Deleted sales order item " + sSalesOrderLineItem);
							oTable.clearSelection();
						}
					});
					that.readSalesOrder();
				}
			}

			sSalesOrderLineItem = oItemContext.getProperty("SalesOrderID", true) + " / "
				+ (oItemContext.getProperty("ItemPosition", true)
					|| oItemContext.getProperty("Note", true)
					|| "newly created item");
			MessageBox.confirm("Do you really want to delete: " + sSalesOrderLineItem + "?",
				onConfirm, "Sales Order Item Deletion");
		},

		onDeleteSalesOrder : function () {
			var sMessage, sSalesOrderID,
				oTable = this.byId("SalesOrderSet"),
				oContext = oTable.getSelectedContexts()[0],
				that = this;

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}

				that.getView().byId("objectPage").unbindElement();
				if (oContext.isTransient()) {
					oContext.getModel().resetChanges([oContext.getPath()], undefined, true);
				} else {
					oContext.getModel().remove("", {
						context : oContext,
						success : function () {
							MessageToast.show("Deleted sales order " + sSalesOrderID);
						}
					});
				}
			}

			sSalesOrderID = oContext.getProperty("SalesOrderID", true)
				|| oContext.getProperty("Note", true)
				|| "the newly created sales order";
			sMessage = "Do you really want to delete: " + sSalesOrderID + "?";
			MessageBox.confirm(sMessage, onConfirm, "Sales Order Deletion");
		},

		onDiscardCreatedItem : function () {
			var oCreatedContext = this.byId("createSalesOrderItemDialog").getBindingContext();

			this.getView().getModel().resetChanges([oCreatedContext.getPath()], undefined, true);
		},

		onFilterMessages : function (oEvent) {
			var oBinding = this.byId("ToLineItems").getBinding("rows"),
				fnFilter,
				oSelect = oEvent.getSource(),
				sMessageType = oSelect.getSelectedKey();

			if (sMessageType !== "Show all") {
				if (sMessageType !== "With any message") {
					fnFilter = function (oMessage) {
						return oMessage.type === sMessageType;
					};
				}
				oBinding.requestFilterForMessages(fnFilter).then(function (oFilter) {
					if (!oFilter) {
						MessageBox.information("There is no item with a message of type '"
							+ sMessageType + "'; showing all items");
						oSelect.setSelectedKey(MessageType.None);
					}
					oBinding.filter(oFilter);
				});
			} else {
				oBinding.filter();
			}
		},

		onFilterSalesOrdersTable : function (oEvent) {
			var oView = this.getView(),
				sFilterValue = oView.getModel("ui").getProperty("/salesOrdersFilter"),
				aFilter = sFilterValue
					? [new Filter("CustomerName", FilterOperator.Contains, sFilterValue)]
					: [];

			// use FilterType.Control to combine it with the filters defined in the Main.view.xml
			oView.byId("SalesOrderSet").getBinding("items").filter(aFilter);
		},

		onFixAllQuantities : function (oEvent) {
			var oView = this.getView(),
				oModel = oView.getModel(),
				sSalesOrderID = oEvent.getSource().getBindingContext().getProperty("SalesOrderID"),
				that = this;

			oModel.callFunction("/SalesOrder_FixQuantities", {
				adjustDeepPath : function () {
					return "/SalesOrderSet('" + sSalesOrderID + "')/ToLineItems";
				},
				method : "GET",
				success : function () {
					MessageToast.show("Successfully fixed all quantities for sales order "
						+ sSalesOrderID);
					// Server may process GET requests in different order, so we have to ensure that
					// the function import is processed first
					that.readSalesOrder();
				},
				urlParameters : {
					SalesOrderID : encodeURL(sSalesOrderID)
				}
			});
		},

		onFixQuantity : function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(),
				sItemPosition = oBindingContext.getProperty("ItemPosition"),
				oModel = this.getView().getModel(),
				sSalesOrderID = oBindingContext.getProperty("SalesOrderID");

			if (oBindingContext.isTransient()) {
				MessageToast.show("Cannot fix quantity as item is not yet persisted");
				return;
			}
			oModel.callFunction("/SalesOrderItem_FixQuantity", {
				groupId : "FixQuantity",
				method : "POST",
				refreshAfterChange : false,
				success : function () {
					MessageToast.show("Successfully fixed the quantity for item " + sItemPosition);
				},
				urlParameters : {
					ItemPosition : encodeURL(sItemPosition),
					SalesOrderID : encodeURL(sSalesOrderID)
				}
			});
			// read requests for side-effects
			this.readSalesOrder("FixQuantity");

			oModel.submitChanges({groupId : "FixQuantity"});
		},

		onInit : function () {
			var oRowSettings = this.byId("rowsettings"),
				oModel = this.getView().getModel();

			oModel.attachMessageChange(this.handleMessageChange, this);

			// adding the formatter dynamically is a prerequisite that it is called with the control
			// as 'this'
			oRowSettings.bindProperty("highlight", {
				parts : [
					'messages>/',
					'' // ensure formatter is called on scrolling
				],
				formatter : this.rowHighlight
			});
		},

		onMessagePopoverClosed : function () {
			this.clearPersistentMessages(true);
		},

		onMessagePopoverPress : function (oEvent) {
			this.getView().byId("messagePopover").toggle(oEvent.getSource());
		},

		onMessageSelected : function (oEvent) {
			var oMessage = oEvent.getParameter("item").getBindingContext("messages").getObject(),
				oControl = Element.registry.get(oMessage.getControlId());

			if (oControl) {
				this.getView().byId("page").scrollToElement(oControl.getDomRef(), 200, [0, -100]);
				setTimeout(function(){
					oControl.focus();
				}, 300);
			}
		},

		onRefreshItems : function () {
			this.getView().byId("ToLineItems").getBinding("rows").refresh();
		},

		onRefreshSalesOrders : function () {
			this.getView().byId("SalesOrderSet").getBinding("items").refresh();
		},

		onResetChanges : function () {
			this.getView().getModel().resetChanges(/*aPath*/undefined, /*bAll*/true,
				/*bDeleteCreatedEntities*/true);
		},

		onSaveCreatedItem : function () {
			this.getView().getModel().submitChanges();
		},

		onSaveSalesOrder : function () {
			var oView = this.getView(),
				sSalesOrder = oView.getModel("ui").getProperty("/salesOrderID");

			// ensure that the read request is in the same batch
			this.readSalesOrder("changes");
			this.clearPersistentMessages();
			oView.getModel().submitChanges({
				success : function (oResultData) {
					var bHasMessages = false;

					if (oResultData) {
						bHasMessages = oResultData.__batchResponses.some(function (oBatchResponse) {
							return oBatchResponse.message;
						});
					}
					if (!bHasMessages) {
						MessageToast.show("Sales order '" + sSalesOrder + "' successfully saved");
					}
				}
			});
		},

		onSelectItem : function () {
			this.getView().getModel("ui").setProperty("/itemSelected",
				!!this.byId("ToLineItems").getSelectedIndices().length);
		},

		onSelectSalesOrder : function (oEvent) {
			var oBindingContext, sContextPath, bIsTransient, sSalesOrderID,
				oView = this.getView(),
				oTable = oView.byId("ToLineItems"),
				oUiModel = oView.getModel("ui");

			if (oEvent && oEvent.sId === "selectionChange") {
				oBindingContext = oEvent.getParameter("listItem").getBindingContext("SalesOrders");
				bIsTransient = oBindingContext.isTransient();
				sSalesOrderID = oBindingContext.getProperty("SalesOrderID") || "";
				oUiModel.setProperty("/salesOrderSelected", true);
				oUiModel.setProperty("/salesOrderID", sSalesOrderID);
				sContextPath = oBindingContext.getPath();
			} else {
				sSalesOrderID = encodeURL(oUiModel.getProperty("/salesOrderID"));
				sContextPath =
					"/SalesOrderSet(" + ODataUtils.formatValue(sSalesOrderID, "Edm.String") + ")";
			}

			// do unbind first to ensure that the sales order is read again even if sales order ID
			// did not change
			oView.byId("objectPage").unbindElement();

			// reset filter for items with messages
			if (!bIsTransient) {
				oTable.getBinding("rows").filter();
				oView.byId("itemFilter").setSelectedKey("Show all");
			}

			oView.byId("objectPage").bindElement(sContextPath, {createPreliminaryContext : true});
			this.readSalesOrder(); // ensure that messages get updated
			oTable.clearSelection();
			oView.byId("messagePopover").getBinding("items")
				.filter([
					new Filter("fullTarget", FilterOperator.StartsWith, sContextPath),
					new Filter("fullTarget", FilterOperator.EQ, "")
				]);
		},

		onShowMessageDetails : function (oEvent) {
			var oContext = oEvent.getSource().getObjectBinding("messages").getBoundContext(),
				oMessageDetails = this.byId("messageDetails");

			oMessageDetails.setBindingContext(oContext, "messages");
			oMessageDetails.open();
		},

		onShowProductDetails : function (oEvent) {
			var oDialog = this.byId("productDetailsDialog");

			oDialog.setBindingContext(oEvent.getParameter("row").getBindingContext());
			oDialog.open();
		},

		onShowTable : function () {
			var oUiModel = this.getView().getModel("ui");

			oUiModel.setProperty("/useTable", !oUiModel.getProperty("/useTable"));
			// set the named model, so the table only requests data once it is shown
			this.getView().setModel(this.getView().getModel(), "SalesOrders");
		},

		onSortSalesOrdersTable : function (oEvent) {
			var sKey = oEvent.getSource().getSelectedKey(),
				oListBinding = this.getView().byId("SalesOrderSet").getBinding("items");

			oListBinding.sort(new Sorter("SalesOrderID", sKey === "desc"));
		},

		onTransitionMessagesOnly : function (oEvent) {
			var bTransitionMessagesOnly = oEvent.getSource().getPressed();

			this.getView().byId("ToLineItems").bindRows({
				events : {change : this.onUpdateSalesOrderItemsCount.bind(this)},
				parameters : {
					transitionMessagesOnly : bTransitionMessagesOnly,
					usePreliminaryContext : true
				},
				path : "ToLineItems"
			});
			if (bTransitionMessagesOnly) {
				// the order of the calls for the object page and the list are not deterministic;
				// if only transition messages shall be returned with table requests, refresh the
				// object page to get all messages; in the other case object page must not be
				// refreshed
				this.onSelectSalesOrder();
			}
		},

		onUpdateSalesOrderItemsCount : function () {
			var iCount,
				oSalesOrderItemsBinding = this.byId("ToLineItems").getBinding("rows"),
				oUIModel = this.getView().getModel("ui");

			if (oSalesOrderItemsBinding) {
				iCount = oSalesOrderItemsBinding.getCount();
				// we don't support .../$count property bindings
				oUIModel.setProperty("/salesOrderItemsCount", iCount === undefined ? "??" : iCount);
			}
		},

		onUpdateSalesOrdersCount : function () {
			var iCount,
				oSalesOrdersBinding = this.byId("SalesOrderSet").getBinding("items"),
				oUIModel = this.getView().getModel("ui");

			if (oSalesOrdersBinding) {
				iCount = oSalesOrdersBinding.getCount();
				// we don't support .../$count property bindings
				oUIModel.setProperty("/salesOrdersCount", iCount === undefined ? "??" : iCount);
			}
		},

		readSalesOrder : function (sGroupId) {
			var oView = this.getView(),
				oBindingContext = oView.byId("objectPage").getBindingContext();

			if (!oBindingContext || oBindingContext.isTransient()) {
				// for a transient context the resources of the read request cannot be determined
				return;
			}

			oView.getModel().read("", {
				context : oBindingContext,
				groupId : sGroupId,
				updateAggregatedMessages : true,
				urlParameters : {
					// key property and properties that might be affected by side effects
					$select : ["ChangedAt", "GrossAmount", "SalesOrderID"]
				}
			});
		},

		/**
		 * Formatter for the row highlight property.
		 * The parts of the corresponding composite binding just give the point in time when to
		 * update the row highlight. The formatter function parameters for messages resp. row data
		 * are not needed to compute the highlight property.
		 *
		 * @returns {sap.ui.core.MessageType} The message type for the row highlight or undefined in
		 *   case the formatter is called when the row has no binding context yet.
		 */
		rowHighlight : function (/*aMessages, oRowData*/) {
			var aMessages,
				//formatter MUST be defined in a way that this is the control!
				oRowContext = this.getBindingContext();

			if (oRowContext) { // formatter is called with oRowContext null initially
				aMessages = oRowContext.getMessages();
				return aMessages.length ? aMessages[0].type : sap.ui.core.MessageType.None;
			}

			return undefined;
		},

		updateMessageCount : function () {
			var oView = this.getView(),
				oMessagePopoverBinding = oView.byId("messagePopover").getBinding("items");

			oView.getModel("ui").setProperty("/messageCount", oMessagePopoverBinding.getLength());
		}
	});
});