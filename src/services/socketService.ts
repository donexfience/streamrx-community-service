import { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { CommunityChatMessageService } from "./communityService";
import { ChannelSubscriptionService } from "./channelSubscriptionService";
import { CommunityChatMessageRepository } from "../repository/communityChatRepository";
import { ChannelSubscriptionRepository } from "../repository/channelSubscription";
import { ChannelRepostiory } from "../repository/channelRepository";
import Message, {
  MessageReply,
  Message as MessageType,
} from "../models/schemas/message";
import { UserService } from "./userService";
import { UserRepository } from "../repository/userRepository";

export class SocketService {
  private io: Server;
  private messageService: CommunityChatMessageService;
  private userService: UserService;
  private subscriptionService: ChannelSubscriptionService;
  private connectedUsers: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.messageService = new CommunityChatMessageService(
      new CommunityChatMessageRepository()
    );
    this.userService = new UserService(new UserRepository());
    this.subscriptionService = new ChannelSubscriptionService(
      new ChannelSubscriptionRepository(),
      new ChannelRepostiory()
    );
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
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

      socket.on("send-message", async (data: any) => {
        await this.handleNewMessage(socket, data);
      });

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

      socket.on("get-online-users", ({ channelId }) => {
        const onlineUsers = Array.from(
          this.connectedUsers.get(channelId) || []
        );
        socket.emit("user-joined", {
          userId: socket.id,
          onlineUsers: onlineUsers,
        });
      });
      socket.on(
        "reply-to-message",
        async (data: {
          messageId: string;
          userId: string;
          content: string;
          channelId: string;
          fileUrl?: string;
          messageType?: "text" | "image";
        }) => {
          await this.handleMessageReply(socket, data);
        }
      );

      socket.on("get-message-history", (data: { channelId: string }) => {
        this.handleGetMessagHistory(socket, data);
      });

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

      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });

      socket.on("typing-started", ({ channelId, userId, userName }) => {
        socket.to(channelId).emit("user-typing", { userId, userName });
      });

      socket.on("typing-stopped", ({ channelId, userId, userName }) => {
        socket.to(channelId).emit("user-stopped-typing", { userId, userName });
      });

      socket.on("delete-message", async ({ messageId, channelId }) => {
        await this.messageService.deleteMessage(messageId);

        this.io.to(channelId).emit("message-deleted", { messageId });
        socket.emit("message-deleted", { messageId });
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
          data.userId,
          data.channelId
        );

      if (!subscription?.status) {
        socket.emit("error", { message: "Not subscribed to this channel" });
        return;
      }

      socket.join(data.channelId);
      console.log(
        "Connected users after join:",
        Array.from(this.connectedUsers.get(data.channelId) || [])
      );

      if (!this.connectedUsers.has(data.channelId)) {
        this.connectedUsers.set(data.channelId, new Set());
      }
      this.connectedUsers.get(data.channelId)?.add(data.userId);

      this.io.to(data.channelId).emit("user-joined", {
        userId: data.userId,
        onlineUsers: Array.from(this.connectedUsers.get(data.channelId) || []),
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to join channel" });
    }
  }

  private async handleGetMessagHistory(
    socket: Socket,
    data: { channelId: string }
  ) {
    console.log(data.channelId, "channelId");
    const message = await this.messageService.getChannelMessages(
      data.channelId
    );
    socket.emit("message-history", message);
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

  private async handleNewMessage(
    socket: Socket,
    data: {
      channelId: string;
      senderId: string;
      content: string;
      messageType: "text" | "image" | "video" | "file";
      fileUrl?: string;
      replyTo?: {
        _id: string;
      };
    }
  ) {
    try {
      const messageData: any = {
        channelId: new Types.ObjectId(data.channelId),
        senderId: new Types.ObjectId(data.senderId),
        content: data.content,
        messageType: data.messageType,
        fileUrl: data.fileUrl,
      };
      if (data.replyTo) {
        messageData.replyTo = data.replyTo._id;
      }

      const message = await this.messageService.sendMessage(messageData);
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "username profileImageURL")
        .populate({
          path: "replyTo",
          populate: {
            path: "senderId",
            select: "username profileImageURL",
          },
        });
      this.io.to(data.channelId).emit("new-message", populatedMessage);
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleMessageEdit(
    socket: Socket,
    data: {
      messageId: string;
      content: string;
      channelId: string;
    }
  ) {
    try {
      const updatedMessage = await this.messageService.editMessage(
        new Types.ObjectId(data.messageId),
        data.content
      );

      if (updatedMessage) {
        this.io.to(data.channelId).emit("message-edited", updatedMessage);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to edit message" });
    }
  }

  private async handleDeleteMessage(
    socket: Socket,
    data: {
      messageId: string;
    }
  ) {
    try {
      const updatedMessage = await this.messageService.deleteMessage(
        new Types.ObjectId(data.messageId)
      );
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
      const updatedMessage = await this.messageService.handleReaction(
        new Types.ObjectId(data.messageId),
        new Types.ObjectId(data.userId),
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
      fileUrl?: string;
      messageType?: "text" | "image";
    }
  ) {
    try {
      const replyData = {
        userId: new Types.ObjectId(data.userId),
        content: data.content,
        fileUrl: data.fileUrl,
        messageType: data.messageType || ("text" as "text" | "image"),
      };

      const updatedMessage = await this.messageService.replyToMessage(
        new Types.ObjectId(data.messageId),
        replyData
      );

      if (updatedMessage) {
        this.io.to(data.channelId).emit("message-reply-added", updatedMessage);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to add reply" });
    }
  }

  private async handleTypingStarted(
    socket: Socket,
    data: { channelId: string; userId: string }
  ) {
    const user = await this.userService.getUserById(data.userId);
    console.log(user, "user got for typing");
    socket
      .to(data.channelId)
      .emit("user-typing", { userId: data.userId, userName: user?.username });
  }

  private async handleTypingStopped(
    socket: Socket,
    data: { channelId: string; userId: string }
  ) {
    const user = await this.userService.getUserById(data.userId);
    console.log(user, "user got for typing");
    socket.to(data.channelId).emit("user-stopped-typing", {
      userId: data.userId,
      userName: user?.username,
    });
  }

  private handleDisconnect(socket: Socket) {
    this.connectedUsers.forEach((users, channelId) => {
      users.forEach((userId) => {
        if (socket.rooms.has(channelId)) {
          this.handleLeaveChannel(socket, { channelId, userId });
        }
      });
    });
  }
}
