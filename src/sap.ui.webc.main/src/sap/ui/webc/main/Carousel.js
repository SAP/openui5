/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Carousel.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Carousel"
], function(WebComponent, library) {
	"use strict";

	var CarouselArrowsPlacement = library.CarouselArrowsPlacement;

	/**
	 * Constructor for a new <code>Carousel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> The Carousel allows the user to browse through a set of items. The component is mostly used for showing a gallery of images, but can hold any other HTML element. <br>
	 * There are several ways to perform navigation:
	 * <ul>
	 *     <li>on desktop - the user can navigate using the navigation arrows or with keyboard shorcuts.</li>
	 *     <li>on mobile - the user can use swipe gestures.</li>
	 * </ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * <h4>When to use:</h4>
	 *
	 *
	 * <ul>
	 *     <li>The items you want to display are very different from each other.</li>
	 *     <li>You want to display the items one after the other.</li>
	 * </ul>
	 *
	 * <h4>When not to use:</h4>
	 *
	 *
	 * <ul>
	 *     <li>The items you want to display need to be visible at the same time.</li>
	 *     <li>The items you want to display are uniform and very similar.</li>
	 * </ul>
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 * <h4>Basic Navigation</h4> When the <code>sap.ui.webc.main.Carousel</code> is focused the user can navigate between the items with the following keyboard shortcuts: <br>
	 *
	 *
	 *
	 *
	 * <ul>
	 *     <li>[UP/DOWN] - Navigates to previous and next item</li>
	 *     <li>[LEFT/RIGHT] - Navigates to previous and next item</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Carousel
	 */
	var Carousel = WebComponent.extend("sap.ui.webc.main.Carousel", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-carousel-ui5",
			properties: {

				/**
				 * Defines the position of arrows. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Content</code></li>
				 *     <li><code>Navigation</code></li>
				 * </ul> <br>
				 * When set to "Content", the arrows are placed on the sides of the current page. <br>
				 * When set to "Navigation", the arrows are placed on the sides of the page indicator.
				 */
				arrowsPlacement: {
					type: "sap.ui.webc.main.CarouselArrowsPlacement",
					defaultValue: CarouselArrowsPlacement.Content
				},

				/**
				 * Defines whether the carousel should loop, i.e show the first page after the last page is reached and vice versa.
				 */
				cyclic: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the visibility of the navigation arrows. If set to true the navigation arrows will be hidden. <br>
				 * <br>
				 * <b>Note:</b> The navigation arrows are never displayed on touch devices. In this case, the user can swipe to navigate through the items.
				 */
				hideNavigationArrows: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the visibility of the paging indicator. If set to true the page indicator will be hidden.
				 */
				hidePageIndicator: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the number of items per page on large size (more than 1024px). One item per page shown by default.
				 */
				itemsPerPageL: {
					type: "int",
					defaultValue: 1
				},

				/**
				 * Defines the number of items per page on medium size (from 640px to 1024px). One item per page shown by default.
				 */
				itemsPerPageM: {
					type: "int",
					defaultValue: 1
				},

				/**
				 * Defines the number of items per page on small size (up to 640px). One item per page shown by default.
				 */
				itemsPerPageS: {
					type: "int",
					defaultValue: 1
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Defines the content of the component.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			events: {

				/**
				 * Fired whenever the page changes due to user interaction, when the user clicks on the navigation arrows or while resizing, based on the <code>items-per-page-l</code>, <code>items-per-page-m</code> and <code>items-per-page-s</code> properties.
				 */
				navigate: {
					parameters: {
						/**
						 * the current selected index
						 */
						selectedIndex: {
							type: "int"
						}
					}
				}
			},
			methods: ["navigateTo"],
			designtime: "sap/ui/webc/main/designtime/Carousel.designtime"
		}
	});

	/**
	 * Changes the currently displayed page.
	 * @param {int} itemIndex The index of the target page
	 * @public
	 * @name sap.ui.webc.main.Carousel#navigateTo
	 * @function
	 */

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Carousel;
});