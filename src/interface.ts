import amqplib = require('amqplib');

export interface IChannel extends amqplib.Channel{};

export interface IConsumerService{
    SubscribeEvents: (message:string)=>any
}
