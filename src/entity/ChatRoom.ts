import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  PrimaryColumn,
} from "typeorm";
import { Post, Chat, User } from "./Entity";

@Entity("chat_room")
@Unique(["post", "user"])
export default class ChatRoom {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @ManyToOne(() => Post, (post) => post.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;

  @OneToMany(() => Chat, (chat) => chat.chatRoom, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "chat" })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;
}
