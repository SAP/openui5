jQuery.sap.declare("notepad.OverlayImage");
sap.ui.ux3.OverlayContainer.extend("notepad.OverlayImage", {
	metadata : {
		properties : {
			"src" : "string",
		},
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
		if(this._image) {
			$('#' + this.getId() + '-content').removeClass('sapUiUx3OCContent');
			$('#' + this.getId() + '-content').addClass('modalOverLay');

			var olWidth = 1125;
			var olHeight = $('#' + this.getId() + '-content').height();
			var imageHeight = this._image.$().height();
			var imageWidth = this._image.$().width();

			this._image.$().css("max-width", olWidth + 'px');
			this._image.$().css("max-height", olHeight + 'px');
			if(imageHeight && imageHeight < olHeight) {
				$('#' + this.getId() + '-content').css('margin-top', (olHeight - imageHeight) / 2);
			}
		}
	},

	renderer : {}
});
