import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Leaderboard } from '../common/entity/leaderboard.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisKey } from 'ioredis';

@Injectable()
export class LeaderboardCache implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardCache.name);
  private readonly KEY_PREFIX = 'leaderboard';
  private readonly MS_IN_A_DAY = 1000 * 60 * 60 * 24;
  private readonly DAYS_IN_A_WEEK = 7;

  private todayKey: string;
  private thisWeekKey: string;
  private allTimeKey = `${this.KEY_PREFIX}:all-time`;

  private todayExpire: number;
  private thisWeekExpire: number;

  private todayLeaderboard: Leaderboard;
  private thisWeekLeaderboard: Leaderboard;
  private allTimeLeaderboard: Leaderboard;

  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboard: Repository<Leaderboard>,
  ) {}

  async onModuleInit() {
    await this.resetToday();
    await this.resetThisWeekKey();
    await this.resetAllTimeKey();
  }

  getKey(id: string): RedisKey | undefined {
    if (id == this.todayLeaderboard.id) return this.todayKey;
    if (id == this.thisWeekLeaderboard.id) return this.thisWeekKey;
    if (id == this.allTimeLeaderboard.id) return this.allTimeKey;
  }

  getTodayLeaderboard(): Leaderboard {
    if (!this.todayLeaderboard)
      throw new Error("Today's leaderboard not initialized");
    return this.todayLeaderboard;
  }

  getThisWeekLeaderboard(): Leaderboard {
    if (!this.thisWeekLeaderboard)
      throw new Error("This week's leaderboard not initialized");
    return this.thisWeekLeaderboard;
  }

  getAllTimeLeaderboard(): Leaderboard {
    if (!this.allTimeLeaderboard)
      throw new Error('All-time leaderboard not initialized');
    return this.allTimeLeaderboard;
  }

  getTodayKey(): string {
    return this.todayKey;
  }

  getThisWeekKey(): string {
    return this.thisWeekKey;
  }

  getAllTime(): string {
    return this.allTimeKey;
  }

  getTodayExpire(): number {
    return this.todayExpire;
  }

  getThisWeekExpire(): number {
    return this.thisWeekExpire;
  }

  @Cron('0 0 * * *')
  async resetToday(): Promise<void> {
    this.logger.log("Resetting today's leaderboard");
    const { day, month, year } = this.getDateInfo(new Date());
    this.todayKey = `${this.KEY_PREFIX}:daily:${year}-${month}-${day}`;

    this.logger.log(
      `Trying to find today's leaderboard for ${year}-${month}-${day}`,
    );
    const todayLeaderboard = await this.leaderboard.findOneBy({
      type: 'daily',
      date: `${year}-${month}-${day}`,
    });
    if (todayLeaderboard) {
      this.logger.log(`Found today's leaderboard for ${year}-${month}-${day}`);
      this.todayLeaderboard = todayLeaderboard;
      return;
    }

    this.logger.log(
      `Today's leaderboard not found in cache.`,
      `Creating today's leaderboard for ${year}-${month}-${day}`,
    );
    this.todayLeaderboard = this.leaderboard.create({
      type: 'daily',
      date: `${year}-${month}-${day}`,
    });
    await this.leaderboard.save(this.todayLeaderboard);
  }

  @Cron('0 0 * * 1')
  async resetThisWeekKey(): Promise<void> {
    this.logger.log("Resetting this week's leaderboard");
    const { year, weekNumber } = this.getDateInfo(new Date());
    this.thisWeekKey = `${this.KEY_PREFIX}:weekly:${year}-W${weekNumber}`;

    this.logger.log(
      `Trying to find this week's leaderboard for ${year}-W${weekNumber}`,
    );
    const weekLeaderboard = await this.leaderboard.findOneBy({
      type: 'weekly',
      weekNumber,
      year,
    });
    if (weekLeaderboard) {
      this.logger.log(
        `Found this week's leaderboard for ${year}-W${weekNumber}`,
      );
      this.thisWeekLeaderboard = weekLeaderboard;
      return;
    }

    this.logger.log(
      `This week's leaderboard not found in cache.`,
      `Creating this week's leaderboard for ${year}-W${weekNumber}`,
    );
    this.thisWeekLeaderboard = this.leaderboard.create({
      type: 'weekly',
      weekNumber,
      year,
    });
    await this.leaderboard.save(this.thisWeekLeaderboard);
  }

  async resetAllTimeKey(): Promise<void> {
    this.logger.log('Resetting all-time leaderboard');
    this.logger.log('Trying to find all-time leaderboard');
    const allTimeLeaderboard = await this.leaderboard.findOneBy({
      type: 'all-time',
    });
    if (allTimeLeaderboard) {
      this.logger.log('Found all-time leaderboard');
      this.allTimeLeaderboard = allTimeLeaderboard;
      return;
    }

    this.logger.log(
      'All-time leaderboard not found in cache.',
      'Creating all-time leaderboard',
    );
    this.allTimeLeaderboard = this.leaderboard.create({
      type: 'all-time',
    });
    await this.leaderboard.save(this.allTimeLeaderboard);
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

  public getDateInfo(date: Date): {
    day: string;
    month: string;
    year: number;
    weekNumber: number;
    date: Date;
  } {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / this.MS_IN_A_DAY;
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / this.DAYS_IN_A_WEEK,
    );

    return { day, month, year, weekNumber, date };
  }
}
