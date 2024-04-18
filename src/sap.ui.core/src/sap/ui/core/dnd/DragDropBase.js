/*!
 * ${copyright}
 */

// Provides the base class for all drag and drop configurations.
sap.ui.define([
	'sap/base/Log',
	'../Element',
	'../library',
	'./DragAndDrop'
], function(Log, Element /*, library, DragAndDrop */) {
	"use strict";

	/**
	 * Constructor for a new DragDropBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @abstract
	 * @class
	 * Provides the base class for all drag-and-drop configurations.
	 * This feature enables a native HTML5 drag-and-drop API for the controls, therefore it is limited to browser support.
	 * <h3>Restrictions</h3>
	 * <ul>
	 *   <li>There is no accessible alternative for drag and drop. Applications which use the drag-and-drop functionality must provide an
	 *   accessible alternative UI (for example, action buttons or menus) to perform the same operations.</li>
	 *   <li>Transparency of the drag ghost element and the cursor during drag-and-drop operations depends on the browser implementation.</li>
	 *   <li>Constraining a drag position is not possible, therefore there is no snap-to-grid or snap-to-element feature possible.</li>
	 *   <li>Texts in draggable controls cannot be selected.</li>
	 *   <li>The text of input fields in draggable controls can be selected, but not dragged.</li>
	 * </ul>
	 *
	 * @see {@link topic:3ddb6cde6a8d416598ac8ced3f5d82d5 Drag and Drop}
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.52
	 * @alias sap.ui.core.dnd.DragDropBase
	 */
	var DragDropBase = Element.extend("sap.ui.core.dnd.DragDropBase", /** @lends sap.ui.core.dnd.DragDropBase.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.core",
			properties: {
				/**
				 * Defines the name of the group to which this object belongs. If <code>groupName</code> is specified, then this object will only interacts with other drag-and-drop objects within the same group.
				 */
				groupName: {type: "string", defaultValue: null, invalidate: false},

				/**
				 * Indicates whether this configuration is active or not.
				 * @since 1.56
				 */
				enabled: {type: "boolean", defaultValue: true, invalidate: false},

				/**
				 * Indicates limited keyboard handling support for drag-and-drop configurations defined for aggregation reordering.
				 *
				 * <b>Note:</b> If the drag-and-drop configuration is defined for the aggregation reordering of a control (only if the <code>dropPosition</code> property is <code>Between</code>),
				 * the <code>Ctrl/Cmd + Left/Right</code> keys for horizontal move or the <code>Ctrl/Cmd + Up/Down</code> keys for vertical move trigger a series of pseudo drag-and-drop events, such as
				 * <code>dragstart, dragenter, drop, dragend</code>, to create an artificial drag-and-drop action.
				 * This keyboard handling might not be suitable for every control where aggregation reordering is defined, and in such cases, this property must not be set to <code>true</code>.
				 * @since 1.126
				 */
				keyboardHandling: {type: "boolean", defaultValue: false, invalidate: false}
			}
		}
	});

	/**
	 * This private flag determines whether or not to check dnd metadata settings.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	DragDropBase.prototype.bIgnoreMetadataCheck = false;

	/**
	 * @abstract
	 */
	DragDropBase.prototype.isDraggable = function(oControl) {
		return false;
	};

	/**
	 * @abstract
	 */
	DragDropBase.prototype.isDroppable = function(oControl, oEvent) {
		return false;
	};

	/**
	 * Checks control metadata restrictions.
	 */
	DragDropBase.prototype.checkMetadata = function(oControl, sAggregation, sRestriction) {
		if (this.bIgnoreMetadataCheck) {
			return true;
		}

		var oMetadata = oControl.getMetadata().getDragDropInfo(sAggregation);
		if (!oMetadata[sRestriction]) {
			Log.warning((sAggregation ? sAggregation + " aggregation of " : "") + oControl + " is not configured to be " + sRestriction);
			return false;
		}

		return true;
	};

	/*
	 * Suppress invalidation when the invalidate attribute of the property metadata is "false".
	 */
	DragDropBase.prototype.setProperty = function(sProperty, vValue, bSuppressInvalidate) {
		bSuppressInvalidate = (bSuppressInvalidate == undefined) ? (this.getMetadata().getProperty(sProperty).appData || {}).invalidate === false : bSuppressInvalidate;
		return Element.prototype.setProperty.call(this, sProperty, vValue, bSuppressInvalidate);
	};

	return DragDropBase;

});
