/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/testrecorder/interaction/ContextMenu",
	"sap/ui/testrecorder/interaction/CommandExecutor",
	"sap/ui/testrecorder/interaction/Commands",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels"
], function (BaseObject, ContextMenu, CommandExecutor, Commands, CommunicationBus, CommunicationChannels) {
	"use strict";

	var oRecordListener = null;

	var RecordListener = BaseObject.extend("sap.ui.testrecorder.interaction.RecordListener", {
		constructor: function () {
			if (!oRecordListener) {
				Object.apply(this, arguments);
				this._fnClickListener = this._onClick.bind(this);
				this._fnContextmenuListener = this._onContextmenu.bind(this);
			} else {
				return oRecordListener;
			}
		}
	});

	RecordListener.prototype.init = function () {
		document.addEventListener("click", this._fnClickListener);
		document.addEventListener("contextmenu", this._fnContextmenuListener);
		CommunicationBus.subscribe(CommunicationChannels.CONTEXT_MENU_HIGHLIGHT, this._onContextHighlight.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.CONTEXT_MENU_PRESS, this._onContextPress.bind(this));
		CommunicationBus.subscribe(CommunicationChannels.CONTEXT_MENU_ENTER_TEXT, this._onContextEnterText.bind(this));
	};

	RecordListener.prototype.stop = function () {
		ContextMenu.hide();
		document.removeEventListener("click", this._fnClickListener);
		document.removeEventListener("contextmenu", this._fnContextmenuListener);
	};

	RecordListener.prototype._onClick = function (oEvent) {
		oEvent.preventDefault();
		oEvent.stopPropagation();
		ContextMenu.hide();
	};

	RecordListener.prototype._onContextmenu = function (oEvent) {
		oEvent.preventDefault();
		var sDomElementId = _getTargetId(oEvent.target);

		ContextMenu.show({
			domElementId: sDomElementId,
			location: {
				x: oEvent.pageX,
				y: oEvent.pageY
			}
		});
	};

	RecordListener.prototype._onContextHighlight = function (mData) {
		CommandExecutor.execute(Commands.HIGHLIGHT, mData);
	};

	RecordListener.prototype._onContextPress = function (mData) {
		CommandExecutor.execute(Commands.PRESS, mData);
	};

	RecordListener.prototype._onContextEnterText = function (mData) {
		CommandExecutor.execute(Commands.ENTER_TEXT, mData);
	};

	function _getTargetId(oDomElement) {
		// not all elements have an ID -> get the ID of the first parent that has one
		if (oDomElement.id) {
			return oDomElement.id;
		} else if (oDomElement.parentElement) {
			return _getTargetId(oDomElement.parentElement);
		} else {
			return "";
		}
	}

	oRecordListener = new RecordListener();

	return oRecordListener;

}, true);
