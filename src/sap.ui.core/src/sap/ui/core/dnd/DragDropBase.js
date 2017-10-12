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
	 * This feature enables native HTML5 drag and drop API for the controls, therefore it is limited to browser support.
	 * Here are the known limitations:
	 * <ul>
	 *   <li>There is no mobile device that supports drag and drop.
	 *   <li>Custom dragging ghost element is not possible for Internet Explorer.
	 *   <li>Transparency of the ghost element depends on the browser implementation.
	 *   <li>Internet Explorer does not support rather than plain text MIME type for the DataTransfer Object.
	 *   <li>Constraining drag position is not possible.
	 * </ul>
	 *
	 * @extends sap.ui.core.Element
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