import BaseService from './baseService.service';
import { TwitterApi } from 'twitter-api-v2';
import { logger } from '@utils/logger';

class XService extends BaseService {
  private lastTweet: Date | null = null;
  private client: TwitterApi | null = null;
  private isEnabled = false;

  constructor() {
    super();
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const apiKey = process.env.API_KEY;
      const apiSecret = process.env.API_SECRET;
      const accessToken = process.env.ACCESS_TOKEN;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

      if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
        logger.warn({
          message: 'Twitter API credentials not provided. X service disabled.',
          labels: { origin: 'XService' }
        });
        return;
      }

      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessTokenSecret,
      });
      
      this.isEnabled = true;
      logger.info({
        message: 'Twitter API client initialized successfully',
        labels: { origin: 'XService' }
      });
    } catch (error) {
      logger.error({
        message: `Failed to initialize Twitter API client: ${error.message}`,
        labels: { origin: 'XService' }
      });
    }
  }

  // Function to post to X
  public postToX = async (message: string): Promise<boolean> => {
    if (!this.isEnabled || !this.client) {
      logger.warn({
        message: 'X service is disabled. Cannot post message.',
        labels: { origin: 'XService' }
      });
      return false;
    }

    const now = new Date();

    // Check if the last tweet was within the last 2 hours
    if (this.lastTweet && now.getTime() - this.lastTweet.getTime() < 2 * 60 * 60 * 1000) {
      logger.info({
        message: 'Skipping post: Last tweet was within 2 hours.',
        labels: { origin: 'XService' }
      });
      return false;
    }

    try {
      const response = await this.client.v2.tweet(message);
      logger.info({
        message: `Post successful! Tweet ID: ${response.data.id}`,
        labels: { origin: 'XService' }
      });
      this.lastTweet = now;
      return true;
    } catch (error) {
      logger.error({
        message: `Error posting to X: ${error.message}`,
        labels: { origin: 'XService' }
      });
      throw error;
    }
  };
}

export default XService;
