import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { BusinessPost } from "../entity/Entity";

@Entity("comment")
export default class Comment {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "message", type: "nvarchar" })
  message: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "deleted", type: "boolean", default: false })
  deleted: boolean;

  @Column({ name: "comment_id", type: "nvarchar" })
  commentId: string;

  @ManyToOne(() => Comment, { onDelete: "SET NULL" })
  @JoinColumn({ name: "reply_id" })
  reply: Comment[];

  @ManyToOne(() => BusinessPost, (businessPost) => businessPost.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business_post_id" })
  businessPostId: BusinessPost;
}
