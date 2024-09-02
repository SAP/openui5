/*!
 * ${copyright}
 */

// Provides control sap.ui.rta.toolbar.contextBased.ManageAdaptationsDialog
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_union",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/m/ColumnListItem",
	"sap/ui/rta/Utils",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/date/UI5Date",
	"sap/ui/performance/Measurement"
], function(
	Localization,
	_isEqual,
	_union,
	Log,
	ManagedObject,
	Fragment,
	ContextBasedAdaptationsAPI,
	ColumnListItem,
	Utils,
	Filter,
	FilterOperator,
	JSONModel,
	UI5Date,
	Measurement
) {
	"use strict";

	var oRanking = {
		Initial: 0,
		Default: 1024,
		Before(iRank) {
			return iRank + 1024;
		},
		Between(iRank1, iRank2) {
			return (iRank1 + iRank2) / 2;
		},
		After(iRank) {
			return iRank + 0.5;
		}
	};

	var ManageAdaptations = ManagedObject.extend("sap.ui.rta.toolbar.contextBased.ManageAdaptations", {
		metadata: {
			properties: {
				toolbar: {
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			ManagedObject.prototype.constructor.apply(this, aArgs);
			this.oTextResources = this.getToolbar().getTextResources();
		}
	});

	ManageAdaptations.prototype.openManageAdaptationDialog = function() {
		Measurement.start("onCBAOpenManageAdaptationDialog", "Measurement of opening the manage context-based adaptation dialog");
		if (!this._oManageAdaptationDialogPromise) {
			this._oManageAdaptationDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.contextBased.ManageAdaptationsDialog",
				id: `${this.getToolbar().getId()}_fragment--sapUiRta_manageAdaptationDialog`,
				controller: {
					formatContextColumnCell: formatContextColumnCell.bind(this),
					formatContextColumnTooltip: formatContextColumnTooltip.bind(this),
					formatCreatedChangedOnColumnCell: formatCreatedChangedOnColumnCell.bind(this),
					onLiveSearch: onLiveSearch.bind(this),
					moveUp: moveUp.bind(this),
					moveDown: moveDown.bind(this),
					onDropSelectedAdaptation: onDropSelectedAdaptation.bind(this),
					onSaveReorderedAdaptations: onSaveReorderedAdaptations.bind(this),
					isAdaptationsSelected: isAdaptationsSelected.bind(this),
					getIndexOfSelectedAdaptation: getIndexOfSelectedAdaptation.bind(this),
					onCancel: onCancelDialog.bind(this)
				}
			}).then(function(oDialog) {
				this._oManageAdaptationDialog = oDialog;
				oDialog.addStyleClass(Utils.getRtaStyleClassName());
				this.getToolbar().addDependent(this._oManageAdaptationDialog);
			}.bind(this));
		} else {
			syncEnabledPropertyOfMoveButtons.call(this);
			enableDragAndDropForAdaptationTable.call(this, true);
			enableSaveButton.call(this, false);
		}
		return this._oManageAdaptationDialogPromise
		.then(function() {
			this._oRtaInformation = this.getToolbar().getRtaInformation();
			return ContextBasedAdaptationsAPI.load({
				control: this._oRtaInformation.rootControl,
				layer: this._oRtaInformation.flexSettings.layer
			});
		}.bind(this)).then(function(oAdaptations) {
			this.oAdaptationsModel = ContextBasedAdaptationsAPI.getAdaptationsModel({
				control: this._oRtaInformation.rootControl,
				layer: this._oRtaInformation.flexSettings.layer
			});
			this.oAdaptationsModel.updateAdaptations(oAdaptations.adaptations);
			this.oReferenceAdaptationsData = JSON.parse(JSON.stringify(this.oAdaptationsModel.getProperty("/adaptations")));
			this._oOriginAdaptationsData = JSON.parse(JSON.stringify(this.oAdaptationsModel.getProperty("/allAdaptations")));
			this._oControlConfigurationModel = new JSONModel({isTableItemSelected: false});
			this._oManageAdaptationDialog.setModel(this.oAdaptationsModel, "contextBased");
			this._oManageAdaptationDialog.setModel(this._oControlConfigurationModel, "controlConfiguration");
			getAdaptationsTable.call(this).attachSelectionChange(onSelectionChange.bind(this));
			Measurement.end("onCBAOpenManageAdaptationDialog");
			Measurement.getActive() && Log.info(`onCBAOpenManageAdaptationDialog: ${Measurement.getMeasurement("onCBAOpenManageAdaptationDialog").time} ms`);
			return this._oManageAdaptationDialog.open();
		}.bind(this)
		).catch(function(oError) {
			Log.error(oError.stack);
			var sMessage = "MSG_LREP_TRANSFER_ERROR";
			var oOptions = { titleKey: "BTN_MANAGE_APP_CTX" };
			oOptions.details = oError.userMessage;
			Utils.showMessageBox("error", sMessage, oOptions);
		});
	};

	// ------ formatting ------
	function formatContextColumnCell(aRoles) {
		return `${aRoles.length} ${aRoles.length > 1 ?
			this.oTextResources.getText("TXT_TABLE_CONTEXT_CELL_ROLES") : this.oTextResources.getText("TXT_TABLE_CONTEXT_CELL_ROLE")}`;
	}

	function formatContextColumnTooltip(aRoles) {
		return aRoles.join("\n");
	}

	function formatCreatedChangedOnColumnCell(sModifiedBy, sModifiedDate) {
		var oUi5Date = UI5Date.getInstance(sModifiedDate);
		var oOptions = {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "numeric"
		};
		var sLanguage = Localization.getLanguage();
		return `${sModifiedBy}\n${oUi5Date.toLocaleTimeString(sLanguage, oOptions)}`;
	}

	function onSelectionChange(oEvent) {
		if (oEvent.getParameter("selected") === true) {
			this._oControlConfigurationModel.setProperty("/isTableItemSelected", true);
			syncEnabledPropertyOfMoveButtons.call(this);
		}
	}

	function syncEnabledPropertyOfMoveButtons() {
		var oUpButton = getControlInDialog.call(this, "moveUpButton");
		var oDownButton = getControlInDialog.call(this, "moveDownButton");
		if (isSearchFieldValueEmpty.call(this)) {
			if (isAdaptationsSelected.call(this)) {
				oUpButton.setEnabled(getIndexOfSelectedAdaptation.call(this) > 0);
				oDownButton.setEnabled(getIndexOfSelectedAdaptation.call(this) < this.oAdaptationsModel.getProperty("/count") - 1);
			} else {
				oUpButton.setEnabled(false);
				oDownButton.setEnabled(false);
			}
		} else {
			oUpButton.setEnabled(false);
			oDownButton.setEnabled(false);
		}
	}

	// ------ search field ------
	function onLiveSearch(oEvent) {
		var oFilters;
		var sQuery = oEvent.getSource().getValue();
		var oAdaptationsTable = getAdaptationsTable.call(this);
		var oDefaultApplicationTable = getDefaultApplicationTable.call(this);
		var sDefaultTableText = getDefaultApplicationTitle.call(this);
		if (sQuery && sQuery.length > 0) {
			syncEnabledPropertyOfMoveButtons.call(this);
			enableDragAndDropForAdaptationTable.call(this, false);
			// filter Table context
			var oFilterByTitle = new Filter("title", FilterOperator.Contains, sQuery);
			var oFilterByContextId = new Filter({
				path: "contexts/role",
				test(aRoles) {
					return aRoles.some(function(sRole) {
						return sRole.includes(sQuery.toUpperCase());
					});
				}
			});
			var oFilterCreatedBy = new Filter("createdBy", FilterOperator.Contains, sQuery);
			var oFilterChangedBy = new Filter("changedBy", FilterOperator.Contains, sQuery);
			oFilters = new Filter([oFilterByTitle, oFilterByContextId, oFilterCreatedBy, oFilterChangedBy]);
			// Filter default Table context
			if (sDefaultTableText.toUpperCase().includes(sQuery.toUpperCase())) {
				oDefaultApplicationTable.setVisible(true);
			} else {
				oDefaultApplicationTable.setVisible(false);
			}
		} else {
			enableDragAndDropForAdaptationTable.call(this, true);
			if (this._oControlConfigurationModel.getProperty("/isTableItemSelected")) {
				syncEnabledPropertyOfMoveButtons.call(this);
			}
			oDefaultApplicationTable.setVisible(true);
		}
		// update list binding
		var oBindingTableContext = oAdaptationsTable.getBinding("items");
		oBindingTableContext.filter(oFilters, "Application");
	}

	// ------ drag & drop of priority ------
	function moveUp(oEvent) {
		moveSelectedItem.call(this, "Up");
		oEvent.getSource().focus();
	}

	function moveDown(oEvent) {
		moveSelectedItem.call(this, "Down");
		oEvent.getSource().focus();
	}

	function compareRanks(oContextA, oContextB) {
		return oContextA.rank - oContextB.rank;
	}

	function sortByRank(oModel) {
		var aContexts = oModel.getProperty("/adaptations") || [];
		aContexts.sort(compareRanks);
		oModel.setProperty("/adaptations", aContexts);
		oModel.refresh(true);
	}

	function moveSelectedItem(sDirection) {
		var oTable = getAdaptationsTable.call(this);
		var oSelectedItem = oTable.getSelectedItem(0);
		var oSelectedItemContext = oSelectedItem.getBindingContext("contextBased");

		var iSiblingItemIndex = oTable.indexOfItem(oSelectedItem) + (sDirection === "Up" ? -1 : 1);
		var oSiblingItem = oTable.getItems()[iSiblingItemIndex];
		var oSiblingItemContext = oSiblingItem ? oSiblingItem.getBindingContext("contextBased") : undefined;
		if (!oSiblingItemContext) {
			return;
		}

		// swap the selected and the siblings rank
		var iSiblingItemRank = oSiblingItemContext.getProperty("rank");
		var iSelectedItemRank = oSelectedItemContext.getProperty("rank");

		this.oAdaptationsModel.setProperty("rank", iSiblingItemRank, oSelectedItemContext);
		this.oAdaptationsModel.setProperty("rank", iSelectedItemRank, oSiblingItemContext);

		sortByRank(this.oAdaptationsModel);
		// after move select the sibling
		oTable.getItems()[iSiblingItemIndex].setSelected(true).focus();
		enableSaveButton.call(this, didAdaptationsPriorityChange.call(this));
		syncEnabledPropertyOfMoveButtons.call(this);
	}

	function onDropSelectedAdaptation(oEvent) {
		const oDraggedItem = oEvent.getParameter("draggedControl");
		const oDraggedItemContext = oDraggedItem.getBindingContext("contextBased");
		if (!oDraggedItemContext) {
			return;
		}

		let iNewRank = oRanking.Default;
		const oDroppedItem = oEvent.getParameter("droppedControl");

		if (oDroppedItem instanceof ColumnListItem) {
			// get the dropped row data
			const sDropPosition = oEvent.getParameter("dropPosition");
			const oDroppedItemContext = oDroppedItem.getBindingContext("contextBased");
			const iDroppedItemRank = oDroppedItemContext.getProperty("rank");
			const oDroppedTable = oDroppedItem.getParent();
			const iDroppedItemIndex = oDroppedTable.indexOfItem(oDroppedItem);
			if (oDroppedItemContext === oDraggedItemContext) {
				return;
			}
			// find the new index of the dragged row depending on the drop position
			const iNewItemIndex = iDroppedItemIndex + (sDropPosition === "After" ? 1 : -1);
			const oNewItem = oDroppedTable.getItems()[iNewItemIndex];
			if (!oNewItem || iNewItemIndex === -1) {
				// dropped before the first row or after the last row
				iNewRank = iNewItemIndex === -1 ? 0.5 : oRanking[sDropPosition](iDroppedItemRank);
			} else {
				// dropped between first and the last row
				const oNewItemContext = oNewItem.getBindingContext("contextBased");
				iNewRank = oRanking.Between(iDroppedItemRank, oNewItemContext.getProperty("rank"));
			}
		}
		// set the rank property and update the model to refresh the bindings
		this.oAdaptationsModel.setProperty("rank", iNewRank, oDraggedItemContext);
		sortByRank(this.oAdaptationsModel);
		const oAllUpdatedAdaptations = _union(
			this.oAdaptationsModel.getProperty("/adaptations"),
			this.oAdaptationsModel.getProperty("/allAdaptations")
		);
		this.oAdaptationsModel.updateAdaptations(oAllUpdatedAdaptations);
		enableSaveButton.call(this, didAdaptationsPriorityChange.call(this));
	}

	function didAdaptationsPriorityChange() {
		return !_isEqual(
			this.oAdaptationsModel.getProperty("/adaptations").map(function(oAdaptation) { return oAdaptation.id; }),
			this.oReferenceAdaptationsData.map(function(oAdaptation) { return oAdaptation.id; })
		);
	}

	function enableSaveButton(bEnabled) {
		var oSaveButton = getControlInDialog.call(this, "manageAdaptations-saveButton");
		oSaveButton.setTooltip(bEnabled ? "" : this.oTextResources.getText("TOOLTIP_APP_CTX_DIALOG_SAVE"));
		oSaveButton.setEnabled(bEnabled);
	}

	function getAdaptationsTable() {
		return getControlInDialog.call(this, "manageAdaptationsTable");
	}

	function getControlInDialog(sId) {
		return this.getToolbar().getControl(`manageAdaptationDialog--${sId}`);
	}

	function getDefaultApplicationTable() {
		return getControlInDialog.call(this, "defaultContext");
	}

	function getDefaultApplicationTitle() {
		return getControlInDialog.call(this, "defaultApplicationTitle").getProperty("text");
	}

	function getSearchField() {
		return getControlInDialog.call(this, "searchField");
	}

	function isSearchFieldValueEmpty() {
		return getSearchField.call(this).getValue().length === 0;
	}

	function enableDragAndDropForAdaptationTable(bIsEnabled) {
		getAdaptationsTable.call(this).getDragDropConfig()[0].setEnabled(bIsEnabled);
	}

	function isAdaptationsSelected() {
		var oAdaptationsTable = getAdaptationsTable.call(this);
		return oAdaptationsTable.getSelectedContextPaths().length > 0;
	}

	function getIndexOfSelectedAdaptation() {
		var oAdaptationsTable = getAdaptationsTable.call(this);
		if (oAdaptationsTable.getSelectedContextPaths().length > 0) {
			var aSplitedPath = oAdaptationsTable.getSelectedContextPaths()[0].split("/");
			var iIndexOfSelectedItem = Number(aSplitedPath[aSplitedPath.length - 1]);
			return iIndexOfSelectedItem;
		}
		return -1;
	}

	function onSaveReorderedAdaptations() {
		Utils.checkDraftOverwrite(this.getToolbar().getModel("versions")).then(function() {
			var oRtaInformation = this.getToolbar().getRtaInformation();
			var aAdaptationPriorities = this.oAdaptationsModel.getProperty("/adaptations")
			.map(function(oAdaptation) { return oAdaptation.id; });
			return ContextBasedAdaptationsAPI.reorder({
				control: oRtaInformation.rootControl,
				layer: oRtaInformation.flexSettings.layer,
				parameters: {priorities: aAdaptationPriorities}
			});
		}.bind(this)).then(function() {
			const oAllUpdatedAdaptations = _union(
				this.oAdaptationsModel.getProperty("/adaptations"),
				this.oAdaptationsModel.getProperty("/allAdaptations")
			);
			this.oAdaptationsModel.updateAdaptations(oAllUpdatedAdaptations);
			onCloseDialog.call(this);
		}.bind(this))
		.catch(function(oError) {
			if (oError !== "cancel") {
				Utils.showMessageBox("error", "MSG_LREP_TRANSFER_ERROR", { titleKey: "BTN_MANAGE_APP_CTX", error: oError});
				Log.error(`sap.ui.rta: ${oError.stack || oError.message || oError}`);
			}
		});
	}

	function onCancelDialog() {
		// the adaptationsModel has to be set to its origin as no reorder has taken place
		this.oAdaptationsModel.updateAdaptations(this._oOriginAdaptationsData);
		onCloseDialog.call(this);
	}

	function onCloseDialog() {
		this._oControlConfigurationModel.setProperty("/isTableItemSelected", false);
		getSearchField.call(this).setValue("");
		var oTable = getAdaptationsTable.call(this);
		oTable.getBinding("items").filter([]);
		oTable.removeSelections();
		getDefaultApplicationTable.call(this).setVisible(true);
		this._oManageAdaptationDialog.close();
	}

	return ManageAdaptations;
});