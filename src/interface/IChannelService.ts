import { Channel } from "../models/schemas/channel";

export interface IChannelService {
  createChannel(channelData: Partial<Channel>): Promise<Channel>;
  editChannel(
    channelId: string,
    updateData: Partial<Channel>
  ): Promise<Channel>;
  deleteChannel(channelId: string): Promise<void>;
}
