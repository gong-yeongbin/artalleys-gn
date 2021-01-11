import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("post_status")
@Unique(["status"])
export default class PostStatus {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "status", type: "nvarchar", default: 1 })
  status: string;

  @OneToMany(() => Post, (post) => post.id)
  @JoinColumn({ name: "post" })
  post: Post;
}
