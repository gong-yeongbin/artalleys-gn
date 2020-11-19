import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";

import { Post } from "../entity/Entity";

@Entity("image")
export default class Image {
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
