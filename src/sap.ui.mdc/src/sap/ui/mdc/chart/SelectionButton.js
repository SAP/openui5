/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/OverflowToolbarButton",
	"sap/m/Button",
	"sap/m/ButtonRenderer",
	"sap/m/library",
	"sap/m/IllustratedMessage",
	"sap/ui/core/Lib",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/mdc/chart/SelectionButtonDisplay"
], (OverflowToolbarButton, Button, ButtonRenderer, mobileLibrary, IllustratedMessage, Library, Filter, Sorter, JSONModel, Device, SelectionButtonDisplay) => {
	"use strict";

	// shortcut for sap.m.PlacementType
	const { PlacementType } = mobileLibrary;

	let ResponsivePopover, List, SearchField, ToggleButton, Bar, StandardListItem, InvisibleText, oRb;

	const SelectionButton = OverflowToolbarButton.extend("sap.ui.mdc.chart.SelectionButton", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				display: {
					type: "sap.ui.mdc.enums.SelectionButtonDisplay",
					defaultValue: SelectionButtonDisplay.Icon
				},
				canOverflow: {
					type: "boolean",
					defaultValue: true
				},
				selectedItemKey: {
					type: "string"
				},
				title: {
					type: "string"
				},
				searchPlaceholder: {
					type: "string"
				},
				searchEnabled: {
					type: "boolean"
				},
				sortEnabled: { //TODO sorted - sort button does not show the current sorted state
					type: "boolean",
					defaultValue: false
				},
				sorted: {
					type: "string",  //TODO should be enum none, ascending, descending
					defaultValue: "none"
				},
				noDataTitle: {
					type: "string"
				},
				noDataDescription: {
					type: "string"
				},
				noDataType: {
					type: "string"
				}
			},
			aggregations: {
				items: {
					type: "sap.ui.mdc.chart.SelectionButtonItem",
					multiple: true
				}
			},
			associations: {
			},
			events: {
				/**
				 * This event is fired when an item is selected in the popover.
				 *
				 */
				itemSelected: {
					parameters: {
						item: { type: "sap.ui.mdc.chart.SelectionButtonItem" }
					}
				},
				beforeOpen: {
				}
			}

		},
		renderer: ButtonRenderer
	});

	SelectionButton.prototype.init = function() {
		OverflowToolbarButton.prototype.init.apply(this, arguments);
		this.attachPress(this.openPopover.bind(this));
	};

	SelectionButton.prototype.setSearchEnabled = function(bEnabled) {
		this.setProperty("searchEnabled", bEnabled);
		this._updateHeader();
		return this;
	};

	SelectionButton.prototype.setSortEnabled = function(bEnabled) {
		this.setProperty("sortEnabled", bEnabled);
		this._updateHeader();
		return this;
	};

	/**
	 * Shows popover to select items
	 *
	 * @private
	 */
	SelectionButton.prototype.openPopover = function(oEvent) {
		if (!this.oReadyPromise) {
			this.oReadyPromise = new Promise((resolve) => {
				if (ResponsivePopover) {
					resolve(true);
				} else {
					sap.ui.require([
						"sap/m/ResponsivePopover",
						"sap/m/List",
						"sap/m/SearchField",
						"sap/m/ToggleButton",
						"sap/m/Bar",
						"sap/m/StandardListItem",
						"sap/ui/core/InvisibleText"
					], (ResponsivePopoverLoaded, ListLoaded, SearchFieldLoaded, ToggleButtonLoaded, BarLoaded, StandardListItemLoaded, InvisibleTextLoaded) => {
						ResponsivePopover = ResponsivePopoverLoaded;
						List = ListLoaded;
						SearchField = SearchFieldLoaded;
						ToggleButton = ToggleButtonLoaded;
						Bar = BarLoaded;
						StandardListItem = StandardListItemLoaded;
						InvisibleText = InvisibleTextLoaded;
						if (!oRb) {
							Library.load({ name: "sap.ui.mdc" }).then(() => {
								oRb = Library.getResourceBundleFor("sap.ui.mdc");
								resolve(true);
							});
						} else {
							resolve(true);
						}

					});
				}
			});
		}

		this.oReadyPromise.then(() => {

			if (!this.oPopover || !this.oPopover?.isOpen()) {
				this.fireBeforeOpen();

				if (this.getItems().length === 0) {
					//async filling of items: wait for a _openPopover call from the beforeOpen handler
					return;
				}

				this._openPopover();

			} else if (this.oPopover?.isOpen()) {
				this.oPopover.close();
			}
		});
	};

	SelectionButton.prototype._openPopover = function() {
		if (!this.oPopover) {
			this.oPopover = this._createPopover();

			// eslint-disable-next-line prefer-arrow-callback
			this.oPopover.attachAfterOpen(function() {
				// eslint-disable-next-line prefer-destructuring
				const oList = this.oPopover.getContent()[1];
				// eslint-disable-next-line prefer-destructuring
				const oSelectedItem = oList.getItems().filter((oItem) => { return oItem.getSelected(); })[0];
				oSelectedItem?.focus();

			}.bind(this));
		}

		this._createModel();
		this.oPopover.openBy(this);
	};


	/**
	 * Creates the popover
	 * @returns {sap.m.ResponsivePopover} the instance of the created popover
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	SelectionButton.prototype._createPopover = function() {
		const oItemTemplate = new StandardListItem({
			title: "{$items>text}",
			icon: "{$items>icon}",
			selected: "{$items>selected}"
		});

		// const fnGetGroup = function(oContext) {
		// 	return oContext.getProperty('text').startsWith("(") ? "2" : "1";
		// };

		// const fnGetGroupHeader = function(oGroup) {
		// 	return new sap.m.GroupHeaderListItem({
		// 		title : oGroup.key === "1" ? "Available" : "Unavailable"
		// 	});
		// };

		let oSorter = null;
		if (this.getSorted() !== "none") {
			oSorter = new Sorter({
				path: 'text',
				descending: this.getSorted() === "descending" //,
				// group: fnGetGroup
			});
		}

		const oList = new List({
			mode: "SingleSelectMaster",
			noData: new IllustratedMessage({
				title: this.getNoDataTitle(),
				description: this.getNoDataDescription(),
				illustrationType: this.getNoDataType()}),
			items: {
				path: "$items>/AvailableItems",
				sorter: oSorter,
				// groupHeaderFactory: fnGetGroupHeader,
				template: oItemTemplate,
				templateShareable: false
			},
			selectionChange: function(oEvent) {
				if (oEvent && oEvent.mParameters && oEvent.mParameters.listItem) {
					const oBinding = oEvent.mParameters.listItem.getBinding("title");
					if (oBinding) {
						const oCtx = oBinding.getContext();
						if (oCtx) {
							const oObj = oCtx.getObject();
							if (oObj && oObj.key) {
								this.fireItemSelected({ item: oObj });
								this.setSelectedItemKey(oObj.key);
							}
						}
					}
				}

				oPopover.close();
			}.bind(this)
		});

		// this._updateSort(oList, this.getSorted() === "descending");

		const oSearchField = new SearchField({
			placeholder: this.getSearchPlaceholder(),
			liveChange: function(oEvent) {
				this._triggerSearch(oEvent, oList);
			}.bind(this)
		});

		const oSortBtn = new ToggleButton({
			icon: "sap-icon://sort",
			press: function(oEvent) {
				this._triggerSort(oEvent, oList);
			}.bind(this)
		});

		const oPopover = new ResponsivePopover({
			id: this.getId() + "-btnSelectionButtonPopover",
			placement: PlacementType.VerticalPreferredBottom,
			contentWidth: "25rem"
		});

		oPopover.addStyleClass("sapUiMDCSelectionButton");

		const oBar = new Bar({ contentMiddle: [oSearchField, oSortBtn]});

		// The ResponsivePopover only supports controls with sap.m.IBar interface, which is not the case when we place a SearchField as subHeader.
		// On a Desktop we do not have any problem (the ResponsivePopoverRender is used in this case).
		// On a Phone the Dialog renderer is used and the subHeader will not work. So we add the search field in this case into the content.
		if (!Device.system.phone) {
			oPopover.setSubHeader(oBar);
		} else {
			oPopover.addContent(oBar);
		}

		//Show header only in mobile scenarios
		//still support screen reader while on desktops.
		if (Device.system.desktop) {
			const oInvText = new InvisibleText({
				text: this.getTitle()
			});
			oPopover.setShowHeader(false);
			oPopover.addContent(oInvText);
			oPopover.addAriaLabelledBy(oInvText);
		} else {
			oPopover.setTitle(this.getTitle());
		}

		oPopover.addContent(oList);

		this._updateHeader(oPopover);

		return oPopover;
	};

	SelectionButton.prototype._updateHeader = function(oPopover) {
		oPopover = oPopover || this.oPopover;
		let oBar = oPopover?.getSubHeader();
		if (!oBar && Device.system.phone) {
			oBar = oPopover?.getContent();
		}
		if (!oBar) {
			return;
		}
		const [oSearchField, oSortBtn] = oBar.getContentMiddle();

		oSearchField.setVisible(this.getSearchEnabled());
		oSearchField.setValue("");
		oSortBtn.setVisible(this.getSortEnabled());
		oBar.setVisible(this.getSearchEnabled() || this.getSortEnabled());
	};

	SelectionButton.prototype._createModel = function() {
		const oModel = new JSONModel();
		oModel.setSizeLimit(1000);
		const aItems = this.getItems() || [];
		const sSelectedItemKey = this.getSelectedItemKey() || "";
		const aItemsData = [];
		aItems.forEach((oItem) => {
			aItemsData.push(
				{
					key: oItem.getKey(),
					text: oItem.getText(),
					tooltip: oItem.getTooltip() || oItem.getText(),
					icon: oItem.getIcon(),
					selected: oItem.getKey() === sSelectedItemKey
				}
			);
		});
		oModel.setProperty("/AvailableItems", aItemsData);
		this.oPopover.setModel(oModel, "$items");
	};

	/**
	 * Triggers a search in the drill-down popover
	 *
	 * @param {object} oEvent The event arguments
	 * @param {sap.m.List} oList The list to search in
	 * @private
	 */
	SelectionButton.prototype._triggerSearch = function(oEvent, oList) {
		const sSearchValue = oEvent.getParameter("newValue");
		let oSearchFilter = [];
		if (sSearchValue) {
			oSearchFilter = new Filter("text", "Contains", sSearchValue);
		}
		oList.getBinding("items").filter(oSearchFilter);
	};

	SelectionButton.prototype._triggerSort = function(oEvent, oList) {
		this._updateSort(oList, oEvent.getSource().getPressed());
	};

	SelectionButton.prototype._updateSort = function(oList, bDescending) {
		// const fnGetGroup = function(oContext) {
		// 	return oContext.getProperty('text').startsWith("(") ? "2" : "1";
		// };

		// const fnGetGroupHeader = function(oGroup) {
		// 	return new sap.m.GroupHeaderListItem({
		// 		title : oGroup.key === "1" ? "Available" : "Unavailable"
		// 	});
		// };

		const oSorter = new Sorter({
			path: 'text',
			descending: bDescending //,
			// group: fnGetGroup
		});

		const oListBinding = oList.getBinding("items");
		if (oListBinding) {
			oListBinding.sort(oSorter);
			// oListBinding.groupHeaderFactory = fnGetGroupHeader;
			return;
		}

		// const oListBindingInfo = oList.getBindingInfo("items");
		// oListBindingInfo.sort = oSorter;
		// oListBindingInfo.groupHeaderFactory = fnGetGroupHeader;
		// oList.bindAggregation("items", oListBindingInfo);
	};

	SelectionButton.prototype.exit = function() {
		OverflowToolbarButton.prototype.exit.apply(this, arguments);
		if (this.oPopover) {
			this.oPopover.destroy();
			this.oPopover = null;
		}

		if (this._oObserver) {
			this._oObserver.disconnect();
			this._oObserver.destroy();
			delete this._oObserver;
		}
	};

	SelectionButton.prototype._getAppliedIcon = function() {
		if  (this._bInOverflow || this.getDisplay() === SelectionButtonDisplay.Icon || this.getDisplay() ===  SelectionButtonDisplay.Both) {
			return this.getIcon() || this._sTypeIconURI;
		}
		return undefined;
	};

	SelectionButton.prototype._getText = function() {
		if (this._bInOverflow || this.getDisplay() === SelectionButtonDisplay.Text || this.getDisplay() ===  SelectionButtonDisplay.Both) {
			return Button.prototype._getText.call(this);
		}

		return "";
	};

	SelectionButton.prototype.getOverflowToolbarConfig = function() {
		const oOverflowToolbarConfig = OverflowToolbarButton.prototype.getOverflowToolbarConfig.apply(this); // Call base class
		oOverflowToolbarConfig.canOverflow = this.getCanOverflow();
		return oOverflowToolbarConfig;
	};

	return SelectionButton;
});