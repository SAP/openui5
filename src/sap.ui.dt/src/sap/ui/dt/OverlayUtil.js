/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.OverlayUtil.
sap.ui.define([
	"sap/ui/core/UIArea",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry"
], function(
	UIArea,
	ElementUtil,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Utility functionality to work with overlays.
	 *
	 * @namespace
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.OverlayUtil
	 */

	const OverlayUtil = {};

	/**
	 * Check if the overlay is in target zone aggregation.
	 * @param  {sap.ui.dt.ElementOverlay} oElementOverlay The overlay to be checked
	 * @return {boolean} Returns true if overlay is in target zone
	 * @private
	 */
	OverlayUtil.isInTargetZoneAggregation = function(oElementOverlay) {
		const oAggregationOverlay = oElementOverlay.getParent();
		return !!oAggregationOverlay && oAggregationOverlay.isTargetZone();
	};

	/**
	 * Returns an object with public parent, aggregation in public parent and direct index.
	 * @param  {sap.ui.dt.ElementOverlay} oElementOverlay The overlay to get the information from
	 * @return {object}
	 *         {object.parent}            The overlay parent element
	 *         {object.aggregation}       The parent aggregation
	 *         {object.index}             Position of the parent element in the aggregation
	 * @private
	 */
	OverlayUtil.getParentInformation = function(oElementOverlay) {
		const oParentOverlay = oElementOverlay.getParentElementOverlay();
		if (oParentOverlay) {
			// calculate index in direct (maybe in hidden tree) parent
			const oParent = oParentOverlay.getElement();
			const sParentAggregationName = oElementOverlay.getParentAggregationOverlay().getAggregationName();
			const aChildren = ElementUtil.getAggregation(oParent, sParentAggregationName);
			const oElement = oElementOverlay.getElement();
			const iIndex = aChildren.indexOf(oElement);

			return {
				parent: oParent,
				aggregation: sParentAggregationName,
				index: iIndex
			};
		}

		return {
			parent: null,
			aggregation: "",
			index: -1
		};
	};

	/**
	 * Get the closest overlay to an element (moving up the tree).
	 * @param  {sap.ui.core.Element} oElement The element to be checked
	 * @return {sap.ui.dt.ElementOverlay} Returns the overlay that was found first
	 * @private
	 */
	OverlayUtil.getClosestOverlayFor = function(oElement) {
		if (!oElement) {
			return null;
		}

		let oParent = oElement;
		let oParentOverlay = OverlayRegistry.getOverlay(oParent);
		while (oParent && !oParentOverlay) {
			oParent = oParent.getParent();
			oParentOverlay = OverlayRegistry.getOverlay(oParent);
		}

		return oParentOverlay;
	};

	/**
	 * Get the Overlay geometry.
	 * @param  {array}  aGeometry Array with the element geometries
	 * @return {object} Returns geometry information: size (width, height), position (left, top) and visibility
	 * @private
	 */
	OverlayUtil.getGeometry = function(aGeometry) {
		let minLeft;
		let maxRight;
		let minTop;
		let maxBottom;
		aGeometry.forEach(function(oElementGeometry) {
			if (oElementGeometry && oElementGeometry.visible) {
				if (!minLeft || oElementGeometry.position.left < minLeft) {
					minLeft = oElementGeometry.position.left;
				}
				if (!minTop || oElementGeometry.position.top < minTop) {
					minTop = oElementGeometry.position.top;
				}

				const iRight = oElementGeometry.position.left + oElementGeometry.size.width;
				if (!maxRight || iRight > maxRight) {
					maxRight = iRight;
				}
				const iBottom = oElementGeometry.position.top + oElementGeometry.size.height;
				if (!maxBottom || iBottom > maxBottom) {
					maxBottom = iBottom;
				}
			}
		});

		if (typeof minLeft === "number") {
			return {
				size: {
					width: maxRight - minLeft,
					height: maxBottom - minTop
				},
				position: {
					left: minLeft,
					top: minTop
				},
				visible: true
			};
		}
	};

	/**
	 * Returns first descendant of given ElementOverlay which fulfills
	 * the given condition. Recursive function.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @param {function} fnCondition - condition to search
	 * @returns {sap.ui.dt.ElementOverlay} Returns the overlay which fulfills the condition, otherwise it returns 'undefined'
	 * @private
	 */
	OverlayUtil.getFirstDescendantByCondition = function(oOverlay, fnCondition) {
		if (!fnCondition) {
			throw new Error("expected condition is 'undefined' or not a function");
		}
		const aChildrenOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
		for (let i = 0, n = aChildrenOverlays.length; i < n; i++) {
			const oChildOverlay = aChildrenOverlays[i];
			if (fnCondition(oChildOverlay)) {
				return oChildOverlay;
			}
			const oDescendantOverlay = OverlayUtil.getFirstDescendantByCondition(oChildOverlay, fnCondition);
			if (oDescendantOverlay) {
				return oDescendantOverlay;
			}
		}
		return undefined;
	};

	/**
	 * Returns last descendant of given ElementOverlay which fulfills
	 * the given condition. Recursive function.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @param {function} fnCondition - condition to search
	 * @returns {sap.ui.dt.ElementOverlay} Returns the overlay which fulfills the condition, otherwise it returns 'undefined'
	 * @private
	 */
	OverlayUtil.getLastDescendantByCondition = function(oOverlay, fnCondition) {
		if (!fnCondition) {
			throw new Error("expected condition is 'undefined' or not a function");
		}
		const aChildrenOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
		for (let i = aChildrenOverlays.length - 1, n = -1; i > n; i--) {
			const oChildOverlay = aChildrenOverlays[i];
			if (fnCondition(oChildOverlay)) {
				return oChildOverlay;
			}
			const oDescendantOverlay = OverlayUtil.getLastDescendantByCondition(oChildOverlay, fnCondition);
			if (oDescendantOverlay) {
				return oDescendantOverlay;
			}
		}
		return undefined;
	};

	/**
	 * Returns all overlay children as ElementOverlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Source overlay object
	 * @returns {array} Returns an array of child overlays {sap.ui.dt.ElementOverlay}
	 * @private
	 */
	OverlayUtil.getAllChildOverlays = function(oElementOverlay) {
		const aChildElementOverlays = [];
		let aChildren = [];
		if (!oElementOverlay) {
			return aChildElementOverlays;
		}
		const aAggregationOverlays = oElementOverlay.getChildren();
		for (let i = 0; i < aAggregationOverlays.length; i++) {
			aChildren = aAggregationOverlays[i].getChildren();
			if (aChildren && aChildren.length > 0) {
				aChildElementOverlays.push(...aChildren);
			}
		}
		return aChildElementOverlays;
	};

	/**
	 * Returns next sibling overlay (going down the tree).
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay The source overlay
	 * @return {sap.ui.dt.ElementOverlay} Returns the next sibling overlay
	 * @private
	 */
	OverlayUtil.getNextSiblingOverlay = function(oOverlay) {
		if (!oOverlay) {
			return undefined;
		}

		const oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			let aAggregationOverlays = oParentAggregationOverlay.getChildren();
			let iIndex = aAggregationOverlays.indexOf(oOverlay);
			// get next sibling in the same aggregation
			if (iIndex !== aAggregationOverlays.length - 1) {
				return aAggregationOverlays[iIndex + 1];
			} else if (iIndex === aAggregationOverlays.length - 1) {
				// get next sibling from next aggregation in the same parent
				const oParent = oOverlay.getParentElementOverlay();
				aAggregationOverlays = oParent.getChildren();
				for (iIndex = aAggregationOverlays.indexOf(oParentAggregationOverlay) + 1; iIndex < aAggregationOverlays.length; iIndex++) {
					const aOverlays = aAggregationOverlays[iIndex].getChildren();
					if (aOverlays.length) {
						return aOverlays[0];
					}
				}
			}
		}
	};

	/**
	 * Returns previous sibling overlay (going up the tree).
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay The source overlay
	 * @return {sap.ui.dt.ElementOverlay} Returns the previous sibling overlay
	 * @private
	 */
	OverlayUtil.getPreviousSiblingOverlay = function(oOverlay) {
		if (!oOverlay) {
			return undefined;
		}

		const oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			let aAggregationOverlays = oParentAggregationOverlay.getChildren();
			let iIndex = aAggregationOverlays.indexOf(oOverlay);
			// get previous sibling from the same aggregation
			if (iIndex > 0) {
				return aAggregationOverlays[iIndex - 1];
			} else if (iIndex === 0) {
				// get previous sibling from previous aggregation in the same parent
				const oParent = oOverlay.getParentElementOverlay();
				aAggregationOverlays = oParent.getChildren();
				for (iIndex = aAggregationOverlays.indexOf(oParentAggregationOverlay) - 1; iIndex >= 0; iIndex--) {
					const aOverlays = aAggregationOverlays[iIndex].getChildren();
					if (aOverlays.length) {
						return aOverlays[aOverlays.length - 1];
					}
				}
			}
		}
	};

	/**
	 * Applies a function to every element in an overlay's element tree.
	 * @param  {sap.ui.dt.ElementOverlay} oElementOverlay The source overlay
	 * @param  {function} fnCallback The function to be applied
	 * @private
	 */
	OverlayUtil.iterateOverlayElementTree = function(oElementOverlay, fnCallback) {
		fnCallback(oElementOverlay);

		oElementOverlay.getChildren().forEach(function(oAggregationOverlay) {
			oAggregationOverlay.getChildren().forEach(function(oChildOverlay) {
				OverlayUtil.iterateOverlayElementTree(oChildOverlay, fnCallback);
			});
		});
	};

	/**
	 * Returns the closest overlay to a given node.
	 * @param  {HTMLElement} oNode The source node
	 * @return {sap.ui.dt.Overlay} Returns the closest overlay
	 * @private
	 */
	OverlayUtil.getClosestOverlayForNode = function(oNode) {
		const oElement = ElementUtil.getClosestElementForNode(oNode);
		return OverlayUtil.getClosestOverlayFor(oElement);
	};

	/**
	 * Changes the movability of the parent of the passed overlay to the provided boolean
	 * If a parent overlay is movable it should not be draggable by a non-movable child
	 * @param  {sap.ui.dt.Overlay} oOverlay	Overlay for which we want to change the parents movability
	 * @param  {sap.ui.dt.Overlay} bMovable New value for the overlay parents movability
	 */
	OverlayUtil.setFirstParentMovable = function(oOverlay, bMovable) {
		if (!bMovable) {
			const oFirstMovableParentOverlay = OverlayUtil.getFirstMovableParentOverlay(oOverlay);
			if (oFirstMovableParentOverlay) {
				oOverlay._firstMovableParentOverlay = oFirstMovableParentOverlay;
				oFirstMovableParentOverlay.setMovable(false);
			}
		} else if (oOverlay._firstMovableParentOverlay) {
			oOverlay._firstMovableParentOverlay.setMovable(true);
			delete oOverlay._firstMovableParentOverlay;
		}
	};

	/**
	 * Returns all the sibling overlays in a container. It checks recursively for every overlay belonging
	 * to the same relevant container in the tree which has DesignTime Metadata.
	 * @param  {sap.ui.dt.Overlay} oOverlay	Overlay for which we want to find the siblings
	 * @param  {sap.ui.dt.Overlay} oRelevantContainerOverlay Relevant container of the overlay
	 * @return {sap.ui.dt.Overlay[]} Returns a flat array with all sibling overlays
	 */
	OverlayUtil.findAllSiblingOverlaysInContainer = function(oOverlay, oRelevantContainerOverlay) {
		const oParentOverlay = oOverlay.getParentElementOverlay();
		let aRelevantOverlays = [];

		if (oParentOverlay) {
			if (oParentOverlay !== oRelevantContainerOverlay) {
				const aParents = OverlayUtil.findAllSiblingOverlaysInContainer(oParentOverlay, oRelevantContainerOverlay);
				aRelevantOverlays = aParents.map((oSiblingParentOverlay) => {
					const oAggregationOverlay = oSiblingParentOverlay.getAggregationOverlay(
						oOverlay.getParentAggregationOverlay().getAggregationName()
					);
					return oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
				}).flat();
			} else {
				const sAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
				const oAggregationOverlay = oParentOverlay.getAggregationOverlay(sAggregationName);
				aRelevantOverlays = (oAggregationOverlay && oAggregationOverlay.getChildren()) || [];
			}
		}

		aRelevantOverlays = aRelevantOverlays.filter(function(oOverlay) {
			return oOverlay.getDesignTimeMetadata();
		});

		return aRelevantOverlays;
	};

	/**
	 * Gets all the Overlays with DesignTime Metadata inside the relevant container
	 * @param {sap.ui.dt.ElementOverlay} oOverlay Overlay from which we get the aggregations
	 * @param {boolean} bIncludeOtherAggregations Include also overlays from other aggregations from the parent
	 * @returns {sap.ui.dt.ElementOverlay[]} Returns an array with all the overlays in it
	 * @protected
	 */
	OverlayUtil.findAllOverlaysInContainer = function(oOverlay, bIncludeOtherAggregations) {
		// The root control has no relevant container, therefore we use the element itself
		const oRelevantContainer = oOverlay.getRelevantContainer() || oOverlay.getElement();
		const oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		let aRelevantOverlays = [];

		// Overlay might be destroyed in the meantime
		if (!oRelevantContainerOverlay) {
			return aRelevantOverlays;
		}

		// Get all the siblings and parents of the overlay
		const mRelevantOverlays = OverlayUtil._findAllSiblingsAndParents(oOverlay, oRelevantContainerOverlay, 0, bIncludeOtherAggregations);

		for (const iLevel in mRelevantOverlays) {
			aRelevantOverlays.push(...mRelevantOverlays[iLevel]);
		}

		if (aRelevantOverlays.length) {
			const aChildren = [];
			const aOverlaysToGetChildrenFrom = bIncludeOtherAggregations ? aRelevantOverlays : mRelevantOverlays[0];

			aOverlaysToGetChildrenFrom.forEach((oCurrentOverlay) => {
				aChildren.push(...OverlayUtil._findAllChildrenInContainer(oCurrentOverlay, oRelevantContainer));
			});

			aRelevantOverlays.push(...aChildren);
		} else {
			aRelevantOverlays = OverlayUtil._findAllChildrenInContainer(oOverlay, oRelevantContainer);
		}

		aRelevantOverlays.push(oRelevantContainerOverlay);

		aRelevantOverlays = aRelevantOverlays.filter(function(oOverlay) {
			return oOverlay.getDesignTimeMetadata();
		});

		return aRelevantOverlays;
	};

	/**
	 * This function returns all the siblings and parents inside the relevant container.
	 * @param {sap.ui.dt.ElementOverlay} oOverlay Overlay from which we get the aggregations
	 * @param {sap.ui.dt.ElementOverlay} oRelevantContainerOverlay Relevant container overlay
	 * @param {int} iLevel Current level in the hierarchy
	 * @param {boolean} bIncludeOtherAggregations Include also overlays from other aggregations from the parent
	 * @returns {object} Returns a map with all siblings sorted by the level
	 * @private
	 */
	OverlayUtil._findAllSiblingsAndParents = function(oOverlay, oRelevantContainerOverlay, iLevel, bIncludeOtherAggregations) {
		const oParentOverlay = oOverlay.getParentElementOverlay();
		const mReturn = {};

		if (!oParentOverlay) {
			mReturn[iLevel] = [];
			return mReturn;
		}

		function getChildrenFromAllAggregations(oParentOverlay) {
			const aAllAggregationNames = oParentOverlay.getAggregationNames();
			let aAllAggregationChildren = [];

			// Collect children from all aggregations of the parent
			aAllAggregationNames.forEach(function(sAggregationName) {
				const oAggregationOverlay = oParentOverlay.getAggregationOverlay(sAggregationName);
				const aAggregationChildren = oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
				aAllAggregationChildren = aAggregationChildren.concat(aAllAggregationChildren);
			});

			return aAllAggregationChildren;
		}

		if (oParentOverlay !== oRelevantContainerOverlay) {
			const mParents = OverlayUtil._findAllSiblingsAndParents(oParentOverlay, oRelevantContainerOverlay, iLevel + 1, bIncludeOtherAggregations);
			if (bIncludeOtherAggregations) {
				const aAllAggregationChildren = [];
				mParents[iLevel + 1].forEach(function(oParent) {
					aAllAggregationChildren.push(...getChildrenFromAllAggregations(oParent));
				});
				mParents[iLevel] = aAllAggregationChildren;
				return mParents;
			}
			const aOverlays = mParents[iLevel + 1].map((oSiblingParentOverlay) => {
				const sParentAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
				const oAggregationOverlay = oSiblingParentOverlay.getAggregationOverlay(sParentAggregationName);
				return oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
			}).flat();
			mParents[iLevel] = aOverlays;
			return mParents;
		}

		let aChildren = [];

		if (bIncludeOtherAggregations) {
			aChildren = getChildrenFromAllAggregations(oParentOverlay);
		} else {
			const sParentAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
			aChildren = oOverlay.getParentElementOverlay().getAggregationOverlay(sParentAggregationName).getChildren();
		}
		mReturn[iLevel] = aChildren;
		return mReturn;
	};

	/**
	 * Finds all the children of an overlay which have the same relevant container.
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay Overlay from which we get the children
	 * @param {object} oRelevantContainer Relevant container
	 * @param {sap.ui.dt.ElementOverlay[]} _aRelevantOverlays Array with all the relevant overlays. Used for recursion. You don't have to set this
	 * @returns {sap.ui.dt.ElementOverlay[]} Returns a flat array with all the children
	 * @private
	 */
	OverlayUtil._findAllChildrenInContainer = function(oElementOverlay, oRelevantContainer, _aRelevantOverlays) {
		_aRelevantOverlays ||= [];
		if (oElementOverlay.getChildren().length > 0) {
			oElementOverlay.getChildren().forEach(function(oAggregationOverlay) {
				oAggregationOverlay.getChildren().forEach(function(oChildElementOverlay) {
					if (oChildElementOverlay.getRelevantContainer() === oRelevantContainer) {
						_aRelevantOverlays.push(oChildElementOverlay);
						OverlayUtil._findAllChildrenInContainer(oChildElementOverlay, oRelevantContainer, _aRelevantOverlays);
					}
				});
			});
		}
		return _aRelevantOverlays;
	};

	/**
	 * Returns all the parent aggregation overlays of the sibling overlays in a container.
	 * @param  {sap.ui.dt.Overlay} oOverlay                  Overlay for which we want to find the siblings
	 * @param  {sap.ui.dt.Overlay} oRelevantContainerOverlay Relevant container of the overlay
	 * @return {sap.ui.dt.Overlay[]}                         Returns a flat array with all aggregation overlays
	 */
	OverlayUtil.findAllUniqueAggregationOverlaysInContainer = function(oOverlay, oRelevantContainerOverlay) {
		const aOverlays = OverlayUtil.findAllSiblingOverlaysInContainer(oOverlay, oRelevantContainerOverlay);
		return [...new Set(aOverlays.map((oOvl) => oOvl.getParentAggregationOverlay()))];
	};

	/**
	 * Returns the index of an element in a parent aggregation
	 * Only the elements of the aggregation which have overlays are counted
	 * @param {object} oElement Element for which we want to find the index
	 * @param {object} oParent Parent of the Element
	 * @param {string} sAggregationName Name of the parent aggregation
	 * @return {int} Returns the index
	 */
	OverlayUtil.getIndexInAggregation = function(oElement, oParent, sAggregationName) {
		const aElements = ElementUtil.getAggregation(oParent, sAggregationName).filter(function(oCompareElement) {
			return !!OverlayRegistry.getOverlay(oCompareElement) || oCompareElement === oElement;
		});
		return aElements.indexOf(oElement);
	};

	function findBoundControl(oOverlay, aStack) {
		let sAggregationName;
		let iIndex;
		const oParentOverlay = oOverlay.getParent();
		let bBoundControlFound = false;
		let bBoundary = false;

		if (oOverlay.isA("sap.ui.dt.ElementOverlay")) {
			const oParentElementOverlay = oOverlay.getParentElementOverlay();

			if (oParentOverlay) {
				sAggregationName = oParentOverlay.getAggregationName();
				iIndex = oParentOverlay.getChildren().indexOf(oOverlay);
				bBoundControlFound = oParentElementOverlay
					&& oParentElementOverlay.getAggregationOverlay(sAggregationName, "AggregationBindingTemplateOverlays");
				// A stack entry marks an aggregation binding boundary when its parent control has an aggregation
				// binding on the traversed aggregation. This holds for both the bound control (template side) and
				// its clones, so it is reliable also for nested bindings
				const oParentElement = oParentElementOverlay?.getElement();
				bBoundary = !!(oParentElement?.getBindingInfo?.(sAggregationName));
			} else {
				iIndex = -1;
			}

			aStack.push({
				overlayId: oOverlay.getId(),
				aggregation: sAggregationName,
				index: iIndex,
				boundary: bBoundary
			});

			if (bBoundControlFound) {
				return {
					overlayId: oParentElementOverlay.getId(),
					aggregation: sAggregationName,
					stack: aStack
				};
			}
		}

		if (!oParentOverlay || oParentOverlay instanceof UIArea) {
			return {
				overlayId: undefined,
				aggregation: undefined,
				stack: aStack
			};
		}
		return findBoundControl(oParentOverlay, aStack);
	}

	/**
	 * The AggregationBindingInfo contains the overlay ID and the aggregation name of the bound control together with stack containing
	 * information about the traversed elements for an overlay which is part of an aggregation binding.
	 * @typedef {object} sap.ui.dt.OverlayUtil.AggregationBindingInfo
	 * @property {string} overlayId - ID of the bound overlay that contains binding aggregation template overlays
	 * @property {string} aggregation - Name of the bound aggregation
	 * @property {Object[]} stack - Array of objects containing element, element type, aggregation name, and index of the element in
	 *                              the aggregation for each traversed aggregation
	 * @property {string} stack.overlayId - Overlay ID of an element overlay
	 * @property {string} stack.aggregation - Aggregation name
	 * @property {number} stack.index - Index of the overlay in parent aggregation
	 * @property {boolean} stack.boundary - Whether the parent control has an aggregation binding on the traversed
	 *                                      aggregation, i.e. this level is a binding boundary.
	 *                                      <code>true</code> for the bound control as well as for every nested
	 *                                      bound aggregation on the path.
	 */

	/**
	 * Returns the overlay ID and the aggregation name of the closest bound control for an overlay which is part of an aggregation binding.
	 * In all cases there is also a stack of element overlays returned that describes the path from the selected / passed overlay up to the
	 * closest bound control.
	 * @param  {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay being checked
	 * @return {AggregationBindingInfo} {@link sap.ui.dt.OverlayUtil.AggregationBindingInfo} object
	 */
	 OverlayUtil.getClosestBoundControl = function(oElementOverlay) {
		return findBoundControl(oElementOverlay, []);
	};

	/**
	 * Returns the first parent overlay that is movable
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay being checked
	 * @returns {sap.ui.dt.Overlay} - First parent overlay that is movable or undefined
	 */
	OverlayUtil.getFirstMovableParentOverlay = function(oElementOverlay) {
		function findMovableParentOverlay(oOverlay) {
			if (oOverlay.isMovable()) {
				return oOverlay;
			}
			if (!oOverlay.getParentElementOverlay()) {
				return undefined;
			}
			return findMovableParentOverlay(oOverlay.getParentElementOverlay());
		}

		const oFirstParentOverlay = oElementOverlay.getParentElementOverlay();
		if (oFirstParentOverlay) {
			return findMovableParentOverlay(oFirstParentOverlay);
		}
		return undefined;
	};

	function checkIfOverlayCanBeRemoved(oOverlay, oDesignTime) {
		if (oOverlay) {
			const oRemovePlugin = oDesignTime?.getPlugins()?.find(function(oPlugin) {
				return oPlugin.isA("sap.ui.rta.plugin.Remove");
			});
			if (!oRemovePlugin) {
				return false;
			}
			const oAction = oRemovePlugin.getAction(oOverlay);
			return !!(oAction?.removeLastElement);
		}
		return false;
	}

	/**
	 * Updates the ability to remove the last element in an aggregation if the second last element is moved or removed.
	 * The removability of the last element is defined by the designtime of the aggregation.
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.core.Element} mPropertyBag.element - The element which is added or removed
	 * @param {sap.ui.core.Element} mPropertyBag.parentElement - The parent element of the element which is added or removed
	 * @param {string} mPropertyBag.aggregationName - The name of the aggregation in which the element is added or removed
	 * @param {string} mPropertyBag.type - The type of the change, either "add" or "remove"
	 * @param {sap.ui.dt.DesignTime} mPropertyBag.designTime - The DesignTime instance
	 */
	OverlayUtil.updateLastElementRemovability = function(mPropertyBag) {
		if (mPropertyBag.element && mPropertyBag.parentElement && mPropertyBag.aggregationName) {
			const aSourceParentAggregationElements = ElementUtil.getAggregation(mPropertyBag.parentElement, mPropertyBag.aggregationName);
			const aVisibleSourceParentAggregationElements = aSourceParentAggregationElements?.filter(
				(oSourceParentAggregationElement) => {
					const oElementOverlay = OverlayRegistry.getOverlay(oSourceParentAggregationElement);
					return oElementOverlay?.getElementVisibility?.() === true
						&& oSourceParentAggregationElement.getId() !== mPropertyBag.element?.getId();
				}
			);
			if (aVisibleSourceParentAggregationElements?.length === 1) {
				const oLastElement = aVisibleSourceParentAggregationElements[0];
				const oLastElementOverlay = OverlayRegistry.getOverlay(oLastElement);
				const oParentAggregationOverlay = oLastElementOverlay?.getParentAggregationOverlay();
				const bCanBeRemoved = mPropertyBag.type === "remove"
					? checkIfOverlayCanBeRemoved(oParentAggregationOverlay, mPropertyBag.designTime)
					: true;
				oLastElementOverlay?.setLastElementMovable(bCanBeRemoved);
			}
		}
	};

	/**
	 * Checks if the given overlay is the last visible element in the aggregation and if it can be removed
	 * called by the MOVE action. The removability of the last element in the aggregation can be defined by the parameter
	 * 'removeLastElement' in the designtime of the aggregation.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Selected overlay to be checked
	 * @param {sap.ui.dt.DesignTime} oDesignTime - DesignTime instance
	 * @returns {boolean} <code>true</code> if the given overlay is the last visible element in the aggregation and can be removed, otherwise <code>false</code>
	 */
	OverlayUtil.canBeRemovedFromAggregationOnMove = function(oElementOverlay, oDesignTime) {
		const oElement = oElementOverlay.getElement();
		const oParent = oElement?.getParent();
		if (!oParent) {
			return false;
		}
		const aSourceParentAggregationElements = ElementUtil.getAggregation(
			oParent,
			oElement.sParentAggregationName
		);
		const aVisibleSourceParentAggregationElements = aSourceParentAggregationElements?.filter(
			(oSourceParentAggregationElement) => oSourceParentAggregationElement.getVisible?.() === true
		);
		if (aVisibleSourceParentAggregationElements?.length === 1) {
			const oLastElement = aVisibleSourceParentAggregationElements[0];
			const oLastElementOverlay = OverlayRegistry.getOverlay(oLastElement);
			const oParentAggregationOverlay = oLastElementOverlay?.getParentAggregationOverlay();
			return checkIfOverlayCanBeRemoved(oParentAggregationOverlay, oDesignTime);
		}
		return true;
	};

	/**
	 * Checks if the given element overlays can be removed from their parent aggregation called by the REMOVED action.
	 * The removability of the last element in the aggregation can be defined by the parameter
	 * 'removeLastElement' in the designtime of the aggregation.
	 *
	 * @param {sap.ui.dt.ElementOverlay[]} aElementOverlays - Overlays to be removed from aggregation
	 * @param {sap.ui.dt.DesignTime} oDesignTime - DesignTime instance
	 * @return {boolean} Returns true if the controls can be removed
	 * @private
	 */
	OverlayUtil.canBeRemovedFromAggregationOnRemove = function(aElementOverlays, oDesignTime) {
		const oOverlay = aElementOverlays[0];
		const oElement = oOverlay.getElement();
		const oParent = oElement.getParent();
		if (!oParent) {
			return false;
		}
		const aElements = oParent.getAggregation(oElement.sParentAggregationName);
		if (!Array.isArray(aElements)) {
			return true;
		}
		// check if selected Overlays are the last visible elements in aggregation
		const iNumberOfSelectedOverlays = aElementOverlays.length;
		const aInvisibleElements = aElements.filter(function(oElement) {
			const oElementOverlay = OverlayRegistry.getOverlay(oElement);
			return !(oElementOverlay && oElementOverlay.getElementVisibility());
		});
		const bIsLastVisibleElement = (aInvisibleElements.length + iNumberOfSelectedOverlays === aElements.length);
		if (bIsLastVisibleElement) {
			const oParentAggregationOverlay = oOverlay?.getParentAggregationOverlay();
			return checkIfOverlayCanBeRemoved(oParentAggregationOverlay, oDesignTime);
		}
		return true;
	};

	return OverlayUtil;
});