/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
	"use strict";

	/**
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Applies a <code>sap.m.CarouselLayout</code> to a provided DOM element or Control.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @since 1.62
	 * @constructor
	 * @public
	 * @alias sap.m.CarouselLayout
	 */
	var CarouselLayout = ManagedObject.extend("sap.m.CarouselLayout", /** @lends sap.m.CarouselLayout.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines how many pages are displayed in the visible area of the <code>Carousel</code> control.
				 * Value should be a positive number.
				 *
				 * <b>Note:</b> When this property is set to something different than the default value,
				 * the <code>loop</code> property of <code>Carousel</code> is ignored.
				 */
				visiblePagesCount: {type: "int", group: "Misc", defaultValue: 1}
			}
		}
	});

	/*!
	 * ${copyright}
	 */

	return CarouselLayout;
});