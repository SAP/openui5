/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/Element',
	'sap/m/ResponsivePopover'
], function(
		Element,
		ResponsivePopover
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldInfoBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A <code>FieldInfoBase</code> element is a base class that shows any kind of information related to the <code>Field</code> control, for example, navigation targets or contact details.
	 * @extends sap.ui.mdc.Element
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.54.0
	 * @alias sap.ui.mdc.field.FieldInfoBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldInfoBase = Element.extend("sap.ui.mdc.field.FieldInfoBase", /** @lends sap.ui.mdc.field.FieldInfoBase.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			events: {
				dataUpdate: {},
				popoverAfterOpen: {}
			}
		}
	});

	// ----------------------- Field API --------------------------------------------

	/**
	 * Returns <code>true</code> as a promise result if the control created by <code>Field</code> can be triggered.
	 * @returns {Promise} Promise
	 * @protected
	 */
	FieldInfoBase.prototype.isTriggerable = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method isTriggerable must be redefined");
	};

	/**
	 * Returns as a promise result href which defines the target navigation of the <code>Link</code> control created by <code>Field</code>.
	 * If direct navigation is used, href is returned. If the information panel contains more content than only one link, <code>undefined</code> is returned.
	 * @returns {Promise} Result of promise is href with values {string | undefined}
	 * @protected
	 */
	FieldInfoBase.prototype.getTriggerHref = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getTriggerHref must be redefined");
	};

	/**
	 * Returns a promise resolving in an object containing the <code>href</code> and <code>target</code> of a direct navigation link
	 * Returns a promise resolving in null if there is no direct link
	 * @returns {Promise} {Object | null}
	 */
	FieldInfoBase.prototype.getDirectLinkHrefAndTarget = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getDirectLinkHrefAndTarget must be redefined");
	};

	/**
	 * Opens the info panel in the control created by <code>Field</code>.
	 * @param {sap.ui.core.Control} oControl Optional control reference to which the popover is
	 * attached. By default the parent is used as reference.
	 * @returns {Promise} Promise which is resolved once the popover has been created
	 * @protected
	 */
	FieldInfoBase.prototype.open = function(oControl) {
		var oParent = this.getParent();
		if (!oParent) {
			throw new Error("sap.ui.mdc.field.FieldInfoBase: popover can not be open because the control is undefined");
		}
		// Avoid creation of a new popover instance if the same triggerable control is triggered again.
		if (this._oPopover && this._oPopover.isOpen()) {
			return Promise.resolve();
		}
		return this.createPopover().then(function(oPopover) {
			// Note: it is not needed to destroy this._oPopover in exit as through addDependent() the popover
			// instance will be automatically destroyed once the FieldInfoBase instance is destroyed.
			this._oPopover = oPopover;

			this.addDependent(this._oPopover);

			this._oPopover.openBy(oControl || oParent);

			this._oPopover.attachAfterOpen(function() {
				this.firePopoverAfterOpen();
			}.bind(this));
		}.bind(this));
	};

	// ----------------------- Abstract methods --------------------------------------------

	/**
	 * Returns the content of the popover.
	 * @returns {Promise} Promise with a popover content of type sap.ui.Control as result
	 * @protected
	 */
	FieldInfoBase.prototype.getContent = function(fnGetAutoClosedControl) {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getContent must be redefined");
	};
	/**
	 * Returns the title of the popover.
	 * @returns {string} Popover title
	 * @protected
	 */
	FieldInfoBase.prototype.getContentTitle = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getContentTitle must be redefined");
	};

	// ----------------------- Protected methods --------------------------------------------

	/**
	 * @returns {sap.ui.mdc.Field} <code>Field</code> control
	 * @protected
	 */
	FieldInfoBase.prototype.getSourceControl = function() {
		return this.getParent();
	};

	// ----------------------- Private methods --------------------------------------------

	/**
	 * Creates a default popover instance.
	 * @returns {Promise} Promise with a popover as result
	 * @private
	 */
	FieldInfoBase.prototype.createPopover = function() {
		var oPopover;
		return this.getContent(function () {
			return oPopover;
		}).then(function(oPanel) {

			oPopover = new ResponsivePopover(this.getId() + "-popover", {
				ariaLabelledBy: this.getContentTitle(),
				contentWidth: "380px",
				horizontalScrolling: false,
				showHeader: sap.ui.Device.system.phone,
				placement: sap.m.PlacementType.Auto,
				content: [
					oPanel, this.getContentTitle()
				],
				afterClose: function() {
					if (this._oPopover) {
						this._oPopover.destroy();
					}
				}.bind(this)
			});
			return oPopover;
		}.bind(this));
	};

	return FieldInfoBase;

});
