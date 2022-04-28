/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/base/util/restricted/_difference",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/util/changeVisualization/ChangeIndicator",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry"
], function(
	Fragment,
	difference,
	deepEqual,
	Log,
	JsControlTreeModifier,
	Control,
	OverlayRegistry,
	ElementUtil,
	ChangesUtils,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	Layer,
	FlUtils,
	ResourceModel,
	JSONModel,
	ChangeIndicator,
	ChangeIndicatorRegistry
) {
	"use strict";

	var VALID_COMMANDS = {
		add: [
			"createContainer",
			"addDelegateProperty",
			"reveal",
			"addIFrame"
		],
		move: [
			"move"
		],
		rename: [
			"rename"
		],
		combinesplit: [
			"combine",
			"split"
		],
		remove: [
			"remove"
		]
	};
	var CATEGORY_ALL = "all";

	var CATEGORY_ICONS = {
		all: "sap-icon://show",
		add: "sap-icon://add",
		move: "sap-icon://move",
		rename: "sap-icon://edit",
		combinesplit: "sap-icon://combine",
		remove: "sap-icon://less"
	};

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
			Control.prototype.constructor.apply(this, arguments);

			this._oChangeIndicatorRegistry = new ChangeIndicatorRegistry({
				commandCategories: VALID_COMMANDS
			});
			this._oTextBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.setModel(new ResourceModel({
				bundle: this._oTextBundle
			}), "i18n");

			this._oChangeVisualizationModel = new JSONModel({
				active: this.getIsActive()
			});
			this._oChangeVisualizationModel.setDefaultBindingMode("OneWay");
			this._sSelectedCommandCategory = "all";
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
		var aRegisteredChanges = this._oChangeIndicatorRegistry.getChanges();
		aRegisteredChanges.forEach(function(oChange) {
			var oVisualizedChange = aVisualizedChanges.find(function(oVisualizedChange) {
				return oChange.change.getId() === oVisualizedChange.id;
			});
			if (!oVisualizedChange && !oChange.dependent) {
				aHiddenChanges.push(oChange);
			}
		});
		var aCommandData = Object.keys(VALID_COMMANDS).map(function(sCommandCategoryName) {
			var sTitle = this._getCommandCategoryLabel(
				sCommandCategoryName,
				this._getChangesForCommandCategory(sCommandCategoryName, aVisualizedChanges).length
			);
			return {
				key: sCommandCategoryName,
				count: this._getChangesForCommandCategory(sCommandCategoryName, aVisualizedChanges).length,
				title: sTitle,
				icon: CATEGORY_ICONS[sCommandCategoryName]
			};
		}.bind(this));

		aCommandData.unshift({
			key: CATEGORY_ALL,
			count: this._getChangesForCommandCategory(CATEGORY_ALL, aVisualizedChanges).length,
			title: this._getCommandCategoryLabel(CATEGORY_ALL, this._getChangesForCommandCategory(CATEGORY_ALL, aVisualizedChanges).length),
			icon: CATEGORY_ICONS[CATEGORY_ALL]
		});

		this._updateVisualizationModel({
			commandCategories: aCommandData,
			hiddenChanges: aHiddenChanges,
			popupInfoMessage: this._oTextBundle.getText(
				"MSG_CHANGEVISUALIZATION_HIDDEN_CHANGES_INFO",
				[aHiddenChanges.length]
			)
		});
	};

	ChangeVisualization.prototype._getChangesForCommandCategory = function(sCommandCategory, aChanges) {
		return aChanges.filter(function(oChange) {
			return sCommandCategory === CATEGORY_ALL
				? oChange.commandCategory !== undefined
				: sCommandCategory === oChange.commandCategory;
		});
	};

	ChangeVisualization.prototype._getCommandCategoryLabel = function(sCommandCategoryName, iChangesCount) {
		var sLabelKey = "TXT_CHANGEVISUALIZATION_OVERVIEW_" + sCommandCategoryName.toUpperCase();
		return this._oTextBundle.getText(sLabelKey, [iChangesCount]);
	};

	ChangeVisualization.prototype._getCommandCategoryButton = function(sCommandCategoryName) {
		var sButtonKey = "BTN_CHANGEVISUALIZATION_OVERVIEW_" + sCommandCategoryName.toUpperCase();
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
	 * Sets the selected command category and visualizes all changes for the given category
	 *
	 * @param {event} oEvent - Event
	 * @returns {Promise} - Promise of category change
	 */
	ChangeVisualization.prototype.onCommandCategorySelection = function(oEvent) {
		var sSelectedCommandCategory = oEvent.getSource().getBindingContext("visualizationModel").getObject().key;
		return this._selectCommandCategory(sSelectedCommandCategory);
	};

	ChangeVisualization.prototype._selectCommandCategory = function(sSelectedCommandCategory) {
		this._sSelectedCommandCategory = sSelectedCommandCategory;

		var aRegisteredChanges = this._oChangeIndicatorRegistry.getChanges();
		var aRelevantChanges = this._getChangesForCommandCategory(sSelectedCommandCategory, aRegisteredChanges);

		var sCommandCategoryText = this._getCommandCategoryButton(sSelectedCommandCategory);

		this._updateVisualizationModel({
			commandCategory: sSelectedCommandCategory,
			commandCategoryText: sCommandCategoryText
		});

		return Promise.all(aRelevantChanges.map(function(oChange) {
			return this._getVisualizationInfo(oChange)
				.then(function(mVisualizationInfo) {
					this._oChangeIndicatorRegistry.addVisualizationInfo(
						oChange.change.getId(),
						mVisualizationInfo
					);
				}.bind(this));
		}.bind(this)))
			.then(function() {
				this._updateChangeIndicators();
				this._setFocusedIndicator();
			}.bind(this));
	};

	ChangeVisualization.prototype._getVisualizationInfo = function(mChangeInformation) {
		var oComponent = this._getComponent();

		function getSelectorIds(aSelectorList) {
			if (!aSelectorList) {
				return undefined;
			}
			return aSelectorList
				.map(function(vSelector) {
					var oElement = typeof vSelector.getId === "function"
						? vSelector
						: JsControlTreeModifier.bySelector(vSelector, oComponent);
					return oElement && oElement.getId();
				})
				.filter(Boolean);
		}

		return this._getInfoFromChangeHandler(oComponent, mChangeInformation.change)
			.then(function(oInfoFromChangeHandler) {
				var mVisualizationInfo = oInfoFromChangeHandler || {};
				var aAffectedElementIds = (
					getSelectorIds(mVisualizationInfo.affectedControls || [mChangeInformation.change.getSelector()])
				);

				return {
					affectedElementIds: aAffectedElementIds,
					dependentElementIds: getSelectorIds(mVisualizationInfo.dependentControls) || [],
					displayElementIds: getSelectorIds(mVisualizationInfo.displayControls) || aAffectedElementIds,
					payload: mVisualizationInfo.payload
				};
			});
	};

	ChangeVisualization.prototype._getCommandForChange = function(oChange) {
		var sCommand = oChange.getDefinition().support.command;
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

	ChangeVisualization.prototype._getInfoFromChangeHandler = function(oAppComponent, oChange) {
		var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
		if (oControl) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};
			var mControl = ChangesUtils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			return ChangesWriteAPI.getChangeHandler({
				changeType: oChange.getChangeType(),
				element: mControl.control,
				modifier: JsControlTreeModifier,
				layer: oChange.getLayer()
			})
				.then(function(oChangeHandler) {
					if (oChangeHandler && typeof oChangeHandler.getChangeVisualizationInfo === "function") {
						return oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent);
					}
					return undefined;
				})
				.catch(function(vErr) {
					Log.error(vErr);
					return undefined;
				});
		}

		return Promise.resolve();
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
			var aRegisteredChangeIds = this._oChangeIndicatorRegistry.getChangeIds();
			var oCurrentChanges = aChanges
				.filter(function(oChange) {
					return oChange.getFileType() === 'change';
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

			// Register missing changes
			difference(aCurrentChangeIds, aRegisteredChangeIds).forEach(function(sChangeIdToAdd) {
				var oChangeToAdd = oCurrentChanges[sChangeIdToAdd];
				var sCommandName = this._getCommandForChange(oChangeToAdd);
				this._oChangeIndicatorRegistry.registerChange(oChangeToAdd, sCommandName);
			}.bind(this));
		}.bind(this));
	};

	ChangeVisualization.prototype.selectChange = function(oEvent) {
		var sChangeId = oEvent.getParameter("changeId");
		this._selectChange(sChangeId);
	};

	ChangeVisualization.prototype._selectChange = function(sChangeId) {
		var aDependentElements = this._oChangeIndicatorRegistry.getChange(sChangeId).visualizationInfo.dependentElementIds;
		aDependentElements.forEach(function(sElementId) {
			var oOverlayDomRef = OverlayRegistry.getOverlay(sElementId).getDomRef();
			oOverlayDomRef.scrollIntoViewIfNeeded();
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
		var oSelectors = this._oChangeIndicatorRegistry.getChangeIndicatorData();
		var oIndicators = {};
		var aVisualizedChanges = [];
		Object.keys(oSelectors)
			.forEach(function(sSelectorId) {
				var aChanges = oSelectors[sSelectorId];
				var oOverlay = OverlayRegistry.getOverlay(sSelectorId);
				if (!oOverlay || !oOverlay.getDomRef() || !oOverlay.isVisible()) {
					// Change is not visible
					return undefined;
				}
				var oOverlayPosition = oOverlay.getDomRef().getClientRects()[0] || { left: 0, top: 0 };
				var aRelevantChanges = this._filterRelevantChanges(aChanges);
				aRelevantChanges.forEach(function (oChange) {
					aVisualizedChanges.push(oChange);
				});
				oIndicators[sSelectorId] = {
					posX: parseInt(oOverlayPosition.left),
					posY: parseInt(oOverlayPosition.top),
					changes: aRelevantChanges
				};

				if (!this._oChangeIndicatorRegistry.hasChangeIndicator(sSelectorId)) {
					this._createChangeIndicator(oOverlay, sSelectorId);
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

	ChangeVisualization.prototype._filterRelevantChanges = function(aChanges) {
		if (!Array.isArray(aChanges)) {
			return aChanges;
		}
		var oRootData = this._oChangeVisualizationModel.getData();

		return aChanges.filter(function(oChange) {
			return (
				!oChange.dependent
				&& (
					oRootData.commandCategory === 'all'
					|| oRootData.commandCategory === oChange.commandCategory
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

		// Temporarily place the indicator in the static area
		// It will move itself to the correct overlay after rendering
		oChangeIndicator.placeAt(sap.ui.getCore().getStaticAreaRef());
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
	 * @param {sap.ui.triggerModeChange.Toolbar} oToolbar - Toolbar of RTA
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
			.then(this._selectCommandCategory.bind(this, this._sSelectedCommandCategory))
			.then(function() {
				this._updateVisualizationModelMenuData();
				oToolbar.setModel(this._oChangeVisualizationModel, "visualizationModel");
			}.bind(this));
	};

	return ChangeVisualization;
});
