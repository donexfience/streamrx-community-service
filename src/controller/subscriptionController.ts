import { Request, RequestHandler, Response } from "express";
import { ChannelSubscriptionService } from "../services/channelSubscriptionService";

export class SubscriptionController {
  constructor(private subscriptionService: ChannelSubscriptionService) {}
  getSubscribedChannels: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.params.userId;
      const subscribedChannels =
        await this.subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscribedChannels,
        message: "Successfully retrieved subscribed channels",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve subscribed channels",
      });
    }
  };
}
