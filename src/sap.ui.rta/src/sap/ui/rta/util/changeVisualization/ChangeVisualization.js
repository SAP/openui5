/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/base/util/isEmptyObject",
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
	"sap/ui/rta/util/changeVisualization/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeStates"
], function(
	Element,
	Fragment,
	Lib,
	isEmptyObject,
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
	ChangeCategories,
	ChangeStates
) {
	"use strict";

	/**
	 * When clicking anywhere on the application, the menu must close
	 */
	function _onClick() {
		const oPopover = this.getPopover();
		if (oPopover && oPopover.isOpen()) {
			oPopover.close();
		}
	}

	function _isOverlayInvisible(oOverlay) {
		return !oOverlay || !oOverlay.getDomRef() || !oOverlay.isVisible();
	}

	function _determineElementOverlay(oElementId, oAffectedElementId) {
		let oOverlay = OverlayRegistry.getOverlay(oElementId);
		if (!oOverlay) {
			// When the element has no Overlay, check if there is a relevant container Overlay
			// e.g. change on a SmartForm group (Element: parent Form; Relevant Container: SmartForm)
			const oElementOverlay = OverlayRegistry.getOverlay(oAffectedElementId);
			const oRelevantContainer = oElementOverlay && oElementOverlay.getRelevantContainer();
			if (oRelevantContainer) {
				oOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			}
		}

		return oOverlay;
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
	const ChangeVisualization = Control.extend("sap.ui.rta.util.changeVisualization.ChangeVisualization", {
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
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			this._oChangeIndicatorRegistry = new ChangeIndicatorRegistry({
				changeCategories: ChangeCategories.getCategories()
			});

			Control.prototype.constructor.apply(this, aArgs);

			this._oTextBundle = Lib.getResourceBundleFor("sap.ui.rta");
			this.setModel(new ResourceModel({
				bundle: this._oTextBundle
			}), "i18n");

			this._oChangeVisualizationModel = new JSONModel({
				active: this.getIsActive(),
				changeState: ChangeStates.ALL
			});
			this._oChangeVisualizationModel.setDefaultBindingMode("TwoWay");
			this._sSelectedChangeCategory = ChangeCategories.ALL;
			this._bSetModeChanged = false;

			// For the event handlers to work, the function instance has to remain stable
			this._fnOnClickHandler = _onClick.bind(this);
		}
	});

	ChangeVisualization.prototype.setVersionsModel = function(oToolbar) {
		this.oVersionsModel = oToolbar.getModel("versions");
	};

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

	/**
	 * Updates CViz after save
	 *
	 * @param {sap.ui.rta.toolbar.Base} oToolbar - Toolbar of RTA
	 */
	ChangeVisualization.prototype.updateAfterSave = function(oToolbar) {
		if (this.getProperty("rootControlId")) {
			this._oChangeIndicatorRegistry.reset();
			this._updateChangeRegistry()
			.then(function() {
				this._selectChangeCategory(this._sSelectedChangeCategory);
				this._selectChangeState(ChangeStates.ALL);
				this._updateVisualizationModelMenuData();
				oToolbar.setModel(this._oChangeVisualizationModel, "visualizationModel");
			}.bind(this));
		}
	};

	ChangeVisualization.prototype._reset = function() {
		this._oChangeIndicatorRegistry.reset();
	};

	ChangeVisualization.prototype._determineChangeVisibility = function(
		aRegisteredIndependentChanges,
		aAllRelevantChanges,
		sVisualizedChangeState
	) {
		function filterRelevantChanges(aChanges) {
			return aChanges.filter(function(oChange) {
				if (
					!sVisualizedChangeState ||
					sVisualizedChangeState === ChangeStates.ALL ||
					oChange.changeStates.includes(sVisualizedChangeState)
				) {
					return true;
				}
				return false;
			});
		}
		// Array of all Hidden Changes
		const aHiddenChanges = [];
		// Array of all Visualized Changes
		const aVisualizedChanges = [];

		let bHasDraftChanges = false;
		let bHasDirtyChanges = false;

		const aAllRelevantChangeIds = aAllRelevantChanges.map(function(oChange) {
			return oChange.id;
		});

		aRegisteredIndependentChanges.forEach(function(oChange) {
			if (oChange.changeStates.includes(ChangeStates.DIRTY)) {
				bHasDraftChanges = true;
				bHasDirtyChanges = true;
			} else if (oChange.changeStates.includes(ChangeStates.DRAFT)) {
				bHasDraftChanges = true;
			}

			const oOverlay = _determineElementOverlay(
				oChange.visualizationInfo.displayElementIds[0],
				oChange.visualizationInfo.affectedElementIds[0]
			);

			if (!aAllRelevantChangeIds.includes(oChange.change.getId())) {
				aHiddenChanges.push(oChange);
			} else if (_isOverlayInvisible(oOverlay)) {
				aHiddenChanges.push(oChange);
			} else {
				aVisualizedChanges.push(oChange);
			}
		});
		const aRelevantHiddenChanges = filterRelevantChanges(aHiddenChanges);
		const aRelevantVisualizedChanges = filterRelevantChanges(aVisualizedChanges);
		return {
			relevantHiddenChanges: aRelevantHiddenChanges,
			relevantVisualizedChanges: aRelevantVisualizedChanges,
			hasDirtyChanges: bHasDirtyChanges,
			hasDraftChanges: bHasDraftChanges
		};
	};

	ChangeVisualization.prototype._updateVisualizationModelMenuData = function() {
		// Get selected change state and change category
		const sVisualizedChangeState = this._oChangeVisualizationModel.getData().changeState;

		// Get all registered and relevant change ids
		const aAllRegisteredChanges = this._oChangeIndicatorRegistry.getAllRegisteredChanges();
		const aAllRelevantChanges = this._oChangeIndicatorRegistry.getRelevantChangesWithSelector();

		// Filter allRegisteredChanges for independent changes and get the ids
		const aRegisteredIndependentChanges = aAllRegisteredChanges.filter(function(oChange) {
			if (!oChange.dependent) {
				return true;
			}
			return false;
		});

		const oSortedChanges = this._determineChangeVisibility(
			aRegisteredIndependentChanges,
			aAllRelevantChanges,
			sVisualizedChangeState
		);
		const aCommandData = Object.keys(ChangeCategories.getCategories()).map(function(sChangeCategoryName) {
			const sTitle = this._getChangeCategoryLabel(
				sChangeCategoryName,
				this._getChangesForChangeCategory(sChangeCategoryName, oSortedChanges.relevantVisualizedChanges).length
			);
			return {
				key: sChangeCategoryName,
				count: this._getChangesForChangeCategory(sChangeCategoryName, oSortedChanges.relevantVisualizedChanges).length,
				title: sTitle,
				icon: ChangeCategories.getIconForCategory(sChangeCategoryName)
			};
		}.bind(this));

		aCommandData.unshift({
			key: ChangeCategories.ALL,
			count: this._getChangesForChangeCategory(ChangeCategories.ALL, oSortedChanges.relevantVisualizedChanges).length,
			title: this._getChangeCategoryLabel(ChangeCategories.ALL, this._getChangesForChangeCategory(
				ChangeCategories.ALL,
				oSortedChanges.relevantVisualizedChanges
			).length),
			icon: ChangeCategories.getIconForCategory(ChangeCategories.ALL)
		});

		this._updateVisualizationModel({
			changeCategories: aCommandData,
			hasDraftChanges: oSortedChanges.hasDraftChanges,
			hasDirtyChanges: oSortedChanges.hasDirtyChanges,
			popupInfoMessage: this._oTextBundle.getText(
				"MSG_CHANGEVISUALIZATION_HIDDEN_CHANGES_INFO",
				[oSortedChanges.relevantHiddenChanges.length]
			),
			sortedChanges: oSortedChanges
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
		const sLabelKey = `TXT_CHANGEVISUALIZATION_OVERVIEW_${sChangeCategoryName.toUpperCase()}`;
		return this._oTextBundle.getText(sLabelKey, [iChangesCount]);
	};

	ChangeVisualization.prototype._getChangeCategoryButtonText = function(sChangeCategoryName) {
		const sButtonKey = `BTN_CHANGEVISUALIZATION_OVERVIEW_${sChangeCategoryName.toUpperCase()}`;
		const sBaseText = this._oTextBundle.getText(sButtonKey);
		const sVisualizedChangeState = this._oChangeVisualizationModel.getData().changeState;
		if (sVisualizedChangeState === ChangeStates.ALL) {
			return sBaseText;
		}
		const sStateText = this._oTextBundle.getText(`BUT_CHANGEVISUALIZATION_VERSIONING_${sVisualizedChangeState.toUpperCase()}`);
		return `${sBaseText} (${sStateText})`;
	};

	ChangeVisualization.prototype.openChangeCategorySelectionPopover = function(oEvent) {
		// Event bubbled through the toolbar, get original source
		this._oToolbarButton ||= Element.getElementById(oEvent.getParameter("id"));
		const oPopover = this.getPopover();

		if (!oPopover) {
			Fragment.load({
				name: "sap.ui.rta.util.changeVisualization.ChangeIndicatorCategorySelection",
				id: this._getComponent().createId("changeVisualization_changesList"),
				controller: this
			})
			.then(function(oPopover) {
				this._oToolbarButton.addDependent(oPopover);
				oPopover.setModel(this._oChangeVisualizationModel, "visualizationModel");
				oPopover.openBy(this._oToolbarButton);
				this.setPopover(oPopover);
				// Currently required because of an binding issue from the control
				// At the first opening of the popover the controls don't get updated when the bound
				// model changes. With the reopening this Problem gets fixed
				// TODO Remove once control owners have fixed the issue
				oPopover.close();
				oPopover.openBy(this._oToolbarButton);
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
		const sSelectedChangeCategory = oEvent.getSource().getBindingContext("visualizationModel").getObject().key;
		this._selectChangeCategory(sSelectedChangeCategory);
		this.getPopover()?.close();
	};

	ChangeVisualization.prototype.onVersioningCategoryChange = function(oEvent) {
		const sSelectedChangeState = oEvent.getSource().getSelectedKey();
		this._selectChangeState(sSelectedChangeState);
	};

	ChangeVisualization.prototype._selectChangeCategory = function(sSelectedChangeCategory) {
		this._sSelectedChangeCategory = sSelectedChangeCategory;

		const sChangeCategoryText = this._getChangeCategoryButtonText(sSelectedChangeCategory);

		this._updateVisualizationModel({
			changeCategory: sSelectedChangeCategory,
			changeCategoryText: sChangeCategoryText
		});

		this._updateChangeIndicators();
		this._setFocusedIndicator();
	};

	ChangeVisualization.prototype._selectChangeState = function(sSelectedChangeState) {
		this._sSelectedChangeState = sSelectedChangeState;

		const sSelectedChangeCategory = this._oChangeVisualizationModel.getData().changeCategory;
		const sChangeCategoryText = this._getChangeCategoryButtonText(sSelectedChangeCategory);

		this._updateVisualizationModel({
			changeState: sSelectedChangeState,
			changeCategoryText: sChangeCategoryText
		});

		this._updateChangeIndicators();
		this._updateVisualizationModelMenuData();
	};

	ChangeVisualization.prototype._getCommandForChange = function(oChange) {
		const sCommand = oChange.getSupportInformation().command;
		if (sCommand) {
			return sCommand;
		}

		if (!oChange.getSelector || !oChange.getSelector() || isEmptyObject(oChange.getSelector())) {
			return false;
		}

		const oComponent = this._getComponent();
		const oSelectorControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oComponent);
		const oLastDependentSelector = oChange.getDependentSelectorList().slice(-1)[0];
		const oLastDependentSelectorControl = JsControlTreeModifier.bySelector(oLastDependentSelector, oComponent);

		// Recursively search through parent element structure
		// This is necessary to make sure that elements that were created during runtime
		// (e.g. for SimpleForms) are considered.
		function searchForCommand(oOverlay, sAggregationName) {
			const oControl = oOverlay.getElement();
			const sCommand = oOverlay.getDesignTimeMetadata().getCommandName(
				oChange.getChangeType(),
				oControl,
				sAggregationName
			);
			if (sCommand) {
				return sCommand;
			}

			const oParentOverlay = oOverlay.getParentElementOverlay();
			const oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
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
		const oComponent = this._getComponent();
		const mPropertyBag = {
			selector: oComponent,
			invalidateCache: false,
			includeCtrlVariants: true,
			currentLayer: Layer.CUSTOMER,
			includeDirtyChanges: true,
			onlyCurrentVariants: true
		};
		return PersistenceWriteAPI._getUIChanges(mPropertyBag);
	};

	ChangeVisualization.prototype._updateChangeRegistry = function() {
		return this._collectChanges().then(function(aChanges) {
			// remove updated changes
			this._oChangeIndicatorRegistry.removeOutdatedRegisteredChanges();
			// remove changes with incomplete vizInfo
			this._oChangeIndicatorRegistry.removeRegisteredChangesWithoutVizInfo();
			// remove all registered changes after versions activation
			if (this._oChangeVisualizationModel.getData().displayedVersion !== "0") {
				this._oChangeIndicatorRegistry.reset();
			}
			const aRegisteredChangeIds = this._oChangeIndicatorRegistry.getRegisteredChangeIds();
			const oCurrentChanges = aChanges
			.reduce(function(oChanges, oChange) {
				oChanges[oChange.getId()] = oChange;
				return oChanges;
			}, {});
			const aCurrentChangeIds = Object.keys(oCurrentChanges);

			// Remove registered changes which no longer exist
			difference(aRegisteredChangeIds, aCurrentChangeIds).forEach(function(sChangeIdToRemove) {
				this._oChangeIndicatorRegistry.removeRegisteredChange(sChangeIdToRemove);
			}.bind(this));
			const aPromises = [];
			// Register missing changes
			difference(aCurrentChangeIds, aRegisteredChangeIds).forEach(function(sChangeIdToAdd) {
				const oChangeToAdd = oCurrentChanges[sChangeIdToAdd];
				const sCommandName = this._getCommandForChange(oChangeToAdd);
				aPromises.push(this._oChangeIndicatorRegistry.registerChange(oChangeToAdd, sCommandName, this.oVersionsModel));
			}.bind(this));
			return Promise.all(aPromises);
		}.bind(this));
	};

	ChangeVisualization.prototype.selectChange = function(oEvent) {
		const sChangeId = oEvent.getParameter("changeId");
		this._selectChange(sChangeId);
	};

	ChangeVisualization.prototype._selectChange = function(sChangeId) {
		const aDependentElements = this._oChangeIndicatorRegistry.getRegisteredChange(sChangeId).visualizationInfo.dependentElementIds;
		aDependentElements.forEach(function(sElementId) {
			const oOverlayDomRef = OverlayRegistry.getOverlay(sElementId).getDomRef();
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
		this._oChangeVisualizationModel.setData({
			...this._oChangeVisualizationModel.getData(),
			...oData
		});
	};

	ChangeVisualization.prototype._updateChangeIndicators = function() {
		const oSelectors = this._oChangeIndicatorRegistry.getSelectorsWithRegisteredChanges();
		const oIndicators = {};
		this._mDisplayElementsKeyMap = {};
		const oConnectedElements = this._oDesignTime?.getSelectionManager?.().getConnectedElements();
		Object.keys(oSelectors).forEach(function(sSelectorId) {
			const aChangesOnIndicator = oSelectors[sSelectorId];
			const aRelevantChanges = this._filterRelevantChanges(oSelectors[sSelectorId]);
			const oOverlay = _determineElementOverlay(sSelectorId, aChangesOnIndicator[0].affectedElementId);

			if (_isOverlayInvisible(oOverlay)) {
				// Change is not visible
				return undefined;
			}
			const oOverlayPosition = oOverlay.getDomRef().getClientRects()[0] || { left: 0, top: 0 };
			oIndicators[sSelectorId] = {
				posX: parseInt(oOverlayPosition.left),
				posY: parseInt(oOverlayPosition.top),
				changes: aRelevantChanges
			};

			const oChangeIndicator = this._oChangeIndicatorRegistry.getChangeIndicator(sSelectorId);
			const sOverlayId = oOverlay.getId();
			const oConnectedElement = oConnectedElements?.[oOverlay.getAssociation("element")];
			if (!oChangeIndicator) {
				this._createChangeIndicator(oOverlay, sSelectorId, oConnectedElement);
				// Assumption: all changes on an indicator affect the same elements
				const sDisplayElementsKey = aChangesOnIndicator[0].displayElementsKey;
				// This map is built to collect indicators with the same display elements (e.g. OP Section & AnchorBar)
				if (!this._mDisplayElementsKeyMap[sDisplayElementsKey]) {
					this._mDisplayElementsKeyMap[sDisplayElementsKey] = [sSelectorId];
				} else {
					this._mDisplayElementsKeyMap[sDisplayElementsKey].push(sSelectorId);
				}
			} else if (oChangeIndicator.getOverlayId() !== sOverlayId) {
				// Overlay id might change, e.g. during undo/redo of dirty changes
				oChangeIndicator.setOverlayId(sOverlayId);
				oChangeIndicator.setVisible(true);
			}
			return undefined;
		}.bind(this));

		if (
			!deepEqual(
				oIndicators,
				this._oChangeVisualizationModel.getData().content
			)
		) {
			this._updateVisualizationModel({
				content: oIndicators
			});
		}
	};

	ChangeVisualization.prototype._filterRelevantChanges = function(aChangeVizInfo) {
		if (!Array.isArray(aChangeVizInfo)) {
			return aChangeVizInfo;
		}
		const oRootData = this._oChangeVisualizationModel.getData();

		return aChangeVizInfo.filter(function(oChangeVizInfo) {
			return (
				!oChangeVizInfo.dependent
				&& oChangeVizInfo.changeCategory
				&& (
					oRootData.changeCategory === ChangeCategories.ALL
					|| oRootData.changeCategory === oChangeVizInfo.changeCategory
				)
				&& (
					!oRootData.changeState
					|| oRootData.changeState === ChangeStates.ALL
					|| oChangeVizInfo.changeStates.includes(oRootData.changeState)
				)
			);
		});
	};

	ChangeVisualization.prototype._createChangeIndicator = function(oOverlay, sSelectorId, oConnectedElementId) {
		const oChangeIndicator = new ChangeIndicator({
			changes: "{changes}",
			posX: "{posX}",
			posY: "{posY}",
			visible: "{= ${/active} && (${changes} || []).length > 0}",
			overlayId: oOverlay.getId(),
			selectorId: sSelectorId,
			selectChange: this.selectChange.bind(this),
			connectedElementId: oConnectedElementId
		});
		oChangeIndicator.setModel(this._oChangeVisualizationModel);
		oChangeIndicator.bindElement(`/content/${sSelectorId}`);
		oChangeIndicator.setModel(this.getModel("i18n"), "i18n");
		this._oChangeIndicatorRegistry.registerChangeIndicator(sSelectorId, oChangeIndicator);
	};

	ChangeVisualization.prototype._setFocusedIndicator = async function() {
		// Sort the Indicators according XY-Position
		// Set the tabindex according the sorting
		// Focus the first visible indicator
		await this._oChangeIndicatorRegistry.waitForIndicatorRendering();
		const aVisibleIndicators = [];
		this._oChangeIndicatorRegistry.getChangeIndicators().forEach((oIndicator) => {
			const oOverlay = OverlayRegistry.getOverlay(oIndicator.getOverlayId());
			// As setting the focus happens asynchronously after rendering,
			// the overlay can be gone by the time this code is executed
			if (!oOverlay) {
				return;
			}
			if (oIndicator.getVisible()) {
				oOverlay.setFocusable(true);
				aVisibleIndicators.push(oIndicator);
			} else {
				oOverlay.setFocusable(false);
			}
		});

		if (aVisibleIndicators.length > 0) {
			aVisibleIndicators.sort(function(oIndicator1, oIndicator2) {
				const iDeltaY = oIndicator1.getPosY() - oIndicator2.getPosY();
				const iDeltaX = oIndicator1.getPosX() - oIndicator2.getPosX();
				// Only consider x value if y is the same
				return iDeltaY || iDeltaX;
			});
			const aVisibleIndicatorsOnScrollPosition = [];
			aVisibleIndicators.forEach(function(oIndicator, iIndex) {
				const oOverlay = OverlayRegistry.getOverlay(oIndicator.getOverlayId());
				oOverlay.setFocusable(true);
				oIndicator.getDomRef().tabIndex = iIndex + 2;
				// Indicators with posY < 0 are outside of the current scroll position
				if (oIndicator.getPosY() > 0) {
					aVisibleIndicatorsOnScrollPosition.push(oIndicator);
				}
			});
			if (aVisibleIndicatorsOnScrollPosition.length > 0) {
				// Indicators visible with the current scroll position get focus
				// to avoid unexpected scrolling when visualization is started
				aVisibleIndicatorsOnScrollPosition[0].focus();
			} else {
				aVisibleIndicators[0].focus();
			}
		}
	};

	ChangeVisualization.prototype._toggleRootOverlayClickHandler = function(bEnable) {
		const oRootOverlayDomRef = this.oRootOverlay && this.oRootOverlay.getDomRef();
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
		this.setVersionsModel(oToolbar);
		// When the visualization is started, the focusable overlays are stored to be reset when the visualization is stopped
		this.aFocusableOverlays ||= OverlayRegistry.getOverlays().filter(function(oOverlay) {
			return oOverlay.getFocusable();
		});

		const fnSetOverlayFocusability = (bFocusable) => {
			this.aFocusableOverlays.forEach(function(oOverlay) {
				oOverlay.setFocusable(bFocusable);
			});
		};

		if (this.oVersionsModel && this.oVersionsModel.getData().versioningEnabled) {
			this._updateVisualizationModel({
				versioningAvailable: this.oVersionsModel.getData().versioningEnabled,
				displayedVersion: this.oVersionsModel.getData().displayedVersion
			});
		} else {
			// no versioning available, setting draft version id for caching to be working
			this._updateVisualizationModel({
				versioningAvailable: false,
				displayedVersion: "0"
			});
		}

		// Clean up when the visualization is no longer active
		if (this.getIsActive()) {
			this.setIsActive(false);
			this._toggleRootOverlayClickHandler(false);
			fnSetOverlayFocusability(true);
			delete this.aFocusableOverlays;
			return;
		}
		fnSetOverlayFocusability(false);
		this._toggleRootOverlayClickHandler(true);
		if (!this.getRootControlId()) {
			this.setRootControlId(oRootControl);
		}

		this.setIsActive(true);
		// show all change visualizations at startup
		this._updateChangeRegistry()
		.then(function() {
			this._selectChangeCategory(this._sSelectedChangeCategory);
			// This is required to avoid flickering of the toolbar when switching
			// to visualization mode when the mode switcher is displayed as icons
			oToolbar.adjustToolbarSectionWidths();

			this._updateVisualizationModelMenuData();
			return this._oChangeIndicatorRegistry.waitForIndicatorRendering();
		}.bind(this))
		.then(function() {
			oToolbar.setModel(this._oChangeVisualizationModel, "visualizationModel");
		}.bind(this));
	};

	return ChangeVisualization;
});
