sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'],
	function(jQuery, FragmentControl, XML) {
	"use strict";
	var ButtonList = FragmentControl.extend("fragments.ButtonList", {
		metadata: {
			aggregations: {
				items: {
					type: "sap.ui.core.Item",
					multiple: true
				}
			},
			events: {
				press: {
					parameters: {
						index: {
							type: "integer"
						},
						key: {
							type: "string"
						}
					}
				}
			}
		}
	});

	ButtonList.prototype._handleButtonPress = function (oEvent) {
		var oButton = oEvent.oSource;
		var oHBox = this.getAggregation("_content");
		var iIndex = oHBox.indexOfItem(oButton);
		var aCustomData = oButton.getCustomData();
		var sKey = aCustomData[0].getValue();

		this.firePress({index: iIndex, key: sKey});
	};

	return ButtonList;
}, /* bExport= */true);
