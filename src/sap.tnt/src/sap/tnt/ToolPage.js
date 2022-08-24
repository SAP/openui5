/*!
 * ${copyright}
 */

// Provides control sap.t.ToolPage.
sap.ui.define([
	"./library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"./ToolPageRenderer"
], function (library,
			 ManagedObjectObserver,
			 Control,
			 Device,
			 ResizeHandler,
			 ToolPageRenderer) {
	"use strict";

	/**
	 * Constructor for a new ToolPage.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ToolPage is a layout control, used to create a basic tools app that has a header, side navigation and contents area.
	 * <h4>Overview</h4>
	 * The control has three main areas - a header on top, navigation to the side and a content area that can hold any control. The header and side navigation use custom controls
	 * - {@link sap.tnt.ToolHeader} and {@link sap.tnt.SideNavigation}.
	 * <h4>Usage</h4>
	 * The main usage of the sap.tnt controls is for scenarios in the tooling or administration space.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.tnt.ToolPage
	 */
	var ToolPage = Control.extend("sap.tnt.ToolPage", /** @lends sap.tnt.ToolPage.prototype */ {
		metadata: {
			library: "sap.tnt",
			properties: {
				/**
				 * Indicates if the side menu is expanded.
				 * Overrides the <code>expanded</code> property of the <code>sideContent</code> aggregation.
				 */
				sideExpanded: {type: "boolean", group: "Misc", defaultValue: true}
			},
			aggregations: {
				/**
				 * The control to appear in the header area.
				 */
				header: {type: "sap.tnt.IToolHeader", multiple: false},

				/**
				 * The control to appear in the subheader area.
				 * @since 1.93
				 */
				subHeader: {type: "sap.tnt.IToolHeader", multiple: false },
				/**
				 * The side menu of the layout.
				 */
				sideContent: {type: "sap.tnt.SideNavigation", multiple: false},
				/**
				 * The content section.
				 */
				mainContents: {type: "sap.ui.core.Control", multiple: true, singularName: "mainContent"}
			},
			events: {}
		}
	});

	ToolPage.prototype.init = function () {
		this._oContentObserver = new ManagedObjectObserver(this._onContentChange.bind(this));
		this._oContentObserver.observe(this, { aggregations: ["subHeader", "sideContent"] });

		this._oContentVisibilityObserver = new ManagedObjectObserver(this._onContentVisibilityChange.bind(this));

		this._deregisterControl();
	};

	ToolPage.prototype.exit = function () {
		this._deregisterControl();

		if (this._oContentObserver) {
			this._oContentObserver.disconnect();
			this._oContentObserver = null;
		}

		if (this._oContentVisibilityObserver) {
			this._oContentVisibilityObserver.disconnect();
			this._oContentVisibilityObserver = null;
		}
	};

	ToolPage.prototype.onBeforeRendering = function () {
		this._deregisterControl();
	};

	ToolPage.prototype.onAfterRendering = function () {
		this._ResizeHandler = ResizeHandler.register(this.getDomRef(), this._mediaQueryHandler.bind(this));

		this._updateLastMediaQuery();
	};

	/**
	 * Toggles the expand/collapse state of the SideContent.
	 * @returns {this} Pointer to the control instance for chaining.
	 * @public
	 */
	ToolPage.prototype.toggleSideContentMode = function () {
		return this.setSideExpanded(!this.getSideExpanded());
	};

	/**
	 * Sets the expand/collapse state of the SideContent.
	 * @param {boolean} bSideExpanded defines whether the SideNavigation is expanded.
	 * @returns {this} Pointer to the control instance for chaining
	 * @public
	 */
	ToolPage.prototype.setSideExpanded = function (bSideExpanded) {
		this.setProperty("sideExpanded", bSideExpanded, true);

		var oSideContent = this.getSideContent();
		if (oSideContent) {
			var bNewState = Device.system.phone ? true : bSideExpanded;
			oSideContent.setExpanded(bNewState);
		} else {
			return this;
		}

		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return this;
		}

		if (bSideExpanded) {
			oDomRef.querySelector(".sapTntToolPageContentWrapper").classList.remove("sapTntToolPageAsideCollapsed");
		} else {
			oDomRef.querySelector(".sapTntToolPageContentWrapper").classList.add("sapTntToolPageAsideCollapsed");
		}

		return this;
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
		var oSideContent = this.getSideContent();

		if (oSideContent === null) {
			return;
		}

		this._currentMediaQuery = this._getDeviceAsString();

		if (this._getLastMediaQuery() === this._currentMediaQuery) {
			return;
		}

		switch (this._currentMediaQuery) {
			case "Combi":
				this.setSideExpanded(true);
				break;
			case "Tablet":
				this.setSideExpanded(false);
				break;
			case "Phone":
				this.setSideExpanded(false);
				oSideContent.setExpanded(true);
				break;
			default:
				this.setSideExpanded(true);
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

	ToolPage.prototype._getDeviceAsString = function () {
		if (Device.system.combi) {
			return "Combi";
		}

		if (Device.system.phone) {
			return "Phone";
		}

		if (Device.system.tablet) {
			return "Tablet";
		}

		return "Desktop";
	};

	ToolPage.prototype._onContentChange = function(oChanges) {
		switch (oChanges.mutation) {
			case "insert":
				this._oContentVisibilityObserver.observe(oChanges.child, { properties: ["visible"] });
				break;
			case "remove":
				this._oContentVisibilityObserver.unobserve(oChanges.child, { properties: ["visible"] });
				break;
		}
	};

	ToolPage.prototype._onContentVisibilityChange = function(oChanges) {
		this.invalidate();
	};

	return ToolPage;
});