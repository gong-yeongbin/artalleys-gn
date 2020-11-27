import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("post_normal")
export default class PostNormal {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "type" })
  type: string;

  @Column({ name: "category" })
  category: string;

  @Column({ name: "price", type: "integer", nullable: true, default: 0 })
  price: number;

  @Column({ name: "firmOnPrice", type: "boolean", default: true })
  firmOnPrice: boolean;

  @Column({
    name: "descriptions",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  descriptions: string;

  @Column({ name: "condition", type: "nvarchar" })
  condition: string;

  @Column({ name: "active", type: "nvarchar", default: "active" })
  active: string;

  @OneToOne(() => Post)
  @JoinColumn({ name: "post" })
  post: Post;
}
