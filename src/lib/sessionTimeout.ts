/**
 * Session timeout management
 */

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes before timeout

export interface SessionTimeoutConfig {
  onWarning?: () => void;
  onTimeout?: () => void;
  timeoutDuration?: number;
  warningDuration?: number;
}

export class SessionTimeoutManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private config: Required<SessionTimeoutConfig>;

  constructor(config: SessionTimeoutConfig = {}) {
    this.config = {
      onWarning: config.onWarning || (() => {}),
      onTimeout: config.onTimeout || (() => {}),
      timeoutDuration: config.timeoutDuration || SESSION_TIMEOUT_MS,
      warningDuration: config.warningDuration || WARNING_BEFORE_TIMEOUT_MS,
    };
  }

  start() {
    this.resetTimer();
    this.setupActivityListeners();
  }

  stop() {
    this.clearTimers();
    this.removeActivityListeners();
  }

  resetTimer() {
    this.lastActivity = Date.now();
    this.clearTimers();

    // Set warning timer
    this.warningId = setTimeout(() => {
      this.config.onWarning();
    }, this.config.timeoutDuration - this.config.warningDuration);

    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      this.config.onTimeout();
    }, this.config.timeoutDuration);
  }

  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  private handleActivity = () => {
    this.resetTimer();
  };

  private setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity);
    });
  }

  private removeActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, this.config.timeoutDuration - elapsed);
  }
}
