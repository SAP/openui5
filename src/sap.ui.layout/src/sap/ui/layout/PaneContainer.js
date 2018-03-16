/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.PaneContainer.
sap.ui.define(['./library', 'sap/ui/core/Element', './AssociativeSplitter', 'sap/ui/core/library'],
	function(library, Element, AssociativeSplitter, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.Orientation
	var Orientation = coreLibrary.Orientation;

	/**
	 * Constructor for a new PaneContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * PaneContainer is an abstraction of Splitter.
	 *
	 * Could be used as an aggregation of ResponsiveSplitter or other PaneContainers.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38
	 * @alias sap.ui.layout.PaneContainer
	 */
	var PaneContainer = Element.extend("sap.ui.layout.PaneContainer", { metadata : {
		library : "sap.ui.layout",
		properties : {
			/**
			 The orientation of the Splitter
			 */
			orientation : { type : "sap.ui.core.Orientation", group : "Behavior", defaultValue : Orientation.Horizontal }
		},
		defaultAggregation : "panes",
		aggregations : {
			/**
			 The Pane that will be shown when there is no suitable pane for ResponsiveSplitter's current width.
			 */
			panes: { type: "sap.ui.core.Element", multiple: true, singularName: "pane" }
		}
	}});

	PaneContainer.prototype.init = function () {
		this._oSplitter = new AssociativeSplitter({
			orientation: this.getOrientation(),
			height: "100%"
		});

		this._oSplitter._bUseIconForSeparator = false;
	};

	/**
	 * Setter for property orientation.
	 * Default value is sap.ui.core.Orientation.Horizontal
	 * @public
	 * @param {sap.ui.core.Orientation} sOrientation The Orientation type.
	 * @returns {sap.ui.layout.PaneContainer} this to allow method chaining.
	 */
	PaneContainer.prototype.setOrientation = function(sOrientation) {
		this._oSplitter.setOrientation(sOrientation);
		return this.setProperty("orientation", sOrientation, true);
	};


	PaneContainer.prototype._getPanesInInterval = function (iFrom) {
		return this.getPanes().filter(function(oPane) {
			return oPane instanceof sap.ui.layout.SplitPane && oPane._isInInterval(iFrom);
		});
	};

	/**
	 * Setter for property layoutData.
	 * @public
	 * @param {sap.ui.core.LayoutData} oLayoutData The LayoutData object.
	 * @returns {sap.ui.layout.PaneContainer} this to allow method chaining.
	 */
	PaneContainer.prototype.setLayoutData = function(oLayoutData) {
		return this._oSplitter.setLayoutData(oLayoutData);
	};

	/**
	 * Pane insertion
	 *
	 * @public
	 * @param oObject
	 * @param iIndex
	 * @returns {sap.ui.base.ManagedObject}
	 */
	PaneContainer.prototype.insertPane = function (oObject, iIndex) {
		var vResult =  this.insertAggregation("panes", oObject, iIndex),
			oEventDelegate = {
				onAfterRendering: function () {
					this.triggerResize();
					this.removeEventDelegate(oEventDelegate);
				}
			};

		// When nesting Panes there should be resize event everytime a new pane is inserted.
		// However for the newly inserted pane is too early and it has not been subscribed yet to the resize handler.
		// Therefore the resize event should be triggered manually.
		if (oObject instanceof PaneContainer && oObject._oSplitter) {
			oObject._oSplitter.addEventDelegate(oEventDelegate, oObject._oSplitter);
		}

		return vResult;
	};

	/**
	 * Pane removal
	 *
	 * @public
	 * @param oObject
	 * @returns {sap.ui.base.ManagedObject}
	 */
	PaneContainer.prototype.removePane = function (oObject) {
		var vResult =  this.removeAggregation("panes", oObject),
			oEventDelegate = {
				onAfterRendering: function () {
					this.triggerResize();
					this.removeEventDelegate(oEventDelegate);
				}
			};

		// When nesting Panes there should be resize event everytime a new pane is removed.
		// However it is too early and it has not been subscribed yet to the resize handler.
		// Therefore the resize event should be triggered manually.
		this.getPanes().forEach(function (pane) {
			if (pane instanceof PaneContainer && pane._oSplitter) {
				pane._oSplitter.addEventDelegate(oEventDelegate, pane._oSplitter);
			}
		});

		return vResult;
	};

	return PaneContainer;

});