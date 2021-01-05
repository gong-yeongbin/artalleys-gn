import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Post, ChatRoom } from "./Entity";

@Entity("chat")
export default class Chat {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "send_id" })
  sendId: string;

  @Column({ name: "receive_id", type: "nvarchar" })
  receiveId: string;

  @Column({ name: "message", type: "nvarchar" })
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chat, {
  //   onDelete: "CASCADE",
  // })
  // @JoinColumn({ name: "chat_room" })
  // chatRoom: ChatRoom;
}
