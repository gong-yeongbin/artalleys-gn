import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Post } from "../entity/Post";

@Entity("post_image")
export class PostImage {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar", nullable: false })
  url: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.postImage, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;
}
