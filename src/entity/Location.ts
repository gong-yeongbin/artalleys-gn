import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Post } from "../entity/Entity";

@Entity("location")
export default class Location {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "longitude", type: "integer" })
  longitude: number;

  @Column({ name: "latitude", type: "integer" })
  latitude: number;
}

// @OneToOne(() => Post, (post) => post.location)
//   @JoinColumn({ name: "post" })
//   post: Post;
