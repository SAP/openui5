/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Lib",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/rta/Utils"
], function(
	merge,
	Log,
	JsControlTreeModifier,
	Lib,
	ElementUtil,
	OverlayRegistry,
	DelegateMediatorAPI,
	AdditionalElementsUtils,
	Utils
) {
	"use strict";

	/**
	 * Helper object that collects and returns the data related to the different actions
	 * handled by the AdditionalElements Plugin (Reveal, Add Via Delegate, Add Custom)
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.94
	 */
	const ActionExtractor = {};

	async function getAddViaDelegateActionData(mAction, oDesignTimeMetadata, oPlugin) {
		const bHasChangeHandler = await oPlugin.hasChangeHandler(mAction.changeType, mAction.element);
		if (bHasChangeHandler) {
			return {
				aggregationName: mAction.aggregation,
				addPropertyActionData: {
					designTimeMetadata: oDesignTimeMetadata,
					action: mAction,
					delegateInfo: {
						payload: mAction.delegateInfo.payload || {},
						delegate: mAction.delegateInfo.instance,
						modelType: mAction.delegateInfo.modelType,
						requiredLibraries: mAction.delegateInfo.requiredLibraries,
						delegateType: mAction.delegateInfo.delegateType
					}
				}
			};
		}
		return undefined;
	}

	function getInvisibleElements(oParentOverlay, sAggregationName, oPlugin) {
		const oParentElement = oParentOverlay.getElement();
		if (!oParentElement) {
			return [];
		}

		// Returns a list of all invisible elements belonging to an aggregation including the aggregation name
		const aInvisibleElements = ElementUtil.getAggregation(oParentElement, sAggregationName, oPlugin).filter(function(oControl) {
			const oOverlay = OverlayRegistry.getOverlay(oControl);

			if (!oPlugin.hasStableId(oOverlay)) {
				return false;
			}

			const oRelevantContainer = oParentOverlay.getRelevantContainer(true);
			const oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			let oOverlayToCheck = oParentOverlay;
			let bAnyParentInvisible = false;
			// check all the parents until the relevantContainerOverlay for invisibility
			do {
				bAnyParentInvisible = !oOverlayToCheck.getElementVisibility();
				if (bAnyParentInvisible) {
					break;
				}
				if (oOverlayToCheck === oRelevantContainerOverlay) {
					break;
				} else {
					oOverlayToCheck = oOverlayToCheck.getParentElementOverlay();
				}
			} while (oOverlayToCheck);

			if (bAnyParentInvisible) {
				return true;
			}

			return oOverlay.getElementVisibility() === false;
		}, this);

		return aInvisibleElements.map(function(oInvisibleElement) {
			return {
				element: oInvisibleElement,
				sourceAggregation: sAggregationName
			};
		});
	}

	function defaultGetAggregationName(oParent, oChild) {
		return oChild.sParentAggregationName;
	}

	function isValidAction(oCheckElementOverlay, mParents, mAction, oPlugin) {
		let bValidAction = mAction.changeType && oPlugin.hasStableId(oCheckElementOverlay);
		if (bValidAction && oCheckElementOverlay !== mParents.relevantContainerOverlay) {
			// relevant container is needed for some changes, so it must have a stable ID
			bValidAction = oPlugin.hasStableId(mParents.relevantContainerOverlay);
		}
		return bValidAction;
	}

	// Return all elements that can be made visible in each aggregation (including elements from other aggregations)
	async function getRevealActionFromAggregations(aParents, _mReveal, sAggregationName, aAggregationNames, oPlugin) {
		const aInvisibleElements = aParents.reduce(function(aInvisibleChildren, oParentOverlay) {
			let aInvisibleChildrenPerAggregation = [];
			aAggregationNames.forEach(function(sAggregation) {
				aInvisibleChildrenPerAggregation = aInvisibleChildrenPerAggregation.concat(
					getInvisibleElements.call(this, oParentOverlay, sAggregation, oPlugin));
			}.bind(this), []);
			return oParentOverlay ? aInvisibleChildren.concat(aInvisibleChildrenPerAggregation) : aInvisibleChildren;
		}.bind(this), []);

		let oRevealObject = {
			elements: [],
			controlTypeNames: []
		};
		for (const mInvisibleElement of aInvisibleElements) {
			oRevealObject = await checkAndEnrichReveal(oRevealObject, mInvisibleElement, oPlugin, sAggregationName);
		}

		if (oRevealObject.elements.length > 0) {
			_mReveal[sAggregationName] = {
				reveal: oRevealObject
			};
		}
		return _mReveal;
	}

	function filterValidAddPropertyActions(aActions, mParents, oPlugin) {
		return aActions.filter((mAction) => {
			const oCheckElement = mAction.changeOnRelevantContainer ? mParents.relevantContainer : mParents.parent;
			const oCheckElementOverlay = OverlayRegistry.getOverlay(oCheckElement);
			return isValidAction(oCheckElementOverlay, mParents, mAction, oPlugin);
		});
	}

	async function loadRequiredLibraries(mRequiredLibraries) {
		const aRequiredLibraries = Object.keys(mRequiredLibraries || {});
		try {
			for (const sLibrary of aRequiredLibraries) {
				await Lib.load({name: sLibrary});
			}
			return true;
		} catch (vError) {
			Log.error("Required library not available: ", vError);
			// Ignore the error here as the write delegate might not be required
			return false;
		}
	}

	function filterValidDelegateForAction(aActions, mParents) {
		const oFilterPromise = aActions.reduce(async function(aValidActionPromiseChain, mAction) {
			const aValidActions = await aValidActionPromiseChain;
			const oCheckElement = mAction.changeOnRelevantContainer ? mParents.relevantContainer : mParents.parent;
			const mReadDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl({
				control: oCheckElement,
				modifier: JsControlTreeModifier
			});
			const mWriteDelegateInfo = await DelegateMediatorAPI.getWriteDelegateForControl({
				control: oCheckElement,
				modifier: JsControlTreeModifier
			});
			const bAllRequiredLibrariesLoaded = await loadRequiredLibraries(mWriteDelegateInfo?.requiredLibraries);
			if (mReadDelegateInfo?.instance && mWriteDelegateInfo?.controlType && bAllRequiredLibrariesLoaded) {
				mAction.element = oCheckElement;
				mAction.delegateInfo = mReadDelegateInfo;
				mAction.delegateInfo.requiredLibraries = mWriteDelegateInfo.requiredLibraries; // required for addLibrary command
				aValidActions.push(mAction);
			}
			return aValidActions;
		}, Promise.resolve([]));

		return oFilterPromise;
	}

	async function checkAndEnrichReveal(mReveal, mInvisibleElement, oPlugin, sTargetAggregation) {
		const oOverlay = OverlayRegistry.getOverlay(mInvisibleElement.element);
		if (oOverlay) {
			const oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

			const mRevealAction = oDesignTimeMetadata && oDesignTimeMetadata.getAction("reveal", mInvisibleElement.element);
			if (mRevealAction && mRevealAction.changeType) {
				let oRevealSelector = mInvisibleElement.element;
				if (mRevealAction.changeOnRelevantContainer) {
					oRevealSelector = oOverlay.getRelevantContainer();
				}

				// Element can be made invalid while the check is running (e.g. destroyed during undo of split)
				if (ElementUtil.isElementValid(mInvisibleElement.element)) {
					const mParents = AdditionalElementsUtils.getParents(true, oOverlay, oPlugin);
					const bHasChangeHandler = await oPlugin.hasChangeHandler(mRevealAction.changeType, oRevealSelector);
					if (bHasChangeHandler) {
						let bRevealEnabled = mRevealAction.changeOnRelevantContainer ?
							// we have the child overlay, so we need the parents
							oPlugin.hasStableId(mParents.relevantContainerOverlay) && oPlugin.hasStableId(mParents.parentOverlay)
							: true;
						mRevealAction.getAggregationName ||= defaultGetAggregationName;

						// Check if the invisible element can be moved to the target aggregation
						if (bRevealEnabled && (mInvisibleElement.sourceAggregation !== sTargetAggregation)) {
							const oAggregationOverlay = mParents.parentOverlay.getAggregationOverlay(sTargetAggregation);
							bRevealEnabled = await Utils.checkTargetZone(oAggregationOverlay, oOverlay, oPlugin);
						}

						if (bRevealEnabled) {
							mReveal.elements.push({
								element: mInvisibleElement.element,
								designTimeMetadata: oDesignTimeMetadata,
								action: mRevealAction,
								sourceAggregation: mInvisibleElement.sourceAggregation,
								targetAggregation: sTargetAggregation
							});
							const mName = oDesignTimeMetadata.getName(mInvisibleElement.element);
							if (mName) {
								mReveal.controlTypeNames.push(mName);
							}
						}
					}
				}
			}
		}
		return mReveal;
	}

	/**
	 * Calculate a structure with all "add/reveal" action relevant data collected per aggregation:
	 * <pre>
	 * {
	 *	<aggregationName> : {
	 *		addViaDelegate : {
	 *			designTimeMetadata : <sap.ui.dt.ElementDesignTimeMetadata of parent>,
	 *			action : <add.delegate action section from designTimeMetadata>
	 *		},
	 *		reveal : {
	 *			elements : [{
	 *				element : <invisible element>,
	 *				designTimeMetadata : <sap.ui.dt.ElementDesignTimeMetadata of invisible element>,
	 *				action : <reveal action section from designTimeMetadata>,
	 *				sourceAggregation: <aggregation where this element is currently located>
	 *			}],
	 *			controlTypeNames : string[] <all controlTypeNames collected via designTimeMetadata>
	 *		}
	 *	},
	 *	<aggregationName2> : ...
	 * }
	 * </pre>
	 *
	 * @param {boolean} bSibling - Indicates if the elements should be added as sibling (true) or child (false) to the overlay
	 * @param {sap.ui.dt.ElementOverlay} oSourceElementOverlay - Elements will be added in relation (sibling/parent) to this overlay
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElementsPlugin
	 * @param {boolean} [bInvalidate] - Option to prevent cached actions to be returned
	 * @param {sap.ui.dt.DesignTime} oDesignTime - DesignTime instance
	 *
	 * @return {Promise} Resolving to a structure with all "add/reveal" action relevant data collected
	 */
	ActionExtractor.getActions = async function(bSibling, oSourceElementOverlay, oPlugin, bInvalidate, oDesignTime) {
		const sSiblingOrChild = bSibling ? "asSibling" : "asChild";
		if (!bInvalidate && oSourceElementOverlay._mAddActions) {
			return oSourceElementOverlay._mAddActions[sSiblingOrChild];
		}

		const [oRevealAction, oAddViaDelegateAction] = await Promise.all([
			this._getRevealActions(bSibling, oSourceElementOverlay, oPlugin, oDesignTime),
			this._getAddViaDelegateActions(bSibling, oSourceElementOverlay, oPlugin)
		]);
		// join and condense all action data
		const mAllActions = merge(oRevealAction, oAddViaDelegateAction);
		oSourceElementOverlay._mAddActions ||= {asSibling: {}, asChild: {}};
		oSourceElementOverlay._mAddActions[sSiblingOrChild] = mAllActions;
		return mAllActions;
	};

	/**
	 * Returns the already calculated actions of an Overlay, or undefined if no actions available
	 * @param {boolean} bSibling - Indicates if the elements should be added as sibling (true) or child (false) to the overlay
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Elements will be added in relation (sibling/parent) to this overlay
	 * @returns {object|undefined} - Object with all "add/reveal" action relevant data collected or undefined if no actions available
	 */
	ActionExtractor.getActionsOrUndef = function(bSibling, oOverlay) {
		const sSiblingOrChild = bSibling ? "asSibling" : "asChild";
		return oOverlay._mAddActions && oOverlay._mAddActions[sSiblingOrChild];
	};

	let mRevealCache = {};
	let bIsSyncRegistered = true;

	/**
	 * Returns the Reveal actions data (parameters + elements) for an Overlay
	 * @param {boolean} bSibling - If source element overlay should be sibling or parent to the newly added fields
	 * @param {sap.ui.dt.ElementOverlay} oSourceElementOverlay - Overlay where the action is triggered
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElements plugin
	 * @param {sap.ui.dt.DesignTime} oDesignTime - DesignTime instance
	 *
	 * @returns {Promise<object>} Reveal action data
	 */
	ActionExtractor._getRevealActions = async function(bSibling, oSourceElementOverlay, oPlugin, oDesignTime) {
		if (bIsSyncRegistered) {
			bIsSyncRegistered = false;
			oDesignTime.attachEventOnce("synced", function() {
				mRevealCache = {};
				bIsSyncRegistered = true;
			}, this);
		}

		const mParents = AdditionalElementsUtils.getParents(bSibling, oSourceElementOverlay, oPlugin);
		let aParents = [mParents.parentOverlay];
		if (mParents.relevantContainer !== mParents.parent) {
			aParents = ElementUtil.findAllSiblingsInContainer(mParents.parent, mParents.relevantContainer).map(function(oParent) {
				return OverlayRegistry.getOverlay(oParent);
			}).filter(function(oOverlay) {
				return oOverlay;
			});
		}
		let aAggregationNames = [];
		if (mParents.parentOverlay) {
			const mCachedResult = mRevealCache[mParents.parentOverlay.getId()];
			if (mCachedResult && bSibling) {
				return mCachedResult;
			}
			aAggregationNames = mParents.parentOverlay.getChildren().filter(function(oAggregationOverlay) {
				return !oAggregationOverlay.getDesignTimeMetadata().isIgnored(mParents.parent);
			}).map(function(oAggregationOverlay) {
				return oAggregationOverlay.getAggregationName();
			});
			const mAggregatedReveal = await aAggregationNames.reduce(function(oPreviousPromise, sAggregationName) {
				return oPreviousPromise.then(function(mReveal) {
					return getRevealActionFromAggregations(aParents, mReveal, sAggregationName, aAggregationNames, oPlugin);
				});
			}, Promise.resolve({}));
			if (bSibling) {
				mRevealCache[mParents.parentOverlay.getId()] = mAggregatedReveal;
			}
			return mAggregatedReveal;
		}
		return {};
	};

	/**
	 * Return the AddViaDelegate action data (parameters + elements) for an Overlay.
	 * @param {boolean} bSibling - If source element overlay should be sibling or parent to the newly added fields
	 * @param {sap.ui.dt.ElementOverlay} oSourceElementOverlay - Overlay where the action is triggered
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElementsPlugin
	 *
	 * @returns {Promise<object>} AddViaDelegate action data
	 */
	ActionExtractor._getAddViaDelegateActions = async function(bSibling, oSourceElementOverlay, oPlugin) {
		const mParents = AdditionalElementsUtils.getParents(bSibling, oSourceElementOverlay, oPlugin);
		const oDesignTimeMetadata = mParents.parentOverlay && mParents.parentOverlay.getDesignTimeMetadata();
		let aActions = oDesignTimeMetadata
			? await oDesignTimeMetadata.getActionDataFromAggregations("add", mParents.parent, undefined, "delegate")
			: [];
		aActions = await filterValidAddPropertyActions(aActions, mParents, oPlugin);
		aActions = await filterValidDelegateForAction(aActions, mParents);
		return aActions.reduce(async function(oPreviousPromise, oAction) {
			const oReturn = await oPreviousPromise;
			const mAction = await getAddViaDelegateActionData.call(this, oAction, oDesignTimeMetadata, oPlugin);
			if (mAction) {
				mAction.addPropertyActionData.relevantContainer = mParents.relevantContainer;
				oReturn[mAction.aggregationName] ||= {};
				oReturn[mAction.aggregationName].addViaDelegate = mAction.addPropertyActionData;
			}
			return oReturn;
		}.bind(this), Promise.resolve({}));
	};

	return ActionExtractor;
});
