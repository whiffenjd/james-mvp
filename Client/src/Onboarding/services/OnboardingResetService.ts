type ResetCallback = () => void;

class OnboardingResetService {
  private resetCallbacks: ResetCallback[] = [];

  registerResetCallback(callback: ResetCallback) {
    this.resetCallbacks.push(callback);
  }

  unregisterResetCallback(callback: ResetCallback) {
    this.resetCallbacks = this.resetCallbacks.filter((cb) => cb !== callback);
  }

  performReset() {
    this.resetCallbacks.forEach((callback) => callback());
  }
}

export const onboardingResetService = new OnboardingResetService();
