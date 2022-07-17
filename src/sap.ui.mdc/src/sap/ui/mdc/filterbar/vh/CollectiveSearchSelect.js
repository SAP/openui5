/*!
 * ${copyright}
 */

// Provides control sap.ui.mdc.filterbar.vh.CollectiveSearchSelect.
sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Item",
	"sap/ui/core/Control",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/SearchField",
	"sap/m/Page",
	"sap/m/Toolbar",
	"sap/m/ToggleButton",
	"sap/m/Title",
	"sap/m/ResponsivePopover",
	"sap/m/SelectList",
	"sap/ui/events/KeyCodes",
	"sap/m/library",
	'sap/ui/model/base/ManagedObjectModel',
	'sap/ui/base/ManagedObjectObserver'
], function(
	Filter,
	FilterOperator,
	Device,
	InvisibleText,
	Item,
	Control,
	HorizontalLayout,
	SearchField,
	Page,
	Toolbar,
	ToggleButton,
	Title,
	ResponsivePopover,
	SelectList,
	KeyCodes,
	mobileLibrary,
	ManagedObjectModel,
	ManagedObjectObserver
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	/**
	 * Constructor for a new <code>CollectiveSearchSelect</code>.
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 * @class Can be used to manage the <code>CollectiveSearchSelect</code> contro search items.
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.filterbar.vh.CollectiveSearchSelect
	 */
	var CollectiveSearchSelect = Control.extend("sap.ui.mdc.filterbar.vh.CollectiveSearchSelect", /** @lends sap.ui.mdc.filterbar.vh.CollectiveSearchSelect.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {

				/**
				 * The title of the <code>CollectiveSearchSelect</code>.
				 *
				 * The title will be shown on the popover of the control on top of the List.
				 */
				title: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The key of the selected item of the <code>CollectiveSearchSelect</code>.
				 *
				 * The selectedItemKey must be set to the initially selected item key.
				 * When the user changes the selection, the property will change and reflect the key of the newly selected item.
				 */
				selectedItemKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				_currentItemText: {
					type: "string",
					group: "Misc",
					defaultValue: null,
					hidden: true
				}

			},
			aggregations: {

				/**
				 * Items displayed by the <code>CollectiveSearchSelect</code> control.
				 */
				items: {
					type: "sap.ui.core.Item",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * This event is fired when a new item is selected.
				 */
				select: {
					parameters: {
						/**
						 * Item key
						 */
						key: {
							type: "string"
						}
					}
				}
			}
		},

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 * @param {sap.ui.core.RenderManager} oRm - <code>RenderManager</code> that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl - Object representation of the control that is rendered
		 */
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl)
					.class("sapUiMdcCollectiveSearchSelect")
					.attr("title", oControl.oRb.getText("COL_SEARCH_TRIGGER_TT"))
					.openEnd();

				oRm.renderControl(oControl.oLayout);

				oRm.close("div");
			}
		}
	});


	/*
	 * Constructs and initializes the <code>CollectiveSearchSelect</code> control.
	 */
	CollectiveSearchSelect.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);
		this.setModel(this._oManagedObjectModel, "$mdcColSearch");

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["selectedItemKey"],
			aggregations: ["items"]
		});

		this.oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		this.oInvisibleText = new InvisibleText();

		this.oText = new Title(this.getId() + "-text", {
			text: "{$mdcColSearch>/_currentItemText}"
		}).addStyleClass("sapUiMdcCollectiveSearchSelectClickable")
			.addStyleClass("sapUiMdcCollectiveSearchSelectTitle");

		if (Device.system.phone) {
			this.oText.addStyleClass("sapUiMdcCollectiveSearchSelectTextPhoneMaxWidth");
		} else {
			this.oText.addStyleClass("sapUiMdcCollectiveSearchSelectTextMaxWidth");
		}

		this.oPopoverTrigger = new ToggleButton(this.getId() + "-trigger", {
			icon: "sap-icon://slim-arrow-down",
			type: ButtonType.Transparent,
			tooltip: this.oRb.getText("COL_SEARCH_TRIGGER_TT")
		}).addAriaLabelledBy(this.oInvisibleText)
			.addStyleClass("sapUiMdcCollectiveSearchSelectTriggerBtn")
			.addStyleClass("sapMTitleStyleH4");

		this.oLayout = new HorizontalLayout({
			content: [this.oText, this.oPopoverTrigger]
		}).addStyleClass("sapUiMdcCollectiveSearchSelectLayout");

		this.oInvisibleText.toStatic();

		this.addDependent(this.oLayout);

	};


	CollectiveSearchSelect.prototype._observeChanges = function(oChanges) {
		if (["selectedItemKey", "items" ].indexOf(oChanges.name) >= -1) {
			this._updateCurrentItemText();
		}
	};


	CollectiveSearchSelect.prototype._updateCurrentItemText = function() {
		var sKey = this.getSelectedItemKey();
		var oItem = this._getItemByKey(sKey);
		var sText = oItem ? oItem.getText() : sKey;

		this.oInvisibleText.setText(this.oRb.getText("COL_SEARCH_SEL_INVISIBLETXT", [sText]));

		this.setProperty("_currentItemText", sText);
	};


	CollectiveSearchSelect.prototype._getItemByKey = function(sKey) {
		var oItem = null;
		var aItems = this.getItems();
		aItems.some(function(oEntry) {
			if (oEntry.getKey() === sKey) {
				oItem = oEntry;
			}

			return (oItem !== null);
		});

		return oItem;
	};

	// clickable area
	CollectiveSearchSelect.prototype.handleOpenClosePopover = function() {
		if (!this.bPopoverOpen) {
			this._openList();
		} else if (this.oPopover && this.oPopover.isOpen()) {
			this.oPopover.close();
		}
	};

	CollectiveSearchSelect.prototype.getFocusDomRef = function() {
		if (this.oPopoverTrigger) {
			return this.oPopoverTrigger.getFocusDomRef();
		}
	};

	CollectiveSearchSelect.prototype.onclick = function() {
		if (this.oPopoverTrigger && !this.bPopoverOpen) {
			this.oPopoverTrigger.focus();
		}
		this.handleOpenClosePopover();
	};

	CollectiveSearchSelect.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === KeyCodes.F4 ||
			oEvent.which === KeyCodes.SPACE ||
			oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_UP ||
			oEvent.altKey === true && oEvent.which === KeyCodes.ARROW_DOWN) {
			this._openList();
		}
	};

	CollectiveSearchSelect.prototype.onAfterRendering = function() {
		this.oText.$().off("mouseover").on("mouseover", function() {
			this.oPopoverTrigger.addStyleClass("sapUiMdcCollectiveSearchSelectTriggerBtnHover");
		}.bind(this));
		this.oText.$().off("mouseout").on("mouseout", function() {
			this.oPopoverTrigger.removeStyleClass("sapUiMdcCollectiveSearchSelectTriggerBtnHover");
		}.bind(this));
	};

	CollectiveSearchSelect.prototype._createList = function() {
		if (this.oPopover) {
			return;
		}

		this.oList = new SelectList(this.getId() + "-list", {
			selectedKey: {
				path: "$mdcColSearch>/selectedItemKey"
			},
			itemPress: function(oEvent) {
				var sSelectedKey = null;
				if (oEvent && oEvent.getParameter("item")) {
					var oItemPressed = oEvent.getParameter("item");
					if (oItemPressed) {
						sSelectedKey = oItemPressed.getKey();
					}
				}
				this.oPopover.close();
				if (this.getSelectedItemKey() !== sSelectedKey) {
					this.setSelectedItemKey(sSelectedKey);

					this.fireSelect({
						key: sSelectedKey
					});
				}
			}.bind(this)
		});

		this.oList.bindAggregation("items", {
			path: "/items",
			model: "$mdcColSearch",
			template: new Item({
				key: "{$mdcColSearch>key}",
				text: "{$mdcColSearch>text}"
			})
		});

		this.oSearchField = new SearchField(this.getId() + "-search");
		this.oSearchField.attachLiveChange(function(oEvent) {
			var sValue = oEvent.getParameter("newValue") || "";
			this._triggerSearch(sValue, this.oList);
		}.bind(this));

		this.oPage = new Page(this.getId() + "-selpage", {
			subHeader: new Toolbar({
				content: [
					this.oSearchField
				]
			}),
			content: [
				this.oList
			],
			showNavButton: false,
			showHeader: false
		});

		this.oPopover = new ResponsivePopover(this.getId() + "-popover", {
			title: {
				path: "$mdcColSearch>/title"
			},
			titleAlignment: "Auto",
			contentWidth: "400px",
			placement: PlacementType.VerticalPreferredBottom,
			content: [
				this.oPage
			],
			afterOpen: function() {
				this.bPopoverOpen = true;
				this.oPopoverTrigger.setPressed(true);
			}.bind(this),
			afterClose: function() {
				this.oPopoverTrigger.setPressed(false);
				if (this.bPopoverOpen) {
					setTimeout(function() {
						this.bPopoverOpen = false;
					}.bind(this), 200);
				}
			}.bind(this),
			contentHeight: "300px"
		});

		this.oPopover.addStyleClass("sapUiMdcCollectiveSearchSelectPopover");
		if (this.oLayout.$().closest(".sapUiSizeCompact").length > 0) {
			this.oPopover.addStyleClass("sapUiSizeCompact");
		}
		this.addDependent(this.oPopover);
	};

	CollectiveSearchSelect.prototype._openList = function() {
		if (this.bPopoverOpen) {
			return;
		}

		this._createList();

		this.oSearchField.setValue("");
		this._triggerSearch("", this.oList);

		this.oPage.setShowSubHeader(this.oList.getItems().length > 9);

		this.oPopover.openBy(this.oPopoverTrigger);
	};

	CollectiveSearchSelect.prototype._triggerSearch = function(sValue, oList) {
		var aFilters = [];

		if (sValue) {
			var oFilter = new Filter({
				path: "text",
				operator: FilterOperator.Contains,
				value1: sValue
			});
			aFilters.push(oFilter);
		}

		oList.getBinding("items").filter(aFilters);
	};

	// exit destroy all controls created in init
	CollectiveSearchSelect.prototype.exit = function() {

		if (this.oInvisibleText) {
			this.oInvisibleText.destroy(true);
			this.oInvisibleText = undefined;
		}

		this.oRb = undefined;
		this.oList = undefined;
		this.oPage = undefined;
		this.oLayout = undefined;
		this.oText = undefined;
		this.oPopoverTrigger = undefined;
		this.oSearchField = undefined;

		this._oManagedObjectModel.destroy();
		this._oManagedObjectModel = undefined;

		this._oObserver.disconnect();
		this._oObserver = undefined;
	};

	return CollectiveSearchSelect;
});