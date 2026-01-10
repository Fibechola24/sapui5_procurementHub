sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function(JSONModel) {
    "use strict";

    var AnalyticsService = {
        
        // Get analytics data for a time period
        getAnalyticsData: function(timePeriod, dateFrom, dateTo) {
            // In real implementation, this would call OData service
            // For now, return mock data
            
            return {
                timePeriod: timePeriod,
                dateFrom: dateFrom,
                dateTo: dateTo,
                lastUpdated: new Date().toISOString(),
                
                kpis: {
                    totalSpend: this._calculateTotalSpend(timePeriod),
                    avgProcessingTime: this._calculateAvgProcessingTime(timePeriod),
                    approvalRate: this._calculateApprovalRate(timePeriod),
                    costSavings: this._calculateCostSavings(timePeriod)
                },
                
                charts: {
                    monthlySpend: this._getMonthlySpendData(timePeriod),
                    departmentSpend: this._getDepartmentSpendData(timePeriod),
                    prStatus: this._getPRStatusData(timePeriod),
                    topSuppliers: this._getTopSuppliersData(timePeriod)
                }
            };
        },
        
        _calculateTotalSpend: function(timePeriod) {
            // Mock calculation
            var baseAmount = 100000;
            var multiplier = this._getPeriodMultiplier(timePeriod);
            var spend = baseAmount * multiplier;
            
            return {
                value: this._formatCurrency(spend),
                unit: "USD",
                trend: "+" + (Math.random() * 10).toFixed(1) + "%",
                trendState: "Success"
            };
        },
        
        _calculateAvgProcessingTime: function(timePeriod) {
            // Mock calculation
            var baseTime = 3.5;
            var variance = Math.random() * 2 - 1; // -1 to 1
            
            return {
                value: (baseTime + variance).toFixed(1),
                unit: "days",
                trend: (variance < 0 ? "-" : "+") + Math.abs(variance).toFixed(1) + " days",
                trendState: variance < 0 ? "Success" : "Error"
            };
        },
        
        _calculateApprovalRate: function(timePeriod) {
            // Mock calculation
            var baseRate = 90;
            var variance = Math.random() * 5;
            
            return {
                value: (baseRate + variance).toFixed(1),
                unit: "%",
                trend: "+" + variance.toFixed(1) + "%",
                trendState: "Success"
            };
        },
        
        _calculateCostSavings: function(timePeriod) {
            // Mock calculation
            var baseSavings = 15000;
            var multiplier = this._getPeriodMultiplier(timePeriod);
            var savings = baseSavings * multiplier;
            
            return {
                value: this._formatCurrency(savings),
                unit: "USD",
                trend: "+" + (Math.random() * 15).toFixed(1) + "%",
                trendState: "Success"
            };
        },
        
        _getMonthlySpendData: function(timePeriod) {
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
            var data = [];
            
            months.forEach(month => {
                data.push({
                    month: month,
                    amount: Math.floor(Math.random() * 50000) + 20000
                });
            });
            
            return data;
        },
        
        _getDepartmentSpendData: function(timePeriod) {
            var departments = ["IT", "Marketing", "HR", "Finance", "Operations"];
            var data = [];
            
            departments.forEach(dept => {
                data.push({
                    department: dept,
                    amount: Math.floor(Math.random() * 40000) + 10000
                });
            });
            
            return data;
        },
        
        _getPRStatusData: function(timePeriod) {
            return [
                { status: "Approved", count: Math.floor(Math.random() * 100) + 100 },
                { status: "Pending", count: Math.floor(Math.random() * 30) + 10 },
                { status: "Rejected", count: Math.floor(Math.random() * 10) + 5 },
                { status: "Draft", count: Math.floor(Math.random() * 20) + 5 }
            ];
        },
        
        _getTopSuppliersData: function(timePeriod) {
            var suppliers = ["Tech Supplies Inc.", "Office Solutions Co.", "Global Electronics"];
            var data = [];
            
            suppliers.forEach(supplier => {
                data.push({
                    supplier: supplier,
                    amount: Math.floor(Math.random() * 50000) + 20000
                });
            });
            
            return data;
        },
        
        _getPeriodMultiplier: function(timePeriod) {
            var multipliers = {
                "LAST_7_DAYS": 0.25,
                "LAST_30_DAYS": 1,
                "THIS_MONTH": 1,
                "LAST_MONTH": 1,
                "THIS_QUARTER": 3,
                "LAST_QUARTER": 3,
                "THIS_YEAR": 12
            };
            
            return multipliers[timePeriod] || 1;
        },
        
        _formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace('$', '');
        }
    };

    return AnalyticsService;
});