/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/testrecorder/interaction/Commands",
	"sap/ui/testrecorder/interaction/Highlight",
	"sap/ui/testrecorder/interaction/Press",
	"sap/ui/testrecorder/interaction/EnterText",
	"sap/ui/testrecorder/interaction/Assert"
], function (Commands, Highlight, Press, EnterText, Assert) {
	"use strict";

	return {
		execute: function (sCommand, mData) {
			switch (sCommand) {
				case "HIGHLIGHT":
					Highlight.execute(mData.domElementId);
					break;
				case "PRESS":
					Press.execute(mData.domElementId);
					break;
				case "ENTER_TEXT":
					EnterText.execute(mData.domElementId);
					break;
				case "ASSERT":
					Assert.execute(mData);
					break;
				default:
					throw new Error("Command " + sCommand + " is not known! Known commands are: " + Object.keys(Commands));
			}
		}
	};
});
