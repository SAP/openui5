/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	'sap/ui/model/json/JSONModel',
	'sap/m/VBox',
	'sap/ui/core/Control',
	'sap/m/Column',
	'sap/m/Text',
	'sap/ui/model/Filter',
	"sap/m/Table",
	"sap/m/OverflowToolbar",
	"sap/m/SearchField",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/dnd/DragDropInfo",
	'sap/ui/core/ShortcutHintsMixin',
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/MessageStrip",
	"sap/ui/core/InvisibleText"
], (
	Element,
	Library,
	JSONModel,
	VBox,
	Control,
	Column,
	Text,
	Filter,
	Table,
	OverflowToolbar,
	SearchField,
	ToolbarSpacer,
	OverflowToolbarButton,
	OverflowToolbarLayoutData,
	DragDropInfo,
	ShortcutHintsMixin,
	KeyCodes,
	Log,
	Device,
	library,
	coreLibrary,
	MessageStrip,
	InvisibleText
) => {
	"use strict";

	/**
	 * P13n <code>Item</code> object type.
	 *
	 * @static
	 * @constant
	 * @typedef {object} sap.m.p13n.Item
	 * @property {string} name The unique key of the item
	 * @property {string} label The label describing the personalization item
	 * @property {boolean} visible Defines the selection state of the personalization item
	 * @public
	 */

	/**
	 * Constructor for a new <code>BasePanel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control serves as base class for personalization implementations.
	 * This faceless class serves as a way to implement control-specific personalization panels.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @abstract
	 *
	 * @since 1.96
	 * @alias sap.m.p13n.BasePanel
	 */
	const BasePanel = Control.extend("sap.m.p13n.BasePanel", {
		metadata: {
			library: "sap.m",
			interfaces: [
				"sap.m.p13n.IContent"
			],
			associations: {},
			properties: {
				/**
				 * A short text describing the panel.
				 * <b>Note:</b> This text will only be displayed if the panel is being used in a <code>sap.m.p13n.Popup</code>.
				 */
				title: {
					type: "string"
				},
				/**
				 * Determines whether the reordering of personalization items is enabled.
				 */
				enableReorder: {
					type: "boolean",
					defaultValue: true
				},

				/**
				 * Determines whether the panel has a fixed width.
				 *
				 * @private
				 * @ui5-private sap.ui.mdc
				 */
				_useFixedWidth: {
					type: "boolean",
					defaultValue: false,
					visibility: "hidden"
				}
			},
			aggregations: {
				/**
				 * Defines an optional message strip to be displayed in the content area.
				 */
				messageStrip: {
					type: "sap.m.MessageStrip",
					multiple: false
				},
				/**
				 * Content to be set for the <code>BasePanel</code>.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * This template is going to be set from the implementing panel using the <code>BasePanel</code> control, by setting the template
				 * for the columns of the inner <code>sap.m.Table</code>.
				 */
				_template: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * This event is fired if any change has been made within the <code>BasePanel</code> control.
				 */
				change: {
					parameters: {
						/**
						 * The reason why the panel state has changed, for example, items have been added, removed, or moved.
						 */
						reason: {
							type: "string"
						},
						/**
						 * An object containing information about the specific item that has been changed.
						 */
						item: {
							type: "sap.m.p13n.Item"
						}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", "100%");
				if (oControl.getProperty("_useFixedWidth")) {
					oRm.style("width", oControl.getWidth());
				}
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	//inner model name
	BasePanel.prototype.P13N_MODEL = "$p13n";

	//constants for change event reasoning
	BasePanel.prototype.CHANGE_REASON_ADD = "Add";
	BasePanel.prototype.CHANGE_REASON_REMOVE = "Remove";
	BasePanel.prototype.CHANGE_REASON_MOVE = "Move";
	BasePanel.prototype.CHANGE_REASON_SELECTALL = "SelectAll";
	BasePanel.prototype.CHANGE_REASON_DESELECTALL = "DeselectAll";
	BasePanel.prototype.CHANGE_REASON_RANGESELECT = "RangeSelect";

	//defines the name of the attribute describing the presence/active state
	BasePanel.prototype.PRESENCE_ATTRIBUTE = "visible";
	BasePanel.prototype.WIDTH = "30rem";

	BasePanel.prototype.applySettings = function(mSettings) {
		Control.prototype.applySettings.apply(this, arguments);
		if (!mSettings || (mSettings && mSettings.enableReorder === undefined)) {
			this._updateMovement(true);
		}
	};

	BasePanel.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);

		this._oP13nModel = new JSONModel({});
		this._oP13nModel.setSizeLimit(10000);
		this.setModel(this._oP13nModel, this.P13N_MODEL);

		// list is necessary to set the template + model on
		this._oListControl = this._createInnerListControl();

		this._oInvText = new InvisibleText({
			text: this.getTitle() //use the Panel title als invisibleText title for the table
		});
		this._oListControl.addAriaLabelledBy(this._oInvText);

		// Determines whether the rearranged item should be focused
		this._bFocusOnRearrange = true;

		this._setInnerLayout();
	};

	BasePanel.prototype.onAfterRendering = function() {
		if (!this._oResizeObserver) {
			this._oResizeObserver = new ResizeObserver(this._onResize.bind(this));
		}
		this._oResizeObserver.observe(this.getDomRef());
	};

	/**
	 * Can be overwritten if a different wrapping control is required for the inner content.
	 */
	BasePanel.prototype._setInnerLayout = function() {
		this.setAggregation("_content", new VBox({
			items: [
				this._oListControl,
				this._oInvText
			]
		}));
	};

	/**
	 * Sets the personalization state of the panel instance.
	 *
	 * @public
	 * @param {sap.m.p13n.Item[]} aP13nData An array containing the personalization state that is represented by the <code>BasePanel</code>.
	 * @returns {this} The BasePanel instance
	 */
	BasePanel.prototype.setP13nData = function(aP13nData) {
		this._getP13nModel().setProperty("/items", aP13nData);
		return this;
	};

	/**
	 * Returns the personalization state that is currently displayed by the <code>BasePanel</code>.
	 * @public
	 * @param {boolean} bOnlyActive Determines whether only the present items is included
	 * @returns {sap.m.p13n.Item[]} An array containing the personalization state that is currently displayed by the <code>BasePanel</code>
	 */
	BasePanel.prototype.getP13nData = function(bOnlyActive) {
		let aItems = this._getP13nModel().getProperty("/items");
		if (bOnlyActive) {
			aItems = aItems.filter((oItem) => {
				return oItem[this.PRESENCE_ATTRIBUTE];
			});
		}
		return aItems;
	};

	/**
	 * Gets the corresponding <code>sap.m.p13n.Item</code> for the provided key.
	 *
	 * @public
	 * @param {string} sName The unique identifier
	 * @returns {sap.m.p13n.Item|null} The personalization model item
	 */
	BasePanel.prototype.getItemByKey = function(sName) {
		return this.getP13nData().find((oP13nItem) => oP13nItem.name == sName);
	};

	/**
	 * Displays a <code>sap.m.MessageStrip</code> instance in the content area of the <code>BasePanel</code>.
	 *
	 * @public
	 * @param {sap.m.MessageStrip} oStrip Instance of a sap.m.MessageStrip
	 * @returns {sap.m.p13n.BasePanel} The <code>BasePanel</code> instance
	 */
	BasePanel.prototype.setMessageStrip = function(oStrip) {
		if (!oStrip) {
			this.getAggregation("_content").removeItem(this._oMessageStrip);
			this._oMessageStrip = null;
		} else {
			oStrip.addStyleClass("sapUiSmallMargin");
			if (this._oMessageStrip) {
				this._oMessageStrip.destroy();
			}
			this._oMessageStrip = oStrip;
			this.getAggregation("_content").insertItem(oStrip, 0);
		}

		return this;
	};

	/**
	 * Getter for the <code>messageStrip</code> aggregation.
	 *
	 * @public
	 * @returns {sap.m.p13n.BasePanel} The BasePanel instance
	 */
	BasePanel.prototype.getMessageStrip = function() {
		return this._oMessageStrip;
	};

	/**
	 * Getter for the fixed panel width
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @returns {string} The fixed panel width
	 */
	BasePanel.prototype.getWidth = function() {
		return this.WIDTH;
	};

	/**
	 * @param {boolean} bEnableReorder Determines whether reordering is enabled
	 * @private
	 * @returns {sap.m.p13n.BasePanel} The BasePanel instance
	 */
	BasePanel.prototype._updateMovement = function(bEnableReorder) {
		const oTemplate = this.getAggregation("_template");
		if (bEnableReorder) {
			this._addHover(oTemplate);
		} else if (oTemplate && oTemplate.aDelegates && oTemplate.aDelegates.length > 0) {
			oTemplate.removeEventDelegate(oTemplate.aDelegates[0].oDelegate);
		}
		this._getDragDropConfig().setEnabled(bEnableReorder);
		this._setMoveButtonVisibility(bEnableReorder);

		return this;
	};

	/**
	 * The <code>enableReorder</code> property determines whether additional move buttons are shown when hovering over
	 * the inner list. In addition, drag and drop will be enabled for the inner list control.
	 *
	 * @param {boolean} bEnableReorder Determines whether reordering is enabled
	 * @public
	 * @returns {sap.m.p13n.BasePanel} The BasePanel instance
	 */
	BasePanel.prototype.setEnableReorder = function(bEnableReorder) {
		this.setProperty("enableReorder", bEnableReorder);
		this._updateMovement(bEnableReorder);

		return this;
	};

	/**
	 * Trigger to update the panel after outer influences (e.g. sap.m.p13n.Popup) trigger a reset on the panel
	 *
	 * @private
	 * @ui5-restricted
	 */
	BasePanel.prototype.onReset = function() {
		this._getSearchField()?.setValue(""); //Reset the searchfield string
		this._oListControl.getBinding("items")?.filter([]); //Reset the filtering
	};

	BasePanel.prototype._getDragDropConfig = function() {
		if (!this._oDragDropInfo) {
			this._oDragDropInfo = new DragDropInfo({
				enabled: false,
				sourceAggregation: "items",
				targetAggregation: "items",
				dropPosition: "Between",
				drop: [this._onRearrange, this]
			});
		}
		return this._oDragDropInfo;
	};

	BasePanel.prototype._getMoveTopButton = function() {
		if (!this._oMoveTopButton) {
			this._oMoveTopButton = new OverflowToolbarButton(this.getId() + "-moveTopBtn", {
				type: "Transparent",
				tooltip: this._getResourceText("p13n.MOVE_TO_TOP"),
				icon: "sap-icon://collapse-group",
				press: [this._onPressButtonMoveToTop, this],
				visible: false
			});
			this.addDependent(this._oMoveTopButton);

			ShortcutHintsMixin.addConfig(this._oMoveTopButton, {
					addAccessibilityLabel: true,
					message: this._getResourceText(Device.os.macintosh ? "p13n.SHORTCUT_MOVE_TO_TOP_MAC" : "p13n.SHORTCUT_MOVE_TO_TOP") // Cmd+Home or Ctrl+Home
				}, this
			);
		}

		return this._oMoveTopButton;
	};

	BasePanel.prototype._getMoveUpButton = function() {
		if (!this._oMoveUpButton) {
			this._oMoveUpButton = new OverflowToolbarButton(this.getId() + "-moveUpBtn", {
				type: "Transparent",
				tooltip: this._getResourceText("p13n.MOVE_UP"),
				icon: "sap-icon://navigation-up-arrow",
				press: [this._onPressButtonMoveUp, this],
				visible: false
			});
			this.addDependent(this._oMoveUpButton);

			ShortcutHintsMixin.addConfig(this._oMoveUpButton, {
					addAccessibilityLabel: true,
					message: this._getResourceText(Device.os.macintosh ? "p13n.SHORTCUT_MOVE_UP_MAC" : "p13n.SHORTCUT_MOVE_UP") // Cmd+CursorUp or Ctrl+CursorUp
				}, this
			);

		}

		return this._oMoveUpButton;
	};

	BasePanel.prototype._getMoveDownButton = function() {
		if (!this._oMoveDownButton) {
			this._oMoveDownButton = new OverflowToolbarButton(this.getId() + "-moveDownpBtn", {
				type: "Transparent",
				tooltip: this._getResourceText("p13n.MOVE_DOWN"),
				icon: "sap-icon://navigation-down-arrow",
				press: [this._onPressButtonMoveDown, this],
				visible: false
			});
			this.addDependent(this._oMoveDownButton);

			ShortcutHintsMixin.addConfig(this._oMoveDownButton, {
					addAccessibilityLabel: true,
					message: this._getResourceText(Device.os.macintosh ? "p13n.SHORTCUT_MOVE_DOWN_MAC" : "p13n.SHORTCUT_MOVE_DOWN") // Cmd+CursorDown or Ctrl+CursorDown
				}, this
			);
		}

		return this._oMoveDownButton;
	};

	BasePanel.prototype._getMoveBottomButton = function() {
		if (!this._oMoveBottomButton) {
			this._oMoveBottomButton = new OverflowToolbarButton(this.getId() + "-moveBottomBtn", {
				type: "Transparent",
				tooltip: this._getResourceText("p13n.MOVE_TO_BOTTOM"),
				icon: "sap-icon://expand-group",
				press: [this._onPressButtonMoveToBottom, this],
				visible: false
			});
			this.addDependent(this._oMoveBottomButton);

			ShortcutHintsMixin.addConfig(this._oMoveBottomButton, {
					addAccessibilityLabel: true,
					message: this._getResourceText(Device.os.macintosh ? "p13n.SHORTCUT_MOVE_TO_BOTTOM_MAC" : "p13n.SHORTCUT_MOVE_TO_BOTTOM") // Cmd+End or Ctrl+End
				}, this
			);

		}

		return this._oMoveBottomButton;
	};

	BasePanel.prototype._onResize = function(aResizeEntity) {
		const oDomRect = aResizeEntity[0].contentRect;
		if (this._oMoveTopButton) {
			this._oMoveTopButton.setVisible(oDomRect.width > 400);
		}
		if (this._oMoveBottomButton) {
			this._oMoveBottomButton.setVisible(oDomRect.width > 400);
		}
	};

	BasePanel.prototype._createInnerListControl = function() {
		return new Table(this.getId() + "-innerP13nList", Object.assign(this._getListControlConfig(), {
			headerToolbar: new OverflowToolbar({
				content: [
					this._getSearchField(),
					new ToolbarSpacer(),
					this._getMoveTopButton(),
					this._getMoveUpButton(),
					this._getMoveDownButton(),
					this._getMoveBottomButton()
				]
			})
		}));
	};

	BasePanel.prototype._addHover = function(oRow) {
		if (oRow && oRow.aDelegates.length < 1) {
			oRow.addEventDelegate({
				onmouseover: this._hoverHandler.bind(this),
				onfocusin: this._focusHandler.bind(this),
				onkeydown: this._keydownHandler.bind(this)
			});
		}
	};

	BasePanel.prototype._keydownHandler = function(oEvent) {
		if (!this.getEnableReorder()) {
			return;
		}

		if (oEvent.isMarked()) {
			return;
		}

		// Log.info("onKeyDown", oEvent.ctrlKey  + " | " + oEvent.which + " | " + oEvent.key);

		if ((oEvent.metaKey || oEvent.ctrlKey)) {
			let oButton;
			if (oEvent.which === KeyCodes.HOME) {
				oButton = this._getMoveTopButton();
			}
			if (oEvent.which === KeyCodes.ARROW_UP) {
				oButton = this._getMoveUpButton();
			}
			if (oEvent.which === KeyCodes.ARROW_DOWN) {
				oButton = this._getMoveDownButton();
			}
			if (oEvent.which === KeyCodes.END) {
				oButton = this._getMoveBottomButton();
			}

			if (oButton && oButton.getParent() && oButton.getVisible() && oButton.getEnabled()) {
				// Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser defaults
				oEvent.setMarked();
				oEvent.preventDefault();
				oEvent.stopPropagation();

				oButton.firePress();
			}
		}

	};

	BasePanel.prototype._focusHandler = function(oEvt) {
		if (!this.getEnableReorder()) {
			return;
		}

		//(new) hovered item
		const oHoveredItem = Element.getElementById(oEvt.currentTarget.id);
		this._handleActivated(oHoveredItem);
	};

	BasePanel.prototype._hoverHandler = function(oEvt) {
		//Only use hover if no item has been selected yet
		if (this._oSelectedItem && !this._oSelectedItem.bIsDestroyed) {
			return;
		}

		if (!this.getEnableReorder()) {
			return;
		}

		//(new) hovered item
		const oHoveredItem = Element.getElementById(oEvt.currentTarget.id);

		this._handleActivated(oHoveredItem);
	};

	BasePanel.prototype._handleActivated = function(oHoveredItem) {
		this._oHoveredItem = oHoveredItem;
		//Implement custom hover handling in derivation here..
	};

	BasePanel.prototype._getListControlConfig = function() {
		return {
			mode: "MultiSelect",
			rememberSelections: true,
			itemPress: [this._onItemPressed, this],
			selectionChange: [this._onSelectionChange, this],
			sticky: ["HeaderToolbar", "ColumnHeaders", "InfoToolbar"],
			dragDropConfig: this._getDragDropConfig()
		};
	};

	BasePanel.prototype._getSearchField = function() {
		if (!this._oSearchField) {
			this._oSearchField = new SearchField(this.getId() + "-searchField", {
				liveChange: [this._onSearchFieldLiveChange, this],
				width: "100%",
				layoutData: new OverflowToolbarLayoutData({
					shrinkable: true,
					priority: "High",
					maxWidth: "16rem"
				})
			});
		}
		return this._oSearchField;
	};

	/**
	 * Getter for the initial focusable <code>control</code> on the panel.
	 *
	 * @returns {sap.ui.core.Control} Control instance which could get the focus.
	 *
	 * @private
	 * @ui5-restricted sap.m, sap.ui.mdc
	 */
	BasePanel.prototype.getInitialFocusedControl = function() {
		return this._oSearchField;
	};

	BasePanel.prototype.setTitle = function(sTitle) {
		this.setProperty("title", sTitle);
		this._oInvText?.setText(sTitle);

		return this;
	};

	BasePanel.prototype._setTemplate = function(oTemplate) {
		oTemplate.setType("Active");
		const oCurrentTemplate = this.getAggregation("_template");
		if (oCurrentTemplate) {
			oCurrentTemplate.destroy();
		}
		this.setAggregation("_template", oTemplate);
		if (oTemplate) {
			if (this.getEnableReorder()) {
				this._addHover(oTemplate);
			}
			this._oSelectionBindingInfo = oTemplate.getBindingInfo("selected");
			// Extract the binding info parts
			if (this._oSelectionBindingInfo && this._oSelectionBindingInfo.parts) {
				this._oSelectionBindingInfo = {
					parts: this._oSelectionBindingInfo.parts
				};
			}
		}
		this._bindListItems();
		return this;
	};

	BasePanel.prototype._setPanelColumns = function(vColumns) {
		let aColumns;
		if (vColumns instanceof Array) {
			aColumns = vColumns;
		} else {
			aColumns = [
				vColumns
			];
		}
		this._addTableColumns(aColumns);
	};

	BasePanel.prototype._getP13nModel = function() {
		return this.getModel(this.P13N_MODEL);
	};

	BasePanel.prototype._getResourceText = function(sText, aValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : Library.getResourceBundleFor("sap.m");
		return sText ? this.oResourceBundle.getText(sText, aValue) : this.oResourceBundle;
	};

	BasePanel.prototype._addTableColumns = function(aColumns) {
		const aRemovedColumns = this._oListControl.removeAllColumns();
		aRemovedColumns.forEach((oRemovedColumn) => {
			oRemovedColumn.destroy();
		});
		aColumns.forEach(function(vColumn) {
			let oColumn;

			if (typeof vColumn == "string") {
				oColumn = new Column({
					header: new Text({
						text: vColumn
					})
				});
			} else {
				oColumn = vColumn;
			}

			this._oListControl.addColumn(oColumn);
		}, this);
	};

	BasePanel.prototype._bindListItems = function(mBindingInfo) {
		const oTemplate = this.getAggregation("_template");
		if (oTemplate) {
			this._oListControl.bindItems(Object.assign({
				path: this.P13N_MODEL + ">/items",
				key: "name",
				templateShareable: false,
				template: this.getAggregation("_template").clone()
			}, mBindingInfo));
		}
	};

	BasePanel.prototype._onSelectionChange = function(oEvent) {

		const aListItems = oEvent.getParameter("listItems");
		const sSpecialChangeReason = this._checkSpecialChangeReason(oEvent.getParameter("selectAll"), oEvent.getParameter("listItems"));

		aListItems.forEach(function(oTableItem) {
			this._selectTableItem(oTableItem, !!sSpecialChangeReason);
		}, this);

		if (sSpecialChangeReason) {

			const aModelItems = [];
			aListItems.forEach(function(oTableItem) {
				aModelItems.push(this._getModelEntry(oTableItem));
			}, this);

			this.fireChange({
				reason: sSpecialChangeReason,
				item: aModelItems
			});
		}

		// in case of 'deselect all', the move buttons for positioning are going to be disabled
		if (sSpecialChangeReason === this.CHANGE_REASON_DESELECTALL) {
			this._getMoveTopButton().setEnabled(false);
			this._getMoveUpButton().setEnabled(false);
			this._getMoveDownButton().setEnabled(false);
			this._getMoveBottomButton().setEnabled(false);
		}
	};

	BasePanel.prototype._checkSpecialChangeReason = function(bSelectAll, aListItems) {
		let sSpecialChangeReason;

		if (bSelectAll) {
			sSpecialChangeReason = this.CHANGE_REASON_SELECTALL;
		} else if (!bSelectAll && aListItems.length > 1 && !aListItems[0].getSelected()) {
			sSpecialChangeReason = this.CHANGE_REASON_DESELECTALL;
		} else if (aListItems.length > 1 && aListItems.length < this._oListControl.getItems().length) {
			sSpecialChangeReason = this.CHANGE_REASON_RANGESELECT;
		}

		return sSpecialChangeReason;
	};

	BasePanel.prototype._onItemPressed = function(oEvent) {
		const oTableItem = oEvent.getParameter('listItem');
		this._oSelectedItem = oTableItem;

		const oContext = oTableItem.getBindingContext(this.P13N_MODEL);
		if (this.getEnableReorder() && oContext && oContext.getProperty(this.PRESENCE_ATTRIBUTE)) {
			this._handleActivated(oTableItem);
			this._updateEnableOfMoveButtons(oTableItem, true);
		}
	};

	BasePanel.prototype._onSearchFieldLiveChange = function(oEvent) {
		this._oListControl.getBinding("items").filter(new Filter("label", "Contains", oEvent.getSource().getValue()));
	};

	BasePanel.prototype._onPressButtonMoveToTop = function() {
		this._moveSelectedItem(0);
	};

	BasePanel.prototype._onPressButtonMoveUp = function() {
		this._moveSelectedItem("Up");
	};

	BasePanel.prototype._onPressButtonMoveDown = function() {
		this._moveSelectedItem("Down");
	};

	BasePanel.prototype._onPressButtonMoveToBottom = function() {
		const iIndex = this._oListControl.getItems().length - 1;
		this._moveSelectedItem(iIndex);
	};

	BasePanel.prototype._setMoveButtonVisibility = function(bVisible) {
		this._getMoveTopButton().setVisible(bVisible);
		this._getMoveUpButton().setVisible(bVisible);
		this._getMoveDownButton().setVisible(bVisible);
		this._getMoveBottomButton().setVisible(bVisible);
	};

	BasePanel.prototype._filterBySelected = function(bShowSelected, oList) {
		oList.getBinding("items").filter(bShowSelected ? new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true) : []);
	};

	BasePanel.prototype._selectTableItem = function(oTableItem, bSpecialChangeReason) {
		this._updateEnableOfMoveButtons(oTableItem, bSpecialChangeReason ? false : true);
		this._oSelectedItem = oTableItem;
		if (!bSpecialChangeReason) {
			const oItem = this._getP13nModel().getProperty(this._oSelectedItem.getBindingContext(this.P13N_MODEL).sPath);

			this.fireChange({
				reason: oItem[this.PRESENCE_ATTRIBUTE] ? this.CHANGE_REASON_ADD : this.CHANGE_REASON_REMOVE,
				item: oItem
			});
		}
	};

	BasePanel.prototype._moveSelectedItem = function(vNewIndex) {
		const oSelectedItem = this._oSelectedItem;
		const iSelectedIndex = this._oListControl.indexOfItem(oSelectedItem);
		if (iSelectedIndex < 0) {
			return;
		}

		// determine the new index relative to selected index when "Up" or "Down" is passed as a parameter
		const iNewIndex = (typeof vNewIndex == "number") ? vNewIndex : iSelectedIndex + (vNewIndex == "Up" ? -1 : 1);
		this._moveTableItem(oSelectedItem, iNewIndex);

	};

	BasePanel.prototype._getModelEntry = function(oItem) {
		return oItem.getBindingContext(this.P13N_MODEL).getObject();
	};

	BasePanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		const aItems = this._oListControl.getItems();
		const aModelItems = this._getP13nModel().getProperty("/items");

		// index of the item in the model not the index in the aggregation
		const iOldModelIndex = aModelItems.indexOf(this._getModelEntry(oItem));

		// limit the minumum and maximum index
		let iNewModelIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		iNewModelIndex = aModelItems.indexOf(this._getModelEntry(aItems[iNewIndex]));
		if (iNewModelIndex == iOldModelIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aModelItems.splice(iNewModelIndex, 0, aModelItems.splice(iOldModelIndex, 1)[0]);
		this._getP13nModel().setProperty("/items", aModelItems);

		// store the moved item again due to binding
		this._oSelectedItem = this._oListControl.getItems()[iNewIndex];

		this._updateEnableOfMoveButtons(this._oSelectedItem, this._bFocusOnRearrange);

		this._handleActivated(this._oSelectedItem);

		this.fireChange({
			reason: this.CHANGE_REASON_MOVE,
			item: this._getModelEntry(oItem)
		});
	};

	BasePanel.prototype._onRearrange = function(oEvent) {
		const oDraggedItem = oEvent.getParameter("draggedControl");
		if (!oDraggedItem?.getMultiSelectControl()?.getEnabled()) {
			return;
		}

		const oDroppedItem = oEvent.getParameter("droppedControl");
		const sDropPosition = oEvent.getParameter("dropPosition");
		const iDraggedIndex = this._oListControl.indexOfItem(oDraggedItem);
		const iDroppedIndex = this._oListControl.indexOfItem(oDroppedItem);
		const iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		this._moveTableItem(oDraggedItem, iActualDroppedIndex);
	};

	BasePanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {
		const iTableItemPos = this._oListControl.getItems().indexOf(oTableItem);
		let bUpEnabled = true,
			bDownEnabled = true;
		if (iTableItemPos == 0) {
			// disable move buttons upwards, if the item is at the top
			bUpEnabled = false;
		}
		if (iTableItemPos == this._oListControl.getItems().length - 1) {
			// disable move buttons downwards, if the item is at the bottom
			bDownEnabled = false;
		}
		this._getMoveTopButton().setEnabled(bUpEnabled);
		this._getMoveUpButton().setEnabled(bUpEnabled);
		this._getMoveDownButton().setEnabled(bDownEnabled);
		this._getMoveBottomButton().setEnabled(bDownEnabled);
		if (bFocus) {
			oTableItem.focus();
		}
	};

	BasePanel.prototype.exit = function() {
		Control.prototype.exit.apply(this, arguments);
		this._oResizeObserver = null;
		this._bFocusOnRearrange = null;
		this._oHoveredItem = null;
		this._oSelectionBindingInfo = null;
		this._oSelectedItem = null;
		this._oListControl = null;
		this._oMoveTopButton = null;
		this._oMoveUpButton = null;
		this._oMoveDownButton = null;
		this._oMoveBottomButton = null;
		this._oSearchField = null;
	};

	return BasePanel;
});