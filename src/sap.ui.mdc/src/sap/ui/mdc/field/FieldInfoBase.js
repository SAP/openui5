/*
 * ! ${copyright}
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
	var PlacementType = mobileLibrary.PlacementType;

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
	 * @experimental As of version 1.54
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.mdc.field.FieldInfoBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FieldInfoBase = Element.extend("sap.ui.mdc.field.FieldInfoBase", /** @lends sap.ui.mdc.field.FieldInfoBase.prototype */
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
		oControl = oControl ? oControl : this.getParent();
		if (!oControl) {
			throw new Error("sap.ui.mdc.field.FieldInfoBase: popover can not be open because the control is undefined");
		}
		// Avoid creation of a new popover instance if the same triggerable control is triggered again.
		var oPopover = this.getDependents().find(function(oDependent) {
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
	 * @returns {Promise} Promise with a popover content of type sap.ui.Control as result
	 * @protected
	 */
	FieldInfoBase.prototype.getContent = function(fnGetAutoClosedControl) {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method getContent must be redefined");
	};

	/**
	 * Checks if there is a direct navigation or if there is a popover to be opened.
	 * @returns {Promise} Resolves a Boolean value
	 * @protected
	 */
	FieldInfoBase.prototype.checkDirectNavigation = function() {
		throw new Error("sap.ui.mdc.field.FieldInfoBase: method checkDirectNavigation must be redefined");
	};

	// ----------------------- Protected methods --------------------------------------------

	/**
	 * Returns the parent control.
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
