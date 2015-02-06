/*
 * ${copyright}
 */

// Provides TablePersoDialog
sap.ui.define(['jquery.sap.global', './Button', './Dialog', './InputListItem', './List', './Toolbar', 'sap/ui/base/ManagedObject'],
	function(jQuery, Button, Dialog, InputListItem, List, Toolbar, ManagedObject) {
	"use strict";



	/**
	 * The TablePersoDialog can be used to display and allow modification of personalization settings relating to a Table. It displays the columns of the table that it refers to by using
	 * <ul><li>The result of calling sap.m.TablePersoProvider's 'getCaption' callback if it is implemented and delivers a non-null value for a column</li>
	 * <li>the column header control's 'text' property if no caption property is available</li>
	 * <li>the column header control's 'title' property if neither 'text' nor 'caption' property are available</li>
	 * <li>the column id is displayed as last fallback, if none of the above is at hand. In that case, a warning is logged. </li></ul>
	 *
	 * @param {string}
	 *			[sId] optional id for the new control; generated automatically if
	 *			no non-empty id is given Note: this can be omitted, no matter
	 *			whether <code>mSettings</code> will be given or not!
	 * @param {object}
	 *			[mSettings] optional map/JSON-object with initial settings for the
	 *			new component instance
	 * @public
	 *
	 * @class Table Personalization Dialog
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP
	 * @version ${version}
	 * @alias sap.m.TablePersoDialog
	 */
	var TablePersoDialog = ManagedObject.extend("sap.m.TablePersoDialog", /** @lends sap.m.TablePersoDialog */

	{
		constructor : function(sId, mSettings) {

			ManagedObject.apply(this, arguments);

		},

		metadata : {
			properties: {
				"contentWidth": {type: "sap.ui.core.CSSSize"},
				"contentHeight": {type: "sap.ui.core.CSSSize", since: "1.22"},
				"persoMap": {type: "object"},
				"columnInfoCallback": {type: "object", since: "1.22"},
				"initialColumnState": {type: "object", since: "1.22"},
				"hasGrouping": {type: "boolean", since: "1.22"},
				"showSelectAll": {type: "boolean", since: "1.22"},
				"showResetAll": {type: "boolean", since: "1.22"}
			},
			aggregations: {
				"persoService": {
					type: "Object",
					multiple: false
				}
			},
			associations: {
				"persoDialogFor": sap.m.Table
			},
			events: {
				confirm: {},
				cancel: {}
			},
			library: "sap.m"
		}

	});




	/**
	 * Initializes the TablePersoDialog instance after creation.
	 *
	 * @protected
	 */
	TablePersoDialog.prototype.init = function() {
		var that = this,
			iLiveChangeTimer = 0;

		// Resource bundle, for texts
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		// To store the column settings
		this._oP13nModel = new sap.ui.model.json.JSONModel();
		// Make sure that model can contain more than the 100 entries
		// it may contain by default
		this._oP13nModel.setSizeLimit(Number.MAX_VALUE);

		this._fnUpdateCheckBoxes = jQuery.proxy(function(oEvent) {
			var bSelected = oEvent.getParameter('selected'),
				oData = this._oP13nModel.getData();
			if (oEvent.getSource().getId() === this._getSelectAllCheckboxId()) {
				// 'Select All' checkbox has been changed
				oData.aColumns.forEach(function(oColumn) {
					oColumn.visible = bSelected;
				});
			} else {
				// One of the list checkboxes has been modified
				// Update the state of the 'Select All' checkbox
				var bSelectAll = !oData.aColumns.some(function(oColumn) {
					return !oColumn.visible;
				});

				oData.aHeader.visible = bSelectAll;
			}
			// Call setData to trigger update of bound controls
			this._oP13nModel.setData(oData);
		}, this);


		// Template for list inside the dialog - 1 item per column
		this._oColumnItemTemplate = new InputListItem({
			label: "{Personalization>text}",
			content: new sap.m.CheckBox({
				selected: "{Personalization>visible}",
				select: this._fnUpdateCheckBoxes
			})
		}).addStyleClass("sapMPersoDialogLI");

		// Button definition for sorting of the table content(up/down)
		this._oButtonUp = new Button({
						icon: "sap-icon://arrow-top",
						enabled: false,
						press: function(oEvent) {
							that._moveItem(-1);
						}
		});

		this._oButtonDown = new Button({
						icon: "sap-icon://arrow-bottom",
						enabled: false,
						press: function(oEvent) {
							  that._moveItem(1);
						}
		});

		this._fnHandleResize = function() {
			// Check if dialog is rendered
			if (that._oDialog) {
				var $dialogCont = jQuery("#" + that._oDialog.getId() + "-cont");
				if ($dialogCont.children().length > 0) {
					var iContentHeight = $dialogCont.children()[0].clientHeight;

					// Take the header border into account otherwise the scroll container's
					// height is 2px more and causes the selectAllToolbar to scroll as well
					var iHeaderHeight = that.getShowSelectAll() ? that._oSelectAllToolbar.$().outerHeight() : 0;
					that._oScrollContainer.setHeight((iContentHeight - iHeaderHeight) + 'px');
				}
			}
		};

		this._fnUpdateArrowButtons = function() {
			// Initialisation of the enabled property
			var bButtonDownEnabled = true,
				bButtonUpEnabled = true,
				sValue = that._oSearchField.getValue(),
				iItemCount = that._oList.getItems().length;
			if (!!sValue || that._oList.getSelectedItems().length === 0) {
				// Disable buttons if search filters the list or if list is empty
				bButtonUpEnabled = false;
				bButtonDownEnabled = false;
			} else {
				// Data available (1 or more items)
				if (that._oList.getItems()[0].getSelected()) {
					// First item selected: disable button "arrow top" and focus button "arrow bottom"
					bButtonUpEnabled = false;
					jQuery.sap.focus(that._oButtonDown.getDomRef());
				}
				if (that._oList.getItems()[iItemCount - 1].getSelected()) {
					// Last item selected: disable button "arrow bottom" and focus button "arrow top"
					bButtonDownEnabled = false;
					jQuery.sap.focus(that._oButtonUp.getDomRef());
				}
			}

			that._oButtonUp.setEnabled(bButtonUpEnabled);
			that._oButtonDown.setEnabled(bButtonDownEnabled);
		};

		this._fnAfterListRendering = function(oEvent) {
			// Find all checkboxes in the list
			var aItems = oEvent.srcControl.$().find('.sapMCb'),
				iItemsLength = aItems.length;
			// 'forEach' does not work
			for (var i = 0; i < iItemsLength; i++) {
				var $checkBox = jQuery(aItems[i]).parent(),
					aSiblings = $checkBox.siblings(),
					$label = aSiblings.length == 1 ? jQuery(aSiblings[0]) : null;

				if ($label) {
					$checkBox = $checkBox.detach();
					$checkBox[0].className = 'sapMLIBSelectM';
					$checkBox.insertBefore($label);
				}
			}

			if (that._sLastSelectedItemId) {
				var aItems = that._oList.getItems(),
					fnItemMatches = function (oListItem) {
						var bResult = (oListItem.getBindingContext('Personalization').getProperty('id') === that._sLastSelectedItemId);
						if (bResult) {
							that._oList.setSelectedItem(oListItem);
						}
						return bResult;
					};
				// Use 'some' to make sure it only traverses the array of listItems
				// as far as needed
				aItems.some(fnItemMatches);
				// Clear last selected item so it does not get used again
				that._sLastSelectedItemId = null;
			}
		};

		this._fnAfterToolbarRendering = function (oEvent) {
			// Remove the toolbar from the tab chain
			that._oSelectAllToolbar.$().attr('tabindex', '-1');
		};

		this._fnAfterDialogOpen = function (oEvent) {
			// On shift+tab the subheader gets focused
			that._oDialog.getSubHeader().$().attr('tabindex', '-1');
			// Make sure that arrow buttons are updated when dialog is opened
			that._fnUpdateArrowButtons.call(that);
		};

		this._fnAfterScrollContainerRendering = function (oEvent) {
			// Scroll container gets focused in Firefox
			that._oScrollContainer.$().attr('tabindex', '-1');
		};
		
		this._oList =  new List({
			includeItemInSelection: true,
			noDataText: this._oRb.getText('PERSODIALOG_NO_DATA'),
			mode: sap.m.ListMode.SingleSelectMaster,
			selectionChange: this._fnUpdateArrowButtons
		});
		
		this._oList.addDelegate({onAfterRendering : this._fnAfterListRendering});

		this._oSearchField = new sap.m.SearchField(this.getId() + "-searchField", {
			width: "100%",
			liveChange: function (oEvent) {
				var sValue = oEvent.getSource().getValue(),
					iDelay = (sValue ? 300 : 0); // No delay if value is empty

				// Execute search after user stops typing for 300ms
				clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = setTimeout(function () {
						that._executeSearch();
					}, iDelay);
				} else {
					that._executeSearch();
				}
			},
			// Execute the standard search
			search: function (oEvent) {
				that._executeSearch();
			}
		});

		this._oScrollContainer = new sap.m.ScrollContainer({
			horizontal: false,
			vertical: true,
			content:[this._oList],
			width:'100%'
		});

		this._oScrollContainer.addDelegate({onAfterRendering : this._fnAfterScrollContainerRendering});

		this._resetAllButton = new Button({
			icon: "sap-icon://undo",
			tooltip: this._oRb.getText('PERSODIALOG_UNDO'),
			press : function () {
				that._resetAll();
			}
		}).addStyleClass("sapMPersoDialogResetBtn");

		this._oSelectAllCheckbox = new sap.m.CheckBox(this._getSelectAllCheckboxId(), {
			selected: "{Personalization>/aHeader/visible}",
			select: this._fnUpdateCheckBoxes,
			text: "{Personalization>/aHeader/text}"
		}).addStyleClass("sapMPersoDialogSelectAllCb");

		this._oSelectAllToolbar = new Toolbar({
			active: true,
			design : sap.m.ToolbarDesign.Transparent,
			content: [this._oSelectAllCheckbox, this._resetAllButton]
		}).addStyleClass("sapMPersoDialogFixedBar");

		this._oSelectAllToolbar.addDelegate({onAfterRendering: this._fnAfterToolbarRendering});

		this._oDialog = new Dialog({
			title : this._oRb.getText("PERSODIALOG_COLUMNS_TITLE"),
			stretch: sap.ui.Device.system.phone,
			horizontalScrolling: false,
			verticalScrolling: false,
			initialFocus: (sap.ui.Device.system.desktop ? this._oList : null),
			content : [ this._oSelectAllToolbar, this._oScrollContainer],
			subHeader : new Toolbar({
				active : true,
				content: [ this._oButtonUp, this._oButtonDown, this._oSearchField ]
			}),
			leftButton : new Button({
				text : this._oRb.getText("PERSODIALOG_OK"),
				press : function () {
					that._oDialog.close();
					that._oSearchField.setValue("");
					that._oSelectAllToolbar.setVisible(true);
					sap.ui.Device.resize.detachHandler(that._fnHandleResize);
					that.fireConfirm();
				}
			}),
			rightButton : new Button({
				text: this._oRb.getText("PERSODIALOG_CANCEL"),
				press: function () {
					that._oDialog.close();
					that._oSearchField.setValue("");
					that._oSelectAllToolbar.setVisible(true);
					sap.ui.Device.resize.detachHandler(that._fnHandleResize);
					that.fireCancel();
				}
			}),
			afterOpen: this._fnAfterDialogOpen
		}).addStyleClass("sapMPersoDialog");
	};

	/**
	 * Returns the personalizations made. Currently supports
	 * a 'columns' property which holds an array of settings,
	 * one element per column in the associated table. The element
	 * contains column-specific information as follows: id: column id;
	 * order: new order; text: the column's header text that was displayed
	 * in the dialog; visible: visibility (true or false).
	 *
	 * @return object personalizationData
	 * @public
	 */
	TablePersoDialog.prototype.retrievePersonalizations = function () {
		return this._oP13nModel.getData();
	};

	/**
	 * Sets the content of the dialog, being list items representing
	 * the associated table's column settings, and opens the dialog
	 * @public
	 */
	TablePersoDialog.prototype.open = function () {
		var aSorter = null;
		if (this.getHasGrouping()) {
			aSorter = [new sap.ui.model.Sorter('group', false, true)];
		}
		// Get the associated Table's column info and set it into the Personalization model
		this._readCurrentSettingsFromTable();

		this._oDialog.setModel(this._oP13nModel, "Personalization");
		this._oList.bindAggregation("items", {
			path: "Personalization>/aColumns",
			sorter: aSorter,
			template: this._oColumnItemTemplate
		});

		if (!this._oList.getSelectedItem()) {
			// Make sure initial selection is set
			if (this._oList.getItems().length > 0) {
				this._sLastSelectedItemId = this._oList.getItems()[0].getBindingContext('Personalization').getProperty('id');
			}
		}

		// Update 'Move' button's state
		this._fnUpdateArrowButtons.call(this);

		// Now show the dialog
		this._oDialog.open();

		this._fnHandleResize.call(this);
		sap.ui.Device.resize.attachHandler(this._fnHandleResize);
	};


	TablePersoDialog.prototype.setContentHeight = function(sHeight) {
		this.setProperty("contentHeight", sHeight, true);
		this._oDialog.setContentHeight(sHeight);
		return this;
	};

	TablePersoDialog.prototype.setContentWidth = function(sWidth) {
		this.setProperty("contentWidth", sWidth, true);
		this._oDialog.setContentWidth(sWidth);
		return this;
	};

	/**
	 * Destroys the control
	 * @private
	 */
	TablePersoDialog.prototype.exit = function () {
		this._oRb = null;
		this._oP13nModel = null;

		if (this._oColumnItemTemplate) {
			this._oColumnItemTemplate.destroy();
			this._oColumnItemTemplate = null;
		}

		if (this._oSelectAllToolbar) {
			this._oSelectAllToolbar.destroy();
			this._oSelectAllToolbar = null;
		}

		if (this._oList) {
			this._oList.destroy();
			this._oList = null;
		}

		if (this._oSearchField) {
			this._oSearchField.destroy();
			this._oSearchField = null;
		}

		if (this._oScrollContainer) {
			this._oScrollContainer.destroy();
			this._oScrollContainer = null;
		}

		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}

		if (this._oButtonDown) {
			this._oButtonDown.destroy();
			this._oButtonDown = null;
		}
		if (this._oButtonUp) {
			this._oButtonUp.destroy();
			this._oButtonUp = null;
		}
	};

	/* =========================================================== */
	/*           begin: internal methods                           */
	/* =========================================================== */

	/**
	* Turn column visibility and order back to initial state (state before table
	* was personalized)
	* @private
	*/
	TablePersoDialog.prototype._resetAll = function () {
		if (this.getInitialColumnState()) {
			// Deep copy of Initial Data, otherwise initial data will be changed
			// and can only be used once to restore the initial state

			var aInitialStateCopy = jQuery.extend(true, [], this.getInitialColumnState()),
			    that = this;
			// CSN 0120031469 0000184938 2014
			// Remember last selected row, so it can be selected again after
			// reset all is done
			var oLastSelectedItem = this._oList.getSelectedItem();
			this._sLastSelectedItemId = oLastSelectedItem ? oLastSelectedItem.getBindingContext('Personalization').getProperty('id') : null; 

			// CSN 0120061532 0001380609 2014
			// Make sure that captions are not replaced by column id's. This my be the case if
			// initalStateCopy has been created too early
			if (!!this._mColumnCaptions) {
				aInitialStateCopy.forEach(
					function(oColumn) {
						oColumn.text = that._mColumnCaptions[oColumn.id];
				});
			}

			this._oP13nModel.getData().aColumns = aInitialStateCopy;

			this._oP13nModel.getData().aHeader.visible = !this.getInitialColumnState().some(function(oColumn) {
				return !oColumn.visible;
			});

			this._oP13nModel.updateBindings();
		}
	};



	/**
	 * Moves an item up or down, swapping it with the neighbour.
	 * Does this in the bound model.
	 * @private
	 * @param {int} iDirection the move direction (-1 up, 1 down)
	 */
	TablePersoDialog.prototype._moveItem = function (iDirection) {

		// Abort if nothing selected
		var oSelectedItem = this._oList.getSelectedItem();
		if (!oSelectedItem) {
			return;
		}

		// The items themselves
		var oData = this._oP13nModel.getData();

		// Get array index of selected item
		var item = oSelectedItem.getBindingContext("Personalization").getPath().split("/").pop() * 1;

		// Get array index of item to swap with
		var swap = item + iDirection;

		// Abort if out of bounds
		if ( swap < 0 || swap >= oData.aColumns.length ) {
			return;
		}

		// Do the swap
		var temp = oData.aColumns[swap];
		oData.aColumns[swap] = oData.aColumns[item];
		// Make sure the order member is adapted as well!
		oData.aColumns[swap].order = swap;
		oData.aColumns[item] = temp;
		// Make sure the order member is adapted as well!
		oData.aColumns[item].order = item;

		// Remove selection before binding
		this._oList.removeSelections(true);

		// Call setData to trigger update of bound controls
		this._oP13nModel.updateBindings();


		// Switch the selected item
		var oSwapItem = this._oList.getItems()[swap];
		this._oList.setSelectedItem(oSwapItem, true);

		// Scroll to selected item
		// Make sure that item is selected so 'oSwapItem.$()'
		// is not empty
		sap.ui.getCore().applyChanges();
		// swapItem need to be rendered, otherwise we can not
		// perfrom the necessary calculations
		if (!!oSwapItem.getDomRef()) {
			var iElementOffset =  oSwapItem.$().position().top,
				// This is the minimal height that should be visible from the selected element
			    // 18 means 18px which corresponds to 3em
				iMinHeight = 18,
				iViewPortHeight = this._oScrollContainer.$().height(),
				iViewPortStart = this._oScrollContainer.$().offset().top - this._oList.$().offset().top,
				iViewPortEnd = iViewPortStart + iViewPortHeight;

			if (iElementOffset < iViewPortStart ) {
				// Selected element is above or below visible viewport
				// scroll page up
				this._oScrollContainer.scrollTo(0, Math.max(0, iViewPortStart - iViewPortHeight + iMinHeight));
			} else if (iElementOffset + iMinHeight > iViewPortEnd) {
				// Selected element is above or below visible viewport
				// scroll down a page (this is the height of the scroll container)
				this._oScrollContainer.scrollTo(0, iElementOffset);
			}
			// Otherwise, element is within the scroll container's viewport, so no action is necessary
		}

		this._fnUpdateArrowButtons.call(this);

	};


	/**
	 * Reads current column settings from the table and stores in the model
	 * @private
	 */
	TablePersoDialog.prototype._readCurrentSettingsFromTable = function() {
		var oTable = sap.ui.getCore().byId(this.getPersoDialogFor()),
			that = this,
			aCurrentColumns = this.getColumnInfoCallback().call(this, oTable, this.getPersoMap(), this.getPersoService());
		this._oP13nModel.setData({
			aColumns : aCurrentColumns,
			aHeader : {
				text : this._oRb.getText("PERSODIALOG_SELECT_ALL"),
				visible : !aCurrentColumns.some(function(oColumn) {
					return !oColumn.visible;
				}),
				id: this._getSelectAllCheckboxId()
			}
		});

		// Remember column captions, needed for 'Reset All'
		this._mColumnCaptions = {};
		aCurrentColumns.forEach(
				function(oColumn) {
					that._mColumnCaptions[oColumn.id] = oColumn.text;
		});
	};

	TablePersoDialog.prototype._getSelectAllCheckboxId = function () {
		return this.getId() + '_SelectAll';
	};

	/**
	 * Filters the columns list with the given sValue
	 * @private
	 */
	TablePersoDialog.prototype._executeSearch = function () {
		var sValue = this._oSearchField.getValue(),
			oFilter = new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.Contains, sValue),
			oBinding = this._oList.getBinding("items");

		this._oSelectAllToolbar.setVisible(!sValue && this.getShowSelectAll());
		oBinding.filter([oFilter]);
		this._fnUpdateArrowButtons.call(this);
		return this;
	};

	/**
	 * Reflector for the TablePersoDialog's Dialog's hasGrouping property.
	 * @param {boolean} bHasGrouping
	 * @public
	 */
	TablePersoDialog.prototype.setHasGrouping = function (bHasGrouping) {
		this.setProperty("hasGrouping", bHasGrouping, true);
		var oBar = this._oDialog.getSubHeader();
		if (!bHasGrouping) {
			if (oBar.getContent().length === 1) {
				// Only search field is displayed, add up- and down
				// buttons
				oBar.insertContent(this._oButtonDown, 0);
				oBar.insertContent(this._oButtonUp, 0);
			}
		} else {
			oBar.removeContent(this._oButtonUp);
			oBar.removeContent(this._oButtonDown);
		}
		return this;
	};

	/**
	 * Reflector for the TablePersoDialog's Dialog's showSelectAll property.
	 * @param {boolean} bShowSelectAll
	 * @public
	 */
	TablePersoDialog.prototype.setShowSelectAll = function (bShowSelectAll) {
		this.setProperty("showSelectAll", bShowSelectAll, true);
		this._oSelectAllToolbar.setVisible(bShowSelectAll);
		// Need to recalculate content height now
		this._fnHandleResize.call(this);
		return this;
	};

	/**
	 * Reflector for the TablePersoDialog's Dialog's showResetAll property.
	 * @param {boolean} bShowResetAll
	 * @public
	 */
	TablePersoDialog.prototype.setShowResetAll = function (bShowResetAll) {
		this.setProperty("showResetAll", bShowResetAll, true);
		this._resetAllButton.setVisible(bShowResetAll);
		return this;
	};





	return TablePersoDialog;

}, /* bExport= */ true);
