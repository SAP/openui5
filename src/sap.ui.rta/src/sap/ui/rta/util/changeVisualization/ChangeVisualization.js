/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/rta/util/changeVisualization/ChangeCategories",
	"sap/ui/rta/util/changeVisualization/ChangeStates",
	"sap/ui/rta/util/changeVisualization/ChangeVisualizationUtils",
	"sap/ui/rta/util/changeVisualization/commands/getCommandVisualization",
	"sap/ui/rta/util/changeVisualization/resolveBinding"
], function(
	Log,
	Element,
	DateFormat,
	Fragment,
	Lib,
	KeyCodes,
	JsControlTreeModifier,
	Control,
	Overlay,
	OverlayRegistry,
	ElementUtil,
	States,
	VariantManagementState,
	ManifestUtils,
	PersistenceWriteAPI,
	Layer,
	FlUtils,
	ResourceModel,
	JSONModel,
	ChangeIndicatorRegistry,
	ChangeCategories,
	ChangeStates,
	ChangeVisualizationUtils,
	getCommandVisualization,
	resolveBinding
) {
	"use strict";

	function _isOverlayUnavailable(oOverlay) {
		return !oOverlay || !oOverlay.getDomRef();
	}

	/**
	 * Checks whether a change-states-bearing entry (selector entry or registry entry) matches the
	 *
	 * @param {{changeStates: string[]}} oEntry - Selector entry or registered-change entry
	 * @returns {boolean} true if the entry should be visible
	 */
	function matchesStateFilter(oEntry) {
		if (this._bShowAllChanges) {
			return true;
		}
		const aChangeStates = oEntry.changeStates || [];
		return aChangeStates.includes(ChangeStates.DRAFT) || aChangeStates.includes(ChangeStates.DIRTY);
	}

	/**
	 * Walks the registry to determine which overlays should currently carry the dashed-border style class,
	 * then applies the decoration diff: only overlays whose decoration state actually changes vs.
	 * <code>_oDecoratedOverlayIds</code> are touched. Updates the bookkeeping set in place.
	 */
	function applyDecorationDiff() {
		const oSelectors = this._oChangeIndicatorRegistry.getSelectorsWithRegisteredChanges();
		const oConnectedElements = this._getConnectedElements();
		const oTargetIds = new Set();
		// Single source of truth: maps every decorated overlay ID to the change infos that caused it.
		// This lets findOverlayWithChanges and getChangesForOverlay use the same resolution as the border path.
		const oDecoratedOverlayChangeInfos = new Map();

		Object.keys(oSelectors).forEach((sSelectorId) => {
			const aChangeInfos = oSelectors[sSelectorId];
			const aVisibleChangeInfos = aChangeInfos.filter((oChangeInfo) => {
				return !oChangeInfo.dependent && matchesStateFilter.call(this, oChangeInfo);
			});

			if (aVisibleChangeInfos.length === 0) {
				return;
			}

			const oOverlay = _determineElementOverlay(sSelectorId, aChangeInfos[0].affectedElementId);
			if (!oOverlay || _isOverlayUnavailable(oOverlay) || oOverlay.bIsDestroyed) {
				return;
			}

			const sOverlayId = oOverlay.getId();
			oTargetIds.add(sOverlayId);
			const aExisting = oDecoratedOverlayChangeInfos.get(sOverlayId) || [];
			oDecoratedOverlayChangeInfos.set(sOverlayId, [...aExisting, ...aVisibleChangeInfos]);

			// Connected overlay (e.g. IconTabBar anchor for an ObjectPageSection)
			const sElementId = oOverlay.getElement().getId();
			const sConnectedElementId = oConnectedElements[sElementId];
			if (sConnectedElementId) {
				const oConnectedOverlay = OverlayRegistry.getOverlay(sConnectedElementId);
				if (oConnectedOverlay && !_isOverlayUnavailable(oConnectedOverlay) && !oConnectedOverlay.bIsDestroyed) {
					const sConnectedOverlayId = oConnectedOverlay.getId();
					oTargetIds.add(sConnectedOverlayId);
					const aConnectedExisting = oDecoratedOverlayChangeInfos.get(sConnectedOverlayId) || [];
					oDecoratedOverlayChangeInfos.set(sConnectedOverlayId, [...aConnectedExisting, ...aVisibleChangeInfos]);
				}
			}
		});

		// Remove the class from overlays no longer in the target set
		this._oDecoratedOverlayIds.forEach((sOverlayId) => {
			if (!oTargetIds.has(sOverlayId)) {
				const oOverlay = Element.getElementById(sOverlayId);
				oOverlay?.removeStyleClass("sapUiRtaOverlayWithChanges");
			}
		});

		// Add the class to overlays newly in the target set
		oTargetIds.forEach((sOverlayId) => {
			if (!this._oDecoratedOverlayIds.has(sOverlayId)) {
				const oOverlay = Element.getElementById(sOverlayId);
				oOverlay?.addStyleClass("sapUiRtaOverlayWithChanges");
			}
		});

		this._oDecoratedOverlayIds = oTargetIds;
		this._oDecoratedOverlayChangeInfos = oDecoratedOverlayChangeInfos;
	}

	function removePopupAnchor() {
		const oAnchor = document.getElementById(`${this.getId()}--popupAnchor`);
		if (oAnchor) {
			oAnchor.remove();
		}
	}

	function detachGeometryChangeHandlers() {
		if (this._fnGeometryChangeHandler) {
			window.removeEventListener("resize", this._fnGeometryChangeHandler);
			this._fnGeometryChangeHandler = null;
		}
		if (this._fnScrollHandler) {
			window.removeEventListener("scroll", this._fnScrollHandler, { capture: true });
			this._fnScrollHandler = null;
		}
	}

	function setPopOverMinHeight(oEvent) {
		// set the min-height of the popover
		// this is done in "invisible" popover to avoid the popover being resized after opening
		const oPopover = oEvent.getSource();
		const oPopoverDom = oPopover.getDomRef();
		oPopoverDom.style.minHeight = `${this._oCurrentContextMenuRect.height}px`;
		oPopoverDom.classList.remove("sapUiRtaChangeDetailPopupInvisible");
		// The popover is anchored to a fixed-position element placed at the context menu's
		// viewport coordinates. Any geometry change behind it (resize or scroll of an inner
		// container) misaligns it from its visual target, so we close it instead of trying
		// to re-anchor on the fly.
		this._fnGeometryChangeHandler = () => {
			oPopover.close();
		};
		window.addEventListener("resize", this._fnGeometryChangeHandler, { once: true });
		// `scroll` does not bubble, but capture-phase listening on `window` catches scrolls
		// from any inner container (Page, ScrollContainer, Table, ...). Ignore scrolls that
		// originate inside the popover itself (sticky table headers, internal lists).
		// Detach immediately on the first qualifying scroll: the popover close is async, so
		// without this the handler keeps firing through the scroll burst.
		this._fnScrollHandler = (oScrollEvent) => {
			const oTarget = oScrollEvent.target;
			const oPopoverRoot = oPopover.getDomRef();
			if (oTarget.nodeType === Node.ELEMENT_NODE && oPopoverRoot?.contains(oTarget)) {
				return;
			}
			detachGeometryChangeHandlers.call(this);
			oPopover.close();
		};
		window.addEventListener("scroll", this._fnScrollHandler, { capture: true, passive: true });
	}

	function attachOverlayListeners() {
		// Store bound handler for proper cleanup
		this._fnOverlayCreatedHandler = this._onElementOverlayCreated.bind(this);
		this.getDesignTime().attachEvent("elementOverlayCreated", this._fnOverlayCreatedHandler);
	}

	function attachVariantSwitchListener() {
		const oComponent = this._getComponent();
		this._sFlexReference = oComponent && ManifestUtils.getFlexReferenceForControl(oComponent);
		if (!this._sFlexReference) {
			return;
		}
		this._fnVariantSwitchHandler = (mUpdateParameters, aUpdateInfo) => {
			// The listener is notified for every flex reference; only react to this app's reference
			// and only to actual variant switches (not to unrelated variant-map invalidations).
			if (
				mUpdateParameters?.reference === this._sFlexReference
				&& (aUpdateInfo || []).some((oUpdateInfo) => oUpdateInfo.type === "switchVariant")
			) {
				this.refreshBorders().catch((oError) => {
					Log.error("Failed to refresh change visualization borders after variant switch", oError);
				});
			}
		};
		VariantManagementState.getVariantManagementMap().addUpdateListener(this._fnVariantSwitchHandler);
	}

	function detachVariantSwitchListener() {
		if (this._fnVariantSwitchHandler) {
			VariantManagementState.getVariantManagementMap().removeUpdateListener(this._fnVariantSwitchHandler);
			this._fnVariantSwitchHandler = null;
		}
	}

	function collectChanges() {
		const oComponent = this._getComponent();
		const mPropertyBag = {
			selector: oComponent,
			invalidateCache: false,
			includeCtrlVariants: true,
			currentLayer: Layer.CUSTOMER,
			onlyCurrentVariants: true
		};
		return PersistenceWriteAPI._getUIChanges(mPropertyBag);
	}

	/**
	 * Diffs the catalog against the current changes returned by the FL persistence,
	 * adds missing ones to the catalog, removes stale ones, invalidates entries that need
	 * re-resolution (updateRequired), resolves any catalog entries that now have overlays,
	 * and re-applies the decoration diff.
	 *
	 * @returns {Promise<undefined>} Resolves once the registry is up to date and decorations are applied
	 */
	async function refreshChangeRegistryAndDecorations() {
		const aChanges = await collectChanges.call(this);

		// Re-classify changeStates for all catalog entries against the current versions model.
		// This must run before the decoration diff so that a DRAFT→ALL flip (version activation)
		// or a NEW→DRAFT flip (save) is reflected immediately.
		this._oChangeIndicatorRegistry.refreshChangeStates(this.oVersionsModel);

		// Invalidate resolution cache for entries whose display target can shift (e.g. HideControl).
		this._oChangeIndicatorRegistry.invalidateOutdatedResolutions();

		const oCatalogIds = new Set(this._oChangeIndicatorRegistry.getCatalogIds());
		const oCurrentChanges = aChanges.reduce((oAcc, oChange) => {
			oAcc[oChange.getId()] = oChange;
			return oAcc;
		}, {});
		const aCurrentChangeIds = Object.keys(oCurrentChanges);

		// Remove catalog entries for changes that no longer exist in FL persistence
		[...oCatalogIds].forEach((sId) => {
			if (!oCurrentChanges[sId]) {
				this._oChangeIndicatorRegistry.removeRegisteredChange(sId);
			}
		});

		// Add new changes to the catalog (synchronous, no DOM access)
		const aUnseenIds = aCurrentChangeIds.filter((sId) => !oCatalogIds.has(sId));
		aUnseenIds.forEach((sId) => {
			const oChange = oCurrentChanges[sId];
			const sCommandName = this._getCommandForChange(oChange);
			if (sCommandName === false) {
				return;
			}
			this._oChangeIndicatorRegistry.addChangeToCatalog(oChange, sCommandName, this.oVersionsModel);
		});

		// Resolve all unresolved catalog entries whose controls are now in the tree
		await resolveAllPending.call(this);

		applyDecorationDiff.call(this);

		this.fireChangesResolved();
	}

	/**
	 * Attempts to resolve visualization info for all catalog entries that are not yet in the
	 * resolution cache. Entries whose controls are still absent remain unresolved and will be
	 * picked up when their overlay fires elementOverlayCreated.
	 *
	 * @returns {Promise<undefined>} Resolves when all possible resolutions are complete
	 */
	async function resolveAllPending() {
		const oAppComponent = this._getComponent();
		const aUnresolvedIds = this._oChangeIndicatorRegistry.getUnresolvedChangeIds();
		// Attempt resolution for all unresolved entries concurrently; entries whose controls are
		// still absent will return undefined and remain unresolved (no cache entry written).
		await Promise.all(aUnresolvedIds.map((sId) => {
			const oEntry = this._oChangeIndicatorRegistry.getCatalogEntry(sId);
			if (!oEntry) {
				return Promise.resolve();
			}
			return this._oChangeIndicatorRegistry.resolveVisualizationInfo(oEntry.change, oAppComponent);
		}));
	}

	function _determineElementOverlay(oElementId, oAffectedElementId) {
		let oOverlay = OverlayRegistry.getOverlay(oElementId);
		if (!oOverlay) {
			// When the element has no Overlay, check if there is a relevant container Overlay
			// e.g. change on a SmartForm group (Element: parent Form; Relevant Container: SmartForm)
			const oElementOverlay = OverlayRegistry.getOverlay(oAffectedElementId);
			const oRelevantContainer = oElementOverlay?.getRelevantContainer();
			if (oRelevantContainer) {
				oOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			}
		}

		return oOverlay;
	}

	// --- Formatting functions ---

	function getTexts(mChangeInformation, oRtaResourceBundle, sOverlayId) {
		const oAffectedElement = Element.getElementById(mChangeInformation.affectedElementId);
		const mDescriptionPayload = Object.keys(mChangeInformation.descriptionPayload || {}).reduce((mDescriptionPayload, sKey) => {
			const vOriginalValue = mChangeInformation.descriptionPayload[sKey];
			const bIsBinding = FlUtils.isBinding(vOriginalValue);
			mDescriptionPayload[sKey] = bIsBinding
				? resolveBinding(vOriginalValue, oAffectedElement)
				: vOriginalValue;
			return mDescriptionPayload;
		}, {});

		const mPropertyBag = { appComponent: FlUtils.getAppComponentForControl(oAffectedElement) };
		const oOverlay = Element.getElementById(sOverlayId);
		// Guard: oAffectedElement may be null when the change targets a removed element (e.g. a stashed
		// SmartForm group that no longer exists). Pass null safely — DT metadata getLabel must handle it.
		const sElementLabel = oOverlay.getDesignTimeMetadata().getLabel(oAffectedElement) || "";
		const oCommandVisualization = getCommandVisualization(mChangeInformation);
		const oDescription = oCommandVisualization?.getDescription(mDescriptionPayload, sElementLabel, mPropertyBag) || {};
		let sCommandName = mChangeInformation.commandName;
		let sDescriptionText;
		let sDescriptionTooltip;

		// 'Settings' with a custom description should overwrite the description from the CommandVisualization
		if (sCommandName === "settings" && mDescriptionPayload.description) {
			oDescription.descriptionText = mDescriptionPayload.description;
			oDescription.descriptionTooltip = mDescriptionPayload.descriptionTooltip;
		} else if (mChangeInformation.changeCategory === "other") {
			// To retrieve the generic description for commands without visualization
			sCommandName = "other";
		}

		if (oDescription.descriptionText) {
			sDescriptionText = oDescription.descriptionText;
			sDescriptionTooltip = oDescription.descriptionTooltip || "";
		} else {
			const sShortenedElementLabel = ChangeVisualizationUtils.shortenString(sElementLabel);
			const sChangeTextKey = (
				`TXT_CHANGEVISUALIZATION_CHANGE_${
				 sCommandName.toUpperCase()}`
			);
			sDescriptionText = oRtaResourceBundle.getText(sChangeTextKey, [sShortenedElementLabel]);
			sDescriptionTooltip = oRtaResourceBundle.getText(sChangeTextKey, [sElementLabel]);
		}
		sDescriptionTooltip = sDescriptionText.length < sDescriptionTooltip.length ? sDescriptionTooltip : null;
		const sDetailButtonText = oDescription?.buttonText;
		const sIconTooltip = oRtaResourceBundle.getText(
			`TXT_CHANGEVISUALIZATION_OVERVIEW_${
			 mChangeInformation.changeCategory.toUpperCase()}`
		);

		return {
			description: sDescriptionText,
			tooltip: sDescriptionTooltip,
			buttonText: sDetailButtonText,
			iconTooltip: sIconTooltip
		};
	}

	function getDates(mChangeInformation, oRtaResourceBundle) {
		const sCreationDate = mChangeInformation.change.getCreation();
		const oDate = new Date(sCreationDate);
		const sFallbackDate = oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE");

		return {
			fullDate: sCreationDate ? DateFormat.getDateTimeInstance().format(oDate) : sFallbackDate,
			relativeDate: sCreationDate ? DateFormat.getDateTimeInstance({ relative: "true" }).format(oDate) : sFallbackDate
		};
	}

	function formatChangesModelItem(sOverlayId, mChangeInformation) {
		const oRtaResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");
		const oTexts = getTexts(mChangeInformation, oRtaResourceBundle, sOverlayId);
		const oDates = getDates(mChangeInformation, oRtaResourceBundle);
		const oSupportInfo = mChangeInformation.change.getSupportInformation();
		const sUser = oSupportInfo?.user || oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE");

		return {
			id: mChangeInformation.id,
			change: mChangeInformation,
			description: oTexts.description,
			descriptionTooltip: oTexts.tooltip,
			fullDate: oDates.fullDate,
			relativeDate: oDates.relativeDate,
			detailButtonText: oTexts.buttonText,
			icon: ChangeCategories.getIconForCategory(mChangeInformation.changeCategory),
			iconTooltip: oTexts.iconTooltip,
			user: sUser
		};
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
				initialized: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * DesignTime reference used to access connected elements and overlay events.
				 * @since 1.150
				 */
				designTime: {
					type: "object"
				}
			},
			events: {
				/**
				 * Fired after the change registry has been refreshed and change states have been
				 * (re-)classified against the current versions model.
				 * @since 1.152
				 */
				changesResolved: {}
			}
		},
		renderer: null,

		constructor: function(...aArgs) {
			this._oChangeIndicatorRegistry = new ChangeIndicatorRegistry({
				changeCategories: ChangeCategories.getCategories()
			});

			Control.prototype.constructor.apply(this, aArgs);

			this._oTextBundle = Lib.getResourceBundleFor("sap.ui.rta");
			this.setModel(new ResourceModel({
				bundle: this._oTextBundle
			}), "i18n");

			// Track overlay IDs that have the dashed border class applied.
			// A Set keeps membership checks O(1) — the decorated set can grow into the hundreds
			// (large changesets), so the lookup in _applyBorderToOverlay must not be linear.
			this._oDecoratedOverlayIds = new Set();
			// Maps decorated overlay IDs to the change infos that caused them — single source of
			// truth shared by the border path, findOverlayWithChanges, and getChangesForOverlay.
			this._oDecoratedOverlayChangeInfos = new Map();

			// Default: show only draft/dirty changes
			this._bShowAllChanges = false;
		}
	});

	ChangeVisualization.prototype.setVersionsModel = function(oToolbar) {
		this.oVersionsModel = oToolbar.getModel("versions");
	};

	ChangeVisualization.prototype.setRootControlId = function(sRootControlId) {
		this.setProperty("rootControlId", sRootControlId);
		this._oChangeIndicatorRegistry.setRootControlId(sRootControlId);
	};

	/**
	 * Sets whether all changes or only draft/dirty changes should be shown.
	 *
	 * @param {boolean} bShowAll - true to show all changes, false for draft/dirty only
	 */
	ChangeVisualization.prototype.setShowAllChanges = function(bShowAll) {
		this._bShowAllChanges = bShowAll;
		refreshChangeRegistryAndDecorations.call(this);
	};

	/**
	 * Indicates whether the registry currently holds at least one activated change that is actually
	 * visualizable. A change is visualizable when its visualizationInfo resolves to at least one
	 * affected or display element.
	 *
	 * Changes are ignored here when they are still draft or dirty, when their handler has no
	 * getChangeVisualizationInfo, or when their selectors do not resolve in the current control tree.
	 *
	 * @returns {boolean} true if at least one activated, visualizable change is registered
	 */
	ChangeVisualization.prototype.hasPersistedChanges = function() {
		return this._oChangeIndicatorRegistry.hasPersistedChanges();
	};

	ChangeVisualization.prototype._getComponent = function() {
		return FlUtils.getAppComponentForControl(ElementUtil.getElementInstance(this.getRootControlId()));
	};

	ChangeVisualization.prototype.exit = function() {
		this._detachOverlayListeners();
		detachVariantSwitchListener.call(this);
		this.removeBorderClasses();
		this._oChangeIndicatorRegistry.destroy();
		if (this._oChangeDetailPopup) {
			this._oChangeDetailPopup.destroy();
		}
		removePopupAnchor.call(this);
		detachGeometryChangeHandlers.call(this);
		Control.prototype.exit.call(this);
	};

	/**
	 * Initializes change visualization: collects changes and applies border classes.
	 * Should be called after DesignTime is synced and overlays are created.
	 *
	 * @returns {Promise} Resolves when initialization is complete
	 */
	ChangeVisualization.prototype.initialize = async function() {
		// Reset the registry so that re-initialization (e.g. after a version-switch reload)
		// re-resolves every change against the current tree. Otherwise stale entries from a
		// previous version visit can survive: changes that fell back to oChange.getSelector()
		// during that visit get registered with updateRequired=undefined, so the diff in
		// refreshChangeRegistryAndDecorations sees them as "already registered" and never re-runs the
		// change handler against the new tree.
		this._oChangeIndicatorRegistry.reset();
		await refreshChangeRegistryAndDecorations.call(this);
		attachOverlayListeners.call(this);
		attachVariantSwitchListener.call(this);
		this.setInitialized(true);
	};

	/**
	 * Refreshes the change registry against the current FL state and re-applies the dashed-border
	 * decorations to the affected overlays. Use after undo/redo, after new changes, or after save.
	 * Diffs the new target set against the currently decorated overlays so only the symmetric
	 * difference touches the DOM — important for changesets in the hundreds/thousands where
	 * the previous remove-all + add-all pass scaled linearly with the registry size.
	 *
	 * @returns {Promise} Resolves when the refresh is complete
	 */
	ChangeVisualization.prototype.refreshBorders = async function() {
		await refreshChangeRegistryAndDecorations.call(this);
	};

	/**
	 * Applies border to a single overlay if it or its connected elements have changes.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - The overlay to check and potentially decorate
	 * @returns {boolean} true if border was applied, false otherwise
	 */
	ChangeVisualization.prototype._applyBorderToOverlay = function(oOverlay) {
		// Skip if overlay is not available or destroyed
		// note: some Overlays (especially Sections) are created hidden and then made visible
		// therefore we also handle "invisible" Overlays
		if (_isOverlayUnavailable(oOverlay) || oOverlay.bIsDestroyed) {
			return false;
		}

		const sElementId = oOverlay.getElement().getId();
		const oConnectedElements = this._getConnectedElements();
		let bShouldDecorate = false;

		// Check 1: Does this element have changes?
		if (this.hasChangesForElement(sElementId)) {
			bShouldDecorate = true;
		}

		// Check 2: Is this element connected to an element with changes?
		if (!bShouldDecorate) {
			const sConnectedElementId = oConnectedElements[sElementId];
			if (sConnectedElementId && this.hasChangesForElement(sConnectedElementId)) {
				bShouldDecorate = true;
			}
		}

		// Check 3: Is another element with changes connected to this element?
		if (!bShouldDecorate) {
			for (const [sKey, sValue] of Object.entries(oConnectedElements)) {
				if (sValue === sElementId && this.hasChangesForElement(sKey)) {
					bShouldDecorate = true;
					break;
				}
			}
		}

		// Apply decoration once if any condition matched
		if (bShouldDecorate) {
			oOverlay.addStyleClass("sapUiRtaOverlayWithChanges");
			this._oDecoratedOverlayIds.add(oOverlay.getId());
			return true;
		}

		return false;
	};

	/**
	 * Handler for elementOverlayCreated event from DesignTime.
	 * Resolves any catalog entries that target the new overlay's element, then decorates the overlay.
	 * This is the primary path for controls that were absent during initialize() — dialogs, lazy
	 * sections, template hosts — whose changes could not be resolved until now.
	 *
	 * @param {sap.ui.base.Event} oEvent - The event object
	 * @private
	 */
	ChangeVisualization.prototype._onElementOverlayCreated = function(oEvent) {
		const oOverlay = oEvent.getParameter("elementOverlay");
		let sLocalId;
		try {
			const oElement = oOverlay.getElement();
			sLocalId = JsControlTreeModifier.getSelector(oElement, this._getComponent()).id;
			const oUnresolvedSet = new Set(this._oChangeIndicatorRegistry.getUnresolvedChangeIds());
			let aPendingIds = this._oChangeIndicatorRegistry.getChangeIdsForSelector(sLocalId).filter((sId) => oUnresolvedSet.has(sId));

			// A change resolved before it was applied is indexed under its own selector (the
			// container), and the container's overlay may have fired before the change applied.
			// If the new overlay is a descendant of such a container, retry the container's
			// unresolved changes — by now the applied change and its real target exist.
			if (aPendingIds.length === 0 && oUnresolvedSet.size > 0) {
				aPendingIds = this._collectPendingChangesFromAncestors(oElement, oUnresolvedSet);
			}

			if (aPendingIds.length === 0) {
				// No unresolved changes for this element — just apply border (fast path).
				this._applyBorderToOverlay(oOverlay);
				return;
			}

			this._resolveAndDecorate(aPendingIds);
		} catch (oError) {
			// ignore overlays without valid selector (e.g. due to unstable Id)
		}
	};

	/**
	 * Collects unresolved change IDs that are indexed under any ancestor of the given element. Used
	 * to retry a container-scoped change (e.g. an add-field change indexed under its group) when a
	 * descendant overlay is created after the change was applied.
	 *
	 * @param {sap.ui.core.Element} oElement - The element whose ancestors are inspected
	 * @param {Set<string>} oUnresolvedSet - Set of currently unresolved change IDs
	 * @returns {string[]} Unresolved change IDs indexed under an ancestor
	 * @private
	 */
	ChangeVisualization.prototype._collectPendingChangesFromAncestors = function(oElement, oUnresolvedSet) {
		const oComponent = this._getComponent();
		const aPendingIds = [];
		const oSeen = new Set();
		let oParent = oElement.getParent && oElement.getParent();
		// Bounded walk up the control tree; stop at the root control.
		while (oParent && oParent.getId() !== this.getRootControlId()) {
			let sAncestorId;
			try {
				sAncestorId = JsControlTreeModifier.getSelector(oParent, oComponent).id;
			} catch (oError) {
				break;
			}
			this._oChangeIndicatorRegistry.getChangeIdsForSelector(sAncestorId).forEach((sId) => {
				if (oUnresolvedSet.has(sId) && !oSeen.has(sId)) {
					oSeen.add(sId);
					aPendingIds.push(sId);
				}
			});
			oParent = oParent.getParent && oParent.getParent();
		}
		return aPendingIds;
	};

	/**
	 * Resolves visualization info for the given change IDs and repaints the decoration diff.
	 * Errors are swallowed — unresolved changes are retried on the next refreshBorders call.
	 *
	 * @param {string[]} aChangeIds - Change IDs to resolve
	 * @returns {Promise<undefined>} Resolves when decoration has been updated
	 * @private
	 */
	ChangeVisualization.prototype._resolveAndDecorate = async function(aChangeIds) {
		const oAppComponent = this._getComponent();
		try {
			await Promise.all(aChangeIds.map((sId) => {
				const oEntry = this._oChangeIndicatorRegistry.getCatalogEntry(sId);
				if (!oEntry) {
					return undefined;
				}
				return this._oChangeIndicatorRegistry.resolveVisualizationInfo(oEntry.change, oAppComponent);
			}));
			applyDecorationDiff.call(this);
		} catch (_oErr) {
			// Resolution errors are non-fatal — changes stay unresolved until the next refreshBorders.
		}
	};

	/**
	 * Detaches overlay event listeners from DesignTime.
	 *
	 * @private
	 */
	ChangeVisualization.prototype._detachOverlayListeners = function() {
		if (this.getDesignTime() && this._fnOverlayCreatedHandler) {
			this.getDesignTime().detachEvent("elementOverlayCreated", this._fnOverlayCreatedHandler);
			this._fnOverlayCreatedHandler = null;
		}
	};

	/**
	 * Removes the dashed-border CSS class from all previously decorated overlays.
	 */
	ChangeVisualization.prototype.removeBorderClasses = function() {
		this._oDecoratedOverlayIds.forEach((sOverlayId) => {
			const oOverlay = Element.getElementById(sOverlayId);
			if (oOverlay) {
				oOverlay.removeStyleClass("sapUiRtaOverlayWithChanges");
			}
		});
		this._oDecoratedOverlayIds = new Set();
		this._oDecoratedOverlayChangeInfos = new Map();
	};

	/**
	 * Checks whether the given element appears as either a display target or an affected element
	 * for any registered change that matches the current state filter (see <code>setShowAllChanges</code>).
	 *
	 * @param {string} sElementId - ID of the UI element
	 * @returns {boolean} true if at least one currently visible change references the element
	 */
	ChangeVisualization.prototype.hasChangesForElement = function(sElementId) {
		return this._oChangeIndicatorRegistry.hasChangesForElement(sElementId, matchesStateFilter.bind(this));
	};

	/**
	 * Gets the connected elements map from DesignTime SelectionManager.
	 * Connected elements are UI elements that should be highlighted together
	 * (e.g., ObjectPageSection and its corresponding IconTabBarItem).
	 *
	 * @returns {object<string,string>} Map where keys are element IDs and values are connected element IDs
	 * @private
	 * @since 1.148
	 */
	ChangeVisualization.prototype._getConnectedElements = function() {
		return this.getDesignTime().getSelectionManager().getConnectedElements();
	};

	/**
	 * Walks up from the given overlay through parent overlays to find one
	 * whose element has registered changes.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - The starting overlay
	 * @returns {sap.ui.dt.ElementOverlay|null} The overlay with changes, or null
	 */
	ChangeVisualization.prototype.findOverlayWithChanges = function(oOverlay) {
		// This function is needed for finding the right overlay when the overlay with changes is not the
		// selected overlay. But both overlays should have the same geometry.
		function geometryDiffers(oOverlay1, oOverlay2) {
			const oGeom1 = oOverlay1.getGeometry();
			const oGeom2 = oOverlay2.getGeometry();
			if (!oGeom1 || !oGeom2) {
				// Treat missing geometry as "differs" so the walk stops; an unrendered
				// ancestor can't be a safe substitute target for the original overlay.
				return true;
			}
			const iDiffTop = Math.abs(oGeom1.position.top - oGeom2.position.top);
			const iDiffLeft = Math.abs(oGeom1.position.left - oGeom2.position.left);
			const iDiffHeight = Math.abs(oGeom1.size.height - oGeom2.size.height);
			return (iDiffTop >= 2 || iDiffLeft >= 2 || iDiffHeight >= 2);
		}

		let oCurrent = oOverlay;
		while (oCurrent) {
			if (this.hasChangesForElement(oCurrent.getElement().getId())) {
				return oCurrent;
			}
			oCurrent = oCurrent.getParentElementOverlay();
			if (!oCurrent || geometryDiffers(oOverlay, oCurrent)) {
				break;
			}
		}

		const sConnectedElementId = this._getConnectedElements()[oOverlay.getElement().getId()];
		if (this.hasChangesForElement(sConnectedElementId)) {
			return OverlayRegistry.getOverlay(sConnectedElementId);
		}

		// Fallback: the overlay may be a relevant-container target (e.g. SmartForm for a stashed group).
		// In that case hasChangesForElement returns false (the registry keys are group/Form, not SmartForm),
		// but applyDecorationDiff already computed the correct decorated overlay via _determineElementOverlay
		// and stored it in _oDecoratedOverlayChangeInfos.
		if (this._oDecoratedOverlayChangeInfos?.has(oOverlay.getId())) {
			return oOverlay;
		}

		return undefined;
	};

	/**
	 * Returns formatted change details for the given overlay's element.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - The overlay
	 * @returns {object[]} Array of formatted change-detail objects
	 */
	ChangeVisualization.prototype.getChangesForOverlay = function(oOverlay) {
		const sElementId = oOverlay.getElement().getId();
		const sOverlayId = oOverlay.getId();
		let aChangeInfos = this._oChangeIndicatorRegistry.getChangeInfosForElement(sElementId, matchesStateFilter.bind(this));

		// Fallback for relevant-container overlays (e.g. SmartForm decorated because of a stashed group):
		// the registry keys are the child element IDs, not the SmartForm ID, so getChangeInfosForElement
		// returns empty. Use the pre-computed map from applyDecorationDiff instead.
		if (aChangeInfos.length === 0) {
			aChangeInfos = this._oDecoratedOverlayChangeInfos?.get(sOverlayId) || [];
		}

		// Sort by creation date (newest first); changes created in-session have no creation date
		// and are treated as "now" so they sort to the top and stay equal to each other.
		const iNow = Date.now();
		aChangeInfos.sort((a, b) => {
			const iA = a.change.getCreation() ? new Date(a.change.getCreation()).getTime() : iNow;
			const iB = b.change.getCreation() ? new Date(b.change.getCreation()).getTime() : iNow;
			return iB - iA;
		});

		return aChangeInfos.map(formatChangesModelItem.bind(null, sOverlayId));
	};

	/**
	 * Opens the change detail popup next to the given overlay, listing all changes registered for it.
	 * Closes the context menu while the popup is open and stores opener references so the context
	 * menu can be reopened later (e.g. after {@link #showDependentElements}).
	 *
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.dt.ElementOverlay} mPropertyBag.overlay - Overlay whose changes are displayed
	 * @param {DOMRect} [mPropertyBag.contextMenuRect] - Bounding rect of the context menu used to anchor and size the popup
	 * @param {sap.ui.base.Event} [mPropertyBag.openerEvent] - Original event that opened the context menu, kept for reopening it
	 * @param {sap.ui.dt.ElementOverlay} [mPropertyBag.openerOverlay] - Overlay on which the context menu was opened
	 * @param {sap.ui.dt.plugin.ContextMenu} [mPropertyBag.contextMenuPlugin] - Context menu plugin instance, set busy while the popup is open
	 * @returns {Promise<undefined>} Resolves once the popover is loaded and opened, or immediately if the overlay has no changes
	 * @private
	 */
	ChangeVisualization.prototype.openChangeDetailPopup = async function(mPropertyBag) {
		const {
			overlay: oOverlay,
			contextMenuRect: mContextMenuRect,
			openerEvent: oOpenerEvent,
			openerOverlay: oOpenerOverlay,
			contextMenuPlugin: oContextMenuPlugin
		} = mPropertyBag;

		// Bail out if the overlay was destroyed in the meantime (e.g. while a deferred reopen was
		// queued behind a dependent-element animation and the user pressed undo).
		if (!oOverlay || oOverlay.bIsDestroyed || !oOverlay.getElement()) {
			return;
		}

		const aFormattedChanges = this.getChangesForOverlay(oOverlay);
		if (aFormattedChanges.length === 0) {
			return;
		}
		// store the Opener Event and Overlay for later use (reopen the context menu)
		this._oOpenerEvent = oOpenerEvent;
		this._oOpenerOverlay = oOpenerOverlay;
		this._oContextMenuPlugin = oContextMenuPlugin;
		// Store current overlay and context menu rect for reopening after animation
		this._oCurrentOverlay = oOverlay;
		this._oCurrentContextMenuRect = mContextMenuRect;

		// close the context menu and set it to busy to prevent reopening when using
		// keyboard in details popover
		this._oContextMenuPlugin.oContextMenuControl.close();
		this._oContextMenuPlugin.setBusy(true);

		// Destroy previous popup if exists
		if (this._oChangeDetailPopup) {
			this._oChangeDetailPopup.destroy();
			this._oChangeDetailPopup = null;
		}
		removePopupAnchor.call(this);

		const oPopover = await Fragment.load({
			name: "sap.ui.rta.util.changeVisualization.ChangeDetailPopup",
			id: `${this.getId()}--changeDetailPopup`,
			controller: this
		});
		this._oChangeDetailPopup = oPopover;
		const oChangesModel = new JSONModel(aFormattedChanges);
		oChangesModel.setDefaultBindingMode("OneWay");
		oPopover.setModel(oChangesModel, "changes");
		oPopover.setModel(this.getModel("i18n"), "i18n");
		oPopover.attachBrowserEvent("keydown", this._onKeyDown, oPopover);

		const oAnchor = document.createElement("div");
		oAnchor.id = `${this.getId()}--popupAnchor`;
		oAnchor.className = "sapUiRtaChangeDetailPopupAnchor";
		oAnchor.style.position = "fixed";
		oAnchor.style.top = `${mContextMenuRect.top}px`;
		oAnchor.style.width = "0";
		oAnchor.style.height = "0";
		oAnchor.setAttribute("aria-hidden", "true");
		document.body.appendChild(oAnchor);

		// Popover has fixed contentWidth of 43rem; convert to px
		const iDefinedPopoverSize = 43;
		const iRemSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const iPopoverWidth = iDefinedPopoverSize * iRemSize;
		const iViewportWidth = document.documentElement.clientWidth;

		// If popover would overflow right edge, align its right edge with context menu's right edge
		if (mContextMenuRect.left + iPopoverWidth > iViewportWidth) {
			oAnchor.style.left = `${mContextMenuRect.right - iPopoverWidth}px`;
		} else {
			oAnchor.style.left = `${mContextMenuRect.left}px`;
		}

		// Not enough space below: anchor at bottom edge, open upward
		const iViewportHeight = document.documentElement.clientHeight;
		if ((iViewportHeight - mContextMenuRect.top) < mContextMenuRect.height) {
			oAnchor.style.top = `${mContextMenuRect.bottom}px`;
			oPopover.setPlacement("Top");
		}

		oPopover.attachAfterClose(this._cleanUpAfterClose, this);
		oPopover.attachAfterOpen(setPopOverMinHeight, this);
		oPopover.openBy(oAnchor);
	};

	ChangeVisualization.prototype._onKeyDown = function(oEvent) {
		if (oEvent.keyCode !== KeyCodes.TAB) {
			oEvent.preventDefault();
			return;
		}

		// "this" is the oPopover (bound via attachBrowserEvent's third parameter)
		const oPopover = this;
		const aFocusableElements = [];

		const oBackButton = oPopover.getBeginButton();
		if (oBackButton) {
			aFocusableElements.push(oBackButton);
		}

		const oTable = oPopover.getContent()[0];
		oTable?.getItems().forEach((oItem) => {
			const oHBox = oItem.getCells()?.[1];
			const oButton = oHBox?.getItems()?.[1];
			if (oButton?.getVisible()) {
				aFocusableElements.push(oButton);
			}
		});

		if (aFocusableElements.length === 0) {
			return;
		}

		const oActiveElement = document.activeElement;
		const iCurrentIndex = aFocusableElements.findIndex(
			(oControl) => oControl.getFocusDomRef() === oActiveElement
		);

		let iNextIndex;
		if (oEvent.shiftKey) {
			iNextIndex = iCurrentIndex <= 0
				? aFocusableElements.length - 1
				: iCurrentIndex - 1;
		} else {
			iNextIndex = iCurrentIndex >= aFocusableElements.length - 1
				? 0
				: iCurrentIndex + 1;
		}

		aFocusableElements[iNextIndex].focus();
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	ChangeVisualization.prototype.onClosePopover = function() {
		if (this._oChangeDetailPopup) {
			this._cleanUpAfterClose();
			this._oChangeDetailPopup.destroy();
			this._oChangeDetailPopup = null;
		}
		// Clear stored popup state when manually closed
		this._oCurrentOverlay = null;
		this._oCurrentContextMenuRect = null;
		// reopen the context menu
		this._oContextMenuPlugin.setBusy(false);
		this._oContextMenuPlugin.open(this._oOpenerOverlay, undefined, this._oOpenerEvent);
	};

	ChangeVisualization.prototype._cleanUpAfterClose = function() {
		removePopupAnchor.call(this);
		this._oContextMenuPlugin.setBusy(false);
		detachGeometryChangeHandlers.call(this);
	};

	/**
	 * Handler for the "Show Source/Target" button in the change detail popup. Closes the popup,
	 * highlights the dependent elements for the selected change, and reopens the popup against the
	 * same overlay once the highlight animation has finished.
	 *
	 * @param {sap.ui.base.Event} oEvent - Press event from the button; its binding context provides the change ID
	 * @private
	 */
	ChangeVisualization.prototype.showDependentElements = function(oEvent) {
		const sChangeId = oEvent.getSource().getBindingContext("changes").getObject().id;

		// Store current popup state for reopening
		const oPopupState = {
			overlay: this._oCurrentOverlay,
			contextMenuRect: this._oCurrentContextMenuRect,
			openerEvent: this._oOpenerEvent,
			openerOverlay: this._oOpenerOverlay,
			contextMenuPlugin: this._oContextMenuPlugin
		};

		// Close the popup
		if (this._oChangeDetailPopup) {
			this._oChangeDetailPopup.close();
		}

		// set root Overlay z-index to a high value to avoid hover border for overlay under the mouse cursor
		const oRootOverlay = Overlay.getOverlayContainer().childNodes[0];
		const iZIndex = oRootOverlay.style.zIndex;
		oRootOverlay.style.zIndex = "99999999";

		// Highlight dependent elements and wait for animation to complete
		this._selectChange(sChangeId);

		const oAnimatedOverlay = document.querySelector(".sapUiRtaChangeIndicatorDependent");
		if (!oAnimatedOverlay) {
			oRootOverlay.style.zIndex = iZIndex;
			this.openChangeDetailPopup(oPopupState);
			return;
		}
		// `animationend` fires once per CSS animation on the element; using `addEventListener`
		// with `{ once: true }` (matching the listener in _selectChange) makes sure we reopen
		// the popup exactly once, even if the indicator class triggers multiple animations.
		oAnimatedOverlay.addEventListener("animationend", () => {
			oRootOverlay.style.zIndex = iZIndex;
			this.openChangeDetailPopup(oPopupState);
		}, { once: true });
	};

	ChangeVisualization.prototype._getCommandForChange = function(oChange) {
		const sCommand = oChange.getSupportInformation().command;
		if (sCommand) {
			return sCommand;
		}

		if (!oChange.canBeVisualized()) {
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
				oParentAggregationOverlay?.getAggregationName()
			);
		}

		return oSelectorControl
			&& oLastDependentSelectorControl
			&& searchForCommand(OverlayRegistry.getOverlay(oLastDependentSelectorControl));
	};

	ChangeVisualization.prototype.selectChange = function(oEvent) {
		const sChangeId = oEvent.getParameter("changeId");
		this._selectChange(sChangeId);
	};

	ChangeVisualization.prototype._selectChange = function(sChangeId) {
		const oRegisteredChange = this._oChangeIndicatorRegistry.getRegisteredChange(sChangeId);
		if (!oRegisteredChange) {
			return;
		}
		const aDependentElements = oRegisteredChange.visualizationInfo.dependentElementIds;
		aDependentElements.forEach((sElementId) => {
			const oOverlay = OverlayRegistry.getOverlay(sElementId);
			if (oOverlay) {
				const oOverlayDomRef = oOverlay.getDomRef();
				oOverlayDomRef.scrollIntoView({
					block: "nearest"
				});
				oOverlayDomRef.classList.add("sapUiRtaChangeIndicatorDependent");
				oOverlayDomRef.addEventListener("animationend", () => {
					oOverlayDomRef.classList.remove("sapUiRtaChangeIndicatorDependent");
				}, { once: true });
			}
		});
	};

	return ChangeVisualization;
});
