jQuery.sap.require("sap.ui.demo.mdtemplate.view.BaseController");

sap.ui.demo.mdtemplate.view.BaseController.extend("sap.ui.demo.mdtemplate.view.Master", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit : function () {
			this.oList = this.byId("list");
			// keeps the filter and search state 
			this.oListFilterState = {
				filter : [],
				search : []
			};
			// keeps the group and sort state
			this.oListSorterState = {
				group : [],
				sort : []
			};

			// update the master list object counter after new data is loaded
			this.oList.attachEvent("updateFinished", function () {
				this._updateListItemCount();
			}, this);

			var oListSelector = this.getOwnerComponent().oListSelector;
			this.getRouter().getRoute("main").attachPatternMatched(oListSelector.selectAndScrollToFirstItem, oListSelector);
			this.getOwnerComponent().oListSelector.setBoundMasterList(this.oList);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for the master search field.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public 
		 */
		onSearch : function (oEvent) {
			var sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				this.oListFilterState.search = [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery)];
			} else {
				this.oListFilterState.search = [];
			}
			this._applyFilterSearch();
		},

		/**
		 * Event handler for the sorter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
		 * @public
		 */
		onSort : function (oEvent) {
			var sPath = oEvent.getParameter("selectedItem").getKey();

			this.oListSorterState.sort  = new sap.ui.model.Sorter(sPath, false);
			this._applyGroupSort();
		},

		/**
		 * Event handler for the filter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
		 * @public
		 */
		onFilter : function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey(),
				sValue = oEvent.getParameter("selectedItem").getText();

			switch (sKey) {
			case "Filter1":
				this.oListFilterState.filter = [new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.LE, 100)];
				break;
			case "Filter2":
				this.oListFilterState.filter = [new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.GT, 100)];
				break;
			default:
				this.oListFilterState.filter = [];
			}

			// update the filter bar
			this.byId("filterBar").setVisible(this.oListFilterState.filter.length > 0);
			this.byId("filterBarLabel").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterFilterBarText", [sValue]));

			this._applyFilterSearch();
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
					Group1 : "Rating",
					Group2 : "UnitNumber"
				};

			if (sKey !== "none") {
				this.oListSorterState.group = [new sap.ui.model.Sorter(oGroups[sKey], false, jQuery.proxy(sap.ui.demo.mdtemplate.util.groupers[sKey], oEvent.getSource()))];
			} else {
				this.oListSorterState.group = [];
			}
			this._applyGroupSort();
		},

		/**
		 * Event handler for the master list filter bar.
		 * @param {sap.ui.base.Event} oEvent the filter bar event
		 * @public
		 */
		onFilterBarPressed : function () {
			this.onOpenViewSettings(); // TODO: is re-use of this event handler allowed or should we create an internal _openViewSettings method
			// TODO: missing functionality, ViewSettingsDialog should open with the filter page directly
		},

		/**
		 * Event handler for the sort/group/filter button to open the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the press event
		 * @public
		 */
		onOpenViewSettings : function (oEvent) {
			if (!this.oViewSettingsDialog) {
				this.oViewSettingsDialog = sap.ui.xmlfragment("sap.ui.demo.mdtemplate.view.ViewSettingsDialog", this);
			}
			this.getView().addDependent(this.oViewSettingsDialog);
			this.oViewSettingsDialog.open();
		},

		/**
		 * Event handler for the ViewSettingsDialog cofirmation.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		//TODO: i am too long and i do too much am i tested? please refacor me!
		onConfirmViewSettingsDialog : function (oEvent) {
			var mParams = oEvent.getParameters(),
				sKey,
				sPath,
				bDescending,
				oGroups,
				aFilters = [],
				aValues = [];

			if (mParams.groupItem || mParams.sortItem) {
				// update grouping state
				if (mParams.groupItem) {
					sKey = mParams.groupItem.getKey();
					bDescending = mParams.groupDescending;
					oGroups = {
						Group1 : "Rating",
						Group2 : "UnitNumber"
					};
	
					this.oListSorterState.group = [new sap.ui.model.Sorter(oGroups[sKey], bDescending, sap.ui.demo.mdtemplate.util.groupers[sKey])];
				} else {
					this.oListSorterState.group = [];
				}
	
				// update sorting state
				if (mParams.sortItem) {
					sPath = mParams.sortItem.getKey();
					bDescending = mParams.sortDescending;
	
					this.oListSorterState.sort = [new sap.ui.model.Sorter(sPath, bDescending)];
				}

				this._applyGroupSort();
			}

			// update filter state
			if (mParams.filterItems) {
				// combine the filter array and the filter string
				jQuery.each(mParams.filterItems, function (i, oItem) {
					var sKey = oItem.getKey(),
						sValue = oItem.getText();

					switch (sKey) {
					case "Filter1":
						aFilters.push(new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.LE, 100));
						break;
					case "Filter2":
						aFilters.push(new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.GT, 100));
						break;
					}
					aValues.push(sValue);
				});
				this.oListFilterState.filter = aFilters;
			}

			// update the filter bar
			this.byId("filterBar").setVisible(this.oListFilterState.filter.length > 0);
			this.byId("filterBarLabel").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterFilterBarText", [aValues.join(", ")]));

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

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created 
		 * @param: {sap.m.ObjectListItem} oItem selected Item
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
		 * @private
		 */
		_updateListItemCount : function () {
			var iItems,
				sTitle;

			// only update the counter if the length is final 
			if (this.oList.getBinding('items').isLengthFinal()) {
				iItems = this.byId("list").getBinding("items").getLength();
				sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterTitleCount", [iItems]);

				this.byId("page").setTitle(sTitle);
			}
		},

		/*
		  * Internal helper method to apply both filter and search state together on the list binding
		  * @private
		  */
		_applyFilterSearch : function () {
			var aFilters = this.oListFilterState.search.concat(this.oListFilterState.filter);
			this.oList.getBinding("items").filter(aFilters, "Application");
		},

		/**
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @private
		 */ 
		_applyGroupSort : function () {
			var aSorters = this.oListSorterState.group.concat(this.oListSorterState.sort);
			this.oList.getBinding("items").sort(aSorters);
		}

	});