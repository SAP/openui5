/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control', 'sap/m/Column', 'sap/m/Text', 'sap/ui/model/Filter', "sap/m/Table", "sap/m/OverflowToolbar", "sap/m/SearchField", "sap/m/ToolbarSpacer", "sap/m/OverflowToolbarButton", "sap/m/OverflowToolbarLayoutData", "sap/m/Button", "sap/ui/core/dnd/DragDropInfo"
], function(Control, Column, Text, Filter, Table, OverflowToolbar, SearchField, ToolbarSpacer, OverflowToolbarButton, OverflowToolbarLayoutData, Button, DragDropInfo) {
	"use strict";

	/**
	 * Constructor for BasePanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class TODO
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.66
	 * @alias sap.ui.mdc.p13n.panels.BasePanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BasePanel = Control.extend("sap.ui.mdc.p13n.panels.BasePanel", {
		library: "sap.ui.mdc",

		metadata: {
			library: "sap.ui.mdc",
			associations: {},
			defaultAggregation: "items",
			properties: {
				/**
				 * Callback executed once the <code>Reset</code> Button has been pressed.
				 */
				onReset: {
					type: "function",
					defaultValue: false
				}
			},
			aggregations: {
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
				template: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired if there has been made any change within the <code>BasePanel</code> control.
				 */
				change: {
					reason: {
						type: "String"
					},
					item: {
						type: "Object"
					}
				}
			}
		},
		init: function() {
			// list is necessary to set the template + model on
			this._oListControl = this._createInnerListControl();

			// disable 'select all'
			this._oListControl.bPreventMassSelection = true;

			this._setInnerLayout();
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("div");
			}
		}

	});

	/**
	 * Can be overwritten in case a different wrapping Control is required for the inner content
	 */
	BasePanel.prototype._setInnerLayout = function() {
		this.setAggregation("_content", this._oListControl);
	};

	BasePanel.prototype._createInnerListControl = function(){

		this._moveTopButton = new OverflowToolbarButton("IDButtonMoveToTop",{
			type: "Transparent",
			tooltip: this.getResourceText("p13nDialog.MOVE_TO_TOP"),
			icon: "sap-icon://collapse-group",
			press: [this._onPressButtonMoveToTop, this],
			visible: false,
			layoutData: new OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: "Low",
				group: 2
			})
		});
		this._moveUpButton = new OverflowToolbarButton("IDButtonMoveUp",{
			type: "Transparent",
			tooltip: this.getResourceText("p13nDialog.MOVE_UP"),
			icon: "sap-icon://slim-arrow-up",
			press: [this._onPressButtonMoveUp, this],
			visible: false,
			layoutData: new OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: "High",
				group: 1
			})
		});
		this._moveDownButton = new OverflowToolbarButton("IDButtonMoveDown",{
			type: "Transparent",
			tooltip: this.getResourceText("p13nDialog.MOVE_DOWN"),
			icon: "sap-icon://slim-arrow-down",
			press: [this._onPressButtonMoveDown, this],
			visible: false,
			layoutData: new OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: "High",
				group: 1
			})
		});
		this._moveBottomButton = new OverflowToolbarButton("IDButtonMoveToBottom",{
			type: "Transparent",
			tooltip: this.getResourceText("p13nDialog.MOVE_TO_BOTTOM"),
			icon: "sap-icon://expand-group",
			press: [this._onPressButtonMoveToBottom, this],
			visible: false,
			layoutData: new OverflowToolbarLayoutData({
				moveToOverflow: true,
				priority: "Low",
				group: 2
			})
		});

		this._oDragDropInfo = new DragDropInfo({
			enabled: false,
			sourceAggregation: "items",
			targetAggregation: "items",
			dropPosition: "Between",
			drop: [this._onRearrange, this]
		});

		var oReorderButton = new Button("IDshowSelectedBtn",{
			text: {
				path: "/reorderMode",
				formatter: function (bReorderMode) {
					return bReorderMode ? this.getResourceText("p13nDialog.SELECT") : this.getResourceText("p13nDialog.REORDER");
				}.bind(this)
			},
			press: [this._onPressToggleMode, this]
		});

		var oBasePanelUI = new Table(this.getId() + "idBasePanelTable", {
			mode:"MultiSelect",
			rememberSelections: false,
			itemPress: [this._onItemPressed, this],
			selectionChange: [this._onSelectionChange, this],
			sticky: ["HeaderToolbar", "ColumnHeaders"],
			headerToolbar: new OverflowToolbar({
				content: [
					this._getSearchField(),
					new ToolbarSpacer(),
					this._moveTopButton,
					this._moveUpButton,
					this._moveDownButton,
					this._moveBottomButton,
					oReorderButton
				]
			}),
			dragDropConfig: this._oDragDropInfo
		});

		return oBasePanelUI;
	};

	BasePanel.prototype._getSearchField = function() {
		if (!this._oSearchField) {
			this._oSearchField = new SearchField(this.getId() + "IDSearchField",{
				liveChange: [this._onSearchFieldLiveChange, this],
				width: "100%",
				layoutData: new OverflowToolbarLayoutData({
					shrinkable: true,
					moveToOverflow: true,
					priority: "High",
					maxWidth: "16rem"
				})
			});
		}
		return this._oSearchField;
	};

	BasePanel.prototype.setTemplate = function(oTemplate) {
		this.setAggregation("template", oTemplate);
		if (oTemplate) {
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

	BasePanel.prototype.setPanelColumns = function(sTexts) {
		var aTexts;
		if (sTexts instanceof Array) {
			aTexts = sTexts;
		} else {
			aTexts = [
				sTexts
			];
		}
		this._addTableColumns(aTexts);
	};

	/**
	 * @param {Object} oP13nModel Personalization model provided by sap.ui.mdc.p13n.P13nBuilder
	 */
	BasePanel.prototype.setP13nModel = function(oP13nModel) {
		this.setModel(oP13nModel);
		//initial value for "Reorder"-mode is false
		this.setPanelMode(false);
	};

	BasePanel.prototype.getResourceText = function(sText) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		return sText ? this.oResourceBundle.getText(sText) : this.oResourceBundle;
	};

	BasePanel.prototype._addTableColumns = function(aTexts) {
		this._oListControl.removeAllColumns();
		aTexts.forEach(function(sText) {
			this._oListControl.addColumn(new Column({
				header: new Text({
					text: sText
				})
			}));
		}, this);
	};

	BasePanel.prototype._bindListItems = function(mBindingInfo) {
		var oTemplate = this.getTemplate();
		if (oTemplate) {
			/*
			* NOTE: as the dialog offers two modes (Select / Reorder) for personalization changes,
			* the type is only required as "Active" in case the user is in "Reorder"-mode, as there
			* are no buttons visible in "Select"-mode. This is only being used to disable/enable the
			* buttons in the "Reorder"-mode via press event.
			*/
			oTemplate.bindProperty("type", {
				path: "/reorderMode",
				formatter: function(bReorderMode) {
					return bReorderMode ? "Active" : "Inactive";
				}
			});
			this._oListControl.bindItems(Object.assign({
				path: "/items",
				key: "name",
				templateShareable: false,
				template: this.getTemplate().clone()
			}, mBindingInfo));
		}
	};

	BasePanel.prototype._onSelectionChange = function(oEvent) {

		var aListItems = oEvent.getParameter("listItems");
		var bSelectAll = oEvent.getParameter("selectAll");
		var bDeSelectAll = !bSelectAll && aListItems.length > 1;

		aListItems.forEach(function(oTableItem) {
			this._selectTableItem(oTableItem, bSelectAll || bDeSelectAll);
		}, this);

		if (bSelectAll || bDeSelectAll) {
			this.fireChange();
		}

		// in case of 'deselect all', the move buttons for positioning are going to be disabled
		if (bDeSelectAll) {
			this._moveTopButton.setEnabled(false);
			this._moveUpButton.setEnabled(false);
			this._moveDownButton.setEnabled(false);
			this._moveBottomButton.setEnabled(false);
		}
	};

	BasePanel.prototype._onItemPressed = function(oEvent) {
		var oTableItem = oEvent.getParameter('listItem');
		this._oSelectedItem = oTableItem;
		this._updateEnableOfMoveButtons(oTableItem);
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
		var iIndex = this._oListControl.getItems().length - 1;
		this._moveSelectedItem(iIndex);
	};

	BasePanel.prototype._onPressToggleMode = function(oEvent) {
		this._togglePanelMode();
	};

	BasePanel.prototype.getPanelMode = function() {
		return this.getModel().getProperty("/reorderMode");
	};

	BasePanel.prototype.setPanelMode = function(bReorder) {
		return this.getModel().setProperty("/reorderMode", bReorder);
	};

	BasePanel.prototype._togglePanelMode = function() {
		// switch panel mode
		var bReorderMode = !this.getPanelMode();
		this.setPanelMode(bReorderMode);

		if (bReorderMode) {
			this._updateModelItems();
		}
		// Switch the list mode (which also unbinds selection) and then filter by selected
		this.switchListMode(bReorderMode ? "None" : "MultiSelect");
		this._filterBySelected(bReorderMode, this._oListControl);
		// Show/Hide and clear the search field
		this._oSearchField.setVisible(!bReorderMode);
		this._oSearchField.setValue("");

		// set the movement buttons to visible / invisible
		this._moveTopButton.setVisible(bReorderMode);
		this._moveUpButton.setVisible(bReorderMode);
		this._moveDownButton.setVisible(bReorderMode);
		this._moveBottomButton.setVisible(bReorderMode);

		this._moveTopButton.setEnabled(false);
		this._moveUpButton.setEnabled(false);
		this._moveDownButton.setEnabled(false);
		this._moveBottomButton.setEnabled(false);

		//disable / enable d&d
		this._oDragDropInfo.setEnabled(bReorderMode);
	};

	BasePanel.prototype._updateModelItems = function() {
		// Sort and update the model items to ensure selected ones, are at the top
		var aFields = this.getModel().getProperty("/items");
		var aSelectedFields = [], aOtherFields = [];
		aFields.forEach(function(oField) {
			if (oField.selected) {
				aSelectedFields.push(oField);
			} else {
				aOtherFields.push(oField);
			}
		});
		this.getModel().setProperty("/items", aSelectedFields.concat(aOtherFields));
	};

	BasePanel.prototype._filterBySelected = function(bShowSelected, oList) {
		oList.getBinding("items").filter(bShowSelected ? new Filter("selected", "EQ", true) : []);
	};

	BasePanel.prototype.switchListMode = function(sMode) {
		// If selection binding exists then unbind the table items
		if (this._oSelectionBindingInfo) {
			if (sMode === "None") {
				// Unbind selected property
				this.getTemplate().unbindProperty("selected");
			} else {
				// bind selected property
				this.getTemplate().bindProperty("selected", this._oSelectionBindingInfo);
			}
			// Unbind the table to ensure selected is not used
			this._oListControl.unbindAggregation("items");
		}

		// Update the selection mode of the table
		this._oListControl.setMode(sMode);

		if (this._oSelectionBindingInfo) {
			// Bind the table to ensure selection state (selected binding) is used by the table
			this._bindListItems();
		}
	};

	BasePanel.prototype._selectTableItem = function(oTableItem, bSelectAll) {
		this._updateEnableOfMoveButtons(oTableItem);
		this._oSelectedItem = oTableItem;
		if (!bSelectAll) {
			var oItem = this.getModel().getProperty(this._oSelectedItem.getBindingContext().sPath);
			// only fire this event if one item is being selected in a live scenario, else fire the change event in the _onSelectionChange method
			this.fireChange({
				reason: oItem.selected ? "Add" : "Remove",
				item: oItem
			});
		}
	};

	BasePanel.prototype._moveSelectedItem = function(vNewIndex) {
		var oSelectedItem = this._oSelectedItem;
		var iSelectedIndex = this._oListControl.indexOfItem(oSelectedItem);
		if (iSelectedIndex < 0) {
			return;
		}

		// determine the new index relative to selected index when "Up" or "Down" is passed as a parameter
		var iNewIndex = (typeof vNewIndex == "number") ? vNewIndex : iSelectedIndex + (vNewIndex == "Up" ? -1 : 1);
		this._moveTableItem(oSelectedItem, iNewIndex);

	};

	BasePanel.prototype._moveTableItem = function(oItem, iNewIndex) {
		var aItems = this._oListControl.getItems();
		var aFields = this._oListControl.getModel().getProperty("/items");

		// index of the item in the model not the index in the aggregation
		var iOldIndex = aFields.indexOf(oItem.getBindingContext().getObject());

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		iNewIndex = aFields.indexOf(aItems[iNewIndex].getBindingContext().getObject());
		if (iNewIndex == iOldIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aFields.splice(iNewIndex, 0, aFields.splice(iOldIndex, 1)[0]);
		this._oListControl.getModel().setProperty("/items", aFields);

		// store the moved item again due to binding
		this._oSelectedItem = aItems[iNewIndex];

		this._updateEnableOfMoveButtons(this._oSelectedItem);

		this.fireChange({
			reason: "Move",
			item: this.getModel().getProperty(this._oSelectedItem.getBindingContext().sPath)
		});
	};

	BasePanel.prototype._onRearrange = function(oEvent) {
		var oDraggedItem = oEvent.getParameter("draggedControl");
		var oDroppedItem = oEvent.getParameter("droppedControl");
		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = this._oListControl.indexOfItem(oDraggedItem);
		var iDroppedIndex = this._oListControl.indexOfItem(oDroppedItem);
		var iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		this._moveTableItem(oDraggedItem, iActualDroppedIndex);
	};

	BasePanel.prototype._updateEnableOfMoveButtons = function(oTableItem) {
		var iTableItemPos = this._oListControl.getItems().indexOf(oTableItem);
		var bUpEnabled = true, bDownEnabled = true;
		if (iTableItemPos == 0) {
			// disable move buttons upwards, if the item is at the top
			bUpEnabled = false;
		}
		if (iTableItemPos == this._oListControl.getItems().length - 1) {
			// disable move buttons downwards, if the item is at the bottom
			bDownEnabled = false;
		}
		this._moveTopButton.setEnabled(bUpEnabled);
		this._moveUpButton.setEnabled(bUpEnabled);
		this._moveDownButton.setEnabled(bDownEnabled);
		this._moveBottomButton.setEnabled(bDownEnabled);
		oTableItem.focus();
	};

	BasePanel.prototype.exit = function() {
		this._oSelectionBindingInfo = null;
		this._oSelectedItem = null;
		this._oListControl = null;
		this._moveTopButton = null;
		this._moveUpButton = null;
		this._moveDownButton = null;
		this._moveBottomButton = null;
		this._oSearchField = null;
	};

	return BasePanel;
});
