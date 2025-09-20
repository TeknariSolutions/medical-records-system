// src/app/infrastructure/helpers/date-time.helper.ts
export class DateTimeHelper {
  static pad(n: number) { return String(n).padStart(2, '0'); }

  // Ejemplo: 2025-09-20T23:59:00
  static getLocalDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = this.pad(now.getMonth() + 1);
    const day = this.pad(now.getDate());
    const hours = this.pad(now.getHours());
    const minutes = this.pad(now.getMinutes());
    const seconds = this.pad(now.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // Ejemplo: 2025-09-20T23:59:00+01:00  (ISO con offset)
  static getLocalDateTimeWithOffset(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = this.pad(now.getMonth() + 1);
    const day = this.pad(now.getDate());
    const hours = this.pad(now.getHours());
    const minutes = this.pad(now.getMinutes());
    const seconds = this.pad(now.getSeconds());

    // offset en minutos (ej. -300 para UTC-5). Queremos signo inverso para +HH:MM
    const offsetMinutes = -now.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const offsetHours = this.pad(Math.floor(abs / 60));
    const offsetMins = this.pad(abs % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
  }
}
