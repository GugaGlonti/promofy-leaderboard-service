import { Injectable } from '@nestjs/common';
import { DateTimeLimit } from './enum/date-time-limit.enum';

@Injectable()
export class UTCUtils {
  static readonly MS_IN_A_DAY = 1000 * 60 * 60 * 24;
  static readonly DAYS_IN_A_WEEK = 7;

  static getStartOfDay(): Date {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }

  static getEndOfDay(): Date {
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    return end;
  }

  static getStartOfWeek(): Date {
    const start = this.getStartOfDay();
    const day = start.getUTCDay();
    const diff = (day + 6) % 7;
    start.setUTCDate(start.getUTCDate() - diff);
    return start;
  }

  static getEndOfWeek(): Date {
    const end = this.getStartOfWeek();
    end.setUTCDate(end.getUTCDate() + this.DAYS_IN_A_WEEK - 1);
    end.setUTCHours(23, 59, 59, 999);
    return end;
  }

  static getStartOfMonth(): Date {
    const start = this.getStartOfDay();
    start.setUTCDate(1);
    return start;
  }

  static getEndOfMonth(): Date {
    const end = this.getStartOfMonth();
    end.setUTCMonth(end.getUTCMonth() + 1);
    end.setUTCDate(0);
    end.setUTCHours(23, 59, 59, 999);
    return end;
  }

  static getMinDate(): Date {
    return new Date(0);
  }

  static getMaxDate(): Date {
    return new Date(8640000000000000);
  }

  static todayIsInRange(start: Date, end: Date): boolean {
    const today = new Date();
    return today >= start && today <= end;
  }

  static hasDateFilter(startDate?: string, endDate?: string): boolean {
    if (!startDate && !endDate) return false;

    return (
      startDate !== DateTimeLimit.MIN_DATE.toString() ||
      endDate !== DateTimeLimit.MAX_DATE.toString()
    );
  }
}
