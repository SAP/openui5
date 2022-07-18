/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/Utils"
],
function(
	Log,
	CondenserClassification,
	FlUtils
) {
	"use strict";

	/**
	 * Change handler for moving of an element.
	 *
	 * @alias sap.ui.fl.changeHandler.MoveControls
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.46
	 */
	var MoveControls = { };

	// Defines object which contains constants used in the handler
	MoveControls.SOURCE_ALIAS = "source";
	MoveControls.TARGET_ALIAS = "target";
	MoveControls.MOVED_ELEMENTS_ALIAS = "movedElements";


	 function fnCheckConditions(oChange, oModifier, oView, oAppComponent) {
		if (!oChange) {
			return Promise.reject(new Error("No change instance"));
		}

		var oChangeContent = oChange.getContent();

		if (!oChangeContent || !oChangeContent.movedElements || oChangeContent.movedElements.length === 0) {
			return Promise.reject(new Error("Change format invalid"));
		}
		if (!oChangeContent.source || !oChangeContent.source.selector) {
			return Promise.reject(new Error("No source supplied for move"));
		}
		if (!oChangeContent.target || !oChangeContent.target.selector) {
			return Promise.reject(new Error("No target supplied for move"));
		}
		if (!oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView)) {
			return Promise.reject(new Error("Move source parent not found"));
		}
		if (!oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView)) {
			return Promise.reject(new Error("Move target parent not found"));
		}
		if (!oChangeContent.source.selector.aggregation) {
			return Promise.reject(new Error("No source aggregation supplied for move"));
		}
		if (!oChangeContent.target.selector.aggregation) {
			return Promise.reject(new Error("No target aggregation supplied for move"));
		}
		return Promise.resolve();
	}

	function fnGetElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView) {
		if (!mMovedElement.selector && !mMovedElement.id) {
			return Promise.reject(new Error("Change format invalid - moveElements element has no id attribute"));
		}
		if (typeof mMovedElement.targetIndex !== "number") {
			return Promise.reject(new Error("Missing targetIndex for element with id '" + mMovedElement.selector.id
					+ "' in movedElements supplied"));
		}

		return Promise.resolve()
			.then(oModifier.bySelector.bind(oModifier, mMovedElement.selector || mMovedElement.id, oAppComponent, oView))
			.then(function(oControl) {
				if (!oControl) {
					return Promise.reject(new Error("Control to move was not found. Id: '" + mMovedElement.selector.id + "'"));
				}
				return oControl;
			});
	}

	function fnCheckCompleteChangeContentConditions(mSpecificChangeInfo) {
		if (!mSpecificChangeInfo.movedElements) {
			return Promise.reject(new Error("mSpecificChangeInfo.movedElements attribute required"));
		}
		if (mSpecificChangeInfo.movedElements.length === 0) {
			return Promise.reject(new Error("MovedElements array is empty"));
		}

		mSpecificChangeInfo.movedElements.forEach(function (mElement) {
			if (!mElement.id) {
				throw new Error("MovedControls element has no id attribute");
			}
			if (typeof (mElement.sourceIndex) !== "number") {
				throw new Error("SourceIndex attribute at MovedElements element is no number");
			}
			if (typeof (mElement.targetIndex) !== "number") {
				throw new Error("TargetIndex attribute at MovedElements element is no number");
			}
		});
		return Promise.resolve();
	}

	function fnGetSpecificChangeInfo(oModifier, mSpecificChangeInfo, oAppComponent) {
		delete mSpecificChangeInfo.source.publicAggregation;
		delete mSpecificChangeInfo.target.publicAggregation;

		var oSourceParent;
		var oTargetParent;

		return Promise.resolve()
			.then(function() {
				return mSpecificChangeInfo.source.parent || oModifier.bySelector(mSpecificChangeInfo.source.id, oAppComponent);
			})
			.then(function(oRetrievedSourceParent) {
				oSourceParent = oRetrievedSourceParent;
				return mSpecificChangeInfo.target.parent || oModifier.bySelector(mSpecificChangeInfo.target.id, oAppComponent);
			})
			.then(function(oReturnedTargetParent) {
				oTargetParent = oReturnedTargetParent;
				var sSourceAggregation = mSpecificChangeInfo.source.aggregation;
				var sTargetAggregation = mSpecificChangeInfo.target.aggregation;
				var mAdditionalSourceInfo = {
					aggregation: mSpecificChangeInfo.source.aggregation,
					type: oModifier.getControlType(oSourceParent)
				};

				var mAdditionalTargetInfo = {
					aggregation: mSpecificChangeInfo.target.aggregation,
					type: oModifier.getControlType(oTargetParent)
				};

				var mSpecificInfo = {
					source: {
						id: oSourceParent.getId(),
						aggregation: sSourceAggregation,
						type: mAdditionalSourceInfo.type,
						selector: oModifier.getSelector(mSpecificChangeInfo.source.id, oAppComponent, mAdditionalSourceInfo)
					},
					target: {
						id: oTargetParent.getId(),
						aggregation: sTargetAggregation,
						type: mAdditionalTargetInfo.type,
						selector: oModifier.getSelector(mSpecificChangeInfo.target.id, oAppComponent, mAdditionalTargetInfo)
					},
					movedElements: mSpecificChangeInfo.movedElements
				};

				return mSpecificInfo;
			});
	}

	/**
	 * Moves an element from one aggregation to another.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oRelevantContainer control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {string} [mPropertyBag.sourceAggregation] - name of the source aggregation. Overwrites the aggregation from the change. Can be provided by a custom ChangeHandler, that uses this ChangeHandler
	 * @param {string} [mPropertyBag.targetAggregation] - name of the target aggregation. Overwrites the aggregation from the change. Can be provided by a custom ChangeHandler, that uses this ChangeHandler
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComponent
	 * @return {Promise} Promise resolving if the change could be applied
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#applyChange
	 */
	MoveControls.applyChange = function(oChange, oRelevantContainer, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oMovedElement;
		var oSourceParent;
		var oTargetParent;
		var sSourceAggregation;
		var sTargetAggregation;
		var iSourceIndex;
		var iInsertIndex;
		var bChangeAlreadyPerformed = false;
		var oChangeContent = oChange.getContent();
		var aRevertData = [];
		var aPromises = [];
		return fnCheckConditions(oChange, oModifier, oView, oAppComponent)
			.then(function() {
				oChangeContent.movedElements.forEach(function(mMovedElement) {
					var fnPromise = function() {
						return Promise.resolve()
							.then(fnGetElementControlOrThrowError.bind(null, mMovedElement, oModifier, oAppComponent, oView))
							.then(function(oRetrievedMovedElement) {
								oMovedElement = oRetrievedMovedElement;
								oSourceParent = oModifier.getParent(oMovedElement);
								// mPropertyBag.sourceAggregation and mPropertyBag.targetAggregation should always be used when available
								return mPropertyBag.sourceAggregation || oModifier.getParentAggregationName(oMovedElement, oSourceParent);
							})
							.then(function(sRetrievedAggregation) {
								sSourceAggregation = sRetrievedAggregation;
								return oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
							})
							.then(function(oRetrievedTargetParent) {
								oTargetParent = oRetrievedTargetParent;
								sTargetAggregation = mPropertyBag.targetAggregation || oChangeContent.target.selector.aggregation;
								// save the current index, sourceParent and sourceAggregation for revert
								return oModifier.findIndexInParentAggregation(oMovedElement);
							})
							.then(function(iRetrievedSourceIndex) {
								iSourceIndex = iRetrievedSourceIndex;
								iInsertIndex = mMovedElement.targetIndex;
								if (iSourceIndex > -1) {
									// if iIndex === iInsertIndex and source===target the operation was already performed (e.g. drag&drop in RTA)
									// in this case we need the sourceIndex and sourceParent that is saved in the change in order to revert it to the correct index
									// and we can't use the current aggregations/parents
									if (
										iSourceIndex === iInsertIndex
										&& sSourceAggregation === sTargetAggregation
										&& oModifier.getParent(oMovedElement) === oTargetParent
									) {
										iSourceIndex = mMovedElement.sourceIndex;
										sSourceAggregation = mPropertyBag.sourceAggregation || oChangeContent.source.selector.aggregation;
										bChangeAlreadyPerformed = true;
										return oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView);
									}
								}
								return Promise.resolve();
							})
							.then(function (oRetrievedSourceParent) {
								if (oRetrievedSourceParent) {
									oSourceParent = oRetrievedSourceParent;
								}
								if (iSourceIndex > -1) {
									aRevertData.unshift({
										index: iSourceIndex,
										aggregation: sSourceAggregation,
										sourceParent: oModifier.getSelector(oSourceParent, oAppComponent)
									});
								}
								if (!bChangeAlreadyPerformed) {
									return Promise.resolve()
										.then(oModifier.removeAggregation.bind(oModifier, oSourceParent, sSourceAggregation, oMovedElement))
										.then(oModifier.insertAggregation.bind(oModifier, oTargetParent, sTargetAggregation, oMovedElement, iInsertIndex, oView));
								}
								return Promise.resolve();
							});
					};
					aPromises.push(fnPromise);
				}, this);
				return FlUtils.execPromiseQueueSequentially(aPromises, true, true);
			}.bind(this))
			.then(function() {
				oChange.setRevertData(aRevertData);
			});
	};

	/**
	 * Reverts the Change MoveControls.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oRelevantContainer control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComopnent
	 * @return {Promise} Promise resolving when change was successfully reverted
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#revertChange
	 */
	MoveControls.revertChange = function(oChange, oRelevantContainer, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		// we still have to set sourceParent and sourceAggregation initially from the change data,
		// because for XML changes this data can't be stored in the revertData yet.
		var oChangeContent = oChange.getContent();

		var oSourceParent;
		var oTargetParent;
		var sSourceAggregation;
		var sTargetAggregation;
		var oMovedElement;
		var iInsertIndex;

		return fnCheckConditions(oChange, oModifier, oView, oAppComponent)
			.then(oModifier.bySelector.bind(oModifier, oChangeContent.source.selector, oAppComponent, oView))
			.then(function(oRetrievedSourceParent) {
				oSourceParent = oRetrievedSourceParent;
				sSourceAggregation = oChangeContent.source.selector.aggregation;
				sTargetAggregation = oChangeContent.target.selector.aggregation;
				return oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
			})
			.then(function(oRetrievedTargetParent) {
				oTargetParent = oRetrievedTargetParent;
				var aRevertData = oChange.getRevertData();
				oChange.getContent().movedElements.reverse();
				var aPromises = [];
				oChangeContent.movedElements.forEach(function(mMovedElement, iElementIndex) {
					var fnPromise = function() {
						return Promise.resolve()
							.then(fnGetElementControlOrThrowError.bind(this, mMovedElement, oModifier, oAppComponent, oView))
							.then(function(oRetrievedMovedElement) {
								oMovedElement = oRetrievedMovedElement;
								if (!oMovedElement) {
									Log.warning("Element to move not found");
									return Promise.reject();
								}
								iInsertIndex = mMovedElement.sourceIndex;
								if (aRevertData) {
									var mRevertData = aRevertData[iElementIndex];
									sSourceAggregation = mRevertData.aggregation;
									iInsertIndex = mRevertData.index;
									return oModifier.bySelector(mRevertData.sourceParent, oAppComponent, oView);
								}
								return Promise.resolve();
							})
							.then(function(oRetrievedSourceParent) {
								if (oRetrievedSourceParent) {
									oSourceParent = oRetrievedSourceParent;
								}
								return oModifier.removeAggregation(oTargetParent, sTargetAggregation, oMovedElement);
							})
							.then(function() {
								return oModifier.insertAggregation(oSourceParent, sSourceAggregation, oMovedElement, iInsertIndex, oView);
							});
					}.bind(this);
					aPromises.push(fnPromise);
				}, this);
				return FlUtils.execPromiseQueueSequentially(aPromises, true, true);
			}.bind(this))
			.then(function() {
				oChange.resetRevertData();
			});
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object} mPropertyBag - map of properties
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
	 * @return {Promise} Promise resolving when all change content is completed
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#completeChangeContent
	 */
	MoveControls.completeChangeContent = function(oChange, mSpecificChangeInfo, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		return fnCheckCompleteChangeContentConditions(mSpecificChangeInfo)
			.then(fnGetSpecificChangeInfo.bind(this, oModifier, mSpecificChangeInfo, oAppComponent))
			.then(function(mSpecificChangeInfo) {
				var oContent = {
					movedElements: [],
					source: {
						selector: mSpecificChangeInfo.source.selector
					},
					target: {
						selector: mSpecificChangeInfo.target.selector
					}
				};

				var aPromises = [];
				mSpecificChangeInfo.movedElements.forEach(function(mElement) {
					var oPromise = Promise.resolve()
						.then(function() {
							return mElement.element || oModifier.bySelector(mElement.id, oAppComponent);
						})
						.then(function(oElement) {
							oContent.movedElements.push({
								selector: oModifier.getSelector(oElement, oAppComponent),
								sourceIndex: mElement.sourceIndex,
								targetIndex: mElement.targetIndex
							});
							oChange.addDependentControl(mSpecificChangeInfo.source.id, MoveControls.SOURCE_ALIAS, mPropertyBag);
							oChange.addDependentControl(mSpecificChangeInfo.target.id, MoveControls.TARGET_ALIAS, mPropertyBag);
							oChange.addDependentControl(mSpecificChangeInfo.movedElements.map(function (element) {
								return element.id;
							}), MoveControls.MOVED_ELEMENTS_ALIAS, mPropertyBag);
						});
					aPromises.push(oPromise);
				});
				return Promise.all(aPromises).then(function() {
					oChange.setContent(oContent);
				});
			});
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	MoveControls.getCondenserInfo = function(oChange) {
		var oChangeContent = oChange.getContent();
		var oRevertData = oChange.getRevertData()[0];
		return {
			affectedControl: oChangeContent.movedElements[0].selector,
			classification: CondenserClassification.Move,
			sourceContainer: oRevertData.sourceParent,
			targetContainer: oChangeContent.target.selector,
			sourceIndex: oRevertData.index,
			sourceAggregation: oRevertData.aggregation,
			targetAggregation: oChangeContent.target.selector.aggregation,
			setTargetIndex: function(oChange, iNewTargetIndex) {
				oChange.getContent().movedElements[0].targetIndex = iNewTargetIndex;
			},
			getTargetIndex: function(oChange) {
				return oChange.getContent().movedElements[0].targetIndex;
			}
		};
	};

	MoveControls.getChangeVisualizationInfo = function(oChange) {
		var oChangeContent = oChange.getContent();
		var oRevertData = oChange.getRevertData()[0];
		return {
			affectedControls: [oChangeContent.movedElements[0].selector],
			dependentControls: [oChangeContent.source.selector],
			payload: {
				sourceParentContainer: oRevertData.sourceParent,
				targetParentContainer: oChangeContent.target.selector
			}
		};
	};
	return MoveControls;
},
/* bExport= */true);
