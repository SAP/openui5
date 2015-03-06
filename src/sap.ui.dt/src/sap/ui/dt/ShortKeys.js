/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ShortKeys.
sap.ui.define([
	'jquery.sap.global'
],
function(jQuery) {
	"use strict";


	/**
	 * Constructor for a new ShortKeys instance.
	 * 
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * If Wysiwyg is used standalone the ShortKeys provide short key functionality (Wysiwyg property keybinding = true).
	 * Shortkeys are registered via mousetrap (needs to be loaded in the iframe or to know the iframe window via patch) 
	 * and publish events on the eventBus.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ShortKeys
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var ShortKeys = function(oDesignTime) {
		this._oDesignTime = oDesignTime;
		this.oEventBus = oDesignTime.oEventBus;
		this.enableKeybinding = oDesignTime.getProperty("keybinding");
		
		this.defaultConfig = [ {
			shortkey : [ "ctrl+c", "command+c" ],
			eventName : "control.copy"
		}, {
			shortkey : [ "ctrl+v", "command+v" ],
			eventName : "control.paste"

		}, {
			shortkey : [ "ctrl+x", "command+x" ],
			eventName : "control.cut"

		}, {
			shortkey : [ "ctrl+z", "command+z" ],
			eventName : "control.undo"

		}, {
			shortkey : [ "ctrl+y", "command+y" ],
			eventName : "control.redo"

		}, {
			shortkey : [ "ctrl+a", "command+a" ],
			eventName : "control.toggle",
			data : {
				action : "select"
			}
		}, {
			shortkey : [ "left" ],
			eventName : "control.changeSelection",
			data : {
				action : "previousSibling"
			}
		}, {
			shortkey : [ "right" ],
			eventName : "control.changeSelection",
			data : {
				action : "nextSibling"
			}
		}, {
			shortkey : [ "up" ],
			eventName : "control.changeSelection",
			data : {
				action : "parent"
			}
		}, {
			shortkey : [ "down" ],
			eventName : "control.changeSelection",
			data : {
				action : "child"
			}
		}, {
			shortkey : [ "del", "command+backspace" ],
			eventName : "control.remove"

		}, {
			shortkey : [ "esc" ],
			eventName : "control.toggle",
			data : {
				action : "deselect"
			}

		} ];

		this.init();
	};
	
	/**
	 * @protected
	 * @override
	 */
	ShortKeys.prototype.init = function() {
		if (this.enableKeybinding) {
			this._oDesignTime.attachEvent("canvasLoaded", function() {
				var oScope = this._oDesignTime.getScope();
				if (oScope.getWindow().Mousetrap){
					oScope.getWindow().Mousetrap.registerDocument(oScope.getDocument());
				}
				for (var i = this.defaultConfig.length - 1; i >= 0; i--) {
					this.setKey(this.defaultConfig[i].shortkey, this.defaultConfig[i].eventName, this.defaultConfig[i].data);
				}
			}, this);
		}
	};
	
	ShortKeys.prototype.setKey = function(shortkey, eventName, data) {
		//convert to iframe arrays
		var aScopedShortKeys = this.oScope.getWindow().jQuery.makeArray(shortkey);
		//If mousetrap is included in iframe page
		if (this.oScope.getWindow().Mousetrap){
			this.oScope.getWindow().Mousetrap.bind(aScopedShortKeys, function(evt) {
				jQuery("[data-sap-ui-wysiwyg]").control().forEach(function(oDesignTime) {
					oDesignTime.oEventBus.publish(eventName, data);
				});
			});
		}
	};

		return ShortKeys;
}, /* bExport= */ true);