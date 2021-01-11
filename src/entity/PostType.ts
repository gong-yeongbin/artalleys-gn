import {
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  Unique,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("post_type")
@Unique(["type"])
export default class PostType {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "type", type: "nvarchar" })
  type: string;

  @OneToMany(() => Post, (post) => post.id)
  @JoinColumn({ name: "post" })
  post: Post;
}
