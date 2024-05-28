/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/mdc/Element',
	'sap/m/library',
	'sap/m/ResponsivePopover',
	'sap/base/Log'
], (
	Device,
	Element,
	mobileLibrary,
	ResponsivePopover,
	Log
) => {
	"use strict";

	// shortcut for sap.m.PlacementType
	const { PlacementType } = mobileLibrary;

	/**
	 * Constructor for a new <code>FieldInfoBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * A <code>FieldInfoBase</code> element is a base class that shows any kind of information related to the <code>Field</code> control, for example, navigation targets or contact details.
	 * This is the basis for link-features. If the link is pressed a popover might be opened.
	 * @extends sap.ui.mdc.Element
	 * @version ${version}
	 * @constructor
	 * @since 1.54.0
	 * @public
	 * @alias sap.ui.mdc.field.FieldInfoBase
	 */
	const FieldInfoBase = Element.extend("sap.ui.mdc.field.FieldInfoBase", /** @lends sap.ui.mdc.field.FieldInfoBase.prototype */ {
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
	 * @param {sap.ui.base.Event} oEvent Object of the event that gets fired by the <code>onPress</code> event of the link in <code>Field</code>
	 * attached. By default the parent is used as reference.
	 * @returns {Promise} <code>Promise</code> that is resolved once the popover has been created
	 * @public
	 */
	FieldInfoBase.prototype.open = async function(oControl, oEvent) {
		oControl = oControl ? oControl : this.getParent();
		if (!oControl) {
			throw new Error("sap.ui.mdc.field.FieldInfoBase: popover can not be open because the control is undefined");
		}
		// Avoid creation of a new popover instance if the same triggerable control is triggered again.
		const oDependentPopover = this.getPopover();
		if (oDependentPopover && oDependentPopover.isOpen()) {
			return Promise.resolve();
		}

		const bNavigate = await this.checkDirectNavigation(oEvent);
		if (bNavigate === false) {
			const oPopover = await this.createPopover();
			if (oPopover && !this.isDestroyed() && !oControl.isDestroyed()) {
				oPopover.openBy(oControl);
				oPopover.attachAfterOpen(() => {
					this.firePopoverAfterOpen();
				});
			}
		}
		return Promise.resolve();
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
	FieldInfoBase.prototype.createPopover = async function() {
		try {
			const oPanel = await this.getContent(() => {
				return this.getPopover();
			});
			return this._createPopover(oPanel);
		} catch (oException) {
			Log.error(oException);
			return this._createPopover(undefined);
		}
	};

	/**
	 *	Creates a new {@link sap.m.ResponsivePopover}
	 * @param {sap.ui.core.Control} oPanel Instance of the <code>Panel</code> that is displayed on the <code>Popover/code>.
	 * @returns {Promise<sap.m.ResponsivePopover>} <code>Promise</code> with a popover as result
	 * @private
	 */
	FieldInfoBase.prototype._createPopover = function(oPanel) {
		const oPopover = new ResponsivePopover(this.getPopoverId(), {
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

		return new Promise((resolve, reject) => {
			sap.ui.require([
				'sap/ui/fl/apply/api/FlexRuntimeInfoAPI'
			], async (FlexRuntimeInfoAPI) => {
				if (FlexRuntimeInfoAPI.isFlexSupported({ element: oPanel })) {
					await FlexRuntimeInfoAPI.waitForChanges({ element: oPanel });
				}
				if (this.retrievePopoverTitle) {
					const { sTitle, oLabelledByControl } = await this.retrievePopoverTitle(oPanel);
					oPopover.setTitle(sTitle);
					oPopover.addAriaLabelledBy(oLabelledByControl);
				}
				resolve(oPopover);
			});
		});
	};

	/**
	 * Gets the current {@link sap.m.ResponsivePopover} of the <code>FieldInfo</code>
	 * @returns {sap.m.ResponsivePopover|undefined} Instance of the <code>Popover/code> or <code>undefined</code>.
	 * @private
	 */
	FieldInfoBase.prototype.getPopover = function() {
		return this.getDependents().find((oDependent) => {
			return oDependent.isA("sap.m.ResponsivePopover") && oDependent.getId() === this.getPopoverId();
		});
	};

	/**
	 * Gets the ID for the <code>Popover/code> by adding "-popover" to the ID of the <code>FieldInfo</code>
	 * @returns {string} ID for the <code>Popover/code>
	 * @private
	 */
	FieldInfoBase.prototype.getPopoverId = function() {
		return this.getId() + "-popover";
	};

	return FieldInfoBase;

});