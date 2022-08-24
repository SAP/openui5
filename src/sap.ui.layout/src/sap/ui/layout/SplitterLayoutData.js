/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.SplitterLayoutData.
sap.ui.define(['sap/ui/core/LayoutData', './library'],
	function(LayoutData, library) {
	"use strict";



	/**
	 * Constructor for a new SplitterLayoutData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Holds layout data for the splitter contents.
	 * Allowed size values are numeric values ending in "px" and "%" and the
	 * special case "auto".
	 * (The CSS value "auto" is used internally to recalculate the size of the content
	 * dynamically and is not directly set as style property.)
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @experimental Since version 1.22.0.
	 * API is not yet finished and might change completely
	 * @alias sap.ui.layout.SplitterLayoutData
	 */
	var SplitterLayoutData = LayoutData.extend("sap.ui.layout.SplitterLayoutData", /** @lends sap.ui.layout.SplitterLayoutData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Determines whether the control in the splitter can be resized or not.
			 */
			resizable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The size of the splitter content.
			 * This property is updated when the area is resized by the user.
			 *
			 * <b>Note:</b> Resizing areas in the sap.ui.layout.Splitter sets this property to "px" values,
			 * while resizing areas in the sap.ui.layout.ResponsiveSplitter sets it to % values.
			 */
			size : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},

			/**
			 * Sets the minimum size of the splitter content in px.
			 */
			minSize : {type : "int", group : "Dimension", defaultValue : 0}
		}
	}});

	SplitterLayoutData.prototype.init = function () {
		LayoutData.prototype.init.apply(this, arguments);
		this._bIsModified = false;
	};

	SplitterLayoutData.prototype._markModified = function () {
		this._bIsModified = true;
	};

	SplitterLayoutData.prototype._isMarked = function () {
		return this._bIsModified;
	};

	return SplitterLayoutData;
});
