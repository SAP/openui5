/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/test/TestUtils"
], function (library, MessageBox, Messaging, Message, MessageType, Controller, Sorter, JSONModel,
		SubmitMode, TestUtils) {
	"use strict";

	var oSearchParams = new URLSearchParams(window.location.search),
		iEmptyRowCount = parseInt(oSearchParams.get("emptyRows") || "2"),
		LayoutType = library.LayoutType,
		bLegacy;

	return Controller.extend("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.Main", {
		oSelectedProduct : undefined,

		createAndSetDraft : function (oContext) {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			oView.getModel()
				.bindContext("SampleService.draftEdit(...)", oContext,
					{$$inheritExpandSelect : true})
				.invoke(undefined, false, false, true)
				.then(function (oRVC) {
					that.setPartsContext(oRVC);
				}).finally(function () {
					oView.setBusy(false);
				});
		},

		createInactiveProducts : function (iCount) {
			var oBinding = this.byId("products").getBinding("items"),
				i,
				that = this;

			function createEmptyRow() {
				var bAtEnd,
					oContext,
					oProductTable,
					oView;

				oView = that.getView();
				oProductTable = that.byId("products");
				bAtEnd = oBinding.isFirstCreateAtEnd() !== undefined;

				oContext = oBinding.create({}, false, bAtEnd, /*bInactive*/ true);
				oContext.created().then(function () {
					oView.setBusy(true);
					oProductTable.setSelectedItem(oProductTable.getItems()[oContext.getIndex()]);
					that.setPartsContext(oContext);
				}).catch(function (oError) {
					if (!oError.canceled) {
						throw oError; // unexpected error
					}
				}).finally(function () {
					oView.setBusy(false);
				});
			}

			for (i = 0; i < iCount; i += 1) {
				createEmptyRow();
			}
		},

		createInactiveParts : function (iCount) {
			var oBinding = this.byId("parts").getBinding("rows"),
				i;

			function createEmptyRow() {
				var oContext = oBinding.create({}, false, !bLegacy, /*bInactive*/true);

				oContext.created().catch(function (oError) {
					if (!oError.canceled) {
						throw oError; // unexpected error
					}
				});
			}

			for (i = 0; i < iCount; i += 1) {
				createEmptyRow();
			}
		},

		deleteInactiveRows : function (oBinding) {
			oBinding.getAllCurrentContexts().forEach(function (oContext) {
				if (oContext.isInactive()) {
					oContext.delete("$auto");
				}
			});
		},

		getNextSortOrder : function (bDescending) {
			var sNewIcon;

			// choose next sort order: no sort => ascending <-> descending
			if (bDescending) {
				sNewIcon = "sap-icon://sort-ascending";
				bDescending = false;
			} else {
				sNewIcon = "sap-icon://sort-descending";
				bDescending = true;
			}
			return {bDescending : bDescending, sNewIcon : sNewIcon};
		},

		onActivate : function (oEvent) {
			var oBinding = oEvent.getSource(),
				oContext = oEvent.getParameter("context"),
				oMessage = this.mCreateActivateMessages[oContext.getPath()],
				that = this;

			if (oContext.getProperty("ID") === null) {
				// do not activate context if no ID is given
				oEvent.preventDefault();
				if (!oMessage) { // eslint-disable-line logical-assignment-operators
					oMessage = this.mCreateActivateMessages[oContext.getPath()] = new Message({
						message : "ID must not be empty",
						type : MessageType.Warning,
						technical : true,
						processor : oContext.getModel(),
						target : oContext.getPath() + "/ID"
					});
				}
				Messaging.addMessages(oMessage);
			} else {
				Messaging.removeMessages(oMessage);
				delete this.mCreateActivateMessages[oContext.getPath()];

				setTimeout(function () { // there are sporadic issues without using setTimeout
					if (oBinding.getPath() === "/Products") {
						that.createInactiveProducts(1);
					} else {
						that.createInactiveParts(1);
					}
				});
			}
		},

		onCancel : function () {
			return this.getView().getModel().resetChanges();
		},

		onChangeRowCount : function (oEvent) {
			oSearchParams.set("emptyRows", oEvent.getParameter("selectedItem").getKey());
			window.location.search = oSearchParams.toString();
		},

		onDelete : function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext(),
				sEntity = oContext.getBinding().getPath() === "/Products" ? "product" : "part",
				sObjectId = oContext.getProperty("ID"),
				that = this;

			if (oContext.isInactive() === 1) {
				oContext.resetChanges();
				Messaging.removeMessages(this.mCreateActivateMessages[oContext.getPath()]);
				delete this.mCreateActivateMessages[oContext.getPath()];
			} else {
				MessageBox.confirm(
					"Do you really want to delete " + sEntity + " " + sObjectId + "?",
					function (sCode) {
						var oSelectedProduct;

						if (sCode === "OK") {
							oContext.delete("$auto");
							oSelectedProduct = that.getView().byId("products").getSelectedItem();
							// only close detail page if the deleted product was selected
							if (sEntity === "product" && oSelectedProduct
									&& oSelectedProduct.getBindingContext() === oContext) {
								that.oUIModel.setProperty("/sLayout", LayoutType.OneColumn);
							}
						}
					},
					"Confirm Deletion"
				);
			}
		},

		onExit : function () {
			this.deleteInactiveRows(this.getView().byId("parts").getBinding("rows"));
			this.deleteInactiveRows(this.getView().byId("products").getBinding("items"));
			this.oUIModel.destroy();
			Controller.prototype.onExit.apply(this);
		},

		onInit : function () {
			var oPartsBinding,
				oProductsBinding,
				oView = this.getView(),
				oModel = oView.getModel(),
				oSelectRowCount = oView.byId("rowCount_select"),
				that = this;

			bLegacy = TestUtils.retrieveData( // controlled by OPA
				"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.legacy")
				|| oSearchParams.get("legacy");

			this.mCreateActivateMessages = [];
			this.initMessagePopover("showMessages");
			this.oUIModel = new JSONModel({
				sActivity : "",
				bAPI : oModel.getGroupProperty(oModel.getUpdateGroupId(), "submit")
					=== SubmitMode.API,
				sLayout : LayoutType.OneColumn,
				iMessages : 0,
				bSortPartsQuantity : true,
				sSortPartsQuantityIcon : ""
			});

			oSelectRowCount.setSelectedKey("" + iEmptyRowCount);

			oView.setModel(this.oUIModel, "ui");
			oView.setModel(oModel, "headerContext0");
			oView.setModel(oModel, "headerContext1");
			oProductsBinding = oView.byId("products").getBinding("items");
			oProductsBinding.attachCreateActivate(this.onActivate, this);
			oProductsBinding.attachCreateSent(this.showSaving, this);
			oProductsBinding.attachCreateCompleted(this.showNothing, this);
			oProductsBinding.attachDataRequested(this.showLoading, this);
			oProductsBinding.attachDataReceived(this.showNothing, this);
			oProductsBinding.attachEventOnce("dataReceived",
				this.createInactiveProducts.bind(this, iEmptyRowCount)
			);
			oPartsBinding = oView.byId("parts").getBinding("rows");
			oPartsBinding.attachDataRequested(this.showLoading, this);
			oPartsBinding.attachDataReceived(this.showNothing, this);
			oPartsBinding.attachCreateActivate(this.onActivate, this);
			oPartsBinding.attachCreateSent(this.showSaving, this);
			oPartsBinding.attachCreateCompleted(this.showNothing, this);

			// attach an event handler to the data received event and create inactive rows inside
			oPartsBinding.attachDataReceived(function () {
				if (oPartsBinding.isFirstCreateAtEnd() === undefined) {
					that.createInactiveParts(iEmptyRowCount);
				}
			});

			this.byId("productsTitle").setBindingContext(
				oProductsBinding ? oProductsBinding.getHeaderContext() : null,
				"headerContext0"
			);
			this.byId("productsSelectAll").setBindingContext(
				oProductsBinding ? oProductsBinding.getHeaderContext() : null,
				"headerContext0"
			);
		},

		onRefresh : function () {
			this.getView().getModel().refresh();
		},

		onResetAll : function () {
			this.getView().getModel().resetChanges();
			this.removeCreateActivateMessages("Products");
			this.removeCreateActivateMessages("Parts");
		},

		onResetChangesForParts : function () {
			this.resetChangesForBinding("Parts", "rows");
		},

		onResetChangesForProducts : function () {
			this.resetChangesForBinding("Products", "items");
		},

		onSave : function () {
			var oView = this.getView(),
				oModel = oView.getModel();

			oView.setBusy(true);

			return oModel.submitBatch(oModel.getUpdateGroupId()).finally(function () {
				oView.setBusy(false);
			});
		},

		onSelectProduct : function (oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				oProduct;

			this.oSelectedProduct?.setSelected(false);

			if (oItem) {
				this.oSelectedProduct = oItem.getBindingContext();
				oProduct = this.oSelectedProduct.getObject();
				this.oSelectedProduct.setSelected(true);
				if (this.oSelectedProduct.isInactive()
					|| this.oSelectedProduct.isTransient()
					|| !oProduct) {
					this.setPartsContext(null);
				} else if (oProduct.IsActiveEntity) {
					this.createAndSetDraft(this.oSelectedProduct);
				} else {
					this.setPartsContext(this.oSelectedProduct);
				}
			}
		},

		onSortByPartsQuantity : function () {
			var oBinding = this.getView().byId("parts").getBinding("rows"),
				bDescending = this.oUIModel.getProperty("/bSortPartsQuantity"),
				oSortOrder;

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("quantity", oSortOrder.bDescending)
			);
			this.oUIModel.setProperty("/bSortPartsQuantity", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortPartsQuantityIcon", oSortOrder.sNewIcon);
		},

		resetChangesForBinding : function (sEntity, sBindingProperty) {
			this.getView().byId(sEntity.toLowerCase()).getBinding(sBindingProperty).resetChanges();
			this.removeCreateActivateMessages(sEntity);
		},

		removeCreateActivateMessages : function (sEntity) {
			var that = this;

			Object.keys(this.mCreateActivateMessages).forEach(function (sKey) {
				if (sKey.includes(sEntity + "($uid")) {
					Messaging.removeMessages(that.mCreateActivateMessages[sKey]);
					delete that.mCreateActivateMessages[sKey];
				}
			});
		},

		setPartsContext : function (oContext) {
			var oBinding = this.getView().byId("parts").getBinding("rows");

			this.getView().byId("parts").setBindingContext(oContext);
			this.byId("partsTitle").setBindingContext(
				oContext ? oBinding.getHeaderContext() : null,
				"headerContext1"
			);
			if (oContext) {
				this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
			} else {
				this.oUIModel.setProperty("/sLayout", LayoutType.OneColumn);
			}
		},

		showActivity : function (sActivity) {
			this.oUIModel.setProperty("/sActivity", sActivity);
		},

		showLoading : function () {
			this.showActivity("Loading");
		},

		showNothing : function () {
			this.showActivity("");
		},

		showSaving : function () {
			this.showActivity("Saving");
		}
	});
});
