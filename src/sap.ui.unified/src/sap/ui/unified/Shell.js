/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Shell.
sap.ui.define(['./ShellHeader', './ShellLayout', './library', './ShellRenderer'],
	function(ShellHeader, ShellLayout, library, ShellRenderer) {
	"use strict";



	/**
	 * Constructor for a new Shell.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The shell control is meant as root control (full-screen) of an application.
	 * It was build as root control of the Fiori Launchpad application and provides the basic capabilities
	 * for this purpose. Do not use this control within applications which run inside the Fiori Lauchpad and
	 * do not use it for other scenarios than the root control usecase.
	 * @extends sap.ui.unified.ShellLayout
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.15.1
	 * @alias sap.ui.unified.Shell
	 * @deprecated Since version 1.44.0.
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Shell = ShellLayout.extend("sap.ui.unified.Shell", /** @lends sap.ui.unified.Shell.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * The application icon. If a custom header is set this property has no effect.
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},

			/**
			 * Shows / Hides the curtain.
			 * @deprecated Since version 1.16.3.
			 * Curtain is deprecated and replaced by ShellOverlay mechanism.
			 */
			showCurtain : {type : "boolean", group : "Appearance", defaultValue : null, deprecated: true},

			/**
			 * Shows / Hides the side pane on the curtain.
			 * @deprecated Since version 1.16.3.
			 * Curtain is deprecated and replaced by ShellOverlay mechanism.
			 */
			showCurtainPane : {type : "boolean", group : "Appearance", defaultValue : null, deprecated: true},

			/**
			 * If set to false, the search area (aggregation 'search') is hidden. If a custom header is set this property has no effect.
			 * @since 1.18
			 */
			searchVisible : {type : "boolean", group : "Appearance", defaultValue : true}
		},
		aggregations : {

			/**
			 * The content to appear in the curtain area.
			 */
			curtainContent : {type : "sap.ui.core.Control", multiple : true, singularName : "curtainContent"},

			/**
			 * The content to appear in the pane area of the curtain.
			 */
			curtainPaneContent : {type : "sap.ui.core.Control", multiple : true, singularName : "curtainPaneContent"},

			/**
			 * The buttons shown in the begin (left in left-to-right case) of the Shell header. Currently max. 3 visible buttons are supported. If a custom header is set this aggregation has no effect.
			 */
			headItems : {type : "sap.ui.unified.ShellHeadItem", multiple : true, singularName : "headItem", forwarding: {idSuffix: "-header", aggregation: "headItems"}},

			/**
			 * The buttons shown in the end (right in left-to-right case) of the Shell header. Currently max. 3 visible buttons are supported (when user is set only 1). If a custom header is set this aggregation has no effect.
			 */
			headEndItems : {type : "sap.ui.unified.ShellHeadItem", multiple : true, singularName : "headEndItem", forwarding: {idSuffix: "-header", aggregation: "headEndItems"}},

			/**
			 * Experimental (This aggregation might change in future!): The search control which should be displayed in the shell header. If a custom header is set this aggregation has no effect.
			 */
			search : {type : "sap.ui.core.Control", multiple : false, forwarding: {idSuffix: "-header", aggregation: "search"}},

			/**
			 * The user item which is rendered in the shell header beside the items. If a custom header is set this aggregation has no effect.
			 * @since 1.22.0
			 */
			user : {type : "sap.ui.unified.ShellHeadUserItem", multiple : false, forwarding: {idSuffix: "-header", aggregation: "user"}}
		}
	}});


	Shell.prototype.init = function(){
		ShellLayout.prototype.init.apply(this, arguments);
		this._header = new ShellHeader(this.getId() + "-header");
		this.setHeader(this._header);
	};

	Shell.prototype.exit = function(){
		ShellLayout.prototype.exit.apply(this, arguments);
		this._header.destroy();
		delete this._header;
	};

	//Needed by sap.ui.unified.ShellOverlay
	Shell.prototype._getSearchWidth = function(){
		if (this._header === this.getHeader() && this._header.getDomRef()) {
			var $ShellSearchArea = this._header.$("hdr-center").children();
			if ($ShellSearchArea.length) {
				return $ShellSearchArea.width();
			}
		}
		return -1;
	};


	// ***************** API / Overridden generated API *****************

	Shell.prototype.setIcon = function(sIcon){
		this.setProperty("icon", sIcon, true);
		this._header.setLogo(sIcon);
		return this;
	};

	Shell.prototype.getIcon = function(){
		return this._header.getLogo();
	};

	Shell.prototype.setSearchVisible = function(bSearchVisible){
		this.setProperty("searchVisible", bSearchVisible, true);
		this._header.setSearchVisible(bSearchVisible);
		return this;
	};

	Shell.prototype.getSearchVisible = function(){
		return this._header.getSearchVisible();
	};

	/**
	 * Setter for the aggregated <code>header</code>.
	 *
	 * @param {sap.ui.core.Control} oHeader The Control which should be rendered within the Shell header or <code>null</code> to render the default Shell header.
	 * @return {sap.ui.unified.Shell} <code>this</code> to allow method chaining
	 * @public
	 */
	Shell.prototype.setHeader = function(oHeader) {
		return ShellLayout.prototype.setHeader.apply(this, [oHeader ? oHeader : this._header]);
	};

	/**
	 * Destroys the header in the aggregation named <code>header</code>, but only if a custom header is set.
	 * The default header can not be destroyed.
	 *
	 * @return {sap.ui.unified.Shell} <code>this</code> to allow method chaining
	 * @public
	 */
	Shell.prototype.destroyHeader = function() {
		if (this.getHeader() === this._header) {
			return this;
		}
		return ShellLayout.prototype.destroyHeader.apply(this, []);
	};

	return Shell;

});
