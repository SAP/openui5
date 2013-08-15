sap.ui.controller("webimage.controllers.ctrlResults", {

	onInit : function() {
	},

	onBeforeRendering : function() {
		var ctt = this.getView().data('context');
		if(ctt) {
			this.getView().setBindingContext(ctt);
			utils.storage.loadCtrlResults(ctt);

			this._links = this.getView().data('brdPath');
			this.byId('brd_thd').setItems(this._links);
		}
	},

	displayFailImages : function(oEvent) {
		var ctt = oEvent.getSource().getBindingContext();
		var obj = ctt.getObject();
		var brdpath = this._links.slice();
		brdpath.push({
			text : obj.platform + '_' + obj.browser + '_' + obj.theme + '_' + obj.rtl,
			key : 'compareImages'
		});
		sap.ui.getCore().getEventBus().publish('nav', 'to', {
			name : "compareImages",
			data : {
				brdPath : brdpath,
				context : ctt,
			}
		});
	},

	handlePressBack : function(evt) {
		var bus = sap.ui.getCore().getEventBus();
		bus.publish('nav', 'to', {
			name : evt.mParameters.key,
		});
	},

	formatRTL : function(s) {
		return s && s.indexOf ? s.slice(s.indexOf('_') + 1) : s;
	},

	formatEnable : function(fail) {
		return fail !== 0;
	}

});
