sap.ui.define([
		'jquery.sap.global', 'sap/ui/core/FragmentControl'
	],
	function(jQuery, FragmentControl)
	{
		"use strict";
		var TextButton = FragmentControl.extend("fragments.TextButton",
		{
			metadata:
			{
				properties:
				{
					text:
					{
						type: "string",
						defaultValue: "Default Text",
						invalidate: true
					}
				}
			}
		});
		TextButton.prototype._handlePress = function(oEvent)
		{
			this.payload = oEvent.getParameter("payload");
		}

		return TextButton;
	}, /* bExport= */ true);
