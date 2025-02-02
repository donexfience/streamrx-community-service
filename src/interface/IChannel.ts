import { Document, Types } from "mongoose";

export interface IChannelBase {
  channelName: string;
  description?: string;
  ownerId: Types.ObjectId;
  category: string[];
  channelAccessibility: string;
  channelBannerImageUrl?: string;
  channelProfileImageUrl?: string;
  contentType?: string;
  integrations: {
    youtube: boolean;
    twitch: boolean;
    discord: boolean;
  };
  email?: string;
  ownerEmail: string;
  schedulePreference?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  streamSchedule: {
    days: string[];
    times: string[];
  };
}

export interface IChannelDocument extends IChannelBase, Document {}

export interface IChannel extends IChannelBase {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ChannelType = IChannel;