/*!
 * ${copyright}
 */

// Provides control sap.m.IconTabSeparator.
sap.ui.define([
	"./library",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/m/IconTabFilter"
], function (
	library,
	Core,
	Element,
	Item,
	IconTabFilter
) {
	"use strict";

	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	/**
	 * Constructor for a new IconTabSeparator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents an Icon used to separate 2 tab filters.
	 *
	 * @extends sap.ui.core.Element
	 * @implements sap.m.IconTab
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.IconTabSeparator
	 */
	var IconTabSeparator = Element.extend("sap.m.IconTabSeparator", /** @lends sap.m.IconTabSeparator.prototype */ {
		metadata: {

			interfaces: [
				"sap.m.IconTab"
			],
			library: "sap.m",
			designtime: "sap/m/designtime/IconTabSeparator.designtime",
			properties: {

				/**
				 * The icon to display for this separator. If no icon is given, a separator line is used instead.
				 */
				icon: { type: "sap.ui.core.URI", group: "Misc", defaultValue: '' },

				/**
				 * Specifies whether the separator is rendered.
				 */
				visible: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * If set to true, it sends one or more requests,
				 * trying to get the density perfect version of the image if this version of
				 * the image doesn't exist on the server. Default value is set to true.
				 *
				 * If bandwidth is key for the application, set this value to false.
				 */
				iconDensityAware: { type: "boolean", group: "Appearance", defaultValue: true }
			}
		}
	});

	/**
	 * Lazy load feed icon image.
	 *
	 * @param {Array} aCssClasses Array of CSS classes, which will be added if the image needs to be created.
	 * @param {sap.ui.core.Control} oParent This element's parent.
	 * @private
	 */
	IconTabSeparator.prototype._getImageControl = function (aCssClasses, oParent) {
		var mProperties = {
			src: this.getIcon(),
			densityAware: this.getIconDensityAware(),
			useIconTooltip: false
		};

		this._oImageControl = ImageHelper.getImageControl(this.getId() + "-icon", this._oImageControl, oParent, mProperties, aCssClasses);

		return this._oImageControl;
	};

	/**
	 * Function is called when exiting the element.
	 *
	 * @private
	 */
	IconTabSeparator.prototype.exit = function (oEvent) {

		if (this._oImageControl) {
			this._oImageControl.destroy();
		}

		Element.prototype.exit.call(this, oEvent);
	};

	/**
	 * @returns {sap.m.IconTabSeparator} the underlying instance of a separator
	 * @private
	 */
	IconTabSeparator.prototype._getRealTab = function () {
		return IconTabFilter.prototype._getRealTab.call(this);
	};

	/**
	 * @returns {int} the level at which this item has been nested, or 1 if an item has not been nested
	 * @private
	 */
	IconTabSeparator.prototype._getNestedLevel = function () {
		return IconTabFilter.prototype._getNestedLevel.call(this);
	};

	/**
	 * Renders the item in the IconTabHeader.
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @protected
	 */
	IconTabSeparator.prototype.render = function (oRM) {
		if (!this.getVisible()) {
			return;
		}

		var sIcon = this.getIcon(),
			oIconTabHeader = this.getParent(),
			oRB = Core.getLibraryResourceBundle('sap.m'),
			mAriaParams = {};

		if (sIcon) {
			mAriaParams.role = "img";
			mAriaParams.label = oRB.getText("ICONTABBAR_NEXTSTEP");
		} else {
			mAriaParams.role = "separator";
		}

		oRM.openStart("div", this)
			.accessibilityState(mAriaParams)
			.class("sapMITBItem")
			.class("sapMITBSep");

		if (!sIcon) {
			oRM.class("sapMITBSepLine");
		}

		oRM.openEnd();

		if (sIcon) {
			oRM.renderControl(this._getImageControl(["sapMITBSepIcon"], oIconTabHeader));
		}

		oRM.close("div");
	};

	/**
	 * Renders this item in the IconTabSelectList.
	 * @param {sap.ui.core.RenderManager} oRM RenderManager used for writing to the render output buffer
	 * @param {sap.m.IconTabBarSelectList} oSelectList the select list in which this filter is rendered
	 * @param {int} iIndexInSet this item's index within the aggregation of items
	 * @param {int} iSetSize total length of the aggregation of items
	 * @param {float} fPaddingValue the padding with which the item should be indented
	 * @protected
	 */
	IconTabSeparator.prototype.renderInSelectList = function (oRM, oSelectList, iIndexInSet, iSetSize, fPaddingValue) {
		if (!this.getVisible()) {
			return;
		}

		var sIcon = this.getIcon(),
			oIconTabHeader = oSelectList._oIconTabHeader,
			oRB = Core.getLibraryResourceBundle('sap.m'),
			mAriaParams = {};

		if (sIcon) {
			mAriaParams.role = "img";
			mAriaParams.label = oRB.getText("ICONTABBAR_NEXTSTEP");
		} else {
			mAriaParams.role = "separator";
		}

		oRM.openStart("li", this)
			.class("sapMITBSelectItem")
			.class("sapMITBSep")
			.accessibilityState(mAriaParams);

		if (fPaddingValue && !sIcon) {
			oRM.style("padding-left", fPaddingValue + "rem");
		}

		if (!sIcon) {
			oRM.class("sapMITBSepLine");
		}

		oRM.openEnd();

		if (sIcon) {
			oRM.renderControl(this._getImageControl(["sapMITBSepIcon"], oIconTabHeader));
		}

		oRM.close("li");
	};

	return IconTabSeparator;
});