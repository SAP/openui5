sap.ui.controller("webimage.controllers.moduleDetail", {

	onInit : function() {
	},

	onBeforeRendering : function() {
		var ctt = this.getView().data('context');
		if(ctt) {
			this.getView().setBindingContext(ctt);
			tab = this.byId('tab_strip');
			utils.storage.loadModuleData(ctt, function() {
				setTimeout(function() {
					tab.rerender();
				});

			});


			this._links = this.getView().data('brdPath');
			this.byId('brd_thd').setItems(this._links);
		}
	},

	displayCtrlResults : function(oEvent) {
		var ctt = oEvent.getSource().getBindingContext();
		var bp = this._links.slice();
		bp.push({
			text : ctt.getUpperObject(2).moduleName,
			key : 'moduleDetail'
		});
		bp.push({
			text : ctt.getObject().controlName,
			key : 'ctrlResults'
		});
		sap.ui.getCore().getEventBus().publish('nav', 'to', {
			name : 'ctrlResults',
			data : {
				context : ctt,
				brdPath : bp
			},
		});
	},

	colHandle : function(evt) {
		var col = evt.getParameter('column');
		col.toggleSort();
	},

	handlePressBack : function(evt) {
		sap.ui.getCore().getEventBus().publish('nav', 'to', {
			name : evt.mParameters.key,
		});
	}
});
