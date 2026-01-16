sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "ui5/procurementhub/model/models",
    "ui5/procurementhub/model/SettingsModel",
    "ui5/procurementhub/service/PurchaseRequestService"
], function (UIComponent, Device, models, SettingsModel, PurchaseRequestService) {
    "use strict";

    return UIComponent.extend("ui5.procurementhub.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);

            // Set device model
            this.setModel(models.createDeviceModel(), "device");

            // Initialize and set settings model
            this._settingsModel = SettingsModel.init();
            this.setModel(this._settingsModel, "settings");

            // Initialize and set purchase requests model
            this._prModel = PurchaseRequestService.initModel();
            this.setModel(this._prModel, "purchaseRequests");

            // Set content density based on settings
            this._applyContentDensity();

            // Initialize router
            this.getRouter().initialize();
        },

        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                // Get density from settings model
                var sDensity = this.getModel("settings").getProperty("/density");

                if (sDensity === "COMPACT") {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else if (sDensity === "COZY") {
                    this._sContentDensityClass = "sapUiSizeCozy";
                } else {
                    // Fallback based on device
                    if (!Device.support.touch) {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
            }
            return this._sContentDensityClass;
        },

        _applyContentDensity: function () {
            // Apply density class to the root control
            document.body.classList.add(this.getContentDensityClass());
        },

        // Get settings model instance
        getSettingsModel: function () {
            return this._settingsModel;
        },

        // Update a setting
        updateSetting: function (key, value) {
            SettingsModel.updateSetting(this._settingsModel, key, value);
        },

        // Reset all settings
        resetSettings: function () {
            SettingsModel.resetToDefaults(this._settingsModel);
        },

        // Get purchase requests model
        getPurchaseRequestsModel: function () {
            return this._prModel;
        },

        // Add a new purchase request
        addPurchaseRequest: function (prData) {
            return PurchaseRequestService.addPurchaseRequest(this._prModel, prData);
        },

        // Update purchase request
        updatePurchaseRequest: function (prId, updatedData) {
            return PurchaseRequestService.updatePurchaseRequest(this._prModel, prId, updatedData);
        },

        // Delete purchase request
        deletePurchaseRequest: function (prId) {
            return PurchaseRequestService.deletePurchaseRequest(this._prModel, prId);
        },
        // Get purchase request service
        getPurchaseRequestService: function () {
            // Import service dynamically
            var PurchaseRequestService = sap.ui.require("ui5/procurementhub/service/PurchaseRequestService");
            if (PurchaseRequestService) {
                return PurchaseRequestService;
            }
            // Fallback: require directly
            sap.ui.define(["ui5/procurementhub/service/PurchaseRequestService"], function (PRService) {
                return PRService;
            });
            return sap.ui.require("ui5/procurementhub/service/PurchaseRequestService");
        },

        // Get purchase request
        getPurchaseRequest: function (prId) {
            return PurchaseRequestService.getPurchaseRequest(this._prModel, prId);
        }
    });
});