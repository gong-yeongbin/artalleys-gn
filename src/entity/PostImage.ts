import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
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

  @OneToOne(() => Post, { cascade: ["insert", "update", "remove"] })
  @JoinColumn({ name: "post" })
  post: Post;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
