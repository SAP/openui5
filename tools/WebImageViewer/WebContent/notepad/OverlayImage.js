jQuery.sap.declare("notepad.OverlayImage");
sap.ui.ux3.OverlayContainer.extend("notepad.OverlayImage", {
	metadata : {
		properties : {
			"src" : "string",
			"text" : "string"
		},
	},

	setText: function(text) {
		this.setProperty('text', text);
		this._text = new sap.ui.commons.TextView({
			text : text
		});
		this.insertContent(this._text, 0);
		this.attachClose(function() {
			if(this._text) {
				this._text.destroy();
			}
		}, this);
	},

	setSrc : function(src) {
		this.setProperty('src', src);
		this._image = new sap.ui.commons.Image({
			src : src,
		});
		this.addContent(this._image);
		this.attachClose(function() {
			if(this._image) {
				this._image.destroy();
			}
		}, this);

	},

	onfocusout : function(evt) {
		this.close();
	},

	onAfterRendering : function() {
		if(this._image && this._text) {
			
			$('#' + this.getId() + '-content').removeClass('sapUiUx3OCContent');
			$('#' + this.getId() + '-content').addClass('modalOverLay');
			
			var imageHeight = this._image.$().height();
			var imageWidth = this._image.$().width();			
			var textHeight = this._text.$().height();
			var olWidth = 1125;
			var olHeight = $('#' + this.getId() + '-content').height();	
			
			if(imageHeight && imageHeight < olHeight) {
				this._image.$().css({
					"position" : "relative",
					"top": (olHeight - textHeight - imageHeight) / 2 + "px"
				})
			}

			this._image.$().css("max-width", olWidth + 'px');
			this._image.$().css("max-height", '90%');

			this._text.$().css({
				"display": "block",
				"color": "#ffffff",
				"margin": "15px auto",
				"font-size": "20px",
				"text-align": "center"
			});
			
		}
	},

	renderer : {}
});
