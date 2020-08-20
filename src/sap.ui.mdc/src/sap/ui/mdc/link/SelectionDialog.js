/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/XMLComposite', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/ui/base/ManagedObjectObserver', 'sap/base/Log', 'sap/ui/Device', 'sap/ui/model/json/JSONModel', 'sap/m/MessageBox'
], function(XMLComposite, Filter, FilterOperator, ManagedObjectObserver, Log, Device, JSONModel, MessageBox) {
	"use strict";

	/**
	 * Constructor for a new SelectionDialog.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The SelectionDialog control is used to show <code>items</code>.
	 * @extends sap.ui.core.XMLComposite
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.60.0
	 * @alias sap.ui.mdc.link.SelectionDialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDialog = XMLComposite.extend("sap.ui.mdc.link.SelectionDialog", /** @lends sap.ui.mdc.link.SelectionDialog.prototype */
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
						type: "sap.ui.mdc.link.SelectionDialogItem",
						multiple: true,
						singularName: "item"
					}
				},
				events: {
					/**
					 * Event fired if an item in <code>SelectionDialog</code> is set as visible or invisible.
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
					 * Event fired if the 'ok' button in <code>SelectionDialog</code> is clicked.
					 */
					ok: {},
					/**
					 * Event fired if the 'cancel' button in <code>SelectionDialog</code> is clicked.
					 */
					cancel: {},
					/**
					 * Event fired if the 'reset' button in <code>SelectionDialog</code> is clicked.
					 */
					reset: {}
				}
			}
		});

	SelectionDialog.prototype.init = function() {
		// Set device model
		var oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");
		oDeviceModel.setSizeLimit(1000);
		this.setModel(oDeviceModel, "device");
		this._getManagedObjectModel().setSizeLimit(1000);
		this._bUnconfirmedResetPressed = false;
	};
	SelectionDialog.prototype.open = function() {
		this._getManagedObjectModel().setProperty("/@custom/countOfItems", this._getTable().getItems().length);
		this._updateCountOfSelectedItems();
		this._getCompositeAggregation().open();
	};
	SelectionDialog.prototype.close = function() {
		this._getCompositeAggregation().close();
	};
	SelectionDialog.prototype.onSelectionChange = function(oEvent) {
		oEvent.getParameter("listItems").forEach(function(oTableItem) {
			this._selectTableItem(oTableItem);
		}, this);
	};
	SelectionDialog.prototype.onSearchFieldLiveChange = function(oEvent) {
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
	SelectionDialog.prototype.onPressOk = function() {
		this.fireOk();
	};
	SelectionDialog.prototype.onPressCancel = function() {
		this.fireCancel();
	};
	SelectionDialog.prototype.onPressReset = function() {
		this._resetSelection();
		this.fireReset();
	};
	SelectionDialog.prototype.onAfterClose = function() {
		this.fireCancel();
	};
	SelectionDialog.prototype.onPressLink = function(oEvent) {
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
	SelectionDialog.prototype._selectTableItem = function(oTableItem) {
		this._updateCountOfSelectedItems();

		this.fireVisibilityChanged({
			key: this._getKeyByTableItem(oTableItem),
			visible: oTableItem.getSelected()
		});
	};
	SelectionDialog.prototype._getTable = function() {
		return sap.ui.getCore().byId(this.getId() + "--idList") || null;
	};
	SelectionDialog.prototype._getSelectedTableContextPaths = function() {
		return this._getTable().getSelectedContextPaths();
	};
	/**
	 *
	 * @param {sap.m.ListItemBase} oTableItem Item whose key shall be returned
	 * @returns {string | null} key of the oTableItem
	 * @private
	 */
	SelectionDialog.prototype._getKeyByTableItem = function(oTableItem) {
		var iIndex = this._getTable().indexOfItem(oTableItem);
		return iIndex < 0 ? null : this._getTable().getBinding("items").getContexts()[iIndex].getObject().getKey();
	};
	SelectionDialog.prototype._updateCountOfSelectedItems = function() {
		this._getManagedObjectModel().setProperty("/@custom/countOfSelectedItems", this._getSelectedTableContextPaths().length);
	};

	SelectionDialog.prototype._resetSelection = function() {
		var oTable = this._getTable();
		if (oTable) {
			oTable.getItems().forEach(function(oTableItem) {
				var iIndex = oTable.indexOfItem(oTableItem);
				var bIsBaseline = oTable.getBinding("items").getContexts()[iIndex].getObject().getIsBaseline();
				if (oTableItem.getSelected() !== bIsBaseline) {
					oTableItem.setSelected(bIsBaseline);
					this._selectTableItem(oTableItem);
				}
			}.bind(this));
		}
	};

	return SelectionDialog;

});
