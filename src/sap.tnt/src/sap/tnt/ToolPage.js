/*!
 * ${copyright}
 */

// Provides control sap.t.ToolPage.
sap.ui.define([
    './library',
    'sap/ui/core/Control',
    'sap/ui/Device',
    'sap/ui/core/ResizeHandler',
    "./ToolPageRenderer"
],
	function(library, Control, Device, ResizeHandler, ToolPageRenderer) {
		'use strict';

		/**
		 * Constructor for a new ToolPage.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The ToolPage is a layout control, used to create a basic tools app that has a header, side navigation and contents area.
		 * <h4>Overview</h4>
		 * The control has three main areas - a header on top, navigation to the side and a content are that can hold any control. The header and side navigation use custom controls
		 * - {@link sap.tnt.ToolHeader} and {@link sap.tnt.SideNavigation}.
		 * <h4>Usage</h4>
		 * The main usage for the asp.tnt controls is for scenarios in the tooling or administration space.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.ToolPage
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ToolPage = Control.extend('sap.tnt.ToolPage', /** @lends sap.tnt.ToolPage.prototype */ {
			metadata: {
				library: 'sap.tnt',
				properties: {
					/**
					 * Indicates if the side area is expanded. Overrides the expanded property of the sideContent aggregation.
					 */
					sideExpanded: {type: 'boolean', group: 'Misc', defaultValue: true}
				},
				aggregations: {
					/**
					 * The control to appear in the header area.
					 */
					header: {type: 'sap.tnt.ToolHeader', multiple: false},
					/**
					 * The side menu of the layout.
					 */
					sideContent: {type: 'sap.tnt.SideNavigation', multiple: false},
					/**
					 * The content section.
					 */
					mainContents: {type: 'sap.ui.core.Control', multiple: true, singularName: 'mainContent'}
				},
				events: {}
			}
		});

		/**
		 * Toggles the expand/collapse state of the SideContent.
		 * @returns {sap.tnt.ToolPage} Pointer to the control instance for chaining.
		 * @public
		 */
		ToolPage.prototype.toggleSideContentMode = function () {
			return this.setSideExpanded(!this.getSideExpanded());
		};

		/**
		 * Sets the expand/collapse state of the SideContent.
		 * @param {boolean} isSideExpanded defines whether the SideNavigation is expanded.
		 * @returns {sap.tnt.ToolPage} Pointer to the control instance for chaining
		 * @public
		 */
		ToolPage.prototype.setSideExpanded = function(isSideExpanded) {
			var sideContentAggregation = this.getAggregation('sideContent');
			var domRef = this.getDomRef();

			this.setProperty('sideExpanded', isSideExpanded, true);

			if (sideContentAggregation) {
				var newState = Device.system.phone ? true :  isSideExpanded;
				sideContentAggregation.setExpanded(newState);
			}

			if (!domRef) {
				return this;
			}

			if (isSideExpanded) {
				domRef.querySelector('.sapTntToolPageContentWrapper').classList.remove('sapTntToolPageAsideCollapsed');
			} else {
				domRef.querySelector('.sapTntToolPageContentWrapper').classList.add('sapTntToolPageAsideCollapsed');
			}

			return this;
		};

		ToolPage.prototype.onBeforeRendering = function () {
			this._deregisterControl();
		};

		ToolPage.prototype.onAfterRendering = function () {
			this._ResizeHandler = ResizeHandler.register(this.getDomRef(), this._mediaQueryHandler.bind(this));

			this._updateLastMediaQuery();
		};

		ToolPage.prototype.exit = function () {
			this._deregisterControl();
		};

		/**
		 * @private
		 */
		ToolPage.prototype._deregisterControl = function () {
			if (this._ResizeHandler) {
				ResizeHandler.deregister(this._ResizeHandler);
				this._ResizeHandler = null;
			}
		};

		/**
		 * Handles the change of the screen size.
		 * @private
		 */
		ToolPage.prototype._mediaQueryHandler = function () {
			var sideContentAggregation = this.getAggregation('sideContent');

			if (sideContentAggregation === null) {
				return;
			}

			this._currentMediaQuery = this._getDeviceAsString();

			if (this._getLastMediaQuery() === this._currentMediaQuery) {
				return;
			}

			switch (this._currentMediaQuery) {
				case 'Combi':
					this.setSideExpanded(true);
					break;
				case 'Tablet':
					this.setSideExpanded(false);
					break;
				case 'Phone':
					this.setSideExpanded(false);
					sideContentAggregation.setExpanded(true);
					break;
				default:
					this.setSideExpanded(true);
					break;
			}

			this._updateLastMediaQuery();
		};

		/**
		 * Returns the last media query.
		 * @returns {undefined|string}
		 * @private
		 */
		ToolPage.prototype._getLastMediaQuery = function () {
			return this._lastMediaQuery;
		};

		/**
		 * Sets the last media query.
		 * @returns {ToolPage}
		 * @private
		 */
		ToolPage.prototype._updateLastMediaQuery = function () {
			this._lastMediaQuery = this._getDeviceAsString();

			return this;
		};

		/**
		 *
		 */
		ToolPage.prototype._getDeviceAsString = function () {
			if (Device.system.combi) {
				return 'Combi';
			}

			if (Device.system.phone) {
				return 'Phone';
			}

			if (Device.system.tablet) {
				return 'Tablet';
			}

			return 'Desktop';
		};

		return ToolPage;

	}, /* bExport= */ true
);
