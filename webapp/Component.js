sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "ui5/procurementhub/model/models"
], function(UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("ui5.procurementhub.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");
            this.getRouter().initialize();
        },

        getContentDensityClass: function() {
            if (!this._sContentDensityClass) {
                if (!Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }
    });
});