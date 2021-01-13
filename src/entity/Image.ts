import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Business, Post } from "./Entity";

@Entity("image")
export default class Image {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  url: string;

  @ManyToOne(() => Post, (post) => post.image, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;

  @ManyToOne(() => Business, (business) => business.image, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "business" })
  business: Business;
}
