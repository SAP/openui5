/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (Log, MessageBox, MessageToast, Controller, Filter, Sorter, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.AnalyzeTravel_RAP.AnalyzeTravel_RAP", {
		onActivate : async function () { //TODO: factor out code common w/ onEdit, onDiscard?
			const oContext = this.byId("selectTravel").getSelectedItem()?.getBindingContext();
			if (!oContext) {
				MessageToast.show("No travel selected");
				return;
			}
			const oView = this.getView();
			oView.setBusy(true);
			try {
				//TODO: preparation might have side effects, activation could fail...
				const [, oActiveContext] = await Promise.all([
					oView.getModel().bindContext(
							"com.sap.gateway.srvd.zee_ui_travel_editanly_d_d.v0001.Prepare(...)",
							oContext)
						.invoke(), // Note: no return value
					oView.getModel().bindContext(
							"com.sap.gateway.srvd.zee_ui_travel_editanly_d_d.v0001.Activate(...)",
							oContext, {$$inheritExpandSelect : true})
						// Note: ignore ETag in case preparation has side effects
						.invoke("$auto", /*bIgnoreETag*/true, /*fnOnStrictHandlingFailed*/null,
							/*bReplaceWithRVC*/true)
				]);

				this.onChangeTravel(null, oActiveContext);
				MessageToast.show("Activate action invoked successfully");
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oView.setBusy(false);
			}
		},

		onBookingStatusChanged : function (oEvent) {
			oEvent.getSource().getBindingContext().requestSideEffects(["BookingStatusText"]);
		},

		onChangeGrandTotal : function (vEventOrSelectedKey) {
			const sGrandTotalAtBottomOnly = typeof vEventOrSelectedKey === "string"
				? vEventOrSelectedKey
				: vEventOrSelectedKey.getSource().getSelectedKey();
			const oTable = this.byId("table");

			oTable.getRowMode().setFixedTopRowCount(
				["", "false"].includes(sGrandTotalAtBottomOnly) ? 1 : 0);
			oTable.getRowMode().setFixedBottomRowCount(
				["false", "true"].includes(sGrandTotalAtBottomOnly) ? 1 : 0);
			switch (sGrandTotalAtBottomOnly) {
				case "":
					this._oAggregation.grandTotalAtBottomOnly = undefined;
					break;

				case "false":
					this._oAggregation.grandTotalAtBottomOnly = false;
					break;

				case "true":
					this._oAggregation.grandTotalAtBottomOnly = true;
					break;

				// case "off":
				// no default
			}
			this._oAggregation.aggregate.FlightPrice.grandTotal = sGrandTotalAtBottomOnly !== "off";

			oTable.getBinding("rows").setAggregation(this._oAggregation);
		},

		onChangeTravel : function (oEvent, oContext) {
			const oSource = oEvent?.getSource();
			oContext ??= oSource.toString().includes("ODataListBinding")
				? oSource.getAllCurrentContexts()[0]
				: oSource.getSelectedItem().getBindingContext();
			const oView = this.getView();
			oView.setBindingContext(oContext);
			oView.setModel(oView.getModel(), "header");
			oView.setBindingContext(this.byId("table").getBinding("rows").getHeaderContext(),
				"header");
		},

		onCreate : function (_oEvent, bAtEnd, bInactive) {
			const oListBinding = this.byId("table").getBinding("rows");
			oListBinding.create({
				CurrencyCode : "USD", // needed by ABAP
				FlightPrice : "" + oListBinding.getLength() // Edm.Decimal
			}, /*bSkipRefresh*/true, bAtEnd, bInactive);
		},

		onDeleteBooking : async function () {
			const oView = this.getView();
			oView.setBusy(true);
			try {
				await this.byId("details").getBindingContext().delete();

				MessageToast.show("Booking deleted successfully");
				this.byId("details").setBindingContext(null);
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oView.setBusy(false);
			}
		},

		onDeleteBookingViaModel : async function () {
			const oView = this.getView();
			oView.setBusy(true);
			const oContext = this.byId("details").getBindingContext();
			try {
				await oContext.getModel()
					// code under test (JIRA: CPOUI5ODATAV4-3460)
					// Note: passing oContext is for a different use case!
					.delete(oContext.getCanonicalPath(), "$single", /*bRejectIfNotFound*/true);

				MessageToast.show("Booking deleted successfully");
				this.byId("details").setBindingContext(null);
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oView.setBusy(false);
			}
		},

		onDiscard : async function () { //TODO: factor out code common w/ onEdit?
			const oContext = this.byId("selectTravel").getSelectedItem()?.getBindingContext();
			if (!oContext) {
				MessageToast.show("No travel selected");
				return;
			}
			const oView = this.getView();
			oView.setBusy(true);
			try {
				const oActiveContext = await oView.getModel()
					.bindContext("SiblingEntity(...)", oContext, {$$inheritExpandSelect : true})
					.invoke("$auto", /*bIgnoreETag*/false, /*fnOnStrictHandlingFailed*/null,
						/*bReplaceWithRVC*/true);
				this.onChangeTravel(null, oActiveContext);

				await oView.getModel().bindContext(
						"com.sap.gateway.srvd.zee_ui_travel_editanly_d_d.v0001.Discard(...)",
						oContext)
					.invoke();

				MessageToast.show("Discard action invoked successfully");
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oView.setBusy(false);
			}
		},

		onDownload : async function () {
			const sUrl = await this.byId("table").getBinding("rows").requestDownloadUrl();

			window.open(sUrl, sUrl);
		},

		onEdit : async function () {
			const oContext = this.byId("selectTravel").getSelectedItem()?.getBindingContext();
			if (!oContext) {
				MessageToast.show("No travel selected");
				return; //TODO: can this ever happen?
			}
			const oView = this.getView();
			oView.setBusy(true);
			try {
				const oDraftContext = await oView.getModel() //TODO: who destroys this ODCB?
					.bindContext("com.sap.gateway.srvd.zee_ui_travel_editanly_d_d.v0001.Edit(...)",
						oContext, {$$inheritExpandSelect : true})
					.setParameter("PreserveChanges", true) //TODO: do we ever need false here?
					.invoke("$auto", /*bIgnoreETag*/false, /*fnOnStrictHandlingFailed*/null,
						/*bReplaceWithRVC*/true);
				MessageToast.show("Edit action invoked successfully");
				this.onChangeTravel(null, oDraftContext);
			} catch (oError) {
				MessageBox.error(oError.message);
			} finally {
				oView.setBusy(false);
			}
		},

		onExit : function () {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		onInit : function () {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				var oURLSearchParams = new URLSearchParams(window.location.search),
					bBookingID = oURLSearchParams.has("BookingID"),
					sFilter = oURLSearchParams.get("filter"),
					sGrandTotalAtBottomOnly = oURLSearchParams.get("grandTotalAtBottomOnly"),
					sGroupLevels = oURLSearchParams.get("groupLevels"),
					oJsonModel,
					sSort = oURLSearchParams.get("sort"),
					sSubtotalsAtBottomOnly = oURLSearchParams.get("subtotalsAtBottomOnly"),
					oTable = this.byId("table"),
					sThreshold = oURLSearchParams.get("threshold") || "100",
					oRowsBinding = oTable.getBinding("rows"),
					sVisibleRowCount = oURLSearchParams.get("visibleRowCount");

				oJsonModel = new JSONModel({
					// NO @$ui5.context.isOutdated
					bBookingID : bBookingID,
					iMessages : 0,
					sSearch : "",
					iVisibleRowCount : parseInt(sVisibleRowCount) || 20
				});
				this.getView().setModel(oJsonModel, "ui");
				this.getView().setModel(oJsonModel, "header"); // until #onChangeTravel takes over
				this.getView().setBindingContext(oJsonModel.createBindingContext("/"), "header");

				this.initMessagePopover("showMessages");

				this.getView().getModel().getMetaModel().requestValueListInfo(
						"/ZEE_C_ANALYZE_TRAVEL_D_D/_AnalyzeBooking/BookingStatus",
						/*bAutoExpandSelect*/true)
					.then((mValueListInfo) => {
						this.getView().setModel(mValueListInfo[""].$model, "bookingStatus");
					});

				this.byId("details").setBindingContext(null);

				//TODO: remove this workaround once ETags work fine
				this.getView().getModel().setIgnoreETag(true);

				this._oAggregation = {
					aggregate : {
						FlightPrice : {
							grandTotal : true,
							subtotals : true,
							unit : "CurrencyCode"
						}
					},
					group : {
						AirlineID : {additionally : ["CarrierName"]},
						BookingStatus : {
							additionally : ["BookingStatusText"]
						},
						CustomerID : {
							additionally : ["CustomerName"]
						}
					},
					groupLevels : ["AirlineID", "ConnectionID", "FlightDate", "BookingStatus",
						"CustomerID", "TravelUUID", "BookingDate"]
				};
				if (bBookingID) { // leaf level is individual bookings
					this._oAggregation.group.BookingUUID = {
						additionally : ["BookingID", "IsActiveEntity"]
					};
					this._oAggregation.groupLevels.push("BookingUUID");
				}
				if (sGroupLevels !== null) {
					this._oAggregation.groupLevels.forEach((sGroupLevel) => {
						// ensure that all groups are defined to avoid drill-down errors
						this._oAggregation.group[sGroupLevel] ??= {};
					});
					if (sGroupLevels === "") {
						delete this._oAggregation.groupLevels;
					} else {
						this._oAggregation.groupLevels = sGroupLevels.split(",");
					}
				}
				if (sThreshold) {
					oTable.setThreshold(parseInt(sThreshold));
				}
				if (!["", "false", "off", "true"].includes(sGrandTotalAtBottomOnly)) {
					sGrandTotalAtBottomOnly = ""; // ignore invalid values
				}
				// Note: no "change" event fired!
				this.byId("grandTotalAtBottomOnly").setSelectedKey(sGrandTotalAtBottomOnly);
				this.onChangeGrandTotal(sGrandTotalAtBottomOnly);
				if (sSubtotalsAtBottomOnly === "off") {
					this._oAggregation.aggregate.FlightPrice.subtotals = false;
				} else if (sSubtotalsAtBottomOnly) {
					this._oAggregation.subtotalsAtBottomOnly = sSubtotalsAtBottomOnly === "true";
				}
				oRowsBinding.setAggregation(this._oAggregation);
				if (sFilter) { // e.g. "status EQ B,Distance BT 1000 5000"
					oRowsBinding.filter(sFilter.split(",").map(function (sSingleFilter) {
						var aPieces = sSingleFilter.split(" ");

						return new Filter({
							path : aPieces[0],
							operator : aPieces[1],
							value1 : aPieces[2],
							value2 : aPieces[3]
						});
					}));
				}
				if (sSort) {
					oRowsBinding.sort(sSort.split(",").map((sSingleSort) => {
						const aPieces = sSingleSort.split(" ");

						return new Sorter({
							path : aPieces[0],
							descending : aPieces[1] === "desc"
						});
					}));
				}

				this.byId("selectTravel").getBinding("items")
					.attachEventOnce("dataReceived", this.onChangeTravel.bind(this));
			}, this);
		},

		onRefresh : function () {
			this.byId("table").getBinding("rows").refresh();
		},

		onRefreshBooking : function () {
			this.byId("details").getBindingContext().refresh();
		},

		onRefreshBookingViaSideEffects : function () {
			this.byId("details").getBindingContext().requestSideEffects([""]);
		},

		onRefreshFlightDate : function () {
			this.byId("details").getBindingContext().requestSideEffects(["FlightDate"]);
		},

		onRefreshFlightPrice : function () {
			this.byId("details").getBindingContext().requestSideEffects(["FlightPrice"]);
		},

		onSearch : function () {
			this._oAggregation.search
				= this.getView().getModel("ui").getProperty("/sSearch");
			this.byId("table").getBinding("rows").setAggregation(this._oAggregation);
		},

		onShowDetails : function (oEvent) {
			const oDetails = this.byId("details");
			oDetails.getBindingContext()?.setKeepAlive(false);

			const oContext = oEvent.getSource().getBindingContext();
			oContext.setKeepAlive(true);
			oDetails.setBindingContext(oContext);
		},

		onShowSelection : function () {
			const oListBinding = this.byId("table").getBinding("rows");
			const bSelectAll = oListBinding.getHeaderContext().isSelected();
			const aPaths = oListBinding.getAllCurrentContexts()
				.filter((oContext) => oContext.isSelected() !== bSelectAll)
				.map((oContext) => oContext.getPath());
			MessageBox.information((bSelectAll ? "All except " : "") + aPaths.join("\n"),
				{title : "Selected Rows"});

			oListBinding.getAllCurrentContexts().forEach((oContext) => {
				const bSelectedGetter = oContext.isSelected();
				const bSelectedProperty = oContext.getProperty("@$ui5.context.isSelected") ?? false;
				if (bSelectedGetter !== bSelectedProperty) {
					Log.warning(`${bSelectedGetter} vs. ${bSelectedProperty}`, oContext,
						this.getMetadata().getName());
				}
			});
		},

		onToggleCount : function (oEvent) {
			const bCount = oEvent.getSource().getSelected();
			const oListBinding = this.byId("table").getBinding("rows");
			oListBinding.changeParameters({$count : bCount});
		}
	});
});
