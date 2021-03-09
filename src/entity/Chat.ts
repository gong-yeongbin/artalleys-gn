import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import ChatRoom from "./ChatRoom";
import { Post, User } from "./Entity";

@Entity("chat")
export default class Chat {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "message", type: "nvarchar" })
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "user" })
  user: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chat)
  @JoinColumn({ name: "chat_room" })
  chatRoom: ChatRoom;
}
