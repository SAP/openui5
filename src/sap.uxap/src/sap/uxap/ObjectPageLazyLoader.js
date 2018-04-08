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
	 * Constructor for a new ObjectPageLazyLoader.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * ObjectPageLazyLoader is a helper element that enables a "stashed"-based lazy loading approach for the content of
	 * the sap.uxap.ObjectPageSubSection control. ObjectPageLazyLoader is intended to be used in a declarative way only
	 * (e.g. in a view) with the "stashed" property set to "true", and is recommended to be used only once per
	 * subsection as its sole content.
	 *
	 * ObjectPageLazyLoader utilizes UI5's stashing mechanism and is a lightweight alternative to the native block-based
	 * Lazy Loading of the Object Page. Wrapping the content of a subsection in an ObjectPageLazyLoader with "stashed=true"
	 * will make the said content unstash automatically as the user scrolls.
	 *
	 * Note: Subsections are required to have an ID when used with ObjectPageLazyLoader.
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
