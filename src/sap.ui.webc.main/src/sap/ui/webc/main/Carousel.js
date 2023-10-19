/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Carousel.
sap.ui.define([
	"sap/ui/core/webc/WebComponent",
	"./library",
	"./thirdparty/Carousel"
], function(WebComponent, library) {
	"use strict";

	var BackgroundDesign = library.BackgroundDesign;
	var BorderDesign = library.BorderDesign;
	var CarouselArrowsPlacement = library.CarouselArrowsPlacement;
	var CarouselPageIndicatorStyle = library.CarouselPageIndicatorStyle;

	/**
	 * Constructor for a new <code>Carousel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.core.webc.WebComponent
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
	 * <ul>
	 *     <li>[UP/DOWN] - Navigates to previous and next item</li>
	 *     <li>[LEFT/RIGHT] - Navigates to previous and next item</li>
	 * </ul>
	 *
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.Carousel</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>content - Used to style the content of the component</li>
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
				 *     <li><code>Content</code> - the arrows are placed on the sides of the current page.</li>
				 *     <li><code>Navigation</code> - the arrows are placed on the sides of the page indicator.</li>
				 * </ul>
				 */
				arrowsPlacement: {
					type: "sap.ui.webc.main.CarouselArrowsPlacement",
					defaultValue: CarouselArrowsPlacement.Content
				},

				/**
				 * Defines the carousel's background design.
				 */
				backgroundDesign: {
					type: "sap.ui.webc.main.BackgroundDesign",
					defaultValue: BackgroundDesign.Translucent
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
				 * Defines the visibility of the page indicator. If set to true the page indicator will be hidden.
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
				},

				/**
				 * Defines the page indicator background design.
				 */
				pageIndicatorBackgroundDesign: {
					type: "sap.ui.webc.main.BackgroundDesign",
					defaultValue: BackgroundDesign.Solid
				},

				/**
				 * Defines the page indicator border design.
				 */
				pageIndicatorBorderDesign: {
					type: "sap.ui.webc.main.BorderDesign",
					defaultValue: BorderDesign.Solid
				},

				/**
				 * Defines the style of the page indicator. Available options are:
				 * <ul>
				 *     <li><code>Default</code> - The page indicator will be visualized as dots if there are fewer than 9 pages. If there are more pages, the page indicator will switch to displaying the current page and the total number of pages. (e.g. X of Y)</li>
				 *     <li><code>Numeric</code> - The page indicator will display the current page and the total number of pages. (e.g. X of Y)</li>
				 * </ul>
				 */
				pageIndicatorStyle: {
					type: "sap.ui.webc.main.CarouselPageIndicatorStyle",
					defaultValue: CarouselPageIndicatorStyle.Default
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
