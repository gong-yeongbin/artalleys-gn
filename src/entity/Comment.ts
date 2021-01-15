import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { User, Business, BusinessPost } from "../entity/Entity";

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

  @ManyToOne(() => Comment, { onDelete: "SET NULL" })
  @JoinColumn({ name: "comment_id" })
  commentId: Comment[];

  @ManyToOne(() => Business, (business) => business.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business" })
  business: Business;

  @ManyToOne(() => BusinessPost, (businessPost) => businessPost.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business_post" })
  businessPost: BusinessPost;

  @ManyToOne(() => User, (user) => user.comment, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;
}
