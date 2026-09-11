/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/Deferred",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/dt/ElementOverlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/rta/util/ai/AIVisualization",
	"sap/ui/rta/util/ai/FrontendActionError",
	"sap/ui/rta/util/ai/FrontendActionResult",
	"sap/ui/rta/api/startAdaptation",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/service/Action"
], function(
	Log,
	Deferred,
	Element,
	Lib,
	JsControlTreeModifier,
	ElementOverlay,
	OverlayRegistry,
	DelegateMediatorAPI,
	FlexRuntimeInfoAPI,
	SupportAPI,
	VersionsAPI,
	AIVisualization,
	FrontendActionError,
	FrontendActionResult,
	startAdaptation,
	RuntimeAuthoring,
	actionService
) {
	"use strict";

	/**
	 * Public, consumer-agnostic API that owns the core Flex-adaptation
	 * <i>frontend actions</i>: the small, stable set of operations an external
	 * driver (e.g. an AI agent, or an FLP-orchestrated assistant) invokes to
	 * adapt a running UI5 application through its Runtime Authoring (RTA) /
	 * Flex capabilities.
	 *
	 * Each action returns a uniform {@link sap.ui.rta.util.ai.FrontendActionResult}
	 * envelope. {@link #getAvailableFrontendActions} returns the actions tagged
	 * with their stable contract names (<code>com.sap.ui.flex.&lt;name&gt;.v1</code>);
	 * whoever bridges these to a transport (a chat client, the FLP shell, an MCP
	 * server) is not this module's concern.
	 *
	 * <h3>Status reporting</h3>
	 * The core actions emit progress via an injectable <i>status reporter</i>.
	 * By default the on-screen {@link sap.ui.rta.util.ai.AIVisualization}
	 * (an animated overlay + status pill) is used. A consumer that wants no
	 * visible progress supplies its own reporter through
	 * {@link #setStatusReporter} (e.g. a no-op reporter).
	 *
	 * @namespace
	 * @alias sap.ui.rta.api.FrontendActionsAPI
	 * @since 1.153
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */

	let oRta;
	let pRtaStart;
	let aBoundActions;

	function getText(sKey, aArgs) {
		return Lib.getResourceBundleFor("sap.ui.rta").getText(sKey, aArgs);
	}

	const FrontendActionName = "frontend_action_name";
	const frontendAction = (name, fn) => ({ [FrontendActionName]: `com.sap.ui.flex.${name}.v1`, "function": fn });

	// Injectable status reporter. Defaults to the on-screen AIVisualization
	// (an animated overlay + status pill). A consumer overrides it via
	// setStatusReporter(); any hook it omits falls back to the no-op
	// implementations below, which also document the hooks the core actions
	// rely on: agent-name adoption, textual status updates, and optional
	// overlay highlighting/teardown. Frozen because it is both the spread base
	// for partial reporters and exposed as FrontendActionsAPI.NoopStatusReporter.
	const oNoopStatusReporter = Object.freeze({
		setAgentName() {},
		getAgentName() { return ""; },
		setStatus() {},
		highlightOverlay() {},
		removeBlockingOverlay() {}
	});
	let oStatusReporter = AIVisualization;

	async function resolveContextEntityType(oElement, oModel, oCtx) {
		const sPath = oCtx?.getPath();
		if (!sPath) {
			return null;
		}
		try {
			const mDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl({
				control: oElement,
				modifier: JsControlTreeModifier
			});
			return mDelegateInfo.instance.getEntityTypeByPath(oModel, sPath);
		} catch (oError) {
			Log.warning(`FrontendActionsAPI: could not resolve entity type for '${sPath}': ${oError?.message || oError}`);
		}
		return null;
	}

	function collectAggregationsByOrigin(oControl) {
		const aResult = [];
		let oCurrentMetadata = oControl.getMetadata();
		while (oCurrentMetadata && oCurrentMetadata.getName() !== "sap.ui.core.Element") {
			const mAggregations = oCurrentMetadata.getAggregations();
			const aClassAggregations = [];
			for (const sAggregationName in mAggregations) {
				const oAggregation = mAggregations[sAggregationName];
				const vContent = oControl.getAggregation(sAggregationName);
				let iContentLength = 0;
				if (Array.isArray(vContent)) {
					iContentLength = vContent.length;
				} else if (vContent) {
					iContentLength = 1;
				}
				aClassAggregations.push({
					name: oAggregation.name,
					controlType: oAggregation.type,
					contentLength: iContentLength
				});
			}
			if (aClassAggregations.length > 0) {
				aResult.push({
					definedIn: oCurrentMetadata.getName(),
					libraryName: oCurrentMetadata.getLibraryName(),
					aggregations: aClassAggregations
				});
			}
			oCurrentMetadata = oCurrentMetadata.getParent();
		}
		return aResult;
	}

	async function getBindingEnvironment(oElement) {
		const oPropagated = oElement.oPropagatedProperties || {};
		const aModelNames = new Set([
			...Object.keys(oElement.oModels || {}),
			...Object.keys(oPropagated.oModels || {}),
			...Object.keys(oElement.oBindingContexts || {}),
			...Object.keys(oElement.mElementBindingContexts || {}),
			...Object.keys(oPropagated.oBindingContexts || {}),
			...Object.keys(oElement.mObjectBindingInfos || {})
		]);

		const aEntries = await Promise.all([...aModelNames].map(async (sKey) => {
			const sModelName = sKey === "undefined" ? undefined : sKey;
			const oModel = oElement.getModel(sModelName);
			if (!oModel) {
				return null;
			}

			const oCtx = oElement.getBindingContext(sModelName);
			const sModelClass = oModel.getMetadata().getName();

			// Skip non-OData models that have no active binding context on this element —
			// they carry no information useful for payload construction (e.g. device, $FlexVariants)
			const bIsODataModel = sModelClass.includes("ODataModel");
			const bHasActiveContext = !!oCtx?.getPath();
			if (!bIsODataModel && !bHasActiveContext) {
				return null;
			}

			const sContextEntityType = await resolveContextEntityType(oElement, oModel, oCtx);

			return [sKey, {
				modelName: sKey,
				modelClass: sModelClass,
				defaultBindingMode: oModel.getDefaultBindingMode?.() ?? null,
				contextPath: oCtx?.getPath() ?? null,
				contextEntityType: sContextEntityType
			}];
		}));

		return Object.fromEntries(aEntries.filter(Boolean));
	}

	// Serializes the action into the rich form consumed by the agent.
	function serializeAction(oAction) {
		const oBundle = Lib.getResourceBundleFor("sap.ui.rta");
		return {
			id: oAction.id,
			label: oBundle.hasText?.(oAction.id) ? oBundle.getText(oAction.id) : oAction.id,
			...(oAction.description && { description: oAction.description }),
			parameters: oAction.parameters || []
		};
	}

	/**
	 * Whether an overlay's underlying control is currently on screen.
	 * Primary signal is <code>ElementOverlay#isVisible</code> — the
	 * DesignTime kit keeps it synced with the control's renderer. As a
	 * defensive backstop (against stale <code>isVisible</code> during a
	 * rerender window, or overlay-only synthetic elements) we fall back to
	 * the overlay geometry computed by the DesignTime kit.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay Overlay to inspect.
	 * @returns {boolean} <code>true</code> when the overlay's control is visible to the user.
	 */
	function isOverlayOnScreen(oOverlay) {
		if (oOverlay?.isVisible?.()) {
			return true;
		}
		const oGeometry = oOverlay?.getGeometry?.(true);
		return !!(oGeometry?.visible && oGeometry.size?.width > 0 && oGeometry.size?.height > 0);
	}

	function notStartedResult() {
		return FrontendActionResult.failure(
			FrontendActionError.ErrorCodes.GENERIC_ERROR,
			"Runtime Adaptation is not started. Call startRTA first."
		);
	}

	const FrontendActionsAPI = {
		/**
		 * Sets the status reporter used by the core actions to emit progress.
		 *
		 * <ul>
		 *   <li>Pass a reporter object to route progress through it; any hook it
		 *     omits falls back to a no-op implementation.</li>
		 *   <li>Pass {@link sap.ui.rta.api.FrontendActionsAPI.NoopStatusReporter}
		 *     to suppress all visible progress.</li>
		 *   <li>Pass a falsy value to reset to the default on-screen
		 *     {@link sap.ui.rta.util.ai.AIVisualization} reporter.</li>
		 * </ul>
		 *
		 * @param {object} [oReporter] Reporter with the hooks
		 *   <code>setAgentName</code>, <code>getAgentName</code>,
		 *   <code>setStatus</code>, <code>highlightOverlay</code> and
		 *   <code>removeBlockingOverlay</code>. Any missing hook falls back to
		 *   a no-op implementation.
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		setStatusReporter(oReporter) {
			oStatusReporter.removeBlockingOverlay();
			oStatusReporter = oReporter ? { ...oNoopStatusReporter, ...oReporter } : AIVisualization;
		},

		/**
		 * Predefined silent reporter. Pass to {@link #setStatusReporter} to
		 * suppress all visible progress (every hook is a no-op).
		 *
		 * @type {object}
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		NoopStatusReporter: oNoopStatusReporter,

		/**
		 * Returns the available frontend actions, each tagged with its stable
		 * contract name. The result is cached so repeated calls hand back the
		 * same function references.
		 *
		 * @returns {object[]} Frontend-action descriptors.
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		getAvailableFrontendActions() {
			// Cache bound actions to avoid creating new function references on each call
			aBoundActions ||= [
				frontendAction("startRTA", FrontendActionsAPI.startRTA),
				frontendAction("getOverlaysInformation", FrontendActionsAPI.getOverlaysInformation),
				frontendAction("callAction", FrontendActionsAPI.callAction),
				frontendAction("getContext", FrontendActionsAPI.getContext),
				frontendAction("saveChanges", FrontendActionsAPI.saveChanges),
				frontendAction("saveAndActivateChanges", FrontendActionsAPI.saveAndActivateChanges),
				frontendAction("getApplicationInfo", FrontendActionsAPI.getApplicationInfo),
				frontendAction("cleanup", FrontendActionsAPI.cleanup)
			];
			return aBoundActions;
		},

		async startRTA({ agentName: sAgentName } = {}) {
			Log.info("FrontendActionsAPI: startRTA called", JSON.stringify({ agentName: sAgentName }));
			// Adopt the agent name (if provided) BEFORE the first setStatus so
			// the very first status already reads e.g. "Joule is starting…"
			// instead of the generic default. Passing a falsy value resets to
			// the generic default.
			oStatusReporter.setAgentName(sAgentName);
			oStatusReporter.setStatus(getText("AI_STATUS_STARTING", [oStatusReporter.getAgentName()]));
			try {
				if (!oRta) {
					pRtaStart ||= (async () => {
						// The user may have already started Runtime Adaptation manually
						// (e.g. via the FLP "Adapt UI" entry) before the driver kicked
						// in. Adopt that instance instead of starting a second, competing
						// session.
						let oStartedRta = RuntimeAuthoring.getCurrentInstance();
						if (!oStartedRta) {
							const oAppComponent = await SupportAPI.getApplicationComponent();
							// Start RTA in non-interactive mode so the adaptation flow
							// never blocks on a dialog/message box the driver cannot
							// answer, and hand in a deferred that RuntimeAuthoring
							// resolves once it has restarted after a soft reload
							// (personalization/versioning can force a reload during
							// start; the initial promise rejects with "Reload
							// triggered" and the real instance arrives via the
							// deferred).
							const oSoftReloadDeferred = new Deferred();
							try {
								oStartedRta = await startAdaptation({
									rootControl: oAppComponent,
									softReloadDeferred: oSoftReloadDeferred,
									nonInteractiveMode: true
								});
							} catch (oError) {
								if (oError.message?.includes("Reload triggered")) {
									oStartedRta = await oSoftReloadDeferred.promise;
								} else {
									throw oError;
								}
							}
						}
						// Tear the status overlay down when the user (or the driver) exits
						// RTA so we don't leak a viewport-wide event sink across sessions.
						oStartedRta.attachEventOnce("stop", () => {
							oStatusReporter.removeBlockingOverlay();
							oRta = undefined;
							pRtaStart = undefined;
						});
						oRta = oStartedRta;
					})();
					await pRtaStart;
				}
				oStatusReporter.setStatus(getText("AI_STATUS_ADAPTING", [oStatusReporter.getAgentName()]));
				const oResult = FrontendActionResult.success({ rtaStarted: true });
				Log.info("FrontendActionsAPI: startRTA returning", JSON.stringify(oResult));
				return oResult;
			} catch (oError) {
				// Reset the cached start so a later call can retry cleanly instead of
				// awaiting the same rejected promise forever, and tear the status
				// overlay down since no live RTA will fire the stop event.
				oRta = undefined;
				pRtaStart = undefined;
				oStatusReporter.removeBlockingOverlay();
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: startRTA returning", JSON.stringify(oResult));
				return oResult;
			}
		},

		async getOverlaysInformation() {
			Log.info("FrontendActionsAPI: getOverlaysInformation called");
			if (!oRta) {
				return notStartedResult();
			}
			try {
				oStatusReporter.setStatus(getText("AI_STATUS_SCANNING", [oStatusReporter.getAgentName()]));
				const aOverlays = OverlayRegistry.getOverlays();
				const aEditableOverlays = aOverlays.filter((oOverlay) => (
					oOverlay instanceof ElementOverlay
					&& oOverlay.isEditable?.()
					// Template overlays currently cannot be used to create commands
					// the driver must always select a clone
					&& !oOverlay.getIsPartOfTemplate()
					// Skip overlays whose underlying control is not on screen.
					// FE / Smart Templates keep both LR and OP controllers alive
					// after navigation and only toggle DOM visibility, so the
					// "other" page's overlays would otherwise still surface here
					// (~31 phantom LR entries on the OP in the lrop test app).
					// `ElementOverlay#isVisible` reflects the DesignTime kit's
					// own visibility tracking (kept in sync with the control's
					// renderer); we also confirm a non-zero element bounding
					// rect as a defensive backstop in case `isVisible` is stale
					// mid-rerender.
					&& isOverlayOnScreen(oOverlay)
				));
				const oEditableOverlayIds = new Set(aEditableOverlays.map((oOverlay) => oOverlay.getId()));

				const findClosestEditableAncestorElementId = (oOverlay) => {
					let oParent = oOverlay.getParentElementOverlay();
					while (oParent) {
						if (oEditableOverlayIds.has(oParent.getId())) {
							return oParent.getElement().getId();
						}
						oParent = oParent.getParentElementOverlay();
					}
					return null;
				};

				// Fetch the available actions for every editable overlay in parallel.
				// Each overlay carries only the action IDs it supports; the rich
				// per-action metadata (label, description, parameters with their own
				// descriptions and signatures) lives in a top-level actionsCatalog
				// keyed by action ID.
				const oActionService = actionService(oRta);
				const aActionLists = await Promise.all(
					aEditableOverlays.map((oOverlay) => (
						oActionService.exports.get([oOverlay.getElement().getId()])
						.catch(() => [])
					))
				);

				const oActionsCatalog = {};
				const aOverlayInfos = aEditableOverlays.map((oOverlay, iIdx) => {
					const oElement = oOverlay.getElement();
					const oParentElement = oElement.getParent();
					const { sParentAggregationName } = oElement;
					// The overlay's 0-based position within its parent aggregation.
					// Omitted when the parent or aggregation cannot be resolved, or
					// when there is no meaningful position (indexOfAggregation returns
					// a negative value — e.g. a single-cardinality aggregation).
					let iIndex;
					if (oParentElement && sParentAggregationName) {
						const iResolved = oParentElement.indexOfAggregation(sParentAggregationName, oElement);
						if (iResolved >= 0) {
							iIndex = iResolved;
						}
					}
					// Drop actions from plugins that haven't opted into the AI surface.
					// We treat the presence of a non-empty `description` on the menu
					// item as the opt-in signal: AI-aware plugins author a description
					// the LLM can reason about; legacy plugins leave it undefined and
					// would otherwise show up to the driver as untyped, label-only
					// entries it might still try to invoke via callAction.
					const aActions = (aActionLists[iIdx] || []).filter((oAction) => (
						typeof oAction.description === "string" && oAction.description.length > 0
					));
					const aActionIds = aActions.map((oAction) => {
						oActionsCatalog[oAction.id] ||= serializeAction(oAction);
						return oAction.id;
					});
					return {
						controlId: oElement.getId(),
						label: oOverlay.getDesignTimeMetadata().getLabel(oElement),
						controlType: oElement.getMetadata().getName(),
						overlayId: oOverlay.getId(),
						parentElementId: findClosestEditableAncestorElementId(oOverlay),
						parentAggregationName: sParentAggregationName,
						...(iIndex !== undefined && { index: iIndex }),
						actionIds: aActionIds
					};
				});

				const oResult = FrontendActionResult.success({
					overlays: aOverlayInfos,
					actionsCatalog: oActionsCatalog
				});
				Log.info("FrontendActionsAPI: getOverlaysInformation returning", JSON.stringify(oResult));
				return oResult;
			} catch (oError) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: getOverlaysInformation returning", JSON.stringify(oResult));
				return oResult;
			}
		},

		async callAction({ controlId: sControlId, actionId: sActionId, payload: vPayload }) {
			Log.info(
				"FrontendActionsAPI: callAction called with payload",
				JSON.stringify({ controlId: sControlId, actionId: sActionId, payload: vPayload })
			);
			if (!sControlId || !sActionId) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.INVALID_PARAMETERS,
					"controlId and actionId are required"
				);
				Log.info("FrontendActionsAPI: callAction returning", JSON.stringify(oResult));
				return oResult;
			}
			if (!oRta) {
				return notStartedResult();
			}
			try {
				const oActionService = actionService(oRta);
				const aAvailableActions = await oActionService.exports.get([sControlId]);
				const oFoundAction = aAvailableActions.find((oAction) => oAction.id === sActionId);
				if (!oFoundAction) {
					const oResult = FrontendActionResult.failure(
						FrontendActionError.ErrorCodes.GENERIC_ERROR,
						`Action ${sActionId} not found on ${sControlId}`
					);
					Log.info("FrontendActionsAPI: callAction returning", JSON.stringify(oResult));
					return oResult;
				}
				// Guard against the driver applying an action with a mandatory
				// parameter it never obtained from the user.
				const oPayload = vPayload && typeof vPayload === "object" ? vPayload : {};
				const aMissingRequired = (oFoundAction.parameters || [])
				.filter((oParam) => oParam.required)
				.map((oParam) => oParam.name)
				.filter((sName) => {
					const vValue = oPayload[sName];
					return vValue === undefined || vValue === null
						|| (typeof vValue === "string" && vValue.trim() === "");
				});
				if (aMissingRequired.length > 0) {
					const oResult = FrontendActionResult.failure(
						FrontendActionError.ErrorCodes.INVALID_PARAMETERS,
						`Missing required parameter(s) for action ${sActionId}: ${aMissingRequired.join(", ")}. `
						+ "Ask the user for a value — do not invent or placeholder it."
					);
					Log.info("FrontendActionsAPI: callAction returning", JSON.stringify(oResult));
					return oResult;
				}
				oStatusReporter.highlightOverlay(sControlId, 3000);
				// Prefer the localized action label the plugin exposes via its
				// menu item text (e.g. "Rename") over the raw internal id
				// (e.g. "CTX_RENAME"). Fall back to the id if a plugin declines
				// to provide a text so the status still has something.
				oStatusReporter.setStatus(
					getText("AI_STATUS_APPLYING", [oStatusReporter.getAgentName(), oFoundAction.text || sActionId])
				);
				await oFoundAction.createCommands(OverlayRegistry.getOverlay(sControlId), oPayload);
				await oRta.waitForPendingActions();
				await oRta.waitForCommandExecutionResult();
			} catch (oError) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: callAction returning", JSON.stringify(oResult));
				return oResult;
			}
			const oResult = FrontendActionResult.success(true);
			Log.info("FrontendActionsAPI: callAction returning", JSON.stringify(oResult));
			return oResult;
		},

		async getContext({ controlId: sControlId, actionId: sActionId }) {
			Log.info("FrontendActionsAPI: getContext called with payload", JSON.stringify({ controlId: sControlId, actionId: sActionId }));
			if (!sControlId || !sActionId) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.INVALID_PARAMETERS,
					"controlId and actionId are required"
				);
				Log.info("FrontendActionsAPI: getContext returning", JSON.stringify(oResult));
				return oResult;
			}
			if (!oRta) {
				return notStartedResult();
			}
			const oControl = Element.getElementById(sControlId);
			if (!oControl) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.CONTROL_NOT_FOUND,
					`Control with id ${sControlId} not found`
				);
				Log.info("FrontendActionsAPI: getContext returning", JSON.stringify(oResult));
				return oResult;
			}
			oStatusReporter.highlightOverlay(sControlId);
			try {
				const oActionService = actionService(oRta);
				const aAvailableActions = await oActionService.exports.get([sControlId]);
				const oFoundAction = aAvailableActions.find((oAction) => oAction.id === sActionId);
				if (!oFoundAction) {
					const oResult = FrontendActionResult.failure(
						FrontendActionError.ErrorCodes.GENERIC_ERROR,
						`Action ${sActionId} not found on ${sControlId}`
					);
					Log.info("FrontendActionsAPI: getContext returning", JSON.stringify(oResult));
					return oResult;
				}
				// Prefer the localized action label over the raw id — see the
				// mirror comment in callAction.
				oStatusReporter.setStatus(
					getText("AI_STATUS_GATHERING_CONTEXT", [oStatusReporter.getAgentName(), oFoundAction.text || sActionId])
				);
				const mAdditionalContext = await oFoundAction.getContext?.(OverlayRegistry.getOverlay(sControlId)) || {};

				const oDefaultAggregation = oControl.getMetadata().getDefaultAggregation();
				let mDefaultChildAggregation;
				if (oDefaultAggregation) {
					const aAggregationContent = oControl.getAggregation(oDefaultAggregation.name);
					const aContent = Array.isArray(aAggregationContent) ? aAggregationContent : [];
					mDefaultChildAggregation = {
						name: oDefaultAggregation.name,
						controlType: oDefaultAggregation.type,
						content: aContent.map((oChildControl) => ({ controlId: oChildControl.getId() }))
					};
				}

				// Only walk the inheritance chain when the action works with aggregations —
				// for simple actions (rename, remove) this data is unused and inflates the LLM context
				const aAggregationsByClass = oFoundAction.aggregationRelevant ? collectAggregationsByOrigin(oControl) : [];

				const oResult = FrontendActionResult.success({
					elementType: oControl.getMetadata().getName(),
					parentAggregationName: oControl.sParentAggregationName,
					actionParameters: oFoundAction.parameters,
					...(mDefaultChildAggregation && { defaultChildAggregation: mDefaultChildAggregation }),
					aggregationsByClass: aAggregationsByClass,
					availableModels: await getBindingEnvironment(oControl),
					actionSpecificContext: mAdditionalContext
				});
				Log.info("FrontendActionsAPI: getContext returning", JSON.stringify(oResult));
				return oResult;
			} catch (oError) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: getContext returning", JSON.stringify(oResult));
				return oResult;
			}
		},

		async saveChanges() {
			Log.info("FrontendActionsAPI: saveChanges called");
			if (!oRta) {
				return notStartedResult();
			}
			oRta.setMode("adaptation");
			oStatusReporter.setStatus(getText("AI_STATUS_SAVING", [oStatusReporter.getAgentName()]));
			try {
				await oRta.save();
				const oResult = FrontendActionResult.success(true);
				Log.info("FrontendActionsAPI: saveChanges returning", JSON.stringify(oResult));
				return oResult;
			} catch (oError) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: saveChanges returning", JSON.stringify(oResult));
				return oResult;
			}
		},

		async saveAndActivateChanges({ title: sTitle }) {
			Log.info("FrontendActionsAPI: saveAndActivateChanges called with payload", JSON.stringify({ title: sTitle }));
			if (!oRta) {
				return notStartedResult();
			}
			oRta.setMode("adaptation");
			if (!sTitle || typeof sTitle !== "string" || sTitle.trim().length === 0) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.INVALID_PARAMETERS,
					"A non-empty title is required to activate the version"
				);
				Log.info("FrontendActionsAPI: saveAndActivateChanges returning", JSON.stringify(oResult));
				return oResult;
			}
			oStatusReporter.setStatus(getText("AI_STATUS_ACTIVATING", [oStatusReporter.getAgentName()]));
			try {
				// Serialize pending RTA commands to LREP first (matches the toolbar's
				// activate flow), then activate the resulting draft as a new version.
				// _serializeToLrep(bCondenseAnyLayer=false, bIsExit=false, bActivateVersion=true)
				await oRta._serializeToLrep(false, false, true);
				await VersionsAPI.activate({
					layer: oRta.getLayer(),
					control: oRta.getRootControlInstance(),
					title: sTitle.trim(),
					displayedVersion: oRta._oVersionsModel.getProperty("/displayedVersion")
				});
				const oResult = FrontendActionResult.success(true);
				Log.info("FrontendActionsAPI: saveAndActivateChanges returning", JSON.stringify(oResult));
				return oResult;
			} catch (oError) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: saveAndActivateChanges returning", JSON.stringify(oResult));
				return oResult;
			}
		},

		async getApplicationInfo() {
			Log.info("FrontendActionsAPI: getApplicationInfo called");
			try {
				const oAppComponent = await SupportAPI.getApplicationComponent();
				const oManifestObject = oAppComponent.getManifestObject?.();
				const oSapApp = oManifestObject?.getEntry?.("sap.app") || {};

				const sAppId = oSapApp.id || "";
				const sAppTitle = oManifestObject?.getEntry?.("/sap.app/title") || "";
				const sAppVersion = oSapApp.applicationVersion?.version || "";

				const sSystem = FlexRuntimeInfoAPI.getSystem();
				const sClient = FlexRuntimeInfoAPI.getClient();

				const oResult = FrontendActionResult.success({
					appId: sAppId,
					system: sSystem,
					client: sClient,
					appTitle: sAppTitle,
					appVersion: sAppVersion
				});
				Log.info("FrontendActionsAPI: getApplicationInfo returning", JSON.stringify(oResult));
				return oResult;
			} catch (oError) {
				const oResult = FrontendActionResult.failure(
					FrontendActionError.ErrorCodes.GENERIC_ERROR,
					oError.message
				);
				Log.info("FrontendActionsAPI: getApplicationInfo returning", JSON.stringify(oResult));
				return oResult;
			}
		},

		// Called by the agent at conversation end — whether the turn ended in
		// success, in an error, or because the user cancelled. The optional
		// `reason` is purely informational (logged). Drops the AI blocker
		// overlay; best-effort — never warns the user on failure.
		cleanup({ reason: sReason } = {}) {
			Log.info("FrontendActionsAPI: cleanup called", JSON.stringify({ reason: sReason }));
			oStatusReporter.removeBlockingOverlay();
			const oResult = FrontendActionResult.success({ cleaned: true });
			Log.info("FrontendActionsAPI: cleanup returning", JSON.stringify(oResult));
			return oResult;
		}
	};

	return FrontendActionsAPI;
});
