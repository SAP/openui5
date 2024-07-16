/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/EventProvider'
], function(EventProvider) {
	"use strict";

	/**
	 * @class Base Class for manipulating and receiving changes of hash segment.
	 *
	 * Fires a <code>hashChanged</code> event if the relevant hash changes.
	 * @extends sap.ui.base.EventProvider
	 *
	 * @protected
	 * @alias sap.ui.core.routing.HashChangerBase
	 */
	var HashChangerBase = EventProvider.extend("sap.ui.core.routing.HashChangerBase", {

		metadata : {
			"abstract" : true
		},

		constructor : function() {
			EventProvider.apply(this);
		}
	});

	HashChangerBase.M_EVENTS = {
		"HashChanged": "hashChanged",
		"HashSet": "hashSet",
		"HashReplaced": "hashReplaced"
	};

	/**
	 * The 'hashChanged' event is fired when the relevant hash segment is changed
	 *
	 * @name sap.ui.core.routing.HashChangerBase#hashChanged
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.oldHash The hash segment before it's changed
	 * @param {object} oEvent.getParameters.newHash The new hash segment
	 * @param {string} [oEvent.getParameters.fullHash] The full format of the hash if the newHash only contains part of
	 *  the relevant hash
	 * @protected
	 */

	/**
	 * The 'hashSet' event is fired when {@link sap.ui.core.routing.HashChangerBase#setHash} is called
	 *
	 * @name sap.ui.core.routing.HashChanger#hashSet
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.hash The relevant hash segment
	 * @protected
	 */

	/**
	 * The 'hashReplaced' event is fired when {@link sap.ui.core.routing.HashChangerBase#replaceHash} is called
	 *
	 * @name sap.ui.core.routing.HashChangerBase#hashReplaced
	 * @event
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {string} oEvent.getParameters.hash The relevant hash segment
	 * @protected
	 */

	/**
	 * Gets the current hash
	 *
	 * @return {string} the current hash
	 *
	 * @function
	 * @name sap.ui.core.HashChangerBase#getHash
	 * @protected
	 */

	/**
	 * Sets the hash to a certain value. When using this function, a browser history entry is written.
	 * If you do not want to have an entry in the browser history, please use the {@link #replaceHash} function.
	 *
	 * @param {string} sHash New hash
	 * @protected
	 */
	HashChangerBase.prototype.setHash = function(sHash) {
		this.fireEvent("hashSet", {
			sHash: sHash, // deprecated
			hash: sHash
		});
	};

	/**
	 * Replaces the hash with a certain value. When using the replace function, no browser history entry is written.
	 * If you want to have an entry in the browser history, please use the {@link #setHash} function.
	 *
	 * The <code>sDirection</code> parameter can be used to provide direction information on the navigation which
	 * leads to this hash replacement. This is typically used when synchronizing the hashes between multiple frames to
	 * provide information to the frame where the hash is replaced with the navigation direction in the other frame
	 * where the navigation occurs.
	 *
	 * @param {string} sHash New hash
	 * @param {sap.ui.core.routing.HistoryDirection} sDirection The direction information for this hash replacement
	 * @protected
	 */
	HashChangerBase.prototype.replaceHash = function(sHash, sDirection) {
		this.fireEvent("hashReplaced", {
			sHash: sHash, //deprecated
			hash: sHash,
			direction: sDirection
		});
	};

	return HashChangerBase;

});
