/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabFilter.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Item'],
	function(jQuery, library, Item) {
	"use strict";



	/**
	 * Constructor for a new IconTabFilter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The filter item class
	 * @extends sap.ui.core.Item
	 * @implements sap.m.IconTab
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabFilter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IconTabFilter = Item.extend("sap.m.IconTabFilter", /** @lends sap.m.IconTabFilter.prototype */ { metadata : {

		interfaces : [
			"sap.m.IconTab",
			// The IconTabBar doesn't have renderer. The sap.ui.core.PopupInterface is used to indicate
			// that the IconTabFilter content is not rendered by the IconTabFilter, it is rendered by IconTabBar.
			"sap.ui.core.PopupInterface"
		],
		library : "sap.m",
		properties : {

			/**
			 * The number of available items if this filter is applied
			 */
			count : {type : "string", group : "Data", defaultValue : ''},

			/**
			 * Enables special visualization for disabled filter (show all items)
			 */
			showAll : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * The icon to display for this item.
			 */
			icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : ''},

			/**
			 * If an icon font is used, the color can be chosen from the icon colors (sap.ui.core.IconColor).
			 * Possible semantic colors are: Neutral, Positive, Critical, Negative.
			 * Instead of the semantic icon color the brand color can be used, this is named Default.
			 * Semantic colors and brand colors should not be mixed up inside one IconTabBar.
			 */
			iconColor : {type : "sap.ui.core.IconColor", group : "Appearance", defaultValue : sap.ui.core.IconColor.Default},

			/**
			 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
			 *
			 * If bandwidth is the key for the application, set this value to false.
			 */
			iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set to false, the control is not rendered.
			 */
			visible : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Design for the filter item.
			 */
			design : {type : "sap.m.IconTabFilterDesign", group : "Appearance", defaultValue : sap.m.IconTabFilterDesign.Vertical}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * The content to show for this item (optional).
			 * If this content is set, it will be displayed instead of the general content inside the IconTabBar.
			 * @since 1.15.0
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		}
	}});

	/**
	 * Lazy load icon tab filter image.
	 *
	 * @param {Array} aCssClassesToAdd array of css classes which will be added if the image needs to be created.
	 * @param {sap.ui.core.Control} oParent this element's parent.
	 * @param {Array} aCssClassesToRemove all css clases that oImageControl has and which are contained in this array
	 * are removed before adding the css classes listed in aCssClassesToAdd.
	 *
	 * @private
	 */
	IconTabFilter.prototype._getImageControl = function(aCssClassesToAdd, oParent, aCssClassesToRemove) {
		var mProperties = {
			src : this.getIcon(),
			densityAware : this.getIconDensityAware()
		};
		if (mProperties.src) {
			this._oImageControl = sap.m.ImageHelper.getImageControl(this.getId() + "-icon", this._oImageControl, oParent, mProperties, aCssClassesToAdd, aCssClassesToRemove);
		} else if (this._oImageControl) {
			this._oImageControl.destroy();
			this._oImageControl = null;
		}

		return this._oImageControl;
	};

	/**
	 * Function is called when exiting the element.
	 *
	 * @private
	 */
	IconTabFilter.prototype.exit = function(oEvent) {
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}

		if (Item.prototype.exit) {
			Item.prototype.exit.call(this, oEvent);
		}
	};

	IconTabFilter.prototype.invalidate = function() {
		var oIconTabHeader = this.getParent(),
			oIconTabBar;

		// invalidate the whole IconTabBar or the ObjectHeader
		if (oIconTabHeader instanceof sap.m.IconTabHeader &&
			oIconTabHeader.getParent() instanceof sap.m.IconTabBar) {
			oIconTabBar = oIconTabHeader.getParent();

			if (oIconTabBar.getParent() instanceof sap.m.ObjectHeader) {
				// invalidate the object header to re-render IconTabBar content and header
				var oObjectHeader = oIconTabBar.getParent();
				oObjectHeader.invalidate();
			} else {
				oIconTabBar.invalidate();
			}
		}
	};

	IconTabFilter.prototype.setProperty = function (sPropertyName, oValue, bSuppressInvalidate) {

		// invalidate only the IconTabHeader if a property change
		// doesn't affect the IconTabBar content
		switch (sPropertyName) {
			case 'text':
			case 'count':
			case 'showAll':
			case 'icon':
			case 'iconColor':
			case 'iconDensityAware':
			case 'design':
				if (this.getProperty(sPropertyName) === oValue) {
					return this;
				}
				sap.ui.core.Control.prototype.setProperty.call(this, sPropertyName, oValue, true);
				if (!bSuppressInvalidate) {
					var oIconTabHeader = this.getParent();
					if (oIconTabHeader instanceof sap.m.IconTabHeader) {
						oIconTabHeader.invalidate();
					}
				}
				break;
			default:
				sap.ui.core.Control.prototype.setProperty.apply(this, arguments);
				break;
		}

		return this;
	};

	/**
	 * If the IconTabFilter doesn't have a key, the function returns the id of the IconTabFilter,
	 * so the IconTabBar can remember the selected IconTabFilter.
	 *
	 * @private
	 */
	IconTabFilter.prototype._getNonEmptyKey = function () {

		// BCP: 1482007468
		var sKey = this.getKey();

		if (sKey) {
			return sKey;
		}

		return this.getId();
	};

	return IconTabFilter;

}, /* bExport= */ true);
