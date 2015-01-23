jQuery.sap.require("sap.ui.demo.mdskeleton.util.Controller");

sap.ui.demo.mdskeleton.util.Controller.extend("sap.ui.demo.mdskeleton.view.Master", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		* Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		*/
		onInit : function () {
			var oEventBus = this.getEventBus();

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

			// TODO : replace this with something else ???? promise?????
			// fire an event after the list is loaded for the first time to update the detail page
			this.oInitialLoadFinishedDeferred = jQuery.Deferred();
			this.oList.attachEventOnce("updateFinished", function () {
				this.oInitialLoadFinishedDeferred.resolve();
				oEventBus.publish("Master", "InitialLoadFinished", {
					bindingContext : this.oList.getItems()[0].getBindingContext()
				});
			}, this);

			// update the master list object counter after new data is loaded
			this.oList.attachEvent("updateFinished", function () {
				this._updateListItemCount();
				this.oList.setBusy(false);
			}, this);

			// skip master list update on phones, the pages are independet from eachother in the phone pattern
			if (sap.ui.Device.system.phone) {
				return;
			}

			// event setup for desktop and tablet devices
			this.getRouter().getRoute("main").attachPatternMatched(this.onRouteMatched, this);
			oEventBus.subscribe("Detail", "Changed", this.onDetailChanged, this);
			oEventBus.subscribe("Detail", "NotFound", this.onNotFound, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/*
		 * Event listener for the route matched event. The matching detail page will be loaded automatically.
		 * @param {sap.ui.base.Event} oEvent the routing event
		 */
		onRouteMatched : function (oEvent) {
			// load the detail view in desktop
			// TODO: replace with target (new routing feature)
			this.getRouter().myNavToWithoutHash({ 
				currentView : this.getView(),
				targetViewName : "sap.ui.demo.mdskeleton.view.Detail",
				targetViewType : "XML"
			});
	
			// wait for the list to be loaded once
			this._waitForInitialListLoading(function () {
				// on the empty hash select the first item
				this._selectFirstItem();
			});
		},

		/* 
		 * Event handler for the master search field.
		 * @param {sap.ui.base.Event} oEvent the search event
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

		/* 
		 * Event handler for the sorter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
		 */
		onSort : function (oEvent) {
			var sPath = oEvent.getParameter("selectedItem").getKey();

			this.oListSorterState.sort  = new sap.ui.model.Sorter(sPath, false);
			this._applyGroupSort();
		},

		/* 
		 * Event handler for the filter selection.
		 * @param {sap.ui.base.Event} oEvent the select event
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

		/* 
		 * Event handler for the grouper selection.
		 * @param {sap.ui.base.Event} oEvent the search field event
		 */
		onGroup : function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey(),
				// TODO: make this better!
				oGroups = {
					Group1 : "Rating",
					Group2 : "UnitNumber"
				};

			if (sKey !== "none") {
				this.oListSorterState.group = [new sap.ui.model.Sorter(oGroups[sKey], false, jQuery.proxy(sap.ui.demo.mdskeleton.util.groupers[sKey], oEvent.getSource()))];
			} else {
				this.oListSorterState.group = [];
			}
			this._applyGroupSort();
		},

		/* 
		 * Event handler for the master list filter bar.
		 * @param {sap.ui.base.Event} oEvent the filter bar event
		 */
		onFilterBarPressed : function () {
			this.onOpenViewSettings(); // TODO: is re-use of this event handler allowed or should we create an internal _openViewSettings method
			// TODO: missing functionality, ViewSettingsDialog should open with the filter page directly
		},

		/* TODO: do we want comments like this in md-skeleton???
		 *  SortGroupFilter can either be impplemented as single selects
		 *  or one View Settings Dialog. Use the respective code blocks 
		 *  to implement custom functionality
		 */

		/* 
		 * Event handler for the sort/group/filter button to open the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the press event
		 */
		onOpenViewSettings : function (oEvent) {
			if (!this.oViewSettingsDialog) {
				this.oViewSettingsDialog = sap.ui.xmlfragment("sap.ui.demo.mdskeleton.view.ViewSettingsDialog", this);
			}
			this.getView().addDependent(this.oViewSettingsDialog);
			this.oViewSettingsDialog.open();
		},

		/* 
		 * Event handler for the ViewSettingsDialog cofirmation.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 */
		onConfirmViewSettingsDialog : function (oEvent) {
			var mParams = oEvent.getParameters(),
				sKey,
				sPath,
				bDescending,
				oGroups,
				aFilters = [],
				sFilters = "";

			if (mParams.groupItem || mParams.sortItem) {
				if (mParams.groupItem) {
					sKey = mParams.groupItem.getKey();
					bDescending = mParams.groupDescending;
					oGroups = {
						Group1 : "Rating",
						Group2 : "UnitNumber"
					};
	
					this.oListSorterState.group = [new sap.ui.model.Sorter(oGroups[sKey], bDescending, sap.ui.demo.mdskeleton.util.groupers[sKey])];
				} else {
					this.oListSorterState.group = [];
				}
	
				if (mParams.sortItem) {
					sPath = mParams.sortItem.getKey();
					bDescending = mParams.sortDescending;
	
					this.oListSorterState.sort = [new sap.ui.model.Sorter(sPath, bDescending)];
				}

				this._applyGroupSort();
			}

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
					sFilters += sValue + ", ";
				});
				this.oListFilterState.filter = aFilters;
				sFilters = sFilters.substr(0, sFilters.length - 2);
			}

			// update the filter bar
			this.byId("filterBar").setVisible(this.oListFilterState.filter.length > 0);
			this.byId("filterBarLabel").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterFilterBarText", [sFilters]));

			this._applyFilterSearch();
		},

		/* 
		 * Event listener for the not found event.
		 */
		// TODO: can this be done in a better way?
		onNotFound : function () {
			this.oList.removeSelections();
		},

		/* 
		 * Event listener for the detail change event.
		 * @param {string} sChannel the channel id
		 * @param {sap.ui.base.Event} oEvent
		 * @param {object} oData the custom data that contains the object path to update the list selection
		 */
		onDetailChanged : function (sChannel, sEvent, oData) {
			var that = this,
				sObjectPath = oData.objectPath;

			// wait until the list is loaded once
			this._waitForInitialListLoading(function () {
				var oSelectedItem = that.oList.getSelectedItem(),
					aItems = that.oList.getItems(),
					i = 0;

				// skip update if the current selection is already matching the object path
				if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sObjectPath) {
					return;
				}

				// select the list item that matches the object path
				for (; i < aItems.length; i++) {
					if (aItems[i].getBindingContext().getPath() === sObjectPath) {
						that.oList.setSelectedItem(aItems[i], true);
						break;
					}
				}
			});
		},

		/* 
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 */
		onSelect : function (oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			// TODO: is this distinction really necessary anymore???
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/*
		 * Executes the callback function after the deferred is resolved
		 * @param{function} fnToExecute the callback function 
		 */
		_waitForInitialListLoading : function (fnToExecute) {
			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
		},

		/*
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created 
		 * @param: {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = jQuery.device.is.phone ? false : true;
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ObjectID")
			}, bReplace);
		},

		/*
		 * Sets the item count on the master list header
		 * @private
		 */
		_updateListItemCount : function () {
			var iItems,
				sTitle;

			if (this.oList.getBinding('items').isLengthFinal()) {
				iItems = this.byId("list").getBinding("items").getLength();
				sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterTitleCount", [iItems]);

				this.byId("page").setTitle(sTitle);			
			}
			// TODO: what to do if the length is not final???? ask core team
		},

		/*
		  * Internal helper method to apply both filter and search state together on the list binding
		  * @private
		  */
		_applyFilterSearch : function () {
			var aFilters = this.oListFilterState.search.concat(this.oListFilterState.filter);
			this.oList.getBinding("items").filter(aFilters, "Application");
		},

		/*
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @private
		 */ 
		_applyGroupSort : function () {
			var aSorters = this.oListSorterState.group.concat(this.oListSorterState.sort);
			this.oList.getBinding("items").sort(aSorters);
		},

		/*
		 * Selects the first list in the master list
		 * @private
		 */
		_selectFirstItem : function () {
			var aItems = this.oList.getItems();

			if (aItems.length) {
				this.oList.setSelectedItem(aItems[0], true);
			}
		}

	});