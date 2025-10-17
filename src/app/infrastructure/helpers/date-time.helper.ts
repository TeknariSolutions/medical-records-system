
// src/app/infrastructure/helpers/date-time.helper.ts
export class DateTimeHelper {
  static pad(n: number) {
    return String(n).padStart(2, '0');
  }

  // Ejemplo: 2025-09-20T23:59:00
  static getLocalDateTimeWithOffset(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = this.pad(now.getMonth() + 1);
    const day = this.pad(now.getDate());
    const hours = this.pad(now.getHours());
    const minutes = this.pad(now.getMinutes());
    const seconds = this.pad(now.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // Igual que el anterior, pero separado por claridad si lo necesitas
  static getLocalDateTimeWithoutOffset(): string {
    return this.getLocalDateTimeWithOffset();
  }
}
