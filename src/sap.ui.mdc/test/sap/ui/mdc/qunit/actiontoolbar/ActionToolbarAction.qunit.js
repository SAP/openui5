/* global QUnit */
sap.ui.define([
	"sap/m/Button", "sap/ui/mdc/actiontoolbar/ActionToolbarAction", "sap/ui/mdc/enum/ActionToolbarActionAlignment", "sap/ui/mdc/ActionToolbar"
], function(Button, ActionToolbarAction, ActionToolbarActionAlignment, ActionToolbar) {
	"use strict";

	QUnit.module("sap.ui.mdc.ActionToolbarAction - General", {
		before: function(assert) {
			//
		},
		after: function() {
			//
		},
		beforeEach: function(assert) {
			this.oActionToolbarActionEnd = new ActionToolbarAction({
                action: new Button(),
                layoutInformation: {
                    aggregationName: "end",
                    alignment: ActionToolbarActionAlignment.End
                }
            });
            this.oActionToolbarActionBegin = new ActionToolbarAction({
                action: new Button(),
                layoutInformation: {
                    aggregationName: "end",
                    alignment: ActionToolbarActionAlignment.Begin
                }
            });
            this.oActionToolbar = new ActionToolbar({
                actions: [
                    this.oActionToolbarActionEnd,
                    this.oActionToolbarActionBegin
                ]
            });
		},
		afterEach: function() {
			if (this.oActionToolbar) {
				this.oActionToolbar.destroy();
			}
		}
	});

    QUnit.test("updateSeparators", function(assert) {
        // Begin

        assert.ok(this.oActionToolbarActionBegin.getAction().getVisible());
        assert.ok(!this.oActionToolbarActionBegin._oSeparatorBefore.getVisible());
        assert.ok(this.oActionToolbarActionBegin._oSeparatorAfter.getVisible());

        this.oActionToolbarActionBegin.getAction().setVisible(false);
        this.oActionToolbarActionBegin.updateSeparators();

        assert.ok(!this.oActionToolbarActionBegin.getAction().getVisible());
        assert.ok(!this.oActionToolbarActionBegin._oSeparatorBefore.getVisible());
        assert.ok(!this.oActionToolbarActionBegin._oSeparatorAfter.getVisible());

        // End

        assert.ok(this.oActionToolbarActionEnd.getAction().getVisible());
        assert.ok(this.oActionToolbarActionEnd._oSeparatorBefore.getVisible());
        assert.ok(!this.oActionToolbarActionEnd._oSeparatorAfter.getVisible());

        this.oActionToolbarActionEnd.getAction().setVisible(false);
        this.oActionToolbarActionEnd.updateSeparators();

        assert.ok(!this.oActionToolbarActionEnd.getAction().getVisible());
        assert.ok(!this.oActionToolbarActionEnd._oSeparatorBefore.getVisible());
        assert.ok(!this.oActionToolbarActionEnd._oSeparatorAfter.getVisible());
    });

});