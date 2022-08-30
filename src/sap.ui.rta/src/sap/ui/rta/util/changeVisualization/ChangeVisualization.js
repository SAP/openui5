/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_difference",
	"sap/base/util/deepEqual",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/util/changeVisualization/ChangeIndicator",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/rta/util/changeVisualization/ChangeCategories"
], function(
	Fragment,
	difference,
	deepEqual,
	JsControlTreeModifier,
	Control,
	OverlayRegistry,
	ElementUtil,
	PersistenceWriteAPI,
	Layer,
	FlUtils,
	ResourceModel,
	JSONModel,
	ChangeIndicator,
	ChangeIndicatorRegistry,
	ChangeCategories
) {
	"use strict";

	/**
	 * When clicking anywhere on the application, the menu must close
	 */
	function _onClick() {
		var oPopover = this.getPopover();
		if (oPopover && oPopover.isOpen()) {
			oPopover.close();
		}
	}

	/**
	 * @class
	 * Root control for RTA change visualization.
	 *
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.rta.util.changeVisualization.ChangeVisualization
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 */
	var ChangeVisualization = Control.extend("sap.ui.rta.util.changeVisualization.ChangeVisualization", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				/**
				 * Id of the component or control to visualize the changes for
				 */
				rootControlId: {
					type: "string"
				},
				/**
				 * Whether changes are currently being displayed
				 */
				isActive: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				popover: {
					type: "sap.m.Popover",
					multiple: false
				}
			}
		},
		constructor: function() {
			this._oChangeIndicatorRegistry = new ChangeIndicatorRegistry({
				changeCategories: ChangeCategories.getCategories()
			});

			Control.prototype.constructor.apply(this, arguments);

			this._oTextBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.setModel(new ResourceModel({
				bundle: this._oTextBundle
			}), "i18n");

			this._oChangeVisualizationModel = new JSONModel({
				active: this.getIsActive()
			});
			this._oChangeVisualizationModel.setDefaultBindingMode("OneWay");
			this._sSelectedChangeCategory = ChangeCategories.ALL;
			this._bSetModeChanged = false;

			// For the event handlers to work, the function instance has to remain stable
			this._fnOnClickHandler = _onClick.bind(this);
		}
	});

	ChangeVisualization.prototype.setRootControlId = function(sRootControlId) {
		if (this.getRootControlId() && this.getRootControlId() !== sRootControlId) {
			this._reset();
		}
		this.setProperty("rootControlId", sRootControlId);
		this._oChangeIndicatorRegistry.setRootControlId(sRootControlId);
	};

	ChangeVisualization.prototype._getComponent = function() {
		return FlUtils.getAppComponentForControl(ElementUtil.getElementInstance(this.getRootControlId()));
	};

	ChangeVisualization.prototype.setIsActive = function(bActiveState) {
		if (bActiveState === this.getIsActive()) {
			return;
		}
		this.setProperty("isActive", bActiveState);

		if (this._oChangeVisualizationModel) {
			this._updateVisualizationModel({
				active: bActiveState
			});
		}
	};

	ChangeVisualization.prototype.exit = function() {
		this._oChangeIndicatorRegistry.destroy();
		this._toggleRootOverlayClickHandler(false);
	};

	ChangeVisualization.prototype._reset = function() {
		this._oChangeIndicatorRegistry.reset();
	};

	ChangeVisualization.prototype._updateVisualizationModelMenuData = function() {
		var aVisualizedChanges = this._oChangeVisualizationModel.getData().visualizedChanges;
		var aHiddenChanges = [];
		var aAllRegisteredChanges = this._oChangeIndicatorRegistry.getAllRegisteredChanges();
		aAllRegisteredChanges.forEach(function(oRegisteredChange) {
			var oVisualizedChange = aVisualizedChanges.find(function(oVisualizedChange) {
				return oRegisteredChange.change.getId() === oVisualizedChange.id;
			});
			if (!oVisualizedChange && !oRegisteredChange.dependent) {
				aHiddenChanges.push(oRegisteredChange);
			}
		});
		var aCommandData = Object.keys(ChangeCategories.getCategories()).map(function(sChangeCategoryName) {
			var sTitle = this._getChangeCategoryLabel(
				sChangeCategoryName,
				this._getChangesForChangeCategory(sChangeCategoryName, aVisualizedChanges).length
			);
			return {
				key: sChangeCategoryName,
				count: this._getChangesForChangeCategory(sChangeCategoryName, aVisualizedChanges).length,
				title: sTitle,
				icon: ChangeCategories.getIconForCategory(sChangeCategoryName)
			};
		}.bind(this));

		aCommandData.unshift({
			key: ChangeCategories.ALL,
			count: this._getChangesForChangeCategory(ChangeCategories.ALL, aVisualizedChanges).length,
			title: this._getChangeCategoryLabel(ChangeCategories.ALL, this._getChangesForChangeCategory(ChangeCategories.ALL, aVisualizedChanges).length),
			icon: ChangeCategories.getIconForCategory(ChangeCategories.ALL)
		});

		this._updateVisualizationModel({
			changeCategories: aCommandData,
			hiddenChanges: aHiddenChanges,
			popupInfoMessage: this._oTextBundle.getText(
				"MSG_CHANGEVISUALIZATION_HIDDEN_CHANGES_INFO",
				[aHiddenChanges.length]
			)
		});
	};

	ChangeVisualization.prototype._getChangesForChangeCategory = function(sChangeCategory, aChanges) {
		return aChanges.filter(function(oChange) {
			return sChangeCategory === ChangeCategories.ALL
				? oChange.changeCategory !== undefined
				: sChangeCategory === oChange.changeCategory;
		});
	};

	ChangeVisualization.prototype._getChangeCategoryLabel = function(sChangeCategoryName, iChangesCount) {
		var sLabelKey = "TXT_CHANGEVISUALIZATION_OVERVIEW_" + sChangeCategoryName.toUpperCase();
		return this._oTextBundle.getText(sLabelKey, [iChangesCount]);
	};

	ChangeVisualization.prototype._getChangeCategoryButton = function(sChangeCategoryName) {
		var sButtonKey = "BTN_CHANGEVISUALIZATION_OVERVIEW_" + sChangeCategoryName.toUpperCase();
		return this._oTextBundle.getText(sButtonKey);
	};

	ChangeVisualization.prototype.openChangeCategorySelectionPopover = function(oEvent) {
		if (!this._oToolbarButton) {
			// Event bubbled through the toolbar, get original source
			this._oToolbarButton = sap.ui.getCore().byId(oEvent.getParameter("id"));
		}
		var oPopover = this.getPopover();

		if (!oPopover) {
			Fragment.load({
				name: "sap.ui.rta.util.changeVisualization.ChangeIndicatorCategorySelection",
				id: this._getComponent().createId("changeVisualization_changesListPopover"),
				controller: this
			})
				.then(function(oPopover) {
					this._oToolbarButton.addDependent(oPopover);
					oPopover.setModel(this._oChangeVisualizationModel, "visualizationModel");
					oPopover.openBy(this._oToolbarButton);
					this.setPopover(oPopover);
				}.bind(this));
			return;
		}

		if (oPopover.isOpen()) {
			oPopover.close();
		} else {
			oPopover.openBy(this._oToolbarButton);
		}
	};

	/**
	 * Sets the selected change category and visualizes all changes for the given category
	 *
	 * @param {event} oEvent - Event
	 */
	ChangeVisualization.prototype.onChangeCategorySelection = function(oEvent) {
		var sSelectedChangeCategory = oEvent.getSource().getBindingContext("visualizationModel").getObject().key;
		this._selectChangeCategory(sSelectedChangeCategory);
	};

	ChangeVisualization.prototype._selectChangeCategory = function(sSelectedChangeCategory) {
		this._sSelectedChangeCategory = sSelectedChangeCategory;

		var sChangeCategoryText = this._getChangeCategoryButton(sSelectedChangeCategory);

		this._updateVisualizationModel({
			changeCategory: sSelectedChangeCategory,
			changeCategoryText: sChangeCategoryText
		});

		this._updateChangeIndicators();
		this._setFocusedIndicator();
	};

	ChangeVisualization.prototype._getCommandForChange = function(oChange) {
		var sCommand = oChange.getSupportInformation().command;
		if (sCommand) {
			return sCommand;
		}

		var oComponent = this._getComponent();
		var oSelectorControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oComponent);
		var oLastDependentSelector = oChange.getDependentSelectorList().slice(-1)[0];
		var oLastDependentSelectorControl = JsControlTreeModifier.bySelector(oLastDependentSelector, oComponent);

		// Recursively search through parent element structure
		// This is necessary to make sure that elements that were created during runtime
		// (e.g. for SimpleForms) are considered.
		function searchForCommand(oOverlay, sAggregationName) {
			var oControl = oOverlay.getElement();
			var sCommand = oOverlay.getDesignTimeMetadata().getCommandName(
				oChange.getChangeType(),
				oControl,
				sAggregationName
			);
			if (sCommand) {
				return sCommand;
			}

			var oParentOverlay = oOverlay.getParentElementOverlay();
			var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
			if (
				oOverlay.getElement().getId() === oSelectorControl.getId()
				|| !oParentOverlay
			) {
				return undefined;
			}
			return searchForCommand(
				oParentOverlay,
				oParentAggregationOverlay && oParentAggregationOverlay.getAggregationName()
			);
		}

		return oSelectorControl
			&& oLastDependentSelectorControl
			&& searchForCommand(OverlayRegistry.getOverlay(oLastDependentSelectorControl));
	};

	ChangeVisualization.prototype._collectChanges = function() {
		var oComponent = this._getComponent();
		var mPropertyBag = {
			selector: oComponent,
			invalidateCache: false,
			// includeCtrlVariants: true,
			currentLayer: Layer.CUSTOMER,
			includeDirtyChanges: true,
			onlyCurrentVariants: true
		};
		return PersistenceWriteAPI._getUIChanges(mPropertyBag);
	};

	ChangeVisualization.prototype._updateChangeRegistry = function() {
		return this._collectChanges().then(function(aChanges) {
			var aRegisteredChangeIds = this._oChangeIndicatorRegistry.getRegisteredChangeIds();
			var oCurrentChanges = aChanges
				.filter(function(oChange) {
					// Filter out changes with different fileTypes (e.g. variant)
					// or without selectors (e.g. App Descriptor changes)
					return oChange.getFileType() === "change" && oChange.getSelector();
				})
				.reduce(function(oChanges, oChange) {
					oChanges[oChange.getId()] = oChange;
					return oChanges;
				}, {});
			var aCurrentChangeIds = Object.keys(oCurrentChanges);

			// Remove registered changes which no longer exist
			difference(aRegisteredChangeIds, aCurrentChangeIds).forEach(function(sChangeIdToRemove) {
				this._oChangeIndicatorRegistry.removeChange(sChangeIdToRemove);
			}.bind(this));

			var aPromises = [];
			// Register missing changes
			difference(aCurrentChangeIds, aRegisteredChangeIds).forEach(function(sChangeIdToAdd) {
				var oChangeToAdd = oCurrentChanges[sChangeIdToAdd];
				var sCommandName = this._getCommandForChange(oChangeToAdd);
				aPromises.push(this._oChangeIndicatorRegistry.registerChange(oChangeToAdd, sCommandName));
			}.bind(this));
			return Promise.all(aPromises);
		}.bind(this));
	};

	ChangeVisualization.prototype.selectChange = function(oEvent) {
		var sChangeId = oEvent.getParameter("changeId");
		this._selectChange(sChangeId);
	};

	ChangeVisualization.prototype._selectChange = function(sChangeId) {
		var aDependentElements = this._oChangeIndicatorRegistry.getRegisteredChange(sChangeId).visualizationInfo.dependentElementIds;
		aDependentElements.forEach(function(sElementId) {
			var oOverlayDomRef = OverlayRegistry.getOverlay(sElementId).getDomRef();
			oOverlayDomRef.scrollIntoView({
				block: "nearest"
			});
			oOverlayDomRef.classList.add("sapUiRtaChangeIndicatorDependent");
			oOverlayDomRef.addEventListener("animationend", function() {
				oOverlayDomRef.classList.remove("sapUiRtaChangeIndicatorDependent");
			}, { once: true });
		});
	};

	ChangeVisualization.prototype._updateVisualizationModel = function(oData) {
		this._oChangeVisualizationModel.setData(Object.assign(
			{},
			this._oChangeVisualizationModel.getData(),
			oData
		));
	};

	ChangeVisualization.prototype._updateChangeIndicators = function() {
		var oSelectors = this._oChangeIndicatorRegistry.getSelectorsWithRegisteredChanges();
		var oIndicators = {};
		var aVisualizedChanges = [];
		Object.keys(oSelectors)
			.forEach(function(sSelectorId) {
				var aRelevantChanges = this._filterRelevantChanges(oSelectors[sSelectorId]);
				var oOverlay = OverlayRegistry.getOverlay(sSelectorId);
				if (!oOverlay) {
					// When the selector has no Overlay, check if there is a relevant container Overlay
					// e.g. when a SmartForm group is removed
					aRelevantChanges.some(function(oChange) {
						var oElementOverlay = OverlayRegistry.getOverlay(oChange.affectedElementId);
						var oRelevantContainer = oElementOverlay && oElementOverlay.getRelevantContainer();
						if (oRelevantContainer) {
							oOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
							return true;
						}
						return false;
					});
				}
				if (!oOverlay || !oOverlay.getDomRef() || !oOverlay.isVisible()) {
					// Change is not visible
					return undefined;
				}
				var oOverlayPosition = oOverlay.getDomRef().getClientRects()[0] || { left: 0, top: 0 };
				aRelevantChanges.forEach(function (oChange) {
					aVisualizedChanges.push(oChange);
				});
				oIndicators[sSelectorId] = {
					posX: parseInt(oOverlayPosition.left),
					posY: parseInt(oOverlayPosition.top),
					changes: aRelevantChanges
				};

				var oChangeIndicator = this._oChangeIndicatorRegistry.getChangeIndicator(sSelectorId);
				var sOverlayId = oOverlay.getId();
				if (!oChangeIndicator) {
					this._createChangeIndicator(oOverlay, sSelectorId);
				} else if (oChangeIndicator.getOverlayId() !== sOverlayId) {
					// Overlay id might change, e.g. during undo/redo of dirty changes
					oChangeIndicator.setOverlayId(sOverlayId);
				}
				return undefined;
			}.bind(this));

		if (
			!deepEqual(
				oIndicators,
				this._oChangeVisualizationModel.getData().content
			) || !deepEqual(
				aVisualizedChanges,
				this._oChangeVisualizationModel.getData().visualizedChanges
			)
		) {
			this._updateVisualizationModel({
				content: oIndicators,
				visualizedChanges: aVisualizedChanges
			});
		}
	};

	ChangeVisualization.prototype._filterRelevantChanges = function(aChangeVizInfo) {
		if (!Array.isArray(aChangeVizInfo)) {
			return aChangeVizInfo;
		}
		var oRootData = this._oChangeVisualizationModel.getData();

		return aChangeVizInfo.filter(function(oChangeVizInfo) {
			return (
				!oChangeVizInfo.dependent
				&& oChangeVizInfo.changeCategory
				&& (
					oRootData.changeCategory === ChangeCategories.ALL
					|| oRootData.changeCategory === oChangeVizInfo.changeCategory
				)
			);
		});
	};

	ChangeVisualization.prototype._createChangeIndicator = function(oOverlay, sSelectorId) {
		var oChangeIndicator = new ChangeIndicator({
			changes: "{changes}",
			posX: "{posX}",
			posY: "{posY}",
			visible: "{= ${/active} && (${changes} || []).length > 0}",
			overlayId: oOverlay.getId(),
			selectorId: sSelectorId,
			selectChange: this.selectChange.bind(this)
		});
		oChangeIndicator.setModel(this._oChangeVisualizationModel);
		oChangeIndicator.bindElement("/content/" + sSelectorId);
		oChangeIndicator.setModel(this.getModel("i18n"), "i18n");
		this._oChangeIndicatorRegistry.registerChangeIndicator(sSelectorId, oChangeIndicator);
	};

	ChangeVisualization.prototype._setFocusedIndicator = function() {
		// Sort the Indicators according XY-Position
		// Set the tabindex according the sorting
		// Focus the first visible indicator
		sap.ui.getCore().applyChanges();

		var aVisibleIndicators = this._oChangeIndicatorRegistry.getChangeIndicators()
			.filter(function(oIndicator) {
				return oIndicator.getVisible();
			})
			.sort(function(oIndicator1, oIndicator2) {
				var iDeltaY = oIndicator1.getPosY() - oIndicator2.getPosY();
				var iDeltaX = oIndicator1.getPosX() - oIndicator2.getPosX();
				// Only consider x value if y is the same
				return iDeltaY || iDeltaX;
			});

		if (aVisibleIndicators.length === 0) {
			return;
		}
		aVisibleIndicators.forEach(function(oIndicator, iIndex) {
			oIndicator.getDomRef().tabIndex = iIndex + 2;
		});
		aVisibleIndicators[0].focus();
	};

	ChangeVisualization.prototype._toggleRootOverlayClickHandler = function (bEnable) {
		var oRootOverlayDomRef = this.oRootOverlay && this.oRootOverlay.getDomRef();
		if (oRootOverlayDomRef) {
			if (bEnable) {
				oRootOverlayDomRef.addEventListener(
					"click",
					this._fnOnClickHandler,
					{ capture: true }
				);
			} else {
				oRootOverlayDomRef.removeEventListener(
					"click",
					this._fnOnClickHandler,
					{ capture: true }
				);
			}
		}
	};

	/**
	 * Triggers the mode switch (on/off).
	 *
	 * @param {sap.ui.base.ManagedObject} oRootControl - Root control of the overlays
	 * @param {sap.ui.rta.toolbar.Adaptation} oToolbar - Toolbar of RTA
	 */
	ChangeVisualization.prototype.triggerModeChange = function(oRootControl, oToolbar) {
		this.oMenuButton = oToolbar.getControl("toggleChangeVisualizationMenuButton");
		this.oRootOverlay = OverlayRegistry.getOverlay(oRootControl);

		if (this.getIsActive()) {
			this.setIsActive(false);
			this._toggleRootOverlayClickHandler(false);
			return;
		}
		this._toggleRootOverlayClickHandler(true);
		if (!this.getRootControlId()) {
			this.setRootControlId(oRootControl);
		}
		this.setIsActive(true);
		// show all change visualizations at startup
		this._updateChangeRegistry()
			.then(function() {
				this._selectChangeCategory(this._sSelectedChangeCategory);
				this._updateVisualizationModelMenuData();
				oToolbar.setModel(this._oChangeVisualizationModel, "visualizationModel");
			}.bind(this));
	};

	return ChangeVisualization;
});
