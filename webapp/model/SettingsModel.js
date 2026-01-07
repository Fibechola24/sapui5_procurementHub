sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Core"
], function(JSONModel, Core) {
    "use strict";

    var SettingsModel = {
        // Default settings
        _defaultSettings: {
            theme: "sap_horizon",
            density: "COZY",
            defaultView: "dashboard",
            itemsPerPage: 10,
            notifications: {
                email: true,
                push: false,
                approvalReminders: true,
                statusUpdates: true
            },
            defaultCurrency: "USD",
            defaultLanguage: "EN",
            autosaveInterval: 5,
            sessionTimeout: 30
        },

        // Initialize settings model
        init: function() {
            // Try to load saved settings from localStorage
            var savedSettings = this._loadFromStorage();
            
            // Merge saved settings with defaults
            var settings = Object.assign({}, this._defaultSettings, savedSettings);
            
            // Create the model
            var oModel = new JSONModel(settings);
            oModel.setDefaultBindingMode("TwoWay");
            
            // Apply theme immediately
            this._applyTheme(settings.theme);
            
            return oModel;
        },

        // Load settings from localStorage
        _loadFromStorage: function() {
            try {
                var savedData = localStorage.getItem("procurementHubSettings");
                if (savedData) {
                    return JSON.parse(savedData);
                }
            } catch (error) {
                console.error("Error loading settings from storage:", error);
            }
            return {};
        },

        // Save settings to localStorage
        saveToStorage: function(settings) {
            try {
                localStorage.setItem("procurementHubSettings", JSON.stringify(settings));
                return true;
            } catch (error) {
                console.error("Error saving settings:", error);
                return false;
            }
        },

        // Apply theme to UI5 Core
        _applyTheme: function(themeName) {
            if (themeName && Core.isInitialized()) {
                try {
                    Core.applyTheme(themeName);
                    return true;
                } catch (error) {
                    console.error("Error applying theme:", error);
                    return false;
                }
            }
            return false;
        },

        // Get current settings
        getSettings: function(model) {
            return model ? model.getData() : {};
        },

        // Update a specific setting
        updateSetting: function(model, key, value) {
            if (model) {
                model.setProperty("/" + key, value);
                
                // Special handling for theme changes
                if (key === "theme") {
                    this._applyTheme(value);
                }
                
                // Auto-save to localStorage
                this.saveToStorage(model.getData());
            }
        },

        // Reset to defaults
        resetToDefaults: function(model) {
            if (model) {
                model.setData(Object.assign({}, this._defaultSettings));
                this._applyTheme(this._defaultSettings.theme);
                this.saveToStorage(this._defaultSettings);
            }
        }
    };

    return SettingsModel;
});