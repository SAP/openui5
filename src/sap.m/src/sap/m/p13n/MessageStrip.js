/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/m/MessageStrip',
	'sap/ui/core/library',
	'sap/ui/core/Lib',
	'sap/ui/core/InvisibleMessage',
	'sap/m/MessageStripRenderer'
], (MessageStrip, coreLibrary, Library, InvisibleMessage, MessageStripRenderer) => {
	"use strict";

	const { InvisibleMessageMode } = coreLibrary;

	/**
	 * Constructor for a new <code>MessageStrip</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This MessageStrip serves as accessibility enhancement for the <code>MessageStrip</code> control.
	 * By default, the MessageStrip does not provide the capabilites to announce its content to screen readers.
	 *
	 * @extends sap.m.MessageStrip
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
         * @ui5-restricted sap.m.p13n, sap.ui.mdc
	 * @since 1.129
	 * @alias sap.m.p13n.MessageStrip
	 */
	const AccessibleMessageStrip = MessageStrip.extend("sap.m.p13n.MessageStrip", {
		metadata: {
			properties: {
				/**
				 * Defines whether the message strip should be announced when initalized.
				 * By default, the message strip will be announced using <code>InvisibleMessage</code> when the control is rendered.
				 *
				 * @ui5-restricted sap.m.p13n, sap.ui.mdc
				 */
				announceOnInit: { type: "boolean", defaultValue: true }
			}
		},
		renderer: MessageStripRenderer
	});

	AccessibleMessageStrip.prototype.applySettings = function () {
		MessageStrip.prototype.applySettings.apply(this, arguments);
		if (this.getAnnounceOnInit()) {
			const sType = this.getType();
			const sText = this.getText();
			const oRB = Library.getResourceBundleFor("sap.m");
			InvisibleMessage.getInstance().announce(oRB.getText("p13n.MESSAGE_STRIP_ANNOUNCEMENT", [sType, sText]), InvisibleMessageMode.Assertive);
		}
		return this;
	};

	return AccessibleMessageStrip;
});