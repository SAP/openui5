/*global history */
sap.ui.define([
		"sap/ui/demo/orderbrowser/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/Sorter",
		"sap/m/GroupHeaderListItem",
		"sap/ui/Device",
		"sap/ui/demo/orderbrowser/model/formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator, Sorter, GroupHeaderListItem, Device, formatter) {
		"use strict";

		return BaseController.extend("sap.ui.demo.orderbrowser.controller.Master", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				// Control state model
				var oList = this.byId("list"),
					oViewModel = this._createViewModel(),
					// Put down master list's original value for busy indicator delay,
					// so it can be restored later on. Busy handling on the master list is
					// taken care of by the master list itself.
					iOriginalBusyDelay = oList.getBusyIndicatorDelay();


				this._oList = oList;
				// keeps the filter and search state
				this._oListFilterState = {
					aFilter : [],
					aSearch : []
				};

				this.setModel(oViewModel, "masterView");
				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oList.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for the list
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				});

				this.getView().addEventDelegate({
					onBeforeFirstShow: function () {
						this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
					}.bind(this)
				});

				this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
				this.getRouter().attachBypassed(this.onBypassed, this);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * After list data is available, this handler method updates the
			 * master list counter and hides the pull to refresh control, if
			 * necessary.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the master list object counter after new data is loaded
				this._updateListItemCount(oEvent.getParameter("total"));
				// hide pull to refresh if necessary
				this.byId("pullToRefresh").hide();
			},

			/**
			 * Event handler for the master search field. Applies current
			 * filter value and triggers a new search. If the search field's
			 * 'refresh' button has been pressed, no new search is triggered
			 * and the list binding is refresh instead.
			 * @param {sap.ui.base.Event} oEvent the search event
			 * @public
			 */
			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
					return;
				}

				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					this._oListFilterState.aSearch = [new Filter("Customer/CompanyName", FilterOperator.Contains, sQuery)];
				} else {
					this._oListFilterState.aSearch = [];
				}
				this._applyFilterSearch();

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				this._oList.getBinding("items").refresh();
			},

			/**
			 * Event handler for the list selection event
			 * @param {sap.ui.base.Event} oEvent the list selectionChange event
			 * @public
			 */
			onSelectionChange : function (oEvent) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			},

			/**
			 * Event handler for the bypassed event, which is fired when no routing pattern matched.
			 * If there was an object selected in the master list, that selection is removed.
			 * @public
			 */
			onBypassed : function () {
				this._oList.removeSelections(true);
			},

			/**
			 * Used to create GroupHeaders with non-capitalized caption.
			 * These headers are inserted into the master list to
			 * group the master list's items.
			 * @param {Object} oGroup group whose text is to be displayed
			 * @public
			 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
			 */
			createGroupHeader : function (oGroup) {
				return new GroupHeaderListItem({
					title : oGroup.text,
					upperCase : false
				});
			},

			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser history
			 * @public
			 */
			onNavBack : function() {
				history.go(-1);
			},

			/**
			 * Event handler for sorting of master list.
			 * We sort by the selected key = path in the data model. If the sort field is a date, we sort with descending order.
			 * @public
			 */
			onSort : function(oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
				var sKey = oSelectedItem.getKey();

				// Convention: The item key is the name of the entry in the data model to sort by.
				var sPath = sKey;
				var bDescending = false;

				// Show latest dates first.
				if(sKey === "OrderDate" || sKey === "ShippedDate") {
					bDescending = true;
				}

				var oSorter = new Sorter(sKey, bDescending);
				this._oList.getBinding("items").sort(oSorter);
			},

			// TODO document
			onFilter : function(oEvent) {
				// TODO implement
				sap.m.MessageToast.show("List filtering still to be implemented...");
			},

			/**
			 * Event handler for grouping of master list.
			 * Returns (where relevant: localized) group titles for the list.
			 * @public
			 */
			onGroup : function(oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
				var sKey = oSelectedItem.getKey();

				var oSorter = null;

				switch (sKey) {
				// Customer: Every customer gets their own group, with the group name being the customer name.
				case "CompanyName":
					oSorter = new Sorter("Customer/CompanyName", false, function(oContext) {
						var sCompanyName = oContext.getProperty("Customer/CompanyName");
    					return {
    						key: sCompanyName,
    						text: sCompanyName
    					};
					});
					break;
				// Order date: Grouping by period (= same year + month), in descending order.
				case "OrderPeriod":
					oSorter = new Sorter("OrderDate", true, function (oContext) {
						var oDate = oContext.getProperty("OrderDate"),
    						iYear = oDate.getFullYear(),
    						iMonth = oDate.getMonth() + 1;

    					return {
    						key: iYear + '/' + iMonth,
    						text: this.getResourceBundle().getText("masterGroupTitleOrderedInPeriod", [ iMonth, iYear ])
    					};
					}.bind(this));
					break;
				/*
				 * Shipping date: Grouping by period (= same year + month), in descending order.
				 * Note: If not yet shipped, field "ShippedDate" is empty. Due to server-side sorting, where an empty date
				 * is treated as the lowest possible date, orders without shipments are displayed at the very end of the list.
				 */ 
				case "ShippedPeriod":
					oSorter = new Sorter("ShippedDate", true, function (oContext) {
						var oDate = oContext.getProperty("ShippedDate");
						// Special handling needed because shipping date may be empty (=> not yet shipped).
						if(oDate != null) {
							var iYear = oDate.getFullYear(),
								iMonth = oDate.getMonth() + 1;
							
							return {
								key: iYear + '/' + iMonth,
								text: this.getResourceBundle().getText("masterGroupTitleShippedInPeriod", [ iMonth, iYear ])
							};
						}
						else {
							return {
								key: 0,
								text: this.getResourceBundle().getText("masterGroupTitleNotShippedYet")
							};
						}
					}.bind(this));
					break;
				case "NO_GROUPING":
				default:
					// Use default sorter. (TODO Keep in sync with sorted in view.xml!)
					oSorter = new Sorter("OrderID", false);
					break;
				}

				this._oList.getBinding("items").sort(oSorter);
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */


			_createViewModel : function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "OrderID",
					groupBy: "None"
				});
			},

			/**
			 * If the master route was hit (empty hash) we have to set
			 * the hash to to the first item in the list as soon as the
			 * listLoading is done and the first item in the list is known
			 * @private
			 */
			_onMasterMatched :  function() {
				this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
					function (mParams) {
						if (mParams.list.getMode() === "None") {
							return;
						}
						var sObjectId = mParams.firstListitem.getBindingContext().getProperty("OrderID");
						this.getRouter().navTo("object", {objectId : sObjectId}, true);
					}.bind(this),
					function (mParams) {
						if (mParams.error) {
							return;
						}
						this.getRouter().getTargets().display("detailNoObjectsAvailable");
					}.bind(this)
				);
			},

			/**
			 * Shows the selected item on the detail page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showDetail : function (oItem) {
				var bReplace = !Device.system.phone;
				this.getRouter().navTo("object", {
					objectId : oItem.getBindingContext().getProperty("OrderID")
				}, bReplace);
			},

			/**
			 * Sets the item count on the master list header
			 * @param {int} iTotalItems the total number of items in the list
			 * @private
			 */
			_updateListItemCount : function (iTotalItems) {
				var sTitle;
				// only update the counter if the length is final
				if (this._oList.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
					this.getModel("masterView").setProperty("/title", sTitle);
				}
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @private
			 */
			_applyFilterSearch : function () {
				var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
					oViewModel = this.getModel("masterView");
				this._oList.getBinding("items").filter(aFilters, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aFilters.length !== 0) {
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
				} else if (this._oListFilterState.aSearch.length > 0) {
					// only reset the no data text to default when no new search was triggered
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
				}
			},

			/**
			 * Internal helper method to apply both group and sort state together on the list binding
			 * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
			 * @private
			 */
			_applyGroupSort : function (aSorters) {
				this._oList.getBinding("items").sort(aSorters);
			},

			/**
			 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
			 * @param {string} sFilterBarText the selected filter value
			 * @private
			 */
			_updateFilterBar : function (sFilterBarText) {
				var oViewModel = this.getModel("masterView");
				oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
				oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
			}

		});

	}
);
