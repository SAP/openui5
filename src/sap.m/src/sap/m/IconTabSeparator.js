/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabSeparator.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";


	
	/**
	 * Constructor for a new IconTabSeparator.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A tab separator item class
	 * @extends sap.ui.core.Element
	 * @implements sap.m.IconTab
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabSeparator
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabSeparator = Element.extend("sap.m.IconTabSeparator", /** @lends sap.m.IconTabSeparator.prototype */ { metadata : {
	
		interfaces : [
			"sap.m.IconTab"
		],
		library : "sap.m",
		properties : {
	
			/**
			 * The icon to display for this separator. If no icon is given, a separator line will be used instead.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : ''},
	
			/**
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 * 
			 * If bandwidth is the key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true}
		}
	}});
	
	/**
	 * Lazy load feed icon image.
	 *
	 * @param {Array} aCssClasses array of css classes which will be added if the image needs to be created.
	 * @param {sap.ui.core.Control} oParent this element's parent.
	 * @private
	 */
	IconTabSeparator.prototype._getImageControl = function(aCssClasses, oParent) {
		var mProperties = {
			src : this.getIcon(),
			densityAware : this.getIconDensityAware(),
			useIconTooltip : false
		};
		
		this._oImageControl = sap.m.ImageHelper.getImageControl(this.getId() + "-icon", this._oImageControl, oParent, mProperties, aCssClasses);
		
		return this._oImageControl;
	};
	
	/**
	 * Function is called when exiting the element.
	 * 
	 * @private
	 */
	IconTabSeparator.prototype.exit = function(oEvent) {
		
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}
		
		if (sap.ui.core.Item.prototype.exit) {
			sap.ui.core.Item.prototype.exit.call(this, oEvent);
		}
	};
	
	return IconTabSeparator;

}, /* bExport= */ true);
