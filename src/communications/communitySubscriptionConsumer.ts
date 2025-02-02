import { QUEUES, RabbitMQConnection, RabbitMQConsumer } from "streamrx_common";
import amqplib from "amqplib";
import { UserService } from "../services/userService";
import { ChannelService } from "../services/channelService";
import { ChannelSubscriptionService } from "../services/channelSubscriptionService";

export class CommunityServiceConsumer {
  private rabbitMQConsumer: RabbitMQConsumer;
  private userService: UserService;
  private channelService: ChannelService;
  private channelSubscriptionService: ChannelSubscriptionService;
  private rabbitMQConnection: RabbitMQConnection;

  constructor(
    userService: UserService,
    channelService: ChannelService,
    channelSubscriptionService: ChannelSubscriptionService
  ) {
    this.userService = userService;
    this.channelService = channelService;
    this.channelSubscriptionService = channelSubscriptionService;

    this.rabbitMQConnection = RabbitMQConnection.getInstance();
    this.rabbitMQConsumer = new RabbitMQConsumer(this.rabbitMQConnection);
  }

  public async start() {
    try {
      await this.rabbitMQConnection.connect(
        process.env.amqp_port || "amqp://localhost"
      );
      await this.rabbitMQConsumer.consumeFromExchange(
        "user-updated",
        this.handleUserUpdatedMessage.bind(this)
      );
      await this.rabbitMQConsumer.consumeFromExchange(
        "user-created",
        this.handleUserCreatedMessage.bind(this)
      );

      await this.rabbitMQConsumer.consumeFromExchange(
        "channel-created",
        this.handleChannelCreatedMessage.bind(this)
      );

      await this.rabbitMQConsumer.consumeFromExchange(
        "subscription-created",
        this.handleSubscriptionCreatedMessage.bind(this)
      );

      await this.rabbitMQConsumer.consumeFromExchange(
        "subscription-deleted",
        this.handleSubscriptionDeletedMessage.bind(this)
      );
      // queue based consuming
      //   await this.rabbitMQConsumer.consume(
      //     QUEUES.USER_CREATED,
      //     this.handleUserCreatedMessage.bind(this)
      //   );

      console.log(
        "[INFO] Started consuming messages from RabbitMQ queues and exchanges."
      );
    } catch (error) {
      console.error("[ERROR] Failed to start consuming:", error);
      throw error;
    }
  }

  private async handleUserCreatedMessage(msg: amqplib.ConsumeMessage | null) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Created message:", message);
      await this.userService.createUser(message);
    } catch (error) {
      console.error("[ERROR] Failed to handle user created message:", error);
      throw error;
    }
  }

  private async handleUserUpdatedMessage(msg: amqplib.ConsumeMessage | null) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Updated message:", message);
      await this.userService.updateUserById(message.id, message);
    } catch (error) {
      console.error("[ERROR] Failed to handle user updated message:", error);
      throw error;
    }
  }
  private async handleChannelCreatedMessage(
    msg: amqplib.ConsumeMessage | null
  ) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Updated message:", message);
      await this.channelService.createChannel(message);
    } catch (error) {
      console.error("[ERROR] Failed to handle user updated message:", error);
      throw error;
    }
  }
  private async handleSubscriptionCreatedMessage(
    msg: amqplib.ConsumeMessage | null
  ) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Updated message:", message);
      await this.channelSubscriptionService.subscribe(
        message.userId,
        message.channelId
      );
    } catch (error) {
      console.error("[ERROR] Failed to handle user updated message:", error);
      throw error;
    }
  }
  private async handleSubscriptionDeletedMessage(
    msg: amqplib.ConsumeMessage | null
  ) {
    if (!msg) return;

    try {
      const message = JSON.parse(msg.content.toString());
      console.log("[INFO] User Updated message:", message);
      await this.channelSubscriptionService.unsubscribe(
        message.userId,
        message.channelId
      );
    } catch (error) {
      console.error("[ERROR] Failed to handle user updated message:", error);
      throw error;
    }
  }
}
