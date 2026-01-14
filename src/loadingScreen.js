/**
 * LoadingScreen - Manages the fullscreen loading overlay with progress bar
 *
 * Displays a professional loading screen with:
 * - Semi-transparent fullscreen overlay
 * - Gradient progress bar
 * - Large percentage display
 * - Step description text
 * - Smooth animations
 */
export class LoadingScreen {
  constructor() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'loading-container';

    // Create percentage text (large, centered)
    this.percentText = document.createElement('div');
    this.percentText.className = 'loading-percent';
    this.percentText.textContent = '0%';

    // Create progress bar container
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'loading-progress-bar';

    // Create progress bar fill (animated width)
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'loading-progress-fill';
    this.progressFill.style.width = '0%';

    // Create step text
    this.stepText = document.createElement('div');
    this.stepText.className = 'loading-step';
    this.stepText.textContent = 'Initializing...';

    // Build DOM structure
    this.progressBar.appendChild(this.progressFill);
    this.container.appendChild(this.percentText);
    this.container.appendChild(this.progressBar);
    this.container.appendChild(this.stepText);
    this.overlay.appendChild(this.container);

    // Show loading screen
    this.show();
  }

  /**
   * Update loading progress
   * @param {number} percent - Progress percentage (0-100)
   * @param {string} step - Current step description
   */
  update(percent, step) {
    // Clamp percent to 0-100 range
    const clampedPercent = Math.max(0, Math.min(100, percent));

    // Update progress bar width
    this.progressFill.style.width = `${clampedPercent}%`;

    // Update percentage text
    this.percentText.textContent = `${Math.round(clampedPercent)}%`;

    // Update step text if provided
    if (step) {
      this.stepText.textContent = step;
    }
  }

  /**
   * Show loading screen by adding to DOM
   */
  show() {
    document.body.appendChild(this.overlay);
  }

  /**
   * Hide loading screen with fade-out animation
   * Removes overlay from DOM after animation completes
   */
  hide() {
    // Start fade-out animation
    this.overlay.style.opacity = '0';

    // Remove from DOM after animation completes
    setTimeout(() => {
      if (this.overlay.parentNode) {
        document.body.removeChild(this.overlay);
      }
    }, 500); // Match CSS transition duration
  }
}