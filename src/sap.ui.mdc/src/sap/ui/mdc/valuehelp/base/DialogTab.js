/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObjectObserver'
], function(
	Control,
	ManagedObjectObserver
) {
	"use strict";

	var DialogTab = Control.extend("sap.ui.mdc.valuehelp.base.DialogTab", /** @lends sap.ui.mdc.valuehelp.base.DialogTab.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				content: {
					type: "object"
				}
			},
			// aggregations: {
			// },
			events: {
				select: {
					parameters: {
						type: { type: "sap.ui.mdc.enum.SelectType" },
						conditions: { type: "object[]" }
					}
				},
				confirm: {},
				cancel: {}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				//oRm.openStart("div", oControl);
				//oRm.openEnd();
//				var oContent = oControl._displayContent;
				var oContent = oControl.getContent();
				if (oContent) {
					oRm.renderControl(oContent);
				}
				//oRm.close("div");
			}
		}
	});

	DialogTab.prototype.init = function() {

		Control.prototype.init.apply(this, arguments);

//		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));
//
//		this._oObserver.observe(this, {
//			properties: ["content"]
//		});

	};

	DialogTab.prototype.exit = function () {
		if (this._displayContent) {
			this._displayContent = null;
		}

//		this._oObserver.disconnect();
//		this._oObserver = undefined;

		return Control.prototype.exit.apply(this, arguments);
	};

//	function _observeChanges(oChanges) {
//
//		if (oChanges.name === "content") {
//			if (oChanges.current) {
//				Promise.resolve(oChanges.current.getContent()).then(function (oResolvedContent) {
//					if (this._displayContent !== oResolvedContent) {
//						this._displayContent = oResolvedContent;
//						//this.invalidate(this);
//					}
//				}.bind(this));
//			} else {
//				this._displayContent = undefined;
//				this.invalidate(this);
//			}
//		}
//
//	}

	return DialogTab;

});
