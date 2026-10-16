/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/uid",
	"sap/ui/core/Lib",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/util/CancelError",
	"sap/ui/fl/Utils",
	"sap/ui/rta/plugin/CombineDialog",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
], function(
	uid,
	Lib,
	ElementUtil,
	OverlayRegistry,
	DtUtil,
	CancelError,
	FlUtils,
	CombineDialog,
	Plugin,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new Combine Plugin.
	 *
	 * @class
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.ui.rta.plugin.Combine
	 */
	const Combine = Plugin.extend("sap.ui.rta.plugin.Combine", /** @lends sap.ui.rta.plugin.Combine.prototype */ {
		metadata: {
			library: "sap.ui.rta"
		}
	});

	/**
	 * @override
	 */
	Combine.prototype._isEditable = function(oOverlay) {
		const oCombineAction = this.getAction(oOverlay);
		if (!oOverlay.isRoot() && oCombineAction?.changeOnRelevantContainer) {
			return this._checkChangeHandlerAndStableId(oOverlay);
		}
		return Promise.resolve(false);
	};

	Combine.prototype._checkForSameRelevantContainer = function(aElementOverlays) {
		const aRelevantContainer = [];
		for (let i = 0, n = aElementOverlays.length; i < n; i++) {
			aRelevantContainer[i] = aElementOverlays[i].getRelevantContainer();
			const oCombineAction = this.getAction(aElementOverlays[i]);
			if (!oCombineAction || !oCombineAction.changeType) {
				return false;
			}
			if (i > 0) {
				if (
					(aRelevantContainer[0] !== aRelevantContainer[i])
					|| (this.getAction(aElementOverlays[0]).changeType !== oCombineAction.changeType)
				) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Checks the binding compatibility of all given elements. Absolute binding will not be considered
	 *
	 * @param {sap.ui.core.Element[]|sap.ui.core.Component[]} aControls - Array of controls to be checked for binding compatibility
	 * @param {sap.ui.model.Model} oModel - Model for filtering irrelevant binding paths
	 * @return {boolean} <code>true</code> when the controls have compatible bindings.
	 */
	Combine.prototype._checkBindingCompatibilityOfControls = function(aControls, oModel) {
		return aControls.every(function(oSource) {
			return aControls.every(function(oTarget) {
				return oSource !== oTarget ? Utils.checkSourceTargetBindingCompatibility(oSource, oTarget, oModel) : true;
			});
		});
	};

	/**
	 * Returns the maximum number of controls that may be combined, as declared by the combine action
	 * via <code>maxControlsCount</code>. When the action does not declare a maximum there is no count
	 * limit.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Overlay providing the combine action
	 * @returns {int|undefined} The maximum number of controls, or <code>undefined</code> when unlimited
	 */
	Combine.prototype._getMaxControlsCount = function(oOverlay) {
		return this.getAction(oOverlay)?.maxControlsCount;
	};

	/**
	 * Returns how many controls the given element counts as towards the combine limit. An element that
	 * already combines several controls counts as more than one; the combine action reports this via
	 * <code>getControlsCount</code>. Elements whose action does not expose it count as a single control.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Element overlay
	 * @returns {int} The control count (at least 1)
	 */
	Combine.prototype._getControlsCount = function(oOverlay) {
		const oCombineAction = this.getAction(oOverlay);
		if (typeof oCombineAction?.getControlsCount === "function") {
			return oCombineAction.getControlsCount(oOverlay.getElement());
		}
		return 1;
	};

	/**
	 * Checks whether combining the given element overlays stays within the control-defined limit. The
	 * limit is preferably expressed as a maximum number of controls (<code>maxControlsCount</code>), with
	 * each element contributing its own control count. For controls that still express the limit via a
	 * combine action <code>isEnabled</code> function, that function is used as a fallback. When the action
	 * declares neither, any combination is allowed.
	 * @param {sap.ui.dt.ElementOverlay} oSourceOverlay - Source overlay providing the combine action
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Overlays that would be combined (including the source)
	 * @returns {boolean} <code>true</code> when the combination is within the limit
	 */
	Combine.prototype._isCombinationWithinLimit = function(oSourceOverlay, aElementOverlays) {
		const iMax = this._getMaxControlsCount(oSourceOverlay);
		if (iMax !== undefined) {
			const iCount = aElementOverlays.reduce((iSum, oOverlay) => iSum + this._getControlsCount(oOverlay), 0);
			return iCount <= iMax;
		}
		// fallback for controls that still express the limit / enablement via the combine action's isEnabled
		const oCombineAction = this.getAction(oSourceOverlay);
		if (typeof oCombineAction?.isEnabled === "function") {
			return oCombineAction.isEnabled(aElementOverlays.map((oOverlay) => oOverlay.getElement()));
		}
		if (typeof oCombineAction?.isEnabled === "boolean") {
			return oCombineAction.isEnabled;
		}
		return true;
	};

	/**
	 * Returns the sibling element overlays that are candidates for combining with the given source
	 * overlay. A candidate is editable by this plugin, shares the same relevant container and combine
	 * change type as the source, and is binding-compatible with it. The control-defined <em>limit</em>
	 * on the number of combinable elements is deliberately NOT applied here: a sibling that is already
	 * at its own limit is still a candidate so it can be shown (disabled) in the dialog, letting the
	 * user understand why it cannot be combined.
	 * @param {sap.ui.dt.ElementOverlay} oSourceOverlay - Source element overlay
	 * @returns {sap.ui.dt.ElementOverlay[]} Candidate sibling element overlays
	 */
	Combine.prototype._getCompatibleSiblingOverlays = function(oSourceOverlay) {
		const oParentAggregationOverlay = oSourceOverlay.getParentAggregationOverlay();
		if (!oParentAggregationOverlay) {
			return [];
		}
		const oSourceElement = oSourceOverlay.getElement();
		const oModel = oSourceElement.getModel();
		return oParentAggregationOverlay.getChildren().filter((oSiblingOverlay) => {
			return oSiblingOverlay !== oSourceOverlay
				&& this._isEditableByPlugin(oSiblingOverlay)
				&& this._checkForSameRelevantContainer([oSourceOverlay, oSiblingOverlay])
				&& this._checkBindingCompatibilityOfControls([oSourceElement, oSiblingOverlay.getElement()], oModel);
		});
	};

	/**
	 * Checks if the "Combine With" action is available for a single element overlay, i.e. the overlay
	 * is combinable and has at least one compatible sibling. Like the multi-selection case, the
	 * control-defined limit is NOT considered here (that is an <code>isEnabled</code> concern), so the
	 * action stays available - and thus discoverable - even when the current element is already at its
	 * limit.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Element overlay to check
	 * @returns {boolean} <code>true</code> when the overlay is combinable and has a compatible sibling
	 */
	Combine.prototype._isAvailableForSingle = function(oOverlay) {
		return this._isEditableByPlugin(oOverlay) && this._getCompatibleSiblingOverlays(oOverlay).length >= 1;
	};

	/**
	 * Checks if the "Combine With" action is enabled for a single element overlay, i.e. at least one of
	 * its compatible siblings can actually be combined with it within the control-defined limit. Siblings
	 * that are only shown disabled (already at their own limit) do not enable the action on their own.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Element overlay to check
	 * @returns {boolean} <code>true</code> when at least one sibling can be combined with the overlay
	 */
	Combine.prototype._isEnabledForSingle = function(oOverlay) {
		return this._getCompatibleSiblingOverlays(oOverlay).some((oSiblingOverlay) => {
			return this._isCombinationWithinLimit(oOverlay, [oOverlay, oSiblingOverlay]);
		});
	};

	/**
	 * @override
	 */
	Combine.prototype.isAvailable = function(aElementOverlays) {
		if (aElementOverlays.length === 1) {
			return this._isAvailableForSingle(aElementOverlays[0]);
		}
		if (aElementOverlays.length < 1) {
			return false;
		}

		return (
			aElementOverlays.every((oElementOverlay) => this._isEditableByPlugin(oElementOverlay))
			&& this._checkForSameRelevantContainer(aElementOverlays)
		);
	};

	/**
	 * @override
	 */
	Combine.prototype.isEnabled = function(aElementOverlays, oMenuItem) {
		// For a single element the menu item is enabled when at least one sibling can actually be
		// combined within the limit; the "Combine With" dialog then decides the concrete combination.
		if (aElementOverlays.length === 1) {
			return this._isEnabledForSingle(aElementOverlays[0]);
		}

		// check that at least 2 fields can be combined
		if (!this.isAvailable(aElementOverlays) || aElementOverlays.length <= 1) {
			return false;
		}
		const oResponsibleElementOverlays = oMenuItem.responsible || aElementOverlays;
		const aControls = oResponsibleElementOverlays.map((oElementOverlay) => oElementOverlay.getElement());

		// check that each specified element has a combine action and that the combination stays within
		// the control-defined limit (the same check the single-element "Combine With" path uses)
		const bActionCheck = oResponsibleElementOverlays.every((oElementOverlay) => this.getAction(oElementOverlay))
			&& this._isCombinationWithinLimit(oResponsibleElementOverlays[0], oResponsibleElementOverlays);

		if (bActionCheck) {
			// check if all the target elements have the same binding context
			const oDefaultModel = aControls[0]?.getModel();
			return this._checkBindingCompatibilityOfControls(aControls, oDefaultModel);
		}

		return bActionCheck;
	};

	/**
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - specified overlays
	 * @param {sap.ui.core.Element} oCombineElement - element where the combine was triggered
	 * @returns {Promise} Promise
	 */
	Combine.prototype.handleCombine = async function(aElementOverlays, oCombineElement) {
		let oCombineElementOverlay;
		const aElements = aElementOverlays.map((oElementOverlay) => {
			if (oElementOverlay.getElement().getId() === oCombineElement.getId()) {
				oCombineElementOverlay = oElementOverlay;
			}
			return oElementOverlay.getElement();
		});
		const oDesignTimeMetadata = oCombineElementOverlay.getDesignTimeMetadata();
		const sVariantManagementReference = this.getVariantManagementReference(oCombineElementOverlay);
		const oView = FlUtils.getViewForControl(oCombineElement);
		const sNewElementId = oView.createId(uid());

		try {
			const oCombineCommand = await this.getCommandFactory().getCommandFor(
				oCombineElement,
				"combine",
				{
					newElementId: sNewElementId,
					source: oCombineElement,
					combineElements: aElements
				},
				oDesignTimeMetadata,
				sVariantManagementReference
			);

			this.fireElementModified({
				command: oCombineCommand
			});
			return oCombineCommand;
		} catch (oError) {
			throw DtUtil.propagateError(
				oError,
				"Combine#handleCombine",
				"Error occurred in Combine handler function",
				"sap.ui.rta"
			);
		}
	};

	/**
	 * Opens the "Combine With" dialog for a single source overlay, offering the compatible
	 * sibling elements, and combines the source with the elements the user selects.
	 * @param {sap.ui.dt.ElementOverlay} oSourceOverlay - Source element overlay the combine was triggered on
	 * @returns {Promise<sap.ui.rta.command.Combine|undefined>} Resolves with the created command,
	 * or <code>undefined</code> when the user cancels or selects nothing
	 */
	Combine.prototype.handleCombineWith = async function(oSourceOverlay) {
		const aSiblingOverlays = this._getCompatibleSiblingOverlays(oSourceOverlay);
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

		// Use a title that names the source element (e.g. "Combine Company With..."), falling back to the
		// generic title when the source element has no meaningful label (getLabelForElement returns the
		// element id in that case)
		const oSourceElement = oSourceOverlay.getElement();
		const sSourceLabel = ElementUtil.getLabelForElement(oSourceElement);
		const sTitle = sSourceLabel && sSourceLabel !== oSourceElement.getId()
			? oResourceBundle.getText("TIT_COMBINE_WITH", [sSourceLabel])
			: oResourceBundle.getText("CTX_COMBINE_WITH");

		// The dialog is created and destroyed within this flow, so all data is passed via the
		// constructor.
		const oDialog = new CombineDialog({
			title: sTitle,
			maxControlsCount: this._getMaxControlsCount(oSourceOverlay),
			sourceControlsCount: this._getControlsCount(oSourceOverlay),
			elements: aSiblingOverlays.map((oSiblingOverlay) => ({
				id: oSiblingOverlay.getElement().getId(),
				label: ElementUtil.getLabelForElement(oSiblingOverlay.getElement()),
				count: this._getControlsCount(oSiblingOverlay),
				selected: false
			}))
		});

		try {
			await oDialog.open();
			const aSelectedElements = oDialog.getSelectedElements();
			if (!aSelectedElements.length) {
				return undefined;
			}
			return await this.createCommands(oSourceOverlay, {
				elementIds: aSelectedElements.map((oElement) => oElement.id)
			});
		} catch (oError) {
			if (oError instanceof CancelError) {
				return undefined;
			}
			throw DtUtil.propagateError(
				oError,
				"Combine#handleCombineWith",
				"Error occurred in Combine handler function",
				"sap.ui.rta"
			);
		} finally {
			oDialog.destroy();
		}
	};

	/**
	 * @override
	 */
	Combine.prototype.getMenuItems = function(aElementOverlays) {
		// For a single element, offer the "Combine With" entry that opens a selection dialog.
		if (aElementOverlays.length === 1) {
			return this._getMenuItems(
				aElementOverlays,
				{
					pluginId: "CTX_COMBINE_WITH",
					icon: "sap-icon://combine",
					additionalInfoKey: "COMBINE_WITH_RTA_CONTEXT_MENU_INFO",
					description: "combine the source element with selected sibling elements via a selection dialog"
				}
			);
		}
		// For a multi-selection, offer the classic "Combine" entry.
		return this._getMenuItems(
			aElementOverlays,
			{
				pluginId: "CTX_GROUP_FIELDS",
				icon: "sap-icon://combine",
				description: "combine the source element with one or more sibling elements into a single element"
			}
		);
	};

	/**
	 * @override
	 */
	Combine.prototype.getActionName = function() {
		return "combine";
	};

	/**
	 * @override
	 */
	Combine.prototype.handler = function(aElementOverlays, mPropertyBag) {
		// Single selection opens the "Combine With" dialog, multi-selection combines directly.
		if (aElementOverlays.length === 1) {
			return this.handleCombineWith(aElementOverlays[0]);
		}
		return this.handleCombine(aElementOverlays, mPropertyBag.contextElement);
	};

	/**
	 * Returns the context for the "Combine With" (CTX_COMBINE_WITH) action: the list of sibling
	 * elements that can be combined with the source element, together with the maximum number of
	 * controls that may be in the resulting combined element.
	 * Agents must call this before invoking {@link #createCommands} so they only pass valid element IDs.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source element overlay
	 * @returns {object} Context object with an <code>availableElements</code> property
	 * @since 1.155
	 */
	Combine.prototype.getContext = function(oOverlay) {
		const aSiblingOverlays = this._getCompatibleSiblingOverlays(oOverlay).filter(
			(oSiblingOverlay) => this._isCombinationWithinLimit(oOverlay, [oOverlay, oSiblingOverlay])
		);
		return {
			availableElements: {
				description: "Sibling elements that can be combined with the source element. "
					+ "Pass their `id` values as `elementIds` to `createCommands`. "
					+ "Do not pass IDs not listed here.",
				value: aSiblingOverlays.map((oSiblingOverlay) => ({
					id: oSiblingOverlay.getElement().getId(),
					label: ElementUtil.getLabelForElement(oSiblingOverlay.getElement()),
					count: this._getControlsCount(oSiblingOverlay)
				}))
			},
			maxControlsCount: {
				description: "Maximum number of controls (source + combined) allowed in a single combined element. "
					+ "The sum of `count` values of all chosen siblings plus the source element's count must not exceed this.",
				value: this._getMaxControlsCount(oOverlay)
			}
		};
	};

	/**
	 * Returns the parameters that a programmatic consumer must provide to create the commands for this plugin.
	 * @returns {object[]} List of parameter descriptors (name, type, required, description)
	 * @since 1.153
	 */
	Combine.prototype.getParameters = function() {
		return [
			{
				name: "elementIds",
				type: "array",
				required: true,
				description: "IDs of sibling elements to combine with the source element, "
					+ "as returned in `getContext().availableElements`. Only IDs listed there are valid."
			}
		];
	};

	/**
	 * Creates the command for this plugin from the given parameters and fires the "elementModified" event.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Target overlay
	 * @param {object} mParameters - Parameters as described by {@link #getParameters}
	 * @returns {Promise<sap.ui.rta.command.BaseCommand>} Resolves with the created command
	 * @since 1.153
	 */
	Combine.prototype.createCommands = async function(oOverlay, mParameters) {
		const aElementIds = mParameters.elementIds || [];
		const aSiblingOverlays = aElementIds.map((sId) => {
			const oSiblingOverlay = OverlayRegistry.getOverlay(sId);
			if (!oSiblingOverlay) {
				throw new Error(`No overlay found for element with id '${sId}'`);
			}
			return oSiblingOverlay;
		});
		const aAllOverlays = [oOverlay].concat(aSiblingOverlays);
		if (!this._isCombinationWithinLimit(oOverlay, aAllOverlays)) {
			throw new Error(
				`Combining ${aAllOverlays.length} elements exceeds the maximum allowed by the control`
			);
		}
		return await this.handleCombine(aAllOverlays, oOverlay.getElement());
	};

	return Combine;
});
