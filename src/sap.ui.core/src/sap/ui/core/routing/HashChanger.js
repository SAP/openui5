// Copyright (c) 2013 SAP SE, All Rights Reserved
/*global hasher */
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/thirdparty/signals', 'sap/ui/thirdparty/hasher'],
	function(jQuery, EventProvider, signals, hasher1) {
	"use strict";

	/**
	 * @class Class for manipulating and receiving changes of the browserhash with the hasher framework.
	 * Fires a "hashChanged" event if the browser hash changes.
	 * @extends sap.ui.base.EventProvider
	 *
	 * @public
	 * @name sap.ui.core.routing.HashChanger
	 */
	var HashChanger = EventProvider.extend("sap.ui.core.routing.HashChanger", {
	
		constructor : function() {
	
			EventProvider.apply(this);
	
		}
	
	});

	/**
	 * Will start listening to hashChanges with the parseHash function.
	 * This will also fire a hashchanged event with the initial hash.
	 *
	 * @public
	 * @return false if it was initialized before, true if it was initialized the first time
	 * @name sap.ui.core.routing.HashChanger#init
	 * @function
	 */
	HashChanger.prototype.init = function() {
		if (this._initialized) {
			jQuery.sap.log.info("this HashChanger instance has already been initialized.");
			return false;
		}

		hasher.changed.add(this.fireHashChanged, this); //parse hash changes

		if (!hasher.isActive()) {
			hasher.initialized.addOnce(this.fireHashChanged, this); //parse initial hash
			hasher.init(); //start listening for history change
		} else {
			this.fireHashChanged(hasher.getHash());
		}

		this._initialized = true;
		return this._initialized;
	};

	/**
	 * Fires the hashchanged event, may be extended to modify the hash before fireing the event
	 * @param {string} newHash the new hash of the browser
	 * @param {string} oldHash - the previous hash
	 * @protected
	 * @name sap.ui.core.routing.HashChanger#fireHashChanged
	 * @function
	 */
	HashChanger.prototype.fireHashChanged = function(newHash, oldHash) {
		this.fireEvent("hashChanged",{ newHash : newHash, oldHash : oldHash });
	};

	/**
	 * Sets the hash to a certain value. When using the set function a browser history  entry is written. 
	 * If you do not want to have an entry in the browser history, please use set replaceHash function.
	 * @param {string} sHash the hash
	 * @public
	 * @name sap.ui.core.routing.HashChanger#setHash
	 * @function
	 */
	HashChanger.prototype.setHash = function(sHash) {
		this.fireEvent("hashSet", { sHash : sHash });
		hasher.setHash(sHash);
	};

	/**
	 * Replaces the hash to a certain value. When using the replace function no browser history is written. 
	 * If you want to have an entry in the browser history, please use set setHash function.
	 * @param {string} sHash the hash
	 * @public
	 * @name sap.ui.core.routing.HashChanger#replaceHash
	 * @function
	 */
	HashChanger.prototype.replaceHash = function(sHash) {
		this.fireEvent("hashReplaced", { sHash : sHash });
		hasher.replaceHash(sHash);
	};

	/**
	 * Gets the current hash
	 * 
	 * @return {string} the current hash
	 * @public
	 * @name sap.ui.core.routing.HashChanger#getHash
	 * @function
	 */
	HashChanger.prototype.getHash = function() {
		return hasher.getHash();
	};

	/**
	 * Cleans the event registration
	 * @see sap.ui.base.Object.prototype.destroy
	 * @protected
	 * @name sap.ui.core.routing.HashChanger#destroy
	 * @function
	 */
	HashChanger.prototype.destroy = function() {
		hasher.changed.remove(this.fireHashChanged, this);
		EventProvider.prototype.destroy.apply(this, arguments);
	};
	
	(function() {

		var _oHashChanger = null;

		/**
		 * Gets a global singleton of the HashChanger. The singleton will get created when this function is invoked for the first time.
		 * @public
		 * @static
		 * @name sap.ui.core.routing.HashChanger.getInstance
		 * @function
		 */
		HashChanger.getInstance = function() {
			if (!_oHashChanger) {
				_oHashChanger = new HashChanger();
			}
			return _oHashChanger;
		};

		/**
		 * Sets the hashChanger to a new instance, destroys the old one and copies all its event listeners to the new one
		 * @param {sap.ui.core.routing.HashChanger} oHashChanger the new instance for the global singleton
		 * @protected
		 * @name sap.ui.core.routing.HashChanger.replaceHashChanger
		 * @function
		 */
		HashChanger.replaceHashChanger = function(oHashChanger) {
			if (_oHashChanger) {
				jQuery.extend(oHashChanger.mEventRegistry, _oHashChanger.mEventRegistry);
				_oHashChanger.destroy();
			}

			_oHashChanger = oHashChanger;
		};
		
	}());

	return HashChanger;

}, /* bExport= */ true);
