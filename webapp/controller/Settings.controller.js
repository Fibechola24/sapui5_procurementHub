sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Settings", {

        onInit: function () {
            // Get the settings model from the component
            var oSettingsModel = this.getOwnerComponent().getModel("settings");

            // Initialize dropdown data
            oSettingsModel.setProperty("/themes", [
                { key: "sap_horizon", text: "Morning Horizon" },
                { key: "sap_horizon_dark", text: "Evening Horizon" },
                { key: "sap_fiori_3", text: "Quartz Light" },
                { key: "sap_fiori_3_dark", text: "Quartz Dark" },
                { key: "sap_belize", text: "Belize" },
                { key: "sap_belize_hcb", text: "High Contrast Black" }
            ]);

            oSettingsModel.setProperty("/densities", [
                { key: "COZY", text: "Cozy" },
                { key: "COMPACT", text: "Compact" }
            ]);

            oSettingsModel.setProperty("/defaultViews", [
                { key: "dashboard", text: "Dashboard" },
                { key: "myPRs", text: "My Requests" },
                { key: "approvals", text: "Approvals" }
            ]);

            oSettingsModel.setProperty("/currencies", [
                { key: "USD", text: "US Dollar" },
                { key: "EUR", text: "Euro" },
                { key: "GBP", text: "British Pound" },
                { key: "JPY", text: "Japanese Yen" }
            ]);

            oSettingsModel.setProperty("/languages", [
                { key: "EN", text: "English" },
                { key: "DE", text: "German" },
                { key: "FR", text: "French" },
                { key: "ES", text: "Spanish" }
            ]);

            // Bind view to settings model
            this.getView().setModel(oSettingsModel, "settings");

            // Listen for theme changes in real-time
            oSettingsModel.attachPropertyChange(function (oEvent) {
                var sPath = oEvent.getParameter("path");
                var oContext = oEvent.getParameter("context");

                if (sPath === "/theme" && !oContext) {
                    // Theme changed - show immediate feedback
                    var sTheme = oSettingsModel.getProperty("/theme");
                    MessageToast.show("Theme changed to: " +
                        oSettingsModel.getProperty("/themes").find(t => t.key === sTheme)?.text);
                }

                // Auto-save when any setting changes
                if (!sPath.startsWith("/themes") &&
                    !sPath.startsWith("/densities") &&
                    !sPath.startsWith("/defaultViews") &&
                    !sPath.startsWith("/currencies") &&
                    !sPath.startsWith("/languages") &&
                    !oContext) {
                    this._autoSaveSettings();
                }
            }.bind(this));
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("home", {}, true);
            }
        },

        onSaveSettings: function () {
            MessageToast.show("Settings saved successfully");

            // Apply content density class if changed
            var sDensity = this.getView().getModel("settings").getProperty("/density");
            var oComponent = this.getOwnerComponent();

            // Remove existing density classes
            document.body.classList.remove("sapUiSizeCompact", "sapUiSizeCozy");
            // Add new density class
            if (sDensity === "COMPACT") {
                document.body.classList.add("sapUiSizeCompact");
            } else {
                document.body.classList.add("sapUiSizeCozy");
            }

            // Force refresh of UI if needed
            sap.ui.getCore().applyChanges();
        },

        onResetDefaults: function () {
            MessageBox.confirm("Are you sure you want to reset all settings to default values?", {
                title: "Reset Settings",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this.getOwnerComponent().resetSettings();
                        MessageToast.show("Settings reset to defaults");

                        // Refresh the view to show defaults
                        this.getView().getModel("settings").refresh(true);
                    }
                }.bind(this)
            });
        },

        onClearCache: function () {
            MessageBox.confirm("This will clear all locally cached data (except settings). Continue?", {
                title: "Clear Cache",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        try {
                            // Clear application cache
                            if (window.caches) {
                                caches.keys().then(function (cacheNames) {
                                    cacheNames.forEach(function (cacheName) {
                                        caches.delete(cacheName);
                                    });
                                });
                            }

                            // Clear localStorage except settings
                            var sSettings = localStorage.getItem("procurementHubSettings");
                            var aKeys = Object.keys(localStorage);
                            aKeys.forEach(function (sKey) {
                                if (sKey !== "procurementHubSettings") {
                                    localStorage.removeItem(sKey);
                                }
                            });

                            MessageToast.show("Cache cleared successfully");
                        } catch (oError) {
                            MessageBox.error("Failed to clear cache: " + oError.message);
                        }
                    }
                }.bind(this)
            });
        },

        onExportSettings: function () {
            var oModel = this.getView().getModel("settings");
            var oSettings = oModel.getData();

            // Remove arrays for dropdowns
            var exportData = Object.assign({}, oSettings);
            delete exportData.themes;
            delete exportData.densities;
            delete exportData.defaultViews;
            delete exportData.currencies;
            delete exportData.languages;

            var sDataStr = JSON.stringify(exportData, null, 2);
            var sDataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(sDataStr);

            var exportFileDefaultName = 'procurement-hub-settings.json';
            var linkElement = document.createElement('a');
            linkElement.setAttribute('href', sDataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            MessageToast.show("Settings exported successfully");
        },

        onImportSettings: function () {
            // Create file input element
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';

            fileInput.onchange = function (e) {
                var file = e.target.files[0];
                if (!file) return;

                var reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        var importedSettings = JSON.parse(e.target.result);
                        var currentModel = this.getView().getModel("settings");

                        // Merge imported settings with current model
                        var currentData = currentModel.getData();
                        var mergedData = Object.assign({}, currentData, importedSettings);

                        // Update model
                        currentModel.setData(mergedData);

                        // Apply theme immediately
                        if (importedSettings.theme) {
                            sap.ui.getCore().applyTheme(importedSettings.theme);
                        }

                        MessageToast.show("Settings imported successfully");
                    } catch (error) {
                        MessageBox.error("Invalid settings file format");
                    }
                }.bind(this);

                reader.readAsText(file);
            }.bind(this);

            fileInput.click();
        },

        onSubmitFeedback: function () {
            MessageBox.information("Feedback form would open here. In a real implementation, this would connect to a feedback service.");
        },

        onReleaseNotes: function () {
            MessageBox.information("Latest changes:\n\nVersion 1.0.0 (2023-12-01)\n- Initial release\n- Dashboard with KPIs\n- Purchase request creation\n- My requests list\n- Settings page");
        },

        onPrivacyPolicy: function () {
            MessageBox.information("Privacy policy would be displayed here.");
        },

        // Auto-save settings when they change
        _autoSaveSettings: function () {
            var oModel = this.getView().getModel("settings");
            var oSettings = oModel.getData();

            try {
                // Remove arrays before saving
                var saveData = Object.assign({}, oSettings);
                delete saveData.themes;
                delete saveData.densities;
                delete saveData.defaultViews;
                delete saveData.currencies;
                delete saveData.languages;

                localStorage.setItem("procurementHubSettings", JSON.stringify(saveData));
            } catch (error) {
                console.error("Auto-save failed:", error);
            }
        },

        // Theme selection change handler
        onThemeChange: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            this.getOwnerComponent().updateSetting("theme", sSelectedKey);
        },

        // Density selection change handler  
        onDensityChange: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            this.getOwnerComponent().updateSetting("density", sSelectedKey);

            // Apply density immediately
            document.body.classList.remove("sapUiSizeCompact", "sapUiSizeCozy");
            if (sSelectedKey === "COMPACT") {
                document.body.classList.add("sapUiSizeCompact");
            } else {
                document.body.classList.add("sapUiSizeCozy");
            }
            sap.ui.getCore().applyChanges();
        },

        onDocumentation: function () {
            sap.m.URLHelper.redirect("https://help.sap.com/docs/PROCUREMENT_HUB", true);
        },

        onReportIssue: function () {
            sap.m.MessageBox.information("Issue reporting would open a form. In production, connect to your issue tracking system.");
        },

        onExportAllData: function () {
            sap.m.MessageToast.show("This would export all application data for backup purposes.");
        },

        onChangePassword: function () {
            sap.m.MessageBox.information("Password change dialog would open here.");
        },

        onPrivacySettings: function () {
            sap.m.MessageBox.information("Detailed privacy settings would open here.");
        },

        onTermsOfService: function () {
            sap.m.MessageBox.information("Terms of Service document would be displayed.");
        },

        onCookiePolicy: function () {
            sap.m.MessageBox.information("Cookie Policy information would be displayed.");
        },

        onLicenseAgreement: function () {
            sap.m.MessageBox.information("License agreement would be displayed.");
        },

        onSystemDiagnostics: function () {
            // Collect system info
            var oBrowserInfo = {
                name: navigator.appName,
                version: navigator.appVersion,
                platform: navigator.platform,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                localStorage: navigator.cookieEnabled ? "Enabled" : "Disabled",
                cookiesEnabled: navigator.cookieEnabled
            };

            // Update model
            var oModel = this.getView().getModel("settings");
            oModel.setProperty("/browser", oBrowserInfo);

            sap.m.MessageBox.information(
                "System diagnostics collected:\n\n" +
                "Browser: " + oBrowserInfo.name + " " + oBrowserInfo.version + "\n" +
                "Platform: " + oBrowserInfo.platform + "\n" +
                "Screen: " + oBrowserInfo.screenWidth + "x" + oBrowserInfo.screenHeight + "\n" +
                "Local Storage: " + oBrowserInfo.localStorage + "\n" +
                "Cookies: " + oBrowserInfo.cookiesEnabled
            );
        },

        onDiscardChanges: function () {
            // Reload from localStorage
            var oModel = this.getView().getModel("settings");
            var savedSettings = JSON.parse(localStorage.getItem("procurementHubSettings") || "{}");
            oModel.setData(Object.assign(oModel.getData(), savedSettings));
            sap.m.MessageToast.show("Changes discarded, original settings restored.");
        }

    });
});