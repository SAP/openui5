/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageLazyLoader.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Element',
	'sap/ui/core/StashedControlSupport'
], function (jQuery, library, Element, StashedControlSupport) {
	"use strict";

	/**
	 * Constructor for a new <code>ObjectPageLazyLoader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A helper element that enables a "stashed-based" lazy loading approach for the content of
	 * the {@link sap.uxap.ObjectPageSubSection} control.
	 *
	 * <code>ObjectPageLazyLoader</code> is intended to be used in a declarative way only
	 * (for example, in a view) with the <code>stashed</code> property set to <code>true</code>,
	 * and is recommended to be used only once per subsection as its sole content.
	 *
	 * <code>ObjectPageLazyLoader</code> utilizes UI5's stashing mechanism and is a lightweight
	 * alternative to the native block-based Lazy Loading of the <code>ObjectPageLayout</code>.
	 * Wrapping the content of a subsection in an <code>ObjectPageLazyLoader</code> with
	 * <code>stashed=true</code> will make the content unstash automatically as the user scrolls.
	 *
	 * <b>Note:</b> Subsections are required to have an ID when used with <code>ObjectPageLazyLoader</code>.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.38
	 * @alias sap.uxap.ObjectPageLazyLoader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var LazyLoader = Element.extend("sap.uxap.ObjectPageLazyLoader", /** @lends sap.uxap.ObjectPageLazyLoader.prototype */ {
		metadata: {
			library: "sap.uxap",
			aggregations: {

				/**
				 * Controls to be displayed after this element is unstashed
				 */
				content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
			},
			defaultAggregation: "content"
		}
	});

	StashedControlSupport.mixInto(LazyLoader);

	LazyLoader.prototype.setParent = function (oParent) {
		if (!(oParent === null || oParent instanceof sap.uxap.ObjectPageSubSection)) {
			jQuery.sap.assert(false, "setParent(): oParent must be an instance of sap.uxap.ObjectPageSubSection or null");
		}

		return Element.prototype.setParent.apply(this, arguments);
	};

	return LazyLoader;
});
