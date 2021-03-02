import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
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

  @ManyToOne(() => User, (user) => user.sendId)
  @JoinColumn({ name: "sendId" })
  sendId: User;

  @ManyToOne(() => User, (user) => user.receiveId)
  @JoinColumn({ name: "receiveId" })
  receiveId: User;

  @ManyToOne(() => Post, (post) => post.chat)
  @JoinColumn({ name: "post" })
  post: Post;
}
