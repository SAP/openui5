/*!
 * ${copyright}
 */

// Provides the base class class for all drag and drop configurations.
sap.ui.define(["../Element", '../library', './DragAndDrop'],
	function(Element, library /*, DragAndDrop */) {
	"use strict";

	/**
	 * Constructor for a new DragDropBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides the base class for all drag-and-drop configurations.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.52
	 * @alias sap.ui.core.dnd.DragDropBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DragDropBase = Element.extend("sap.ui.core.dnd.DragDropBase", /** @lends sap.ui.core.dnd.DragDropBase.prototype */ {
		metadata : {
			"abstract" : true,
			library : "sap.ui.core"
		}
	});

	/**
	 * @abstract
	 */
	DragDropBase.prototype.isDraggable = function(oControl) {
		return false;
	};

	/**
	 * @abstract
	 */
	DragDropBase.prototype.isDroppable = function(oControl) {
		return false;
	};

	return DragDropBase;

}, /* bExport= */ true);