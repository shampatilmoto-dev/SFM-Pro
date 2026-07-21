DashboardService.getSettings = function () {
    return SettingsManager.load();
};

DashboardService.saveSettings = function (settings) {
    return SettingsManager.save(settings);
};

DashboardService.resetSettings = function () {
    return SettingsManager.reset();
};