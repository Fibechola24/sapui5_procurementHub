sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Settings", {
        
        onInit: function() {
            // Initialize settings model
            var oModel = new JSONModel({
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
                sessionTimeout: 30,
                themes: [
                    {key: "sap_horizon", text: "Morning Horizon"},
                    {key: "sap_horizon_dark", text: "Evening Horizon"},
                    {key: "sap_fiori_3", text: "Quartz Light"},
                    {key: "sap_fiori_3_dark", text: "Quartz Dark"}
                ],
                densities: [
                    {key: "COZY", text: "Cozy"},
                    {key: "COMPACT", text: "Compact"}
                ],
                defaultViews: [
                    {key: "dashboard", text: "Dashboard"},
                    {key: "myPRs", text: "My Requests"},
                    {key: "approvals", text: "Approvals"}
                ],
                currencies: [
                    {key: "USD", text: "US Dollar"},
                    {key: "EUR", text: "Euro"},
                    {key: "GBP", text: "British Pound"},
                    {key: "JPY", text: "Japanese Yen"}
                ],
                languages: [
                    {key: "EN", text: "English"},
                    {key: "DE", text: "German"},
                    {key: "FR", text: "French"},
                    {key: "ES", text: "Spanish"}
                ]
            });
            
            this.getView().setModel(oModel);
            
            // Load saved settings from localStorage if available
            this._loadSavedSettings();
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("home", {}, true);
            }
        },

        onSaveSettings: function() {
            var oModel = this.getView().getModel();
            var oSettings = oModel.getData();
            
            // Save to localStorage
            try {
                localStorage.setItem("procurementHubSettings", JSON.stringify(oSettings));
                MessageToast.show("Settings saved successfully");
                
                // Apply theme change if needed
                if (oSettings.theme) {
                    sap.ui.getCore().applyTheme(oSettings.theme);
                }
                
            } catch (oError) {
                MessageBox.error("Failed to save settings: " + oError.message);
            }
        },

        onResetDefaults: function() {
            MessageBox.confirm("Are you sure you want to reset all settings to default values?", {
                title: "Reset Settings",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // Clear saved settings
                        localStorage.removeItem("procurementHubSettings");
                        
                        // Reload page to apply defaults
                        window.location.reload();
                    }
                }
            });
        },

        onClearCache: function() {
            MessageBox.confirm("This will clear all locally cached data. Continue?", {
                title: "Clear Cache",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        try {
                            // Clear application cache
                            if (window.caches) {
                                caches.keys().then(function(cacheNames) {
                                    cacheNames.forEach(function(cacheName) {
                                        caches.delete(cacheName);
                                    });
                                });
                            }
                            
                            // Clear localStorage except settings
                            var sSettings = localStorage.getItem("procurementHubSettings");
                            localStorage.clear();
                            if (sSettings) {
                                localStorage.setItem("procurementHubSettings", sSettings);
                            }
                            
                            MessageToast.show("Cache cleared successfully");
                        } catch (oError) {
                            MessageBox.error("Failed to clear cache: " + oError.message);
                        }
                    }
                }
            });
        },

        onExportSettings: function() {
            var oModel = this.getView().getModel();
            var oSettings = oModel.getData();
            var sDataStr = JSON.stringify(oSettings, null, 2);
            var sDataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(sDataStr);
            
            var exportFileDefaultName = 'procurement-hub-settings.json';
            var linkElement = document.createElement('a');
            linkElement.setAttribute('href', sDataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            MessageToast.show("Settings exported successfully");
        },

        onImportSettings: function() {
            MessageToast.show("Import functionality would open file dialog");
            // In real implementation, implement file import
        },

        onSubmitFeedback: function() {
            MessageBox.information("Feedback form would open here. In a real implementation, this would connect to a feedback service.");
        },

        onReleaseNotes: function() {
            MessageBox.information("Latest changes:\n\nVersion 1.0.0 (2023-12-01)\n- Initial release\n- Dashboard with KPIs\n- Purchase request creation\n- My requests list\n- Settings page");
        },

        onPrivacyPolicy: function() {
            MessageBox.information("Privacy policy would be displayed here.");
        },

        _loadSavedSettings: function() {
            try {
                var sSavedSettings = localStorage.getItem("procurementHubSettings");
                if (sSavedSettings) {
                    var oSavedSettings = JSON.parse(sSavedSettings);
                    var oModel = this.getView().getModel();
                    
                    // Merge saved settings with defaults
                    oModel.setData(Object.assign(oModel.getData(), oSavedSettings));
                    
                    // Apply saved theme
                    if (oSavedSettings.theme) {
                        sap.ui.getCore().applyTheme(oSavedSettings.theme);
                    }
                }
            } catch (oError) {
                console.error("Error loading saved settings:", oError);
            }
        }
    });
});