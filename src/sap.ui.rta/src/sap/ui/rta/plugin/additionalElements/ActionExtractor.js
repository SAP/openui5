/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_difference",
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
	difference,
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
	var ActionExtractor = {};

	function loadKnownDefaultDelegateLibraries() {
		var aLoadLibraryPromises = [];
		var aRequiredLibraries = DelegateMediatorAPI.getKnownDefaultDelegateLibraries();
		aRequiredLibraries.forEach(function(sLibrary) {
			var oLoadLibraryPromise = Lib.load({name: sLibrary})
			.then(function() {
				return Promise.resolve(sLibrary);
			})
			.catch(function(vError) {
				Log.warning("Required library not available: ", vError);
				// Ignore the error here as the default delegate might not be required
				return Promise.resolve();
			});
			aLoadLibraryPromises.push(oLoadLibraryPromise);
		});
		return Promise.all(aLoadLibraryPromises);
	}

	function getAddViaDelegateActionData(mAction, oDesignTimeMetadata, oPlugin) {
		return oPlugin.hasChangeHandler(mAction.changeType, mAction.element)
		.then(function(bHasChangeHandler) {
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
		});
	}

	function getInvisibleElements(oParentOverlay, sAggregationName, oPlugin) {
		var oParentElement = oParentOverlay.getElement();
		if (!oParentElement) {
			return [];
		}

		// Returns a list of all invisible elements belonging to an aggregation including the aggregation name
		var aInvisibleElements = ElementUtil.getAggregation(oParentElement, sAggregationName, oPlugin).filter(function(oControl) {
			var oOverlay = OverlayRegistry.getOverlay(oControl);

			if (!oPlugin.hasStableId(oOverlay)) {
				return false;
			}

			var oRelevantContainer = oParentOverlay.getRelevantContainer(true);
			var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			var oOverlayToCheck = oParentOverlay;
			var bAnyParentInvisible = false;
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
		var bValidAction = mAction.changeType && oPlugin.hasStableId(oCheckElementOverlay);
		if (bValidAction && oCheckElementOverlay !== mParents.relevantContainerOverlay) {
			// relevant container is needed for some changes, so it must have a stable ID
			bValidAction = oPlugin.hasStableId(mParents.relevantContainerOverlay);
		}
		return bValidAction;
	}

	function filterValidAddPropertyActions(aActions, mParents, oPlugin, aDefaultDelegateLibraries) {
		function fnFilterActions(aFilteredActions, mAction) {
			var oCheckElement = mAction.changeOnRelevantContainer ? mParents.relevantContainer : mParents.parent;
			var oCheckElementOverlay = OverlayRegistry.getOverlay(oCheckElement);
			var bValidAction = isValidAction(oCheckElementOverlay, mParents, mAction, oPlugin);
			if (bValidAction) {
				mAction.element = oCheckElement;
				return DelegateMediatorAPI.getDelegateForControl({
					control: mParents.relevantContainer, // delegate will always be added on the relevant container
					modifier: JsControlTreeModifier,
					supportsDefault: mAction.supportsDefaultDelegate
				})
				.then(function(mDelegateInfo) {
					// Only complete delegators can be used for additional elements
					if (
						mDelegateInfo &&
						mDelegateInfo.names &&
						mDelegateInfo.names.length &&
						mDelegateInfo.delegateType === DelegateMediatorAPI.types.COMPLETE
					) {
						var aRequiredLibraries = DelegateMediatorAPI.getRequiredLibrariesForDefaultDelegate({
							delegateName: mDelegateInfo.names,
							control: mParents.relevantContainer
						});

						// Check if all required libraries were successfully loaded
						if (
							difference(
								aRequiredLibraries,
								aDefaultDelegateLibraries.filter(Boolean)
							).length === 0
						) {
							mAction.delegateInfo = mDelegateInfo;
							aFilteredActions.push(mAction);
						}
					}
					return aFilteredActions;
				});
			}
			return aFilteredActions;
		}

		return aActions.reduce(function(oPreviousActionsPromise, mAction) {
			return oPreviousActionsPromise
			.then(function(aFilteredActions) {
				return fnFilterActions(aFilteredActions, mAction);
			});
		}, Promise.resolve([]));
	}

	// Return all elements that can be made visible in each aggregation (including elements from other aggregations)
	function getRevealActionFromAggregations(aParents, _mReveal, sAggregationName, aAggregationNames, oPlugin) {
		var aInvisibleElements = aParents.reduce(function(aInvisibleChildren, oParentOverlay) {
			var aInvisibleChildrenPerAggregation = [];
			aAggregationNames.forEach(function(sAggregation) {
				aInvisibleChildrenPerAggregation = aInvisibleChildrenPerAggregation.concat(getInvisibleElements.call(this, oParentOverlay, sAggregation, oPlugin));
			}.bind(this), []);
			return oParentOverlay ? aInvisibleChildren.concat(aInvisibleChildrenPerAggregation) : aInvisibleChildren;
		}.bind(this), []);

		var oInitialRevealObject = {
			elements: [],
			controlTypeNames: []
		};
		var mRevealPromise = aInvisibleElements.reduce(function(oPreviousPromise, mInvisibleElement) {
			return oPreviousPromise.then(function(mReveal) {
				return checkAndEnrichReveal(mReveal, mInvisibleElement, oPlugin, sAggregationName);
			});
		}, Promise.resolve(oInitialRevealObject));

		return mRevealPromise.then(function(mReveal) {
			if (mReveal.elements.length > 0) {
				_mReveal[sAggregationName] = {
					reveal: mReveal
				};
			}
			return _mReveal;
		});
	}

	function checkAndEnrichReveal(mReveal, mInvisibleElement, oPlugin, sTargetAggregation) {
		var oInvisibleElement = mInvisibleElement.element;
		var oDesignTimeMetadata;
		var mRevealAction;
		var bRevealEnabled = false;
		var oHasChangeHandlerPromise = Promise.resolve(false);
		var sSourceAggregation = mInvisibleElement.sourceAggregation;

		var oOverlay = OverlayRegistry.getOverlay(oInvisibleElement);
		if (oOverlay) {
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

			mRevealAction = oDesignTimeMetadata && oDesignTimeMetadata.getAction("reveal", oInvisibleElement);
			if (mRevealAction && mRevealAction.changeType) {
				var oRevealSelector = oInvisibleElement;
				if (mRevealAction.changeOnRelevantContainer) {
					oRevealSelector = oOverlay.getRelevantContainer();
				}

				oHasChangeHandlerPromise = oPlugin.hasChangeHandler(mRevealAction.changeType, oRevealSelector).then(function(bHasChangeHandler) {
					// Element can be made invalid while the check is running (e.g. destroyed during undo of split)
					if (ElementUtil.isElementValid(oInvisibleElement)) {
						var mParents = AdditionalElementsUtils.getParents(true, oOverlay, oPlugin);
						if (bHasChangeHandler) {
							if (mRevealAction.changeOnRelevantContainer) {
								// we have the child overlay, so we need the parents
								bRevealEnabled = oPlugin.hasStableId(mParents.relevantContainerOverlay)
									&& oPlugin.hasStableId(mParents.parentOverlay);
							} else {
								bRevealEnabled = true;
							}
							mRevealAction.getAggregationName ||= defaultGetAggregationName;

							// Check if the invisible element can be moved to the target aggregation
							if (bRevealEnabled && (sSourceAggregation !== sTargetAggregation)) {
								var oAggregationOverlay = mParents.parentOverlay.getAggregationOverlay(sTargetAggregation);
								return Utils.checkTargetZone(oAggregationOverlay, oOverlay, oPlugin);
							}
						}
					}
					return bRevealEnabled;
				});
			}
		}

		return oHasChangeHandlerPromise.then(function(bIncludeReveal) {
			if (bIncludeReveal) {
				mReveal.elements.push({
					element: oInvisibleElement,
					designTimeMetadata: oDesignTimeMetadata,
					action: mRevealAction,
					sourceAggregation: sSourceAggregation,
					targetAggregation: sTargetAggregation
				});
				var mName = oDesignTimeMetadata.getName(oInvisibleElement);
				if (mName) {
					mReveal.controlTypeNames.push(mName);
				}
			}
			return mReveal;
		});
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
	 *
	 * @return {Promise} Resolving to a structure with all "add/reveal" action relevant data collected
	 */
	ActionExtractor.getActions = function(bSibling, oSourceElementOverlay, oPlugin, bInvalidate, oDesignTime) {
		var sSiblingOrChild = bSibling ? "asSibling" : "asChild";
		if (!bInvalidate && oSourceElementOverlay._mAddActions) {
			return Promise.resolve(oSourceElementOverlay._mAddActions[sSiblingOrChild]);
		}

		var oRevealActionsPromise = this._getRevealActions(bSibling, oSourceElementOverlay, oPlugin, oDesignTime);
		var oAddPropertyActionsPromise = this._getAddViaDelegateActions(bSibling, oSourceElementOverlay, oPlugin);

		return Promise.all([
			oRevealActionsPromise,
			oAddPropertyActionsPromise
		]).then(function(aAllActions) {
			// join and condense all action data
			var mAllActions = merge(aAllActions[0], aAllActions[1]);
			oSourceElementOverlay._mAddActions ||= {asSibling: {}, asChild: {}};
			oSourceElementOverlay._mAddActions[sSiblingOrChild] = mAllActions;
			return mAllActions;
		});
	};

	/**
	 * Returns the already calculated actions of an Overlay, or undefined if no actions available
	 * @param {boolean} bSibling - Indicates if the elements should be added as sibling (true) or child (false) to the overlay
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Elements will be added in relation (sibling/parent) to this overlay
	 * @returns {object/undefined} - Object with all "add/reveal" action relevant data collected or undefined if no actions available
	 */
	ActionExtractor.getActionsOrUndef = function(bSibling, oOverlay) {
		var sSiblingOrChild = bSibling ? "asSibling" : "asChild";
		return oOverlay._mAddActions && oOverlay._mAddActions[sSiblingOrChild];
	};

	var mRevealCache = {};
	var bIsSyncRegistered = true;

	/**
	 * Returns the Reveal actions data (parameters + elements) for an Overlay
	 * @param {boolean} bSibling - If source element overlay should be sibling or parent to the newly added fields
	 * @param {sap.ui.dt.ElementOverlay} oSourceElementOverlay - Overlay where the action is triggered
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElements plugin
	 *
	 * @returns {Promise<object>} Reveal action data
	 */
	ActionExtractor._getRevealActions = function(bSibling, oSourceElementOverlay, oPlugin, oDesignTime) {
		if (bIsSyncRegistered) {
			bIsSyncRegistered = false;
			oDesignTime.attachEventOnce("synced", function() {
				mRevealCache = {};
				bIsSyncRegistered = true;
			}, this);
		}

		var mParents = AdditionalElementsUtils.getParents(bSibling, oSourceElementOverlay, oPlugin);
		var aParents = [mParents.parentOverlay];
		if (mParents.relevantContainer !== mParents.parent) {
			aParents = ElementUtil.findAllSiblingsInContainer(mParents.parent, mParents.relevantContainer).map(function(oParent) {
				return OverlayRegistry.getOverlay(oParent);
			}).filter(function(oOverlay) {
				return oOverlay;
			});
		}
		var aAggregationNames = [];
		if (mParents.parentOverlay) {
			var mCachedResult = mRevealCache[mParents.parentOverlay.getId()];
			if (mCachedResult && bSibling) {
				return mCachedResult;
			}
			aAggregationNames = mParents.parentOverlay.getChildren().filter(function(oAggregationOverlay) {
				return !oAggregationOverlay.getDesignTimeMetadata().isIgnored(mParents.parent);
			}).map(function(oAggregationOverlay) {
				return oAggregationOverlay.getAggregationName();
			});
			return aAggregationNames.reduce(function(oPreviousPromise, sAggregationName) {
				return oPreviousPromise.then(function(mReveal) {
					return getRevealActionFromAggregations(aParents, mReveal, sAggregationName, aAggregationNames, oPlugin);
				});
			}, Promise.resolve({}))
			.then(function(mAggregatedReveal) {
				if (bSibling) {
					mRevealCache[mParents.parentOverlay.getId()] = mAggregatedReveal;
				}
				return mAggregatedReveal;
			});
		}
		return Promise.resolve({});
	};

	/**
	 * Return the AddViaDelegate action data (parameters + elements) for an Overlay.
	 * @param {boolean} bSibling - If source element overlay should be sibling or parent to the newly added fields
	 * @param {sap.ui.dt.ElementOverlay} oSourceElementOverlay - Overlay where the action is triggered
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElementsPlugin
	 *
	 * @returns {Promise<object>} AddViaDelegate action data
	 */
	ActionExtractor._getAddViaDelegateActions = function(bSibling, oSourceElementOverlay, oPlugin) {
		var mParents = AdditionalElementsUtils.getParents(bSibling, oSourceElementOverlay, oPlugin);
		var oDesignTimeMetadata = mParents.parentOverlay && mParents.parentOverlay.getDesignTimeMetadata();
		return Promise.resolve()
		.then(function() {
			var aActions = oDesignTimeMetadata ? oDesignTimeMetadata.getActionDataFromAggregations("add", mParents.parent, undefined, "delegate") : [];
			if (aActions.length) {
				return loadKnownDefaultDelegateLibraries()
				.then(filterValidAddPropertyActions.bind(this, aActions, mParents, oPlugin));
			}
			return [];
		}.bind(this))
		.then(function(aActions) {
			return aActions.reduce(function(oPreviousPromise, oAction) {
				return oPreviousPromise
				.then(function(oReturn) {
					return getAddViaDelegateActionData.call(this, oAction, oDesignTimeMetadata, oPlugin)
					.then(function(mAction) {
						if (mAction) {
							mAction.addPropertyActionData.relevantContainer = mParents.relevantContainer;
							oReturn[mAction.aggregationName] ||= {};
							oReturn[mAction.aggregationName].addViaDelegate = mAction.addPropertyActionData;
						}
						return oReturn;
					});
				}.bind(this));
			}.bind(this), Promise.resolve({}));
		}.bind(this));
	};

	return ActionExtractor;
});