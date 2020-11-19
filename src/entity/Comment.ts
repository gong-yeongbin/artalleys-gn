import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Post } from "../entity/Entity";

@Entity("comment")
export default class Comment {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @ManyToOne((_) => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @Column({ name: "comment_id", type: "nvarchar" })
  commentId: string;

  @ManyToOne((_) => Comment, { onDelete: "SET NULL" })
  @JoinColumn({ name: "reply_id" })
  reply: Comment[];

  @Column({ name: "message", type: "nvarchar" })
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "deleted", type: "boolean", default: false })
  deleted: boolean;
}
