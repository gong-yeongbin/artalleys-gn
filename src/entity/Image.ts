import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { Business, Post, User } from "./Entity";

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

  @OneToOne(() => User, (user) => user.image, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user" })
  user: User;
}
