/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.Stretch.
sap.ui.define([
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/core/Control"
],
function(
	Plugin,
	OverlayUtil,
	Control
) {
	"use strict";

	/**
	 * Constructor for a new Stretch plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Stretch plugin adds functionality/styling required for RTA.
	 * @extends sap.ui.rta.plugin.Stretch
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.60
	 * @alias sap.ui.rta.plugin.Stretch
	 * @experimental Since 1.60. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var Stretch = Plugin.extend("sap.ui.rta.plugin.Stretch", /** @lends sap.ui.rta.plugin.Stretch.prototype */ {
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {},
			associations: {
				/**
				 * Stores all candidates for stretching
				 */
				stretchCandidates: {
					type: "sap.ui.dt.ElementOverlay",
					multiple: true
				}
			},
			events: {}
		}
	});

	/**
	 * Override for DesignTime setter to attach to synced event
	 *
	 * @param {sap.ui.dt.DesignTime} oDesignTime DesignTime object
	 * @override
	 */
	Stretch.prototype.setDesignTime = function(oDesignTime) {
		Plugin.prototype.setDesignTime.apply(this, arguments);

		if (oDesignTime) {
			oDesignTime.attachEventOnce("synced", this._setStyleClassForAllStretchCandidates, this);
		}
	};

	/**
	 * @override
	 */
	Stretch.prototype.registerElementOverlay = function(oOverlay) {
		this._checkAndAddToStretchCandidates(oOverlay);

		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Additionally to super->deregisterOverlay this method removes the Style-class
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @override
	 */
	Stretch.prototype.deregisterElementOverlay = function(oOverlay) {
		if (oOverlay.getElement() instanceof Control){
			oOverlay.getElement().removeStyleClass("sapUiRtaStretchPaddingTop");
		}
		oOverlay.detachEditableChange(this._toggleStyleClass, this);
	};

	/**
	 * This plugin does not make any overlay editable
	 * @override
	 */
	Stretch.prototype._isEditable = function() {
		return false;
	};

	Stretch.prototype._checkAndAddToStretchCandidates = function(oOverlay) {
		var oParentOverlay = oOverlay.getParentElementOverlay();
		if (oParentOverlay && oParentOverlay.getElement() instanceof Control) {
			if (this._startAtSamePosition(oParentOverlay, oOverlay)) {
				if (this._childrenAreSameSize(oParentOverlay)) {
					this.addStretchCandidate(oParentOverlay);
				}
			}
		}
	};

	Stretch.prototype._startAtSamePosition = function(oParentOverlay, oOverlay) {
		if (oParentOverlay && oParentOverlay.getGeometry() && oOverlay.getGeometry()) {
			if (
				oParentOverlay.getGeometry().position.top === oOverlay.getGeometry().position.top &&
				oParentOverlay.getGeometry().position.left === oOverlay.getGeometry().position.left
			) {
				return true;
			}
		}
	};

	/**
	 * Check if the size of the parent is same as the size of his children
	 * @param {sap.ui.dt.ElementOverlay} oReferenceOverlay overlay object
	 * @param {sap.ui.dt.ElementOverlay[]} aChildOverlays array of overlay objects that should be checked
	 * @returns {boolean} Returns true if the overlay has the same size as all the children
	 * @private
	 */
	Stretch.prototype._childrenAreSameSize = function(oReferenceOverlay, aChildOverlays) {
		var iParentSize = oReferenceOverlay.getGeometry().size.width * oReferenceOverlay.getGeometry().size.height;
		aChildOverlays = aChildOverlays || OverlayUtil.getAllChildOverlays(oReferenceOverlay);

		var aChildrenGeometry = aChildOverlays.map(function(oChildOverlay){
			return oChildOverlay.getGeometry();
		});

		var oChildrenGeometry = OverlayUtil.getGeometry(aChildrenGeometry);
		var iChildrenSize = oChildrenGeometry.size.width * oChildrenGeometry.size.height;

		return iChildrenSize === iParentSize;
	};

	Stretch.prototype._atLeastOneDescendantEditable = function(oReferenceOverlay, aChildOverlays) {
		var bAtLeastOneChildEditable = aChildOverlays.some(function(oOverlay) {
			return oOverlay.getEditable() && oOverlay.getGeometry();
		});

		if (bAtLeastOneChildEditable) {
			return true;
		} else {
			var aChildrensChildrenOverlays = [];
			aChildOverlays.forEach(function(oChildOverlay) {
				aChildrensChildrenOverlays = aChildrensChildrenOverlays.concat(OverlayUtil.getAllChildOverlays(oChildOverlay));
			});

			if (!aChildrensChildrenOverlays.length > 0) {
				return false;
			}
			if (this._childrenAreSameSize(oReferenceOverlay, aChildrensChildrenOverlays)) {
				return this._atLeastOneDescendantEditable(oReferenceOverlay, aChildrensChildrenOverlays);
			}
		}
	};

	/**
	 * Set the Style-class for padding on found Elements
	 * @private
	 */
	Stretch.prototype._setStyleClassForAllStretchCandidates = function() {
		this.getStretchCandidates().forEach(function(sOverlayId){
			var oOverlay = sap.ui.getCore().byId(sOverlayId);
			var bAddClass = false;
			var aChildOverlays = OverlayUtil.getAllChildOverlays(oOverlay);
			var bAtLeastOneChildEditable = this._atLeastOneDescendantEditable(oOverlay, aChildOverlays);

			if (oOverlay.getEditable() && bAtLeastOneChildEditable) {
				bAddClass = true;
			}

			if (bAddClass) {
				this._toggleStyleClass({}, true, oOverlay);
			}
			oOverlay.attachEditableChange(this._toggleStyleClass, this);
		}, this);
	};

	Stretch.prototype._toggleStyleClass = function(mParams, bForce, oOverlay) {
		oOverlay = oOverlay || mParams.getSource();
		if (bForce ||  mParams.getParameters().editable) {
			oOverlay.getElement().addStyleClass("sapUiRtaStretchPaddingTop");
		} else {
			oOverlay.getElement().removeStyleClass("sapUiRtaStretchPaddingTop");
		}
	};

	return Stretch;
}, /* bExport= */ true);
