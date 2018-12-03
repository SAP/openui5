/*!
 * ${copyright}
 */

/*!
 * ${copyright}
 */

sap.ui.define([
	'./HashChangerBase',
	"sap/base/Log"
], function(HashChangerBase, Log) {
	"use strict";

	/**
	 * @class Class for manipulating and receiving changes of the relevant hash segment
	 * which belongs to a router. This Class doesn't change the browser hash directly,
	 * but informs its parent RouterHashChanger and finally changes the browser hash
	 * through the {@link sap.ui.core.routing.HashChanger}
	 *
	 * @protected
	 * @alias sap.ui.core.routing.RouterHashChanger
	 */
	var RouterHashChanger = HashChangerBase.extend("sap.ui.core.routing.RouterHashChanger", {

		constructor : function(mSettings) {
			if (!mSettings || !mSettings.parent) {
				throw new Error("sap.ui.core.routing.RouterHashChanger can't be instantiated without a parent");
			}

			this.parent = mSettings.parent;
			// if no hash is given in mSettings, the default value should be ""
			this.hash = mSettings.hash || "";
			this.subHashMap = mSettings.subHashMap;

			HashChangerBase.apply(this);
		}
	});

	RouterHashChanger.prototype.init = function() {
		this.parent.init();
	};

	/*
	 * @param {string} sKey the prefix for the sub RouterHashChanger
	 * @return {sap.ui.core.routing.RouterHashChanger} the sub RouterHashChanger
	 * @protected
	 */
	RouterHashChanger.prototype.createSubHashChanger = function(sKey) {
		this.children = this.children || {};

		if (this.children[sKey]) {
			return this.children[sKey];
		}

		var oChild = new RouterHashChanger({
			parent: this,
			subHashMap: this.subHashMap,
			hash: (this.subHashMap && this.subHashMap[sKey]) || ""
		});

		oChild.attachEvent("hashSet", this._onChildHashChanged.bind(this, sKey));
		oChild.attachEvent("hashReplaced", this._onChildHashChanged.bind(this, sKey));
		this.children[sKey] = oChild;

		return oChild;
	};

	/**
	 * Fires the hashchanged event; may be extended to modify the hash before firing the event
	 * @param {string} sHash the new hash of the browser
	 * @param {object} oSubHashMap - The prefixes and hashes for the child RouterHashChangers
	 * @protected
	 */
	RouterHashChanger.prototype.fireHashChanged = function(sHash, oSubHashMap) {
		var aKeys,
			sOldHash = this.hash;

		this.hash = sHash;
		this.subHashMap = oSubHashMap;

		this.fireEvent("hashChanged", {
			newHash : sHash,
			oldHash : sOldHash
		});

		if (this.children) {
			aKeys = Object.keys(this.children);

			aKeys.forEach(function(sChildKey) {
				var sChildHash = (oSubHashMap[sChildKey] === undefined ? "" : oSubHashMap[sChildKey]);
				this.children[sChildKey].fireHashChanged(sChildHash, oSubHashMap);
			}.bind(this));
		}
	};

	RouterHashChanger.prototype._onChildHashChanged = function(sKey, oEvent) {
		var sChildKey = oEvent.getParameter("key") || sKey;

		this.fireEvent(oEvent.getId(), {
			hash: oEvent.getParameter("hash"),
			key: sChildKey,
			deletePrefix: oEvent.getParameter("deletePrefix")
		});
	};

	RouterHashChanger.prototype._hasRouterAttached = function() {
		return this.hasListeners("hashChanged");
	};

	RouterHashChanger.prototype._collectActiveDescendantPrefix = function() {
		if (this.children) {
			var aKeys = Object.keys(this.children);
			return aKeys.reduce(function(aPrefix, sKey) {
				var oChild = this.children[sKey];

				if (oChild._hasRouterAttached()) {
					// oChild is active
					aPrefix.push(sKey);
					Array.prototype.push.apply(aPrefix, oChild._collectActiveDescendantPrefix());
				}

				return aPrefix;
			}.bind(this), []);
		} else {
			return [];
		}
	};

	/**
	 * Gets the current hash
	 *
	 * @return {string} the current hash
	 * @protected
	 */
	RouterHashChanger.prototype.getHash = function() {
		return this.hash;
	};

	/**
	 * Sets the hash to a certain value. When using this function, a browser history entry is written.
	 * If you do not want to have an entry in the browser history, please use the {@link #replaceHash} function.
	 *
	 * @param {string} sHash New hash
	 * @protected
	 */
	RouterHashChanger.prototype.setHash = function(sHash) {
		if (this._hasRouterAttached()) {
			var aDeletePrefix = this._collectActiveDescendantPrefix();

			this.fireEvent("hashSet", {
				hash: sHash,
				deletePrefix: aDeletePrefix
			});
		} else {
			Log.warning("The function setHash is called on a router which isn't matched within the last browser hashChange event. The call is ignored.");
		}
	};

	/**
	 * Replaces the hash with a certain value. When using the replace function, no browser history entry is written.
	 * If you want to have an entry in the browser history, please use the {@link #setHash} function.
	 *
	 * @param {string} sHash New hash
	 * @protected
	 */
	RouterHashChanger.prototype.replaceHash = function(sHash) {
		if (this._hasRouterAttached()) {
			var aDeletePrefix = this._collectActiveDescendantPrefix();

			this.fireEvent("hashReplaced", {
				hash: sHash,
				deletePrefix: aDeletePrefix
			});
		} else {
			Log.warning("The function replaceHash is called on a router which isn't matched within the last browser hashChange event. The call is ignored.");
		}
	};

	RouterHashChanger.prototype.destroy = function() {
		this.parent.deregisterRouterHashChanger(this);

		if (this.children) {
			Object.keys(this.children).forEach(function(sKey) {
				var oChild = this.children[sKey];
				oChild.destroy();
			}.bind(this));
			delete this.children;
		}

		delete this.hash;
		delete this.subHashMap;
		delete this.parent;

		HashChangerBase.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Removes the given RouterHashChanger from this instance as child
	 *
	 * @param {sap.ui.core.routing.RouterHashChanger} oRouterHashChanger the RouterHashChanger which is going to be removed
	 * @private
	 */
	RouterHashChanger.prototype.deregisterRouterHashChanger = function(oRouterHashChanger) {
		if (this.children) {
			Object.keys(this.children).some(function(sKey) {
				var oChild = this.children[sKey];
				if (oChild === oRouterHashChanger) {
					delete this.children[sKey];
					return true;
				}
			}.bind(this));
		}
	};

	return RouterHashChanger;

});
