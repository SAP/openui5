/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_debounce",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/rta/plugin/Plugin"
], function(
	_debounce,
	OverlayRegistry,
	OverlayUtil,
	Plugin
) {
	"use strict";

	/**
	 * Constructor for a new Stretch plugin.
	 *
	 * @param {string} [sId] - Id for the new object, generated automatically if no Id is given
	 * @param {object} [mSettings] - Initial settings for the new object
	 *
	 * @class
	 * The Stretch plugin adds functionality/styling required for RTA.
	 * @extends sap.ui.rta.plugin.Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.60
	 * @alias sap.ui.rta.plugin.Stretch
	 */
	const Stretch = Plugin.extend("sap.ui.rta.plugin.Stretch", /** @lends sap.ui.rta.plugin.Stretch.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			associations: {
				/**
				 * Stores all candidates for stretching
				 */
				stretchCandidates: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	Stretch.STRETCHSTYLECLASS = "sapUiRtaStretchPaddingTop";

	function startAtSamePosition(oParentOverlay, oOverlay) {
		return (
			oParentOverlay?.getGeometry() && oOverlay?.getGeometry()
			&& oParentOverlay.getGeometry().position.top === oOverlay.getGeometry().position.top
			&& oParentOverlay.getGeometry().position.left === oOverlay.getGeometry().position.left
		);
	}

	function toggleStyleClass(oOverlay, bAddClass) {
		const oElement = oOverlay.getElement();
		if (oElement.addStyleClass && oElement.removeStyleClass) {
			if (bAddClass) {
				oElement.addStyleClass(Stretch.STRETCHSTYLECLASS);
			} else {
				oElement.removeStyleClass(Stretch.STRETCHSTYLECLASS);
			}
		} else {
			const vElementDomRef = oOverlay.getAssociatedDomRef();
			if (vElementDomRef) {
				const aElementDomRef = Array.isArray(vElementDomRef) ? vElementDomRef : [vElementDomRef];
				if (bAddClass) {
					aElementDomRef.forEach((oElementDomRef) => oElementDomRef.classList.add(Stretch.STRETCHSTYLECLASS));
				} else {
					aElementDomRef.forEach((oElementDomRef) => oElementDomRef.classList.remove(Stretch.STRETCHSTYLECLASS));
				}
			}
		}
	}

	/**
	 * Check if the size of an overlay is the same as an array of overlays.
	 * If no array is passed to the function the children of the reference overlay are used.
	 * If the control is already stretched we need to remove the padding that we add
	 *
	 * @param {sap.ui.dt.ElementOverlay} oReferenceOverlay - Overlay object
	 * @param {sap.ui.dt.ElementOverlay[]} [aChildOverlays] - Array of overlay objects that should be checked
	 * @param {boolean} [bIsAlreadyStretched] - Indicator if the control is already stretched
	 * @returns {boolean} <code>true</code> if the overlay has the same size as all the children
	 */
	function childrenAreSameSize(oReferenceOverlay, aChildOverlays, bIsAlreadyStretched) {
		const oParentGeometry = oReferenceOverlay.getGeometry();

		if (!oParentGeometry) {
			return false;
		}

		// remove padding if it is already stretched
		let iHeight = oParentGeometry.size.height;
		if (bIsAlreadyStretched) {
			iHeight -= parseInt(window.getComputedStyle(oParentGeometry.domRef, null).getPropertyValue("padding-top"));
		}
		const iParentSize = Math.round(oParentGeometry.size.width) * Math.round(iHeight);
		aChildOverlays ||= OverlayUtil.getAllChildOverlays(oReferenceOverlay);

		const aChildrenGeometry = aChildOverlays.map(function(oChildOverlay) {
			return oChildOverlay.getGeometry();
		});

		const oChildrenGeometry = OverlayUtil.getGeometry(aChildrenGeometry);

		if (!oChildrenGeometry) {
			return false;
		}

		const iChildrenSize = Math.round(oChildrenGeometry.size.width) * Math.round(oChildrenGeometry.size.height);
		return iChildrenSize === iParentSize;
	}

	/**
	 * Checks all the descendants for an editable child. Stops as soon as an editable is found
	 * or the children don't have the same size anymore.
	 *
	 * @param {sap.ui.dt.ElementOverlay} oReferenceOverlay - Overlay object
	 * @param {sap.ui.dt.ElementOverlay[]} aChildOverlays - Array of child overlay objects
	 * @returns {boolean} <code>true</code> if there is an editable descendant
	 */
	function atLeastOneDescendantEditable(oReferenceOverlay, aChildOverlays) {
		const bAtLeastOneChildEditable = aChildOverlays.some(function(oOverlay) {
			return oOverlay.getEditable() && oOverlay.getGeometry();
		});

		if (bAtLeastOneChildEditable) {
			return true;
		}

		let aChildrensChildrenOverlays = [];
		aChildOverlays.forEach(function(oChildOverlay) {
			aChildrensChildrenOverlays = aChildrensChildrenOverlays.concat(OverlayUtil.getAllChildOverlays(oChildOverlay));
		});

		if (!aChildrensChildrenOverlays.length) {
			return false;
		}
		if (childrenAreSameSize(oReferenceOverlay, aChildrensChildrenOverlays)) {
			return atLeastOneDescendantEditable(oReferenceOverlay, aChildrensChildrenOverlays);
		}
		return false;
	}

	/**
	 * Override for DesignTime setter to attach to synced event
	 *
	 * @param {sap.ui.dt.DesignTime} oDesignTime - DesignTime instance
	 * @override
	 */
	Stretch.prototype.setDesignTime = function(...aArgs) {
		const [oDesignTime] = aArgs;
		Plugin.prototype.setDesignTime.apply(this, aArgs);

		if (oDesignTime) {
			oDesignTime.attachEventOnce("synced", this._onDTSynced, this);
		}
	};

	Stretch.prototype.exit = function() {
		if (this.getDesignTime()) {
			this.getDesignTime().detachEvent("elementOverlayAdded", this._onElementOverlayChanged);
			this.getDesignTime().detachEvent("elementOverlayMoved", this._onElementOverlayChanged);
			this.getDesignTime().detachEvent("elementPropertyChanged", this._onElementPropertyChanged);
			this.getDesignTime().detachEvent("elementOverlayEditableChanged", this._onElementOverlayEditableChanged);
			this.getDesignTime().detachEvent("elementOverlayDestroyed", this._onElementOverlayDestroyed);
		}
	};

	Stretch.prototype.addStretchCandidate = function(oOverlay) {
		const oElement = oOverlay.getElement();
		if (!this.getStretchCandidates().includes(oElement.getId())) {
			this.addAssociation("stretchCandidates", oElement);
		}
	};

	Stretch.prototype.removeStretchCandidate = function(oOverlay) {
		this.removeAssociation("stretchCandidates", oOverlay.getElement());
		toggleStyleClass(oOverlay, false);
	};

	/**
	 * @override
	 */
	Stretch.prototype.registerElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		this._checkParentAndAddToStretchCandidates(oOverlay);

		oOverlay.attachElementModified(this._onElementModified, this);

		Plugin.prototype.registerElementOverlay.apply(this, aArgs);
	};

	/**
	 * Additionally to super->deregisterOverlay this method removes the Style-class
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay - Overlay object
	 * @override
	 */
	Stretch.prototype.deregisterElementOverlay = function(...aArgs) {
		const [oOverlay] = aArgs;
		toggleStyleClass(oOverlay, false);

		Plugin.prototype.deregisterElementOverlay.apply(this, aArgs);
	};

	/**
	 * This plugin does not make any overlay editable
	 * @override
	 */
	Stretch.prototype._isEditable = function() {
		return false;
	};

	Stretch.prototype._onDTSynced = function() {
		this._setStyleClassForAllStretchCandidates();

		this.getDesignTime().attachEvent("elementOverlayAdded", this._onElementOverlayChanged, this);
		this.getDesignTime().attachEvent("elementOverlayMoved", this._onElementOverlayChanged, this);
		this.getDesignTime().attachEvent("elementPropertyChanged", this._onElementPropertyChanged, this);
		this.getDesignTime().attachEvent("elementOverlayEditableChanged", this._onElementOverlayEditableChanged, this);
		this.getDesignTime().attachEvent("elementOverlayDestroyed", this._onElementOverlayDestroyed, this);
	};

	Stretch.prototype._onElementModified = function(oEvent) {
		if (this.getDesignTime().getBusyPlugins().length) {
			return;
		}

		const oParams = oEvent.getParameters();
		const oOverlay = oEvent.getSource();
		if (oParams.type === "afterRendering") {
			// the timeout should be changed to 0 as soon as DT refactoring is done
			this.fnDebounced ||= _debounce(function() {
				this._setStyleClassForAllStretchCandidates(this._getNewStretchCandidates(this._aOverlaysCollected));
				this._aOverlaysCollected = [];
				this.fnDebounced = undefined;
			}.bind(this), 16);

			this._aOverlaysCollected ||= [];

			if (!this._aOverlaysCollected.includes(oOverlay)) {
				this._aOverlaysCollected.push(oOverlay);
				this.fnDebounced();
			}
		}
	};

	Stretch.prototype._onElementOverlayDestroyed = function(oEvent) {
		if (this.getDesignTime().getBusyPlugins().length) {
			return;
		}

		let aNewStretchCandidates = [];
		const oParentOverlay = oEvent.getParameters().elementOverlay.getParentElementOverlay();
		if (oParentOverlay && !oParentOverlay._bIsBeingDestroyed) {
			const aRelevantElements = this._getRelevantOverlays(oParentOverlay)
			.filter(function(oOverlay) {
				// Exclude overlays that are already being torn down in the same destroy cascade:
				// they still return an element here but are no longer in the OverlayRegistry, so
				// resolving their id later would yield undefined.
				return oOverlay.getElement() && !oOverlay.bIsDestroyed && !oOverlay._bIsBeingDestroyed;
			});
			aNewStretchCandidates = this._getNewStretchCandidates(aRelevantElements);
		}

		this._setStyleClassForAllStretchCandidates(aNewStretchCandidates);
	};

	/**
	 * When editable changes on an overlay, all parent-overlays and the overlay itself,
	 * who are already stretch candidates, have to be reevaluated
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 */
	Stretch.prototype._onElementOverlayEditableChanged = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.getParameters().id);
		if (this.getDesignTime().getBusyPlugins().length || !oOverlay) {
			return;
		}

		const aOverlaysToReevaluate = this._getRelevantOverlaysOnEditableChange(oOverlay);
		this._setStyleClassForAllStretchCandidates(aOverlaysToReevaluate);
	};

	Stretch.prototype._onElementPropertyChanged = function(oEvent) {
		const oOverlay = OverlayRegistry.getOverlay(oEvent.getParameters().id);
		if (this.getDesignTime().getBusyPlugins().length || !oOverlay) {
			return;
		}

		const aRelevantOverlays = this._getRelevantOverlays(oOverlay);
		const fnDebounced = _debounce(() => {
			if (!this.bIsDestroyed && !oOverlay.bIsDestroyed) {
				let aNewStretchCandidates =
					this._getNewStretchCandidates(aRelevantOverlays)
					.concat(this._getRelevantOverlaysOnEditableChange(oOverlay));
				aNewStretchCandidates = aNewStretchCandidates.filter((sId, iPosition, aAllCandidates) => {
					return aAllCandidates.indexOf(sId) === iPosition;
				});
				this._setStyleClassForAllStretchCandidates(aNewStretchCandidates);
			}
		});

		aRelevantOverlays.forEach((oOverlay) => {
			oOverlay.attachEventOnce("geometryChanged", fnDebounced);
		});
	};

	Stretch.prototype._onElementOverlayChanged = function(oEvent) {
		// overlay might be destroyed until this event listener is called - BCP: 1980286428
		const oOverlay = OverlayRegistry.getOverlay(oEvent.getParameters().id);
		if (this.getDesignTime().getBusyPlugins().length || !oOverlay) {
			return;
		}

		const aRelevantOverlays = this._getRelevantOverlays(oOverlay);
		const aNewStretchCandidates = this._getNewStretchCandidates(aRelevantOverlays);
		this._setStyleClassForAllStretchCandidates(aNewStretchCandidates);
	};

	Stretch.prototype._getRelevantOverlaysOnEditableChange = function(oOverlay) {
		const aRelevantElements = this.getStretchCandidates().includes(oOverlay.getElement().getId()) ? [oOverlay.getElement().getId()] : [];
		const oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (!oParentAggregationOverlay) {
			return aRelevantElements;
		}

		// if there are siblings that are editable and visible, the change has no effect on the parents
		const aOnlySiblings = oParentAggregationOverlay.getChildren();
		aOnlySiblings.splice(aOnlySiblings.indexOf(oOverlay), 1);
		const bAnySiblingAlreadyEditable = aOnlySiblings.some(function(oOverlay) {
			return oOverlay.getEditable() && oOverlay.getGeometry();
		});

		if (bAnySiblingAlreadyEditable) {
			return aRelevantElements;
		}

		return aRelevantElements.concat(this._getRelevantParents(oOverlay));
	};

	Stretch.prototype._getRelevantParents = function(oOverlay) {
		const aReturn = [];

		// add all parents who are stretch candidates, but stop after 25 parents
		for (let i = 0; i < 25; i++) {
			oOverlay = oOverlay.getParentElementOverlay();
			if (!oOverlay) {
				return aReturn;
			}

			if (!this.getStretchCandidates().includes(oOverlay.getElement().getId())) {
				return aReturn;
			}

			aReturn.push(oOverlay.getElement().getId());
		}
		return aReturn;
	};

	Stretch.prototype._getNewStretchCandidates = function(aOverlays) {
		const aNewStretchCandidates = [];
		aOverlays.forEach((oOverlay) => {
			if (this._reevaluateStretching(oOverlay)) {
				aNewStretchCandidates.push(oOverlay.getElement().getId());
			}
		});

		return aNewStretchCandidates;
	};

	Stretch.prototype._reevaluateStretching = function(oOverlay) {
		if (!oOverlay.bIsDestroyed) {
			const oElementDomRef = Array.isArray(oOverlay.getAssociatedDomRef())
				? oOverlay.getAssociatedDomRef()[0]
				: oOverlay.getAssociatedDomRef();
			if (oElementDomRef) {
				const bIsStretched = oElementDomRef.classList.contains(Stretch.STRETCHSTYLECLASS);
				const bShouldBeStretched = childrenAreSameSize(oOverlay, undefined, bIsStretched);
				if (bIsStretched && !bShouldBeStretched) {
					this.removeStretchCandidate(oOverlay);
				} else if (!bIsStretched && bShouldBeStretched) {
					this.addStretchCandidate(oOverlay);
					return true;
				}
			}
		}
		return false;
	};

	Stretch.prototype._checkParentAndAddToStretchCandidates = function(oOverlay) {
		const oParentOverlay = oOverlay.getParentElementOverlay();
		const oParentElementDOM = oParentOverlay?.getAssociatedDomRef();
		if (oParentElementDOM) {
			// Skip DOM-passthrough wrappers (e.g. ActionToolbarAction): same DOM ref means the parent
			// has no own DOM, so adding padding-top to it would break the child element's layout.
			// Controls with multiple DOM refs (arrays) are never passthrough wrappers.
			const oChildElementDOM = oOverlay.getAssociatedDomRef();
			const bSameDOM = !Array.isArray(oParentElementDOM) && !Array.isArray(oChildElementDOM)
				&& oParentElementDOM === oChildElementDOM;
			if (!bSameDOM && startAtSamePosition(oParentOverlay, oOverlay)) {
				if (childrenAreSameSize(oParentOverlay)) {
					this.addStretchCandidate(oParentOverlay);
				}
			}
		}
	};

	/**
	 * Check editable and set the Style-class for padding on the given Elements.
	 * When no array is given all the stretch candidates are evaluated
	 *
	 * @param {sap.ui.core.Control[]} [aStretchCandidates] - Array of Ids of stretch candidates
	 * @private
	 */
	Stretch.prototype._setStyleClassForAllStretchCandidates = function(aStretchCandidates) {
		if (!Array.isArray(aStretchCandidates)) {
			aStretchCandidates = this.getStretchCandidates();
		}
		aStretchCandidates.forEach((sElementId) => {
			const oOverlay = OverlayRegistry.getOverlay(sElementId);
			// The overlay might already be destroyed by the time this runs, e.g. when a candidate id
			// stems from a sibling overlay that is torn down in the same synchronous destroy cascade.
			if (!oOverlay) {
				return;
			}
			const aChildOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
			const bAddClass = oOverlay.getEditable() && atLeastOneDescendantEditable(oOverlay, aChildOverlays);

			toggleStyleClass(oOverlay, bAddClass);
		});
	};

	return Stretch;
});