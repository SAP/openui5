/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.PaneContainer.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', './Splitter', './AssociativeSplitter'],
	function(jQuery, library, Element, Splitter, AssociativeSplitter) {
	"use strict";

	/**
	 * Constructor for a new PaneContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * PaneContainer is an abstraction of Splitter
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
			orientation : { type : "sap.ui.core.Orientation", group : "Behavior", defaultValue : sap.ui.core.Orientation.Horizontal}
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

	/**
	 * Adds a SplitPane or a PaneContainer to the PaneContainer.
	 * @public
	 * @param {sap.ui.core.Element} oElement The Element to be added.
	 * @returns {sap.ui.layout.PaneContainer} this to allow method chaining.
	 */
	PaneContainer.prototype.addPane = function(oElement) {
		this.addAggregation("panes", oElement);

		if (oElement instanceof sap.ui.layout.SplitPane) {
			this._oSplitter.addAssociatedContentArea(oElement.getContent());
		} else {
			this._oSplitter.addAssociatedContentArea(oElement._oSplitter);
		}
		return this;
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

	return PaneContainer;

}, /* bExport= */ true);