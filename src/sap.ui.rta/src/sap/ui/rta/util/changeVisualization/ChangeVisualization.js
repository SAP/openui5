/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/rta/util/changeVisualization/ChangeIndicator",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/core/Component",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/util/restricted/_difference",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/dt/OverlayRegistry",
	"sap/base/util/deepEqual",
	"sap/ui/events/KeyCodes",
	"sap/m/ButtonType"
], function(
	Control,
	ChangeIndicator,
	ChangeIndicatorRegistry,
	Component,
	JsControlTreeModifier,
	PersistenceWriteAPI,
	Layer,
	Fragment,
	JSONModel,
	ResourceModel,
	difference,
	FlUtils,
	ChangesUtils,
	OverlayRegistry,
	deepEqual,
	KeyCodes,
	ButtonType
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
	 * @ui5-restricted
	 */
	var ChangeVisualization = Control.extend("sap.ui.rta.util.changeVisualization.ChangeVisualization", {
		metadata: {
			properties: {
				/**
				 * Id of the component to visualize the changes for
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
		constructor: function () {
			Control.prototype.constructor.apply(this, arguments);

			this._oChangeIndicatorRegistry = new ChangeIndicatorRegistry({
				commandCategories: VALID_COMMANDS
			});
			this._oTextBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.setModel(new ResourceModel({
				bundle: this._oTextBundle
			}), "i18n");

			this._oPopoverModel = new JSONModel();
			this._oPopoverModel.setDefaultBindingMode("OneWay");

			this._oChangeIndicatorModel = new JSONModel({
				active: this.getIsActive()
			});
			this._oChangeIndicatorModel.setDefaultBindingMode("OneWay");
		}
	});

	ChangeVisualization.prototype.setRootControlId = function (sRootControlId) {
		if (this.getRootControlId() && this.getRootControlId() !== sRootControlId) {
			this._reset();
		}
		this.setProperty("rootControlId", sRootControlId);
	};

	ChangeVisualization.prototype.setIsActive = function (bActiveState) {
		if (bActiveState === this.getIsActive()) {
			return;
		}
		this.setProperty("isActive", bActiveState);

		if (this._oChangeIndicatorModel) {
			this._updateIndicatorModel({
				active: bActiveState
			});
		}

		if (this._oToolbarButton) {
			this._oToolbarButton.setType(bActiveState ? ButtonType.Emphasized : ButtonType.Transparent);
			this._oToolbarButton.setTooltip(this._oTextBundle.getText(
				bActiveState
				? "BUT_CHANGEVISUALIZATION_HIDECHANGES"
				: "BUT_CHANGEVISUALIZATION_SHOWCHANGES"
			));
		}
	};

	ChangeVisualization.prototype.exit = function () {
		this._oChangeIndicatorRegistry.destroy();
	};

	ChangeVisualization.prototype._reset = function () {
		this._oChangeIndicatorRegistry.reset();
	};

	/**
	 * Toggles whether change visualization should be displayed or not
	 *
	 * @param {event} oEvent - Event
	 */
	ChangeVisualization.prototype.toggleActive = function (oEvent) {
		if (!this._oToolbarButton) {
			// Event bubbled through the toolbar, get original source
			this._oToolbarButton = sap.ui.getCore().byId(oEvent.getParameter("id"));
		}

		var bIsActive = this.getIsActive();
		if (bIsActive) {
			this.setIsActive(false);
		} else {
			this._updateChangeRegistry().then(this._updatePopoverModel.bind(this));
			this._togglePopover();
		}
	};

	ChangeVisualization.prototype._updatePopoverModel = function () {
		var aCommandData = Object.keys(VALID_COMMANDS).map(function (sCommandCategoryName) {
			return {
				key: sCommandCategoryName,
				count: this._getChangesForCommandCategory(sCommandCategoryName).length,
				title: this._getCommandCategoryLabel(sCommandCategoryName)
			};
		}.bind(this));

		aCommandData.unshift({
			key: CATEGORY_ALL,
			count: this._getChangesForCommandCategory(CATEGORY_ALL).length,
			title: this._getCommandCategoryLabel(CATEGORY_ALL)
		});

		this._oPopoverModel.setData(aCommandData);
	};

	ChangeVisualization.prototype._getChangesForCommandCategory = function (sCommandCategory) {
		var aRegisteredChanges = this._oChangeIndicatorRegistry.getChanges();
		return aRegisteredChanges.filter(function (oChange) {
			return sCommandCategory === CATEGORY_ALL
				? oChange.commandCategory !== undefined
				: sCommandCategory === oChange.commandCategory;
		});
	};

	ChangeVisualization.prototype._getCommandCategoryLabel = function (sCommandCategoryName) {
		var sLabelKey = "TXT_CHANGEVISUALIZATION_OVERVIEW_" + sCommandCategoryName.toUpperCase();
		return this._oTextBundle.getText(sLabelKey);
	};

	ChangeVisualization.prototype._togglePopover = function () {
		var oPopover = this.getPopover();

		if (!oPopover) {
			Fragment.load({
				name: "sap.ui.rta.util.changeVisualization.ChangesListPopover",
				id: Component.get(this.getRootControlId()).createId("changeVisualization_changesListPopover"),
				controller: this
			})
				.then(function(oPopover) {
					this._oToolbarButton.addDependent(oPopover);
					oPopover.setModel(this._oPopoverModel, "commandModel");
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
	 */
	ChangeVisualization.prototype.selectCommandCategory = function (oEvent) {
		this.getPopover().close();
		this.setIsActive(true);

		var sSelectedCommandCategory = oEvent.getSource().getBindingContext("commandModel").getObject().key;
		var aRelevantChanges = this._getChangesForCommandCategory(sSelectedCommandCategory);

		this._updateIndicatorModel({
			selectedChange: undefined,
			commandCategory: sSelectedCommandCategory
		});

		return Promise.all(aRelevantChanges.map(function (oChange) {
			return this._getChangedElements(oChange, false)
				.then(function (aElements) {
					this._oChangeIndicatorRegistry.addSelectorsForChangeId(
						oChange.change.getId(),
						aElements,
						false
					);
				}.bind(this));
		}.bind(this)))
			.then(function () {
				this._updateChangeIndicators();
				this._setFocusedIndicator();
			}.bind(this));
	};

	ChangeVisualization.prototype._getChangedElements = function (oChangeInformation, bDependent) {
		var oComponent = Component.get(this.getRootControlId());
		return this._getInfoFromChangeHandler(oComponent, oChangeInformation.change)
			.then(function (oInfoFromChangeHandler) {
				var aSelector = [oChangeInformation.change.getSelector()];
				if (oInfoFromChangeHandler) {
					if (bDependent) {
						aSelector = oInfoFromChangeHandler.dependentControls;
					} else {
						aSelector = oInfoFromChangeHandler.affectedControls;
					}
				}

				var aPromises = aSelector.map(function (oSelector) {
					return JsControlTreeModifier.bySelector(oSelector, oComponent);
				});
				return Promise.all(aPromises)
					.then(function (aElements) {
						return aElements.map(function (oElement) {
							// Removed elements have to be visualized on the parent
							if (oChangeInformation.commandCategory === "remove" && oElement) {
								return oElement.getParent();
							}
							return oElement;
						});
					});
			});
	};

	ChangeVisualization.prototype._getInfoFromChangeHandler = function (oAppComponent, oChange) {
		var oControl = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);
		if (oControl) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent,
				view: FlUtils.getViewForControl(oControl)
			};
			var mControl = ChangesUtils.getControlIfTemplateAffected(oChange, oControl, mPropertyBag);
			return ChangesUtils.getChangeHandler(oChange, mControl, mPropertyBag)
				.then(function (oChangeHandler) {
					if (oChangeHandler && typeof oChangeHandler.getChangeVisualizationInfo === "function") {
						return oChangeHandler.getChangeVisualizationInfo(oChange, oAppComponent);
					}
				});
		}

		return Promise.resolve();
	};

	ChangeVisualization.prototype._collectChanges = function () {
		var oComponent = Component.get(this.getRootControlId());
		var mPropertyBag = {
			oComponent: oComponent,
			selector: oComponent,
			invalidateCache: false,
			includeVariants: true,
			// includeCtrlVariants: true,
			currentLayer: Layer.CUSTOMER
		};
		return PersistenceWriteAPI._getUIChanges(mPropertyBag);
	};

	ChangeVisualization.prototype._updateChangeRegistry = function () {
		return this._collectChanges().then(function (aChanges) {
			var aRegisteredChangeIds = this._oChangeIndicatorRegistry.getChangeIds();
			var oCurrentChanges = aChanges.reduce(function (oChanges, oChange) {
				oChanges[oChange.getId()] = oChange;
				return oChanges;
			}, {});
			var aCurrentChangeIds = Object.keys(oCurrentChanges);

			// Remove registered changes which no longer exist
			difference(aRegisteredChangeIds, aCurrentChangeIds).forEach(function (sChangeIdToRemove) {
				this._oChangeIndicatorRegistry.removeChange(sChangeIdToRemove);
			}.bind(this));

			// Register missing changes
			difference(aCurrentChangeIds, aRegisteredChangeIds).forEach(function (sChangeIdToAdd) {
				this._oChangeIndicatorRegistry.registerChange(oCurrentChanges[sChangeIdToAdd]);
			}.bind(this));
		}.bind(this));
	};

	ChangeVisualization.prototype._selectChange = function (oEvent) {
		var sChangeId = oEvent.getParameter("changeId");
		this._updateIndicatorModel({
			selectedChange: sChangeId
		});

		if (sChangeId === undefined) {
			// Hide dependent selectors
			this._updateChangeIndicators();
			return;
		}

		// Create indicators for the dependent selectors
		var oChange = this._oChangeIndicatorRegistry.getChange(sChangeId);
		this._getChangedElements(oChange, true)
			.then(function (aElements) {
				this._oChangeIndicatorRegistry.addSelectorsForChangeId(
					oChange.change.getId(),
					aElements,
					true
				);
				this._updateChangeIndicators();
			}.bind(this));
	};

	ChangeVisualization.prototype._updateIndicatorModel = function (oData) {
		this._oChangeIndicatorModel.setData(Object.assign(
			{},
			this._oChangeIndicatorModel.getData(),
			oData
		));
	};

	ChangeVisualization.prototype._updateChangeIndicators = function () {
		var oSelectors = this._oChangeIndicatorRegistry.getChangeIndicatorData();
		var oIndicators = {};
		Object.keys(oSelectors)
			.forEach(function (sSelectorId) {
				var aChanges = oSelectors[sSelectorId];
				var oOverlay = OverlayRegistry.getOverlay(sSelectorId);
				if (!oOverlay || !oOverlay.getDomRef()) {
					// Change is not visible
					return undefined;
				}

				oIndicators[sSelectorId] = {
					posX: parseInt(oOverlay.getDomRef().getClientRects()[0].left),
					posY: parseInt(oOverlay.getDomRef().getClientRects()[0].top),
					changes: this._filterRelevantChanges(aChanges)
				};

				if (!this._oChangeIndicatorRegistry.hasChangeIndicator(sSelectorId)) {
					this._createChangeIndicator(oOverlay, sSelectorId);
				}
			}.bind(this));

		if (
			!deepEqual(
				oIndicators,
				this._oChangeIndicatorModel.getData().content
			)
		) {
			this._updateIndicatorModel({
				content: oIndicators
			});
		}
	};

	ChangeVisualization.prototype._filterRelevantChanges = function (aChanges) {
		if (!Array.isArray(aChanges)) {
			return aChanges;
		}
		var oRootData = this._oChangeIndicatorModel.getData();

		return aChanges.filter(function (oChange) {
			return (
				// No change is selected and change is of proper category
				(
					!oRootData.selectedChange
					&& !oChange.dependent
					&& (
						oRootData.commandCategory === 'all'
						|| oRootData.commandCategory === oChange.commandCategory
					)
				)
				// Dependent change for currently selected or currently selected
				|| (
					!!oRootData.selectedChange
					&& oChange.id === oRootData.selectedChange
				)
			);
		});
	};

	ChangeVisualization.prototype._createChangeIndicator = function (oOverlay, sSelectorId) {
		var oChangeIndicator = new ChangeIndicator({
			changes: "{changes}",
			mode: {
				path: "changes",
				formatter: function (aChanges) {
					var sSelectedChange = this.getModel().getData().selectedChange;
					return (!!sSelectedChange && (aChanges || []).some(function (oChange) {
						return oChange.dependent;
					})) ? "dependent" : "change";
				}
			},
			posX: "{posX}",
			posY: "{posY}",
			visible: "{= ${/active} && ${changes}.length > 0}",
			overlayId: oOverlay.getId(),
			selectorId: sSelectorId,
			selectChange: this._selectChange.bind(this),
			keyPress: this._onIndicatorKeyPress.bind(this)
		});

		oChangeIndicator.setModel(this._oChangeIndicatorModel);
		oChangeIndicator.bindElement("/content/" + sSelectorId);
		oChangeIndicator.setModel(this.getModel("i18n"), "i18n");

		// Temporarily place the indicator in the static area
		// It will move itself to the correct overlay after rendering
		oChangeIndicator.placeAt(sap.ui.getCore().getStaticAreaRef());

		this._oChangeIndicatorRegistry.registerChangeIndicator(sSelectorId, oChangeIndicator);
	};

	ChangeVisualization.prototype._onIndicatorKeyPress = function (oEvent) {
		var oOriginalEvent = oEvent.getParameter("originalEvent");
		var iKeyCode = oOriginalEvent.keyCode;
		var oIndicator = oEvent.getSource();
		if (
			iKeyCode === KeyCodes.ARROW_UP
			|| iKeyCode === KeyCodes.ARROW_LEFT
			|| (iKeyCode === KeyCodes.TAB && oOriginalEvent.shiftKey)
		) {
			oOriginalEvent.stopPropagation();
			oOriginalEvent.preventDefault();
			this._setFocusedIndicator(oIndicator, -1);
		} else if (
			iKeyCode === KeyCodes.ARROW_DOWN
			|| iKeyCode === KeyCodes.ARROW_RIGHT
			|| iKeyCode === KeyCodes.TAB
		) {
			oOriginalEvent.stopPropagation();
			oOriginalEvent.preventDefault();
			this._setFocusedIndicator(oIndicator, 1);
		} else if (
			iKeyCode === KeyCodes.ESCAPE
		) {
			this.setIsActive(false);
		}
	};

	ChangeVisualization.prototype._setFocusedIndicator = function (oSelectedIndicator, iDirection) {
		// Focus the next visible change indicator in the given direction
		// If none is focused yet, focus the first visible indicator
		var aVisibleIndicators = this._oChangeIndicatorRegistry.getChangeIndicators()
			.filter(function (oIndicator) {
				return oIndicator.getVisible();
			})
			.sort(function (oIndicator1, oIndicator2) {
				var iDeltaY = oIndicator1.getPosY() - oIndicator2.getPosY();
				var iDeltaX = oIndicator1.getPosX() - oIndicator2.getPosX();
				// Only consider x value if y is the same
				return iDeltaY || iDeltaX;
			});

		if (aVisibleIndicators.length === 0) {
			return;
		}

		var iIndexToSelect = oSelectedIndicator
			? (
				aVisibleIndicators.length
				+ aVisibleIndicators.indexOf(oSelectedIndicator)
				+ iDirection
			) % aVisibleIndicators.length
			: 0;
		aVisibleIndicators[iIndexToSelect].focus();
	};

	return ChangeVisualization;
});
