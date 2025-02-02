import { ChannelType, IChannel, IChannelDocument } from "../interface/IChannel";
import { IChannelSubscriptionRepository } from "../interface/IChannelSubscription";
import ChannelSubscription, {
  ChannelSubscription as ChannelSubscriptionType,
} from "../models/schemas/subscription";
import { Types } from "mongoose";

export class ChannelSubscriptionRepository
  implements IChannelSubscriptionRepository
{
  async subscribe(
    userId: string,
    channelId: string
  ): Promise<ChannelSubscriptionType> {
    console.log("callling the subscribe for activation");
    return await ChannelSubscription.findOneAndUpdate(
      { userId, channelId },
      { status: "active" },
      { upsert: true, new: true }
    );
  }

  async getChannelSubscriptionBychannelUserId(
    channelId: string,
    userId: string
  ): Promise<ChannelSubscriptionType | null> {
    return await ChannelSubscription.findOne({
      channelId: new Types.ObjectId(channelId),
      userId: new Types.ObjectId(userId),
      status: "active",
    });
  }

  async unsubscribe(
    userId: string,
    channelId: string
  ): Promise<ChannelSubscriptionType> {
    console.log("callling the subscribe for deaactivation");

    const result = await ChannelSubscription.findOneAndUpdate(
      { userId, channelId },
      { status: "cancelled" },
      { new: true }
    );
    if (!result) {
      throw new Error("Subscription not found");
    }
    return result;
  }

  async getSubscriptionStatus(
    userId: string,
    channelId: string
  ): Promise<boolean> {
    try {
      const channelSubscription = await ChannelSubscription.findOne({
        userId,
        channelId,
      }).sort({ updatedAt: -1 });
      console.log({
        foundSubscription: !!channelSubscription,
        status: channelSubscription?.status,
        isActive: channelSubscription?.status === "active",
      });
      return channelSubscription?.status === "active" || false;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }


  async getSubscriberCount(channelId: string): Promise<number> {
    return await ChannelSubscription.countDocuments({
      channelId,
      status: "active",
    });
  }

  async getSubscriptions(userId: string): Promise<ChannelSubscriptionType[]> {
    return await ChannelSubscription.find({
      userId,
      status: "active",
    }).populate("channelId");
  }
}
