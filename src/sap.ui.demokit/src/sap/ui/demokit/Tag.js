/*!
 * ${copyright}
 */

// Provides control sap.ui.demokit.Tag.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";



	/**
	 * Constructor for a new Tag.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A Tag in a TagCloud
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted sdk
	 * @alias sap.ui.demokit.Tag
	 */
	var Tag = Element.extend("sap.ui.demokit.Tag", /** @lends sap.ui.demokit.Tag.prototype */ { metadata : {

		library : "sap.ui.demokit",
		properties : {

			/**
			 * The text to be disaplyed for this tag.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The weight for this tag. Can be any integer value.
			 */
			weight : {type : "int", group : "Misc", defaultValue : 1}
		}
	}});

	Tag.prototype.onclick = function(oEvent){
		//Inform the parent about the onclick event
		this.oParent.firePressEvent(this);
	};


	return Tag;

});
