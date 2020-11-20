import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("location")
export default class Location {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "longtitude", type: "integer" })
  longtitude: number;

  @Column({ name: "latitude", type: "integer" })
  latitude: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => Post, (post) => post.postLocation, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post" })
  post: Post;
}