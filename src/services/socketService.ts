// src/services/socketService.ts
import { Server, Socket } from "socket.io";
import { CommunityChatMessageService } from "./communityService";
import { ChannelSubscriptionService } from "./channelSubscriptionService";
import { CommunityChatMessageRepository } from "../repository/communityChatRepository";
import { ChannelSubscriptionRepository } from "../repository/channelSubscription";
import { ChannelRepostiory } from "../repository/channelRepository";

export class SocketService {
  private io: Server;
  private messageService: CommunityChatMessageService;
  private subscriptionService: ChannelSubscriptionService;
  private connectedUsers: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.messageService = new CommunityChatMessageService(
      new CommunityChatMessageRepository()
    );
    this.subscriptionService = new ChannelSubscriptionService(
      new ChannelSubscriptionRepository(),
      new ChannelRepostiory()
    );
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      // Join/Leave Channel handlers
      socket.on(
        "join-channel",
        async (data: { channelId: string; userId: string }) => {
          await this.handleJoinChannel(socket, data);
        }
      );

      socket.on(
        "leave-channel",
        (data: { channelId: string; userId: string }) => {
          this.handleLeaveChannel(socket, data);
        }
      );

      // Message handlers
      socket.on(
        "send-message",
        async (data: {
          channelId: string;
          senderId: string;
          content: string;
          messageType: string;
          fileUrl?: string;
          replyTo?: string;
        }) => {
          await this.handleNewMessage(socket, data);
        }
      );

      socket.on(
        "edit-message",
        async (data: {
          messageId: string;
          userId: string;
          content: string;
          channelId: string;
        }) => {
          await this.handleMessageEdit(socket, data);
        }
      );

      // Reaction handler
      socket.on(
        "react-to-message",
        async (data: {
          messageId: string;
          userId: string;
          emoji: string;
          channelId: string;
        }) => {
          await this.handleMessageReaction(socket, data);
        }
      );

      // Reply handler
      socket.on(
        "reply-to-message",
        async (data: {
          messageId: string;
          userId: string;
          content: string;
          channelId: string;
        }) => {
          await this.handleMessageReply(socket, data);
        }
      );

      // Typing indicator handlers
      socket.on(
        "typing-started",
        (data: { channelId: string; userId: string }) => {
          this.handleTypingStarted(socket, data);
        }
      );

      socket.on(
        "typing-stopped",
        (data: { channelId: string; userId: string }) => {
          this.handleTypingStopped(socket, data);
        }
      );

      // Disconnect handler
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async handleJoinChannel(
    socket: Socket,
    data: { channelId: string; userId: string }
  ) {
    try {
      const subscription =
        await this.subscriptionService.getSubscriptionBychannelUserIds(
          data.channelId,
          data.userId
        );

      if (!subscription?.status) {
        socket.emit("error", { message: "Not subscribed to this channel" });
        return;
      }

      // Join the socket room
      socket.join(data.channelId);

      // Add user to connected users for this channel
      if (!this.connectedUsers.has(data.channelId)) {
        this.connectedUsers.set(data.channelId, new Set());
      }
      this.connectedUsers.get(data.channelId)?.add(data.userId);

      // Get latest messages
      const messageData = await this.messageService.getChannelMessages(
        data.channelId,
        1,
        50
      );

      // Send initial data to the user
      socket.emit("message-history", messageData.messages);

      // Notify channel about new user
      this.io.to(data.channelId).emit("user-joined", {
        userId: data.userId,
        onlineUsers: Array.from(this.connectedUsers.get(data.channelId) || []),
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to join channel" });
    }
  }

  private handleLeaveChannel(
    socket: Socket,
    data: { channelId: string; userId: string }
  ) {
    socket.leave(data.channelId);
    this.connectedUsers.get(data.channelId)?.delete(data.userId);
    this.io.to(data.channelId).emit("user-left", {
      userId: data.userId,
      onlineUsers: Array.from(this.connectedUsers.get(data.channelId) || []),
    });
  }

  private async handleNewMessage(socket: Socket, data: any) {
    try {
      const message = await this.messageService.createMessage(data);
      this.io.to(data.channelId).emit("new-message", message);
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleMessageEdit(
    socket: Socket,
    data: {
      messageId: string;
      userId: string;
      content: string;
      channelId: string;
    }
  ) {
    try {
      const updatedMessage = await this.messageService.updateMessage(
        data.messageId,
        data.userId,
        data.content
      );

      if (updatedMessage) {
        this.io.to(data.channelId).emit("message-edited", updatedMessage);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to edit message" });
    }
  }

  private async handleMessageReaction(
    socket: Socket,
    data: {
      messageId: string;
      userId: string;
      emoji: string;
      channelId: string;
    }
  ) {
    try {
      const updatedMessage = await this.messageService.addReaction(
        data.messageId,
        data.userId,
        data.emoji
      );

      if (updatedMessage) {
        this.io
          .to(data.channelId)
          .emit("message-reaction-updated", updatedMessage);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to add reaction" });
    }
  }

  private async handleMessageReply(
    socket: Socket,
    data: {
      messageId: string;
      userId: string;
      content: string;
      channelId: string;
    }
  ) {
    try {
      const updatedMessage = await this.messageService.addReply(
        data.messageId,
        data.userId,
        data.content
      );

      if (updatedMessage) {
        this.io.to(data.channelId).emit("message-reply-added", updatedMessage);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to add reply" });
    }
  }

  private handleTypingStarted(
    socket: Socket,
    data: { channelId: string; userId: string }
  ) {
    socket.to(data.channelId).emit("user-typing", { userId: data.userId });
  }

  private handleTypingStopped(
    socket: Socket,
    data: { channelId: string; userId: string }
  ) {
    socket
      .to(data.channelId)
      .emit("user-stopped-typing", { userId: data.userId });
  }

  private handleDisconnect(socket: Socket) {
    // Clean up user from all channels they were in
    this.connectedUsers.forEach((users, channelId) => {
      users.forEach((userId) => {
        if (socket.rooms.has(channelId)) {
          this.handleLeaveChannel(socket, { channelId, userId });
        }
      });
    });
  }
}
