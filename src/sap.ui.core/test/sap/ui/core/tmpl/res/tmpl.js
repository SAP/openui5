(function() {
	"use strict";

	jQuery(function() {

		// visualize the onAfterRendering of controls
		var fnOld = sap.ui.core.Element.prototype.applySettings;
		sap.ui.core.Element.prototype.applySettings = function() {
			fnOld.apply(this, arguments);
			this.addDelegate({
				onAfterRendering: function() {
					this.$().css({
						"outline": "0 dotted red"
					}).animate({
						"outlineWidth": "5px"
					}, 750).animate({
						"outlineWidth": "0"
					}, 750);
				}
			}, this);
		};

		// find all templates and create <pre> elements
		jQuery("div[data-type]").each(function(iIndex, oDiv) {
			var sTemplate = jQuery(oDiv).html();
			sTemplate = jQuery.sap.encodeHTML(sTemplate);
			var $pre = jQuery("<pre>").css("display", "none").html(sTemplate).insertAfter(oDiv);
			jQuery("<button>").css({
				"position": "absolute",
				"right": "15px"
			}).text("Show/Hide Code").insertBefore(oDiv).on("click", function() {
				$pre.toggle();
			});
		});

	});

}());
