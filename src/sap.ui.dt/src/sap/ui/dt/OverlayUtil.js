/*!
 * ${copyright}
 */

// Provides object sap.ui.dt.OverlayUtil.
sap.ui.define([
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/ElementUtil",
	"sap/ui/core/UIArea"
],
function(
	OverlayRegistry,
	ElementUtil,
	UIArea
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
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var OverlayUtil = {};

	/**
	 * Check if the overlay is in target zone aggregation.
	 * @param  {sap.ui.dt.ElementOverlay}  oElementOverlay The overlay to be checked
	 * @return {boolean}                   Returns true if overlay is in target zone
	 * @private
	 */
	OverlayUtil.isInTargetZoneAggregation = function(oElementOverlay) {
		var oAggregationOverlay = oElementOverlay.getParent();
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
		var oParentOverlay = oElementOverlay.getParentElementOverlay();
		if (oParentOverlay) {
			//calculate index in direct (maybe in hidden tree) parent
			var oParent = oParentOverlay.getElement();
			var sParentAggregationName = oElementOverlay.getParentAggregationOverlay().getAggregationName();
			var aChildren = ElementUtil.getAggregation(oParent, sParentAggregationName);
			var oElement = oElementOverlay.getElement();
			var iIndex = aChildren.indexOf(oElement);

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

		var oParent = oElement;
		var oParentOverlay = OverlayRegistry.getOverlay(oParent);
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
		var minLeft;
		var maxRight;
		var minTop;
		var maxBottom;
		aGeometry.forEach(function(oElementGeometry) {
			if (oElementGeometry && oElementGeometry.visible) {
				if (!minLeft || oElementGeometry.position.left < minLeft) {
					minLeft = oElementGeometry.position.left;
				}
				if (!minTop || oElementGeometry.position.top < minTop) {
					minTop = oElementGeometry.position.top;
				}

				var iRight = oElementGeometry.position.left + oElementGeometry.size.width;
				if (!maxRight || iRight > maxRight) {
					maxRight = iRight;
				}
				var iBottom = oElementGeometry.position.top + oElementGeometry.size.height;
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
		var aChildrenOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
		for (var i = 0, n = aChildrenOverlays.length; i < n; i++) {
			var oChildOverlay = aChildrenOverlays[i];
			if (fnCondition(oChildOverlay)) {
				return oChildOverlay;
			}
			var oDescendantOverlay = this.getFirstDescendantByCondition(oChildOverlay, fnCondition);
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
		var aChildrenOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
		for (var i = aChildrenOverlays.length - 1, n = -1; i > n; i--) {
			var oChildOverlay = aChildrenOverlays[i];
			if (fnCondition(oChildOverlay)) {
				return oChildOverlay;
			}
			var oDescendantOverlay = this.getLastDescendantByCondition(oChildOverlay, fnCondition);
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
		var aChildElementOverlays = [];
		var aChildren = [];
		if (!oElementOverlay) {
			return aChildElementOverlays;
		}
		var aAggregationOverlays = oElementOverlay.getChildren();
		for (var i = 0; i < aAggregationOverlays.length; i++) {
			aChildren = aAggregationOverlays[i].getChildren();
			if (aChildren && aChildren.length > 0) {
				aChildElementOverlays = aChildElementOverlays.concat(aChildren);
			}
		}
		return aChildElementOverlays;
	};

	/**
	 * Returns first child overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Returns the first child overlay
	 * @private
	 */
	OverlayUtil.getFirstChildOverlay = function(oOverlay) {
		var aChildren = this.getAllChildOverlays(oOverlay);
		if (aChildren.length) {
			return aChildren[0];
		}
		return undefined;
	};

	/**
	 * Returns last child overlay.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oOverlay - Source overlay object
	 * @returns {sap.ui.dt.ElementOverlay} Returns the last child overlay
	 * @private
	 */
	OverlayUtil.getLastChildOverlay = function(oOverlay) {
		var aChildren = this.getAllChildOverlays(oOverlay);
		if (aChildren.length) {
			return aChildren[aChildren.length - 1];
		}
		return undefined;
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

		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			var aAggregationOverlays = oParentAggregationOverlay.getChildren();
			var iIndex = aAggregationOverlays.indexOf(oOverlay);
			// get next sibling in the same aggregation
			if (iIndex !== aAggregationOverlays.length - 1) {
				return aAggregationOverlays[iIndex + 1];
			} else if (iIndex === aAggregationOverlays.length - 1) {
				// get next sibling from next aggregation in the same parent
				var oParent = oOverlay.getParentElementOverlay();
				aAggregationOverlays = oParent.getAggregationOverlays();
				for (iIndex = aAggregationOverlays.indexOf(oParentAggregationOverlay) + 1; iIndex < aAggregationOverlays.length; iIndex++) {
					var aOverlays = aAggregationOverlays[iIndex].getChildren();
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

		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			var aAggregationOverlays = oParentAggregationOverlay.getChildren();
			var iIndex = aAggregationOverlays.indexOf(oOverlay);
			// get previous sibling from the same aggregation
			if (iIndex > 0) {
				return aAggregationOverlays[iIndex - 1];
			} else if (iIndex === 0) {
				// get previous sibling from previous aggregation in the same parent
				var oParent = oOverlay.getParentElementOverlay();
				aAggregationOverlays = oParent.getAggregationOverlays();
				for (iIndex = aAggregationOverlays.indexOf(oParentAggregationOverlay) - 1; iIndex >= 0; iIndex--) {
					var aOverlays = aAggregationOverlays[iIndex].getChildren();
					if (aOverlays.length) {
						return aOverlays[aOverlays.length - 1];
					}
				}
			}
		}
	};

	/**
	 * Get next overlay (look first in children, then next siblings).
	 * @param  {sap.ui.dt.Overlay} oOverlay The source overlay
	 * @return {sap.ui.dt.Overlay} Returns the overlay that was found first
	 * @private
	 */
	OverlayUtil.getNextOverlay = function(oOverlay) {
		if (!oOverlay) {
			return undefined;
		}

		var oFirstChildOverlay = this.getFirstChildOverlay(oOverlay);
		if (oFirstChildOverlay) {
			return oFirstChildOverlay;
		}

		var oNextSiblingOverlay = this.getNextSiblingOverlay(oOverlay);
		if (oNextSiblingOverlay) {
			return oNextSiblingOverlay;
		}

		do {
			oOverlay = oOverlay.getParentElementOverlay();
			oNextSiblingOverlay = this.getNextSiblingOverlay(oOverlay);
		} while (oOverlay && !oNextSiblingOverlay);

		return oNextSiblingOverlay;
	};

	/**
	 * Get next overlay (look first in parent, then previous siblings).
	 * @param  {sap.ui.dt.Overlay} oOverlay The source overlay
	 * @return {sap.ui.dt.Overlay} Returns the overlay that was found first
	 */
	OverlayUtil.getPreviousOverlay = function(oOverlay) {
		if (!oOverlay) {
			return undefined;
		}

		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (!oParentAggregationOverlay) {
			return undefined;
		}

		var oPreviousSiblingOverlay = this.getPreviousSiblingOverlay(oOverlay);
		if (oPreviousSiblingOverlay) {
			var oLastChildOverlay = oPreviousSiblingOverlay;
			do {
				oPreviousSiblingOverlay = oLastChildOverlay;
				oLastChildOverlay = this.getLastChildOverlay(oPreviousSiblingOverlay);
			} while (oLastChildOverlay);

			return oPreviousSiblingOverlay;
		}

		return oOverlay.getParentElementOverlay();
	};

	/**
	 * Applies a function to every element in an overlay's element tree.
	 * @param  {sap.ui.dt.ElementOverlay} oElementOverlay The source overlay
	 * @param  {function} fnCallback The function to be applied
	 * @private
	 */
	OverlayUtil.iterateOverlayElementTree = function(oElementOverlay, fnCallback) {
		fnCallback(oElementOverlay);

		oElementOverlay.getAggregationOverlays().forEach(function(oAggregationOverlay) {
			oAggregationOverlay.getChildren().forEach(function(oChildOverlay) {
				this.iterateOverlayElementTree(oChildOverlay, fnCallback);
			}, this);
		}, this);
	};

	/**
	 * Returns the closest overlay to a given node.
	 * @param  {HTMLElement} oNode The source node
	 * @return {sap.ui.dt.Overlay} Returns the closest overlay
	 * @private
	 */
	OverlayUtil.getClosestOverlayForNode = function(oNode) {
		var oElement = ElementUtil.getClosestElementForNode(oNode);
		return OverlayUtil.getClosestOverlayFor(oElement);
	};

	/**
	 * Returns all the sibling overlays in a container. It checks recursively for every overlay belonging
	 * to the same relevant container in the tree which has DesignTime Metadata.
	 * @param  {sap.ui.dt.Overlay} oOverlay                  Overlay for which we want to find the siblings
	 * @param  {sap.ui.dt.Overlay} oRelevantContainerOverlay Relevant container of the overlay
	 * @return {sap.ui.dt.Overlay[]}                         Returns a flat array with all sibling overlays
	 */
	OverlayUtil.findAllSiblingOverlaysInContainer = function(oOverlay, oRelevantContainerOverlay) {
		var oParentOverlay = oOverlay.getParentElementOverlay();
		var aRelevantOverlays = [];

		if (oParentOverlay) {
			if (oParentOverlay !== oRelevantContainerOverlay) {
				var aParents = OverlayUtil.findAllSiblingOverlaysInContainer(oParentOverlay, oRelevantContainerOverlay);
				aRelevantOverlays = aParents.map(function(oParentOverlay) {
					var oAggregationOverlay = oParentOverlay.getAggregationOverlay(oOverlay.getParentAggregationOverlay().getAggregationName());
					return oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
				}).reduce(function(aFlattenedArray, oCurrentValue) {
					return aFlattenedArray.concat(oCurrentValue);
				}, []);
			} else {
				var sAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
				var oAggregationOverlay = oParentOverlay.getAggregationOverlay(sAggregationName);
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
		var oRelevantContainer = oOverlay.getRelevantContainer() || oOverlay.getElement();
		var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		var aRelevantOverlays = [];

		// Overlay might be destroyed in the meantime
		if (!oRelevantContainerOverlay) {
			return aRelevantOverlays;
		}

		// Get all the siblings and parents of the overlay
		var mRelevantOverlays = OverlayUtil._findAllSiblingsAndParents(oOverlay, oRelevantContainerOverlay, 0, bIncludeOtherAggregations);

		if (mRelevantOverlays[0]) {
			for (var iLevel in mRelevantOverlays) {
				aRelevantOverlays = aRelevantOverlays.concat(mRelevantOverlays[iLevel]);
			}

			var aChildren = [];
			var aOverlaysToGetChildrenFrom = bIncludeOtherAggregations ? aRelevantOverlays : mRelevantOverlays[0];

			aOverlaysToGetChildrenFrom.forEach(function(oOverlay) {
				aChildren = aChildren.concat(OverlayUtil._findAllChildrenInContainer(oOverlay, oRelevantContainer));
			});

			aRelevantOverlays = aRelevantOverlays.concat(aChildren);
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
		var oParentOverlay = oOverlay.getParentElementOverlay();
		if (!oParentOverlay) {
			return [];
		}

		function getChildrenFromAllAggregations(oParentOverlay) {
			var aAllAggregationNames = oParentOverlay.getAggregationNames();
			var aAllAggregationChildren = [];

			// Collect children from all aggregations of the parent
			aAllAggregationNames.forEach(function(sAggregationName) {
				var oAggregationOverlay = oParentOverlay.getAggregationOverlay(sAggregationName);
				var aAggregationChildren = oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
				aAllAggregationChildren = aAggregationChildren.concat(aAllAggregationChildren);
			});

			return aAllAggregationChildren;
		}

		if (oParentOverlay !== oRelevantContainerOverlay) {
			var mParents;
			var aOverlays;
			mParents = OverlayUtil._findAllSiblingsAndParents(oParentOverlay, oRelevantContainerOverlay, iLevel + 1, bIncludeOtherAggregations);
			if (bIncludeOtherAggregations) {
				var aAllAggregationChildren = [];
				mParents[iLevel + 1].forEach(function(oParent) {
					aAllAggregationChildren.concat(getChildrenFromAllAggregations(oParent));
				});
				mParents[iLevel] = aAllAggregationChildren;
				return mParents;
			}
			aOverlays = mParents[iLevel + 1].map(function(oParent) {
				var sParentAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
				var oAggregationOverlay = oParent.getAggregationOverlay(sParentAggregationName);
				return oAggregationOverlay ? oAggregationOverlay.getChildren() : [];
			}).reduce(function(a, b) {
				return a.concat(b);
			}, []);
			mParents[iLevel] = aOverlays;
			return mParents;
		}

		var aChildren = [];

		if (bIncludeOtherAggregations) {
			aChildren = getChildrenFromAllAggregations(oParentOverlay);
		} else {
			var sParentAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();
			aChildren = oOverlay.getParentElementOverlay().getAggregationOverlay(sParentAggregationName).getChildren();
		}
		var mReturn = {};
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
		_aRelevantOverlays = _aRelevantOverlays || [];
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
		var aOverlays = OverlayUtil.findAllSiblingOverlaysInContainer(oOverlay, oRelevantContainerOverlay);
		return aOverlays.map(function(oOverlay) {
			return oOverlay.getParentAggregationOverlay();
		}).filter(function(oOverlay, iPosition, aAggregationOverlays) {
			return aAggregationOverlays.indexOf(oOverlay) === iPosition;
		});
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
		var aElements = ElementUtil.getAggregation(oParent, sAggregationName).filter(function(oCompareElement) {
			return !!OverlayRegistry.getOverlay(oCompareElement) || oCompareElement === oElement;
		});
		return aElements.indexOf(oElement);
	};

	function findBoundControl(oOverlay, aStack) {
		var sAggregationName;
		var iIndex;
		var oParentOverlay = oOverlay.getParent();
		var bBoundControlFound = false;

		if (oOverlay.isA("sap.ui.dt.ElementOverlay")) {
			var oParentElementOverlay = oOverlay.getParentElementOverlay();

			if (oParentOverlay) {
				sAggregationName = oParentOverlay.getAggregationName();
				iIndex = oParentOverlay.getChildren().indexOf(oOverlay);
				bBoundControlFound = oParentElementOverlay
					&& oParentElementOverlay.getAggregationOverlay(sAggregationName, "AggregationBindingTemplateOverlays");
			} else {
				iIndex = -1;
			}

			aStack.push({
				overlayId: oOverlay.getId(),
				aggregation: sAggregationName,
				index: iIndex
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
	 * Returns all parent overlays that have scrollbars (with scrollbar synchronizers) on the tree
	 * @param {sap.ui.dt.ElementOverlay} oElementOverlay - Overlay being checked
	 * @returns {sap.ui.dt.Overlay[]} - Array with all parent overlays containing scrollbars
	 */
	OverlayUtil.findParentOverlaysWithScrollbar = function(oElementOverlay) {
		var aOverlaysWithScrollbar = [];
		function findParentsWithScrollbar(oOverlay) {
			if (oOverlay._oScrollbarSynchronizers.size > 0) {
				aOverlaysWithScrollbar.push(oOverlay);
			}
			if (!oOverlay.getParent()) {
				return aOverlaysWithScrollbar;
			}
			return findParentsWithScrollbar(oOverlay.getParent());
		}

		return findParentsWithScrollbar(oElementOverlay);
	};

	return OverlayUtil;
}, /* bExport= */true);