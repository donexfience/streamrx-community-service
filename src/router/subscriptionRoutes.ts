import { Router } from "express";
import { ChannelSubscriptionService } from "../services/channelSubscriptionService";
import { SubscriptionController } from "../controller/subscriptionController";
import { ChannelSubscriptionRepository } from "../repository/channelSubscription";
import { ChannelRepostiory } from "../repository/channelRepository";

export class SubscriptionRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    const subscriptionRepository = new ChannelSubscriptionRepository();
    const channelRepository = new ChannelRepostiory();
    const subscriptionService = new ChannelSubscriptionService(
      subscriptionRepository,
      channelRepository
    );
    const subscriptionController = new SubscriptionController(
      subscriptionService
    );

    this.router.get(
      "/subscriptions/:userId",
      subscriptionController.getSubscribedChannels.bind(subscriptionController)
    );
  }
}
