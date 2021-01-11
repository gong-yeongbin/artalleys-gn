import {
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  JoinColumn,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("post_category")
@Unique(["category"])
export default class PostCategory {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "category", type: "nvarchar" })
  category: string;

  @OneToMany(() => Post, (post) => post.id)
  @JoinColumn({ name: "post" })
  post: Post;
}
