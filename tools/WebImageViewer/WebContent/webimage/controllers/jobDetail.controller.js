sap.ui.controller('webimage.controllers.jobDetail', {
	onInit : function() {
	},

	onBeforeRendering : function() {
		var ctt = this.getView().data('context');
		if(ctt) {
			this.getView().setBindingContext(ctt);
			var ct = this.byId('category');
			utils.storage.loadFailCtrls(ctt, function() {
				//bug table show no data when binding context changed
				setTimeout(function() {
					ct.rerender();
				}, 200);

			});


			this._links = this.getView().data('brdPath');
			this.byId('brd_thd').setItems(this._links);
		}
	},

	displayFailImages : function(oEvent) {
		var bus = sap.ui.getCore().getEventBus();
		var ctt = oEvent.getSource().getBindingContext();
		var brdpath = this._links.slice();
		brdpath.push({
			text : ctt.getUpperObject(4).categoryName,
			key : 'jobDetail'
		});
		brdpath.push({
			text : ctt.getUpperObject(2).moduleName,
			key : 'jobDetail'
		});
		brdpath.push({
			text : ctt.getObject().controlName,
			key : 'compareImages'
		});
		bus.publish('nav', 'to', {
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
			name : evt.getParameter('key'),
		});
	},

	colHandle : function(evt) {
		var col = evt.getParameter('column');
		col.toggleSort();
	}

});
