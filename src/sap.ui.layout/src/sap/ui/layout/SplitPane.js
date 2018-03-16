/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.SplitPane.
sap.ui.define(['./library', 'sap/ui/core/Element'],
	function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new SplitPane.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * SplitPane is a container of a single control in a responsive splitter.
	 * Could be used as an aggregation of a {@link sap.ui.layout.PaneContainer PaneContainer}.
	 *
	 * The behavior of the Split Panes is handled by the following properties:
	 * <ul>
	 * <li><code>requiredParentWidth</code> - determines the minimum width of the parent container (in pixels). When it is reached, the pane will be hidden from the screen.</li>
	 * <li><code>demandPane</code> - determines if the pane is reachable via the pagination bar after it has been hidden from the screen.</li>
	 * </ul
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38
	 * @alias sap.ui.layout.SplitPane
	 */
	var SplitPane = Element.extend("sap.ui.layout.SplitPane", { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Determines whether the pane will be moved to the pagination
			*/
			demandPane: { type : "boolean", group : "Behavior", defaultValue : true },

			/**
			 * Determines the minimum width of the ResponsiveSplitter(in pixels). When it is reached the pane will be hidden from the screen.
			*/
			requiredParentWidth: { type : "int", defaultValue : 800}
		},
		defaultAggregation : "content",
		aggregations : {
			/**
			 * Content of the SplitPane
			*/
			content: { type : "sap.ui.core.Control", multiple : false, singularName : "content" }
		}
	}});

	SplitPane.prototype.setLayoutData = function(oLayoutdata) {
		var oContent = this.getContent();
		if (oContent) {
			return oContent.setLayoutData(oLayoutdata);
		} else {
			return this;
		}
	};

	SplitPane.prototype.onLayoutDataChange = function() {
		var oParent = this.getParent();
		if (oParent) {
			oParent._oSplitter._delayedResize();
		}
	};

	SplitPane.prototype._isInInterval = function (iFrom) {
		return this.getRequiredParentWidth() <= iFrom;
	};

	return SplitPane;

});
