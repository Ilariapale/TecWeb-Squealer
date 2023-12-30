import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  constructor() {}

  public getRelativeTime(input_date: Date | undefined): string {
    const now = new Date();
    const date = new Date(input_date || 0);
    let n = now.getTime();
    let d = new Date(date).getTime();
    const diff = now.getTime() - date.getTime();
    const minutesAgo = Math.floor(diff / (1000 * 60));

    if (this.isToday(date, now)) {
      if (minutesAgo < 1) return 'Now';
      else if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
      else return this.formatTime(date);
    } else if (this.isYesterday(date, now)) {
      return `Yesterday at ${this.formatTime(date)}`;
    } else {
      return this.formatDate(date);
    }
  }

  private isYesterday(date: Date, now: Date): boolean {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  private isToday(date: Date, now: Date): boolean {
    return (
      date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  }

  private formatTime(date: Date): string {
    // Customize time format according to your needs
    return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
  }

  private formatDate(date: Date): string {
    // Customize date format according to your needs
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
  }
}
