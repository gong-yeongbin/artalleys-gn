import {
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Post, Chat } from "./Entity";

export default class ChatRoom {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "room_id" })
  roomId: string;

  @Column({ name: "seller_id" })
  seller_id: string;

  @Column({ name: "buyer_id" })
  buyer_id: string;

  @ManyToOne(() => Post, (post) => post.chatRoom, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;

  @OneToMany(() => Chat, (chat) => chat.chatRoom, {
    cascade: ["insert", "update", "remove"],
    nullable: true,
  })
  chat: Chat[];
}
