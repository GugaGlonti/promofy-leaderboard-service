import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LeaderboardKeys implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardKeys.name);
  private readonly KEY_PREFIX = 'leaderboard';
  private readonly MS_IN_A_DAY = 86400000;
  private readonly DAYS_IN_A_WEEK = 7;

  private todayKey: string;
  private thisWeekKey: string;

  private todayExpire: number;
  private thisWeekExpire: number;

  onModuleInit() {
    this.resetToday();
    this.resetThisWeekKey();
  }

  getTodayKey(): string {
    return this.todayKey;
  }

  getThisWeekKey(): string {
    return this.thisWeekKey;
  }

  getAllTime(): string {
    return `${this.KEY_PREFIX}:all-time`;
  }

  getTodayExpire(): number {
    return this.todayExpire;
  }

  getThisWeekExpire(): number {
    return this.thisWeekExpire;
  }

  @Cron('0 0 * * *')
  resetToday(): void {
    this.logger.debug("Resetting today's leaderboard");

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    this.todayKey = `${this.KEY_PREFIX}:daily:${year}-${month}-${day}`;
  }

  @Cron('0 0 * * 1')
  resetThisWeekKey(): void {
    this.logger.debug("Resetting this week's leaderboard");

    const today = new Date();
    const year = today.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);

    const pastDaysOfYear =
      (today.getTime() - firstDayOfYear.getTime()) / this.MS_IN_A_DAY;

    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / this.DAYS_IN_A_WEEK,
    )
      .toString()
      .padStart(2, '0');

    this.thisWeekKey = `${this.KEY_PREFIX}:weekly:${year}-W${weekNumber}`;
  }

  // reset ttl-s only every minute to avoid too many operations
  // add 5 minutes offset to ensure the keys expire after the day/week ends

  private readonly RESET_EXPIRE_OFFSET = 5 * 60;

  @Cron('0 * * * *')
  resetTodayExpire(): void {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + this.MS_IN_A_DAY);
    tomorrow.setHours(0, 0, 0, 0);

    Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    this.todayExpire =
      Math.floor((tomorrow.getTime() - now.getTime()) / 1000) +
      this.RESET_EXPIRE_OFFSET;
  }

  @Cron('0 * * * *')
  resetThisWeekExpire(): void {
    const now = new Date();
    const nextMonday = new Date(
      now.getTime() + (7 - now.getDay()) * this.MS_IN_A_DAY,
    );
    nextMonday.setHours(0, 0, 0, 0);

    this.thisWeekExpire =
      Math.floor((nextMonday.getTime() - now.getTime()) / 1000) +
      this.RESET_EXPIRE_OFFSET;
  }

  getStartOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  getStartOfThisWeek(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}
