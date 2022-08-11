/*!
 * ${copyright}
 */

// Provides control sap.f.IllustratedMessage.
sap.ui.define([
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageRenderer",
	"./library"
], function(
	sapMIllustratedMessage,
	IllustratedMessageRenderer
	/*, library */
) {
	"use strict";

	/**
	 * Constructor for a new <code>IllustratedMessage</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A combination of message and illustration to represent an empty or a success state.
	 *
	 * <h3>Overview</h3>
	 *
	 * An <code>IllustratedMessage</code> is a recommended combination of a solution-oriented message,
	 * an engaging illustration, and conversational tone to better communicate an empty or a success state
	 * than just show a message alone.
	 * Empty states are moments in the user experience where there’s no data to display.
	 * Success states are occasions to celebrate and reward a user’s special accomplishment or the completion of an important task.
	 *
	 * The <code>IllustratedMessage</code> control is meant to be used inside container controls,
	 * for example a <code>Card</code>, a <code>Dialog</code>, or a <code>Page</code>.
	 *
	 * <h3>Structure</h3>
	 *
	 * The <code>IllustratedMessage</code> consists of the following elements, which are displayed below
	 * each other in the following order:
	 * <ul>
	 * <li>Illustration</li>
	 * <li>Title</li>
	 * <li>Description</li>
	 * <li>Additional Content</li>
	 * </ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The <code>IllustratedMessage</code> control can adapt depending on the API settings provided by the app developer
	 * and the available space of its parent container. Some of the structural elements are displayed differently or
	 * are omitted in the different breakpoint sizes (XS, S, M, L).
	 *
	 * @extends sap.m.IllustratedMessage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.98. Use the {@link sap.m.IllustratedMessage} instead.
	 * @since 1.88
	 * @alias sap.f.IllustratedMessage
	 */
	var IllustratedMessage = sapMIllustratedMessage.extend("sap.f.IllustratedMessage", /** @lends sap.f.IllustratedMessage.prototype */ {
		metadata: {
			library: "sap.f",
			deprecated: true,
			properties: { }
		},
		renderer: IllustratedMessageRenderer
	});

	return IllustratedMessage;
});
