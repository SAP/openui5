/*!
 * ${copyright}
 */

// Provides control sap.t.ToolPage.
sap.ui.define(['./library', 'sap/ui/core/Control', 'sap/ui/Device', 'sap/ui/core/ResizeHandler'],
	function (library, Control, Device, ResizeHandler) {
		'use strict';

		/**
		 * Constructor for a new ToolPage.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The ToolPage TODO. Change the name.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public // TODO privet
		 * @since 1.36
		 * @alias sap.tnt.ToolPage
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ToolPage = Control.extend('sap.tnt.ToolPage', /** @lends sap.tnt.ToolPage.prototype */ {
			metadata: {
				library: 'sap.tnt',
				properties: {
					/**
					 * Indicates if the side navigation is expanded.
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
		 * Toggles the expand/collapse state of the side content.
		 * @returns {sap.tnt.ToolPage} Pointer to the control instance for chaining
		 * @public
		 */
		ToolPage.prototype.toggleSideContentMode = function () {
			return this.setSideExpanded(!this.getSideExpanded());
		};

		/**
		 * Sets the expand/collapse state of the side content.
		 * @param {boolean} isSideExpanded - Defines whether the side navigation is expanded.
		 * @returns {sap.tnt.ToolPage} Pointer to the control instance for chaining
		 * @public
		 */
		ToolPage.prototype.setSideExpanded = function(isSideExpanded) {
			var sideContentAggregation = this.getAggregation('sideContent');
			var isMediaQueryForPhone = Device.system.phone;
			var domRef = this.getDomRef();

			this.setProperty('sideExpanded', isSideExpanded, true);

			if (sideContentAggregation && !isMediaQueryForPhone) {
				sideContentAggregation.setExpanded(isSideExpanded);
			}

			if (!domRef) {
				return this;
			}

			if (isSideExpanded) {
				domRef.querySelector('.sapMToolPageContentWrapper').classList.remove('sapMToolPageAsideCollapsed');
			} else {
				domRef.querySelector('.sapMToolPageContentWrapper').classList.add('sapMToolPageAsideCollapsed');
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
		 * Sets the last media query
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
