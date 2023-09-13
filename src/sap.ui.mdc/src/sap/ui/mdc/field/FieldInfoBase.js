/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/mdc/Element',
	'sap/m/library',
	'sap/m/ResponsivePopover'
], function(
		Device,
		Element,
		mobileLibrary,
		ResponsivePopover
	) {
	"use strict";

	// shortcut for sap.m.PlacementType
	const PlacementType = mobileLibrary.PlacementType;

	/**
	 * Constructor for a new <code>FieldInfoBase</code>.
	 *
	 * This is the basis for link-features. If the link is pressed a popover might be opened.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class A <code>FieldInfoBase</code> element is a base class that shows any kind of information related to the <code>Field</code> control, for example, navigation targets or contact details.
	 * @extends sap.ui.mdc.Element
	 * @version ${version}
	 * @constructor
	 * @since 1.54.0
	 * @public
	 * @alias sap.ui.mdc.field.FieldInfoBase
	 */
	const FieldInfoBase = Element.extend("sap.ui.mdc.field.FieldInfoBase", /** @lends sap.ui.mdc.field.FieldInfoBase.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			events: {
				/**
				 * This event is fired if the data was updated.
				 */
				dataUpdate: {},
				/**
				 * This event is fired after the popover is opened.
				 */
				popoverAfterOpen: {}
			}
		}
	});

	// ----------------------- Field API --------------------------------------------

	/**
	 * Returns <code>true</code> as a <code>Promise</code> result if the control created by <code>Field</code> can be triggered.
	 * @returns {Promise<boolean>} <code>Promise</code> resolving into <code>true</code> if <code>FieldInfo</code> is clickable
	 * @public
	 */
	FieldInfoBase.prototype.isTriggerable = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method isTriggerable must be redefined");
	};

	/**
	 * Returns href as a <code>Promise</code> that defines the target navigation of the <code>Link</code> control created by <code>Field</code>.
	 * If direct navigation is used, href is returned. If the information panel contains more content than only one link, <code>null</code> is returned.
	 * @returns {Promise<string|null>} Result of <code>Promise</code> is href with values {string | null}
	 * @public
	 */
	FieldInfoBase.prototype.getTriggerHref = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getTriggerHref must be redefined");
	};

	/**
	 * Returns a <code>Promise</code> resolving into an {@link sap.ui.mdc.link.DirectLinkObject} containing the <code>href</code> and <code>target</code> of a direct navigation link.
	 * Returns a <code>Promise</code> resolving into null if there is no direct link.
	 * @returns {Promise<sap.ui.mdc.link.DirectLinkObject|null>} <code>Promise</code> resolving into <code>null</code> or a {@link sap.ui.mdc.link.DirectLinkObject}
	 * @public
	 */
	FieldInfoBase.prototype.getDirectLinkHrefAndTarget = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getDirectLinkHrefAndTarget must be redefined");
	};

	/**
	 * Opens the info panel in the control created by <code>Field</code>.
	 * @param {sap.ui.core.Control} oControl Optional control reference to which the popover is
	 * attached. By default the parent is used as reference.
	 * @returns {Promise} <code>Promise</code> that is resolved once the popover has been created
	 * @public
	 */
	FieldInfoBase.prototype.open = function(oControl) {
		oControl = oControl ? oControl : this.getParent();
		if (!oControl) {
			throw new Error("sap.ui.mdc.field.FieldInfoBase: popover can not be open because the control is undefined");
		}
		// Avoid creation of a new popover instance if the same triggerable control is triggered again.
		const oPopover = this.getDependents().find(function(oDependent) {
			return oDependent.isA("sap.m.ResponsivePopover");
		});
		if (oPopover && oPopover.isOpen()) {
			return Promise.resolve();
		}
		return this.checkDirectNavigation().then(function(bNavigated) {
			return bNavigated ? Promise.resolve() : this.createPopover().then(function(oPopover) {
				if (oPopover) {
					oPopover.openBy(oControl);

					oPopover.attachAfterOpen(function() {
						this.firePopoverAfterOpen();
					}.bind(this));
				}
			}.bind(this));
		}.bind(this));
	};

	// ----------------------- Abstract methods --------------------------------------------

	/**
	 * Returns the content of the popover.
	 * @param {Function} [fnGetAutoClosedControl] Function returning the <code>Popover</code> control that is created in <code>createPopover</code>
	 * @returns {Promise<sap.ui.core.Control>} <code>Promise</code> with a popover content of type sap.ui.Control as result
	 * @public
	 */
	FieldInfoBase.prototype.getContent = function(fnGetAutoClosedControl) {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getContent must be redefined");
	};

	/**
	 * Checks if there is a direct navigation or if there is a popover to be opened.
	 * @returns {Promise<boolean>} Resolves a Boolean value
	 * @protected
	 */
	FieldInfoBase.prototype.checkDirectNavigation = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method checkDirectNavigation must be redefined");
	};

	// ----------------------- Protected methods --------------------------------------------

	/**
	 * Returns the parent control.
	 * @returns {string | string[] | null} control instance reference
	 * @protected
	 */
	FieldInfoBase.prototype.getSourceControl = function() {
		return this.getParent();
	};

	// ----------------------- Private methods --------------------------------------------

	/**
	 * Creates a default popover instance.
	 * @returns {Promise} <code>Promise</code> with a popover as result
	 * @private
	 */
	FieldInfoBase.prototype.createPopover = function() {
		let oPopover;

		return this.getContent(function () {
			return oPopover;
		}).then(function(oPanel) {
			oPopover = new ResponsivePopover(this.getId() + "-popover", {
				contentWidth: "380px",
				horizontalScrolling: false,
				showHeader: Device.system.phone,
				placement: PlacementType.Auto,
				content: [
					oPanel
				],
				afterClose: function(oEvent) {
					if (oEvent.getSource()) {
						oEvent.getSource().destroy();
					}
				}
			});

			this.addDependent(oPopover);

			return new Promise(function(resolve, reject) {
				sap.ui.require([
					'sap/ui/fl/apply/api/FlexRuntimeInfoAPI'
				], function(FlexRuntimeInfoAPI) {
					if (FlexRuntimeInfoAPI.isFlexSupported({element: oPanel})) {
						FlexRuntimeInfoAPI.waitForChanges({element: oPanel}).then(function () {
							oPopover.addAriaLabelledBy(oPanel.getContentTitle ? oPanel.getContentTitle() : "");
							resolve(oPopover);
						});
					} else if (oPanel) {
						oPopover.addAriaLabelledBy(oPanel.getContentTitle ? oPanel.getContentTitle() : "");
						resolve(oPopover);
					}
				});
			});
		}.bind(this));
	};

	return FieldInfoBase;

});
