/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Element'],
	function(Element) {
	"use strict";

		/**
		 * @class
		 * Facilitates webpage title modifying
		 * @extends sap.ui.core.Element
		 * @private
		 * @ui5-restricted sdk
		 */
		var WebPageTitleUtil = Element.extend("sap.ui.documentation.sdk.controls.WebPageTitleUtil", {
			metadata : {
				properties: {
					/**
					 * The title of the webpage
					 */
					title: {type: "string", defaultValue: ''}
				}
			}
		});

		WebPageTitleUtil.prototype.setTitle = function (sTitle) {
			if (sTitle) {
				document.title = sTitle;
				this.setProperty("title", sTitle, true);
			}

			return this;
		};

		return WebPageTitleUtil;
	});