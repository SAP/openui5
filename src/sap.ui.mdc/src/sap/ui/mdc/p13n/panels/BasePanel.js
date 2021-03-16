/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/m/VBox', 'sap/ui/core/Control', 'sap/m/Column', 'sap/m/Text', 'sap/ui/model/Filter', "sap/m/Table", "sap/m/OverflowToolbar", "sap/m/SearchField", "sap/m/ToolbarSpacer", "sap/m/OverflowToolbarButton", "sap/m/OverflowToolbarLayoutData", "sap/m/Button", "sap/ui/core/dnd/DragDropInfo"
], function(VBox, Control, Column, Text, Filter, Table, OverflowToolbar, SearchField, ToolbarSpacer, OverflowToolbarButton, OverflowToolbarLayoutData, Button, DragDropInfo) {
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
		metadata: {
			library: "sap.ui.mdc",
			associations: {},
			defaultAggregation: "items",
			properties: {
				/**
				 * Factory function which can be used to enhance custom content
				 */
				itemFactory: {
					type: "function"
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
				},
				/**
				 * Defines an optional message strip to be displayed in the content area
				 */
				messageStrip: {
					type: "sap.m.MessageStrip",
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
			this._oListControl = this._createUI();

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

	BasePanel.prototype.P13N_MODEL = "$p13n";

	/**
	 * Can be overwritten in case a different wrapping Control is required for the inner content
	 */
	BasePanel.prototype._setInnerLayout = function() {
		this.setAggregation("_content", new VBox({
			items: [
				this._oListControl
			]
		}));
	};

	/**
	 * Displays a MessageStrip instance between the title and content area of the <code>BasePanel</code>.
	 *
	 * @param {sap.m.MessageStrip} oStrip Instance of a sap.m.MessageStrip
	 */
	BasePanel.prototype.setMessageStrip = function(oStrip){
		if (!oStrip) {
			this.getAggregation("_content").removeItem(this._oMessageStrip);
			this._oMessageStrip = null;
		} else {
			if (this._oMessageStrip) {
				this._oMessageStrip.destroy();
			}
			this._oMessageStrip = oStrip;
			this.getAggregation("_content").insertItem(oStrip, 0);
		}

		return this;
	};

	BasePanel.prototype._getDragDropConfig = function() {
		if (!this._oDragDropInfo){
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

	BasePanel.prototype._createUI = function(){
		var oBasePanelUI = this._createInnerListControl();
		return oBasePanelUI;
	};

	BasePanel.prototype._getMoveTopButton = function() {
		if (!this._oMoveTopBtn) {
			this._oMoveTopBtn = new OverflowToolbarButton(this.getId() + "-moveTopBtn",{
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
			this.addDependent(this._oMoveTopBtn);
		}

		return this._oMoveTopBtn;
	};

	BasePanel.prototype.getItems = function() {
		return this._oListControl.getItems();
	};

	BasePanel.prototype._getMoveUpButton = function() {
		if (!this._oMoveUpButton) {
			this._oMoveUpButton = new OverflowToolbarButton(this.getId() + "-moveUpBtn",{
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
			this.addDependent(this._oMoveUpButton);
		}

		return this._oMoveUpButton;
	};

	BasePanel.prototype._getMoveDownButton = function() {
		if (!this._oMoveDownButton) {
			this._oMoveDownButton = new OverflowToolbarButton(this.getId() + "-moveDownpBtn",{
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
			this.addDependent(this._oMoveDownButton);
		}

		return this._oMoveDownButton;
	};

	BasePanel.prototype._getMoveBottomButton = function() {
		if (!this._oMoveBottomButton) {
			this._oMoveBottomButton = new OverflowToolbarButton(this.getId() + "-moveBottomBtn",{
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
			this.addDependent(this._oMoveBottomButton);
		}

		return this._oMoveBottomButton;
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
					this._getMoveBottomButton(),
					this._getReorderButton()
				]
			})
		}));
	};

	BasePanel.prototype._getReorderButton = function() {
		if (!this.oReorderButton) {
			this.oReorderButton = new Button(this.getId() + "-showSelectedBtn",{
				text: {
					path: this.P13N_MODEL + ">/reorderMode",
					formatter: function (bReorderMode) {
						return bReorderMode ? this.getResourceText("p13nDialog.SELECT") : this.getResourceText("p13nDialog.REORDER");
					}.bind(this)
				},
				press: [this._onPressToggleMode, this]
			});
		}
		return this.oReorderButton;
	};

	BasePanel.prototype._getListControlConfig = function() {
		return {
			mode:"MultiSelect",
			rememberSelections: false,
			itemPress: [this._onItemPressed, this],
			selectionChange: [this._onSelectionChange, this],
			sticky: ["HeaderToolbar", "ColumnHeaders", "InfoToolbar"],
			dragDropConfig: this._getDragDropConfig()
		};
	};

	BasePanel.prototype._getSearchField = function() {
		if (!this._oSearchField) {
			this._oSearchField = new SearchField(this.getId() + "-searchField",{
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

	BasePanel.prototype.setPanelColumns = function(vColumns) {
		var aColumns;
		if (vColumns instanceof Array) {
			aColumns = vColumns;
		} else {
			aColumns = [
				vColumns
			];
		}
		this._addTableColumns(aColumns);
	};

	/**
	 * @param {Object} oP13nModel Personalization model provided by sap.ui.mdc.p13n.P13nBuilder
	 */
	BasePanel.prototype.setP13nModel = function(oP13nModel) {
		this.setModel(oP13nModel, this.P13N_MODEL);
		//initial value for "Reorder"-mode is false
		this.setPanelMode(false);
	};

	BasePanel.prototype.getP13nModel = function() {
		return this.getModel(this.P13N_MODEL);
	};

	BasePanel.prototype.getResourceText = function(sText, vValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		return sText ? this.oResourceBundle.getText(sText, vValue) : this.oResourceBundle;
	};

	BasePanel.prototype._addTableColumns = function(aColumns) {
		var aRemovedColumns = this._oListControl.removeAllColumns();
		aRemovedColumns.forEach(function(oRemovedColumn){
			oRemovedColumn.destroy();
		});
		aColumns.forEach(function(vColumn) {
			var oColumn;

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

	BasePanel.prototype._getPresenceAttribute = function() {
		var sPresenceAttribute = this.getP13nModel().getProperty("/presenceAttribute") || "visible";
		return sPresenceAttribute;
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
				path: this.P13N_MODEL + ">/reorderMode",
				formatter: function(bReorderMode) {
					return bReorderMode ? "Active" : "Inactive";
				}
			});
			this._oListControl.bindItems(Object.assign({
				path: this.P13N_MODEL + ">/items",
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
			this._getMoveTopButton().setEnabled(false);
			this._getMoveUpButton().setEnabled(false);
			this._getMoveDownButton().setEnabled(false);
			this._getMoveBottomButton().setEnabled(false);
		}
	};

	BasePanel.prototype._onItemPressed = function(oEvent) {
		var oTableItem = oEvent.getParameter('listItem');
		this._oSelectedItem = oTableItem;
		this._updateEnableOfMoveButtons(oTableItem, true);
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
		return this.getP13nModel() ? this.getP13nModel().getProperty("/reorderMode") : false;
	};

	BasePanel.prototype.setPanelMode = function(bReorder) {
		return this.getP13nModel().setProperty("/reorderMode", bReorder);
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
		this._setMoveButtonVisibility(bReorderMode);

		this._getMoveTopButton().setEnabled(false);
		this._getMoveUpButton().setEnabled(false);
		this._getMoveDownButton().setEnabled(false);
		this._getMoveBottomButton().setEnabled(false);

		//disable / enable d&d
		this._getDragDropConfig().setEnabled(bReorderMode);
	};

	BasePanel.prototype._setMoveButtonVisibility = function(bVisible) {
		this._getMoveTopButton().setVisible(bVisible);
		this._getMoveUpButton().setVisible(bVisible);
		this._getMoveDownButton().setVisible(bVisible);
		this._getMoveBottomButton().setVisible(bVisible);
	};

	BasePanel.prototype._updateModelItems = function() {
		// Sort and update the model items to ensure selected ones, are at the top
		var aFields = this.getP13nModel().getProperty("/items");
		var aSelectedFields = [], aOtherFields = [];
		aFields.forEach(function(oField) {
			if (oField[this._getPresenceAttribute()]) {
				aSelectedFields.push(oField);
			} else {
				aOtherFields.push(oField);
			}
		}.bind(this));
		this.getP13nModel().setProperty("/items", aSelectedFields.concat(aOtherFields));
	};

	BasePanel.prototype._filterBySelected = function(bShowSelected, oList) {
		oList.getBinding("items").filter(bShowSelected ? new Filter(this._getPresenceAttribute(), "EQ", true) : []);
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
		this._updateEnableOfMoveButtons(oTableItem, true);
		this._oSelectedItem = oTableItem;
		if (!bSelectAll) {
			var oItem = this.getP13nModel().getProperty(this._oSelectedItem.getBindingContext(this.P13N_MODEL).sPath);
			// only fire this event if one item is being selected in a live scenario, else fire the change event in the _onSelectionChange method
			//TODO: remove 'selected' condition enhance
			var oP13nModel = this.getModel(this.P13N_MODEL);
			if (oP13nModel && oItem) {
				oP13nModel.setProperty(oTableItem.getBindingContext(this.P13N_MODEL).sPath + "/selected", oItem.visible);
			}
			this.fireChange({
				reason: oItem[this._getPresenceAttribute()] ? "Add" : "Remove",
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
		var aFields = this.getP13nModel().getProperty("/items");

		// index of the item in the model not the index in the aggregation
		var iOldIndex = aFields.indexOf(oItem.getBindingContext(this.P13N_MODEL).getObject());

		// limit the minumum and maximum index
		iNewIndex = (iNewIndex <= 0) ? 0 : Math.min(iNewIndex, aItems.length - 1);

		// new index of the item in the model
		iNewIndex = aFields.indexOf(aItems[iNewIndex].getBindingContext(this.P13N_MODEL).getObject());
		if (iNewIndex == iOldIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aFields.splice(iNewIndex, 0, aFields.splice(iOldIndex, 1)[0]);
		this.getP13nModel().setProperty("/items", aFields);

		// store the moved item again due to binding
		this._oSelectedItem = this._oListControl.getItems()[iNewIndex];

		this._updateEnableOfMoveButtons(this._oSelectedItem, true);

		this.fireChange({
			reason: "Move",
			item: this.getP13nModel().getProperty(this._oSelectedItem.getBindingContext(this.P13N_MODEL).sPath)
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

	BasePanel.prototype._updateEnableOfMoveButtons = function(oTableItem, bFocus) {
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
		this._getMoveTopButton().setEnabled(bUpEnabled);
		this._getMoveUpButton().setEnabled(bUpEnabled);
		this._getMoveDownButton().setEnabled(bDownEnabled);
		this._getMoveBottomButton().setEnabled(bDownEnabled);
		if (bFocus) {
			oTableItem.focus();
		}
	};

	BasePanel.prototype.exit = function() {
		this._oSelectionBindingInfo = null;
		this._oSelectedItem = null;
		this._oListControl = null;
		this._oMoveTopBtn = null;
		this._oMoveUpButton = null;
		this._oMoveDownButton = null;
		this._oMoveBottomButton = null;
		this._oSearchField = null;
	};

	return BasePanel;
});
