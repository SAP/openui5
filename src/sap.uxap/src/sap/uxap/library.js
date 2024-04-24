/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.uxap.
 */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/base/DataType",
	"sap/ui/base/Object",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	// library dependency
	"sap/ui/core/library",
	// library dependency
	"sap/f/library",
	// library dependency
	"sap/m/library",
	// library dependency
	"sap/ui/layout/library"
], function(Device, DataType, BaseObject, Library, jQuery) {
	"use strict";

	/**
	 * SAP UxAP
	 *
	 * @namespace
	 * @alias sap.uxap
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.36
	 * @public
	 */
	var thisLib = Library.init({
		name: "sap.uxap",
		apiVersion: 2,
		dependencies: ["sap.ui.core", "sap.f", "sap.m", "sap.ui.layout"],
		designtime: "sap/uxap/designtime/library.designtime",
		types: [
			"sap.uxap.BlockBaseColumnLayout",
			"sap.uxap.BlockBaseFormAdjustment",
			"sap.uxap.Importance",
			"sap.uxap.ObjectPageConfigurationMode",
			"sap.uxap.ObjectPageHeaderDesign",
			"sap.uxap.ObjectPageHeaderPictureShape",
			"sap.uxap.ObjectPageSubSectionLayout",
			"sap.uxap.ObjectPageSubSectionMode"
		],
		interfaces: [
			"sap.uxap.IHeaderTitle",
			"sap.uxap.IHeaderContent"
		],
		controls: [
			"sap.uxap.AnchorBar",
			"sap.uxap.BlockBase",
			"sap.uxap.BreadCrumbs",
			"sap.uxap.HierarchicalSelect",
			"sap.uxap.ObjectPageHeader",
			"sap.uxap.ObjectPageDynamicHeaderTitle",
			"sap.uxap.ObjectPageDynamicHeaderContent",
			"sap.uxap.ObjectPageHeaderActionButton",
			"sap.uxap.ObjectPageHeaderContent",
			"sap.uxap.ObjectPageLayout",
			"sap.uxap.ObjectPageSection",
			"sap.uxap.ObjectPageSectionBase",
			"sap.uxap.ObjectPageSubSection"
		],
		elements: [
			"sap.uxap.ModelMapping",
			"sap.uxap.ObjectPageAccessibleLandmarkInfo",
			"sap.uxap.ObjectPageHeaderLayoutData",
			"sap.uxap.ObjectPageLazyLoader"
		],
		version: "${version}",
		extensions: {
			flChangeHandlers: {
				"sap.uxap.ObjectPageHeader": "sap/uxap/flexibility/ObjectPageHeader",
				"sap.uxap.ObjectPageLayout": "sap/uxap/flexibility/ObjectPageLayout",
				"sap.uxap.ObjectPageSection": "sap/uxap/flexibility/ObjectPageSection",
				"sap.uxap.ObjectPageSubSection": "sap/uxap/flexibility/ObjectPageSubSection",
				"sap.uxap.ObjectPageDynamicHeaderTitle": "sap/uxap/flexibility/ObjectPageDynamicHeaderTitle",
				"sap.uxap.ObjectPageHeaderActionButton": "sap/uxap/flexibility/ObjectPageHeaderActionButton",
				"sap.ui.core._StashedControl": {
					"unstashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					},
					"stashControl": {
						"changeHandler": "default",
						"layers": {
							"USER": true
						}
					}
				}
			},
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				publicRules:true
			}
		}
	});

	/**
	 * Used by the <code>BlockBase</code> control to define how many columns should it be assigned by the <code>objectPageSubSection</code>.
	 *     The allowed values can be auto (subsection assigned a number of columns based on the parent objectPageLayout subsectionLayout property), 1, 2, 3 or 4
	 *     (This may not be a valid value for some <code>subSectionLayout</code>, for example, asking for 3 columns in a 2 column layout would raise warnings).
	 *
	 * @namespace
	 * @public
	 */
	thisLib.BlockBaseColumnLayout = DataType.createType('sap.uxap.BlockBaseColumnLayout', {
			isValid: function (vValue) {
				return /^(auto|[1-4]{1})$/.test(vValue);
			}

		},
		DataType.getType('string')
	);

	/**
	 * Used by the <code>BlockBase</code> control to define if it should do automatic adjustment of its nested forms.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @static
	 * @public
	 */
	thisLib.BlockBaseFormAdjustment = {

		/**
		 * Any form within the block will be automatically adjusted to have as many columns as the colspan of its parent block.
		 * @public
		 */
		BlockColumns: "BlockColumns",
		/**
		 * Any form within the block will be automatically adjusted to have only one column.
		 * @public
		 */
		OneColumn: "OneColumn",
		/**
		 * No automatic adjustment of forms.
		 * @public
		 */
		None: "None"
	};

	DataType.registerEnum("sap.uxap.BlockBaseFormAdjustment", thisLib.BlockBaseFormAdjustment);

	/**
	 * Used by the <code>sap.uxap.component.Component</code> how to initialize the <code>ObjectPageLayout</code> sections and subsections.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 */
	thisLib.ObjectPageConfigurationMode = {

		/**
		 * Determines the JSON URL.
		 * @public
		 */
		JsonURL: "JsonURL",

		/**
		 * Determines the JSON model.
		 * @public
		 */
		JsonModel: "JsonModel"

	};

	DataType.registerEnum("sap.uxap.ObjectPageConfigurationMode", thisLib.ObjectPageConfigurationMode);

	/**
	 * Used by the <code>ObjectPageHeader</code> control to define which design to use.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 */

	thisLib.ObjectPageHeaderDesign = {

		/**
		 * Light theme for the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Light: "Light",

		/**
		 * Dark theme for the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Dark: "Dark"

	};

	DataType.registerEnum("sap.uxap.ObjectPageHeaderDesign", thisLib.ObjectPageHeaderDesign);

	/**
	 * Used by the <code>ObjectPageHeader</code> control to define which shape to use for the image.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 */
	thisLib.ObjectPageHeaderPictureShape = {

		/**
		 * Circle shape for the images in the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Circle: "Circle",

		/**
		 * Square shape for the images in the <code>ObjectPageHeader</code>.
		 * @public
		 */
		Square: "Square"

	};

	DataType.registerEnum("sap.uxap.ObjectPageHeaderPictureShape", thisLib.ObjectPageHeaderPictureShape);

	/**
	 * Used by the <code>ObjectPagSubSection</code> control to define which layout to apply.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 */
	thisLib.ObjectPageSubSectionLayout = {

		/**
		 * Title and actions on top of the block area.
		 * @public
		 */
		TitleOnTop: "TitleOnTop",

		/**
		 * Title and actions on the left, inside the block area.
		 * @public
		 */
		TitleOnLeft: "TitleOnLeft"

	};

	DataType.registerEnum("sap.uxap.ObjectPageSubSectionLayout", thisLib.ObjectPageSubSectionLayout);

	/**
	 * Used by the <code>ObjectPageLayout</code> control to define which layout to use (either Collapsed or Expanded).
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 */
	thisLib.ObjectPageSubSectionMode = {

		/**
		 * Collapsed mode of display of the <code>ObjectPageLayout</code>.
		 * @public
		 */
		Collapsed: "Collapsed",

		/**
		 * Expanded mode of displaying the <code>ObjectPageLayout</code>.
		 * @public
		 */
		Expanded: "Expanded"

	};

	DataType.registerEnum("sap.uxap.ObjectPageSubSectionMode", thisLib.ObjectPageSubSectionMode);

	/**
	 * Used by the <code>ObjectSectionBase</code> control to define the importance of the content contained in it.
	 *
	 * @author SAP SE
	 * @enum {string}
	 * @public
	 * @since 1.32.0
	 */
	thisLib.Importance = {

		/**
		 * Low importance of the content.
		 * @public
		 */
		Low: "Low",

		/**
		 * Medium importance of the content.
		 * @public
		 */
		Medium: "Medium",

		/**
		 * High importance of the content.
		 * @public
		 */
		High: "High"
	};

	DataType.registerEnum("sap.uxap.Importance", thisLib.Importance);

	/**
	 *
	 * @type {{getClosestOPL: Function}}
	 */
	thisLib.Utilities = {

		/**
		 * Returns the reference to the <code>ObjectPageLayout</code> for a given control.
		 * @static
		 * @param {sap.ui.core.Control} oControl - the control to find ObjectPageLayout for
 		 * @param {sap.ui.core.Control} oParentSubSection (optional) - the parent ObjectPageSubSection
		 * @private
		 * @returns {*} Object Page layout referance
		 */
		getClosestOPL: function (oControl, oParentSubSection) {

			while (oControl && !(BaseObject.isObjectA(oControl, "sap.uxap.ObjectPageLayout"))) {
				oControl = oControl.getParent() || oParentSubSection;
				// using oParentSubSection (if any) only the first time, otherwise if no OPL is found up the tree, loop will be infinite
				oParentSubSection = null;
			}

			return oControl;
		},
		isPhoneScenario: function (oRange) {
			if (Device.system.phone) {
				return true;
			}

			return thisLib.Utilities._isCurrentMediaSize("Phone", oRange);
		},
		isTabletScenario: function (oRange) {
			return thisLib.Utilities._isCurrentMediaSize("Tablet", oRange);
		},
		_isCurrentMediaSize: function (sMedia, oRange) {
			return oRange && oRange.name === sMedia;
		},
		/**
		 * Calculates scroll position of a child of a container.
		 * @param {HTMLElement | jQuery} vElement An element(DOM or jQuery) for which the scroll position will be calculated.
		 * @param {HTMLElement | jQuery} vContainer The container element(DOM or jQuery) and reference offsetParent
		 * @returns {object} Position object.
		 * @protected
		 */
		getChildPosition: function(vElement, vContainer) {
			// check if vElement is a DOM element and if yes convert it to jQuery object
			var $Element = vElement instanceof jQuery ? vElement : jQuery(vElement),
				$Container = vContainer instanceof jQuery ? vContainer : jQuery(vContainer),
				$topmostContainer = jQuery(document.documentElement),
				oElementPosition = $Element.position(),
				$OffsetParent = $Element.offsetParent(),
				oAddUpPosition;

			while (!$OffsetParent.is($Container) && !$OffsetParent.is($topmostContainer)) {
				oAddUpPosition = $OffsetParent.position();
				oElementPosition.top += oAddUpPosition.top;
				oElementPosition.left += oAddUpPosition.left;
				$OffsetParent = $OffsetParent.offsetParent();
			}

			return oElementPosition;
		}
	};

	/**
	 *
	 * Interface for controls that are eligible for the <code>headerTitle</code> aggregation
	 * of the <code>{@link sap.uxap.ObjectPageLayout}</code>.
	 *
	 * Controls that implement this interface:
	 * <ul>
	 * <li><code>{@link sap.uxap.ObjectPageHeader}</code> - <code>ObjectPageLayout</code>'s classic header</code></li>
	 * <li><code>{@link sap.uxap.ObjectPageDynamicHeaderTitle}</code> - <code>ObjectPageLayout</code>'s dynamic header</code></li>
	 * </ul>
	 *
	 * For more information on the types of header available for the <code>{@link sap.uxap.ObjectPageLayout ObjectPageLayout}</code>,
	 * see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}.
	 *
	 * For details regarding the differences and similarities between the available headers,
	 * see {@link topic:9c9d94fd28284539a9a5a57e9caf82a8 Object Page Headers Comparison}.
	 *
	 * @since 1.52
	 * @name sap.uxap.IHeaderTitle
	 * @interface
	 * @public
	 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
	 */

	/**
	 *  Method for checking if the header title is <code>{@link sap.uxap.ObjectPageDynamicHeaderTitle}</code>.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.isDynamic
	 * @ui5-restricted
	 * @private
	 * @returns {boolean} Whether or not the header title is dynamic.
	*/

	/**
	 * Getter method for getting the compatible header title class (being <code>{@link sap.uxap.ObjectPageDynamicHeaderTitle}</code> or <code>{@link sap.uxap.ObjectPageHeader}</code>).
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.getCompatibleHeaderContentClass
	 * @ui5-restricted
	 * @private
	 * @returns {sap.uxap.ObjectPageHeaderContent} The header content.
	*/

	/**
	 * Method for checking if the header title can be toggled on click.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.supportsToggleHeaderOnTitleClick
	 * @ui5-restricted
	 * @private
	 * @returns {boolean} Whether or not the header title can be toggled on click.
	*/

	/**
	 * Method for checking if header title is supported in header content.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.supportsTitleInHeaderContent
	 * @ui5-restricted
	 * @private
	 * @returns {boolean} Whether or not header title is supported in header content.
	*/

	/**
	 * Method for checking if header title supports adapt layout for DOM element.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.supportsAdaptLayoutForDomElement
	 * @ui5-restricted
	 * @param {boolean} bToggle Whether or not header title supports adapt layout for DOM element.
	 * @private
	*/

	/**
	 * Method for checking if header title supports background design.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.supportsBackgroundDesign
	 * @ui5-restricted
	 * @param {boolean} bToggle Whether or not header title supports background design.
	 * @private
	*/

	/**
	 * Getter method for getting the header title text.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.getTitleText
	 * @ui5-restricted
	 * @private
	 * @returns {string} The header title text.
	*/

	/**
	 * Method for snapping/collapsing the header title.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.snap
	 * @ui5-restricted
	 * @private
	*/

	/**
	 * Method for unsnapping/expanding the header title.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle.unSnap
	 * @ui5-restricted
	 * @private
	*/

	/**
	 * Method toggling .the visibility of the expand button of the header title
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle._toggleExpandButton
	 * @ui5-restricted
	 * @param {boolean} bToggle Whether or not header title expand button should be shown.
	 * @private
	*/

	/**
	 * Setter method for toggling .the visibility of the expand button of the header title
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle._setShowExpandButton
	 * @ui5-restricted
	 * @param {boolean} bVisible Whether or not header title expand button should be shown.
	 * @private
	*/

	/**
	 * Method for focusing the expand button of the header title.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle._focusExpandButton
	 * @ui5-restricted
	 * @private
	*/

	/**
	 * Method for toggling the focusing ability of the header title.
	 *
	 * @function
	 * @name sap.uxap.IHeaderTitle._toggleFocusableState
	 * @ui5-restricted
	 * @param {boolean} bFocusable Whether or not header title should be focusable.
	 * @private
	*/

	/**
	 *
	 * Interface for controls that are eligible for the <code>headerContent</code> aggregation
	 * of the <code>{@link sap.uxap.ObjectPageLayout}</code>.
	 *
	 * Controls that implement this interface:
	 * <ul>
	 * <li><code>{@link sap.uxap.ObjectPageHeaderContent}</code> - <code>ObjectPageLayout</code>'s classic header content</code></li>
	 * <li><code>{@link sap.uxap.ObjectPageDynamicHeaderContent}</code> - <code>ObjectPageLayout</code>'s dynamic header content</code></li>
	 * </ul>
	 *
	 * For more information on the types of header available for the <code>{@link sap.uxap.ObjectPageLayout ObjectPageLayout}</code>,
	 * see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}.
	 *
	 * For details regarding the differences and similarities between the available headers,
	 * see {@link topic:9c9d94fd28284539a9a5a57e9caf82a8 Object Page Headers Comparison}.
	 *
	 * @since 1.52
	 * @name sap.uxap.IHeaderContent
	 * @interface
	 * @public
	 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
	 */

	/**
	 * Static method for creating an instance of the header content.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent.createInstance
	 * @ui5-restricted
	 * @param {array} aContent The content array for the instance
	 * @param {boolean} bVisible Whether the instance should be visible
	 * @param {string} sContentDesign The content design
	 * @param {boolean} bPinnable Whether the instance is pinnable
	 * @param {string} sStableId Stable ID text
	 * @private
	*/

	/**
	 * Method for checking if the header content supports pin button.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent.supportsPinUnpin
	 * @ui5-restricted
	 * @private
	 * @returns {boolean} Whether or not the header content supports pin button.
	*/

	/**
	 * Method for checking if the header content supports child page design (ObjectPageLayout related).
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent.supportsChildPageDesign
	 * @ui5-restricted
	 * @private
	 * @returns {boolean} Whether or not the header content supports child page design (ObjectPageLayout related).
	*/

	/**
	 * Method for checking if always expanded header content is supported.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent.supportsAlwaysExpanded
	 * @ui5-restricted
	 * @private
	 * @returns {boolean} Whether or not supports always expanded header content.
	*/

	/**
	 * Toggles the collapse button's visibility of the header content.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent._toggleCollapseButton
	 * @ui5-restricted
	 * @param {boolean} bToggle Whether the collapse button should be shown or not
	 * @private
	*/

	/**
	 * Internal setter for the collapse button's visibility of the header content.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent._setShowCollapseButton
	 * @ui5-restricted
	 * @param {boolean} bToggle Whether the collapse button should be shown or not
	 * @private
	*/

	/**
	 * Focuses the collapse button of the header content.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent._focusCollapseButton
	 * @ui5-restricted
	 * @private
	*/

	/**
	 * Focuses the pin button of the header content.
	 *
	 * @function
	 * @name sap.uxap.IHeaderContent._focusPinButton
	 * @ui5-restricted
	 * @private
	*/

	return thisLib;
});