// utils/themeResetService.ts
// Create a service to handle theme resets across contexts

class ThemeResetService {
  private resetCallbacks: (() => void)[] = [];

  // Register a callback to be called when theme needs to be reset
  registerResetCallback(callback: () => void) {
    this.resetCallbacks.push(callback);

    // Return unregister function
    return () => {
      this.resetCallbacks = this.resetCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Reset all registered themes
  resetAllThemes() {
    console.log("Resetting all theme states");
    this.resetCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error resetting theme:", error);
      }
    });
  }

  // Clear all localStorage theme data
  clearThemeStorage() {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);

      // Remove all theme-related keys
      keys.forEach((key) => {
        if (key.startsWith("theme_")) {
          localStorage.removeItem(key);
        }
      });

      console.log("Cleared all theme storage");
    } catch (error) {
      console.error("Error clearing theme storage:", error);
    }
  }

  // Complete reset - both state and storage
  performCompleteReset() {
    // this.clearThemeStorage();
    this.resetAllThemes();
  }
}

// Export singleton instance
export const themeResetService = new ThemeResetService();
