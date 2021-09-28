/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/ui/core/XMLComposite', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/m/MessageBox'
], function(XMLComposite, Filter, FilterOperator, ManagedObjectObserver, Log, Device, JSONModel, MessageBox) {
	"use strict";
	/**
	 * Constructor for a new SelectionPanel.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The SelectionPanel control is used to show <code>items</code>.
	 * @extends sap.ui.core.XMLComposite
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.link.SelectionPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionPanel = XMLComposite.extend("sap.ui.mdc.link.SelectionPanel", /** @lends sap.ui.mdc.link.SelectionPanel.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					showItemAsLink: {
						type: "boolean",
						defaultValue: true,
						invalidate: true
					},
					/**
					 * This property determines whether the 'Restore' button is shown inside the dialog. If this property is set to true, clicking the
					 * 'Reset' button will trigger the <code>reset</code> event sending a notification that model data must be reset.
					 */
					showReset: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					},
					/**
					 * This property determines whether the 'Restore' button is enabled and is taken into account only if <code>showReset</code> is set
					 * to <code>true</code>.
					 */
					showResetEnabled: {
						type: "boolean",
						defaultValue: false,
						invalidate: true
					}
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * Defines personalization items.
					 */
					items: {
						type: "sap.ui.mdc.link.SelectionPanelItem",
						multiple: true,
						singularName: "item"
					}
				},
				events: {
					/**
					 * Event fired if an item in <code>SelectionPanel</code> is set as visible or invisible.
					 */
					visibilityChanged: {
						key: {
							type: "string"
						},
						visible: {
							type: "boolean"
						}
					},
					/**
					 * Event fired if the 'ok' button in <code>SelectionPanel</code> is clicked.
					 */
					ok: {},
					/**
					 * Event fired if the 'cancel' button in <code>SelectionPanel</code> is clicked.
					 */
					cancel: {},
					/**
					 * Event fired if the 'reset' button in <code>SelectionPanel</code> is clicked.
					 */
					reset: {}
				}
			}
		});
	SelectionPanel.prototype.init = function() {
		// Set device model
		var oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");
		oDeviceModel.setSizeLimit(1000);
		this.setModel(oDeviceModel, "device");
		this._getManagedObjectModel().setSizeLimit(1000);
		this._bUnconfirmedResetPressed = false;
	};
	SelectionPanel.prototype.open = function() {
		this._getManagedObjectModel().setProperty("/@custom/countOfItems", this._getTable().getItems().length);
		this._updateCountOfSelectedItems();
	};
	SelectionPanel.prototype.onSelectionChange = function(oEvent) {
		oEvent.getParameter("listItems").forEach(function(oTableItem) {
			this._selectTableItem(oTableItem);
		}, this);
	};
	SelectionPanel.prototype.onSearchFieldLiveChange = function(oEvent) {
		var aFilters = [];
		var oSearchField = oEvent.getSource();
		var sSearchText = oSearchField ? oSearchField.getValue() : "";
		if (sSearchText) {
			aFilters.push(new Filter([
				new Filter("text", FilterOperator.Contains, sSearchText), new Filter("tooltip", FilterOperator.Contains, sSearchText), new Filter("description", FilterOperator.Contains, sSearchText)
			], false));
		}
		this._getTable().getBinding("items").filter(aFilters);
	};
	SelectionPanel.prototype.onPressOk = function() {
		this.fireOk();
	};
	SelectionPanel.prototype.onPressCancel = function() {
		this.fireCancel();
	};
	SelectionPanel.prototype.onPressReset = function() {
		this._resetSelection();
		this.fireReset();
	};
	SelectionPanel.prototype.onAfterClose = function() {
		this.fireCancel();
	};
	SelectionPanel.prototype.onPressLink = function(oEvent) {
		var sHref = oEvent.getParameter("href");
		if (this.getParent().getBeforeNavigationCallback() && oEvent.getParameter("target") !== "_blank") {
			oEvent.preventDefault();
			this.getParent().getBeforeNavigationCallback()(oEvent).then(function (bNavigate) {
				if (bNavigate) {
					window.location.href = sHref;
				}
			});
		} else if (oEvent.getParameter("target") !== "_blank") {
			oEvent.preventDefault();
			MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.SELECTION_DIALOG_LINK_VALIDATION_QUESTION"), {
				icon: MessageBox.Icon.WARNING,
				title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.SELECTION_DIALOG_LINK_VALIDATION_TITLE"),
				actions: [
					MessageBox.Action.YES, MessageBox.Action.NO
				],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						window.location.href = sHref;
					}
				},
				styleClass: this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : ""
			});
		}
	};
	SelectionPanel.prototype._selectTableItem = function(oTableItem) {
		this._updateCountOfSelectedItems();
		this.fireVisibilityChanged({
			key: this._getKeyByTableItem(oTableItem),
			visible: oTableItem.getSelected()
		});
	};
	SelectionPanel.prototype._getTable = function() {
		return sap.ui.getCore().byId(this.getId() + "--idList") || null;
	};
	SelectionPanel.prototype._getSelectedTableContextPaths = function() {
		return this._getTable().getSelectedContextPaths();
	};
	/**
	 *
	 * @param {sap.m.ListItemBase} oTableItem Item whose key shall be returned
	 * @returns {string | null} key of the oTableItem
	 * @private
	 */
	SelectionPanel.prototype._getKeyByTableItem = function(oTableItem) {
		var iIndex = this._getTable().indexOfItem(oTableItem);
		return iIndex < 0 ? null : this._getTable().getBinding("items").getContexts()[iIndex].getObject().getKey();
	};
	SelectionPanel.prototype._updateCountOfSelectedItems = function() {
		this._getManagedObjectModel().setProperty("/@custom/countOfSelectedItems", this._getSelectedTableContextPaths().length);
	};
	SelectionPanel.prototype._resetSelection = function() {
		var oTable = this._getTable();
		if (oTable) {
			oTable.getItems().forEach(function(oTableItem) {
				var iIndex = oTable.indexOfItem(oTableItem);
				var bIsBaseline = oTable.getBinding("items").getContexts(undefined, undefined, undefined, true)[iIndex].getObject().getIsBaseline();
				if (oTableItem.getSelected() !== bIsBaseline) {
					oTableItem.setSelected(bIsBaseline);
					this._selectTableItem(oTableItem);
				}
			}.bind(this));
		}
	};
	return SelectionPanel;
});
