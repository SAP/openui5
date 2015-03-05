sap.ui.define([
		"sap/ui/demo/mdtemplate/controller/BaseController"
	], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.mdtemplate.controller.Master", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit : function () {
			this._oList = this.byId("list");
			this.oPullToRefresh = this.byId("pullToRefresh");
			// keeps the filter and search state 
			this._oListFilterState = {
				aFilter : [],
				aSearch : []
			};
			// keeps the group and sort state
			this._oListSorterState = {
				aGroup : [],
				aSort : []
			};

			// Control state model
			this._oControlStateModel = new sap.ui.model.json.JSONModel({
				isFilterBarVisible : false,
				filterBarLabel : "",
				masterListTitle : this.getResourceBundle().getText("masterTitle")
			});
			this.setModel(this._oControlStateModel, 'controlStates');

			
			// master view has set the delay to 0, to make sure that busy
			// indication is displayed immediately after app has been started.
			// need to reset the display to default value after the app
			// and the list has been loaded for the first time.
			// this is done by setting the 'null' value
			var oListSelector = this.getOwnerComponent().oListSelector;
			oListSelector.oWhenListLoadingIsDone.then(function (mParams) {
					mParams.list.setBusyIndicatorDelay(null);
				},
				function (mParams) {
					mParams.list.setBusyIndicatorDelay(null);
				}
			);

			this.getRouter().getRoute("master").attachPatternMatched(oListSelector.selectFirstItem, oListSelector);
			this.getOwnerComponent().oListSelector.setBoundMasterList(this._oList);
			this.getRouter().attachBypassed(this.onBypassed, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		
		/**
		 * After list data is available, this handler method updates the
		 * master list counter and hides the pull to refresh control, if
		 * necessary.
		 * 
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public 
		 */
		onUpdateFinished : function (oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));
			// hide pull to refresh if necessary
			this.oPullToRefresh.hide();
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * 
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

			if (sQuery && sQuery.length > 0) {
				this._oListFilterState.aSearch  = [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery)];
			} else {
				this._oListFilterState.aSearch  = [];
			}
			this._applyFilterSearch();
			
		},
		
		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * 
		 * @public 
		 */
		onRefresh : function () {
			this._oList.getBinding("items").refresh();
		},

		/**
		 * Event handler for the sorter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
		 * @public
		 */
		onSort : function (oEvent) {
			var sPath = oEvent.getParameter("selectedItem").getKey();

			this._oListSorterState.aSort   = new sap.ui.model.Sorter(sPath, false);
			this._applyGroupSort();
		},

		
		/**
		 * Event handler for the grouper selection.
		 * @param {sap.ui.base.Event} oEvent the search field event
		 * @public
		 */
		onGroup : function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey(),
				// TODO: make this better!
				oGroups = {
					Group1 : "UnitNumber",
					Group2 : "Name"
				};

			if (sKey !== "None") {
				this._oListSorterState.aGroup = [new sap.ui.model.Sorter(oGroups[sKey], false, 
						sap.ui.demo.mdtemplate.model.grouper[sKey].bind(oEvent.getSource()))];
			} else {
				this._oListSorterState.aGroup = [];
			}
			this._applyGroupSort();
		},


		/**
		 * Event handler for the filter button to open the ViewSettingsDialog.
		 * which is used to add or remove filters to the master list. This 
		 * handler method is also called when the filter bar is pressed,
		 * which is added to the beginning of the master list when a filter is applied.
		 *
		 * @param {sap.ui.base.Event} oEvent the press event
		 * @public
		 */
		onOpenViewSettings : function (oEvent) {
			if (!this.oViewSettingsDialog) {
				this.oViewSettingsDialog = sap.ui.xmlfragment("sap.ui.demo.mdtemplate.view.ViewSettingsDialog", this);
				this.getView().addDependent(this.oViewSettingsDialog);
			}
			this.oViewSettingsDialog.open();
		},

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters
		 * are applied to the master list, which can also mean that the currently 
		 * applied filters are removed from the master list, in case the filter
		 * settings are removed in the ViewSettingsDialog.
		 * 
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog : function (oEvent) {
			var aFilterItems = oEvent.getParameters().filterItems,
				aFilters = [],
				aCaptions = [];
			
			// update filter state:
			// combine the filter array and the filter string
			aFilterItems.forEach(function (oItem) {
				switch (oItem.getKey()) {
				case "Filter1":
					aFilters.push(new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.LE, 100));
					break;
				case "Filter2":
					aFilters.push(new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.GT, 100));
					break;
				}
				aCaptions.push(oItem.getText());
			});
			this._oListFilterState.aFilter = aFilters;
			
			this._updateFilterBar(aCaptions.join(", "));
			this._applyFilterSearch();
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelect : function (oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			// TODO: is this distinction really necessary anymore???
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * 
		 * @param {sap.ui.base.Event} oEvent the bypassed event
		 * @public
		 */
		onBypassed : function (oEvent) {
			this._oList.removeSelections(true);
		},
		
		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to 
		 * group the master list's items.
		 * 
		 * @param {Object} oGroup group whose 
		 * @public
		 */
		createGroupHeader: function (oGroup){
			return new sap.m.GroupHeaderListItem( {
				title: oGroup.text,
				upperCase: false
			});
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = !jQuery.device.is.phone;
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ObjectID")
			}, bReplace);
		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} the total number of items in the list
		 * @private
		 */
		_updateListItemCount : function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final 
			if (this._oList.getBinding('items').isLengthFinal()) {
				if (iTotalItems){
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				} else {
					//Display 'Objects' instead of 'Objects (0)'
					sTitle = this.getResourceBundle().getText("masterTitle");
				}
				this._oControlStateModel.setProperty("/masterListTitle", sTitle);
			}
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch : function () {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter);
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				this._oList.setNoDataText(this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else  {
				this._oList.setNoDataText(this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @private
		 */
		_applyGroupSort : function () {
			var aSorters = this._oListSorterState.aGroup.concat(this._oListSorterState.aSort);
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param String the selected filter value
		 * @private
		 */
		_updateFilterBar : function (sValue) {
			this._oControlStateModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			this._oControlStateModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sValue]));
		}

	});

}, /* bExport= */ true);
