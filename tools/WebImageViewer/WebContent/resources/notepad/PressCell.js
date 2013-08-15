jQuery.sap.declare("notepad.PressCell");
sap.ui.commons.layout.HorizontalLayout.extend("notepad.PressCell", {// call the new Control type "HoverButton"
	// and let it inherit from sap.ui.commons.Button
	metadata : {
		properties : {
			"tip" : "string",
			"enable" : {
				type : "boolean",
				defaultValue : true,
			},
		},
		events : {
			"press" : {}  // this Button has also a "hover" event, in addition to "press" of the normal Button
		}
	},

	// the hover event handler:
	onclick : function(evt) {// is called when the Button is hovered - no event registration required
		this.firePress();
	},

	onAfterRendering : function() {
		this.$().attr('title', this.getProperty("tip"));
		if(this.getProperty("enable")) {
			this.$().css('cursor', 'pointer');
		}
		this.$().parent().css('margin', '5px 0px')
	},

	renderer : {}
});
