import { join } from "path";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { PostLocation } from "../entity/PostLocation";

@Entity("post")
export class Post {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "type", type: "nvarchar" })
  type: string;

  @Column({ name: "title", type: "nvarchar", length: 30 })
  title: string;

  @Column({ name: "category", type: "nvarchar", length: 45 })
  category: string;

  @Column({ name: "price", type: "integer", nullable: true, default: 0 })
  price: number;

  @Column({
    name: "descriptions",
    type: "nvarchar",
    length: 300,
    nullable: true,
  })
  descriptions: string;

  @Column({ name: "condition", type: "nvarchar", length: 45 })
  condition: string;

  @Column({ name: "view", type: "integer", default: 0 })
  view: number;

  @Column({ name: "number", type: "integer", nullable: true })
  number: number;

  @OneToOne(() => PostLocation, { cascade: ["insert", "update", "remove"] })
  @JoinColumn({ name: "location" })
  location: PostLocation;
}
