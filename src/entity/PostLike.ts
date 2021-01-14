import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { User, Post } from "./Entity";

@Entity("post_like")
export default class PostLike {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;

  @ManyToOne(() => Post, (post) => post.postLike)
  @JoinColumn({ name: "post" })
  post: Post;
}
