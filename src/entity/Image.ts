import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Post } from "./Entity";

@Entity("image")
export default class Image {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "url", type: "nvarchar" })
  url: string;

  @ManyToOne(() => Post, (post) => post.id, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;
}
