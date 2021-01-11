import {
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  JoinColumn,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("post_condition")
@Unique(["conditions"])
export default class PostCondition {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "conditions", type: "nvarchar" })
  conditions: string;

  @OneToMany(() => Post, (post) => post.id)
  @JoinColumn({ name: "post" })
  post: Post;
}
